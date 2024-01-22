using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using ESEIM;
using SmartBreadcrumbs.Attributes;
using System.Globalization;
using III.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.InkML;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FreeStorageController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<FreeStorageController> _stringLocalizer;
        private readonly IStringLocalizer<MaterialImpStoreController> _materialImpStoreLocalizer;
        private readonly IStringLocalizer<EDMSQRCodeManagerController> _qrCodeLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public FreeStorageController(EIMDBContext context, IOptions<AppSettings> appSettings,
            IStringLocalizer<FreeStorageController> stringLocalizer,
            IStringLocalizer<MaterialImpStoreController> materialImpStoreLocalizer,
            IStringLocalizer<EDMSQRCodeManagerController> qrCodeLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _materialImpStoreLocalizer = materialImpStoreLocalizer;
            _qrCodeLocalizer = qrCodeLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbFreeStorage", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbFreeStorage"] = _sharedResources["COM_CRUMB_FREE_STORAGE"];
            return View("Index");
        }

        #region Index
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

        #endregion

        #region Filter product
        [AllowAnonymous]
        [HttpPost]
        public object GetListUserImport()
        {
            var data = from a in _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                       select a;
            return data;
        }

        [HttpPost]
        public object GetDetailTicketCode(string ticketCode)
        {
            var data = _context.ProductImportHeaders.Where(x => x.TicketCode.Equals(ticketCode) && !x.IsDeleted).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title,
                x.StoreCode,
                x.Id
            }).FirstOrDefault();
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetProductDetail([FromBody] SearchProdModel obj)
        {
            var fromDate = !string.IsNullOrEmpty(obj.FromDate) ? DateTime.ParseExact(obj.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var data = (from e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted)
                        join a in _context.ProductImportDetails.Where(x => !x.IsDeleted) on e.IdImpProduct equals a.Id into a1
                        from a in a1.DefaultIfEmpty()
                        join c in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals c.TicketCode into c1
                        from c in c1.DefaultIfEmpty()
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on e.ProductCode equals b.ProductCode
                        join d in _context.Users.Where(x => x.Active) on e.CreatedBy equals d.UserName into d1
                        from d in d1.DefaultIfEmpty()
                        join g in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on e.WHS_Code equals g.WHS_Code into g1
                        from g in g1.DefaultIfEmpty()
                        //join g in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on e.WHS_Code equals g.ObjectCode
                        //into g1 from g in g1.DefaultIfEmpty()
                        //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on g.CategoryCode equals f.Code
                        //into f1
                        //from f in f1.DefaultIfEmpty()
                        join h in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on e.MappingCode equals h.ObjectCode
                        join i in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                            on new { h.CategoryCode, h.ObjectType } equals new
                            { CategoryCode = i.Code, ObjectType = i.PAreaType }
                        where !string.IsNullOrEmpty(e.ProductQrCode) && (string.IsNullOrEmpty(obj.TicketCode) || a.TicketCode.Equals(obj.TicketCode))
                        && (string.IsNullOrEmpty(obj.UserImport) || e.CreatedBy.Equals(obj.UserImport))
                        && (fromDate == null || e.CreatedTime >= fromDate)
                        && (toDate == null || e.CreatedTime <= toDate)
                        select new ProductMapDetail
                        {
                            MapId = e.Id,
                            Id = a != null ? a.Id : -1,
                            TicketCode = a != null ? a.TicketCode : "",
                            TicketName = c != null ? c.Title : "",
                            UserImport = d != null ? d.GivenName : "",
                            TimeTicketCreate = e.CreatedTime,
                            ProductName = b.ProductName,
                            ProductCode = b.ProductCode,
                            ProductNo = e.ProductNo,
                            Quantity = a != null ? a.Quantity : 0,
                            QuantityIsSet = a != null ? a.QuantityIsSet : 0,
                            QuantityMap = e.Quantity,
                            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == e.Unit).ValueSet,
                            SalePrice = a != null ? a.SalePrice : 0,
                            Currency = a != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet : "",
                            QrCode = CommonUtil.GeneratorQRCode(e.ProductQrCode),
                            ProductQRCode = e.ProductQrCode,
                            Remain = a != null ? a.Quantity - a.QuantityIsSet : 0,
                            PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                            SProductQrCode = CommonUtil.GenerateQRCode("SP:" + e.ProductQrCode + "_P:" + e.TicketCode + "_SL:" + e.Quantity),
                            UnitCode = e.Unit,
                            StoreName = g != null ? g.WHS_Name : "",
                            IdTicket = c != null ? c.Id : -1,
                            IdImpProduct = e != null ? e.IdImpProduct : -1,
                            StoreCode = e.WHS_Code,
                            Position = h.ObjectCode,
                            //OldPosition = e.ListLogs != null && e.ListLogs.Any() ? e.ListLogs.FirstOrDefault().OldMappingCode : ""
                        });
            return Json(data);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetPositionProductVatco(int id, string ticketCode)
        {
            var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
            if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
            {
                var data = (from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted)
                                //join b in _context.EDMSLines on a.LineCode equals b.LineCode
                                //join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                            where a.ProductCode == prodDetail.ProductCode
                            select new
                            {
                                a.Id,
                                a.ProductQrCode,
                                a.ProductNo,
                                a.Remain,
                                a.Size,
                                Ordered = a.Size,
                                a.TicketImpCode,
                                PositionInStore = a.MappingCode,
                                a.Quantity,
                                //a.RackCode,
                                //a.RackPosition,
                                a.CreatedBy,
                                a.CreatedTime,
                                a.UpdatedBy,
                                a.UpdatedTime
                            }).OrderBy(x => x.CreatedTime).ThenBy(p => p.PositionInStore);
                return Json(data);
            }
            else
            {
                var data = (from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted)
                                //join b in _context.EDMSLines on a.LineCode equals b.LineCode
                                //join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                            where a.IdImpProduct.Equals(id) /*&& a.TicketImpCode.Equals(ticketCode)*/
                            select new
                            {
                                a.Id,
                                a.ProductQrCode,
                                a.ProductNo,
                                a.Remain,
                                a.Size,
                                Ordered = a.Size,
                                a.TicketImpCode,
                                PositionInStore = a.MappingCode,
                                a.Quantity,
                                //a.RackCode,
                                //a.RackPosition,
                                a.CreatedBy,
                                a.CreatedTime,
                                a.UpdatedBy,
                                a.UpdatedTime
                            }).OrderBy(x => x.CreatedTime).ThenBy(p => p.PositionInStore);
                return Json(data);
            }
        }

        [AllowAnonymous]
        public async Task<object> MoveProductVatco([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                    .AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(data.IdImpProduct));
                if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    return await OrderProductStaticTank(data);
                }
                var maxId = _context.ProductLocatedMappings.MaxBy(x => x.Id) != null ? _context.ProductLocatedMappings.MaxBy(x => x.Id).Id : 1;
                var listProdStrNo = new List<ProdStrNo>();
                try
                {
                    listProdStrNo = ListProdStrNoHelper.GetListProdStrNo(data.ProductNo);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                if (listProdStrNo.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự không hợp lệ!";
                    return Json(msg);
                }
                var oldMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == data.Id);
                //var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == data.RackCode);
                //var productInRackCount = getProductInRack(data.RackCode);
                if (oldMapping != null)
                {
                    if (!oldMapping.ListProdStrNo.ContainsRange(listProdStrNo))
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không hợp lệ";
                        return Json(msg);
                    }
                    var quantity = listProdStrNo.SumQuantity();
                    if (quantity > (oldMapping.Quantity ?? 0))
                    {
                        msg.Error = true;
                        msg.Title = "Số lượng xếp không hợp lệ";
                        return Json(msg);
                    }
                    if (data.MappingCode == oldMapping.MappingCode)
                    {
                        msg.Error = true;
                        msg.Title = "Vị trí không thay đổi";
                        return Json(msg);
                    }
                    var newId = -1;
                    if (quantity < oldMapping.Quantity)
                    {
                        oldMapping.ListProdStrNo.Extract(listProdStrNo);
                        oldMapping.Quantity -= quantity;
                        _context.ProductLocatedMappings.Update(oldMapping);

                        //Thêm vào bảng Product_Entity_Mapping
                        var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == oldMapping.ProductCode
                            && x.IdImpProduct == oldMapping.IdImpProduct && x.GattrCode == oldMapping.GattrCode && x.MappingCode == data.MappingCode);
                        if (checkLocated == null)
                        {
                            var mapping = new ProductLocatedMapping
                            {
                                IdImpProduct = oldMapping.IdImpProduct,
                                MappingCode = data.MappingCode,
                                WHS_Code = data.WHS_Code,
                                ProductCode = oldMapping.ProductCode,
                                ProductType = oldMapping.ProductType,
                                ProductQrCode = oldMapping.ProductQrCode,
                                Quantity = quantity,
                                ListProdStrNo = listProdStrNo,
                                //ListProductNo = listProductNo,
                                Unit = oldMapping.Unit,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                GattrCode = oldMapping.GattrCode,
                                DeletionToken = "NA"
                            };

                            _context.ProductLocatedMappings.Add(mapping);
                            await _context.SaveChangesAsync();
                            newId = mapping.Id;
                        }
                        else
                        {
                            checkLocated.ListProdStrNo.AddRange(listProdStrNo);
                            checkLocated.Quantity = checkLocated.ListProdStrNo.SumQuantity();
                            _context.ProductLocatedMappings.Update(checkLocated);
                            newId = checkLocated.Id;
                        }
                    }
                    else
                    {
                        oldMapping.MappingCode = data.MappingCode;
                        oldMapping.WHS_Code = data.WHS_Code;
                        _context.ProductLocatedMappings.Update(oldMapping);
                    }

                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = oldMapping.IdImpProduct,
                        IdLocMapOld = oldMapping.Id,
                        IdLocatedMapping = newId,
                        MappingCode = data.MappingCode,
                        MappingCodeOld = oldMapping.MappingCode,
                        StoreCode = data.WHS_Code,
                        GattrCode = oldMapping.GattrCode,
                        ProductCode = oldMapping.ProductCode,
                        ProductNo = data.ProductNo,
                        ProductQrCode = oldMapping.ProductQrCode,
                        Quantity = quantity,
                        Unit = oldMapping.Unit,
                        TicketCode = "",
                        Type = "REARRANGE",
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(oldMapping.ProductCode));
                    //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                    var mpStatus = new MpStatus()
                    {
                        ActStatus = "ARRANGE",
                        ActTime = DateTime.Now,
                        ActBy = User.Identity.Name,
                        ProductNo = listProdStrNo.ToFlatString(),
                        MappingCode = data.MappingCode,
                        //SupCode = header?.SupCode,
                        //CusCode = header?.CusCode,
                    };
                    materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                    materialProduct.MpStatuses.Add(mpStatus);
                    var oldProdInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == oldMapping.IdImpProduct)
                        .ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(listProdStrNo));
                    if (data.MoveStock == true && oldProdInStock != null && oldProdInStock.StoreCode != data.WHS_Code)
                    {
                        if (quantity < oldProdInStock.Quantity)
                        {
                            //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                            oldProdInStock.ListProdStrNo.Extract(listProdStrNo);
                            oldProdInStock.Quantity -= quantity;
                            _context.ProductInStocks.Update(oldProdInStock);

                            //Thêm vào bảng Product_Entity_Mapping
                            var checkInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == oldMapping.ProductCode
                                && x.IdImpProduct == oldMapping.IdImpProduct && x.GattrCode == oldMapping.GattrCode && x.StoreCode == data.WHS_Code);
                            if (checkInStock == null)
                            {
                                var newParentInStock = new ProductInStock
                                {
                                    IdImpProduct = oldProdInStock.IdImpProduct,
                                    LotProductCode = oldProdInStock.LotProductCode,
                                    StoreCode = oldProdInStock.StoreCode,
                                    ProductCode = oldProdInStock.ProductCode,
                                    ProductType = oldProdInStock.ProductType,
                                    ProductQrCode = oldProdInStock.ProductQrCode,
                                    Quantity = quantity,
                                    ListProdStrNo = listProdStrNo,
                                    Unit = oldProdInStock.Unit,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    IsDeleted = false,
                                    //MarkWholeProduct = mark.Any() ? true : false,
                                    PackCode = oldProdInStock.PackCode,
                                    GattrCode = oldProdInStock.GattrCode,
                                    DeletionToken = "NA"
                                };
                                _context.ProductInStocks.Add(newParentInStock);
                            }
                            else
                            {
                                checkInStock.ListProdStrNo.AddRange(listProdStrNo);
                                checkInStock.Quantity = checkInStock.ListProdStrNo.SumQuantity();
                                _context.ProductInStocks.Update(checkInStock);
                            }
                        }
                        else
                        {
                            oldProdInStock.StoreCode = data.WHS_Code;
                            _context.ProductInStocks.Update(oldProdInStock);
                        }
                    }

                    _context.SaveChanges();
                    msg.Title = /*_stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"]*/"Xếp lại sản phẩm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = /*_stringLocalizer["Sản phẩm không còn ở vị trí"]*/"Sản phẩm không còn ở vị trí";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = /*_sharedResources["COM_MSG_ERR"]*/"Có lỗi xảy ra";
            }
            return Json(msg);
        }

        private async Task<object> OrderProductStaticTank([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                var oldMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.ProductCode);
                oldMapping.MappingCode = data.MappingCode;
                oldMapping.WHS_Code = data.WHS_Code;
                _context.ProductLocatedMappings.Update(oldMapping);

                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = oldMapping.IdImpProduct,
                    IdLocMapOld = oldMapping.Id,
                    IdLocatedMapping = oldMapping.Id,
                    MappingCode = data.MappingCode,
                    MappingCodeOld = oldMapping.MappingCode,
                    StoreCode = oldMapping.WHS_Code,
                    GattrCode = oldMapping.GattrCode,
                    ProductCode = oldMapping.ProductCode,
                    ProductNo = data.ProductNo,
                    ProductQrCode = oldMapping.ProductQrCode,
                    Quantity = oldMapping.Quantity,
                    Unit = oldMapping.Unit,
                    TicketCode = "",
                    Type = "REARRANGE",
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);
                var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(oldMapping.ProductCode));
                //var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "ARRANGE",
                    ActTime = DateTime.Now,
                    ActBy = User.Identity.Name,
                    ProductNo = data.ProductNo,
                    MappingCode = data.MappingCode,
                    //SupCode = header?.SupCode,
                    //CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        private void AddPackAndStock(ProductLocatedMapping data)
        {
            var packCode = $"PACK_{data.ProductQrCode}";
            var listPack = new List<WarehouseRecordsPack>();//Thêm dữ liệu bảng bút toán xếp kho
            var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(data.TicketCode));

            for (int i = 1; i <= data.Quantity; i++)
            {
                var detailPackCode = $"PACK_{data.ProductQrCode}";
                if (data.Quantity > 1)
                    packCode = $"{detailPackCode}_{i}";

                var pack = new WarehouseRecordsPack
                {
                    PackCode = packCode,
                    QrCode = packCode,
                    PackName = packCode,
                    PackLevel = "0",
                    PackHierarchyPath = packCode,
                    PackType = "PACK_TYPE_BOX",
                    PackQuantity = 1,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    ImportHeaderCode = data.TicketCode,
                    PackParent = GetParent(data.ProductCode, data.PackType, data.TicketCode)
                };

                listPack.Add(pack);
            }

            foreach (var item in listPack)
            {
                var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                if (!exitPack)
                    _context.WarehouseRecordsPacks.Add(item);
            }

            packCode = listPack.FirstOrDefault()?.PackCode;

            var storeInventory = _context.ProductInStockOlds.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
            if (storeInventory != null)
            {
                storeInventory.Quantity = storeInventory.Quantity + data.Quantity.Value;
                storeInventory.PackCode = packCode;
                _context.ProductInStockOlds.Update(storeInventory);
            }
            else
            {
                var storeInventoryObj = new ProductInStockOld
                {
                    //LotProductCode = obj.LotProductCode,
                    StoreCode = data.WHS_Code,

                    ProductCode = data.ProductCode,
                    ProductType = data.ProductType,
                    ProductQrCode = data.ProductQrCode,
                    Quantity = data.Quantity.Value,
                    Unit = data.Unit,
                    CreatedBy = data.CreatedBy,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    MarkWholeProduct = mark.Any() ? true : false,
                    PackCode = packCode
                };
                _context.ProductInStockOlds.Add(storeInventoryObj);
            }
        }

        public string GetParent(string productCode, string packing, string ticketCode)
        {
            var parentCode = string.Empty;
            try
            {
                var listDetail = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode) && x.ProductCode.Equals(productCode))
                                  select new Packing
                                  {
                                      PackType = a.PackType,
                                      PackCode = a.PackCode
                                  }).ToList();

                listDetail.ForEach(x => x.CountUnit = x.PackType.Split("x").Count());
                var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(productCode));
                var packingDefault = materialProduct != null ? materialProduct.Packing : "";
                var listUnitDefault = packingDefault.Split("x");
                var listUnitNew = packing.Split("x");
                if (listUnitNew.Count() < listUnitDefault.Count())
                {
                    var detail = listDetail.FirstOrDefault(x => x.CountUnit == listUnitNew.Count() + 1);
                    parentCode = detail != null ? detail.PackCode : "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }

            return parentCode;
        }

        public class Packing
        {
            public string PackType { get; set; }
            public string PackCode { get; set; }
            public int CountUnit { get; set; }
        }
        #endregion

        #region Ignored
        [HttpPost]
        public object JTable([FromBody] JtableMappingSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false)
                        join b in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true /*&& x.Type == "PR"*/) on a.WHS_Code equals b.WHS_Code into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFloors on a.FloorCode equals c.FloorCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.EDMSLines on a.LineCode equals d.LineCode into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.EDMSRacks on a.RackCode equals e.RackCode into e2
                        from e in e2.DefaultIfEmpty()
                        select new FreeStorageRes
                        {
                            Id = a.Id,
                            ProductQrCode = a.ProductQrCode,
                            WHS_Name = (b != null ? b.WHS_Name : ""),
                            FloorName = (c != null ? c.FloorName : ""),
                            L_Text = (d != null ? d.L_Text : ""),
                            RackName = (e != null ? e.RackName : ""),
                            RackPosition = a.RackPosition,
                            Position = (c != null ? c.FloorName : "") + "_" + (d != null ? d.L_Text : "") + "_" + (e != null ? e.RackName : ""),
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            foreach (var item in data1)
            {
                item.PositionOld = GetOldPos(item.Id);
            }
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "ProductQrCode", "WHS_Name", "FloorName", "L_Text", "RackName", "RackPosition", "Position", "PositionOld", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        public string GetOldPos(int Id)
        {
            string s = "";
            var dt = _context.EDMSMoveProductLogs.OrderByDescending(x => x.Id).FirstOrDefault(x => x.MappingId == Id);
            if (dt != null)
            {
                var data = from a in _context.EDMSMoveProductLogs
                           join b in _context.EDMSFloors on a.FloorCodeOld equals b.FloorCode into b2
                           from b in b2.DefaultIfEmpty()
                           join c in _context.EDMSLines on a.LineCodeOld equals c.LineCode into c2
                           from c in c2.DefaultIfEmpty()
                           join d in _context.EDMSRacks on a.RackCodeOld equals d.RackCode into d2
                           from d in d2.DefaultIfEmpty()
                           where a.MappingId == Id
                           orderby a.Id descending
                           select new
                           {
                               Position = (b != null ? b.FloorName : "") + "_" + (c != null ? c.L_Text : "") + "_" + (d != null ? d.RackName : "")
                           };
                var list = data.ToList();
                if (list.Count > 0)
                {
                    s = list[0].Position;
                }
            }
            return s;
        }

        public JsonResult GetProduct()
        {
            var data = from a in _context.ProductLocatedMappings
                       join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b2
                       from b in b2.DefaultIfEmpty()
                       where a.IsDeleted == false

                       select new
                       {
                           a.Id,
                           ProductQrCode = a.ProductQrCode + " _ " + (b != null ? b.RackName : ""),
                       };
            return Json(data);
        }

        public JsonResult GetFloorInStoreByProductId(int Id)
        {
            var data = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == Id);
            if (data != null && !string.IsNullOrEmpty(data.WHS_Code))
            {
                var listFloor = _context.EDMSFloors.Where(x => x.WHS_Code == data.WHS_Code).ToList();
                return Json(listFloor);
            }
            return Json(data);
        }

        public JsonResult GetLineByFloor(string floorCode)
        {
            var listFloor = _context.EDMSLines.Where(x => x.FloorCode == floorCode).ToList();
            return Json(listFloor);
        }

        public JsonResult GetRackByLine(string lineCode)
        {
            var listFloor = _context.EDMSRacks.Where(x => x.LineCode == lineCode).ToList();
            return Json(listFloor);
        }

        public JsonResult GetItem(int Id)
        {
            var query = from a in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false && x.Id == Id)
                        join b in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true) on a.WHS_Code equals b.WHS_Code into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFloors on a.FloorCode equals c.FloorCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.EDMSLines on a.LineCode equals d.LineCode into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.EDMSRacks on a.RackCode equals e.RackCode into e2
                        from e in e2.DefaultIfEmpty()

                        select new
                        {
                            a.Id,
                            a.ProductQrCode,
                            WHS_Name = (b != null ? b.WHS_Name : ""),
                            FloorName = (c != null ? c.FloorName : ""),
                            L_Text = (d != null ? d.L_Text : ""),
                            RackName = (e != null ? e.RackName : ""),
                            a.RackPosition,
                            a.Quantity
                        };
            return Json(query.FirstOrDefault());
        }
        [HttpPost]
        public JsonResult Update([FromBody] MoveProduct obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (data.FloorCode == obj.Floor && data.LineCode == obj.Line && data.RackCode == obj.Rack)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["FREE_STORAGE_MSG_ERR_UPDATE1"];//"Sản phẩm chọn đã được xếp vào vị trí của kệ này";
                    }
                    else if (obj.QuantityEmpty < obj.Quantity)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["FREE_STORAGE_MSG_UPDATE_QUANTITY_EMPTY"];//"Kệ không đủ chỗ trống";
                    }
                    else
                    {
                        //var data1 = _context.ProductLocatedMappings.FirstOrDefault(x => x.FloorCode == obj.Floor && x.LineCode == obj.Line && x.RackCode == obj.Rack && x.IsDeleted == false);
                        //if (data1 != null && data1.Id != data.Id)
                        //{
                        //    msg.Error = true;
                        //    msg.Title = "Đã có sản phẩm khác xếp ở vị trí này";
                        //}
                        //else
                        //{
                        EDMSMoveProductLog productLog = new EDMSMoveProductLog();
                        productLog.ProductCode = data.ProductQrCode;
                        productLog.RackCodeOld = data.RackCode;
                        productLog.RackCodeNew = obj.Rack;
                        productLog.LineCodeOld = data.LineCode;
                        productLog.FloorCodeOld = data.FloorCode;
                        productLog.MappingId = data.Id;
                        productLog.CreatedBy = ESEIM.AppContext.UserName;
                        productLog.CreatedTime = DateTime.Now;
                        _context.EDMSMoveProductLogs.Add(productLog);

                        data.FloorCode = obj.Floor;
                        data.LineCode = obj.Line;
                        data.RackCode = obj.Rack;

                        data.UpdatedBy = User.Identity.Name;
                        data.UpdatedTime = DateTime.Now;
                        _context.ProductLocatedMappings.Update(data);

                        var listExp = _context.ProductImportDetails.Where(x => x.ProductQrCode == data.ProductQrCode && x.IsDeleted == false).ToList();
                        foreach (var item in listExp)
                        {
                            item.RackCode = data.RackCode;
                        }
                        _context.ProductImportDetails.UpdateRange(listExp);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _stringLocalizer["FREE_STORAGE_MSG_UPDATE_SUCCESS"];//"Xếp lại vị trí sản phẩm thành công";
                        //}
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["FREE_STORAGE_MSG_ERR_UPDATE2"];//"Bản ghi không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                   .Union(_materialImpStoreLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                   .Union(_qrCodeLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                   .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class SearchProdModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserImport { get; set; }
            public string TicketCode { get; set; }
        }

        public class MoveProduct
        {
            public int Id { get; set; }
            public string Floor { get; set; }
            public string Line { get; set; }
            public string Rack { get; set; }
            public int QuantityEmpty { get; set; }
            public int Quantity { get; set; }
        }

        public class JtableMappingSearch : JTableModel
        {
            public string Product { get; set; }
            public string LotCode { get; set; }
            public string TicketCode { get; set; }
        }

        public class FreeStorageRes
        {
            public int Id { get; set; }
            public string ProductQrCode { get; set; }
            public string WHS_Name { get; set; }
            public string FloorName { get; set; }
            public string L_Text { get; set; }
            public string RackName { get; set; }
            public string RackPosition { get; set; }
            public string Position { get; set; }
            public string PositionOld { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        #endregion
    }

    internal class ProductMapDetail
    {
        public int MapId { get; set; }
        public int Id { get; set; }
        public string TicketCode { get; set; }
        public string TicketName { get; set; }
        public string UserImport { get; set; }
        public DateTime? TimeTicketCreate { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public string ProductNo { get; set; }
        public decimal Quantity { get; set; }
        public decimal? QuantityIsSet { get; set; }
        public decimal? QuantityMap { get; set; }
        public string Unit { get; set; }
        public decimal? SalePrice { get; set; }
        public string Currency { get; set; }
        public byte[] QrCode { get; set; }
        public string ProductQRCode { get; set; }
        public decimal? Remain { get; set; }
        public string PackType { get; set; }
        public string SProductQrCode { get; set; }
        public string UnitCode { get; set; }
        public string StoreName { get; set; }
        public int IdTicket { get; set; }
        public int? IdImpProduct { get; set; }
        public string StoreCode { get; set; }
        public string Position { get; set; }
    }
}