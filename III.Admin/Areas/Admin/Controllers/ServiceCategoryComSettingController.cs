using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ServiceCategoryComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ServiceCategoryComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        //[Breadcrumb("ViewData.CrumbSvCatCommon", AreaName = "Admin", FromAction = "Index", FromController = typeof(ServiceHomeController))]
        //public IActionResult Index()
        //{
        //    ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
        //    ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
        //    ViewData["CrumbServiceHome"] = _sharedResources["COM_CRUMB_SV_HOME"];
        //    ViewData["CrumbSvCatCommon"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
        //    return View();
        //}
    }
}