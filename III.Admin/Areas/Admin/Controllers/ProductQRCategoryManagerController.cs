using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductQRCategoryManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ProductQRCodeManagerController> _stringLocalizer;
        private readonly IStringLocalizer<EDMSQRCodeManagerController> _stringLocalizerQRCODE;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ProductQRCategoryManagerController(EIMDBContext context, IStringLocalizer<ProductQRCodeManagerController> stringLocalizer, IStringLocalizer<EDMSQRCodeManagerController> stringLocalizerQRCODE, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerQRCODE = stringLocalizerQRCODE;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbQrManage", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbQrManage"] = "Quản lý QR Code danh mục sp";
            return View();
        }
    }
}