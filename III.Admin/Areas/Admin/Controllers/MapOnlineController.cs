using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using III.Domain.Enums;
using System.Globalization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MapOnlineController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<MapOnlineController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public MapOnlineController(EIMDBContext context, IStringLocalizer<MapOnlineController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object GetStaffKeeping([FromBody]SearchMap search)
        {
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(search.FromDate) ? DateTime.ParseExact(search.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(search.ToDate) ? DateTime.ParseExact(search.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //if(fromDate == null && toDate == null) {
            //    fromDate = today;
            //    toDate = today;
            //}

            var data = (from a in _context.ShiftLogs
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        where ((fromDate == null) || (a.ChkinTime.Value.Date >= fromDate.Value.Date))
                         && ((toDate == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : today.Date) <= toDate.Value.Date))
                         && (string.IsNullOrEmpty(search.UserName) || a.CreatedBy.Equals(search.UserName))
                        select new
                        {
                            a.Id,
                            EmployCode = b.EmployeeCode != null ? b.EmployeeCode : "Chưa có mã",
                            b.GivenName,
                            LocationGPS = a.ChkinLocationGps,
                            b.Gender,
                            b.PhoneNumber,
                            b.Email,
                            TimeIn = a.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            TimeOut = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy") : "",
                            Action = a.ChkoutTime.HasValue ? "OUT" : "IN",
                            a.ShiftCode,
                            ListRoleGroup = (from d in _context.Roles
                                             join e in _context.AdUserInGroups on d.Id equals e.RoleId into e1
                                             from e2 in e1.DefaultIfEmpty()
                                             where e2.IsDeleted == false && e2.UserId.Equals(b.Id)
                                             select new
                                             {
                                                 RoleCode = d.Code,
                                                 RoleName = d.Title
                                             }).DistinctBy(k => k.RoleCode),
                            a.CreatedBy
                        }).GroupBy(x => x.CreatedBy);
            var query = data.Select(x => x.LastOrDefault());
            var countUser = _context.Users.Where(x => x.Active);

            return new
            {
                ListIn = query,
                UserActive = countUser.Count()
            };
        }

        [HttpPost]
        public JsonResult GetRouteInOut([FromBody]SearchMap search)
        {
            var today = DateTime.Now;
            var fromDate = !string.IsNullOrEmpty(search.FromDate) ? DateTime.ParseExact(search.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(search.ToDate) ? DateTime.ParseExact(search.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            List<ResumRouteInOut> resum = new List<ResumRouteInOut>();
            var data = from a in _context.ShiftLogs
                       where ((fromDate == null) || (a.ChkinTime.Value.Date >= fromDate.Value.Date))
                         && ((toDate == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : today.Date) <= toDate.Value.Date))
                       && (string.IsNullOrEmpty(search.UserName) || a.CreatedBy.Equals(search.UserName))
                       group a by a.CreatedBy into g
                       select g;
            foreach (var item in data)
            {
                var shifts = item.ToList();
                List<RouteInOut> routes = new List<RouteInOut>();
                foreach (var shif in shifts)
                {
                    if (shif.ChkinTime.HasValue)
                    {
                        var routeInOut = new RouteInOut
                        {
                            Action = "In",
                            Address = shif.ChkinLocationTxt,
                            Time = shif.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            LatLng = shif.ChkinLocationGps
                        };
                        routes.Add(routeInOut);
                    }
                    if (shif.ChkoutTime.HasValue)
                    {
                        var routeInOut = new RouteInOut
                        {
                            Action = "Out",
                            Address = shif.ChkoutLocationTxt,
                            Time = shif.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            LatLng = shif.ChkoutLocationGps
                        };
                        routes.Add(routeInOut);
                    }
                }
                var resumRoute = new ResumRouteInOut
                {
                    UserName = item.Key,
                    RouteInOuts = routes
                };
                resum.Add(resumRoute);
            }
            return Json(resum);
        }

        [HttpPost]
        public object StatiscalEmployee()
        {
            var lstEmp = new List<StatisCalEmp>();
            var lstEmpTemp = new List<StatisCalEmp>();
            var toDay = DateTime.Now;
            var checkInToDay = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == toDay.Date && !x.ChkoutTime.HasValue);
            var lateToDay = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals("GOLATE") && x.ActionTime.Date == toDay.Date);
            var notWorkToDay = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals("NOT_WORK")
                                && x.ActionTime < toDay && x.ActionTo > toDay);
            foreach (var item in checkInToDay)
            {
                var usr = _context.Users.FirstOrDefault(x => x.UserName.Equals(item.CreatedBy));
                var emp = new StatisCalEmp
                {
                    FullName = usr.GivenName ?? "",
                    UserId = usr.Id ?? "",
                    ChkInTime = item.ChkinTime.Value.ToString("HH:mm dd/MM/yyyy"),
                    PhoneNum = usr.PhoneNumber,
                    DepartmentName = !string.IsNullOrEmpty(usr.DepartmentId) ? _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(usr.DepartmentId)).Title ?? "" : "",
                    Action = "",
                    ActionTo = "",
                    ActionTime = ""
                };
                lstEmp.Add(emp);
            }

            if (lstEmp.Count > 0)
            {
                foreach (var item in lstEmp)
                {
                    foreach (var late in lateToDay)
                    {
                        if (item.UserId.Equals(late.UserId))
                        {
                            item.Action = "GOLATE";
                            item.ActionTime = late.ActionTime.ToString("HH:mm dd/MM/yyyy");
                        }
                        else
                        {
                            var usr = _context.Users.FirstOrDefault(x => x.Id.Equals(late.UserId));
                            var emp = new StatisCalEmp
                            {
                                FullName = usr.GivenName ?? "",
                                UserId = usr.Id ?? "",
                                ChkInTime = "",
                                PhoneNum = usr.PhoneNumber,
                                DepartmentName = !string.IsNullOrEmpty(usr.DepartmentId) ? _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(usr.DepartmentId)).Title ?? "" : "",
                                Action = "GOLATE",
                                ActionTo = "",
                                ActionTime = late.ActionTime.ToString("HH:mm dd/MM/yyyy")
                            };
                            lstEmpTemp.Add(emp);
                        }
                    }
                }
            }
            else
            {
                foreach (var late in lateToDay)
                {
                    var usr = _context.Users.FirstOrDefault(x => x.Id.Equals(late.UserId));
                    var emp = new StatisCalEmp
                    {
                        FullName = usr.GivenName ?? "",
                        UserId = usr.Id ?? "",
                        ChkInTime = "",
                        PhoneNum = usr.PhoneNumber,
                        DepartmentName = !string.IsNullOrEmpty(usr.DepartmentId) ? _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(usr.DepartmentId)).Title ?? "" : "",
                        Action = "GOLATE",
                        ActionTo = "",
                        ActionTime = late.ActionTime.ToString("HH:mm dd/MM/yyyy")
                    };
                    lstEmp.Add(emp);
                }
            }
            lstEmp = lstEmp.Concat(lstEmpTemp).ToList();

            if (lstEmp.Count > 0)
            {
                foreach (var item in lstEmp)
                {
                    foreach (var noWork in notWorkToDay)
                    {
                        if (item.UserId.Equals(noWork.UserId))
                        {
                            item.Action = "NOT_WORK";
                            item.ActionTime = noWork.ActionTime.ToString("HH:mm dd/MM/yyyy");
                            item.ActionTo = noWork.ActionTo.Value.ToString("HH:mm dd/MM/yyyy");
                        }
                        else
                        {
                            var usr = _context.Users.FirstOrDefault(x => x.Id.Equals(noWork.UserId));
                            var emp = new StatisCalEmp
                            {
                                FullName = usr.GivenName ?? "",
                                UserId = usr.Id ?? "",
                                ChkInTime = "",
                                PhoneNum = usr.PhoneNumber,
                                DepartmentName = !string.IsNullOrEmpty(usr.DepartmentId) ? _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(usr.DepartmentId)).Title ?? "" : "",
                                Action = "NOT_WORK",
                                ActionTo = noWork.ActionTo.Value.ToString("HH:mm dd/MM/yyyy"),
                                ActionTime = noWork.ActionTime.ToString("HH:mm dd/MM/yyyy")
                            };
                            lstEmpTemp.Add(emp);
                        }
                    }
                }
            }
            else
            {
                foreach (var noWork in notWorkToDay)
                {
                    var usr = _context.Users.FirstOrDefault(x => x.Id.Equals(noWork.UserId));
                    var emp = new StatisCalEmp
                    {
                        FullName = usr.GivenName ?? "",
                        UserId = usr.Id ?? "",
                        ChkInTime = "",
                        PhoneNum = usr.PhoneNumber,
                        DepartmentName = !string.IsNullOrEmpty(usr.DepartmentId) ? _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(usr.DepartmentId)).Title ?? "" : "",
                        Action = "NOT_WORK",
                        ActionTo = noWork.ActionTo.Value.ToString("HH:mm dd/MM/yyyy"),
                        ActionTime = noWork.ActionTime.ToString("HH:mm dd/MM/yyyy")
                    };
                    lstEmpTemp.Add(emp);
                }
            }
            lstEmp = lstEmp.Concat(lstEmpTemp).ToList();

            return new
            {
                LstEmp = lstEmp.DistinctBy(x => x.UserId),
                AllEmp = lstEmp.DistinctBy(x => x.UserId).Count(),
                CheckIn = lstEmp.DistinctBy(x => x.UserId).Where(x => x.ChkInTime != "").Count(),
                Late = lstEmp.DistinctBy(x => x.UserId).Where(x => x.Action == "GOLATE").Count(),
                NotWork = lstEmp.DistinctBy(x => x.UserId).Where(x => x.Action == "NOT_WORK").Count(),
            };
        }

        [HttpPost]
        public object StaffKeeping(string fromDate, string toDate, string department, string branch, string userName)
        {
            var toDay = DateTime.Now;
            var fromDay = toDay;
            var toDateTime = toDay;

            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
            {
                fromDay = DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                toDateTime = DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            }

            var shifts = (from a in _context.ShiftLogs
                          join b in _context.Users on a.CreatedBy equals b.UserName
                          join c in _context.UserRoles on b.Id equals c.UserId into c1
                          from c in c1.DefaultIfEmpty()
                          join d in _context.Roles on c.RoleId equals d.Id into d1
                          from d in d1.DefaultIfEmpty()
                          where (string.IsNullOrEmpty(department) || b.DepartmentId.Equals(department))
                          && (string.IsNullOrEmpty(branch) || b.BranchId.Equals(branch))
                          && (string.IsNullOrEmpty(userName) || a.CreatedBy.Equals(userName))
                          && (fromDay.Date >= a.ChkinTime.Value.Date)
                          && (toDateTime.Date <= a.ChkinTime.Value.Date)
                          select new StaffOnline
                          {
                              FullName = b.GivenName,
                              Status = "",
                              TimeAction = "",
                              TimeIn = a.ChkinTime.Value.ToString("HH:mm dd/MM/yyyy"),
                              TimeOut = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("HH:mm dd/MM/yyyy") : "",
                              Location = a.ChkoutTime.HasValue ? a.ChkoutLocationTxt : a.ChkinLocationTxt,
                              Registration = "",
                              UserName = b.UserName,
                              Date = a.ChkinTime.Value,
                              DateTo = (DateTime?)null,
                              InGPS = a.ChkinLocationGps,
                              OutGPS = !string.IsNullOrEmpty(a.ChkoutLocationGps) ? a.ChkoutLocationGps : "",
                              PhoneNumber = !string.IsNullOrEmpty(b.PhoneNumber) ? b.PhoneNumber : "",
                              RoleName = d != null ? d.Title : ""
                          }).ToList();
            var registrations = (from a in _context.StaffScheduleWorks.Where(x => !x.FlagDelete)
                                join b in _context.Users on a.MemberId equals b.Id
                                 join c in _context.UserRoles on b.Id equals c.UserId into c1
                                 from c in c1.DefaultIfEmpty()
                                 join d in _context.Roles on c.RoleId equals d.Id into d1
                                 from d in d1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(department) || b.DepartmentId.Equals(department))
                                && (string.IsNullOrEmpty(branch) || b.BranchId.Equals(branch))
                                && (string.IsNullOrEmpty(userName) || a.CreatedBy.Equals(userName))
                                && (fromDay.Date >= a.DatetimeEvent.Date)
                                && (toDateTime.Date <= a.DatetimeEvent.Date)
                                select new StaffOnline
                                {
                                    FullName = b.GivenName,
                                    Status = "",
                                    TimeAction = "",
                                    TimeIn = "",
                                    TimeOut = "",
                                    Location = "",
                                    Registration = "YES",
                                    UserName = b.UserName,
                                    Date = a.DatetimeEvent,
                                    DateTo = (DateTime?)null,
                                    InGPS = "",
                                    OutGPS = "",
                                    PhoneNumber = !string.IsNullOrEmpty(b.PhoneNumber) ? b.PhoneNumber : "",
                                    RoleName = d != null ? d.Title : ""
                                }).ToList();
            var goLates = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals("GOLATE"))
                          join b in _context.Users on a.UserId equals b.Id
                           join c in _context.UserRoles on b.Id equals c.UserId into c1
                           from c in c1.DefaultIfEmpty()
                           join d in _context.Roles on c.RoleId equals d.Id into d1
                           from d in d1.DefaultIfEmpty()
                           where (string.IsNullOrEmpty(department) || b.DepartmentId.Equals(department))
                                && (string.IsNullOrEmpty(branch) || b.BranchId.Equals(branch))
                                && (string.IsNullOrEmpty(userName) || a.CreatedBy.Equals(userName))
                                && (fromDay.Date >= a.ActionTime.Date)
                                && (toDateTime.Date <= a.ActionTime.Date)
                          select new StaffOnline
                          {
                              FullName = b.GivenName,
                              Status = "GOLATE",
                              TimeAction = a.ActionTime.ToString("HH:mm dd/MM/yyyy"),
                              TimeIn = "",
                              TimeOut = "",
                              Location = "",
                              Registration = "",
                              UserName = b.UserName,
                              Date = a.ActionTime,
                              DateTo = (DateTime?)null,
                              InGPS = "",
                              OutGPS = "",
                              PhoneNumber = !string.IsNullOrEmpty(b.PhoneNumber) ? b.PhoneNumber : "",
                              RoleName = d != null ? d.Title : ""
                          }).ToList();
            var noWorks = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals("NOT_WORK"))
                          join b in _context.Users on a.UserId equals b.Id
                           join c in _context.UserRoles on b.Id equals c.UserId into c1
                           from c in c1.DefaultIfEmpty()
                           join d in _context.Roles on c.RoleId equals d.Id into d1
                           from d in d1.DefaultIfEmpty()
                           where (string.IsNullOrEmpty(department) || b.DepartmentId.Equals(department))
                                && (string.IsNullOrEmpty(branch) || b.BranchId.Equals(branch))
                                && (string.IsNullOrEmpty(userName) || a.CreatedBy.Equals(userName))
                                && (fromDay.Date >= a.ActionTime.Date)
                                && (toDateTime.Date <= a.ActionTo.Value.Date)
                          select new StaffOnline
                          {
                              FullName = b.GivenName,
                              Status = "NOT_WORK",
                              TimeAction = a.ActionTime.ToString("HH:mm dd/MM/yyyy") + " - " + a.ActionTo.Value.ToString("HH:mm dd/MM/yyyy"),
                              TimeIn = "",
                              TimeOut = "",
                              Location = "",
                              Registration = "",
                              UserName = b.UserName,
                              Date = a.ActionTime,
                              DateTo = a.ActionTo,
                              InGPS = "",
                              OutGPS = "",
                              PhoneNumber = !string.IsNullOrEmpty(b.PhoneNumber) ? b.PhoneNumber : "",
                              RoleName = d != null ? d.Title : ""
                          }).ToList();

            var lstStaff = new List<StaffOnline>();
            var lstStaffTemp = new List<StaffOnline>();
            lstStaff.AddRange(shifts);
            lstStaffTemp.AddRange(shifts);

            foreach (var item in lstStaff)
            {
                if (registrations.Any(x => x.Date.Date == item.Date.Date && x.UserName.Equals(item.UserName))) {
                    item.Registration = "YES";
                    lstStaffTemp.Add(item);
                }
                else
                {
                    lstStaffTemp.Add(item);
                }
            }

            lstStaff.AddRange(lstStaffTemp);

            foreach (var item in lstStaff)
            {
                if (goLates.Any(x => x.Date.Date == item.Date.Date && x.UserName.Equals(item.UserName)))
                {
                    item.Status = "GOLATE";
                    item.TimeAction = goLates.FirstOrDefault(x => x.Date.Date == item.Date.Date && x.UserName.Equals(item.UserName)).TimeAction;
                    lstStaffTemp.Add(item);
                }
                else
                {
                    lstStaffTemp.Add(item);
                }
            }

            lstStaff.AddRange(lstStaffTemp);

            foreach (var item in lstStaff)
            {
                if (noWorks.Any(x => x.Date.Date == item.Date.Date && x.UserName.Equals(item.UserName)))
                {
                    item.Status = "NOT_WORK";
                    item.TimeAction = noWorks.FirstOrDefault(x => x.Date.Date == item.Date.Date && x.UserName.Equals(item.UserName)).TimeAction;
                    lstStaffTemp.Add(item);
                }
                else
                {
                    lstStaffTemp.Add(item);
                }
            }
            lstStaff.AddRange(lstStaffTemp);
            lstStaff = lstStaff.DistinctBy(x =>  new { x.UserName, x.TimeAction, x.TimeIn, x.TimeOut }).ToList();
            return lstStaff;
        }

        public class StaffOnline
        {
            public string FullName { get; set; }
            public string Status { get; set; }
            public string TimeAction { get; set; }
            public string TimeIn { get; set; }
            public string TimeOut { get; set; }
            public string Location { get; set; }
            public string Registration { get; set; }
            public string UserName { get; set; }
            public DateTime Date { get; set; }
            public DateTime? DateTo { get; set; }
            public string InGPS { get; set; }
            public string OutGPS { get; set; }
            public string PhoneNumber { get; set; }
            public string RoleName { get; set; }
        }
        public class RouteInOut
        {
            public string Action { get; set; }
            public string Address { get; set; }
            public string Time { get; set; }
            public string LatLng { get; set; }
        }
        public class ResumRouteInOut
        {
            public string UserName { get; set; }
            public List<RouteInOut> RouteInOuts { get; set; }
        }
        public class SearchMap
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserName { get; set; }
        }
        public class StatisCalEmp
        {
            public string ChkInTime { get; set; }
            public string Action { get; set; }
            public string ActionTime { get; set; }
            public string ActionTo { get; set; }
            public string FullName { get; set; }
            public string DepartmentName { get; set; }
            public string PhoneNum { get; set; }
            public string UserId { get; set; }
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
