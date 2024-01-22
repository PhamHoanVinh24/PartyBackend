using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
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
    public class ProductAttributeQRCodeController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ProductAttributeQRCodeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ProductAttributeQRCodeController(EIMDBContext context, IStringLocalizer<ProductAttributeQRCodeController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbQrCodeAttr", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbQrCodeAttr"] = _sharedResources["COM_CRUMB_PROD_ATTR_QRCODE"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query1 = from a in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                         join b in _context.Users on a.CreatedBy equals b.UserName into b1
                         from b in b1.DefaultIfEmpty()

                         where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && (a.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || a.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                             && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                             && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                         orderby a.Id descending
                         select new ProductQrCodeRes
                         {
                             Id = a.Id,
                             Code = a.ProductCode,
                             QrCode = a.ProductCode,
                             Count = 0,
                             CreatedBy = (b != null ? b.GivenName : ""),
                             CreatedTime = a.CreatedTime,
                             ProductName = a.ProductName
                         };
            var query2 = from a in _context.SubProducts.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.CreatedBy equals b.UserName into b1
                         from b in b1.DefaultIfEmpty()

                         where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && (a.AttributeCode.ToLower().Contains(jTablePara.Product.ToLower()) || a.AttributeName.ToLower().Contains(jTablePara.Product.ToLower()))))
                             && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                             && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                         orderby a.Id descending
                         select new ProductQrCodeRes
                         {
                             Id = a.Id,
                             Code = a.AttributeCode,
                             QrCode = a.ProductQrCode,
                             Count = 0,
                             CreatedBy = (b != null ? b.GivenName : ""),
                             CreatedTime = a.CreatedTime,
                             ProductName = a.AttributeName
                         };

            var query = query1.Concat(query2);
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "QrCode", "QR_Code", "Count", "CreatedBy", "CreatedTime", "ProductName");
            return Json(jdata);
        }

        [HttpPost]
        public object GetListQrCodeBySearch([FromBody]JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query1 = from a in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                         join b in _context.Users on a.CreatedBy equals b.UserName into b1
                         from b in b1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && (a.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || a.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                                && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                         orderby a.Id descending
                         select new ProductQrCodeRes
                         {
                             Id = a.Id,
                             Code = "",
                             QrCode = a.ProductCode,
                             Count = 0,
                             CreatedBy = (b != null ? b.GivenName : ""),
                             CreatedTime = a.CreatedTime,
                             ProductName = a.ProductName
                         };
            var query2 = from a in _context.SubProducts.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.CreatedBy equals b.UserName into b1
                         from b in b1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && (a.AttributeCode.ToLower().Contains(jTablePara.Product.ToLower()) || a.AttributeName.ToLower().Contains(jTablePara.Product.ToLower()))))
                                && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                         orderby a.Id descending
                         select new ProductQrCodeRes
                         {
                             Id = a.Id,
                             Code = "",
                             QrCode = a.ProductQrCode,
                             Count = 0,
                             CreatedBy = (b != null ? b.GivenName : ""),
                             CreatedTime = a.CreatedTime,
                             ProductName = a.AttributeName
                         };

            var query = query1.Concat(query2);
            var data = query.AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetLotProduct()
        {
            var data = from a in _context.LotProducts
                       where a.IsDeleted == false
                       select new
                       {
                           Code = a.LotProductCode,
                           Name = a.LotProductName
                       };
            return Json(data.ToList());
        }
        [HttpPost]
        public JsonResult GetImp()
        {
            var data = from a in _context.ProdReceivedHeaders
                       where a.IsDeleted == false
                       select new
                       {
                           Code = a.TicketCode,
                           Name = a.Title
                       };
            return Json(data.ToList());
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}