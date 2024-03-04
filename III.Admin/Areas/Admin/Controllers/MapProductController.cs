using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MapProductController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MapController> _stringLocalizer;
        private readonly IStringLocalizer<MaterialProductController> _stringMpLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MapProductController(
            EIMDBContext context,
            IStringLocalizer<MapController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<MaterialProductController> stringMpLocalizer)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringMpLocalizer = stringMpLocalizer;
            Console.WriteLine("MpLocalizer");
        }
        //[Breadcrumb("ViewData.CrumbMapProduct", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        //public IActionResult Index()
        //{
        //    ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
        //    ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
        //    ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
        //    ViewData["CrumbMapProduct"] = "Bản đồ vật tư thiết bị";
        //    return View();
        //}
        #region Product
        [HttpPost]
        public object SearchProduct([FromBody] MapSearch search)
        {
            var productKey = search.ProductKey != null ? search.ProductKey.ToLower() : "";
            var result = new List<ProductGps>();
            var query = (from a in _context.MaterialProducts
                         join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                         from d1 in d2.DefaultIfEmpty()
                         join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode
                         into f1
                         from f in f1.DefaultIfEmpty()
                         join g in _context.EDMSWareHouses.Where(x => x.WHS_Flag == false) on f.WHS_Code equals g.WHS_Code
                         into g1
                         from g in g1.DefaultIfEmpty()
                         where a.IsDeleted == false
                             && (string.IsNullOrEmpty(productKey) || (!string.IsNullOrEmpty(a.ProductName) && a.ProductName.ToLower().Contains(productKey))
                             || (!string.IsNullOrEmpty(a.ProductCode) && a.ProductCode.ToLower().Contains(productKey)))
                         select new
                         {
                             ProductCode = a.ProductCode,
                             ProductName = a.ProductName,
                             MpStatus = a.MpStatuses != null ? a.MpStatuses.LastOrDefault() : null,
                             MappingCode = f != null ? f.MappingCode : "",
                             WhsCode = g != null ? g.WHS_Code : null,
                         }).ToList();
            foreach (var item in query)
            {
                if (item.WhsCode != null)
                {
                    var wareHouse = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Flag == false && x.WHS_Code == item.WhsCode);
                    var mapGps = _context.MapDataGpss
                        .FirstOrDefault(x => !x.IsDeleted && x.ObjType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse)
                        && x.ObjCode == item.WhsCode);
                    if (mapGps != null && wareHouse != null)
                    {
                        result.Add(new ProductGps(mapGps.Id, item.ProductCode, item.ProductName, wareHouse.WHS_Code, wareHouse.WHS_Name,
                            new MapDataGps
                            {
                                Id = mapGps.Id,
                                Image = mapGps.Image,
                                CreatedBy = mapGps.CreatedBy,
                                CreatedTime = mapGps.CreatedTime,
                                DeletedBy = mapGps.DeletedBy,
                                DeletedTime = mapGps.DeletedTime,
                                Icon = mapGps.Icon,
                                GisData = mapGps.GisData,
                                IsActive = mapGps.IsActive,
                                IsDefault = mapGps.IsDefault,
                                IsDeleted = mapGps.IsDeleted,
                                MakerGPS = mapGps.MakerGPS,
                                MapCode = mapGps.MapCode,
                                ObjCode = mapGps.ObjCode,
                                ObjType = mapGps.ObjType,
                                PolygonGPS = mapGps.PolygonGPS,
                                Title = mapGps.Title,
                                UpdatedBy = mapGps.UpdatedBy,
                                UpdatedTime = mapGps.UpdatedTime
                            }, mapGps.IsActive, mapGps.IsDefault, mapGps.IsDeleted, "WAREHOUSE"
                        ));
                    }
                }
                else if (item.MpStatus != null && !string.IsNullOrEmpty(item.MpStatus.CusCode))
                {
                    var customer = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == item.MpStatus.CusCode);
                    var mapGps = _context.MapDataGpss
                        .FirstOrDefault(x => !x.IsDeleted && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)
                        && x.ObjCode == item.WhsCode);
                    if (mapGps != null && customer != null)
                    {
                        result.Add(new ProductGps(mapGps.Id, item.ProductCode, item.ProductName, customer.CusCode, customer.CusName,
                            new MapDataGps
                            {
                                Id = mapGps.Id,
                                Image = mapGps.Image,
                                CreatedBy = mapGps.CreatedBy,
                                CreatedTime = mapGps.CreatedTime,
                                DeletedBy = mapGps.DeletedBy,
                                DeletedTime = mapGps.DeletedTime,
                                Icon = mapGps.Icon,
                                GisData = mapGps.GisData,
                                IsActive = mapGps.IsActive,
                                IsDefault = mapGps.IsDefault,
                                IsDeleted = mapGps.IsDeleted,
                                MakerGPS = mapGps.MakerGPS,
                                MapCode = mapGps.MapCode,
                                ObjCode = mapGps.ObjCode,
                                ObjType = mapGps.ObjType,
                                PolygonGPS = mapGps.PolygonGPS,
                                Title = mapGps.Title,
                                UpdatedBy = mapGps.UpdatedBy,
                                UpdatedTime = mapGps.UpdatedTime
                            }, mapGps.IsActive, mapGps.IsDefault, mapGps.IsDeleted, "CUSTOMER"
                        ));
                    }
                }
                else if (item.MpStatus != null && !string.IsNullOrEmpty(item.MpStatus.SupCode))
                {
                    var supplier = _context.Suppliers.FirstOrDefault(x => !x.IsDeleted && x.SupCode == item.MpStatus.SupCode);
                    var mapGps = _context.MapDataGpss
                        .FirstOrDefault(x => !x.IsDeleted && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer)
                        && x.ObjCode == item.WhsCode);
                    if (mapGps != null && supplier != null)
                    {
                        result.Add(new ProductGps(mapGps.Id, item.ProductCode, item.ProductName, supplier.SupCode, supplier.SupName,
                            new MapDataGps
                            {
                                Id = mapGps.Id,
                                Image = mapGps.Image,
                                CreatedBy = mapGps.CreatedBy,
                                CreatedTime = mapGps.CreatedTime,
                                DeletedBy = mapGps.DeletedBy,
                                DeletedTime = mapGps.DeletedTime,
                                Icon = mapGps.Icon,
                                GisData = mapGps.GisData,
                                IsActive = mapGps.IsActive,
                                IsDefault = mapGps.IsDefault,
                                IsDeleted = mapGps.IsDeleted,
                                MakerGPS = mapGps.MakerGPS,
                                MapCode = mapGps.MapCode,
                                ObjCode = mapGps.ObjCode,
                                ObjType = mapGps.ObjType,
                                PolygonGPS = mapGps.PolygonGPS,
                                Title = mapGps.Title,
                                UpdatedBy = mapGps.UpdatedBy,
                                UpdatedTime = mapGps.UpdatedTime
                            }, mapGps.IsActive, mapGps.IsDefault, mapGps.IsDeleted, "SUPPLIER"
                        ));
                    }
                }
            }
            return Json(result);
        }
        [HttpPost]
        public object Jtable([FromBody] JtableProduct jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            try
            {
                var query = (from a in _context.MaterialProducts.AsNoTracking()
                             join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                             from b in b1.DefaultIfEmpty()
                             join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                             from c in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                             from d1 in d2.DefaultIfEmpty()
                             join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode into f1
                             from f in f1.DefaultIfEmpty()
                             where !a.IsDeleted
                                 && (string.IsNullOrEmpty(jTablePara.ProductKey) || (a.ProductCode.ToLower().Contains(jTablePara.ProductKey.ToLower())
                                 || a.ProductName.ToLower().Contains(jTablePara.ProductKey.ToLower())))
                             select new MaterialProductRes
                             {
                                 //idd=test(),
                                 id = a.Id,
                                 productcode = a.ProductCode,
                                 productname = a.ProductName,
                                 //unit = d1 != null ? d1.ValueSet : "Không xác định",
                                 //productgroup = b != null ? b.Name : "Không xác định",
                                 //producttype = c != null ? c.Name : "Không xác định",
                                 unit = d1 != null ? d1.ValueSet : "",
                                 productgroup = b != null ? b.Name : "",
                                 producttype = c != null ? c.Name : "",
                                 pathimg = a.Image,
                                 material = a.Material,
                                 pattern = a.Pattern,
                                 note = a.Note,
                                 sQrCode = /*a.QrCode*/a.ProductCode,
                                 supplier = a.Supplier,
                                 brand = a.Brand,
                                 sBarCode = a.Barcode,
                                 serial = a.Serial,
                                 jsonStatus = a.JsonStatus,
                                 mpStatus = a.MpStatuses != null ? a.MpStatuses.LastOrDefault() : null,
                                 mappingCode = f != null ? f.MappingCode : ""
                             }).ToList().DistinctBy(x => x.id);
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                foreach (var item in data1)
                {
                    //item.sQrCode = CommonUtil.GenerateQRCode(item.sQrCode);
                    item.sBarCode = CommonUtil.GenerateBarCode(item.sBarCode);
                    item.cusName = item.mpStatus != null ?
                        _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == item.mpStatus.CusCode)?.CusName : "";
                    item.supName = item.mpStatus != null ?
                        _context.Suppliers.FirstOrDefault(x => !x.IsDeleted && x.SupCode == item.mpStatus.SupCode)?.SupName : "";
                }
                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "productcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "supplier", "brand", "sBarCode", "serial", "jsonStatus", "mappingCode", "cusName", "supName");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "productcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "supplier", "brand", "sBarCode", "serial", "jsonStatus", "mappingCode", "cusName", "supName");

                return Json(jdata);
            }
        }
        public class JtableProduct : JTableModel
        {
            public string ProductKey { get; set; }
        }
        public class MaterialProductRes
        {
            public int id { get; set; }
            public string productcode { get; set; }
            public string productname { get; set; }
            public string unit { get; set; }
            public string productgroup { get; set; }
            public string producttype { get; set; }
            public string pathimg { get; set; }
            public string material { get; set; }
            public string pattern { get; set; }
            public string note { get; set; }
            public string sBarCode { get; set; }
            public string sQrCode { get; set; }
            public string supplier { get; set; }
            public string brand { get; set; }
            public string serial { get; set; }
            public string jsonStatus { get; set; }
            public string mappingCode { get; set; }
            public string cusName { get; set; }
            public string supName { get; set; }
            public MpStatus mpStatus { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringMpLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

    internal class ProductGps
    {
        public int Id { get; }
        public string ProductCode { get; }
        public string ProductName { get; }
        public string Code { get; }
        public string Name { get; }
        public string Type { get; }
        public MapDataGps MapDataGis { get; }
        public bool IsActive { get; }
        public bool IsDefault { get; }
        public bool IsDeleted { get; }

        public ProductGps(int id, string productCode, string productName, string code, string name, MapDataGps mapDataGis, bool isActive, bool isDefault, bool isDeleted, string type)
        {
            Id = id;
            ProductCode = productCode;
            ProductName = productName;
            Code = code;
            Name = name;
            MapDataGis = mapDataGis;
            IsActive = isActive;
            IsDefault = isDefault;
            IsDeleted = isDeleted;
            Type = type;
        }

        public override bool Equals(object obj)
        {
            return obj is ProductGps other &&
                   Id == other.Id &&
                   ProductCode == other.ProductCode &&
                   ProductName == other.ProductName &&
                   Code == other.Code &&
                   Name == other.Name &&
                   Type == other.Type &&
                   EqualityComparer<MapDataGps>.Default.Equals(MapDataGis, other.MapDataGis) &&
                   IsActive == other.IsActive &&
                   IsDefault == other.IsDefault &&
                   IsDeleted == other.IsDeleted;
        }

        public override int GetHashCode()
        {
            HashCode hash = new HashCode();
            hash.Add(Id);
            hash.Add(ProductCode);
            hash.Add(ProductName);
            hash.Add(Code);
            hash.Add(Name);
            hash.Add(Type);
            hash.Add(MapDataGis);
            hash.Add(IsActive);
            hash.Add(IsDefault);
            hash.Add(IsDeleted);
            return hash.ToHashCode();
        }
    }
}