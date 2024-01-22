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
    public class GroupUserAppController : Controller
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

        public GroupUserAppController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
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
        public object GetGroupUser()
        {
            var Group = _context.AdGroupUsers.Where(x => x.IsEnabled && !x.IsDeleted);
            var lstGroup = new List<GroupModel>();
            foreach (var item in Group)
            {
                var groupModel = new GroupModel
                {
                    Code = item.GroupUserCode,
                    Name = item.Title,
                    Total = 0,
                    Late = 0,
                    OffWork = 0,
                    CheckIn = 0
                };
                foreach (var k in lstGroup)
                {
                    var tuple = GetActGroup(k.Code);
                    k.Total = tuple.Item4;
                    k.Late = tuple.Item2;
                    k.CheckIn = tuple.Item1;
                    k.OffWork = tuple.Item3;

                }
                lstGroup.Add(groupModel);
            }
            return new
            {
                LstGroup = lstGroup,
            };
        }
        [NonAction]
        public Tuple<int, int, int, int> GetActGroup(string GroupCode)
        {
            var countCheckIn = from a in _context.ShiftLogs.Where(x => x.CreatedTime.Value.Date == DateTime.Now.Date && !x.ChkoutTime.HasValue)
                               join b in _context.Users on a.CreatedBy equals b.UserName
                               join c in _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted) on b.Id equals c.UserId
                               select new
                               {
                                   a.Id,
                                   a.CreatedBy
                               };
            var countLate = from d in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "GOLATE" && x.ActionTime.Date == DateTime.Now.Date)
                            join h in _context.Users on d.UserId equals h.Id
                            join e in _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted) on h.Id equals e.UserId
                            select new
                            {
                                d.Id,
                                d.CreatedBy
                            };
            var countOff = from f in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action == "NOT_WORK" && x.ActionTime.Date <= DateTime.Now.Date
                && x.ActionTo.Value.Date >= DateTime.Now.Date)
                           join h in _context.Users on f.UserId equals h.Id
                           join e in _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted) on h.Id equals e.UserId
                           select new
                           {
                               f.Id,
                               f.CreatedBy
                           };
            var userOfOrg = _context.AdUserInGroups.Where(x => x.GroupUserCode == GroupCode && !x.IsDeleted);
            return new Tuple<int, int, int, int>(countCheckIn.Count(), countLate.Count(), countOff.Count(), userOfOrg.Count());
        }




        public class GroupModel
        {
            public int Total { get; set; }
            public int Late { get; set; }
            public int OffWork { get; set; }
            public int CheckIn { get; set; }

            public string Code { get; set; }
            public string Name { get; set; }
        }

    }
}
