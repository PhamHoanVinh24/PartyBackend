using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Google.Apis.Auth.OAuth2.Responses;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using static III.Admin.Controllers.ContractController;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class GatewayManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<TokenManagerController> _stringLocalizerTm;
        private readonly IStringLocalizer<WorkflowActivityController> _stringLocalizerWf;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly AppSettings _appSettings;

        public GatewayManagerController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<TokenManagerController> stringLocalizerTm, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<WorkflowActivityController> stringLocalizerWf,
            IOptions<AppSettings> appSettings)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizerTm = stringLocalizerTm;
            _stringLocalizerWf = stringLocalizerWf;
            _sharedResources = sharedResources;
            _appSettings = appSettings.Value;
        }
        [Breadcrumb("ViewData.CrumbGatewayManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(PaymentMenuController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbPaymentMenu"] = "Tích hợp thanh toán";
            ViewData["CrumbGatewayManager"] = /*_sharedResources["COM_CRUMB_TOKEN_MANAGER"]*/"Quản lý cổng thanh toán";
            return View();
        }
        #region JTable
        public class JTableModelGateWay : JTableModel
        {
            public string Email { get; set; }
            public string GatewayName { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody] JTableModelGateWay jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PaymentGateways.Where(x => !string.IsNullOrEmpty(x.ServiceType) /*&& x.ServiceType.Equals("ZOOM_ACCOUNT")*/)
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PAYMENT_TYPE")
                            on a.ServiceType equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Email) || a.Email.ToLower().Contains(jTablePara.Email.ToLower()))
                           && (string.IsNullOrEmpty(jTablePara.GatewayName) || a.GatewayName.ToLower().Contains(jTablePara.GatewayName.ToLower()))
                        select new
                        {
                            a.Id,
                            Email = a.Email,
                            ServiceType = b != null ? b.ValueSet : a.ServiceType,
                            GatewayCode = a.GatewayCode,
                            GatewayName = a.GatewayName,
                            a.Logo,
                            a.CreatedBy,
                            a.CreatedTime,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jObjectTable = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Email", "ServiceType", "GatewayCode", "GatewayName", "Logo", "CreatedBy", "CreatedTime");
            return Json(jObjectTable);
        }
        #region Insert Action
        [HttpPost]
        public JMessage InsertCustomToken([FromBody] PaymentGateway obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.PaymentGateways.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType)
                                                && x.ServiceType == obj.ServiceType && x.Email.Equals(obj.Email));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.PaymentGateways.Add(obj);
                    _context.SaveChanges();
                    msg.Title = /*_stringLocalizer["TOKEN_MANAGER_ADD_TOKEN_SUCCESS"]*/"Thêm cổng thanh toán thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = /*_stringLocalizer["TOKEN_MANAGER_TOKEN_EXIST"]*/"Cổng thanh toán đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        #endregion
        #region Update Action
        [HttpPost]
        public JMessage UpdateCustomToken([FromBody] PaymentGateway obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PaymentGateways.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType)
                                                                        && x.ServiceType == obj.ServiceType && x.Email.Equals(obj.Email));
                if (data != null)
                {
                    data.GatewayName = obj.GatewayName;
                    data.GatewayCode = obj.GatewayCode;
                    data.Logo = obj.Logo;
                    data.ConfigJson = obj.ConfigJson;

                    _context.PaymentGateways.Update(data);
                    _context.SaveChanges();
                    msg.Title = /*_stringLocalizer["TOKEN_MANAGER_UPDATE_TOKEN_SUCCESS"]*/"Cập nhật cổng thanh toán thành công"; ;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = /*_stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"]*/"Cổng thanh toán không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        #endregion
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PaymentGateways.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.PaymentGateways.Remove(data);
                    _context.SaveChanges();
                    msg.Title = /*_stringLocalizer["TOKEN_MANAGER_TOKEN_DELETE_SUCCESS"]*/"Xóa cổng thanh toán thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = /*_stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"]*/"Cổng thanh toán không tồn tại";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            var data = _context.PaymentGateways.FirstOrDefault(x => x.Id == Id);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = /*_stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"]*/"Cổng thanh toán không tồn tại";
            }
            return Json(msg);
        }
        #endregion
        [HttpPost]
        public JsonResult GetListService()
        {
            var msg = new JMessage();
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PAYMENT_TYPE")
                .Select(x => new
                {
                    Code = x.CodeSet,
                    Name = x.Title,
                });
            msg.Object = data;
            return Json(msg);
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizerTm.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerWf.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

}

