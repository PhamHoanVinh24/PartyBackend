using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialStoreController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        public MaterialStoreController(EIMDBContext context, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms)
        {
            _sharedResources = sharedResources;
             _context = context;
            _stringLocalizerEdms = stringLocalizerEdms;
        }
        [Breadcrumb("ViewData.CrumbMaterialStore", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbMaterialStore"] = _sharedResources["COM_CRUMB_EDMS_WAREHOUSE_CAT"];
            return View();
        }
    }

}