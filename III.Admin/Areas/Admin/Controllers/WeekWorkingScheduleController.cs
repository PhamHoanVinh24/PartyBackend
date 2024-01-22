using System;
using System.Collections.Generic;
using System.Data;
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
    public class WeekWorkingScheduleController : BaseController
    {
        public class WeekWorkingScheduleJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }

        }
        public class WeekWorkingScheduleModel
        {
            public int Id { get; set; }
            public string CreatedTime { get; set; }
            public string TimeStart { get; set; }
            public string TimeEnd { get; set; }
            public string WorkContent { get; set; }
            public string ListUserApproved { get; set; }
            public string Location { get; set; }
            public string BackgroundColor { get; set; }
            public string BackgroundImage { get; set; }
            public string JsonRef { get; set; }
            public string Content { get; set; }
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
        private readonly IRepositoryService _repositoryService;
        public WeekWorkingScheduleController(EIMDBContext context, IUploadService upload,
            IHostingEnvironment hostingEnvironment, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<WeekWorkingScheduleController> stringLocalizer, IRepositoryService repositoryService,
            IStringLocalizer<StaffRegistrationController> staffRegistrationController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _staffRegistrationController = staffRegistrationController;
            _repositoryService = repositoryService;
        }

        [Breadcrumb("ViewData.CrumbWeek", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbWeek"] = _sharedResources["COM_WEEK_WORKING"];
            return View();
        }
        #region OldDesign

        [HttpPost]
        public object JTable([FromBody] WeekWorkingScheduleJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.WeekWorkingSchedulers
                        where (string.IsNullOrEmpty(jTablePara.FromDate) || (a.CreatedTime.Date >= fromDate.Value.Date))
                        && (string.IsNullOrEmpty(jTablePara.ToDate) || (a.CreatedTime.Date <= toDate.Value.Date))
                        select new
                        {
                            a.Id,
                            a.Chair,
                            a.CreatedTime,
                            a.TimeStart,
                            a.TimeEnd,
                            a.Composition,
                            a.Content,
                            a.Room,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Chair", "CreatedTime", "TimeStart", "TimeEnd", "Composition", "Content", "Room");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.WeekWorkingSchedulers.FirstOrDefault(x => x.Id == id);
            if (data == null)
            {
                msg.Error = true;
                msg.Title = "Lịch công tác không tồn tại, vui lòng làm mới trình duyệt";
            }
            else
            {
                var model = new WeekWorkingScheduleModel
                {
                    Id = data.Id,
                    CreatedTime = data.CreatedTime.ToString("dd/MM/yyyy"),
                    TimeStart = data.TimeStart,
                    TimeEnd = data.TimeEnd,
                    Content = data.Content,
                    //WorkContent = data.WorkContent,
                    //Location = data.Location,
                    //BackgroundColor = data.BackgroundColor,
                    //BackgroundImage = data.BackgroundImage,
                    //JsonRef = data.JsonRef
                };
                msg.Object = model;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody] WeekWorkingScheduleModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var model = new WeekWorkingScheduler
                {
                    CreatedTime = DateTime.Now,
                    TimeStart = obj.TimeStart,
                    TimeEnd = obj.TimeEnd,
                    Content = obj.Content,
                    //WorkContent = obj.WorkContent,
                    //ListUserApproved = obj.ListUserApproved,
                    //Location = obj.Location,
                    //BackgroundColor = obj.BackgroundColor,
                    //BackgroundImage = obj.BackgroundImage,
                    //JsonRef = obj.JsonRef,
                    CreatedBy = ESEIM.AppContext.UserName,
                };
                _context.WeekWorkingSchedulers.Add(model);
                _context.SaveChanges();
                msg.Title = "Thêm sự kiện thành công !";
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi khi thêm sự kiện!";
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] WeekWorkingScheduleModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WeekWorkingSchedulers.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.TimeStart = obj.TimeStart;
                    data.TimeEnd = obj.TimeEnd;
                    data.Content = obj.Content;
                    //data.ListUserApproved = obj.ListUserApproved;
                    //data.JsonRef = obj.JsonRef;
                    //data.BackgroundImage = obj.BackgroundImage;
                    //data.BackgroundColor = obj.BackgroundColor;
                    //data.Location = obj.Location;
                    _context.WeekWorkingSchedulers.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhập sự kiện thành công !";
                }
                else
                {
                    msg.Title = "Sự kiện không tồn tại !";
                    msg.Error = true;
                }
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi khi cập nhập sự kiện!";
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody] int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WeekWorkingSchedulers.FirstOrDefault(x => x.Id == id);
                _context.Remove(data);
                _context.SaveChanges();
                mess.Title = "Xóa sự kiện thành công";
            }
            catch (Exception ex)
            {
                mess.Title = "Xóa sự kiện bị lỗi";
                mess.Error = true;
            }
            return Json(mess);
        }

        [HttpPost]
        public int GetEventToday()
        {
            var dateNow = DateTime.Now;
            var count = _context.WeekWorkingSchedulers.Where(x => x.CreatedTime.Date == dateNow.Date).AsNoTracking().Count();
            return count;
        }

        [HttpPost]
        public bool CheckIsSecretary()
        {
            var secretary = false;
            var session = HttpContext.GetSessionUser();

            var query = (from a in _context.UserRoles
                         join b in _context.Roles on a.RoleId equals b.Id
                         where a.UserId == session.UserId && b.Code == EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.TK)
                         select b).AsNoTracking().FirstOrDefault();
            if (query != null)
            {
                secretary = true;
            }
            return secretary;
        }

        [HttpPost]
        public object GetAll()
        {
            DateTime today = DateTime.Today;
            int currentDayOfWeek = (int)today.DayOfWeek;
            DateTime sunday = today.AddDays(-currentDayOfWeek);
            DateTime monday = sunday.AddDays(1);
            var weekNo = CommonUtil.GetIso8601WeekOfYear(today);
            var model = new WeekWorkingScheduleViewCalenderModel();
            model.WeekNumber = weekNo;
            if (currentDayOfWeek == 0)
            {
                monday = monday.AddDays(-7);
            }
            var listDates = Enumerable.Range(0, 6).Select(days => monday.AddDays(days)).ToList();
            model.FromDate = listDates.Any() ? listDates.FirstOrDefault().Date.ToString("dd/MM/yyyy") : null;
            model.ToDate = listDates.Any() ? listDates.LastOrDefault().Date.ToString("dd/MM/yyyy") : null;
            var listScheduleForWeek = _context.WeekWorkingSchedulers.Where(x => listDates.Any(y => y.Date == x.CreatedTime.Date));
            foreach (var item in listDates)
            {
                var listSchedule = new List<Schedule>();
                var listForDate = listScheduleForWeek.Where(x => x.CreatedTime.Date == item.Date);
                if (listForDate.Any())
                {
                    listForDate = listForDate.OrderBy(x => x.TimeStart);
                    foreach (var key in listForDate)
                    {
                        var schedule = new Schedule
                        {
                            User = key.Chair,
                            TimeStart = key.TimeStart,
                            TimeEnd = key.TimeEnd,
                            Content = key.Content,
                            Room = key.Room,
                            Composition = key.Composition,
                            Haschild = true,
                            Child = 1,
                        };
                        listSchedule.Add(schedule);
                    }
                    var data = new WeekWorkingScheduleViewListCalenderModel
                    {
                        Week = TranslateWeek(item.DayOfWeek),
                        Date = item.Date.ToString("dd/MM/yyyy"),
                        Listschedules = listSchedule,
                    };
                    model.ListWeek.Add(data);
                }
                else
                {
                    var schedule = new Schedule
                    {
                        User = "",
                        TimeStart = "",
                        TimeEnd = "",
                        Content = "",
                        Room = "",
                        Composition = "",
                        Haschild = true,
                        Child = 1,
                    };
                    listSchedule.Add(schedule);
                    var dataWeekNullListSchedule = new WeekWorkingScheduleViewListCalenderModel
                    {
                        Week = TranslateWeek(item.DayOfWeek),
                        Date = item.Date.ToString("dd/MM/yyyy"),
                        Listschedules = listSchedule,
                    };
                    model.ListWeek.Add(dataWeekNullListSchedule);
                }
            }
            return model;
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

        #endregion
        #region New Design

        [HttpGet]
        public JsonResult GetEvent(string type)
        {
            var items = _context.WorkingSchedules.Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    Id = x.ID,
                    title = x.Content,
                    start = x.StartDate,
                    end = x.EndDate,
                    className = "fc-event-event-custom",
                    color = x.BackgroundColor,
                    workContent = x.WorkContent,
                    createdBy = x.CreatedBy
                });
            return Json(items);
        }
        [HttpPost]
        public object JTableWorkingSchedule([FromBody] WeekWorkingScheduleJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.WorkingSchedules.Where(x => !x.IsDeleted)
                         where (fromDate == null || fromDate.Value.Date >= a.StartDate.Date)
                         && (toDate == null || toDate.Value.Date <= a.EndDate.Date)
                         select new GridModel
                         {
                             Id = a.ID,
                             Location = a.Location,
                             Content = a.Content,
                             StartDate = a.StartDate,
                             EndDate = a.EndDate,
                             ListUser = a.ListUser
                         }).ToList();

            var users = _context.Users.ToList();

            foreach (var item in query)
            {
                var listUser = item.ListUser.Split(",", StringSplitOptions.None);
                var usrs = from a in users
                           join b in listUser on a.UserName equals b
                           select new
                           {
                               a.GivenName
                           };
                item.ListUser = string.Join(", ", usrs.Select(x => x.GivenName));
            }

            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Location", "Content", "StartDate", "EndDate", "ListUser");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertWorkingSchedule([FromBody] ModelWorkingSchedule obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startDate = DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                var endDate = DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                var workingSchedule = new WorkingSchedule
                {
                    Content = obj.Content,
                    WorkContent = obj.WorkContent,
                    ListUserApproved = obj.ListUserApproved,
                    JsonStatus = obj.JsonStatus,
                    JsonRef = obj.JsonRef,
                    BackgroundColor = obj.BackgroundColor,
                    BackgroundImage = obj.BackgroundImage,
                    Location = obj.Location,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    StartDate = startDate,
                    EndDate = endDate
                };
                _context.WorkingSchedules.Add(workingSchedule);
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
        public JsonResult UpdateWorkingSchedule([FromBody] ModelWorkingSchedule obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startDate = DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                var endDate = DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                var check = _context.WorkingSchedules.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (check != null)
                {
                    check.Content = obj.Content;
                    check.Location = obj.Location;
                    check.ListUser = obj.ListUser;
                    check.StartDate = startDate;
                    check.EndDate = endDate;
                    check.ListUserApproved = obj.ListUserApproved;
                    check.WorkContent = obj.WorkContent;
                    check.BackgroundColor = obj.BackgroundColor;
                    check.BackgroundImage = obj.BackgroundImage;
                    check.JsonStatus = obj.JsonStatus;
                    check.JsonRef = obj.JsonRef;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    _context.WorkingSchedules.Update(check);
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
        public JsonResult UpdateOnDrag([FromBody] ModelWorkingSchedule obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //var startDate = DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                //var endDate = DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var check = _context.WorkingSchedules.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (check != null)
                {
                    check.EndDate = check.EndDate.Add(obj.StartDateTime.Date - check.StartDate.Date);
                    check.StartDate = obj.StartDateTime;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    _context.WorkingSchedules.Update(check);
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
                var check = _context.WorkingSchedules.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                if (check != null)
                {
                    check.IsDeleted = true;
                    check.DeletedBy = ESEIM.AppContext.UserName;
                    check.DeletedTime = DateTime.Now;
                    _context.WorkingSchedules.Update(check);
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
            var check = _context.WorkingSchedules.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            return Json(check);
        }

        [HttpPost]
        public JsonResult GetCurrentUser()
        {
            return Json(HttpContext.GetSessionUser().UserName);
        }

        [HttpPost]
        public object GetListCmsItem(int pageNo = 1, int pageSize = 10, string content = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !String.IsNullOrEmpty(content) ? content : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content" };
            object[] val = new object[] { pageNo, pageSize, search };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_CMS_ITEM", param, val);
            var data = CommonUtil.ConvertDataTable<cms_items>(rs).Select(x => new { Code = x.alias, Name = x.title }).ToList();
            //return query;
            return data;
        }
        [HttpPost]
        public object GetItemCms(string code)
        {
            var data = _context.cms_items.FirstOrDefault(x => x.alias.Equals(code));
            return Json(data);
        }

        public class GridModel
        {
            public int Id { get; set; }
            public string Location { get; set; }
            public string Content { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public string ListUser { get; set; }
        }
        #endregion End new Design

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_staffRegistrationController.GetAllStrings().Select(x => new { x.Name, x.Value }));

            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}

