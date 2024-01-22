using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public FundComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["Title"] = _sharedResources["COM_CRUMB_COMMON_SETTING"];
            return View();
        }
    }
}