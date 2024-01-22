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
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    [Route("Admin/WorkFlowHome")]
    public class WorkFlowHomeController : BaseController
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
        private readonly IStringLocalizer<WorkFlowHomeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        //var session = HttpContext.GetSessionUser();

        public WorkFlowHomeController(IOptions<AppSettings> appSettings, EIMDBContext context, 
            UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, 
            IActionLogService actionLog, IHostingEnvironment hostingEnvironment, 
            IUploadService uploadService, IFCMPushNotification notification, 
            IGoogleApiService googleAPI, IStringLocalizer<WorkFlowHomeController> stringLocalizer,
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
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(CardWorkHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCardWorkHome"] = _sharedResources["COM_CRUMB_CARD_WORK_HOME"];
            ViewData["CrumbRptCardjob"] = _sharedResources["COM_CRUMB_REPORT_CARDJOB"];
            ViewData["Title"] = _sharedResources["COM_CRUMB_WF_HOME"];
            return View();
        }
        #region Language
        //[HttpGet]
        //public IActionResult Translation(string lang)
        //{
        //    var resourceObject = new JObject();
        //    var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
        //        .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
        //    foreach (var item in query)
        //    {
        //        resourceObject.Add(item.Name, item.Value);
        //    }
        //    return Ok(resourceObject);
        //}
        #endregion

    }
}
