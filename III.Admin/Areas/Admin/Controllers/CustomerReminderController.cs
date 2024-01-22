using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Authorization;
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
    public class CustomerReminderController : BaseController
    {
        public class ReminderJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? CustomerId { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCj;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public CustomerReminderController(EIMDBContext context, IUploadService upload,
            IStringLocalizer<StaffRegistrationController> stringLocalizer,
            IStringLocalizer<CardJobController> stringLocalizerCj,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCj = stringLocalizerCj;
        }
        [Breadcrumb("ViewData.CrumbCusReminder", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbCusReminder"] = _sharedResources["Sự kiện khách hàng"];
            return View();
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAllEvent()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
            var session = HttpContext.GetSessionUser();
            var listData = new List<Object>();
            var today = DateTime.Now.Date;
            var events = (from a in _context.CustomerAppointments.Where(x => !x.IsDeleted)
                                join b in _context.Customerss.Where(x => !x.IsDeleted) on a.CustomerCode equals b.CusCode
                              //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                              //join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                              //from c in c1.DefaultIfEmpty()
                          where a.FromDate.HasValue && a.ToDate.HasValue
                          select new
                          {
                              a.Id,
                              a.Title,
                              b.CusCode,
                              b.CusName,
                              a.Note,
                              a.FromDate,
                              a.ToDate,
                              a.Location,
                              a.RepeatType,
                              //Color = a.FromDate.Value.Date >= today ? a.BackgroundColor : "#f1f1f1",
                              IsInFuture = a.FromDate.Value.Date >= today,
                              //Status = b.ValueSet,
                              //StatusCode = a.Status,
                              //MeetingId = c != null ? c.ZoomId : "",
                              //a.AccountZoom,
                              //a.JsonData,
                          }).OrderByDescending(x => x.ToDate);

            foreach (var item in events)
            {
                var className = item.IsInFuture ? "fc-event-event-custom" : "fc-black";
                var allowJoin = true;

                var obj = new
                {
                    item.Id,
                    item.Title,
                    ItemCode = item.CusCode,
                    ItemName = item.CusName,
                    item.FromDate.Value.Date,
                    sStartTime = item.FromDate.Value.ToString("HH:mm"),
                    sEndTime = item.ToDate.Value.ToString("HH:mm"),
                    item.Note,
                    item.FromDate,
                    item.ToDate,
                    item.Location,
                    item.RepeatType,
                    IsAllData = session.IsAllData || session.RoleCode.Equals("GIAMDOC"),
                    ClassName = className,
                };

                listData.Add(obj);
            }

            return Json(listData);
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);

        }

        [HttpPost]
        public object GetCustomer()
        {
            var data = _context.Customerss.Select(x => new
            {
                Id = x.CusID,
                Name = x.CusName
            });
            return data;
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new {x.Name, x.Value})
                .Union(_stringLocalizerCj.GetAllStrings().Select(x => new {x.Name, x.Value}))
                .Union(_sharedResources.GetAllStrings().Select(x => new {x.Name, x.Value}))
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