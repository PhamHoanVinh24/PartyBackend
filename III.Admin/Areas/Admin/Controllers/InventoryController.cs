using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using ESEIM;
using Microsoft.AspNetCore.Authorization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class InventoryController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<InventoryController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelInventory : JTableModel
        {
            public string ProductCode { get; set; }
            public string GroupType { get; set; }
            public string StoreCode { get; set; }
            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string ProductQrCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string FloorCode { get; set; }
            public string LineCode { get; set; }
            public string RackCode { get; set; }
            public string MappingCode { get; set; }
            public string CreatedBy { get; set; }
            public string SupplierCode { get; set; }
            public string CusCode { get; set; }
        }
        public InventoryController(
            EIMDBContext context,
            IUploadService upload,
            IOptions<AppSettings> appSettings,
            IHostingEnvironment hostingEnvironment,
            IActionLogService actionLog,
            IStringLocalizer<InventoryController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<FilePluginController> stringLocalizerFp)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerFp = stringLocalizerFp;
        }

        [Breadcrumb("ViewData.CrumbInventory", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbSaleWHHome"] = _sharedResources["COM_CRUMB_SALE_WH"];
            ViewData["CrumbInventory"] = _sharedResources["COM_CRUMB_INVENTORY"];
            return View("Index");
        }

        [HttpPost]
        public JsonResult JTable([FromBody] JTableModelInventory jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = new List<InventoryRes>();
                switch (jTablePara.GroupType)
                {
                    case "FUEL":
                        query = FuncJTableFuel(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                        break;
                    case "BOTTLE":
                        query = FuncJTableBottleTank(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                        break;
                    case "STATIC_TANK":
                        query = FuncJTableBottleTank(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                        break;
                    default:
                        query = FuncJTableNormal(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode, jTablePara.CusCode);
                        break;
                }
                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "IdImpProduct", "IdMapping", "ProductCode", "MappingCode", "GattrFlatCode", "TicketTitle", "TimeTicketCreate", "ProductName", "StoreCode", "StoreName", "LotProductCode", "LotProductName", "QrCode", "sQrCode", "CreatedTime", "Unit", "ProductGroup", "ProductType", "Quantity", "Image", "PathImg", "UnitCode", "BottleCodeAll", "Weight", "ProductStatus");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<InventoryRes>(), jTablePara.Draw, 0, "Id", "IdImpProduct", "IdMapping", "ProductCode", "MappingCode", "GattrFlatCode", "TicketTitle", "TimeTicketCreate", "ProductName", "StoreCode", "StoreName", "LotProductCode", "LotProductName", "QrCode", "sQrCode", "CreatedTime", "Unit", "ProductGroup", "ProductType", "Quantity", "Image", "PathImg", "UnitCode", "BottleCodeAll", "Weight", "ProductStatus");
                return Json(jdata);
            }
        }

        [NonAction]
        public List<InventoryRes> FuncJTableNormal(string productCode, string storeCode, string lotProductCode,
            string productQrCode, string startDate, string endDate, string ticketCode, string mappingCode,
            string createdBy, string groupType, string supplierCode = "", string cusCode = "")
        {
            var fromDate = !string.IsNullOrEmpty(startDate) ? DateTime.ParseExact(startDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(endDate) ? DateTime.ParseExact(endDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join b4 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b4.Code
                         join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                         from f in f1.DefaultIfEmpty()
                         //join e in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals e.ObjectCode into e1
                         //from e in e1.DefaultIfEmpty()
                         //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on e.CategoryCode equals f.Code into f1
                         //from f in f1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                         on a.Unit equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         join j in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.IdImpProduct equals j.Id into j1
                         from j in j1.DefaultIfEmpty()
                         join k in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode into k1
                         from k in k1.DefaultIfEmpty()
                         join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                         from m2 in m1.DefaultIfEmpty()
                         join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                         from d1 in d2.DefaultIfEmpty()
                         join g in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.IdImpProduct equals g.IdImpProduct into g2
                         from g in g2.DefaultIfEmpty()
                         join h in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                         on a.GattrCode equals h.GattrCode into h1
                         from h in h1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(productQrCode) || (!string.IsNullOrEmpty(a.ProductQrCode)
                         && a.ProductQrCode.ToLower().Contains(productQrCode.ToLower())))
                            && (string.IsNullOrEmpty(productCode) || (a.ProductCode.ToLower().Contains(productCode.ToLower())))
                            && (string.IsNullOrEmpty(storeCode) || (a.StoreCode.ToLower().Contains(storeCode.ToLower())))
                            && (string.IsNullOrEmpty(mappingCode) || (g != null && g.MappingCode.ToLower().Contains(mappingCode.ToLower())))
                            && (string.IsNullOrEmpty(lotProductCode) || (a.LotProductCode.Equals(lotProductCode)))
                            && (string.IsNullOrEmpty(groupType) || (b4.GroupType.Equals(groupType)))
                            && (string.IsNullOrEmpty(ticketCode) || (k != null && k.TicketCode.Equals(ticketCode)))
                            && (string.IsNullOrEmpty(supplierCode) || (k != null && k.SupCode.Equals(supplierCode)))
                            && (string.IsNullOrEmpty(cusCode) || (k != null && k.CusCode.Equals(cusCode)))
                            && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
                            && (fromDate == null || (k != null && k.TimeTicketCreate >= fromDate))
                            && (toDate == null || (k != null && k.TimeTicketCreate <= toDate))
                         select new InventoryRes
                         {
                             Id = a.Id,
                             IdImpProduct = a.IdImpProduct,
                             IdMapping = g != null ? g.Id : -1,
                             ProductCode = a.ProductCode,
                             ProductNo = a.ProductNo,
                             ProductName = b.ProductName,
                             StoreCode = a.StoreCode,
                             StoreName = f != null ? f.WHS_Name: "",
                             MappingCode = g != null ? g.MappingCode : "",
                             LotProductCode = a.LotProductCode,
                             LotProductName = m2.PoTitle,
                             TicketTitle = k != null ? k.Title : "",
                             TimeTicketCreate = k != null ? k.TimeTicketCreate : null,
                             QrCode = a.ProductQrCode,
                             CreatedTime = a.CreatedTime,
                             Unit = c != null ? c.ValueSet : "",
                             UnitCode = a.Unit,
                             ProductGroup = (d1 != null ? d1.Name : ""),
                             ProductType = b.GroupCode,
                             GattrFlatCode = h != null ? h.GattrFlatCode : "Cơ bản",
                             Quantity = g != null && g.Quantity.HasValue ? g.Quantity.Value : a.Quantity,
                             Image = b.Image,
                             PathImg = b.Image,
                             Total = a.Quantity
                         }).ToList()
                         .DistinctBy(x => new { x.IdImpProduct, x.IdMapping }).ToList();
            return query;
        }

        [NonAction]
        public List<InventoryRes> FuncJTableFuel(string productCode, string storeCode, string lotProductCode,
            string productQrCode, string startDate, string endDate, string ticketCode, string mappingCode,
            string createdBy, string groupType, string supplierCode = "")
        {
            var fromDate = !string.IsNullOrEmpty(startDate) ? DateTime.ParseExact(startDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(endDate) ? DateTime.ParseExact(endDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join b1 in _context.ProductAttrGalaxys.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                         join b2 in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.AttrCode equals b2.ProductCode
                         join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                         from f in f1.DefaultIfEmpty()
                             //join e in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals e.ObjectCode into e1
                             //from e in e1.DefaultIfEmpty()
                             //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on e.CategoryCode equals f.Code into f1
                             //from f in f1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "UNIT")
                         on a.Unit equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         join j in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.IdImpProduct equals j.Id into j1
                         from j in j1.DefaultIfEmpty()
                         join k in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode into k1
                         from k in k1.DefaultIfEmpty()
                         join m in _context.PoBuyerHeaders.Where(x => x.IsDeleted == false) on a.LotProductCode equals m.PoSupCode into m1
                         from m2 in m1.DefaultIfEmpty()
                         join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                         from d1 in d2.DefaultIfEmpty()
                             //join g in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.IdImpProduct equals g.IdImpProduct into g2
                             //from g in g2.DefaultIfEmpty()
                         join h in _context.ProductGattrExts.Where(x => x.IsDeleted == false)
                         on a.GattrCode equals h.GattrCode into h1
                         from h in h1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(productCode) || (b2.ProductCode.ToLower().Contains(productCode.ToLower())))
                            && (string.IsNullOrEmpty(storeCode) || (a.StoreCode.ToLower().Contains(storeCode.ToLower())))
                            //&& (string.IsNullOrEmpty(mappingCode) || (g != null && g.MappingCode.ToLower().Contains(mappingCode.ToLower())))
                            //&& (string.IsNullOrEmpty(lotProductCode) || (a.LotProductCode.Equals(lotProductCode)))
                            //&& (string.IsNullOrEmpty(groupType) || (b4.GroupType.Equals(groupType)))
                            && (string.IsNullOrEmpty(ticketCode) || (k != null && k.TicketCode.Equals(ticketCode)))
                            && (string.IsNullOrEmpty(supplierCode) || (k != null && k.SupCode.Equals(supplierCode)))
                            && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
                            && (fromDate == null || (k != null && k.TimeTicketCreate >= fromDate))
                            && (toDate == null || (k != null && k.TimeTicketCreate <= toDate))
                         select new InventoryRes
                         {
                             Id = a.Id,
                             IdImpProduct = a.IdImpProduct,
                             //IdMapping = g != null ? g.Id : -1,
                             ProductCode = b2.ProductCode,
                             BottleCode = a.ProductCode,
                             SBottleTime = b1.AttrValue,
                             //ProductCodeFuel = b2.ProductCode,
                             ProductNo = a.ProductNo,
                             ProductName = b2.ProductName,
                             StoreCode = a.StoreCode,
                             StoreName = f != null ? f.WHS_Name : "",
                             //MappingCode = g != null ? g.MappingCode : "",
                             LotProductCode = a.LotProductCode,
                             LotProductName = m2.PoTitle,
                             TicketTitle = k != null ? k.Title : "",
                             TimeTicketCreate = k != null ? k.TimeTicketCreate : null,
                             QrCode = a.ProductQrCode,
                             CreatedTime = a.CreatedTime,
                             Unit = c != null ? c.ValueSet : "",
                             UnitCode = a.Unit,
                             ProductGroup = (d1 != null ? d1.Name : ""),
                             ProductType = b.GroupCode,
                             GattrFlatCode = h != null ? h.GattrFlatCode : "Cơ bản",
                             Quantity = a.Quantity,
                             Weight = a.Weight,
                             Image = b.Image,
                             PathImg = b.Image,
                             Total = a.Quantity
                         }).ToList();
            var q2 = query.GroupBy(x => x.BottleCode)
                .Select(delegate (IGrouping<string, InventoryRes> group)
                {
                    foreach (var item in group)
                    {
                        try
                        {
                            item.BottleTime =
                            DateTime.ParseExact(item.SBottleTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                    }
                    var first = group.Where(x => x.BottleTime != null).OrderByDescending(x => x.BottleTime)
                    .FirstOrDefault();
                    return first;
                }).Where(x => x != null)
                .GroupBy(x => new FuelStoreUnit(x.ProductCode, x.StoreCode, x.Unit))
                .Select(delegate (IGrouping<FuelStoreUnit, InventoryRes> group)
                {
                    var first = group.FirstOrDefault();
                    first.Quantity = group.Sum(x => x.Quantity);
                    first.Weight = group.Sum(x => x.Weight);
                    first.BottleCodeAll = string.Join(", ", group.Select(x => x.BottleCode));
                    return first;
                }).OrderBy(x => x.ProductCode).ToList();
            return q2;
        }

        [NonAction]
        public List<InventoryRes> FuncJTableBottleTank(string productCode, string storeCode, string lotProductCode,
            string productQrCode, string startDate, string endDate, string ticketCode, string mappingCode,
            string createdBy, string groupType, string supplierCode = "")
        {
            var fromDate = !string.IsNullOrEmpty(startDate) ? DateTime.ParseExact(startDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(endDate) ? DateTime.ParseExact(endDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listProdStatus = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "PROD_STAT")
                    .OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            var query = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join b4 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b4.Code
                         join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                         from f in f1.DefaultIfEmpty()
                             //join e in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals e.ObjectCode into e1
                             //from e in e1.DefaultIfEmpty()
                             //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on e.CategoryCode equals f.Code into f1
                             //from f in f1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "UNIT")
                         on a.Unit equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         join j in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.IdImpProduct equals j.Id into j1
                         from j in j1.DefaultIfEmpty()
                         join k in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode into k1
                         from k in k1.DefaultIfEmpty()
                         join m in _context.PoBuyerHeaders.Where(x => x.IsDeleted == false) on a.LotProductCode equals m.PoSupCode into m1
                         from m2 in m1.DefaultIfEmpty()
                         join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                         from d1 in d2.DefaultIfEmpty()
                         join g in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.IdImpProduct equals g.IdImpProduct into g2
                         from g in g2.DefaultIfEmpty()
                         join h in _context.ProductGattrExts.Where(x => x.IsDeleted == false)
                         on a.GattrCode equals h.GattrCode into h1
                         from h in h1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(productCode) || (a.ProductCode.ToLower().Contains(productCode.ToLower())))
                            && (string.IsNullOrEmpty(storeCode) || (a.StoreCode.ToLower().Contains(storeCode.ToLower())))
                            //&& (string.IsNullOrEmpty(mappingCode) || (g != null && g.MappingCode.ToLower().Contains(mappingCode.ToLower())))
                            //&& (string.IsNullOrEmpty(lotProductCode) || (a.LotProductCode.Equals(lotProductCode)))
                            && (string.IsNullOrEmpty(groupType) || (b4.GroupType.Equals(groupType)))
                            && (string.IsNullOrEmpty(ticketCode) || (k != null && k.TicketCode.Equals(ticketCode)))
                            && (string.IsNullOrEmpty(supplierCode) || (k != null && k.SupCode.Equals(supplierCode)))
                            && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
                        && (fromDate == null || (k != null && k.TimeTicketCreate >= fromDate))
                            && (toDate == null || (k != null && k.TimeTicketCreate <= toDate))
                         select new InventoryRes
                         {
                             Id = a.Id,
                             IdImpProduct = a.IdImpProduct,
                             IdMapping = g != null ? g.Id : -1,
                             ProductCode = a.ProductCode,
                             //BottleCode = a.ProductCode,
                             //SBottleTime = b1.AttrValue,
                             //ProductCodeFuel = b2.ProductCode,
                             ProductNo = a.ProductNo,
                             ProductName = b.ProductName,
                             StoreCode = a.StoreCode,
                             StoreName = f != null ? f.WHS_Name : "",
                             MappingCode = g != null ? g.MappingCode : "",
                             LotProductCode = a.LotProductCode,
                             LotProductName = m2.PoTitle,
                             TicketTitle = k != null ? k.Title : "",
                             TimeTicketCreate = k != null ? k.TimeTicketCreate : null,
                             QrCode = a.ProductQrCode,
                             CreatedTime = a.CreatedTime,
                             Unit = c != null ? c.ValueSet : "",
                             UnitCode = a.Unit,
                             ProductGroup = (d1 != null ? d1.Name : ""),
                             ProductType = b.GroupCode,
                             GattrFlatCode = h != null ? h.GattrFlatCode : "Cơ bản",
                             Quantity = a.Quantity,
                             Weight = a.Weight,
                             Image = b.Image,
                             PathImg = b.Image,
                             Status = j != null ? j.Status : "",
                             Total = a.Quantity
                         }).ToList();
            var q2 = query.Select(delegate (InventoryRes item)
            {
                if (!string.IsNullOrEmpty(item.Status))
                {
                    var listItemStatus = (from a in item.Status.Split(",")
                                          join b in listProdStatus on a.Trim() equals b.Code
                                          select b.Name);
                    item.ProductStatus = string.Join(", ", listItemStatus);
                }
                else
                {
                    item.ProductStatus = "";
                }
                return item;
            }).OrderByDescending(x => x.Weight).ToList();
            return q2;
        }

        [HttpPost]
        public JsonResult GetStockByPosition(string mappingCode, string unit = "")
        {
            var data = from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.MappingCode == mappingCode)
                       join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                       //join c in _context.EDMSRacks on b.RackCode equals c.RackCode
                       //join d in _context.EDMSLines on b.LineCode equals d.LineCode
                       //join e in _context.EDMSFloors on b.FloorCode equals e.FloorCode
                       join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.WHS_Code equals f.WHS_Code into f1
                       from f in f1.DefaultIfEmpty()
                       join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                       join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                           on new { c.CategoryCode, c.ObjectType } equals new
                           { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       //join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.WHS_Code equals d.ObjectCode into d1
                       //from d in d1.DefaultIfEmpty()
                       //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on d.CategoryCode equals f.Code into f1
                       //from f in f1.DefaultIfEmpty()
                       join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                       on a.Unit equals g.CodeSet into g1
                       from g in g1.DefaultIfEmpty()
                       select new
                       {
                           a.Quantity,
                           a.ProductCode,
                           b.ProductName,
                           Unit = g != null ? g.ValueSet : "",
                           Store = f != null ? f.WHS_Name : "",
                           Position = c.ObjectCode
                       };
            return Json(data);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetStockByProductCode(string productCode)
        {
            var data = from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductCode.Equals(productCode))
                       join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                       //join k in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProdCode equals k.ProductQrCode
                       //join c in _context.EDMSRacks on b.RackCode equals c.RackCode
                       //join d in _context.EDMSLines on b.LineCode equals d.LineCode
                       //join e in _context.EDMSFloors on b.FloorCode equals e.FloorCode
                       join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.WHS_Code equals f.WHS_Code into f1
                       from f in f1.DefaultIfEmpty()
                       join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on a.MappingCode equals c.ObjectCode
                       join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                           on new { c.CategoryCode, c.ObjectType } equals new
                           { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       //join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.WHS_Code equals d.ObjectCode into d1
                       //from d in d1.DefaultIfEmpty()
                       //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on d.CategoryCode equals f.Code into f1
                       //from f in f1.DefaultIfEmpty()
                           //join h in _context.MaterialProducts.Where(x => !x.IsDeleted) on k.ProductCode equals h.ProductCode
                       join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                       on a.Unit equals g.CodeSet into g1
                       from g in g1.DefaultIfEmpty()
                       select new
                       {
                           a.Quantity,
                           a.ProductCode,
                           b.ProductName,
                           Unit = g != null ? g.ValueSet : "",
                           Store = f != null ? f.WHS_Name : "",
                           Position = c.ObjectCode
                       };
            return Json(data);
        }

        [HttpPost]
        public object GetTotal([FromBody] JTableModelInventory jTablePara)
        {
            var query = new List<InventoryRes>();
            switch (jTablePara.GroupType)
            {
                case "FUEL":
                    query = FuncJTableFuel(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                    break;
                case "BOTTLE":
                    query = FuncJTableBottleTank(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                    break;
                case "STATIC_TANK":
                    query = FuncJTableBottleTank(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                    break;
                default:
                    query = FuncJTableNormal(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode, jTablePara.FromDate, jTablePara.ToDate, jTablePara.TicketCode, jTablePara.MappingCode/*jTablePara.FloorCode, jTablePara.LineCode, jTablePara.RackCode*/, jTablePara.CreatedBy, jTablePara.GroupType, jTablePara.SupplierCode);
                    break;
            }
            var sumQuantity = query.Sum(x => x.Quantity);

            var rs = new { sumQuantity };
            return Json(rs);
        }

        [HttpPost]
        public object GetStores()
        {
            var data = from a in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true /*&& x.Type == "PR"*/)
                       select new
                       {
                           Code = a.WHS_Code,
                           Name = a.WHS_Name
                       };
            return data.ToList();
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListProductCode()
        {
            var data = from a in _context.MaterialProducts.Where(x => !x.IsDeleted)
                       select new
                       {
                           Code = a.ProductCode,
                           Name = $"{a.ProductName} [ {a.ProductCode} ]",
                           ProductType = "FINISHED_PRODUCT",
                           CreatedTime = a.CreatedTime
                       };
            //var sub = from a in _context.SubProducts.Where(x => x.IsDeleted == false)
            //          select new
            //          {
            //              Code = a.AttributeCode,
            //              Name = a.AttributeName,
            //              ProductType = "SUB_PRODUCT",
            //              CreatedTime = a.CreatedTime
            //          };
            //var query = data.Union(sub).OrderByDescending(x=>x.CreatedTime).ToList();
            return data.ToList();
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListLotProductCode()
        {
            var data = from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.PoSupCode,
                           Name = a.PoTitle
                       };
            return data.ToList();
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListTicketCode()
        {
            var data = from a in _context.ProductImportHeaders.Where(x => !string.IsNullOrEmpty(x.Title) && !x.IsDeleted)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.TicketCode,
                           Name = a.Title
                       };
            return data.ToList();
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListUserImport()
        {
            var data = from a in _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                       select a;
            return data;
        }

        [HttpGet]
        public ActionResult ExportExcel(string ProductCode, string StoreCode, string LotProductCode, string ProductQrCode, string FromDate, string ToDate, string TicketCode, string FloorCode, string LineCode, string RackCode, string CreatedBy, string MappingCode = "")
        {
            //Get data View
            var listData = FuncJTableNormal(ProductCode, StoreCode, LotProductCode, ProductQrCode, FromDate, ToDate, TicketCode, MappingCode/*FloorCode, LineCode, RackCode*/, CreatedBy, "");
            var listExport = new List<InventoryExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new InventoryExportModel();
                itemExport.No = no;
                itemExport.QrCode = item.QrCode;
                //itemExport.LotProductName = item.LotProductName;
                itemExport.ProductName = item.ProductName;
                //itemExport.Quantity = item.FromDate != null ? item.FromDate.ToString("dd/MM/yyyy") : "";
                //itemExport.ToDate = item.ToDate != null ? item.ToDate.ToString("dd/MM/yyyy") : "";
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.StoreName = item.StoreName;
                itemExport.ProductGroup = item.ProductGroup;
                //itemExport.ProductType = item.ProductType;
                itemExport.TicketTitle = item.TicketTitle;
                itemExport.TimeTicketCreate = item.TimeTicketCreate.HasValue ? item.TimeTicketCreate.Value.Date.ToString("dd/MM/yyyy") : "";
                //itemExport.Percent = item.Percent.ToString();

                //if (item.Percent == 100)
                //{
                //    itemExport.Percent = "100%";
                //}
                //else if (item.Percent == 0)
                //{
                //    itemExport.Percent = "0%";
                //}
                //else
                //{
                //    itemExport.Percent = String.Format("{0:0.00}", item.Percent) + "%";
                //}
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("TonKho");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:K1"].Merge(true);

            sheetRequest.Range["A1"].Text = "TỒN KHO";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "MÃ QR SẢN PHẨM";
            sheetRequest["C2"].Text = "ĐƠN HÀNG SẢN PHẨM";
            sheetRequest["D2"].Text = "TÊN SẢN PHẨM";
            sheetRequest["E2"].Text = "LUỢNG TỒN";
            sheetRequest["F2"].Text = "ÐƠN VỊ";
            sheetRequest["G2"].Text = "KHO";
            sheetRequest["H2"].Text = "NHÓM SẢN PHẨM";
            sheetRequest["I2"].Text = "LOẠI SẢN PHẨM";
            sheetRequest["J2"].Text = "TÊN PHIẾU NHẬP";
            sheetRequest["K2"].Text = "NGÀY NHẬP";


            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:K2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:K2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonKho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpGet]
        public ActionResult Export(string listId, string groupType)
        {
            var ids = listId.Split(",");
            //var query = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
            //             join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
            //             join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                             //from f in f1.DefaultIfEmpty()
            //                 //join e in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals e.ObjectCode into e1
            //                 //from e in e1.DefaultIfEmpty()
            //                 //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on e.CategoryCode equals f.Code into f1
            //                 //from f in f1.DefaultIfEmpty()
            //             join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
            //             on a.Unit equals c.CodeSet into c1
            //             from c in c1.DefaultIfEmpty()
            //             join j in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.IdImpProduct equals j.Id into j1
            //             from j in j1.DefaultIfEmpty()
            //             join k in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode into k1
            //             from k in k1.DefaultIfEmpty()
            //             join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
            //             from m2 in m1.DefaultIfEmpty()
            //             join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
            //             from d1 in d2.DefaultIfEmpty()
            //             join g in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.IdImpProduct equals g.IdImpProduct into g2
            //             from g in g2.DefaultIfEmpty()
            //             join h in _context.ProductGattrExts.Where(x => !x.IsDeleted)
            //             on a.GattrCode equals h.GattrCode into h1
            //             from h in h1.DefaultIfEmpty()
            //                 //where (string.IsNullOrEmpty(productQrCode) || (!string.IsNullOrEmpty(a.ProductQrCode)
            //                 //&& a.ProductQrCode.ToLower().Contains(productQrCode.ToLower())))
            //                 //   && (string.IsNullOrEmpty(productCode) || (a.ProductCode.ToLower().Contains(productCode.ToLower())))
            //                 //   && (string.IsNullOrEmpty(storeCode) || (a.StoreCode.ToLower().Contains(storeCode.ToLower())))
            //                 //   && (string.IsNullOrEmpty(mappingCode) || (g != null && g.MappingCode.ToLower().Contains(mappingCode.ToLower())))
            //                 //   && (string.IsNullOrEmpty(lotProductCode) || (a.LotProductCode.Equals(lotProductCode)))
            //                 //   && (string.IsNullOrEmpty(ticketCode) || (k != null && k.TicketCode.Equals(ticketCode)))
            //                 //   && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
            //                 //   && (fromDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime >= fromDate))
            //                 //   && (toDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime <= toDate))
            //             where ids.Any(x => x == a.Id.ToString())
            //             select new InventoryRes
            //             {
            //                 Id = a.Id,
            //                 IdImpProduct = a.IdImpProduct,
            //                 IdMapping = g != null ? g.Id : -1,
            //                 ProductCode = a.ProductCode,
            //                 ProductNo = a.ProductNo,
            //                 ProductName = b.ProductName,
            //                 StoreCode = a.StoreCode,
            //                 StoreName = f != null ? f.WHS_Name : "",
            //                 MappingCode = g != null ? g.MappingCode : "",
            //                 LotProductCode = a.LotProductCode,
            //                 LotProductName = m2.PoTitle,
            //                 TicketTitle = k != null ? k.Title : "",
            //                 TimeTicketCreate = k != null ? k.TimeTicketCreate : null,
            //                 QrCode = a.ProductQrCode,
            //                 CreatedTime = a.CreatedTime,
            //                 Unit = c != null ? c.ValueSet : "",
            //                 UnitCode = a.Unit,
            //                 ProductGroup = (d1 != null ? d1.Name : ""),
            //                 ProductType = b.GroupCode,
            //                 GattrFlatCode = h != null ? h.GattrFlatCode : "Cơ bản",
            //                 Quantity = g != null && g.Quantity.HasValue ? g.Quantity.Value : a.Quantity,
            //                 Image = b.Image,
            //                 PathImg = b.Image,
            //                 Total = a.Quantity
            //             }).ToList()
            //             .DistinctBy(x => new { x.IdImpProduct, x.IdMapping }).ToList();
            var query = new List<InventoryRes>();
            switch (groupType)
            {
                case "FUEL":
                    query = FuncJTableFuel("", "", "", "", "", "", "", "", "", groupType, "");
                    break;
                case "BOTTLE":
                    query = FuncJTableBottleTank("", "", "", "", "", "", "", "", "", groupType, "");
                    break;
                case "STATIC_TANK":
                    query = FuncJTableBottleTank("", "", "", "", "", "", "", "", "", groupType, "");
                    break;
                default:
                    query = FuncJTableNormal("", "", "", "", "", "", "", "", "", groupType, "");
                    break;
            }
            var queryFilter = (from a in query
                               join b in ids on a.Id.ToString() equals b
                               select a).ToList();
            var rs = queryFilter.OrderByDescending(x => x.CreatedTime).ToList();
            //var groupCost = rs.GroupBy(x => new { x.ProductCode, x.ProductType }).Select(y => new InventoryRes
            //{
            //    ProductCode = y.Key.ProductCode,
            //    ProductType = y.Key.ProductType,
            //    Total = y.Sum(c => c.Quantity)
            //});
            //var listData = from a in rs
            //               join b in groupCost on new { a.ProductCode, a.ProductType } equals new { b.ProductCode, b.ProductType } into b2
            //               from b in b2.DefaultIfEmpty()
            //               select new InventoryRes
            //               {
            //                   Id = a.Id,
            //                   ProductCode = a.ProductCode,
            //                   ProductName = a.ProductName,
            //                   StoreCode = a.StoreCode,
            //                   StoreName = a.StoreName,
            //                   LotProductCode = a.LotProductCode,
            //                   LotProductName = a.LotProductName,
            //                   TicketTitle = a.TicketTitle,
            //                   TimeTicketCreate = a.TimeTicketCreate,
            //                   QrCode = a.QrCode,
            //                   CreatedTime = a.CreatedTime,
            //                   Unit = a.Unit,
            //                   ProductGroup = a.ProductGroup,
            //                   ProductType = a.ProductType,
            //                   Quantity = a.Quantity,
            //                   Image = b.Image,
            //                   PathImg = b.Image,
            //                   Total = (b != null ? b.Total : 0)
            //               };
            var listExport = new List<IExportModel>();
            switch (groupType)
            {
                case "FUEL":
                    listExport = HandleFuelExportModel(rs);
                    break;
                case "BOTTLE":
                    listExport = HandleBottleExportModel(rs);
                    break;
                case "STATIC_TANK":
                    listExport = HandleBottleExportModel(rs);
                    break;
                default:
                    listExport = HandleInventoryExportModel(rs);
                    break;
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("TonKho");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;
            sheetRequest.Range["L1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:L1"].Merge(true);

            sheetRequest.Range["A1"].Text = "BÁO CÁO TỒN KHO";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Arial";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 0, 0);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            //sheetRequest["A2"].Text = "TT";
            //sheetRequest["B2"].Text = "Mã Qr sản phẩm";
            ////sheetRequest["C2"].Text = "Đơn hàng sản phẩm";
            //sheetRequest["C2"].Text = "Mã sản phẩm";
            //sheetRequest["D2"].Text = "Tên sản phẩm";
            //sheetRequest["E2"].Text = "Tên phiếu nhập";
            //sheetRequest["F2"].Text = "Ngày nhập";
            //sheetRequest["G2"].Text = "Lượng tồn";
            //sheetRequest["H2"].Text = "Ðơn vị";
            //sheetRequest["I2"].Text = "Vị trí";
            //sheetRequest["J2"].Text = "Thuộc tính";
            //sheetRequest["K2"].Text = "Nhóm sản phẩm";
            ////sheetRequest["K2"].Text = "Loại sản phẩm";
            //sheetRequest["L2"].Text = "Kho";
            switch (groupType)
            {
                case "FUEL":
                    HandleFuelExportLabel(sheetRequest);
                    break;
                case "BOTTLE":
                    HandleBottleExportLabel(sheetRequest);
                    break;
                case "STATIC_TANK":
                    HandleBottleExportLabel(sheetRequest);
                    break;
                default:
                    HandleInventoryExportLabel(sheetRequest);
                    break;
            }


            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Arial";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:L2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:L2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonKho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        private List<IExportModel> HandleInventoryExportModel(List<InventoryRes> rs)
        {
            var listExport = new List<IExportModel>();
            var no = 1;
            foreach (var item in rs)
            {
                var itemExport = new InventoryExportModel();
                itemExport.No = no;
                itemExport.QrCode = item.QrCode;
                //itemExport.LotProductName = item.LotProductName;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.TicketTitle = item.TicketTitle;
                itemExport.TimeTicketCreate = item.TimeTicketCreate.HasValue ? item.TimeTicketCreate.Value.Date.ToString("dd/MM/yyyy") : "";
                itemExport.MappingCode = item.MappingCode;
                itemExport.GattrFlatCode = item.GattrFlatCode;
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.StoreName = item.StoreName;
                itemExport.ProductGroup = item.ProductGroup;
                //itemExport.ProductType = item.ProductType;
                no = no + 1;
                listExport.Add(itemExport);
            }
            return listExport;
        }

        private void HandleInventoryExportLabel(IWorksheet sheetRequest)
        {
            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã Qr sản phẩm";
            //sheetRequest["C2"].Text = "Đơn hàng sản phẩm";
            sheetRequest["C2"].Text = "Mã sản phẩm";
            sheetRequest["D2"].Text = "Tên sản phẩm";
            sheetRequest["E2"].Text = "Tên phiếu nhập";
            sheetRequest["F2"].Text = "Ngày nhập";
            sheetRequest["G2"].Text = "Lượng tồn";
            sheetRequest["H2"].Text = "Ðơn vị";
            sheetRequest["I2"].Text = "Vị trí";
            sheetRequest["J2"].Text = "Thuộc tính";
            sheetRequest["K2"].Text = "Nhóm sản phẩm";
            //sheetRequest["K2"].Text = "Loại sản phẩm";
            sheetRequest["L2"].Text = "Kho";
        }
        private List<IExportModel> HandleFuelExportModel(List<InventoryRes> rs)
        {
            var listExport = new List<IExportModel>();
            var no = 1;
            foreach (var item in rs)
            {
                var itemExport = new FuelExportModel();
                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.StoreName = item.StoreName;
                itemExport.Weight = item.Weight ?? 0;
                itemExport.Unit = item.Unit;
                itemExport.BottleCodeAll = item.BottleCodeAll;
                no = no + 1;
                listExport.Add(itemExport);
            }
            return listExport;
        }

        private void HandleFuelExportLabel(IWorksheet sheetRequest)
        {
            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã sản phẩm";
            sheetRequest["C2"].Text = "Tên sản phẩm";
            sheetRequest["D2"].Text = "Kho";
            sheetRequest["E2"].Text = "Lượng tồn";
            sheetRequest["F2"].Text = "Ðơn vị";
            sheetRequest["G2"].Text = "Danh sách vỏ";
            //sheetRequest["K2"].Text = "Loại sản phẩm";
        }
        private List<IExportModel> HandleBottleExportModel(List<InventoryRes> rs)
        {
            var listExport = new List<IExportModel>();
            var no = 1;
            foreach (var item in rs)
            {
                var itemExport = new BottleExportModel();
                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.StoreName = item.StoreName;
                itemExport.Weight = item.Weight ?? 0;
                itemExport.Unit = item.Unit;
                itemExport.MappingCode = item.MappingCode;
                itemExport.ProductStatus = item.ProductStatus;
                no = no + 1;
                listExport.Add(itemExport);
            }
            return listExport;
        }

        private void HandleBottleExportLabel(IWorksheet sheetRequest)
        {
            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã sản phẩm";
            sheetRequest["C2"].Text = "Tên sản phẩm";
            sheetRequest["D2"].Text = "Kho";
            sheetRequest["E2"].Text = "Lượng tồn";
            sheetRequest["F2"].Text = "Ðơn vị";
            sheetRequest["G2"].Text = "Vị trí";
            sheetRequest["H2"].Text = "Trạng thái";
            //sheetRequest["K2"].Text = "Loại sản phẩm";
        }

        #region Ignored
        [HttpPost]
        public JsonResult GetStockByStore(string storeCode)
        {
            var data = from a in _context.MapStockProdIns.Where(x => !x.IsDeleted)
                       join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.WHS_Code.Equals(storeCode)) on a.MapId equals b.Id
                       join k in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.ProdCode equals k.ProductQrCode
                       //join c in _context.EDMSRacks on b.RackCode equals c.RackCode
                       //join d in _context.EDMSLines on b.LineCode equals d.LineCode
                       //join e in _context.EDMSFloors on b.FloorCode equals e.FloorCode
                       join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on b.WHS_Code equals f.WHS_Code
                       join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on b.MappingCode equals c.ObjectCode
                       join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                           on new { c.CategoryCode, c.ObjectType } equals new
                           { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       //join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on b.WHS_Code equals d.ObjectCode
                       //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on d.CategoryCode equals f.Code
                       join h in _context.MaterialProducts.Where(x => !x.IsDeleted) on k.ProductCode equals h.ProductCode
                       join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))) on a.Unit equals g.CodeSet
                       select new
                       {
                           a.Quantity,
                           h.ProductName,
                           Unit = g.ValueSet,
                           Store = f.WHS_Name,
                           Position = c.ObjectCode
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetStockByPO(string poCode)
        {
            var data = from a in _context.MapStockProdIns.Where(x => !x.IsDeleted)
                       join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.MapId equals b.Id
                       join k in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.LotProductCode.Equals(poCode)) on a.ProdCode equals k.ProductQrCode
                       //join c in _context.EDMSRacks on b.RackCode equals c.RackCode
                       //join d in _context.EDMSLines on b.LineCode equals d.LineCode
                       //join e in _context.EDMSFloors on b.FloorCode equals e.FloorCode
                       join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on b.WHS_Code equals f.WHS_Code
                       join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on b.MappingCode equals c.ObjectCode
                       join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                           on new { c.CategoryCode, c.ObjectType } equals new
                           { CategoryCode = e.Code, ObjectType = e.PAreaType }
                       //join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on b.WHS_Code equals d.ObjectCode
                       //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on d.CategoryCode equals f.Code
                       join h in _context.MaterialProducts.Where(x => !x.IsDeleted) on k.ProductCode equals h.ProductCode
                       join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on k.LotProductCode equals m.PoSupCode
                       join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))) on a.Unit equals g.CodeSet
                       select new
                       {
                           a.Quantity,
                           h.ProductName,
                           Unit = g.ValueSet,
                           Store = f.WHS_Name,
                           Position = c.ObjectCode,
                           Title = m.PoTitle
                       };
            return Json(data);
        }
        #endregion

        #region Combobox
        [AllowAnonymous]
        [HttpGet]
        public object GetListFloorByWareHouseCode(string wareHouseCode)
        {
            try
            {
                var rs = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(wareHouseCode))
                                            .Select(x => new { Code = x.FloorCode, Name = x.FloorName }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetListLineByFloorCode(string floorCode)
        {
            try
            {
                var rs = _context.EDMSLines.Where(x => x.FloorCode.Equals(floorCode))
                                           .Select(x => new { Code = x.LineCode, Name = x.L_Text }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetListRackByLineCode(string lineCode)
        {
            try
            {
                var rs = _context.EDMSRacks.Where(x => x.LineCode.Equals(lineCode))
                                           .Select(x => new { Code = x.RackCode, Name = x.RackName }).ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        #endregion


        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        public class InventoryRes
        {
            public int Id { get; set; }
            public int? IdImpProduct { get; set; }
            public int? IdMapping { get; set; }
            public string QrCode { get; set; }
            public string Barcode { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductNo { get; set; }
            public string MappingCode { get; set; }
            public string LotProductCode { get; set; }
            public string LotProductName { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string Unit { get; set; }
            public string UnitCode { get; set; }
            public string ProductGroup { get; set; }
            public string ProductType { get; set; }
            public decimal Quantity { get; set; }
            public string Image { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
            public string PathImg { get; set; }
            public decimal Total { get; set; }
            public string TicketTitle { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
            public string ProdCustomJson { get; set; }
            public bool? IsCustomized { get; set; }
            public int? IdProduct { get; set; }
            public string GattrFlatCode { get; set; }
            public string BottleCode { get; set; }
            public string SBottleTime { get; set; }
            public DateTime? BottleTime { get; set; }
            public string BottleCodeAll { get; set; }
            public decimal? Weight { get; set; }
            public string Status { get; set; }
            public string ProductStatus { get; set; }
            public string GattrJson { get; set; }
            public bool IsDeleted { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public decimal QuantityExp { get; set; }
            public decimal SumImport { get; set; }
            public decimal SumExport { get; set; }
            public bool IsGroup { get; set; }
        }
        public class InventoryExportModel: IExportModel
        {
            public int No { get; set; }
            public string QrCode { get; set; }
            //public string LotProductName { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string TicketTitle { get; set; }
            public string TimeTicketCreate { get; set; }
            public string MappingCode { get; set; }
            public string GattrFlatCode { get; set; }
            public decimal Quantity { get; set; }
            public string Unit { get; set; }
            public string StoreName { get; set; }
            public string ProductGroup { get; set; }
        }
        public class FuelExportModel: IExportModel
        {
            public int No { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string StoreName { get; set; }
            public decimal Weight { get; set; }
            public string Unit { get; set; }
            public string BottleCodeAll { get; set; }
        }
        public class BottleExportModel: IExportModel
        {
            public int No { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string StoreName { get; set; }
            public decimal Weight { get; set; }
            public string Unit { get; set; }
            public string MappingCode { get; set; }
            public string ProductStatus { get; set; }
        }
        interface IExportModel
        {
            int No { get; set; }
        }
    }

    internal class FuelStoreUnit
    {
        public string ProductCode { get; }
        public string StoreCode { get; }
        public string Unit { get; }

        public FuelStoreUnit(string productCode, string storeCode, string unit)
        {
            ProductCode = productCode;
            StoreCode = storeCode;
            Unit = unit;
        }

        public override bool Equals(object obj)
        {
            return obj is FuelStoreUnit other &&
                   ProductCode == other.ProductCode &&
                   StoreCode == other.StoreCode &&
                   Unit == other.Unit;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(ProductCode, StoreCode, Unit);
        }
    }
}