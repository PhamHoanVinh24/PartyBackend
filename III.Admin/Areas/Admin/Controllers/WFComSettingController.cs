using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WFComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public WFComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbWfComm", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuWfSystemController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuWfSystem"] = _sharedResources["COM_CRUMB_MENU_ACTIVITY"];
            ViewData["CrumbWfComm"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
            return View();
        }
    }
}