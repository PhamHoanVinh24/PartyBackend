using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
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
    public class RecruitmentScheduleController : BaseController
    {
        public class WeekWorkingScheduleJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }

        }
        public class WeekWorkingScheduleModel
        {
            public int Id { get; set; }
            public string Chair { get; set; }
            public string CreatedTime { get; set; }
            public string TimeStart { get; set; }
            public string TimeEnd { get; set; }
            public string Room { get; set; }
            public string Composition { get; set; }
            public string Content { get; set; }
            public string Result { get; set; }
        }
        public class WeekWorkingScheduleViewCalenderModel
        {
            public WeekWorkingScheduleViewCalenderModel()
            {
                ListWeek = new List<WeekWorkingScheduleViewListCalenderModel>();
            }
            public int? WeekNumber { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public List<WeekWorkingScheduleViewListCalenderModel> ListWeek { get; set; }
        }
        public class WeekWorkingScheduleViewListCalenderModel
        {
            public string Week { get; set; }
            public string Date { get; set; }
            public List<Schedule> Listschedules { get; set; }
        }
        public class Schedule
        {
            public string User { get; set; }
            public string TimeStart { get; set; }
            public string TimeEnd { get; set; }
            public string Content { get; set; }
            public string Room { get; set; }
            public string Composition { get; set; }
            public bool Haschild { get; set; }
            public int? Child { get; set; }

        }

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<WeekWorkingScheduleController> _stringLocalizer;
        private readonly IStringLocalizer<StaffRegistrationController> _staffRegistrationController;
        public RecruitmentScheduleController(EIMDBContext context, IUploadService upload,
            IHostingEnvironment hostingEnvironment, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<WeekWorkingScheduleController> stringLocalizer,
            IStringLocalizer<StaffRegistrationController> staffRegistrationController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _staffRegistrationController = staffRegistrationController;
        }

        [Breadcrumb("ViewData.CrumbWeek", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbWeek"] = "Lịch phỏng vấn";
            return View();
        }

        [HttpGet]
        public JsonResult GetEvent(string type)
        {
            var items = _context.RecruitmentSchedulers.Where(x => !x.IsDeleted)
                .Select(x => new {
                    Id = x.ID,
                    title = x.Content,
                    start = x.StartDate,
                    end = x.EndDate,
                    className = "fc-event-event-green"
                });
            return Json(items);
        }

        [NonAction]
        public string TranslateWeek(DayOfWeek week)
        {
            var result = "";
            switch (week.ToString())
            {
                case "Monday":
                    result = "Thứ hai";
                    break;
                case "Tuesday":
                    result = "Thứ ba";
                    break;
                case "Wednesday":
                    result = "Thứ tư";
                    break;
                case "Thursday":
                    result = "Thứ năm";
                    break;
                case "Friday":
                    result = "Thứ sáu";
                    break;
                case "Saturday":
                    result = "Thứ bảy";
                    break;
            }
            return result;
        }

        #region New Design
        [HttpPost]
        public JsonResult InsertWorkingSchedule([FromBody]ModelWorkingSchedule obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startDate = DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var endDate = DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var workingSchedule = new RecruitmentScheduler
                {
                    Content = obj.Content,
                    Location = obj.Location,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    ListUser = obj.ListUser,
                    StartDate = startDate,
                    EndDate = endDate,
                    Result = obj.Result
                };
                _context.RecruitmentSchedulers.Add(workingSchedule);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateWorkingSchedule([FromBody]ModelWorkingSchedule obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startDate = DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var endDate = DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var check = _context.RecruitmentSchedulers.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (check != null)
                {
                    check.Content = obj.Content;
                    check.Location = obj.Location;
                    check.ListUser = obj.ListUser;
                    check.StartDate = startDate;
                    check.EndDate = endDate;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    check.Result = obj.Result;
                    _context.RecruitmentSchedulers.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_RECORD"];
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
        public JsonResult DeleteWorkingSchedule(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.RecruitmentSchedulers.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                if (check != null)
                {
                    check.IsDeleted = true;
                    check.DeletedBy = ESEIM.AppContext.UserName;
                    check.DeletedTime = DateTime.Now;
                    _context.RecruitmentSchedulers.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_RECORD"];
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
        public JsonResult GetItemWorkingSchedule(int id)
        {
            var check = _context.RecruitmentSchedulers.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            return Json(check);
        }

        public class ModelWorkingSchedule
        {
            public int ID { get; set; }
            public string ListUser { get; set; }
            public string StartDate { get; set; }
            public string EndDate { get; set; }
            public string Location { get; set; }
            public string Content { get; set; }
            public string Result { get; set; }
        }
        #endregion End new Design

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value}))
                .Union(_staffRegistrationController.GetAllStrings().Select(x => new { x.Name, x.Value}));

            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}

