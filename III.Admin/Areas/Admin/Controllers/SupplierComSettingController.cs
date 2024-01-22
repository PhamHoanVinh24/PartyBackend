using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SupplierComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public SupplierComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbSuppComm", AreaName = "Admin", FromAction = "Index", FromController = typeof(SupplierHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSuppHome"] = _sharedResources["COM_CRUMB_SUPP_HOME"];
            ViewData["CrumbSuppComm"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
            return View();
        }
    }
}