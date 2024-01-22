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
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WorkingScheduleController : BaseController
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
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        IHostingEnvironment _hostingEnvironment;
        public WorkingScheduleController(EIMDBContext context, IUploadService upload, 
            IHostingEnvironment hostingEnvironment, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbWeek", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbWeek"] = "Lịch họp";
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]WeekWorkingScheduleJtable jTablePara)
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
                msg.Title = "Lịch họp không tồn tại, vui lòng làm mới trình duyệt";
            }
            else
            {
                var model = new WeekWorkingScheduleModel
                {
                    Id = data.Id,
                    Chair = data.Chair,
                    CreatedTime = data.CreatedTime.ToString("dd/MM/yyyy"),
                    TimeStart = data.TimeStart,
                    TimeEnd = data.TimeEnd,
                    Room = data.Room,
                    Composition = data.Composition,
                    Content = data.Content,
                };
                msg.Object = model;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]WeekWorkingScheduleModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var model = new WeekWorkingScheduler
                {
                    Chair = obj.Chair,
                    CreatedTime = !string.IsNullOrEmpty(obj.CreatedTime) ? DateTime.ParseExact(obj.CreatedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now,
                    TimeStart = obj.TimeStart,
                    TimeEnd = obj.TimeEnd,
                    Room = obj.Room,
                    Composition = obj.Composition,
                    Content = obj.Content,
                    CreatedBy = ESEIM.AppContext.UserId,
                };
                _context.WeekWorkingSchedulers.Add(model);
                _context.SaveChanges();
                msg.Title = "Thêm lịch họp thành công !";
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi khi thêm lịch họp!";
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
                    data.Chair = obj.Chair;
                    data.CreatedTime = !string.IsNullOrEmpty(obj.CreatedTime) ? DateTime.ParseExact(obj.CreatedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                    data.TimeStart = obj.TimeStart;
                    data.TimeEnd = obj.TimeEnd;
                    data.Room = obj.Room;
                    data.Composition = obj.Composition;
                    data.Content = obj.Content;
                    _context.WeekWorkingSchedulers.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhập lịch họp thành công !";
                }
                else
                {
                    msg.Title = "Lịch họp không tồn tại !";
                    msg.Error = true;
                }
            }
            catch (Exception)
            {
                msg.Title = "Có lỗi khi cập nhập lịch họp!";
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
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
    }
}

