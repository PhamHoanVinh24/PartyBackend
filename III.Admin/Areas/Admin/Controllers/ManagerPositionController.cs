using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using ESEIM;
using System.Globalization;
using III.Domain.Enums;
using ESEIM.Controllers;
using Newtonsoft.Json;
using ESEIM.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ManagerPositionController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ManagerPositionController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ManagerPositionController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ManagerPositionController> stringLocalizer, IStringLocalizer<SharedResources> sharedResource)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResource;

        }
        [Breadcrumb("ViewData.CrumbManagePosition", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbManagePosition"] = _sharedResources["COM_CRUMB_MANAGE_POSTION"];
            return View();
        }

        public class JTableModelCustomer : JTableModel
        {
            public string CustomerName { get; set; }
            public string Title { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedDate { get; set; }
            public string IsActive { get; set; }
        }
        public class VcManagerPositionListModel
        {
            public int Id { get; set; }
            public string CusName { get; set; }
            public string Address { get; set; }
            public string CreatedBy { get; set; }
            public string Title { get; set; }
            public string CreatedByName { get; set; }
            public string CreatedTime { get; set; }
            public DateTime? CreatedTime1 { get; set; }
            public bool IsActive { get; set; }
            public bool IsDefault { get; set; }
            public string MakerGPS { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustomer jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var isCheck = false;
            if (!string.IsNullOrEmpty(jTablePara.IsActive))
            {
                isCheck = bool.Parse(jTablePara.IsActive);
            }
            DateTime? createdDate = !string.IsNullOrEmpty(jTablePara.CreatedDate) ? DateTime.ParseExact(jTablePara.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //listCommon có thể lấy theo role hoặc customer_type, nhưng lúc tạo cho Vicem thì tạo là role, để không ảnh hưởng đến customer_type của swork
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet, x.Group });
            IQueryable<VcManagerPositionListModel> query = null;

            if (session.UserType == 10)
            {
                query = from a in _context.Customerss.Where(x => !x.IsDeleted)
                        join b in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals b.ObjCode
                        join c1 in _context.Users on b.CreatedBy equals c1.UserName into c2
                        from c in c2.DefaultIfEmpty()
                        where
                        (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusCode == jTablePara.CustomerName)
                        && (string.IsNullOrEmpty(jTablePara.Title) || b.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.CreatedBy) || b.CreatedBy == jTablePara.CreatedBy)
                        && (string.IsNullOrEmpty(jTablePara.CreatedDate) || b.CreatedTime.Date == createdDate.Value.Date)
                         && (string.IsNullOrEmpty(jTablePara.IsActive) || b.IsActive == isCheck)
                        && b.IsDeleted == false
                        select new VcManagerPositionListModel
                        {
                            Id = b.Id,
                            CusName = a.CusName,
                            Address = a.Address,
                            CreatedBy = c != null ? c.GivenName : "",
                            Title = b.Title,
                            CreatedByName = (c != null ? c.GivenName : ""),
                            CreatedTime = b.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                            CreatedTime1 = b.CreatedTime,
                            IsActive = b.IsActive,
                            IsDefault = b.IsDefault,
                            MakerGPS = b.MakerGPS,
                        };
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = GetListAreaFunc(session).Select(x => x.Code).ToList();
                    query = from a in _context.Customerss.Where(x => !x.IsDeleted && listArea.Any(y => y == x.Area))
                            join b in _context.MapDataGpss.Where(x => !x.IsDeleted) on a.CusCode equals b.ObjCode
                            join c1 in _context.Users on b.CreatedBy equals c1.UserName into c2
                            from c in c2.DefaultIfEmpty()
                            where
                            (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusCode == jTablePara.CustomerName)
                            && (string.IsNullOrEmpty(jTablePara.Title) || b.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CreatedBy) || b.CreatedBy == jTablePara.CreatedBy)
                            && (string.IsNullOrEmpty(jTablePara.CreatedDate) || b.CreatedTime.Date == createdDate.Value.Date)
                             && (string.IsNullOrEmpty(jTablePara.IsActive) || b.IsActive == isCheck)
                            && b.IsDeleted == false
                            select new VcManagerPositionListModel
                            {
                                Id = b.Id,
                                CusName = a.CusName,
                                Address = a.Address,
                                CreatedBy = c != null ? c.GivenName : "",
                                Title = b.Title,
                                CreatedByName = (c != null ? c.GivenName : ""),
                                CreatedTime = b.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                CreatedTime1 = b.CreatedTime,
                                IsActive = b.IsActive,
                                IsDefault = b.IsDefault,
                                MakerGPS = b.MakerGPS,
                            };
                }
                else if (session.TypeStaff == 0)
                {
                    query = from a in _context.Customerss.Where(x => !x.IsDeleted)
                            join b in _context.MapDataGpss.Where(x => x.CreatedBy == session.UserName && !x.IsDeleted) on a.CusCode equals b.ObjCode
                            join c1 in _context.Users on b.CreatedBy equals c1.UserName into c2
                            from c in c2.DefaultIfEmpty()
                            where
                            (string.IsNullOrEmpty(jTablePara.CustomerName) || a.CusCode == jTablePara.CustomerName)
                            && (string.IsNullOrEmpty(jTablePara.Title) || b.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.CreatedBy) || b.CreatedBy == jTablePara.CreatedBy)
                            && (string.IsNullOrEmpty(jTablePara.CreatedDate) || b.CreatedTime.Date == createdDate.Value.Date)
                             && (string.IsNullOrEmpty(jTablePara.IsActive) || b.IsActive == isCheck)
                            && b.IsDeleted == false
                            select new VcManagerPositionListModel
                            {
                                Id = b.Id,
                                CusName = a.CusName,
                                Address = a.Address,
                                CreatedBy = c != null ? c.GivenName : "",
                                Title = b.Title,
                                CreatedByName = (c != null ? c.GivenName : ""),
                                CreatedTime = b.CreatedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                CreatedTime1 = b.CreatedTime,
                                IsActive = b.IsActive,
                                IsDefault = b.IsDefault,
                                MakerGPS = b.MakerGPS,
                            };
                }
            }
            if (query != null)
            {
                var count = query.Count();
                var data1 = query.OrderByDescending(x => x.CreatedTime1).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "CusName", "Address", "CreatedBy", "Title", "CreatedByName", "CreatedTime", "CreatedTime1", "IsActive", "IsDefault", "MakerGPS");
                return Json(jdata);
            }
            else
            {
                var list = new List<object>();
                var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, 0, "Id", "CusName", "Address", "CreatedBy", "Title", "CreatedByName", "CreatedTime", "CreatedTime1", "IsActive", "IsDefault", "MakerGPS");
                return Json(jdata);
            }
        }

        [HttpPost]
        public JsonResult GetAllStaff()
        {
            var msg = new JMessage() { Error = false };
            var data = from a in _context.Users
                       select new
                       {
                           Code = a.UserName,
                           Name = a.GivenName,
                       };
            msg.Object = data;

            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return Json(rs);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.MapDataGpss.FirstOrDefault(
                        x => x.Id == id
                    );
                data.IsDeleted = true;
                _context.MapDataGpss.Update(data);

                //chọn điểm bất kỳ cho default nếu chưa có
                var chk = _context.MapDataGpss.FirstOrDefault(x => !x.IsDeleted && x.IsDefault && x.ObjCode == data.ObjCode);
                if (chk == null)
                {
                    var itemMapOld = _context.MapDataGpss.FirstOrDefault(x => !x.IsDeleted && !x.IsDefault && x.ObjCode == data.ObjCode);
                    if (itemMapOld != null)
                    {
                        itemMapOld.IsDefault = true;
                        _context.MapDataGpss.Update(itemMapOld);

                        //Update lại GPS, Address của customer
                        var cus = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == data.ObjCode);
                        cus.Address = itemMapOld.Address;
                        cus.GoogleMap = itemMapOld.MakerGPS;
                        _context.Customerss.Update(cus);
                    }
                    else
                    {
                        var isHasSettingRoute = _context.VcSettingRoutes.Any(x => !x.IsDeleted && x.Node == data.ObjCode);
                        if (isHasSettingRoute)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["MP_MSG_CANNOT_DEL_POSITION"];
                            return Json(msg);
                        }
                        else
                        {
                            //Update lại GPS, Address của customer
                            var cus = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == data.ObjCode);
                            cus.Address = null;
                            cus.GoogleMap = null;
                            cus.ActivityStatus = "CUSTOMER_DEACTIVE";
                            _context.Customerss.Update(cus);
                        }
                    }
                }
                else
                {
                    //Update lại GPS, Address của customer
                    var cus = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == data.ObjCode);
                    cus.Address = chk.Address;
                    cus.GoogleMap = chk.MakerGPS;
                    _context.Customerss.Update(cus);
                }

                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Approved(int id)
        {
            var msg = new JMessage();
            try
            {
                //update bản mới thành default
                var data = _context.MapDataGpss.Where(x => !x.IsDeleted).FirstOrDefault(
                        x => x.Id == id
                    );

                data.IsActive = true;
                data.IsDefault = true;
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.MapDataGpss.Update(data);

                //Bỏ tất cả default cũ
                var listOld = _context.MapDataGpss.Where(x => !x.IsDeleted && x.IsDefault).Where(x => x.Id != id && x.ObjCode == data.ObjCode).ToList();
                listOld.ForEach(x => x.IsDefault = false);
                _context.MapDataGpss.UpdateRange(listOld);

                //Update GPS, Address cho customer
                var cus = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == data.ObjCode);
                cus.GoogleMap = data.MakerGPS;
                cus.Address = data.Address;
                cus.ActivityStatus = "CUSTOMER_ACTIVE";
                _context.Customerss.Update(cus);

                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _stringLocalizer["MP_MSG_APPROVE_SUCCESS"];
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}
