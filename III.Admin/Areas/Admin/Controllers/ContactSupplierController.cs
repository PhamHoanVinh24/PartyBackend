using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
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
    public class ContactSupplierController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ContactSupplierController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ContactSupplierController(EIMDBContext context, IUploadService upload, IStringLocalizer<ContactSupplierController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbContactSupp", AreaName = "Admin", FromAction = "Index", FromController = typeof(SupplierHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSuppHome"] = _sharedResources["COM_CRUMB_SUPP_HOME"];
            ViewData["CrumbContactSupp"] = _sharedResources["COM_CRUMB_CONTACT_MANAGE"];
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
                        && (string.IsNullOrEmpty(jTablePara.SuppCode) || a.SuppCode.ToLower().Equals(jTablePara.SuppCode.ToLower()))
                        && string.IsNullOrEmpty(a.CusCode)
                        && a.IsDeleted == false
                        select new
                        {
                            a.Id,
                            a.ContactName,
                            a.MobilePhone,
                            a.Email,
                            a.FilePath,
                            a.CreateTime,
                            a.Title,
                            SupName = _context.Suppliers.FirstOrDefault(x => x.SupCode == a.SuppCode) != null ? _context.Suppliers.FirstOrDefault(x => x.SupCode == a.SuppCode).SupName : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ContactName", "MobilePhone", "Email", "FilePath", "CreateTime", "Title", "SupName");
            return Json(jdata);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var data = _context.Contacts.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object GetSupplier()
        {
            var list = _context.Suppliers.Where(x => x.IsDeleted == false).Select(x => new { Code = x.SupCode, Name = x.SupName });
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
                //msg.Title = string.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("CS_CAPTION_CS").ToLower());//"Thêm liên hệ thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CS_CAPTION_CONTACT"].Value.ToLower());//"Thêm liên hệ thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = CommonUtil.ResourceValue("COM_MSG_ERR");//"Có lỗi xảy ra!";
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
                //msg.Title = string.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("CS_CAPTION_CS").ToLower());//"Cập nhật thành công";
                msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CS_CAPTION_CONTACT"].Value.ToLower());//"Cập nhật thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = CommonUtil.ResourceValue("COM_MSG_ERR");
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
                //msg.Title = string.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("CS_CAPTION_CS").ToLower());// "Xóa liên hệ thành công";
                msg.Title = string.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CS_CAPTION_CONTACT"].Value.ToLower());// "Xóa liên hệ thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = CommonUtil.ResourceValue("COM_MSG_ERR");
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
                //msg.Title = CommonUtil.ResourceValue("COM_MSG_FILE_FAIL");//"Có lỗi xảy ra khi upload file!";
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
}