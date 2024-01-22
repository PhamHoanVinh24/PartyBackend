using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ContactCustomerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ContactCustomerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ContactCustomerController(EIMDBContext context, IUploadService upload, IStringLocalizer<ContactCustomerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbContactCus", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbContactCus"] = _sharedResources["COM_CRUMB_CONTACT_MANAGE"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]ContactJtableModel jTablePara)
        {
            var dateFrom = !string.IsNullOrEmpty(jTablePara.DateFrom) ? DateTime.ParseExact(jTablePara.DateFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var dateTo = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Contacts
                        where (string.IsNullOrEmpty(jTablePara.Phone) || a.MobilePhone.ToLower().Contains(jTablePara.Phone.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Email) || a.Email.ToLower().Contains(jTablePara.Email.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Name) || a.ContactName.ToLower().Contains(jTablePara.Name.ToLower()))
                        && (dateFrom == null || (a.CreateTime.HasValue && a.CreateTime.Value.Date >= dateFrom))
                        && (dateTo == null || (a.CreateTime.HasValue && a.CreateTime.Value.Date <= dateTo))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.ToLower().Equals(jTablePara.CusCode.ToLower()))
                        && string.IsNullOrEmpty(a.SuppCode)
                        && a.IsDeleted == false
                        select new
                        {
                            a.Id,
                            a.ContactName,
                            a.MobilePhone,
                            a.Email,
                            a.Title,
                            a.FilePath,
                            a.CreateTime,
                            CusName = _context.Customerss.FirstOrDefault(x => x.CusCode == a.CusCode) != null ? _context.Customerss.FirstOrDefault(x => x.CusCode == a.CusCode).CusName : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ContactName", "MobilePhone", "Email", "FilePath", "Title", "CreateTime", "CusName");
            return Json(jdata);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object GetCustomer()
        {
            var list = _context.Customerss.Where(x => x.IsDeleted == false).Select(x => new { Code = x.CusCode, Name = x.CusName });
            return list;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]Contact obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.CreateTime = DateTime.Now;
                _context.Contacts.Add(obj);
                _context.SaveChanges();
                //msg.Title = "Thêm liên hệ thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CC_MSG_CONTACT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]Contact obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdateTime = DateTime.Now.Date;
                _context.Contacts.Update(obj);
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = "Cập nhật thành công";
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
                _context.Contacts.Remove(data);
                _context.SaveChanges();
                //msg.Title = "Xóa liên hệ thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CC_MSG_CONTACT"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi upload file!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
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
    public class ContactJtableModel : JTableModel
    {
        public string Name { get; set; }
        public string DateFrom { get; set; }
        public string DateTo { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Title { get; set; }
        public string SuppCode { get; set; }
        public string CusCode { get; set; }
    }
}