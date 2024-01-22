using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProjectComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ProjectComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbProjComm", AreaName = "Admin", FromAction = "Index", FromController = typeof(ProjectHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbProjectHome"] = _sharedResources["COM_CRUMB_PROJECT_HOME"];
            ViewData["CrumbProjComm"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
            return View();
        }
    }
}