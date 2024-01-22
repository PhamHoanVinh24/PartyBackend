using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Controllers;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Syncfusion.XlsIO;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReportStaticsPoSupController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        public static List<Progress> progress;

        public class JTableModelCustom : JTableModel
        {
            public string ProductCode { get; set; }
            public string ProductType { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Category { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string PoSupCode { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
        }

        private readonly IStringLocalizer<ReportStaticsPoSupController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ReportStaticsPoSupController(EIMDBContext context, IStringLocalizer<ReportStaticsPoSupController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        //{
        //    _context = context;
        //    _hostingEnvironment = hostingEnvironment;
        //    _appSettings = appSettings.Value;
        //}

        [Breadcrumb("ViewData.CrumbPoSup", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbPoSup"] = _sharedResources["COM_CRUMB_PO_SUP"];
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var queryRs = from a in _context.VReportStaticsPoSups
                              where (string.IsNullOrEmpty(jTablePara.Category) || a.Category.Equals(jTablePara.Category))
                                 && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                 && (string.IsNullOrEmpty(jTablePara.PoSupCode) || a.PoCode.Equals(jTablePara.PoSupCode) || a.HeaderCode.Equals(jTablePara.PoSupCode))
                                 && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode))
                                 && (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode))
                                 && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Equals(jTablePara.Type))
                                 && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                                 && (string.IsNullOrEmpty(jTablePara.ProductType) || a.ProductType.Equals(jTablePara.ProductType))
                                 && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                                 && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                              select new
                              {
                                  a.ProductCode,
                                  a.ProductName,
                                  a.ProductType,
                                  a.Cost,
                                  a.Quantity,
                                  a.QuantityNeedImpExp,
                                  a.CusCode,
                                  a.CusName,
                                  a.SupCode,
                                  a.SupName,
                                  a.CreatedTime,
                                  a.Category,
                                  a.CategoryName,
                                  a.Type,
                                  a.Unit,
                                  a.UnitName,
                                  a.HeaderCode,
                                  a.HeaderName,
                                  a.PoCode,
                                  a.PoName,
                                  CreatedTimeSale = a.Type.Equals("SALE_EXP") ? a.CreatedTime : (DateTime?)null,
                                  CreatedTimeBuy = a.Type.Equals("BUY_IMP") ? a.CreatedTime : (DateTime?)null
                              };

                var count = queryRs.Count();
                var data = queryRs.OrderUsingSortExpression(jTablePara.QueryOrderBy).ThenBy("Type").ThenByDescending("CreatedTime").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ProductCode", "ProductName", "ProductType", "Cost", "Quantity", "QuantityNeedImpExp", "CusCode", "CusName", "SupCode", "SupName", "Unit", "UnitName", "Category", "CategoryName", "Type", "CreatedTimeSale", "CreatedTimeBuy", "CreatedTime", "HeaderCode", "HeaderName", "PoCode", "PoName");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public object GetTotalPoSup([FromBody]JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var queryRs = (from a in _context.VReportStaticsPoSups
                               where (string.IsNullOrEmpty(jTablePara.Category) || a.Category.Equals(jTablePara.Category))
                                  && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                  && (string.IsNullOrEmpty(jTablePara.PoSupCode) || a.PoCode.Equals(jTablePara.PoSupCode) || a.HeaderCode.Equals(jTablePara.PoSupCode))
                                  && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode))
                                  && (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode))
                                  && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Equals(jTablePara.Type))
                                  && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                                  && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                                  && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                               select new
                               {
                                   a.ProductCode,
                                   a.ProductName,
                                   a.ProductType,
                                   a.Cost,
                                   a.Quantity,
                                   a.QuantityNeedImpExp,
                                   a.CusCode,
                                   a.CusName,
                                   a.SupCode,
                                   a.SupName,
                                   a.CreatedTime,
                                   a.Category,
                                   a.CategoryName,
                                   a.Type,
                                   a.Unit,
                                   a.UnitName,
                                   a.HeaderCode,
                                   a.HeaderName,
                                   a.PoCode,
                                   a.PoName,
                                   Total = a.Cost * a.Quantity,
                                   CreatedTimeSale = a.Type.Equals("SALE_EXP") ? a.CreatedTime : (DateTime?)null,
                                   CreatedTimeBuy = a.Type.Equals("BUY_IMP") ? a.CreatedTime : (DateTime?)null
                               }).ToList();

                var total = new
                {
                    costTotal = queryRs.Sum(x => x.Cost),
                    quantityTotal = queryRs.Sum(x => x.Quantity),
                    total = queryRs.Sum(x => x.Total)
                };

                return Json(total);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public object GetListProduct()
        {
            var rs = from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         Code = b.ProductQrCode,
                         Name = b.AttributeName,
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm: {0}", b.ProductName),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                      };

            return rs1.Concat(rs);
        }

        [HttpPost]
        public object GetListContract()
        {
            //var listSale = _context.PoSaleHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ContractCode)).Select(x => new
            //{
            //    Code = x.ContractCode,
            //    Name = x.Title
            //}).ToList();

            //var listSaleRetail =_context.ProdDeliveryHeaders.Where(x => !x.IsDeleted).Select(x => new
            //{
            //    Code = x.TicketCode,
            //    Name = x.Title
            //}).ToList();

            var listBuyPo = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PoSupCode)).OrderByDescending(x => x.Id).Select(x => new
            {
                Code = x.PoSupCode,
                Name = x.PoSupCode//Bỏ trường tiêu đề nên lấy trường code để hiển thị
            }).ToList();

            //var listBuyRetail = _context.ProdReceivedHeaders.Where(x => !x.IsDeleted).Select(x => new
            //{
            //    Code = x.TicketCode,
            //    Name = x.Title
            //}).ToList();

            var query = listBuyPo;

            return query;
        }

        [HttpPost]
        public object GetListCustommer()
        {
            var query = _context.Customerss.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.CusCode,
                Name = x.CusName
            }).ToList();

            return query;
        }

        [HttpPost]
        public object GetListSupplier()
        {
            var query = _context.Suppliers.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.SupCode,
                Name = x.SupName
            }).ToList();

            return query;
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