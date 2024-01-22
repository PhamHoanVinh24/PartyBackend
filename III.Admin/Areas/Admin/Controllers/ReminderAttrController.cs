using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReminderAttrController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ReminderAttrController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ReminderAttrController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ReminderAttrController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbReminderAttr", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbReminderAttr"] = _sharedResources["COM_CRUMB_REMINDER_ATTR"];
            return View();
        }

        public class ReminderAtrrJtable : JTableModel
        {
            public string Title { get; set; }
            public string Note { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]ReminderAtrrJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ReminderAttrs
                        where (string.IsNullOrEmpty(jTablePara.Title) || (a.ReminderTitle.ToLower().Contains(jTablePara.Title.ToLower())))
                       && (string.IsNullOrEmpty(jTablePara.Note) || (a.Note.ToLower().Contains(jTablePara.Note.ToLower())))
                        select new
                        {
                            a.Id,
                            a.ReminderCode,
                            a.ReminderTitle,
                            a.Note,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "ReminderCode", "ReminderTitle", "Note", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var a = _context.ReminderAttrs.AsNoTracking().Single(m => m.Id == id);
            return Json(a);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]ReminderAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.ReminderCode = Guid.NewGuid().ToString() + DateTime.Now.ToString("ddMMyyyy");
                obj.CreatedBy = ESEIM.AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.ReminderAttrs.Add(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["RA_LBL_RA"].Value.ToLower());//Thêm danh mục nhắc nhở thành công
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["RA_LBL_RA"].Value.ToLower());// Có lỗi khi thêm dmnn
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]ReminderAttr obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.UpdatedTime = DateTime.Now.Date;
                obj.UpdatedBy = ESEIM.AppContext.UserName;
                _context.ReminderAttrs.Update(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["RA_LBL_RA"].Value.ToLower());//Sửa danh mục nhắc nhở thành công
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["RA_LBL_RA"].Value.ToLower());//Thêm danh mục nhắc nhở thành công
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ReminderAttrs.FirstOrDefault(x => x.Id == id);
                _context.ReminderAttrs.Remove(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["RA_LBL_RA"].Value.ToLower());//Xóa danh mục nhắc nhở thành công
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
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