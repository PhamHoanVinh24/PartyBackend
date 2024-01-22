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

namespace III.Admin.Controllers
{
    public class DepartmentAppController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        //private readonly PackageDbContext _packageContext;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;

        //var session = HttpContext.GetSessionUser();

        public DepartmentAppController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
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
        }

        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public object GetBranAndDepartment()
        {
            var orgs = _context.AdOrganizations.Where(x => x.IsEnabled);
            var lstOrg = new List<OrgModel>();
            var lstDpts = new List<DepartmentModel>();
            foreach (var item in orgs)
            {
                var orgModel = new OrgModel
                {
                    Code = item.OrgAddonCode,
                    Name = item.OrgName,
                    Total = 0,
                    Late = 0,
                    OffWork = 0,
                    CheckIn = 0
                };
                foreach (var k in lstOrg)
                {
                    var tuple = GetActOrg(k.Code);
                    k.Total = tuple.Item4;
                    k.Late = tuple.Item2;
                    k.CheckIn = tuple.Item1;
                    k.OffWork = tuple.Item3;
                }
                lstOrg.Add(orgModel);

                if (!string.IsNullOrEmpty(item.DepartmentCode))
                {
                    var lstDpt = item.DepartmentCode.Split(",", StringSplitOptions.None);

                    var data = (from a in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled)
                                join b in lstDpt on a.DepartmentCode equals b
                                select new DepartmentModel
                                {
                                    Code = a.DepartmentCode,
                                    Name = a.Title,
                                    IdSvg = item.OrgAddonCode + "_" + a.DepartmentCode,
                                    OrgCode = item.OrgAddonCode,
                                    Total = 0,
                                    Late = 0,
                                    OffWork = 0,
                                    CheckIn = 0

                                }).ToList();
                    foreach (var k in data)
                    {
                        var tuple = GetActivityEmp(k.Code, item.OrgAddonCode);
                        k.Total = tuple.Item4;
                        k.Late = tuple.Item2;
                        k.CheckIn = tuple.Item1;
                        k.OffWork = tuple.Item3;
                    }
                    lstDpts.AddRange(data);
                }
            }
            return new
            {
                LstOrg = lstOrg,
                LstDepartment = lstDpts
            };
        }

        [NonAction]
        public Tuple<int, int, int, int> GetActivityEmp(string dpt, string branch)
        {
            var countCheckIn = from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == DateTime.Now.Date && !x.ChkoutTime.HasValue)
                               join b in _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch) on a.CreatedBy equals b.UserName
                               select new
                               {
                                   a.Id,
                                   a.CreatedBy
                               };
            var countLate = from c in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "GOLATE" && x.ActionTime.Date == DateTime.Now.Date)
                            join d in _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch) on c.UserId equals d.Id
                            select new
                            {
                                c.Id,
                                c.CreatedBy
                            };
            var countOff = from e in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "NOT_WORK" && x.ActionTime.Date <= DateTime.Now.Date
                && x.ActionTo.Value.Date >= DateTime.Now.Date)
                           join f in _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch) on e.UserId equals f.Id
                           select new
                           {
                               e.Id,
                               e.CreatedBy
                           };
            var userOfDepartment = _context.Users.Where(x => x.DepartmentId == dpt && x.BranchId == branch);
            return new Tuple<int, int, int, int>(countCheckIn.Count(), countLate.Count(), countOff.Count(), userOfDepartment.Count());
        }

        [NonAction]
        public Tuple<int, int, int, int> GetActOrg(string branch)
        {
            var countCheckIn = from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == DateTime.Now.Date && !x.ChkoutTime.HasValue)
                               join b in _context.Users.Where(x => x.BranchId == branch) on a.CreatedBy equals b.UserName
                               select new
                               {
                                   a.Id,
                                   a.CreatedBy
                               };
            var countLate = from c in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "GOLATE" && x.ActionTime.Date == DateTime.Now.Date)
                            join d in _context.Users.Where(x => x.BranchId == branch) on c.UserId equals d.Id
                            select new
                            {
                                c.Id,
                                c.CreatedBy
                            };
            var countOff = from e in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "NOT_WORK" && x.ActionTime.Date <= DateTime.Now.Date
                && x.ActionTo.Value.Date >= DateTime.Now.Date)
                           join f in _context.Users.Where(x => x.BranchId == branch) on e.UserId equals f.Id
                           select new
                           {
                               e.Id,
                               e.CreatedBy
                           };
            var userOfOrg = _context.Users.Where(x => x.BranchId == branch);
            return new Tuple<int, int, int, int>(countCheckIn.Count(), countLate.Count(), countOff.Count(), userOfOrg.Count());
        }

        public class OrgModel
        {
            public int Total { get; set; }
            public int Late { get; set; }
            public int OffWork { get; set; }
            public int CheckIn { get; set; }

            public string Code { get; set; }
            public string Name { get; set; }
        }

        public class DepartmentModel
        {
            public int Total { get; set; }
            public int Late { get; set; }
            public int OffWork { get; set; }
            public int CheckIn { get; set; }
            public string IdSvg { get; set; }
            public string OrgCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }
    }
}
