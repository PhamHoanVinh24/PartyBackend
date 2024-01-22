using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffSalaryController : Controller
    {

        public class ListUserModel
        {
            public string GiveName { get; set; }
            public string Status { get; set; }
            public bool IsPermissionNoWork { get; set; }
            public string FromTo { get; set; }
            public string ToDate { get; set; }
            public string MemberId { get; set; }
        }

        private readonly EIMDBContext _context;
        private TimeSpan _timeWorkingMorning;
        private TimeSpan _timeWorkingAfternoon;
        private TimeSpan _timeWorkingEvening;
        private TimeSpan _freeTime;
        private readonly IStringLocalizer<StaffSalaryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public StaffSalaryController(EIMDBContext context, IStringLocalizer<StaffSalaryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _timeWorkingMorning = new TimeSpan(8, 30, 0);
            _timeWorkingAfternoon = new TimeSpan(13, 30, 0);
            _timeWorkingEvening = new TimeSpan(21, 0, 0);
            _freeTime = new TimeSpan(1, 30, 0);
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbStaffSalary", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbStaffSalary"] = _sharedResources["COM_CRUMB_STAFF_SALARY"];
            return View();
        }

        [HttpGet]
        public JsonResult GetAllTotal(string memberId, int month, int year, string from, string to)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var user = _context.Users.FirstOrDefault(x => x.Active && x.Id == memberId);
            try
            {
                var listTotal = new List<StatisticalTotal>();
                var fromDate = !string.IsNullOrEmpty(from) ? DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(to) ? DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var listDateInMonth = DateTimeExtensions.GetDates(year, month).Where(x => x.Date <= DateTime.Today);
                //Select all
                if (string.IsNullOrEmpty(memberId))
                {
                    if (fromDate == null && toDate == null)
                    {
                        foreach (var item in listDateInMonth)
                        {
                            var totalRegistration = _context.StaffScheduleWorks.Where(x => x.DatetimeEvent.Month == month && x.DatetimeEvent.Year == year && x.DatetimeEvent.Date == item.Date).DistinctBy(x => x.MemberId).Count();
                            var totalLate = GetCountUserLate(item, "");
                            var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == item.Date).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = item,
                                CountRegistration = totalRegistration,
                                CountLate = totalLate,
                                CountReal = totalReal
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = true,
                            ListTotal = listTotal,
                        };
                    }
                    else
                    {
                        for (DateTime date = fromDate.Value; date <= toDate; date = date.AddDays(1))
                        {
                            var totalRegistration = _context.StaffScheduleWorks.Where(x => x.DatetimeEvent.Month == month && x.DatetimeEvent.Year == year && x.DatetimeEvent.Date == date.Date).DistinctBy(x => x.MemberId).Count();
                            var totalLate = GetCountUserLate(date, "");
                            var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = date,
                                CountRegistration = totalRegistration,
                                CountLate = totalLate,
                                CountReal = totalReal
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = true,
                            ListTotal = listTotal,
                        };
                    }
                }
                //select memeberId
                else
                {
                    if (fromDate == null && toDate == null)
                    {
                        foreach (var item in listDateInMonth)
                        {
                            var totalLate = GetCountUserLate(item, memberId);
                            var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == item.Date && x.CreatedBy == user.UserName).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = item,
                                CountRegistration = 0,
                                CountLate = totalLate,
                                CountReal = totalReal
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = false,
                            ListTotal = listTotal,
                        };
                    }
                    else
                    {
                        for (DateTime date = fromDate.Value; date <= toDate; date = date.AddDays(1))
                        {
                            var totalLate = GetCountUserLate(date, memberId);
                            var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date && x.CreatedBy == user.UserName).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = date,
                                CountRegistration = 0,
                                CountLate = totalLate,
                                CountReal = totalReal
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = false,
                            ListTotal = listTotal,
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }

        [NonAction]
        public int GetCountUserLate(DateTime date, string memberId)
        {
            var query = (from a in _context.WorkShiftCheckInOuts
                         join b in _context.Users on a.UserId equals b.Id
                         where (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork))
                         && ((date == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= date.Date))
                                                    || (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTime.Date >= date.Date))
                                                    ))
                           && ((date == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (date.Date >= a.ActionTime.Date))
                                                    || (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTime.Date <= date.Date))))
                                                    && (string.IsNullOrEmpty(memberId) || a.UserId == memberId)
                         select new
                         {
                             a.Id,
                             a.UserId,
                             FullName = b.GivenName,
                             b.Picture,
                             a.Action,
                             a.ActionTime,
                             a.ActionTo,
                             a.Note,
                             a.LocationText
                         });
            return query.Count();
        }

        [HttpPost]
        public JsonResult GetAllInCalendar(string dateSearch, string memberId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            //List check in/ check out
            try
            {
                var userName = "";
                var date = DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                if (!string.IsNullOrEmpty(memberId))
                {
                    var user = _context.Users.FirstOrDefault(x => x.Id == memberId);
                    userName = user.UserName;
                }
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date &&
                            (string.IsNullOrEmpty(userName) || (x.CreatedBy == userName)))
                             select new
                             {
                                 a.Id,
                                 ChkInTime = a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                                 a.ChkinLocationTxt,
                                 ChkOutTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 ChkoutLocationTxt = !string.IsNullOrEmpty(a.ChkoutLocationTxt) ? a.ChkoutLocationTxt : "",
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 UserId = _context.Users.FirstOrDefault(x => x.UserName == a.CreatedBy).Id,
                                 GivenName = _context.Users.FirstOrDefault(x => x.UserName == a.CreatedBy).GivenName,
                                 Phone = _context.Users.FirstOrDefault(x => x.UserName == a.CreatedBy).PhoneNumber
                             }).GroupBy(x => x.CreatedBy);
                var shifts = new List<ViewTotal>();
                foreach (var item in query)
                {
                    var list = item.ToList();
                    if (item.Count() > 0)
                    {
                        var total = new ViewTotal
                        {
                            ChkInTime = list[list.Count - 1].ChkInTime,
                            ChkinLocationTxt = list[list.Count - 1].ChkinLocationTxt,
                            ChkOutTime = list[list.Count - 1].ChkOutTime,
                            ChkoutLocationTxt = list[list.Count - 1].ChkoutLocationTxt,
                            UserId = list[list.Count - 1].UserId,
                            ActionTime = "",
                            Morning = "",
                            Afternoon = "",
                            Department = "",
                            Evening = "",
                            FullName = list[list.Count - 1].GivenName,
                            LocationText = "",
                            Status = "",
                            Phone = list[list.Count - 1].Phone
                        };
                        shifts.Add(total);
                    }
                }
                //List user go late, no work
                var userLate = (from a in _context.WorkShiftCheckInOuts
                                join b in _context.Users on a.UserId equals b.Id
                                where (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate)
                                || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)
                                || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork))
                                && ((date == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= date.Date))
                                                           || (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTime.Date >= date.Date))
                                                           ))
                                  && ((date == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (date.Date >= a.ActionTime.Date))
                                                           || (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTime.Date <= date.Date))))
                                                           && (string.IsNullOrEmpty(memberId) || a.UserId.Equals(memberId))
                                select new
                                {
                                    a.Id,
                                    a.UserId,
                                    b.GivenName,
                                    b.Picture,
                                    a.Action,
                                    a.ActionTime,
                                    a.ActionTo,
                                    a.Note,
                                    a.LocationText
                                });
                var dataUserLate = userLate.Select(x => new ViewTotal
                {
                    FullName = x.GivenName,
                    Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() : ""),
                    ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                    LocationText = x.LocationText,
                    UserId = x.UserId,
                    Department = "",
                    ChkOutTime = "",
                    ChkoutLocationTxt = "",
                    ChkInTime = "",
                    ChkinLocationTxt = "",
                    Evening = "",
                    Morning = "",
                    Afternoon = "",
                    Phone = _context.Users.FirstOrDefault(k => k.Id == x.UserId).PhoneNumber
                });

                // List user registration
                var dateRegistration = string.IsNullOrEmpty(dateSearch) ? (DateTime?)null : DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var listRegistration = from a in _context.Users.Where(x => x.Active)
                                       join b in _context.StaffScheduleWorks on a.Id equals b.MemberId
                                       join c in _context.AdGroupUsers on a.AdUserInGroups.FirstOrDefault().GroupUserCode equals c.GroupUserCode into c1
                                       from c in c1.DefaultIfEmpty()
                                       where b.DatetimeEvent == dateRegistration
                                       && (string.IsNullOrEmpty(memberId) || b.MemberId.Equals(memberId))
                                       select new ViewTotal
                                       {
                                           FullName = a.GivenName,
                                           Department = c != null ? c.Title : "",
                                           Morning = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[0],
                                           Afternoon = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[1],
                                           Evening = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[2],
                                           UserId = b.MemberId,
                                           ChkinLocationTxt = "",
                                           ChkInTime = "",
                                           ChkoutLocationTxt = "",
                                           ChkOutTime = "",
                                           Status = "",
                                           ActionTime = "",
                                           LocationText = "",
                                           Phone = _context.Users.FirstOrDefault(k => k.Id == b.MemberId).PhoneNumber
                                       };

                //Add data to list
                if (listRegistration.Any())
                {
                    var data = from a in listRegistration
                               join b in shifts on a.UserId equals b.UserId into b1
                               from b2 in b1.DefaultIfEmpty()
                               join c in dataUserLate on a.UserId equals c.UserId into c1
                               from c2 in c1.DefaultIfEmpty()
                               select new ViewTotal
                               {
                                   FullName = a != null ? a.FullName : b2 != null ? b2.FullName : c2.FullName,
                                   ActionTime = c2.ActionTime,
                                   Afternoon = a.Afternoon,
                                   Morning = a.Morning,
                                   Evening = a.Evening,
                                   LocationText = c2.LocationText,
                                   ChkinLocationTxt = b2.ChkinLocationTxt,
                                   ChkInTime = b2.ChkInTime,
                                   ChkoutLocationTxt = b2.ChkoutLocationTxt,
                                   ChkOutTime = b2.ChkOutTime,
                                   Department = a.Department,
                                   Status = c2.Status,
                                   Phone = a.Phone
                               };
                    msg.Object = data;
                }
                else
                {
                    if (shifts.Any())
                    {
                        var data = from b in shifts
                                   join c in dataUserLate on b.UserId equals c.UserId into c1
                                   from c2 in c1.DefaultIfEmpty()
                                   select new ViewTotal
                                   {
                                       FullName = b != null ? b.FullName : c2.FullName,
                                       ActionTime = c2 != null ? c2.ActionTime : "",
                                       Afternoon = "",
                                       Morning = "",
                                       Evening = "",
                                       LocationText = c2 != null ? c2.LocationText : "",
                                       ChkinLocationTxt = b.ChkinLocationTxt,
                                       ChkInTime = b.ChkInTime,
                                       ChkoutLocationTxt = b.ChkoutLocationTxt,
                                       ChkOutTime = b.ChkOutTime,
                                       Department = "",
                                       Status = c2 != null ? c2.Status : "",
                                       Phone =  b.Phone
                                   };
                        msg.Object = data;
                    }
                    else
                    {
                        var data = from c in dataUserLate
                                   select new ViewTotal
                                   {
                                       FullName = c.FullName,
                                       ActionTime = c.ActionTime,
                                       Afternoon = "",
                                       Morning = "",
                                       Evening = "",
                                       LocationText = c.LocationText,
                                       ChkinLocationTxt = "",
                                       ChkInTime = "",
                                       ChkoutLocationTxt = "",
                                       ChkOutTime = "",
                                       Department = "",
                                       Status = c.Status,
                                       Phone = c.Phone
                                   };
                        msg.Object = data;
                    }
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListUserOfDate(string dateSearch, string memberId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var userName = "";
                var date = DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                if (!string.IsNullOrEmpty(memberId))
                {
                    var user = _context.Users.FirstOrDefault(x => x.Id == memberId);
                    userName = user.UserName;
                    var query = from a in _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date && x.CreatedBy == userName)
                                select new
                                {
                                    a.Id,
                                    a.FromDevice,
                                    ChkInTime = a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                                    a.ChkinLocationTxt,
                                    ChkOutTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                    a.ChkoutLocationTxt,
                                    a.ShiftCode,
                                    a.Note,
                                    GivenName = _context.Users.FirstOrDefault(x => x.UserName == a.CreatedBy).GivenName
                                };
                    msg.Object = query;
                }
                else
                {
                    var query = (from a in _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date)
                                 select new
                                 {
                                     a.Id,
                                     a.FromDevice,
                                     ChkInTime = a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                                     a.ChkinLocationTxt,
                                     ChkOutTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.ChkoutLocationTxt,
                                     a.ShiftCode,
                                     a.Note,
                                     GivenName = _context.Users.FirstOrDefault(x => x.UserName == a.CreatedBy).GivenName
                                 });
                    msg.Object = query;
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListUserLateOfDate(string dateSearch, string memberId)
        {
            var date = DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var query = (from a in _context.WorkShiftCheckInOuts
                         join b in _context.Users on a.UserId equals b.Id
                         where (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork))
                         && ((date == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= date.Date))
                                                    || (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTime.Date >= date.Date))
                                                    ))
                           && ((date == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (date.Date >= a.ActionTime.Date))
                                                    || (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTime.Date <= date.Date))))
                                                    && (string.IsNullOrEmpty(memberId) || a.UserId.Equals(memberId))
                         select new
                         {
                             a.Id,
                             a.UserId,
                             FullName = b.GivenName,
                             b.Picture,
                             a.Action,
                             a.ActionTime,
                             a.ActionTo,
                             a.Note,
                             a.LocationText
                         });
            var data = query.Select(x => new
            {
                x.Id,
                x.UserId,
                x.FullName,
                x.Picture,
                Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() : ""),
                ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                              x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                              x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                x.LocationText,
                x.Note
            });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetEventForDate(string date, string memberId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var dateSearch = string.IsNullOrEmpty(date) ? (DateTime?)null : DateTime.ParseExact(date, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var query = from a in _context.Users.Where(x => x.Active)
                            join b in _context.StaffScheduleWorks on a.Id equals b.MemberId
                            join c in _context.AdGroupUsers on a.AdUserInGroups.FirstOrDefault().GroupUserCode equals c.GroupUserCode into c1
                            from c in c1.DefaultIfEmpty()
                            where b.DatetimeEvent == dateSearch
                            && (string.IsNullOrEmpty(memberId) || b.MemberId.Equals(memberId))
                            select new
                            {
                                b.Id,
                                a.GivenName,
                                Phone = a.PhoneNumber,
                                a.Email,
                                a.AdUserInGroups,
                                Department = c != null ? c.Title : "",
                                TypeWork = a.TypeWork == EnumHelper<TypeWork>.GetDisplayValue(TypeWork.P) ? TypeWork.P.DescriptionAttr() :
                                a.TypeWork == EnumHelper<TypeWork>.GetDisplayValue(TypeWork.F) ? TypeWork.F.DescriptionAttr() : "",
                                Morning = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[0],
                                Afternoon = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[1],
                                Evening = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[2]
                            };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetWorkTimeOfUser(string from, string to, string userId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var listStatistical = new List<SalaryTotal>();
            try
            {
                userId = string.IsNullOrEmpty(userId) ? ESEIM.AppContext.UserId : userId;

                var user = _context.Users.FirstOrDefault(x => x.Id == userId);

                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where a.CreatedBy == user.UserName
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.ChkoutTime.Value.Date);

                var listDate = new List<DateTime>();

                if(!string.IsNullOrEmpty(from) && !string.IsNullOrEmpty(to))
                {
                    var fromDate = DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var toDate = DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    for (DateTime date = fromDate; date <= toDate; date = date.AddDays(1))
                    {
                        listDate.Add(date);
                    }
                }
                else
                {
                    listDate = DateTimeExtensions.GetDates(DateTime.Now.Year, DateTime.Now.Month).Where(x => x.Date <= DateTime.Today).ToList();
                }

                foreach (var item in listDate)
                {
                    var timeWork = 0.0;
                    var shifts = query.Where(x => x.Key.Date.Date == item.Date);
                    if (shifts.Any())
                    {
                        foreach(var shift in shifts)
                        {
                            foreach(var i in shift)
                            {
                                timeWork = timeWork + ((i.ChkoutTime.Value.Subtract(i.ChkinTime.Value)).TotalMinutes);
                            }
                        }
                    }
                    var model = new SalaryTotal
                    {
                        Date = item,
                        TimeWork = timeWork != 0.0 ? Math.Round(timeWork / 60, 1, MidpointRounding.AwayFromZero) : 0
                    };
                    listStatistical.Add(model);
                }
                msg.Object = new
                {
                    Data = listStatistical,
                    User = _context.Users.FirstOrDefault(x => x.Id == userId).GivenName,
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi lấy dữ liệu";
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //Salary
        public ActionResult ExportExcel()
        {
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2010;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Bảng lương");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            sheetRequest.Range["J1:P1"].Merge(true);

            sheetRequest.Range["J1"].Text = "Bảng tính lương";
            sheetRequest.Range["J1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["J1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["J1"].CellStyle.Font.Size = 24;

            sheetRequest.Range["J1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["K2:O2"].Merge(true);
            sheetRequest.Range["K2"].Text = "Tháng " + DateTime.Now.Month +" năm " + DateTime.Now.Year;
            sheetRequest.Range["K2"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["K2"].CellStyle.Font.Bold = true;
            sheetRequest.Range["K2"].CellStyle.Font.Size = 14;
            sheetRequest.Range["K2"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["A3:A4"].Merge(true);
            sheetRequest.Range["A3"].Text = "STT";

            sheetRequest.Range["B3:B4"].Merge(true);
            sheetRequest.Range["B3"].Text = "Họ tên";
            sheetRequest.Range["B3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["B3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C3:C4"].Merge(true);
            sheetRequest.Range["C3"].Text = "Chức vụ";
            sheetRequest.Range["C3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["C3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["D3:D4"].Merge(true);
            sheetRequest.Range["D3"].Text = "Lương chính";
            sheetRequest.Range["D3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["D3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E3:H3"].Merge(true);
            sheetRequest.Range["E3"].Text = "Phụ cấp";
            sheetRequest.Range["E3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["E3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E4"].Text = "Trách nhiệm";
            sheetRequest.Range["F4"].Text = "Ăn trưa";
            sheetRequest.Range["G4"].Text = "Điện thoại";
            sheetRequest.Range["H4"].Text = "Xăng xe";

            sheetRequest.Range["I3:I4"].Merge(true);
            sheetRequest.Range["I3"].Text = "Tổng thu nhập";
            sheetRequest.Range["I3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["J3:J4"].Merge(true);
            sheetRequest.Range["J3"].Text = "Ngày công";
            sheetRequest.Range["J3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["K3:K4"].Merge(true);
            sheetRequest.Range["K3"].Text = "Tổng lương thực tế";
            sheetRequest.Range["K3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["L3:L4"].Merge(true);
            sheetRequest.Range["L3"].Text = "Lương đóng BH";
            sheetRequest.Range["L3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["M3:Q3"].Merge(true);
            sheetRequest.Range["M3"].Text = "Trích vào Chi phí Doanh nghiệp";
            sheetRequest.Range["M3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["M3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["M4"].Text = "KPCĐ(2%)";
            sheetRequest.Range["N4"].Text = "BHXH(17,5%)";
            sheetRequest.Range["O4"].Text = "BHYT(3%)";
            sheetRequest.Range["P4"].Text = "BHTN(1%)";
            sheetRequest.Range["Q4"].Text = "Cộng(23,5%)";
            sheetRequest.Range["Q4"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R3:U3"].Merge(true);
            sheetRequest.Range["R3"].Text = "Trích vào Lương nhân viên";
            sheetRequest.Range["R3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["R3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["R4"].Text = "BHXH(8%)";
            sheetRequest.Range["S4"].Text = "BHYT(1,5%)";
            sheetRequest.Range["T4"].Text = "BHTN(1%)";
            sheetRequest.Range["U4"].Text = "Cộng(10,5%)";
            sheetRequest.Range["U4"].CellStyle.Font.Bold = true;

            sheetRequest.Range["V3:V4"].Merge(true);
            sheetRequest.Range["V3"].Text = "Thuế TNCN";
            sheetRequest.Range["V3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["W3:W4"].Merge(true);
            sheetRequest.Range["W3"].Text = "Tạm ứng";
            sheetRequest.Range["W3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["X3:X4"].Merge(true);
            sheetRequest.Range["X3"].Text = "Thực lĩnh";
            sheetRequest.Range["X3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["Y3:Y4"].Merge(true);
            sheetRequest.Range["Y3"].Text = "Ghi chú";
            sheetRequest.Range["Y3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C5"].Text = "1";
            sheetRequest.Range["C5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["D5"].Text = "2";
            sheetRequest.Range["D5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["E5"].Text = "3";
            sheetRequest.Range["E5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["F5"].Text = "4";
            sheetRequest.Range["F5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["G5"].Text = "5";
            sheetRequest.Range["G5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["H5"].Text = "6";
            sheetRequest.Range["H5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["I5"].Text = "7";
            sheetRequest.Range["I5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["J5"].Text = "8";
            sheetRequest.Range["J5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["K5"].Text = "9";
            sheetRequest.Range["K5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["L5"].Text = "10";
            sheetRequest.Range["L5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["M5"].Text = "11";
            sheetRequest.Range["M5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["N5"].Text = "12";
            sheetRequest.Range["N5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["O5"].Text = "13";
            sheetRequest.Range["O5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["P5"].Text = "14";
            sheetRequest.Range["P5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["Q5"].Text = "15";
            sheetRequest.Range["Q5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["R5"].Text = "16";
            sheetRequest.Range["R5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["S5"].Text = "17";
            sheetRequest.Range["S5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["T5"].Text = "18";
            sheetRequest.Range["T5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["U5"].Text = "19";
            sheetRequest.Range["U5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["V5"].Text = "20";
            sheetRequest.Range["V5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["W5"].Text = "21";
            sheetRequest.Range["W5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["X5"].Text = "22";
            sheetRequest.Range["X5"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            //tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 165, 215, 213);
            //sheetRequest.Range["A3: Y5"].CellStyle.Color = Color.FromArgb(0, 166, 247, 204);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["A3:Y5"].CellStyle = tableHeader;

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Bảng lương" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
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
    public class SalaryTotal
    {
        public DateTime? Date { get; set; }
        public int NumberUserLate { get; set; }
        public int NumberUserNoWork { get; set; }
        public int NumberUserWork { get; set; }
        public bool UserLate { get; set; }
        public bool NoWork { get; set; }
        public bool UserWork { get; set; }
        public double TimeWork { get; set; }
    }
    public class StatisticalTotal
    {
        public DateTime? Date { get; set; }
        public int CountRegistration { get; set; }
        public int CountLate { get; set; }
        public int CountReal { get; set; }
    }
    public class ViewTotal
    {
        public string FullName { get; set; }
        public string Department { get; set; }
        public string Status { get; set; }
        public string ActionTime { get; set; }
        public string LocationText { get; set; }
        public string ChkInTime { get; set; }
        public string ChkinLocationTxt { get; set; }
        public string ChkOutTime { get; set; }
        public string ChkoutLocationTxt { get; set; }
        public string Morning { get; set; }
        public string Afternoon { get; set; }
        public string Evening { get; set; }
        public string UserId { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
    }
}