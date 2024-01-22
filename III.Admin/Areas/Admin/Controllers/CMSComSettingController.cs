using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbCmsCommon", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbCmsCommon"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
            return View();
        }
    }
}