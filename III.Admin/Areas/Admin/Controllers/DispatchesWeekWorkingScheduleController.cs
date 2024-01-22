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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class DispatchesWeekWorkingScheduleController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        IHostingEnvironment _hostingEnvironment;
        public DispatchesWeekWorkingScheduleController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public object JTable([FromBody]WeekWorkingScheduleJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.DispatchesWeekWorkingSchedulerss.Where(x => !x.IsDeleted)
                        join b in _context.Users on a.UserName equals b.UserName
                        where (string.IsNullOrEmpty(jTablePara.FromDate) || (a.ToDate >= fromDate.Value.Date))
                        && (string.IsNullOrEmpty(jTablePara.ToDate) || (a.FromDate < toDate.Value.AddDays(1).Date))
                        && (string.IsNullOrEmpty(jTablePara.UserName) || (a.UserName == jTablePara.UserName))
                        select new
                        {
                            a.Id,
                            a.UserName,
                            Name = b.GivenName,
                            a.FromDate,
                            a.ToDate,
                            a.Content,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserName", "Name", "FromDate", "ToDate", "Content");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.DispatchesWeekWorkingSchedulerss.FirstOrDefault(x => x.Id == id);
            if (data == null)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Không tìm thấy dữ liệu. Vui lòng tải lại trang."));
            }
            else
            {
                var model = new WeekWorkingScheduleModel
                {
                    Id = data.Id,
                    UserName = data.UserName,
                    FromDate = data.FromDate.ToString("dd/MM/yyyy HH:mm"),
                    ToDate = data.ToDate.ToString("dd/MM/yyyy HH:mm"),
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
                var model = new DispatchesWeekWorkingScheduler
                {
                    UserName = obj.UserName,
                    FromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now,
                    ToDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now,
                    Content = obj.Content,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now.Date,
                };
                _context.DispatchesWeekWorkingSchedulerss.Add(model);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("Thêm lịch công tác thành công."));
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("Lỗi khi thêm lịch công tác."));
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
                var data = _context.DispatchesWeekWorkingSchedulerss.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.UserName = obj.UserName;
                    data.FromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now;
                    data.ToDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now;
                    data.Content = obj.Content;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now.Date;
                    _context.DispatchesWeekWorkingSchedulerss.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("Sửa lịch công tác thành công."));
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("Không tìm thấy dữ liệu. Vui lòng tải lại trang."));
                    msg.Error = true;
                }
            }
            catch (Exception)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("Lỗi khi sửa lịch công tác."));
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
                var data = _context.DispatchesWeekWorkingSchedulerss.FirstOrDefault(x => x.Id == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now.Date;
                data.IsDeleted = true;
                _context.DispatchesWeekWorkingSchedulerss.Update(data);
                _context.SaveChanges();
                mess.Title = String.Format(CommonUtil.ResourceValue("Xóa dữ liệu thành công."));
            }
            catch (Exception ex)
            {
                mess.Title = String.Format(CommonUtil.ResourceValue("Lỗi khi xóa dữ liệu."));
                mess.Error = true;
            }
            return Json(mess);
        }

        [HttpPost]
        public object GetListUserName()
        {
            var data = _context.Users.Where(x => x.Active).Select(x => new { Code = x.UserName, Name = x.GivenName }).ToList();
            return Json(data);
        }

        [HttpPost]
        public int GetEventToday()
        {
            var dateNow = DateTime.Now;
            var count = _context.DispatchesWeekWorkingSchedulerss.Where(x => !x.IsDeleted && x.CreatedTime.Date == dateNow.Date).AsNoTracking().Count();
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
        public object GetAll(string userName, string dateWeek)
        {
            DateTime today = DateTime.Today;
            if (!string.IsNullOrEmpty(dateWeek))
            {
                today = !string.IsNullOrEmpty(dateWeek) ? DateTime.ParseExact(dateWeek, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Today;
            }

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
            foreach (var item in listDates)
            {
                var listSchedule = new List<Schedule>();
                var listForDate = _context.DispatchesWeekWorkingSchedulerss.Where(x => !x.IsDeleted && x.FromDate.Date <= item.Date && x.ToDate.Date >= item.Date && (string.IsNullOrEmpty(userName) || x.UserName == userName));
                if (listForDate.Any())
                {
                    foreach (var key in listForDate)
                    {
                        var schedule = new Schedule
                        {
                            User = _context.Users.FirstOrDefault(x => x.UserName == key.UserName)?.GivenName,
                            TimeStart = key.FromDate.Date == item.Date ? key.FromDate.ToString("HH:mm") : "07:00",
                            TimeEnd = key.ToDate.Date == item.Date ? key.ToDate.ToString("HH:mm") : "18:00",
                            Content = key.Content,
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
    public class WeekWorkingScheduleJtable : JTableModel
    {
        public string UserName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }

    }
    public class WeekWorkingScheduleModel
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
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
}

