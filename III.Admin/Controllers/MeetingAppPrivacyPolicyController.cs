using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using III.Admin.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;
using System.IO;
using System.Globalization;

namespace III.Admin.Controllers
{
    public class MeetingAppPrivacyPolicyController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UserManualController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MeetingAppPrivacyPolicyController(EIMDBContext context, IStringLocalizer<UserManualController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        //[Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuSystemSettingController))]
        public IActionResult Index()
        {
            /*ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];*/
            ViewData["Title"] = /*_sharedResources["COM_CRUMB_USER_MANUAL"]*/ "Smartwork Meeting Privacy Policies";
            return View();
        }
        public IActionResult Confirm()
        {
            /*ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];*/
            //ViewData["Title"] = /*_sharedResources["COM_CRUMB_USER_MANUAL"]*/ "Smartwork Meeting Privacy Policies";
            return View();
        }
    }
}