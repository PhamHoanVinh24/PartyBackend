using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using System.Linq;
using DocumentFormat.OpenXml.Spreadsheet;
using Quartz;
using OpenXmlPowerTools;
using System.Globalization;
using III.Admin.Controllers;
using static III.Admin.Controllers.InventoryController;
using System.Collections.Generic;
using static III.Admin.Controllers.MobileLoginController;
using Syncfusion.XlsIO;
using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileWareHouseController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        public List<InventoryRes> ListInventoryRes { get; set; }
        public MobileWareHouseController(
            EIMDBContext context,
            IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        private List<InventoryRes> GetBottleStaticTank(string productCode, string storeCode, string groupType, string ticketCode,
            string supplierCode, string createdBy, DateTime? fromDate, DateTime? toDate)
        {
            var listProdStatus = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "PROD_STAT")
                    .OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            var query = (from a in _context.ProductInStocks/*.Where(x => !x.IsDeleted)*/
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
                             //join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                             //from d1 in d2.DefaultIfEmpty()
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
                            && (string.IsNullOrEmpty(supplierCode) || (k != null && k.CusCode.Equals(supplierCode)))
                            && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
                         //                && (fromDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime >= fromDate))
                         //&& (toDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime <= toDate))
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
                             ProductGroup = (b4 != null ? b4.Name : ""),
                             ProductType = b.GroupCode,
                             GattrFlatCode = h != null ? h.GattrFlatCode : "Cơ bản",
                             Quantity = a != null ? a.Quantity : 0,
                             Weight = a.Weight,
                             Image = b.Image,
                             PathImg = b.Image,
                             Status = j != null ? j.Status : "",
                             Total = a != null ? a.Quantity : 0,
                             IsDeleted = a.IsDeleted,
                             CusCode = "",
                             CusName = ""
                         }).ToList();
            var result = query.GroupBy(x => x.ProductCode).Select(delegate (IGrouping<string, InventoryRes> group)
            {
                var checkDeleted = group.Any(x => !x.IsDeleted);
                if (checkDeleted)
                {
                    return group.FirstOrDefault(x => !x.IsDeleted);
                }
                else
                {
                    var lastItem = group.OrderByDescending(x => x.Id).FirstOrDefault();
                    var customer = GetLastCustomer(lastItem.ProductCode);
                    lastItem.CusCode = customer.cusCode;
                    lastItem.CusName = customer.cusName;
                    lastItem.QuantityExp = customer.quantityExp;
                    return lastItem;
                }
            })
                .Select(delegate (InventoryRes item)
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
                    item.SumImport = GetSumImport(item.ProductCode, fromDate, toDate);
                    item.SumExport = GetSumExport(item.ProductCode, fromDate, toDate);
                    return item;
                }).OrderByDescending(x => x.Weight).ToList();
            return result;
        }
        private decimal GetSumImport(string productCode, DateTime? fromDate, DateTime? toDate)
        {
            return (from a in _context.ProductImportDetails
                .Where(x => !x.IsDeleted && x.ProductCode == productCode)
                    join b in _context.ProductImportHeaders.Where(x => !x.IsDeleted)
                    on a.TicketCode equals b.TicketCode
                    where (fromDate == null || (b != null && b.TimeTicketCreate >= fromDate))
                    && (toDate == null || (b != null && b.TimeTicketCreate <= toDate))
                    select a).Sum(x => x != null ? x.Quantity : 0);
        }
        private decimal GetSumExport(string productCode, DateTime? fromDate, DateTime? toDate)
        {
            return (from a in _context.ProductExportDetails
                .Where(x => !x.IsDeleted && x.ProductCode == productCode)
                    join b in _context.ProductExportHeaders.Where(x => !x.IsDeleted)
                    on a.TicketCode equals b.TicketCode
                    where (fromDate == null || (b != null && b.TimeTicketCreate >= fromDate))
                    && (toDate == null || (b != null && b.TimeTicketCreate <= toDate))
                    select a).Sum(x => x != null ? x.Quantity : 0);
        }
        private List<InventoryRes> GroupByGroupCode(List<InventoryRes> inventoryRes)
        {
            var result = new List<InventoryRes>();
            var groups = inventoryRes.GroupBy(x => x.ProductType);
            for (int i = 0; i < groups.Count(); i++)
            {
                var group = groups.ElementAt(i);
                var groupItem = new InventoryRes()
                {
                    Id = i + 1,
                    ProductCode = group.Key,
                    ProductName = group.FirstOrDefault().ProductGroup,
                    Quantity = group.Sum(x => x.Quantity),
                    QuantityExp = group.Sum(x => x.QuantityExp),
                    SumImport = group.Sum(x => x.SumImport),
                    SumExport = group.Sum(x => x.SumExport),
                    IsGroup = true
                };
                result.Add(groupItem);
                result.AddRange(group);
            }
            return result;
        }
        private List<InventoryRes> GroupByCustomer(List<InventoryRes> inventoryRes)
        {
            var result = new List<InventoryRes>();
            var groups = inventoryRes.GroupBy(x => x.CusCode);
            for (int i = 0; i < groups.Count(); i++)
            {
                var group = groups.ElementAt(i);
                var groupItem = new InventoryRes()
                {
                    Id = i + 1,
                    ProductCode = group.Key,
                    ProductName = group.FirstOrDefault().CusName,
                    QuantityExp = group.Sum(x => x.QuantityExp),
                    SumImport = group.Sum(x => x.SumImport),
                    SumExport = group.Sum(x => x.SumExport),
                    IsGroup = true
                };
                result.Add(groupItem);
                result.AddRange(group);
            }
            return result;
        }
        private List<InventoryRes> GroupByCustomerThenGroupCode(List<InventoryRes> inventoryRes)
        {
            var result = new List<InventoryRes>();
            var groups = inventoryRes.GroupBy(x => x.ProductType);
            for (int i = 0; i < groups.Count(); i++)
            {
                var group = groups.ElementAt(i);
                var groupItem = new InventoryRes()
                {
                    Id = i + 1,
                    ProductCode = group.Key,
                    ProductName = group.FirstOrDefault().CusName,
                    QuantityExp = group.Sum(x => x.QuantityExp),
                    SumImport = group.Sum(x => x.SumImport),
                    SumExport = group.Sum(x => x.SumExport),
                    IsGroup = true
                };
                result.Add(groupItem);
                var groupByGroupCode = GroupByGroupCode(group.ToList());
                result.AddRange(groupByGroupCode);
            }
            return result;
        }

        private List<InventoryRes> GroupByProdStatus(List<InventoryRes> inventoryRes)
        {
            var result = new List<InventoryRes>();
            var groups = inventoryRes.GroupBy(x => x.Status);
            for (int i = 0; i < groups.Count(); i++)
            {
                var group = groups.ElementAt(i);
                var groupItem = new InventoryRes()
                {
                    Id = i + 1,
                    ProductCode = group.Key,
                    ProductName = group.FirstOrDefault().ProductStatus,
                    Quantity = group.Sum(x => x.Quantity),
                    QuantityExp = group.Sum(x => x.QuantityExp),
                    SumImport = group.Sum(x => x.SumImport),
                    SumExport = group.Sum(x => x.SumExport),
                    IsGroup = true
                };
                result.Add(groupItem);
                result.AddRange(group);
            }
            return result;
        }
        private (string cusCode, string cusName, decimal quantityExp) GetLastCustomer(string productCode)
        {
            var lastExportDetail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.ProductCode == productCode)
            .OrderByDescending(x => x.Id).FirstOrDefault();
            if (lastExportDetail == null)
            {
                return ("", "", 0);
            }
            var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == lastExportDetail.TicketCode);
            if (header == null)
            {
                return ("", "", lastExportDetail != null ? lastExportDetail.Quantity : 0);
            }
            var customer = _context.Customerss.FirstOrDefault(x => x.IsDeleted == false && x.CusCode == header.CusCode);
            return (customer?.CusCode ?? "", customer?.CusName ?? "", lastExportDetail != null ? lastExportDetail.Quantity : 0);
        }

        [HttpPost]
        public IActionResult GetListReport(string groupType = "", string productCode = "", string storeCode = "", string ticketCode = "", string supplierCode = "", string createdBy = "", string startDate = "", string endDate = "")
        {
            try
            {
                var fromDate = !string.IsNullOrEmpty(startDate) ? DateTime.ParseExact(startDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(endDate) ? DateTime.ParseExact(endDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var result = new List<InventoryRes>();
                //GroupType = groupType;
                if (groupType == "FUEL")
                {
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
                                    && (string.IsNullOrEmpty(supplierCode) || (k != null && k.CusCode.Equals(supplierCode))
                                    && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
                                    && (fromDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime >= fromDate))
                                    && (toDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime <= toDate)))
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
                                     Quantity = a != null ? a.Quantity : 0,
                                     Weight = a.Weight,
                                     Image = b.Image,
                                     PathImg = b.Image,
                                     Total = a != null ? a.Quantity : 0
                                 }).ToList();
                    result = query.GroupBy(x => x.BottleCode)
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
                }
                if (groupType == "BOTTLE" || groupType == "STATIC_TANK")
                {
                    result = GetBottleStaticTank(productCode, storeCode, groupType, ticketCode, supplierCode, createdBy, fromDate, toDate);
                }
                if (groupType == "GROUP_CODE")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate);
                    result = GroupByGroupCode(resultDetail);
                }
                if (groupType == "CUSTOMER")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate)
                        .Where(x => !string.IsNullOrEmpty(x.CusCode)).ToList();
                    result = GroupByCustomer(resultDetail);
                }
                if (groupType == "CUS_GROUP")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate)
                        .Where(x => !string.IsNullOrEmpty(x.CusCode)).ToList();
                    result = GroupByCustomerThenGroupCode(resultDetail);
                }
                if (groupType == "PROD_STATUS")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate);
                    result = GroupByProdStatus(resultDetail);
                }
                ListInventoryRes = result;
                return Ok(ListInventoryRes);
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        [HttpPost]
        public IActionResult ExportExcelReport(string groupType = "", string productCode = "", string storeCode = "", string ticketCode = "", string supplierCode = "", string createdBy = "", string startDate = "", string endDate = "")
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(startDate) ? DateTime.ParseExact(startDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(endDate) ? DateTime.ParseExact(endDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                //var user = _context.Users.FirstOrDefault(x => x.UserName == model.UserName);
                var pathFile = "";
                var fileNameOutput = "";
                var result = new List<InventoryRes>();
                if (groupType == "FUEL")
                {
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
                                    && (string.IsNullOrEmpty(supplierCode) || (k != null && k.CusCode.Equals(supplierCode))
                                    && (string.IsNullOrEmpty(createdBy) || (/*k != null && k.UserImport*/a.CreatedBy.Equals(createdBy)))
                                    && (fromDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime >= fromDate))
                                    && (toDate == null || (/*k != null && k.TimeTicketCreate*/a.CreatedTime <= toDate)))
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
                                     Quantity = a != null ? a.Quantity : 0,
                                     Weight = a.Weight,
                                     Image = b.Image,
                                     PathImg = b.Image,
                                     Total = a != null ? a.Quantity : 0
                                 }).ToList();
                    result = query.GroupBy(x => x.BottleCode)
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
                }
                if (groupType == "BOTTLE" || groupType == "STATIC_TANK")
                {
                    result = GetBottleStaticTank(productCode, storeCode, groupType, ticketCode, supplierCode, createdBy, fromDate, toDate);
                }
                if (groupType == "GROUP_CODE")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate);
                    result = GroupByGroupCode(resultDetail);
                }
                if (groupType == "CUSTOMER")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate)
                        .Where(x => !string.IsNullOrEmpty(x.CusCode)).ToList();
                    result = GroupByCustomer(resultDetail);
                }
                if (groupType == "CUS_GROUP")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate)
                        .Where(x => !string.IsNullOrEmpty(x.CusCode)).ToList();
                    result = GroupByCustomerThenGroupCode(resultDetail);
                }
                if (groupType == "PROD_STATUS")
                {
                    var resultDetail = GetBottleStaticTank(productCode, storeCode, "BOTTLE", ticketCode, supplierCode, createdBy, fromDate, toDate);
                    result = GroupByProdStatus(resultDetail);
                }
                ListInventoryRes = result;

                var template = "/files/Template/Kho/BaoCaoKho.xlsx";
                if (groupType == "BOTTLE" || groupType == "STATIC_TANK" || groupType == "GROUP_CODE")
                {
                    template = "/files/Template/Kho/TongTonXuatNhapTheoSP.xlsx";
                }
                if (groupType == "CUSTOMER" || groupType == "CUS_GROUP")
                {
                    template = "/files/Template/Kho/TongTonXuatNhapTheoKH.xlsx";
                }
                if (groupType == "PROD_STATUS")
                {
                    template = "/files/Template/Kho/TongTonXuatNhapTheoTTSP.xlsx";
                }
                string fileName = string.Concat(_hostingEnvironment.WebRootPath, template);
                byte[] byteArray = System.IO.File.ReadAllBytes(fileName);
                using (MemoryStream stream = new MemoryStream())
                {
                    stream.Write(byteArray, 0, byteArray.Length);
                    using (ExcelEngine excelEngine = new ExcelEngine())
                    {
                        IApplication application = excelEngine.Excel;
                        stream.Position = 0;
                        IWorkbook workbook = application.Workbooks.Open(stream);
                        IWorksheet sheet = workbook.Worksheets[0];
                        sheet.Replace("{{from_date}}", fromDate.ToString() ?? "");
                        sheet.Replace("{{to_date}}", toDate.ToString() ?? "");
                        var row = 7;
                        if (groupType == "BOTTLE" || groupType == "STATIC_TANK" || groupType == "GROUP_CODE")
                        {
                            sheet = ProcessWorksheet(result, row, sheet);
                        }
                        if (groupType == "CUSTOMER" || groupType == "CUS_GROUP")
                        {
                            sheet = ProcessWorksheetCustomer(result, row, sheet);
                        }
                        if (groupType == "PROD_STATUS")
                        {
                            sheet = ProcessWorksheet(result, row, sheet);
                        }
                        workbook.Version = ExcelVersion.Xlsx;
                        fileNameOutput =
                        $"Báo cáo kho {DateTime.Now.ToString("ddMMyyy-hhmm")}.xlsx";
                        pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileNameOutput;
                        FileStream outputStream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
                        workbook.SaveAs(outputStream);
                        outputStream.Dispose();
                    }

                }
                //loadedDocument.Close(true);
                msg.Title = "Xuất file thành công";
                msg.Object = new
                {
                    FullPath = pathFile,
                    FileName = fileNameOutput,
                    Directory = "uploads\\tempFile\\"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                msg.Error = true;
                msg.Object = ex;
            }
            return Json(msg);
        }
        private IWorksheet ProcessWorksheet(List<InventoryRes> result, int row, IWorksheet sheet)
        {
            for (int j = 0; j < result.Count; j++)
            {
                sheet.Range["A" + row].Value2 = "";
                sheet.Range["B" + row].Value2 = result[j].ProductCode;
                sheet.Range["C" + row].Value2 = result[j].ProductName;
                sheet.Range["D" + row].Value2 = result[j] != null ? result[j].Unit : "";
                sheet.Range["E" + row].Value2 = 0;
                sheet.Range["F" + row].Value2 = result[j].SumImport;
                sheet.Range["G" + row].Value2 = result[j].SumExport;
                sheet.Range["H" + row].Value2 = result[j].Quantity;
                if (result[j].IsGroup)
                {
                    sheet.Range["A" + row].Value2 = result[j].Id;
                    sheet.Range[$"A{row}:H{row}"].CellStyle.Font.Bold = true;
                }
                row++;
                //id++;
            }
            sheet.Range["A" + row].Value2 = "Tổng";
            //sheet.Range["B" + row].Value2 = result[j].ProductCode;
            //sheet.Range["C" + row].Value2 = result[j].ProductName;
            //sheet.Range["D" + row].Value2 = result[j] != null ? result[j].Unit : "";
            sheet.Range["E" + row].Value2 = 0;
            sheet.Range["F" + row].Value2 = result.Where(x => !x.IsGroup).Sum(x => x.SumImport);
            sheet.Range["G" + row].Value2 = result.Where(x => !x.IsGroup).Sum(x => x.SumExport);
            sheet.Range["H" + row].Value2 = result.Where(x => !x.IsGroup).Sum(x => x.Quantity);
            return sheet;
        }
        private IWorksheet ProcessWorksheetCustomer(List<InventoryRes> result, int row, IWorksheet sheet)
        {
            for (int j = 0; j < result.Count; j++)
            {
                sheet.Range["A" + row].Value2 = "";
                sheet.Range["B" + row].Value2 = result[j].ProductCode;
                sheet.Range["C" + row].Value2 = result[j].ProductName;
                sheet.Range["D" + row].Value2 = result[j] != null ? result[j].Unit : "";
                sheet.Range["E" + row].Value2 = 0;
                sheet.Range["F" + row].Value2 = result[j].SumImport;
                sheet.Range["G" + row].Value2 = result[j].SumExport;
                sheet.Range["H" + row].Value2 = result[j].QuantityExp;
                if (result[j].IsGroup)
                {
                    sheet.Range["A" + row].Value2 = result[j].Id;
                    sheet.Range[$"A{row}:H{row}"].CellStyle.Font.Bold = true;
                }
                row++;
                //id++;
            }
            //sheet.Range["A" + row].Value2 = "Tổng";
            ////sheet.Range["B" + row].Value2 = result[j].ProductCode;
            ////sheet.Range["C" + row].Value2 = result[j].ProductName;
            ////sheet.Range["D" + row].Value2 = result[j] != null ? result[j].Unit : "";
            //sheet.Range["E" + row].Value2 = 0;
            //sheet.Range["F" + row].Value2 = result.Sum(x => x.SumImport);
            //sheet.Range["G" + row].Value2 = result.Sum(x => x.SumExport);
            //sheet.Range["H" + row].Value2 = result.Sum(x => x.Quantity);
            return sheet;
        }
        public class ModelGate
        {
            public string TaxNumber { get; set; }
            public string PassWord { get; set; }
            public string Status { get; set; }
            public string UserId { get; set; }
            public string CreatedBy { get; set; }
        }
    }
}
