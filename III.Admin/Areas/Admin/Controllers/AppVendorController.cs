using System;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AppVendorController : BaseController
    {
        public class JTableAppVendorModel : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Address { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AppVendorController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public AppVendorController(EIMDBContext context, IUploadService upload, IStringLocalizer<AppVendorController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbAddonApp", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuSystemSettingController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbAddonApp"] = "Quản lý đối tác con";
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableAppVendorModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AppVendors
                        where (string.IsNullOrEmpty(jTablePara.Code) || a.VendorCode.ToLower().Contains(jTablePara.Code.ToLower()))
                           && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                           && (string.IsNullOrEmpty(jTablePara.Address) || a.Address.ToLower().Contains(jTablePara.Address.ToLower()))
                        select new
                        {
                            a.Id,
                            a.VendorCode,
                            a.Name,
                            a.Address,
                            a.Email,
                            a.Note,
                            a.Status
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "VendorCode", "Name", "Address", "Email", "Note", "Status");
            return Json(jdata);
        }

        [HttpPost]
        public object GetVendorStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AppVendors.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]AppVendor obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkExist = _context.AppVendors.FirstOrDefault(x => x.VendorCode.ToLower() == obj.VendorCode.ToLower());
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("AVD_CURD_LBL_CODE"));
                }
                else
                {
                    _context.AppVendors.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("AVD_MSG_PARTNER"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_FAIL_ADD"), CommonUtil.ResourceValue("AVD_MSG_PARTNER"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]AppVendor obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AppVendors.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.Name = obj.Name;
                    data.Email = obj.Email;
                    data.Status = obj.Status;
                    data.Address = obj.Address;
                    data.Note = obj.Note;
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("AVD_MSG_PARTNER"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("AVD_MSG_PARTNER_AVD"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AppVendors.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var checkExistInAddonServer = _context.AddonAppServers.FirstOrDefault(x => x.AppVendorCode == data.VendorCode);
                    if (checkExistInAddonServer != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("AVD_MSG_USER_EXIST"));
                    }
                    else
                    {
                        _context.AppVendors.Remove(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("AVD_MSG_PARTNER"));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("AVD_MSG_PARTNER_AVD"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
            }
            return Json(msg);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}