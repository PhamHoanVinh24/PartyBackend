using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    [Route("Admin/QrCodeHome")]
    public class QrCodeHomeController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public QrCodeHomeController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbQrCodeHome", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuStoreController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbQrCodeHome"] = _sharedResources["COM_BREAD_CRUMB_QR_CODE"];
            return View();
        }
    }
}
