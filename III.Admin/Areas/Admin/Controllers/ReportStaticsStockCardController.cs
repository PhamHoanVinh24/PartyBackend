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
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReportStaticsStockCardController : BaseController
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
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Category { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
            public string StoreCode { get; set; }
        }

        private readonly IStringLocalizer<ReportStaticsStockCardController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ReportStaticsStockCardController(EIMDBContext context, IStringLocalizer<ReportStaticsStockCardController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
        [Breadcrumb("ViewData.CrumbStockCard", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbStockCard"] = _sharedResources["COM_CRUMB_STOCK_CARD"];
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody] JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                //var queryRs = from a in _context.VImpExpProducts
                //              where (string.IsNullOrEmpty(jTablePara.Category) || a.Category.Equals(jTablePara.Category))
                //                 && (string.IsNullOrEmpty(jTablePara.ContractCode) || a.PoCode.Equals(jTablePara.ContractCode) || a.HeaderCode.Equals(jTablePara.ContractCode))
                //                 && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode))
                //                 && (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode))
                //                 && (string.IsNullOrEmpty(jTablePara.StoreCode) || a.StoreCode.Equals(jTablePara.StoreCode))
                //                 && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Contains(jTablePara.Type))
                //                 && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                //                 && (string.IsNullOrEmpty(jTablePara.ProductType) || a.ProductType.Equals(jTablePara.ProductType))
                //                 && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                //                 && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                //              select new
                //              {
                //                  a.ProductCode,
                //                  a.ProductName,
                //                  a.ProductType,
                //                  a.Cost,
                //                  a.Quantity,
                //                  a.CreatedTime,
                //                  a.Type,
                //                  a.Unit,
                //                  a.UnitName,
                //                  a.HeaderCode,
                //                  a.HeaderName,
                //                  a.StoreCode,
                //                  a.StoreName,
                //                  a.QuantityInStore,
                //                  a.TotalQuantityByStore,
                //                  a.TotalQuantityInStore,
                //              };
                var queryImp = from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                               join b in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                               join c in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on b.StoreCode equals c.WHS_Code
                               //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on b.StoreCode equals c.ObjectCode
                               //join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals g.Code
                               join d in _context.CommonSettings.Where(x => !x.IsDeleted
                               && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))) on a.Unit equals d.CodeSet
                               into d1
                               from d in d1.DefaultIfEmpty()
                               join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode
                               //join g in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on b.StoreCode equals g.WHS_Code
                               where (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                               && (string.IsNullOrEmpty(jTablePara.StoreCode) || b.StoreCode.Equals(jTablePara.StoreCode))
                               select new Model
                               {
                                   ProductCode = a.ProductCode,
                                   ProductName = f.ProductName,
                                   ProductType = "",
                                   Quantity = a.Quantity,
                                   UnitName = d != null ? d.ValueSet : "",
                                   Unit = a.Unit,
                                   Type = "BUY_IMP",
                                   CreatedTime = DateTime.Now,
                                   HeaderCode = b.TicketCode,
                                   HeaderName = b.Title,
                                   PoCode = a.LotProductCode,
                                   StoreCode = b.StoreCode,
                                   StoreName = c.WHS_Name,
                                   TotalQuantityByStore = "",
                                   TotalQuantityInStore = "",
                               };

                var queryExp = from a in _context.ProductExportDetails.Where(x => !x.IsDeleted)
                               join b in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                               //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on b.StoreCode equals c.ObjectCode
                               //join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals g.Code
                               join d in _context.CommonSettings.Where(x => !x.IsDeleted
                               && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))) on a.Unit equals d.CodeSet
                               into d1
                               from d in d1.DefaultIfEmpty()
                               join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode
                               join g in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on b.StoreCode equals g.WHS_Code
                               where (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                              && (string.IsNullOrEmpty(jTablePara.StoreCode) || b.StoreCode.Equals(jTablePara.StoreCode))
                               select new Model
                               {
                                   ProductCode = a.ProductCode,
                                   ProductName = f.ProductName,
                                   ProductType = "",
                                   Quantity = a.Quantity,
                                   UnitName = d != null ? d.ValueSet : "",
                                   Unit = a.Unit,
                                   Type = "SALE_EXP",
                                   CreatedTime = DateTime.Now,
                                   HeaderCode = b.TicketCode,
                                   HeaderName = b.Title,
                                   PoCode = a.LotProductCode,
                                   StoreCode = b.StoreCode,
                                   StoreName = g.WHS_Name,
                                   TotalQuantityByStore = "",
                                   TotalQuantityInStore = "",
                               };
                var listImp = queryImp.ToList();
                var listExp = queryExp.ToList();
                var queryRs = listImp.Concat(listExp).ToList();

                foreach (var item in queryRs)
                {
                    item.TotalQuantityByStore = CalQuantityInStore(item.StoreCode, item.ProductCode);
                    item.TotalQuantityInStore = CalQuantityByProd(item.ProductCode);
                }
                var count = queryRs.Count();
                var data = queryRs.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ProductCode", "ProductName", "ProductType", "Cost",
                    "Quantity", "QuantityNeedImpExp", "CusCode", "CusName", "SupCode", "SupName", "Unit", "UnitName", "Category", "CategoryName",
                    "Type", "CreatedTimeSale", "CreatedTimeBuy", "CreatedTime", "HeaderCode", "HeaderName", "PoCode", "PoName", "StoreCode",
                    "StoreName", "QuantityInStore", "TotalQuantityByStore", "TotalQuantityInStore");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        public string CalQuantityInStore(string storeCode, string productCode)
        {
            var stock = "";
            var data = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode.Equals(storeCode) && x.ProductCode.Equals(productCode))
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))) on a.Unit equals b.CodeSet
                        select new
                        {
                            a.Unit,
                            a.Quantity,
                            UnitName = b.ValueSet,
                            a.ProductCode
                        }).GroupBy(x => new { x.Unit, x.ProductCode });
            foreach (var item in data)
            {
                stock += item.Sum(x => x.Quantity) + " " + item.First().UnitName + ", ";
            }
            return stock;
        }

        [NonAction]
        public string CalQuantityByProd(string productCode)
        {
            var stock = "";
            var data = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode.Equals(productCode))
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                        on a.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        select new
                        {
                            a.Unit,
                            a.Quantity,
                            UnitName = b != null ? b.ValueSet : "",
                            a.ProductCode
                        }).GroupBy(x => new { x.Unit, x.ProductCode });
            foreach (var item in data)
            {
                stock += item.Sum(x => x.Quantity) + " " + item.First().UnitName + ", ";
            }
            return stock;
        }

        [HttpPost]
        public object GetTotal([FromBody] JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                var query = (from a in _context.VImpExpProducts
                             where (string.IsNullOrEmpty(jTablePara.Category) || a.Category.Equals(jTablePara.Category))
                                && (string.IsNullOrEmpty(jTablePara.ContractCode) || a.PoCode.Equals(jTablePara.ContractCode) || a.HeaderCode.Equals(jTablePara.ContractCode))
                                && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode))
                                && (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode))
                                && (string.IsNullOrEmpty(jTablePara.StoreCode) || a.StoreCode.Equals(jTablePara.StoreCode))
                                && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Contains(jTablePara.Type))
                                && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                                && (string.IsNullOrEmpty(jTablePara.ProductType) || a.ProductType.Equals(jTablePara.ProductType))
                                && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                             select new
                             {
                                 a.ProductCode,
                                 a.ProductName,
                                 a.ProductType,
                                 a.StoreCode,
                                 a.Type,
                                 a.Cost,
                                 a.Quantity,
                                 a.QuantityInStore,
                                 a.TotalQuantityByStore,
                                 a.TotalQuantityInStore
                             }).ToList();
                var queryRs = new
                {
                    TotalCost = query.Sum(x => x.Cost),
                    TotalAmount = query.Sum(x => x.Cost * x.Quantity),
                    TotalQuantity = query.Where(k => k.Type == "BUY_IMP").Sum(i => i.Quantity) - query.Where(k => k.Type == "SALE_EXP").Sum(i => i.Quantity),
                    //TotalQuantityInStore = query.GroupBy(k => k.ProductCode).Select(m => new { m.First().TotalQuantityInStore, m.First().ProductCode }).Sum(h => h.TotalQuantityInStore)
                    TotalQuantityByStore = query.GroupBy(k => new { k.ProductCode, k.StoreCode }).Select(m => new { m.First().TotalQuantityByStore, m.First().ProductCode }).Sum(h => h.TotalQuantityByStore),
                    TotalQuantityInStore = query.GroupBy(k => new { k.ProductCode }).Select(m => new { m.First().TotalQuantityInStore, m.First().ProductCode }).Sum(h => h.TotalQuantityInStore),
                };

                return Json(queryRs);
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
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                     on b.Unit equals c.CodeSet into c1
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
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                      on b.Unit equals c.CodeSet into c1
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

            var listSaleRetail = _context.ProductExportHeaders.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }).ToList();

            //var listBuyPo= _context.PoBuyerHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PoSupCode)).Select(x => new
            //{
            //    Code = x.PoSupCode,
            //    Name = x.PoSupCode//Bỏ trường tiêu đề nên lấy trường code để hiển thị
            //}).ToList();

            var listBuyRetail = _context.ProductImportHeaders.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }).ToList();

            var query = listBuyRetail.Concat(listSaleRetail);

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

        [HttpPost]
        public object GetListStore()
        {
            var query = _context.EDMSWareHouses.Where(x => !x.WHS_Flag).Select(x => new
            {
                Code = x.WHS_Code,
                Name = x.WHS_Name
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

        public class Model
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string UnitName { get; set; }
            public string Unit { get; set; }
            public string Type { get; set; }
            public string HeaderCode { get; set; }
            public string HeaderName { get; set; }
            public string PoCode { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string TotalQuantityByStore { get; set; }
            public string TotalQuantityInStore { get; set; }
            public DateTime CreatedTime { get; set; }
            public decimal Quantity { get; set; }
        }
    }
}