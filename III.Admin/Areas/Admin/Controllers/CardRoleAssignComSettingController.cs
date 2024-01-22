using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CardRoleAssignComSettingController : BaseController
    {
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CardRoleAssignComSettingController(IStringLocalizer<SharedResources> sharedResources)
        {
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbCardRoleAssign", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbCardRoleAssign"] = _sharedResources["COM_CRUMB_CARD_ROLE_ASSIGN"];
            return View();
        }
    }
}