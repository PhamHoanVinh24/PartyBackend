using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SmartBreadcrumbs.Attributes;
using Org.BouncyCastle.Crypto.Engines;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using III.Domain.Enums;
using System.Globalization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class KPIEmployeeController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;
        private readonly IStringLocalizer<KPIEmployeeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public KPIEmployeeController(IOptions<AppSettings> appSettings, EIMDBContext context,
            UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager,
            IActionLogService actionLog, IHostingEnvironment hostingEnvironment,
            IUploadService uploadService, IFCMPushNotification notification,
            IGoogleApiService googleAPI, IStringLocalizer<KPIEmployeeController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = uploadService;
            _notification = notification;
            _googleAPI = googleAPI;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbKpi", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]

        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbKpi"] = _sharedResources["COM_CRUMB_KPI"];
            return View();
        }

        public class KPIModel
        {
            public string DepartmentCode { get; set; }
            public string EmployeeCode { get; set; }
            public string StartTime { get; set; }
            public string EndTime { get; set; }
        }

        [HttpPost]
        public object GetKPIEmployee([FromBody] KPIModel obj)
        {
            try
            {
                var fromDate = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var listDateOff = GetHoliday();
                var timeMustWork = 0;

                var goLates = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted
                    && x.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate)));

                if (string.IsNullOrEmpty(obj.StartTime) && string.IsNullOrEmpty(obj.EndTime))
                {
                    var contracts = _context.HRContracts.Where(x => x.flag == 0 && x.Employee_Id.Equals(obj.EmployeeCode)).OrderByDescending(x => x.Created_Time);
                    if (contracts.Any())
                    {
                        var lastContract = contracts.FirstOrDefault();
                        timeMustWork = !string.IsNullOrEmpty(lastContract.Exp_time_work) ? Int32.Parse(lastContract.Exp_time_work) : 0;
                    }
                }
                else
                {
                    for (var date = fromDate; date < toDate; date = date.Value.AddDays(1))
                    {
                        if (!date.Value.DayOfWeek.Equals(DayOfWeek.Saturday) && !date.Value.DayOfWeek.Equals(DayOfWeek.Sunday))
                        {
                            if (listDateOff.Any(x => !x.ListDateOff.Any(p => p.Equals(date.Value.ToString("dd/MM"))) && x.DayOff > 0))
                            {
                                timeMustWork += 8;
                            }
                        }
                    }
                }

                var shiftLogs = (_context.ShiftLogs.Where(x => (string.IsNullOrEmpty(obj.StartTime) || x.ChkinTime >= fromDate)
                                                            && (string.IsNullOrEmpty(obj.EndTime) || x.ChkinTime <= toDate)
                                                            && (x.ChkinTime.Value.Hour >= 8 && x.ChkinTime.Value.Minute > 0)).GroupBy(p => new { p.ShiftCode, p.CreatedBy })
                                                        .Select(y => new
                                                        {
                                                            y.Key.CreatedBy,
                                                            y.FirstOrDefault().ChkinTime,
                                                            y.FirstOrDefault().ChkoutTime,
                                                        })).ToList();

                var data = from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                           join b in _context.Users on a.Id.ToString() equals b.EmployeeCode
                           join c in _context.HRContracts on a.Id equals c.Employee_Id into c1
                           from c in c1.DefaultIfEmpty()
                           select new
                           {
                               FullName = b.GivenName,
                               Postion = _context.Roles.FirstOrDefault(x => x.Id.Equals(a.position)).Title,
                               TimeMustWork = timeMustWork,
                               TimeWorkReal = shiftLogs.Where(x => x.CreatedBy == b.UserName).Sum(x => (x.ChkoutTime.Value.Hour - x.ChkinTime.Value.Hour)),

                               TimeWorkLate = shiftLogs.Where(x => x.CreatedBy == b.UserName).Sum(x => (x.ChkinTime.Value.Hour - 8)) + (decimal)shiftLogs.Where(x => x.CreatedBy == b.UserName).Sum(x => x.ChkinTime.Value.Minute) / 60,

                               TimeWorkNotwork = _context.WorkShiftCheckInOuts.Where(x => x.UserId == b.Id && x.Action == "NOT_WORK"
                                                  && (string.IsNullOrEmpty(obj.StartTime) || x.ActionTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.ActionTime <= toDate)).Count() * 8,

                               SumCardWork = _context.WORKOSCards.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Status)
                                                  && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status != "TRASH"
                                                  && (string.IsNullOrEmpty(obj.StartTime) || x.BeginTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.BeginTime <= toDate)).Count(),

                               SumCardWorkComp = _context.WORKOSCards.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Status)
                                                  && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id))
                                                  && x.Status == "DONE"
                                                  && (string.IsNullOrEmpty(obj.StartTime) || x.EndTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.EndTime <= toDate)).Count(),

                               SumCardWorkComDead = _context.WORKOSCards.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Status)
                                                  && (x.CreatedBy.Equals(b.UserName) || b.Id.Contains(x.LstUser))
                                                  && x.Status == "DONE"
                                                  && x.EndTime <= x.Deadline
                                                  && (string.IsNullOrEmpty(obj.StartTime) || x.EndTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.EndTime <= toDate)).Count(),

                               SumCardWorkComnotDead = _context.WORKOSCards.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Status)
                                                  && (x.CreatedBy.Equals(b.UserName) || b.Id.Contains(x.LstUser))
                                                  && x.Status == "DONE" && (x.EndTime > x.Deadline || x.Deadline < DateTime.Now)
                                                  && (string.IsNullOrEmpty(obj.StartTime) || x.EndTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.EndTime <= toDate)).Count(),

                               SumCardWorkCancel = _context.WORKOSCards.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Status)
                                                  && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id))
                                                  && x.Status == "CANCLED"
                                                  && (string.IsNullOrEmpty(obj.StartTime) || x.BeginTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.BeginTime <= toDate)).Count(),

                               SumCardWorkPending = _context.WORKOSCards.Where(x => !x.IsDeleted
                                                  && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id))
                                                  && x.Status == "START" && (string.IsNullOrEmpty(obj.StartTime) || x.BeginTime >= fromDate)
                                                  && (string.IsNullOrEmpty(obj.EndTime) || x.BeginTime <= toDate)).Count(),
                           };

                return data;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpPost]
        public object SearchChartKPI([FromBody] KPIModel obj)
        {
            try
            {
                var fromDate = !string.IsNullOrEmpty(obj.StartTime) ? DateTime.ParseExact(obj.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.EndTime) ? DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var data = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                            join b in _context.Users on a.Id.ToString() equals b.EmployeeCode
                            join d in _context.ShiftLogs.Where(x => (string.IsNullOrEmpty(obj.StartTime) || x.CreatedTime >= fromDate)
                                      && (string.IsNullOrEmpty(obj.EndTime) || x.CreatedTime <= toDate)) on b.UserName equals d.CreatedBy
                            select new
                            {
                                Month = d.CreatedTime.Value.Month,
                                UserName = b.UserName,
                                UserId = b.Id,
                                TimeWorked = Convert.ToInt32(d.ChkoutTime.Value.Hour - d.ChkinTime.Value.Hour),
                            });
                var data1 = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                             join b in _context.Users on a.Id.ToString() equals b.EmployeeCode
                             join e in _context.WorkShiftCheckInOuts.Where(x => x.Action == "GOLATE"
                                                                   && (string.IsNullOrEmpty(obj.StartTime) || x.ActionTime >= fromDate)
                                                                   && (string.IsNullOrEmpty(obj.EndTime) || x.ActionTime <= toDate)) on b.Id equals e.UserId
                             select new
                             {
                                 Month = e.ActionTime.Month,
                                 TimeWorkLate = Convert.ToInt32(e.ActionTime.Hour - 8)
                             });


                var data2 = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                             join b in _context.Users on a.Id.ToString() equals b.EmployeeCode
                             join e in _context.WorkShiftCheckInOuts.Where(x => x.Action == "NOT_WORK"
                                                                   && (string.IsNullOrEmpty(obj.StartTime) || x.ActionTime >= fromDate)
                                                                   && (string.IsNullOrEmpty(obj.EndTime) || x.ActionTime <= toDate)) on b.Id equals e.UserId
                             select new
                             {
                                 Month = e.ActionTime.Month,
                                 TimeWorkNotwork = 8
                             });

                var data3 = (_context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH"))
                             .Select(p => new
                             {
                                 Month = p.CreatedDate.Month,
                             }).GroupBy(x => new { x.Month })
                             .Select(p => new
                             {
                                 Month = p.First().Month,
                                 SumCardWork = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                                                from b in _context.Users.Where(x => a.Id.ToString().Equals(x.EmployeeCode))
                                                from d in _context.WORKOSCards.Where(x => !x.IsDeleted
                                                    && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status != "TRASH" && !string.IsNullOrEmpty(x.Status)
                                                    && (string.IsNullOrEmpty(obj.StartTime) || x.BeginTime >= fromDate)
                                                    && (string.IsNullOrEmpty(obj.EndTime) || x.BeginTime <= toDate)
                                                    && x.CreatedDate.Month == p.First().Month)
                                                select new
                                                {
                                                    CardWorkCode = d.CardID
                                                }).Count(),
                                 SumCardWorkComp = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                                                    from b in _context.Users.Where(x => a.Id.ToString().Equals(x.EmployeeCode))
                                                    from d in _context.WORKOSCards.Where(x => !x.IsDeleted
                                                        && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status == "DONE"
                                                        && (string.IsNullOrEmpty(obj.StartTime) || x.EndTime >= fromDate)
                                                        && (string.IsNullOrEmpty(obj.EndTime) || x.EndTime <= toDate)
                                                        && x.CreatedDate.Month == p.First().Month)
                                                    select new
                                                    {
                                                        CardWorkCode = d.CardID
                                                    }).Count(),
                                 SumCardWorkComDead = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                                                       from b in _context.Users.Where(x => a.Id.ToString().Equals(x.EmployeeCode))
                                                       from d in _context.WORKOSCards.Where(x => !x.IsDeleted
                                                           && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status == "DONE" && x.EndTime <= x.Deadline
                                                           && (string.IsNullOrEmpty(obj.StartTime) || x.EndTime >= fromDate)
                                                           && (string.IsNullOrEmpty(obj.EndTime) || x.EndTime <= toDate)
                                                           && x.CreatedDate.Month == p.First().Month)
                                                       select new
                                                       {
                                                           CardWorkCode = d.CardID
                                                       }).Count(),
                                 SumCardWorkComnotDead = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                                                          from b in _context.Users.Where(x => a.Id.ToString().Equals(x.EmployeeCode))
                                                          from d in _context.WORKOSCards.Where(x => !x.IsDeleted
                                                              && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status == "DONE" && (x.EndTime > x.Deadline || x.Deadline < DateTime.Now)
                                                              && (string.IsNullOrEmpty(obj.StartTime) || x.EndTime >= fromDate)
                                                              && (string.IsNullOrEmpty(obj.EndTime) || x.EndTime <= toDate)
                                                              && x.CreatedDate.Month == p.First().Month)
                                                          select new
                                                          {
                                                              CardWorkCode = d.CardID
                                                          }).Count(),
                                 SumCardWorkCancel = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                                                      from b in _context.Users.Where(x => a.Id.ToString().Equals(x.EmployeeCode))
                                                      from d in _context.WORKOSCards.Where(x => !x.IsDeleted
                                                          && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status == "CANCLED"
                                                          && (string.IsNullOrEmpty(obj.StartTime) || x.BeginTime >= fromDate)
                                                          && (string.IsNullOrEmpty(obj.EndTime) || x.BeginTime <= toDate)
                                                          && x.CreatedDate.Month == p.First().Month)
                                                      select new
                                                      {
                                                          CardWorkCode = d.CardID
                                                      }).Count(),
                                 SumCardWorkPending = (from a in _context.HREmployees.Where(x => x.flag == 1 && x.Id == Convert.ToInt32(obj.EmployeeCode))
                                                       from b in _context.Users.Where(x => a.Id.ToString().Equals(x.EmployeeCode))
                                                       from d in _context.WORKOSCards.Where(x => !x.IsDeleted
                                                           && (x.CreatedBy.Equals(b.UserName) || x.LstUser.Contains(b.Id)) && x.Status == "START"
                                                           && (string.IsNullOrEmpty(obj.StartTime) || x.BeginTime >= fromDate)
                                                           && (string.IsNullOrEmpty(obj.EndTime) || x.BeginTime <= toDate)
                                                           && x.CreatedDate.Month == p.First().Month)
                                                       select new
                                                       {
                                                           CardWorkCode = d.CardID
                                                       }).Count(),

                             }).OrderBy(p => p.Month).ToList();

                var query = (from a in data
                             group a by a.Month
                            into g
                             from g1 in g
                             select new
                             {
                                 Month = g1.Month,
                                 UserName = g1.UserName,
                                 TimeWorkReal = g.Sum(x => x.TimeWorked)
                             }).DistinctBy(x => x.Month);
                return data3;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        [HttpPost]

        [HttpGet]
        public object GetEmployee(string code)
        {
            return (from a in _context.HREmployees.Where(x => x.flag == 1 && x.unit.Equals(code))
                    select new
                    {
                        Code = a.Id,
                        Name = a.fullname
                    }).DistinctBy(x => x.Code);
        }

        [NonAction]
        private List<DayOffMonth> GetHoliday()
        {
            var listDayOff = new List<DayOffMonth>();
            var lstHoliday = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeHoliday)));
            if (lstHoliday.Any())
            {
                foreach (var item in lstHoliday)
                {
                    if (item.ValueSet.Contains("/"))
                    {
                        var arr = item.ValueSet.Split("/", StringSplitOptions.None);
                        var monthHoliday = Convert.ToInt32(arr[1]);

                        var dayOff = listDayOff.FirstOrDefault(x => x.Month == monthHoliday);
                        if (dayOff != null)
                        {
                            dayOff.ListDateOff.Add(item.ValueSet);
                            dayOff.DayOff++;
                        }
                        else
                        {
                            var dayOffMonth = new DayOffMonth
                            {
                                Month = monthHoliday,
                                DayOff = 1,
                                ListDateOff = new List<string>
                           {
                               item.ValueSet
                           }
                            };
                            listDayOff.Add(dayOffMonth);
                        }
                    }
                }
            }
            return listDayOff;
        }

        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        public class DayOffMonth
        {
            public DayOffMonth()
            {
                ListDateOff = new List<string>();
            }
            public int Month { get; set; }
            public int DayOff { get; set; }
            public List<string> ListDateOff { get; set; }
        }
    }
}
