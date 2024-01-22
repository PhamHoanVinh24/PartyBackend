using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffWarningController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<StaffWarningController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public StaffWarningController(EIMDBContext context, IStringLocalizer<StaffWarningController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JtableWarningModel : JTableModel
        {
            public string UserId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class WarningModel
        {
            public DateTime Date { get; }
            public string MemberName { get; set; }
            public string Picture { get; set; }
            public string NumberLate { get; set; }
            public double TimeWork { get; set; }
        }

        [HttpPost]
        public object JtableStaffLate([FromBody]JtableWarningModel jTablePara)
        {
            //Get lịch làm việc công ty
            var companyScheduler = _context.CompanyScheduleWorks.FirstOrDefault(x => !x.IsDeleted && string.IsNullOrEmpty(x.UserName));
            TimeSpan timeFromWorkingMorning = new TimeSpan(8, 30, 0);
            TimeSpan timeToWorkingMorning = new TimeSpan(12, 00, 0);
            TimeSpan timeFromWorkingAfternoon = new TimeSpan(13, 30, 0);
            TimeSpan timeToWorkingAfternoon = new TimeSpan(17, 30, 0);
            TimeSpan timeFromWorkingEvening = new TimeSpan(21, 0, 0);
            TimeSpan timeToWorkingEvening = new TimeSpan(23, 0, 0);
            if (companyScheduler != null)
            {
                timeFromWorkingMorning = companyScheduler.FromMorning != null ? (TimeSpan)companyScheduler.FromMorning : timeFromWorkingMorning;
                timeToWorkingMorning = companyScheduler.ToMorning != null ? (TimeSpan)companyScheduler.ToMorning : timeToWorkingMorning;
                timeFromWorkingAfternoon = companyScheduler.FromAfternoon != null ? (TimeSpan)companyScheduler.FromAfternoon : timeFromWorkingAfternoon;
                timeToWorkingAfternoon = companyScheduler.ToAfternoon != null ? (TimeSpan)companyScheduler.ToAfternoon : timeToWorkingAfternoon;
                timeFromWorkingEvening = companyScheduler.FromEvening != null ? (TimeSpan)companyScheduler.FromEvening : timeFromWorkingEvening;
                timeToWorkingEvening = companyScheduler.ToEvening != null ? (TimeSpan)companyScheduler.ToEvening : timeToWorkingEvening;
            }

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //var listStaffLate = new List<WarningModel>();
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromDate == null && toDate == null)
            {
                fromDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                toDate = DateTime.Now;
            }
            var result = (from x in _context.StaffScheduleWorks
                          join y in _context.WorkShiftCheckInOuts.Where(z => (z.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) && z.Session == 1 && z.ActionTime.Date >= fromDate && z.ActionTime.Date <= toDate) || (z.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (z.ActionTime.Date <= fromDate.Value.Date || toDate.Value.Date >= z.ActionTo.Value.Date)) || (z.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && z.ActionTime.Date >= fromDate && z.ActionTime.Date <= toDate)) on x.MemberId equals y.UserId into y1
                          let userCheckIn = y1.FirstOrDefault(z => z.ActionTime.Date == x.DatetimeEvent.Date && z.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) && z.Session == 1)
                          let userLate = y1.Where(z => z.ActionTime.Date == x.DatetimeEvent.Date && z.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate))
                          let userNoWorking = y1.Where(z => z.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && z.ActionTime.Date <= x.DatetimeEvent.Date && z.ActionTo.Value.Date >= x.DatetimeEvent.Date)
                          where (x.DatetimeEvent >= fromDate && x.DatetimeEvent <= toDate)
                          && (string.IsNullOrEmpty(jTablePara.UserId) || (x.MemberId == jTablePara.UserId))
                          select new
                          {
                              x.MemberId,
                              userCheckIn,
                              x.DatetimeEvent,
                              Late = (userCheckIn != null && x.FrameTime.Split(';', StringSplitOptions.None)[0] == "True" && (userCheckIn.ActionTime.TimeOfDay > timeFromWorkingMorning)) ? 1 :
                              (userCheckIn != null && x.FrameTime.Split(';', StringSplitOptions.None)[1] == "True" && (userCheckIn.ActionTime.TimeOfDay > timeFromWorkingAfternoon)) ? 1 :
                              (userCheckIn != null && x.FrameTime.Split(';', StringSplitOptions.None)[2] == "True" && (userCheckIn.ActionTime.TimeOfDay > timeFromWorkingEvening)) ? 1 : 0,

                              NoWorking = userCheckIn != null ? 0 : 1,
                              userLate,
                              LatePermision = (userCheckIn != null && x.FrameTime.Split(';', StringSplitOptions.None)[0] == "True" && (userCheckIn.ActionTime.TimeOfDay > timeFromWorkingMorning) && (userCheckIn.ActionTime.TimeOfDay < timeFromWorkingAfternoon) && userLate.Where(x => userCheckIn.ActionTime.TimeOfDay <= x.ActionTime.TimeOfDay).Any()) ? 1 :
                              (userCheckIn != null && x.FrameTime.Split(';', StringSplitOptions.None)[1] == "True" && (userCheckIn.ActionTime.TimeOfDay > timeFromWorkingAfternoon) && (userCheckIn.ActionTime.TimeOfDay < timeFromWorkingAfternoon) && userLate.Where(x => userCheckIn.ActionTime.TimeOfDay <= x.ActionTime.TimeOfDay).Any()) ? 1 :
                              (userCheckIn != null && x.FrameTime.Split(';', StringSplitOptions.None)[1] == "True" && (userCheckIn.ActionTime.TimeOfDay > timeFromWorkingAfternoon) && (userCheckIn.ActionTime.TimeOfDay < timeFromWorkingEvening) && userLate.Where(x => userCheckIn.ActionTime.TimeOfDay <= x.ActionTime.TimeOfDay).Any()) ? 1 : 0,
                              NoWorkingPermision = userCheckIn == null && userNoWorking.FirstOrDefault(z => z.ActionTime.Date <= x.DatetimeEvent.Date && z.ActionTo.Value.Date >= x.DatetimeEvent.Date) != null ? 1 : 0,
                              userNoWorking,

                          }).AsNoTracking();
            var total = (from a in (from a in result
                                    group a by a.MemberId into grp
                                    select new
                                    {
                                        MemberId = grp.Key,
                                        NumberLate = grp.Sum(x => x.Late),
                                        NumberNoWorking = grp.Sum(x => x.NoWorking),
                                        LatePermision = grp.Sum(x => x.LatePermision),
                                        NoWorkingPermision = grp.Sum(x => x.NoWorkingPermision),
                                    })
                         join b in _context.Users on a.MemberId equals b.Id
                         select new
                         {
                             a.MemberId,
                             b.GivenName,
                             b.Picture,
                             b.Active,
                             a.NumberLate,
                             a.NumberNoWorking,
                             a.LatePermision,
                             a.NoWorkingPermision
                         }).AsNoTracking();
            var list = total.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = total.Count();
            var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "MemberId", "GivenName", "Picture", "Active", "NumberLate", "NumberNoWorking", "LatePermision", "NoWorkingPermision");
            return Json(jdata);
        }

        [HttpGet]
        public JsonResult GetDetailStatisticalWithMember(string memberId, string fromDate, string toDate)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var fDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var tDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (fDate == null && fDate == null)
                {
                    fDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    tDate = DateTime.Now;
                }
                var query = from a in _context.WorkShiftCheckInOuts
                            where a.UserId == memberId &&
                            (a.ActionTime.Date >= fDate.Value.Date && a.ActionTime.Date <= tDate.Value.Date) &&
                            (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckOut)))
                            group a by a.ActionTime.Date into grp
                            select new
                            {
                                grp.Key,
                                ListCheckInCheckOut = grp.GroupBy(p => p.Session, (key, g) => new
                                {
                                    Session = key,
                                    CheckIn = g.FirstOrDefault(x => x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn)),
                                    CheckOut = g.FirstOrDefault(x => x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckOut)),
                                })
                            };
                var list = query.Select(x => new
                {
                    ListTimeWorkWithDate = x.ListCheckInCheckOut.Select(y => new
                    {
                        TimeWork = y.CheckIn != null && y.CheckOut != null ? (y.CheckOut.ActionTime.Subtract(y.CheckIn.ActionTime)).TotalMinutes : 0.0,
                    }).Sum(y => y.TimeWork)
                }).Sum(y => y.ListTimeWorkWithDate);
                var ts = TimeSpan.FromMinutes(list);
                msg.Object = new
                {
                    ts.Hours,
                    ts.Minutes
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xin thử lại!";
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        [HttpGet]
        public int CountUserWorking()
        {
            //int result = 0;
            //var query = from a in _context.WorkShiftCheckInOuts
            //            where a.ActionTime.Date == DateTime.Now.Date && (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn)
            //            || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckOut))
            //            group a by a.UserId into grp
            //            select new
            //            {
            //                grp.Key,
            //                IsCheckOut = grp.FirstOrDefault(x => x.Session == grp.Max(y => y.Session) && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckOut))
            //            };
            //result = query.Where(x => x.IsCheckOut == null).Count();
            var data = _context.ShiftLogs.Where(x => !x.ChkoutTime.HasValue && x.ChkinTime.Value.Date == DateTime.Now.Date);
            return data.Count();
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
