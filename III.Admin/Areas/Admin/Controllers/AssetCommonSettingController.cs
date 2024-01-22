using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetCommonSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AssetCommonSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbAssetCommon", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListAssetHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbAssetCommon"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
            return View();
        }
    }
}