using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using System.IO;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Http;
using static Dropbox.Api.Files.SearchMatchType;
using System.Data;
using III.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Syncfusion.EJ2.DocumentEditor;
using OpenXmlPowerTools;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductExportController : BaseWarehouseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<MaterialExpStoreController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<MaterialProductController> _materialProductController;
        private readonly IStringLocalizer<CustomerController> _customerLocalizer;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsLocalizer;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCj;
        private readonly IStringLocalizer<CommonSettingController> _commonSettingController;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IRepositoryService _repositoryService;
        public ProductExportController(
            EIMDBContext context,
            IStringLocalizer<MaterialExpStoreController> stringLocalizer,
            IStringLocalizer<CustomerController> customerLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<MaterialProductController> materialProductController,
            IHostingEnvironment hostingEnvironment,
            IStringLocalizer<EDMSRepositoryController> edmsLocalizer,
            IRepositoryService repositoryService,
            IStringLocalizer<WorkflowActivityController> workflowActivityController,
            IStringLocalizer<CardJobController> stringLocalizerCj,
            IStringLocalizer<CommonSettingController> commonSettingController)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _customerLocalizer = customerLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
            _edmsLocalizer = edmsLocalizer;
            _workflowActivityController = workflowActivityController;
            _stringLocalizerFp = stringLocalizerFp;
            _materialProductController = materialProductController;
            _stringLocalizerCj = stringLocalizerCj;
            _commonSettingController = commonSettingController;
        }
        public class JTableModelMaterialStoreExpGoodsHeaders : JTableModel
        {
            public string Title { get; set; }
            public string CusCode { get; set; }
            public string StoreCode { get; set; }
            public string UserExport { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Reason { get; set; }
            public string SupCode { get; set; }
        }
        public class JTableModelMaterialStoreExpGoodsDetails : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string GroupType { get; set; }
            public string Status { get; set; }
            public string CusCode { get; set; }
            public string UserExport { get; set; }

        }
        [Breadcrumb("ViewData.CrumbExpStore", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
        [AllowAnonymous]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbSaleWHHome"] = _sharedResources["COM_CRUMB_SALE_WH"];
            ViewData["CrumbExpStore"] = _sharedResources["COM_CRUMB_EXP_STORE"];
            return View();
        }

        [NonAction]
        public JsonResult JTable([FromBody] JTableModelMaterialStoreExpGoodsHeaders jTablePara, int userType = 0)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(userType, jTablePara.Title, jTablePara.CusCode, jTablePara.StoreCode, jTablePara.UserExport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.Reason, jTablePara.SupCode);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.QrTicketCode = CommonUtil.GenerateQRCode(item.TicketCode);
                //}

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserExport", "UserExportName", "UserReceipt", "CostTotal", "Currency", "CurrencyName", "Discount", "Commission", "TaxTotal", "Note", "PositionGps", "PositionText", "FromDevice", "TotalPayed", "TotalMustPayment", "InsurantTime", "TimeTicketCreate", "NextTimePayment", "Reason", "ReasonName", "StoreCodeReceipt", "PaymentStatus", "PaymentStatusName", "CreatedBy");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<MaterialStoreExpModel>(), jTablePara.Draw, 0, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserExport", "UserExportName", "UserReceipt", "CostTotal", "Currency", "CurrencyName", "Discount", "Commission", "TaxTotal", "Note", "PositionGps", "PositionText", "FromDevice", "TotalPayed", "TotalMustPayment", "InsurantTime", "TimeTicketCreate", "NextTimePayment", "Reason", "ReasonName", "StoreCodeReceipt", "PaymentStatus", "PaymentStatusName", "CreatedBy");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object GridDataOfUser([FromBody] JTableModelMaterialStoreExpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GridDataOfBranch([FromBody] JTableModelMaterialStoreExpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GridDataOfAdmin([FromBody] JTableModelMaterialStoreExpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 10);
        }

        [NonAction]
        public IQueryable<MaterialStoreExpModel> FuncJTable(int userType, string Title, string CusCode, string StoreCode, string UserExport,
            string FromDate, string ToDate, string Reason, string SupCode = "")
        {
            var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProductExportHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                             //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals c.ObjectCode
                             //join g in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals g.Code
                             //join c in _context.WarehouseZoneStructs.Where(x => !x.IsDeleted && x.ZoneType == "WAREHOUSE") on a.StoreCode equals c.ZoneCode
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true) on a.StoreCode equals c.WHS_Code
                         join d in _context.Users.Where(x => x.Active) on a.UserExport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON") on a.Reason equals e.CodeSet
                         into e1
                         from e in e1.DefaultIfEmpty()
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS") on a.PaymentStatus equals f.CodeSet
                         //join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)) on a.Currency equals g.CodeSet
                         join b in _context.Customerss.Where(x => x.IsDeleted != true) on a.CusCode equals b.CusCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(Title) || (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                         && (string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
                         && (string.IsNullOrEmpty(SupCode) || (a.SupCode == SupCode))
                         && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                         && (string.IsNullOrEmpty(UserExport) || (a.UserExport == UserExport))
                         && (string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate >= fromDate))
                         && (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate <= toDate))
                         && (string.IsNullOrEmpty(Reason) || (a.Reason == Reason))

                             //Điều kiện phân quyền dữ liệu
                             && (userType == 10
                                    || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                    || (userType == 0 && session.UserName == a.CreatedBy)
                                )
                         select new MaterialStoreExpModel
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             //QrTicketCode = CommonUtil.GeneratorQRCode(a.TicketCode),
                             ContractCode = a.ContractCode,
                             CusCode = a.CusCode,
                             CusName = b2 != null ? b2.CusName : "",
                             StoreCode = a.StoreCode,
                             StoreName = c.WHS_Name,
                             Title = a.Title,
                             UserExport = a.UserExport,
                             UserExportName = d.GivenName,
                             UserReceipt = a.UserReceipt,
                             CostTotal = a.CostTotal,
                             Currency = a.Currency,
                             //CurrencyName = g.ValueSet,
                             CurrencyName = "",
                             Discount = a.Discount,
                             Commission = a.Commission,
                             TaxTotal = a.TaxTotal,
                             Note = a.Note,
                             PositionGps = a.PositionGps,
                             PositionText = a.PositionText,
                             FromDevice = a.FromDevice,
                             TotalPayed = a.TotalPayed,
                             TotalMustPayment = a.TotalMustPayment,
                             InsurantTime = a.InsurantTime,
                             TimeTicketCreate = a.TimeTicketCreate,
                             NextTimePayment = a.NextTimePayment,
                             Reason = a.Reason,
                             ReasonName = e != null ? e.ValueSet : "",
                             StoreCodeReceipt = a.StoreCodeReceipt,
                             PaymentStatus = a.PaymentStatus,
                             PaymentStatusName = f.ValueSet,
                             CreatedBy = a.CreatedBy,
                         });
            return query;
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetItem([FromBody] int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", id);
                var item = _context.ProductExportHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.TicketStatus,
                    x.Title,
                    x.StoreCode,
                    x.ContractCode,
                    x.CusCode,
                    x.SupCode,
                    x.Reason,
                    x.StoreCodeReceipt,
                    x.CostTotal,
                    x.Currency,
                    x.Discount,
                    x.TaxTotal,
                    x.Commission,
                    x.TotalMustPayment,
                    x.TotalPayed,
                    x.PaymentStatus,
                    NextTimePayment = x.NextTimePayment.HasValue ? x.NextTimePayment.Value.ToString("dd/MM/yyyy") : "",
                    x.UserExport,
                    x.Note,
                    x.UserReceipt,
                    x.Status,
                    x.WorkflowCat,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                    x.GroupType,
                }).FirstOrDefault();

                var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                    join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                    join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                    from c2 in c1.DefaultIfEmpty()
                                    select new
                                    {
                                        a.ProductCode,
                                        a.ProductType,
                                        b.SupCode,
                                        c2.SupName
                                    }).ToList();

                var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
                {
                    p.First().ProductCode,
                    p.First().ProductType,
                    SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                    SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
                }).ToList();

                var ListPoProduct = (from a in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT" && y.TicketCode == item.TicketCode)
                                     join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                     join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductCode
                                     join c in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                     from c1 in c2.DefaultIfEmpty()
                                     join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                     from e2 in e1.DefaultIfEmpty()
                                     let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity)
                                     let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity)
                                     orderby b1.ProductName
                                     select new
                                     {
                                         ProductCode = a.ProductCode,
                                         ProductName = "Thành phẩm _ " + b1.ProductName,
                                         ProductType = "FINISHED_PRODUCT",
                                         Unit = b1.Unit,
                                         UnitName = (c1 != null ? c1.ValueSet : ""),
                                         QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                         QuantityNeedExport = a1.QuantityNeedExport,
                                         Quantity = a.Quantity,
                                         ProductCoil = a.ProductCoil,
                                         QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                         QuantityInStock = productInStock != null ? productInStock : 0,
                                         QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                         e2.SupCode,
                                         e2.SupName
                                     })
                               .Concat(from a in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT" && y.TicketCode == item.TicketCode)
                                       join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                       join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                       join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                       join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                       from c1 in c2.DefaultIfEmpty()
                                       join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                       from e2 in e1.DefaultIfEmpty()
                                       let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity)
                                       let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity)
                                       orderby b1.AttributeName
                                       select new
                                       {
                                           ProductCode = a.ProductCode,
                                           ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                           ProductType = "SUB_PRODUCT",
                                           Unit = b1.Unit,
                                           UnitName = (c1 != null ? c1.ValueSet : ""),
                                           QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                           QuantityNeedExport = a1.QuantityNeedExport,
                                           Quantity = a.Quantity,
                                           ProductCoil = a.ProductCoil,
                                           QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                           QuantityInStock = productInStock != null ? productInStock : 0,
                                           QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                           e2.SupCode,
                                           e2.SupName
                                       })
                                   .ToList();

                mess.Object = new { Header = item, ListPoProduct };
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = _stringLocalizer["MES_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetListProductGrid([FromBody] int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProductExportHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.TicketCode,
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
                                   join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                                   join a in _context.ProductLocatedMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                                   join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                                   join c in _context.EDMSLines on b.LineCode equals c.LineCode
                                   join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                                   join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductCode
                                   join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                                   join e in _context.ProdPackageReceiveds.Where(y => !y.IsDeleted) on g.ProductCoil equals e.CoilCode
                                   join f in _context.ProductImportHeaders.Where(y => !y.IsDeleted) on e.TicketCode equals f.TicketCode
                                   join h in _context.Suppliers.Where(y => !y.IsDeleted) on f.SupCode equals h.SupCode into h1
                                   from h2 in h1.DefaultIfEmpty()
                                   let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                                   orderby b1.ProductName
                                   select new
                                   {
                                       g.Id,
                                       ProductCode = a1.ProductCode,
                                       ProductType = "FINISHED_PRODUCT",
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductQrCode = a1.ProductQrCode,
                                       sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                       Unit = a1.Unit,
                                       UnitName = c1.ValueSet,

                                       Quantity = g.Quantity,
                                       RackCode = a.RackCode,
                                       RackName = name,
                                       ProductCoil = g.ProductCoil,
                                       SupCode = f.SupCode,
                                       SupName = h2.SupName,
                                       e.ProductLot
                                   })
                                 .Concat(from g in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
                                         join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                                         join a in _context.ProductLocatedMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                                         join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                                         join c in _context.EDMSLines on b.LineCode equals c.LineCode
                                         join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                                         join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductQrCode
                                         join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                         join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                                         join e in _context.ProdPackageReceiveds.Where(y => !y.IsDeleted) on g.ProductCoil equals e.CoilCode
                                         join f in _context.ProductImportHeaders.Where(y => !y.IsDeleted) on e.TicketCode equals f.TicketCode
                                         join h in _context.Suppliers.Where(y => !y.IsDeleted) on f.SupCode equals h.SupCode into h1
                                         from h2 in h1.DefaultIfEmpty()
                                         let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                                         orderby b1.AttributeName
                                         select new
                                         {
                                             g.Id,
                                             ProductCode = a1.ProductCode,
                                             ProductType = "SUB_PRODUCT",
                                             ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                             ProductQrCode = a1.ProductQrCode,
                                             sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                             Unit = a1.Unit,
                                             UnitName = c1.ValueSet,
                                             Quantity = g.Quantity,
                                             RackCode = a.RackCode,
                                             RackName = name,
                                             ProductCoil = g.ProductCoil,
                                             SupCode = f.SupCode,
                                             SupName = h2.SupName,
                                             e.ProductLot
                                         })
                                   .ToList();

                mess.Object = new { ListProduct };
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MES_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody] MaterialStoreExpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangeContract = false;
                var poOldTime = DateTime.Now;
                var chk = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProductExportHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        TicketStatus = obj.Status,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
                        ContractCode = obj.ContractCode,
                        CusCode = obj.CusCode,
                        SupCode = obj.SupCode,
                        Reason = obj.Reason,
                        StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "",
                        CostTotal = obj.CostTotal,
                        Currency = obj.Currency,
                        Discount = obj.Discount,
                        TaxTotal = obj.TaxTotal,
                        Commission = obj.Commission,
                        TotalMustPayment = obj.TotalMustPayment,
                        TotalPayed = obj.TotalPayed,
                        PaymentStatus = obj.Currency == "VND"
                                                ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE"
                                                : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE",
                        NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        UserExport = obj.UserExport,
                        Note = obj.Note,
                        UserReceipt = obj.UserReceipt,
                        InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,

                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        DeletionToken = "NA",
                        Status = "",
                        GroupType = obj.GroupType,
                        WorkflowCat = obj.WorkflowCat
                    };
                    _context.ProductExportHeaders.Add(objNew);

                    //Xử lý khi xuất lẻ
                    if (obj.ListPoProduct.Count == 0)
                    {

                    }
                    //Xử lý khi xuất theo PO  ==> Chú ý: Phần chi tiết của xuất kho theo PO xử lý trực tiếp trên DB khi thêm theo Cuộn/Thùng - Chỉ thêm list Detail ở ngoài với Quantity = 0
                    else
                    {
                        foreach (var item in obj.ListPoProduct)
                        {
                            //Insert bảng detail - mỗi sản phẩm chỉ 1 bản ghi (Ko nhập QrCode nữa)
                            var objNewDetail = new ProductExportDetail
                            {
                                LotProductCode = obj.LotProductCode,
                                TicketCode = obj.TicketCode,
                                Currency = obj.Currency,

                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                Quantity = 0,
                                Unit = item.Unit,

                                ProductCoil = item.ProductCoil,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                DeletionToken = "NA"
                            };
                            _context.ProductExportDetails.Add(objNewDetail);
                        }
                    }

                    await _context.SaveChangesAsync();

                    if (obj.ListPoProduct.Count == 0)
                    {
                    }
                    else
                    {
                        //export PO CUS
                        foreach (var item in obj.ListPoProduct)
                        {
                            string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { item.ProductCode, 0, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate };
                            _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
                        }
                    }

                    //Thêm log dữ liệu
                    var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các ProdPackageInfoHistorys
                    var detailInfoHistory = _context.ProdPackageDeliverys.Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailInfoHistory = detailInfoHistory
                        };

                        var listLogData = new List<object>();
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.ProductExportHeaders.Update(header);
                        await _context.SaveChangesAsync();
                    }
                    msg.ID = header.Id;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult Update([FromBody] MaterialStoreExpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;

                var objUpdate = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    var lstStatus = new List<JsonStatus>();
                    var oldTimeTicketCreate = objUpdate.TimeTicketCreate;
                    var oldLotProductCode = objUpdate.LotProductCode;
                    //Update bảng header
                    objUpdate.LotProductCode = obj.LotProductCode;
                    objUpdate.TicketCode = obj.TicketCode;
                    objUpdate.TicketStatus = obj.Status;
                    objUpdate.Title = obj.Title;
                    objUpdate.StoreCode = obj.StoreCode;
                    objUpdate.ContractCode = obj.ContractCode;
                    objUpdate.CusCode = obj.CusCode;
                    objUpdate.SupCode = obj.SupCode;
                    objUpdate.Reason = obj.Reason;
                    objUpdate.StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "";
                    objUpdate.CostTotal = obj.CostTotal;
                    objUpdate.Currency = obj.Currency;
                    objUpdate.Discount = obj.Discount;
                    objUpdate.TaxTotal = obj.TaxTotal;
                    objUpdate.Commission = obj.Commission;
                    objUpdate.TotalMustPayment = obj.TotalMustPayment;
                    objUpdate.TotalPayed = obj.TotalPayed;
                    objUpdate.PaymentStatus = obj.Currency == "VND"
                                            ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE"
                                            : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE";
                    objUpdate.NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    objUpdate.UserExport = obj.UserExport;
                    objUpdate.Note = obj.Note;
                    objUpdate.UserReceipt = obj.UserReceipt;
                    objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    objUpdate.GroupType = obj.GroupType;
                    objUpdate.UpdatedBy = ESEIM.AppContext.UserName;
                    objUpdate.UpdatedTime = DateTime.Now;

                    //Work flow update status
                    var session = HttpContext.GetSessionUser();
                    if (!string.IsNullOrEmpty(objUpdate.Status))
                    {
                        lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                    }
                    objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);

                    _context.ProductExportHeaders.Update(objUpdate);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);

                    //Update dữ liệu bảng dự báo - chỉ sửa thời gian
                    var listDetail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode).ToList();
                    foreach (var item in listDetail)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { item.ProductCode, 0, 0, item.ProductType, obj.LotProductCode, objUpdate.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }

                    //Thêm log dữ liệu
                    var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các ProdPackageInfoHistorys
                    var detailInfoHistory = _context.ProdPackageDeliverys.Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailInfoHistory = detailInfoHistory
                        };
                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductExportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductExportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MES_MSG_CODE_EXITS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Delete([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProductExportHeaders.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_SHIPMENT"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["MES_TITLE_INFORMATION_SHIPMENT"]);
                }
                else
                {
                    if (data.TicketStatus == "INITIAL_DONE")
                    {
                        msg.Error = true;
                        msg.Title = "Phiếu xuất đã xử lý xong không được xóa";
                        return Ok(msg);
                    }
                    //xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.DeletionToken = Guid.NewGuid().ToString();
                    _context.ProductExportHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    foreach (var item in listDetail)
                    {
                        await DelDeliveryDetail(item.Id);
                    }
                    //_context.ProductExportDetails.UpdateRange(listDetail);

                    //Thêm log dữ liệu
                    var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode));
                    var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                    var detailQrcode = _context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailQrcode = detailQrcode
                        };
                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductExportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductExportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetUpdateLog(string ticketCode)
        {
            var msg = new JMessage();
            var data = _context.ProductExportHeaders.FirstOrDefault(x => x.TicketCode == ticketCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTableDetail([FromBody] JTableModelMaterialStoreExpGoodsDetails jTablePara)
        {
            try
            {

                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
                var query = (from a in _context.ProductExportDetails.Where(x => !x.IsDeleted)
                             join a1 in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals a1.TicketCode
                             join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                             join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.MapId equals c.Id into c1
                             from c in c1.DefaultIfEmpty()
                             //join d in _context.EDMSLines on c.LineCode equals d.LineCode
                             //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                             //join f in _context.EDMSFloors on c.FloorCode equals f.FloorCode
                             join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals d.ObjectCode
                             into d1
                             from d in d1.DefaultIfEmpty()
                             join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 on new { d.CategoryCode, d.ObjectType } equals new
                                 { CategoryCode = e.Code, ObjectType = e.PAreaType }
                             into e1
                             from e in e1.DefaultIfEmpty()
                             where
                             (string.IsNullOrEmpty(jTablePara.ProductCode) || (a.ProductCode == jTablePara.ProductCode))
                             && (string.IsNullOrEmpty(jTablePara.GroupType) || (a1.GroupType == jTablePara.GroupType))
                             && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status != null && a.Status.Contains(jTablePara.Status)))
                             && (string.IsNullOrEmpty(jTablePara.CusCode) || (a1.CusCode == jTablePara.CusCode))
                             && (string.IsNullOrEmpty(jTablePara.FromDate) || (a1.TimeTicketCreate >= fromDate))
                             && (string.IsNullOrEmpty(jTablePara.ToDate) || (a1.TimeTicketCreate <= toDate))
                             && (string.IsNullOrEmpty(jTablePara.UserExport) || (a1.UserExport == jTablePara.UserExport))
                             select new ProductExpDetail
                             {
                                 Id = a.Id,
                                 ProductName = b.ProductName,
                                 ProductCode = b.ProductCode,
                                 Quantity = a.Quantity,
                                 Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Unit)).ValueSet,
                                 SalePrice = a.SalePrice,
                                 Status = a.Status,
                                 UnitMoney = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Currency)).ValueSet,
                                 Position = d != null ? d.ObjectCode : "Đã thay đổi",
                                 IsCustomized = a.IsCustomized,
                                 ProdCustomJson = a.ProdCustomJson,
                                 Type = a.ExpType == "PARTIAL" ? "Rút linh kiện" : "Rút toàn bộ",
                                 IdProduct = b.Id,
                                 Serial = b.Serial,
                                 TicketCode = a.TicketCode,
                                 TicketName = a1.Title,
                                 Weight = a.Weight
                             }).ToList().DistinctBy(x => x.Id);
                foreach (var item in query)
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
                    //item.SumSalePrice = item.ListBottleDetails.Sum(x => x.SalePrice ?? 0);
                }

                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.QrTicketCode = CommonUtil.GenerateQRCode(item.TicketCode);
                //}
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "ProductName", "UnitMoney", "SalePrice", "Quantity", "IsCustomized", "Unit", "Type", "IdProduct", "ProductStatus", "Position", "Serial", "TicketCode", "TicketName", "Weight");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<ProductExpDetail>(), jTablePara.Draw, 0, "Id", "ProductCode", "ProductName", "UnitMoney", "SalePrice", "Quantity", "IsCustomized", "Unit", "Type", "IdProduct", "ProductStatus", "Position", "Serial", "TicketCode", "TicketName", "Weight");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult CreateTicketCode(string type)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketCode = string.Empty;
                var monthNow = DateTime.Now.Month;
                var yearNow = DateTime.Now.Year;
                //var expODD = _context.ProductExportHeaders.MaxBy(x => x.Id);

                switch (type)
                {
                    case "ODD":
                        {
                            var expODD = _context.ProductExportHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noODD = 1;
                            if (expODD != null)
                            {
                                noODD = noODD + expODD.Count;
                            }
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("EXP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                                isExist = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noODD++;
                            }
                            break;
                        }
                    case "PO":
                        {
                            var expPO = _context.ProductExportHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noPO = 1;
                            if (expPO != null)
                            {
                                noPO = noPO + expPO.Count;
                            }
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("EXP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
                                isExist = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noPO++;
                            }
                            break;
                        }
                }

                mess.Object = ticketCode;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetCountExport()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var countHeader = (from a in _context.ProductExportHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                                   join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true) on a.StoreCode equals c.WHS_Code
                                   join d in _context.Users.Where(x => x.Active) on a.UserExport equals d.UserName
                                   join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON") on a.Reason equals e.CodeSet
                                   into e1
                                   from e in e1.DefaultIfEmpty()
                                   join f in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS") on a.PaymentStatus equals f.CodeSet
                                   join b in _context.Customerss.Where(x => x.IsDeleted != true) on a.CusCode equals b.CusCode into b1
                                   from b2 in b1.DefaultIfEmpty()
                                   select a).Count();
                var countDetail = (from a in _context.ProductExportDetails.Where(x => !x.IsDeleted)
                                   join a1 in _context.ProductExportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals a1.TicketCode
                                   join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                   join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.MapId equals c.Id
                                   join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals d.ObjectCode
                                   into d1
                                   from d in d1.DefaultIfEmpty()
                                   join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                       on new { d.CategoryCode, d.ObjectType } equals new
                                       { CategoryCode = e.Code, ObjectType = e.PAreaType }
                                   into e1
                                   from e in e1.DefaultIfEmpty()
                                   select a).Count();
                mess.Object = new
                {
                    CountHeader = countHeader,
                    CountDetail = countDetail
                };
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }


        //Export Excel
        [AllowAnonymous]
        [HttpGet]
        public ActionResult ExportExcelProduct(string ticketCode)
        {
            var expHeader = _context.ProductExportHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
            {
                x.LotProductCode,
                x.TicketCode,
                x.Title,
                x.StoreCode,
                x.ContractCode,
                x.CusCode,
                Reason = _context.CommonSettings.FirstOrDefault(p => p.CodeSet.Equals(x.Reason)) != null ? _context.CommonSettings.FirstOrDefault(p => p.CodeSet.Equals(x.Reason)).ValueSet : "",
                x.StoreCodeReceipt,
                x.CostTotal,
                x.Currency,
                x.Discount,
                x.TaxTotal,
                x.Commission,
                x.TotalMustPayment,
                x.TotalPayed,
                x.PaymentStatus,
                NextTimePayment = x.NextTimePayment.HasValue ? x.NextTimePayment.Value.ToString("dd/MM/yyyy") : "",
                x.UserExport,
                x.Note,
                x.UserReceipt,
                InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                Branch = _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)) != null ? _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)).Branch.OrgName : "",
                CreatedTime = x.TimeTicketCreate.HasValue ? "Ngày " + x.TimeTicketCreate.Value.Day + " tháng " + x.TimeTicketCreate.Value.Month + " năm " + x.TimeTicketCreate.Value.Year : "",
                StoreName = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_Name : "",
                StoreAddress = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_ADDR_Text : ""
            }).FirstOrDefault();

            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            var listProduct = (from g in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && string.IsNullOrEmpty(y.LotProductCode))
                               join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                               join a in _context.ProductLocatedMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                               join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                               join c in _context.EDMSLines on b.LineCode equals c.LineCode
                               join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                               join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductCode
                               join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                               join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
                               from e2 in e1.DefaultIfEmpty()
                               let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                               orderby b1.ProductName
                               select new
                               {
                                   ProductCode = a1.ProductCode,
                                   ProductType = "FINISHED_PRODUCT",
                                   ProductName = "Thành phẩm _ " + b1.ProductName,
                                   ProductQrCode = a1.ProductQrCode,
                                   sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                   Unit = a1.Unit,
                                   UnitName = c1.ValueSet,

                                   Quantity = g.Quantity,
                                   RackCode = a.RackCode,
                                   RackName = name,
                                   ProductCoil = g.ProductCoil,
                                   SalePrice = g.SalePrice,
                                   e2.SupCode,
                                   e2.SupName
                               })
                             .Concat(from g in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && string.IsNullOrEmpty(y.LotProductCode))
                                     join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                                     join a in _context.ProductLocatedMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                                     join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                                     join c in _context.EDMSLines on b.LineCode equals c.LineCode
                                     join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                                     join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductQrCode
                                     join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                     join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                                     join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
                                     from e2 in e1.DefaultIfEmpty()
                                     let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                                     orderby b1.AttributeName
                                     select new
                                     {
                                         ProductCode = a1.ProductCode,
                                         ProductType = "SUB_PRODUCT",
                                         ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                         ProductQrCode = a1.ProductQrCode,
                                         sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                         Unit = a1.Unit,
                                         UnitName = c1.ValueSet,
                                         Quantity = g.Quantity,
                                         RackCode = a.RackCode,
                                         RackName = name,
                                         ProductCoil = g.ProductCoil,
                                         SalePrice = g.SalePrice,
                                         e2.SupCode,
                                         e2.SupName
                                     });
            var listPoProduct = (from a in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT" && y.TicketCode == ticketCode)
                                 join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                 join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductCode
                                 //join e1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.LotProductCode equals e1.ContractCode into e2
                                 //from e in e2.DefaultIfEmpty()
                                 join c in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                 from c1 in c2.DefaultIfEmpty()
                                 join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                 from e2 in e1.DefaultIfEmpty()
                                     //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                 let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                 let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == expHeader.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                 orderby b1.ProductName
                                 select new
                                 {
                                     ProductCode = a.ProductCode,
                                     ProductName = "Thành phẩm _ " + b1.ProductName,
                                     ProductType = "FINISHED_PRODUCT",
                                     //ProductQrCode = productQrCode,
                                     //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                     Unit = b1.Unit,
                                     UnitName = (c1 != null ? c1.ValueSet : ""),
                                     QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                     Quantity = a.Quantity,
                                     ProductCoil = a.ProductCoil,
                                     SalePrice = a.SalePrice,
                                     //QuantityInStockTotal = (decimal)b1.InStock,
                                     QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                     QuantityInStock = productInStock != null ? productInStock : 0,
                                     QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                     ListProductInRack = (from a3 in _context.ProdPackageDeliverys.Where(y => y.TicketCode == ticketCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT")
                                                          join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
                                                          join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
                                                          join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
                                                          join f3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductCode
                                                          join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
                                                          let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
                                                          orderby f3.ProductName
                                                          select new
                                                          {
                                                              ProductCode = a3.ProductCode,
                                                              ProductType = "FINISHED_PRODUCT",
                                                              ProductName = "Thành phẩm _ " + f3.ProductName,
                                                              ProductQrCode = a3.ProductQrCode,
                                                              sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
                                                              Unit = f3.Unit,
                                                              UnitName = g3.ValueSet,

                                                              Quantity = a3.Size,
                                                              RackCode = a3.RackCode,
                                                              RackName = name,
                                                              ProductCoil = a3.CoilCode,
                                                              a3.ProductLot,
                                                          }),
                                     e2.SupCode,
                                     e2.SupName
                                 })
                           .Concat(from a in _context.ProductExportDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT" && y.TicketCode == ticketCode)
                                   join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                   join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                   join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                   join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                   let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == expHeader.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                   orderby b1.AttributeName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                       ProductType = "SUB_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                       Quantity = a.Quantity,
                                       ProductCoil = a.ProductCoil,
                                       SalePrice = a.SalePrice,
                                       //QuantityInStockTotal = (decimal)b1.InStock,
                                       QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                       QuantityInStock = productInStock != null ? productInStock : 0,
                                       QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                       ListProductInRack = (from a3 in _context.ProdPackageDeliverys.Where(y => y.TicketCode == ticketCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT")
                                                            join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
                                                            join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
                                                            join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
                                                            join f3 in _context.SubProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductQrCode
                                                            join i3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on f3.ProductCode equals i3.ProductCode
                                                            join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
                                                            let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
                                                            orderby f3.AttributeName
                                                            select new
                                                            {
                                                                ProductCode = a3.ProductCode,
                                                                ProductType = "SUB_PRODUCT",
                                                                ProductName = i3.ProductCode + " _ " + f3.AttributeName,
                                                                ProductQrCode = a3.ProductQrCode,
                                                                sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
                                                                Unit = f3.Unit,
                                                                UnitName = g3.ValueSet,

                                                                Quantity = a3.Size,
                                                                RackCode = a3.RackCode,
                                                                RackName = name,
                                                                ProductCoil = a3.CoilCode,
                                                                a3.ProductLot,
                                                            }),
                                       e2.SupCode,
                                       e2.SupName
                                   });

            var data = listProduct.ToList();
            var dataPo = listPoProduct.ToList();

            var listExport = new List<ProdDeliveryDetailExport>();
            var no = 1;
            if (data.Count > 0)
            {
                foreach (var item in data)
                {
                    var itemExport = new ProdDeliveryDetailExport();
                    itemExport.No = no;
                    itemExport.ProductName = item.ProductName;
                    itemExport.ProductCode = item.ProductCode;
                    itemExport.Unit = item.UnitName;
                    itemExport.QuantityPO = item.Quantity;
                    itemExport.Quantity = item.Quantity;
                    itemExport.SalePrice = item.SalePrice;
                    itemExport.TotalAmount = item.SalePrice ?? 0 * item.Quantity;

                    no = no + 1;
                    listExport.Add(itemExport);
                }
            }

            if (dataPo.Count > 0)
            {
                foreach (var item in dataPo)
                {
                    var itemExport = new ProdDeliveryDetailExport();
                    itemExport.No = no;
                    itemExport.ProductName = item.ProductName;
                    itemExport.ProductCode = item.ProductCode;
                    itemExport.Unit = item.UnitName;
                    itemExport.QuantityPO = item.Quantity;
                    itemExport.Quantity = item.Quantity;
                    itemExport.SalePrice = item.SalePrice;
                    itemExport.TotalAmount = item.SalePrice ?? 0 * item.Quantity;

                    no = no + 1;
                    listExport.Add(itemExport);
                }
            }

            if (expHeader != null)
            {

            }

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                var pathTemplate = Path.Combine(_hostingEnvironment.WebRootPath, "files\\ExportStore_Template.xlsx");

                FileStream fileStream = new FileStream(pathTemplate, FileMode.Open, FileAccess.ReadWrite);

                IWorkbook workbook = application.Workbooks.Open(fileStream);
                IWorksheet worksheet = workbook.Worksheets[0];
                worksheet.InsertRow(14, listExport.Count, ExcelInsertOptions.FormatAsAfter);

                //Create Template Marker Processor
                ITemplateMarkersProcessor marker = workbook.CreateTemplateMarkersProcessor();

                IStyle bodyStyle = workbook.Styles.Add("BodyStyle");
                bodyStyle.BeginUpdate();
                //bodyStyle.Color = Color.FromArgb(239, 243, 247);
                bodyStyle.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                bodyStyle.VerticalAlignment = ExcelVAlign.VAlignCenter;
                bodyStyle.WrapText = true;
                bodyStyle.EndUpdate();

                //Add collections to the marker variables where the name should match with input template
                marker.AddVariable("listProduct", listExport);
                marker.AddVariable("expHeader", expHeader);

                //Process the markers in the template
                marker.ApplyMarkers();


                int row = 14;
                int totalRow = row + listExport.Count();

                worksheet.Range["A15" + ":H" + totalRow].CellStyle = bodyStyle;
                worksheet.UsedRange.AutofitColumns();
                worksheet.UsedRange.AutofitRows();
                worksheet.ImportData(listExport, 14, 1, false);

                worksheet.Columns[2].ColumnWidth = 15;
                worksheet.Range["A2"].Text = "ĐƠN VỊ: " + expHeader.Branch;
                worksheet.Range["A3"].Text = "Bộ phận: ";
                worksheet.Range["B7"].Text = "Họ tên, người nhận hàng: " + expHeader.Reason + " Địa chỉ(Bộ phận):";
                worksheet.Range["B8"].Text = "Lý do xuất kho: " + expHeader.UserReceipt;
                worksheet.Range["B9"].Text = "Xuất tại kho: " + expHeader.StoreName + " Địa điểm: " + expHeader.StoreAddress;
                worksheet.Range["B" + totalRow + ":D" + totalRow].Merge(true);
                worksheet.Range["B" + totalRow].CellStyle.Font.Bold = true;
                worksheet.Range["B" + totalRow].Text = "Cộng: ";
                worksheet.Range["E" + totalRow].Text = ((int)listExport.Sum(x => x.QuantityPO)).ToString();
                worksheet.Range["F" + totalRow].Text = ((int)listExport.Sum(x => x.Quantity)).ToString();
                worksheet.Range["G" + totalRow].Text = ((int)listExport.Sum(x => x.SalePrice)).ToString();
                worksheet.Range["H" + totalRow].Text = ((int)listExport.Sum(x => x.TotalAmount)).ToString();

                worksheet.Range["A" + (totalRow + 1)].Text = "Tổng số tiền(viết bằng chữ): " + ConvertWholeNumber(((int)listExport.Sum(x => x.TotalAmount)).ToString());
                worksheet.Range["A" + (totalRow + 2)].Text = "Số chứng từ gốc kèm theo: " + expHeader.LotProductCode;
                //Saving the workbook as stream
                workbook.Version = ExcelVersion.Excel2010;

                string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var fileName = "ExportFile_Phieu_Xuat_Kho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx";
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;
                return File(ms, ContentType, fileName);
            }
        }

        //trang thai
        [HttpPost]
        public JsonResult GetStatusAct()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x =>
                        !x.IsDeleted &&
                        x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }
        #region Get unit with pack

        [AllowAnonymous]
        [HttpGet]
        public JsonResult UnitFromPack(string json, string unit, string prodQrCode)
        {
            var msg = new JMessage();
            try
            {
                var data = JsonConvert.DeserializeObject<JsonPackValue>(json);
                var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(unit)
                && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
                if (data != null)
                {
                    var lstJson = new List<string>();
                    if (!string.IsNullOrEmpty(data.A.Key))
                    {
                        if (unitName.ToLower().Equals(data.A.Key.ToLower()))
                        {
                            lstJson.Add(data.A.Key);
                            if (!string.IsNullOrEmpty(data.B.Key))
                                lstJson.Add(data.B.Key);
                            if (!string.IsNullOrEmpty(data.C.Key))
                                lstJson.Add(data.C.Key);
                            if (!string.IsNullOrEmpty(data.D.Key))
                                lstJson.Add(data.D.Key);
                        }
                        else if (unitName.ToLower().Equals(data.A.Key.ToLower()))
                        {
                            lstJson.Add(data.A.Key);
                        }


                        if (!string.IsNullOrEmpty(data.B.Key) && unitName.ToLower().Equals(data.B.Key.ToLower()))
                        {
                            lstJson.Add(data.B.Key);
                            if (!string.IsNullOrEmpty(data.C.Key))
                                lstJson.Add(data.C.Key);
                            if (!string.IsNullOrEmpty(data.D.Key))
                                lstJson.Add(data.D.Key);

                            if (!string.IsNullOrEmpty(data.C.Key) && unitName.ToLower().Equals(data.C.Key.ToLower()))
                            {
                                lstJson.Add(data.C.Key);
                                if (!string.IsNullOrEmpty(data.D.Key))
                                    lstJson.Add(data.D.Key);
                                if (!string.IsNullOrEmpty(data.D.Key) && unitName.ToLower().Equals(data.D.Key.ToLower()))
                                {
                                    lstJson.Add(data.D.Key);
                                }
                            }
                        }
                    }
                    var units = (from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)))
                                 join b in lstJson on a.ValueSet.ToLower() equals b.ToLower()
                                 select new
                                 {
                                     Code = a.CodeSet,
                                     Name = a.ValueSet
                                 }).DistinctBy(x => x.Name);
                    msg.Object = units;
                }
            }
            catch (Exception ex)
            {

            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult CalQuantityByUnit(string pack, decimal quantity, string unit, string srcUnit)
        {
            decimal quantityByUnit = 0;
            try
            {
                var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(unit)
                && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;

                var srcUnitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(srcUnit)
                && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;

                var data = JsonConvert.DeserializeObject<JsonPackValue>(pack);
                if (data != null)
                {
                    if (srcUnitName.ToLower().Equals(unitName.ToLower()))
                    {
                        quantityByUnit = quantity;
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(data.A.Key))
                        {
                            if (srcUnitName.ToLower().Equals(data.A.Key.ToLower()))
                            {
                                if (!string.IsNullOrEmpty(data.B.Key))
                                {
                                    if (unitName.ToLower().Equals(data.B.Key.ToLower()))
                                    {
                                        quantityByUnit = quantity * Convert.ToDecimal(data.B.Value);
                                    }
                                    if (!string.IsNullOrEmpty(data.C.Key))
                                    {
                                        if (unitName.ToLower().Equals(data.C.Key.ToLower()))
                                        {
                                            quantityByUnit = quantity * Convert.ToDecimal(data.B.Value) * Convert.ToDecimal(data.C.Value);
                                        }
                                        if (!string.IsNullOrEmpty(data.D.Key))
                                        {
                                            if (unitName.ToLower().Equals(data.B.Key.ToLower()))
                                            {
                                                quantityByUnit = quantity * Convert.ToDecimal(data.B.Value) * Convert.ToDecimal(data.C.Value) * Convert.ToDecimal(data.D.Value);
                                            }
                                        }
                                    }

                                }

                            }
                        }

                        if (!string.IsNullOrEmpty(data.B.Key))
                        {
                            if (srcUnitName.ToLower().Equals(data.B.Key.ToLower()))
                            {
                                if (!string.IsNullOrEmpty(data.C.Key))
                                {
                                    if (unitName.ToLower().Equals(data.C.Key.ToLower()))
                                    {
                                        quantityByUnit = quantity * Convert.ToDecimal(data.C.Value);
                                    }
                                    if (!string.IsNullOrEmpty(data.D.Key))
                                    {
                                        if (unitName.ToLower().Equals(data.D.Key.ToLower()))
                                        {
                                            quantityByUnit = quantity * Convert.ToDecimal(data.C.Value) * Convert.ToDecimal(data.D.Value);
                                        }
                                    }
                                }
                            }
                        }

                        if (!string.IsNullOrEmpty(data.C.Key))
                        {
                            if (srcUnitName.ToLower().Equals(data.C.Key.ToLower()))
                            {
                                if (!string.IsNullOrEmpty(data.D.Key))
                                {
                                    if (unitName.ToLower().Equals(data.D.Key.ToLower()))
                                    {
                                        quantityByUnit = quantity * Convert.ToDecimal(data.D.Value);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return Json(quantityByUnit);
        }

        [NonAction]
        public void SeparatePack(string pack, decimal maxQuantity, decimal quantityExp, string unit,
            string prodCode, string prodQrCode, string storeCode, string lotCode, string srcUnit, int mapId)
        {
            int remainQuantity = 0;
            int remainA = 0;
            int remainB = 0;
            int remainC = 0;
            int remainD = 0;

            var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(unit)
               && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
            try
            {
                //var stockProd = _context.MapStockProdIns.FirstOrDefault(x => x.ProdCode.Equals(prodQrCode) && x.Unit.Equals(srcUnit) && x.MapId == mapId && !x.IsDeleted);
                //var unitNameStock = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(stockProd.Unit)
                //&& x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;

                //var data = JsonConvert.DeserializeObject<JsonPackValue>(pack);
                //if (data != null)
                //{
                //    if (unitName.ToLower().Equals(data.A.Key.ToLower()))
                //    {
                //        remainA = Convert.ToInt32(maxQuantity - quantityExp);
                //        if (remainA == 0)
                //        {
                //            stockProd.IsDeleted = true;
                //            _context.MapStockProdIns.Update(stockProd);
                //        }
                //        else
                //        {
                //            stockProd.IsDeleted = true;
                //            _context.MapStockProdIns.Update(stockProd);

                //            //Save Parent id for rollback
                //            var storeInventoryObj = new MapStockProdIn
                //            {
                //                MapId = mapId,
                //                ProdCode = prodQrCode,
                //                Quantity = remainA,
                //                Unit = stockProd.Unit,
                //                ParentId = stockProd.ID
                //            };
                //            _context.MapStockProdIns.Add(storeInventoryObj);
                //        }
                //    }
                //    if (unitName.ToLower().Equals(data.B.Key.ToLower()))
                //    {
                //        //Calculate quantity by unit export
                //        if (unitNameStock.ToLower().Equals(data.A.Key.ToLower())) //Unit in store is A
                //        {
                //            remainQuantity = Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.B.Value) - Convert.ToInt32(quantityExp);

                //            remainB = remainQuantity % (Convert.ToInt32(data.B.Value));
                //            remainA = remainQuantity / (Convert.ToInt32(data.B.Value));

                //            if (remainA == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = stockProd.Unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //            if (remainB > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //        else
                //        {
                //            remainQuantity = Convert.ToInt32(maxQuantity - quantityExp);
                //            remainB = remainQuantity % (Convert.ToInt32(data.B.Value));
                //            remainA = remainQuantity / (Convert.ToInt32(data.B.Value));
                //            if (remainB == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = stockProd.Unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);

                //            }
                //            if (remainA > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //    }
                //    if (unitName.ToLower().Equals(data.C.Key.ToLower()))
                //    {
                //        if (unitNameStock.ToLower().Equals(data.A.Key.ToLower())) //Unit in store is A
                //        {
                //            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.B.Value) * Convert.ToInt32(data.C.Value)) - Convert.ToInt32(quantityExp);

                //            remainC = remainQuantity % (Convert.ToInt32(data.C.Value));
                //            if (remainC > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainQuantity / (Convert.ToInt32(data.C.Value));

                //            remainA = remainB / (Convert.ToInt32(data.B.Value));
                //            if (remainA > 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = stockProd.Unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);

                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            remainB = remainB % (Convert.ToInt32(data.B.Value));
                //            if (remainB > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //        else if (unitNameStock.ToLower().Equals(data.B.Key.ToLower())) //Unit in store is B
                //        {
                //            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.C.Value)) - Convert.ToInt32(quantityExp);
                //            remainC = remainQuantity % (Convert.ToInt32(data.C.Value));
                //            if (remainC > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainQuantity / (Convert.ToInt32(data.C.Value));

                //            remainA = remainB / (Convert.ToInt32(data.B.Value));
                //            if (remainA > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainB % (Convert.ToInt32(data.B.Value));
                //            if (remainB == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = stockProd.Unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //        else //Unit in store is C
                //        {
                //            remainQuantity = Convert.ToInt32(maxQuantity - quantityExp);
                //            remainC = remainQuantity % Convert.ToInt32(data.C.Value);
                //            if (remainC == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainQuantity / (Convert.ToInt32(data.C.Value));

                //            remainA = remainB / (Convert.ToInt32(data.B.Value));
                //            if (remainA > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainB % (Convert.ToInt32(data.B.Value));
                //            if (remainB > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //    }
                //    if (unitName.ToLower().Equals(data.D.Key.ToLower()))
                //    {
                //        if (unitNameStock.ToLower().Equals(data.A.Key.ToLower())) //Unit in store is A
                //        {
                //            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.B.Value) * Convert.ToInt32(data.C.Value) * Convert.ToInt32(data.D.Value)) - Convert.ToInt32(quantityExp);
                //            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainD > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainD,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                //            remainB = remainC / (Convert.ToInt32(data.C.Value));
                //            remainA = remainB / (Convert.ToInt32(data.B.Value));

                //            if (remainA == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = srcUnit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainC % (Convert.ToInt32(data.C.Value));
                //            if (remainB > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainC > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.C.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //        else if (unitNameStock.ToLower().Equals(data.B.Key.ToLower())) //Unit in store is B
                //        {
                //            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.C.Value) * Convert.ToInt32(data.D.Value)) - Convert.ToInt32(quantityExp);
                //            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainD > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainD,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                //            remainB = remainC / (Convert.ToInt32(data.C.Value));
                //            remainA = remainB / (Convert.ToInt32(data.B.Value));
                //            if (remainA > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainC % (Convert.ToInt32(data.C.Value));
                //            if (remainB == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = srcUnit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainC > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.C.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //        else if (unitNameStock.ToLower().Equals(data.C.Key.ToLower())) // Unit in store is C
                //        {
                //            remainQuantity = (Convert.ToInt32(maxQuantity) * Convert.ToInt32(data.D.Value)) - Convert.ToInt32(quantityExp);

                //            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainD > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainD,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                //            remainB = remainC / (Convert.ToInt32(data.C.Value));
                //            remainA = remainB / (Convert.ToInt32(data.B.Value));
                //            if (remainA > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainC % (Convert.ToInt32(data.C.Value));
                //            if (remainB > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainC == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = srcUnit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //        else // Unit in store is D
                //        {
                //            remainQuantity = Convert.ToInt32(maxQuantity - quantityExp);

                //            remainD = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainD == 0)
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);
                //            }
                //            else
                //            {
                //                stockProd.IsDeleted = true;
                //                _context.MapStockProdIns.Update(stockProd);

                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainD,
                //                    Unit = unit,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity / (Convert.ToInt32(data.D.Value));
                //            remainB = remainC / (Convert.ToInt32(data.C.Value));
                //            remainA = remainB / (Convert.ToInt32(data.B.Value));
                //            if (remainA > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainA,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.A.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainB = remainC % (Convert.ToInt32(data.C.Value));
                //            if (remainB > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainB,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.B.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }

                //            remainC = remainQuantity % (Convert.ToInt32(data.D.Value));
                //            if (remainC > 0)
                //            {
                //                var storeInventoryObj = new MapStockProdIn
                //                {
                //                    MapId = mapId,
                //                    ProdCode = prodQrCode,
                //                    Quantity = remainC,
                //                    Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(data.C.Key.ToLower())
                //                    && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
                //                    ParentId = stockProd.ID
                //                };
                //                _context.MapStockProdIns.Add(storeInventoryObj);
                //            }
                //        }
                //    }
                //}
            }
            catch (Exception ex)
            {

            }
        }

        [NonAction]
        private JsonPackValue JsonPacking(string prodQrCode)
        {
            var json = new JsonPackValue();
            var data = _context.ProductImportDetails.FirstOrDefault(x => x.ProductQrCode.Equals(prodQrCode) && !x.IsDeleted);
            if (data != null)
            {
                var pack = data.PackType;
                if (!string.IsNullOrEmpty(pack))
                {
                    var arr = pack.Split("x", StringSplitOptions.None);
                    for (var i = 0; i < arr.Length; i++)
                    {
                        arr[i] = arr[i].Trim();
                    }
                    if (!string.IsNullOrEmpty(arr[0].Split(' ')[0]))
                    {
                        json.A.Key = arr[0].Split(' ')[0];
                    }

                    if (arr.Length >= 2)
                        if (!string.IsNullOrEmpty(arr[1].Split(' ')[1]))
                        {
                            json.B.Key = arr[1].Split(' ')[1];
                            json.B.Value = arr[1].Split(' ')[0];
                        }
                    if (arr.Length >= 3)
                        if (!string.IsNullOrEmpty(arr[2].Split(' ')[1]))
                        {
                            json.C.Key = arr[2].Split(' ')[1];
                            json.C.Value = arr[2].Split(' ')[0];
                        }
                    if (arr.Length >= 4)
                        if (!string.IsNullOrEmpty(arr[3].Split(' ')[1]))
                        {
                            json.D.Key = arr[3].Split(' ')[1];
                            json.D.Value = arr[3].Split(' ')[0];
                        }
                }
            }
            return json;
        }

        [AllowAnonymous]
        [HttpPost]
        public void CleanUpMapStock(int mappId, string prodQrCode, string store, string lot, string productCode)
        {
            //Clean ProductInStockNew
            //var prodInStock = _context.ProductInStockNews.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(prodQrCode));
            //_context.RemoveRange(prodInStock);

            //var data = _context.MapStockProdIns.Where(x => !x.IsDeleted && x.MapId == mappId && x.ProdCode.Equals(prodQrCode)).GroupBy(x => x.Unit);
            //var jsonPack = JsonPacking(prodQrCode);

            //var lstSumByUnit = new List<CleanUp>();
            //foreach (var item in data)
            //{
            //    var sumByUnit = item.Sum(x => x.Quantity);
            //    var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(item.Key)
            //        && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
            //    var cleanUp = new CleanUp();
            //    cleanUp.SumByUnit = sumByUnit;
            //    cleanUp.Unit = item.Key;
            //    cleanUp.UnitName = unitName;
            //    if (unitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 0;
            //    }
            //    if (unitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 1;
            //    }
            //    if (unitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 2;
            //    }
            //    if (unitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 3;
            //    }
            //    lstSumByUnit.Add(cleanUp);
            //}
            //var lstProdSorting = lstSumByUnit.OrderByDescending(x => x.PriorityUnit);
            //var remainA = 0;
            //var remainB = 0;
            //var remainC = 0;
            //var remainD = 0;
            //foreach (var item in lstProdSorting)
            //{
            //    if (item.UnitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
            //    {
            //        remainD += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.D.Value);
            //        remainC += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.D.Value);
            //    }
            //    if (item.UnitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
            //    {
            //        remainC += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.C.Value);
            //        remainB += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.C.Value);
            //    }
            //    if (item.UnitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
            //    {
            //        remainB += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.B.Value);
            //        remainA += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.B.Value);
            //    }
            //    if (item.UnitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
            //    {
            //        remainA += Convert.ToInt32(item.SumByUnit.Value);
            //    }
            //}

            //if (!string.IsNullOrEmpty(jsonPack.D.Value))
            //{
            //    var D = remainD % Convert.ToInt32(jsonPack.D.Value);

            //    if (D > 0)
            //    {
            //        var mapStock = new MapStockProdIn
            //        {
            //            MapId = mappId,
            //            ProdCode = prodQrCode,
            //            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.D.Key.ToLower())
            //            && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //            Quantity = D
            //        };
            //        _context.MapStockProdIns.Add(mapStock);
            //    }
            //    remainC = remainD / Convert.ToInt32(jsonPack.D.Value);
            //}

            //if (!string.IsNullOrEmpty(jsonPack.C.Value))
            //{
            //    var C = remainC % Convert.ToInt32(jsonPack.C.Value);
            //    if (C > 0)
            //    {
            //        var mapStock = new MapStockProdIn
            //        {
            //            MapId = mappId,
            //            ProdCode = prodQrCode,
            //            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.C.Key.ToLower())
            //            && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //            Quantity = C
            //        };
            //        _context.MapStockProdIns.Add(mapStock);
            //    }
            //    remainB += remainC / Convert.ToInt32(jsonPack.C.Value);
            //}

            //if (!string.IsNullOrEmpty(jsonPack.B.Value))
            //{
            //    var B = remainB % Convert.ToInt32(jsonPack.B.Value);
            //    if (B > 0)
            //    {
            //        var mapStock = new MapStockProdIn
            //        {
            //            MapId = mappId,
            //            ProdCode = prodQrCode,
            //            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.B.Key.ToLower())
            //            && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //            Quantity = B
            //        };
            //        _context.MapStockProdIns.Add(mapStock);
            //    }
            //    remainA += remainB / Convert.ToInt32(jsonPack.B.Value);
            //}
            //var A = remainA;
            //if (A > 0)
            //{
            //    var mapStock = new MapStockProdIn
            //    {
            //        MapId = mappId,
            //        ProdCode = prodQrCode,
            //        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.A.Key.ToLower())
            //        && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //        Quantity = A
            //    };
            //    _context.MapStockProdIns.Add(mapStock);
            //}

            //var mapping = _context.MapStockProdIns.Where(x => !x.IsDeleted && x.MapId == mappId && x.ProdCode.Equals(prodQrCode));
            //_context.MapStockProdIns.RemoveRange(mapping);
            //_context.SaveChanges();
        }

        [NonAction]
        public void CleanUpStock(string prodQrCode, string store, string productCode)
        {
            //var data = _context.MapStockProdIns.Where(x => !x.IsDeleted && x.ProdCode.Equals(prodQrCode)).GroupBy(x => x.Unit);
            //var jsonPack = JsonPacking(prodQrCode);

            //var lstSumByUnit = new List<CleanUp>();
            //foreach (var item in data)
            //{
            //    var sumByUnit = item.Sum(x => x.Quantity);
            //    var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(item.Key)
            //        && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
            //    var cleanUp = new CleanUp();
            //    cleanUp.SumByUnit = sumByUnit;
            //    cleanUp.Unit = item.Key;
            //    cleanUp.UnitName = unitName;
            //    if (unitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 0;
            //    }
            //    if (unitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 1;
            //    }
            //    if (unitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 2;
            //    }
            //    if (unitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
            //    {
            //        cleanUp.PriorityUnit = 3;
            //    }
            //    lstSumByUnit.Add(cleanUp);
            //}
            //var lstProdSorting = lstSumByUnit.OrderByDescending(x => x.PriorityUnit);
            //var remainA = 0;
            //var remainB = 0;
            //var remainC = 0;
            //var remainD = 0;
            //foreach (var item in lstProdSorting)
            //{
            //    if (item.UnitName.ToLower().Equals(jsonPack.D.Key.ToLower()))
            //    {
            //        remainD += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.D.Value);
            //        remainC += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.D.Value);
            //    }
            //    if (item.UnitName.ToLower().Equals(jsonPack.C.Key.ToLower()))
            //    {
            //        remainC += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.C.Value);
            //        remainB += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.C.Value);
            //    }
            //    if (item.UnitName.ToLower().Equals(jsonPack.B.Key.ToLower()))
            //    {
            //        remainB += Convert.ToInt32(item.SumByUnit.Value) % Convert.ToInt32(jsonPack.B.Value);
            //        remainA += Convert.ToInt32(item.SumByUnit.Value) / Convert.ToInt32(jsonPack.B.Value);
            //    }
            //    if (item.UnitName.ToLower().Equals(jsonPack.A.Key.ToLower()))
            //    {
            //        remainA += Convert.ToInt32(item.SumByUnit.Value);
            //    }
            //}

            //if (!string.IsNullOrEmpty(jsonPack.D.Value))
            //{
            //    var D = remainD % Convert.ToInt32(jsonPack.D.Value);

            //    if (D > 0)
            //    {
            //        var stockInventory = new ProductInStockNew
            //        {
            //            ProductQrCode = prodQrCode,
            //            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.D.Key.ToLower())
            //            && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //            ProductCode = productCode,
            //            Quantity = D,
            //            StoreCode = store,
            //            CreatedBy = ESEIM.AppContext.UserName,
            //            CreatedTime = DateTime.Now,
            //            IsDeleted = false,
            //            DeletionToken = "NA"
            //        };
            //        _context.ProductInStockNews.Add(stockInventory);
            //    }
            //    remainC = remainD / Convert.ToInt32(jsonPack.D.Value);
            //}

            //if (!string.IsNullOrEmpty(jsonPack.C.Value))
            //{
            //    var C = remainC % Convert.ToInt32(jsonPack.C.Value);
            //    if (C > 0)
            //    {
            //        var stockInventory = new ProductInStockNew
            //        {
            //            ProductQrCode = prodQrCode,
            //            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.C.Key.ToLower())
            //            && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //            ProductCode = productCode,
            //            Quantity = C,
            //            StoreCode = store,
            //            CreatedBy = ESEIM.AppContext.UserName,
            //            CreatedTime = DateTime.Now,
            //            IsDeleted = false,
            //            DeletionToken = "NA"
            //        };
            //        _context.ProductInStockNews.Add(stockInventory);
            //    }
            //    remainB += remainC / Convert.ToInt32(jsonPack.C.Value);
            //}

            //if (!string.IsNullOrEmpty(jsonPack.B.Value))
            //{
            //    var B = remainB % Convert.ToInt32(jsonPack.B.Value);
            //    if (B > 0)
            //    {
            //        var stockInventory = new ProductInStockNew
            //        {
            //            ProductQrCode = prodQrCode,
            //            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.B.Key.ToLower())
            //            && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //            ProductCode = productCode,
            //            Quantity = B,
            //            StoreCode = store,
            //            CreatedBy = ESEIM.AppContext.UserName,
            //            CreatedTime = DateTime.Now,
            //            IsDeleted = false,
            //            DeletionToken = "NA"
            //        };
            //        _context.ProductInStockNews.Add(stockInventory);
            //    }
            //    remainA += remainB / Convert.ToInt32(jsonPack.B.Value);
            //}

            //var A = remainA;
            //if (A > 0)
            //{
            //    var stockInventory = new ProductInStockNew
            //    {
            //        ProductQrCode = prodQrCode,
            //        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(jsonPack.A.Key.ToLower())
            //        && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).CodeSet,
            //        ProductCode = productCode,
            //        Quantity = A,
            //        StoreCode = store,
            //        CreatedBy = ESEIM.AppContext.UserName,
            //        CreatedTime = DateTime.Now,
            //        IsDeleted = false,
            //        DeletionToken = "NA"
            //    };
            //    _context.ProductInStockNews.Add(stockInventory);
            //}

            //var products = _context.ProductInStockNews.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(prodQrCode));
            //_context.ProductInStockNews.RemoveRange(products);
            //_context.SaveChanges();
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> DelDeliveryDetail(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProductExportDetails.FirstOrDefault(x => x.Id == id && !x.IsDeleted);

                if (data != null)
                {
                    var ticket = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == data.TicketCode);
                    if (ticket?.TicketStatus == "INITIAL_DONE")
                    {
                        msg.Error = true;
                        msg.Title = "Phiếu xuất đã xử lý xong không được xóa chi tiết";
                        return msg;
                    }
                    var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => x.Id == data.MapId);
                    var idImpProduct = mapping?.IdImpProduct;
                    var inStock = _context.ProductInStocks.FirstOrDefault(x => x.IdImpProduct == idImpProduct);
                    if (mapping == null || inStock == null)
                    {
                        msg.Error = true;
                        msg.Title = "Không tìm thấy bản ghi tồn kho để trả ngược sản phẩm";
                        return msg;
                    }
                    mapping.Quantity = (mapping.Quantity ?? 0) + data.Quantity;
                    mapping.Weight = (mapping.Weight ?? 0) + (data.Weight ?? 0);
                    inStock.Quantity = inStock.Quantity + inStock.Quantity;
                    inStock.Weight = (inStock.Weight ?? 0) + (inStock.Weight ?? 0);
                    mapping.IsDeleted = false;
                    inStock.IsDeleted = false;
                    mapping.DeletionToken = "NA";
                    inStock.DeletionToken = "NA";
                    //var mapping = _context.MapStockProdIns.FirstOrDefault(x => !x.IsDeleted && x.ProdCode.Equals(data.ProductQrCode) && x.MapId == data.MapId && x.Unit.Equals(data.Unit));
                    //if (mapping != null)
                    //{
                    //    mapping.Quantity += data.Quantity;
                    //}
                    //else
                    //{
                    //    var mapStock = new MapStockProdIn
                    //    {
                    //        Unit = data.Unit,
                    //        Quantity = data.Quantity,
                    //        ProdCode = data.ProductQrCode,
                    //        MapId = data.MapId
                    //    };
                    //    _context.MapStockProdIns.Add(mapStock);
                    //}
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.DeletionToken = Guid.NewGuid().ToString();
                    _context.ProductExportDetails.Update(data);
                    await _context.SaveChangesAsync();

                    //CleanUpMapStock(data.MapId, data.ProductQrCode, store, !string.IsNullOrEmpty(data.LotProductCode) ? data.LotProductCode : "", data.ProductCode);
                    //CleanUpStock(data.ProductQrCode, store, data.ProductCode);
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        //[NonAction]
        //public JsonResult CalProdInStock(string prodQrCode)
        //{
        //    var prodInStock = _context.ProductInStockNews.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(prodQrCode));
        //    var mapStock = _context.MapStockProdIns.Where(x => x.ProdCode.Equals(prodQrCode)).GroupBy(x => );
        //}

        public class CleanUp
        {
            public decimal? SumByUnit { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public int PriorityUnit { get; set; }
        }
        private class PackValue
        {
            public string Key { get; set; }
            public string Value { get; set; }
        }
        private class JsonPackValue
        {

            public PackValue A { get; set; }
            public PackValue B { get; set; }
            public PackValue C { get; set; }
            public PackValue D { get; set; }
            public JsonPackValue()
            {
                A = new PackValue
                {
                    Key = "",
                    Value = ""
                };
                B = new PackValue
                {
                    Key = "",
                    Value = ""
                };
                C = new PackValue
                {
                    Key = "",
                    Value = ""
                };
                D = new PackValue
                {
                    Key = "",
                    Value = ""
                };
            }
        }
        #endregion

        #region Phần chi tiết sản phẩm theo cuộn/thùng
        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertDetailProductCoid([FromBody] MaterialStoreExpModelDetailInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var chk = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (chk)
                {
                    var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(obj.ProductCoil));
                    if (prodPackageInfo != null)
                    {
                        prodPackageInfo.Remain = prodPackageInfo.Remain - obj.Quantity;
                        _context.ProdPackageReceiveds.Update(prodPackageInfo);

                        var prodPackageInfoHistory = new ProdPackageDelivery
                        {
                            CoilCode = prodPackageInfo.CoilCode,
                            CoilRelative = prodPackageInfo.CoilRelative,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            //DeletedBy = prodPackageInfo.DeletedBy,
                            //DeletedTime = prodPackageInfo.DeletedTime,
                            //IsDeleted = prodPackageInfo.IsDeleted,
                            LineCode = prodPackageInfo.LineCode,
                            PackType = prodPackageInfo.PackType,
                            PositionInStore = prodPackageInfo.PositionInStore,
                            ProductCoil = prodPackageInfo.ProductCoil,
                            ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
                            ProductQrCode = prodPackageInfo.ProductQrCode,
                            ProductCode = prodPackageInfo.ProductCode,
                            ProductType = prodPackageInfo.ProductType,
                            ProductLot = prodPackageInfo.ProductLot,
                            RackCode = prodPackageInfo.RackCode,
                            RackPosition = prodPackageInfo.RackPosition,
                            Remain = obj.Quantity,
                            Size = obj.Quantity,
                            TicketCode = prodPackageInfo.TicketCode,
                            TicketExpCode = obj.TicketCode,
                            //UpdatedBy = prodPackageInfo.UpdatedBy,
                            //UpdatedTime = prodPackageInfo.UpdatedTime,
                        };
                        _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);

                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                        var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                        if (mapping != null)
                        {
                            mapping.Quantity = mapping.Quantity - obj.Quantity;
                            mapping.UpdatedBy = User.Identity.Name;
                            mapping.UpdatedTime = DateTime.Now;
                            _context.ProductLocatedMappings.Update(mapping);

                            //Sửa số lượng sản phẩm ra khỏi bảng Kho
                            var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                            if (storeInventory != null)
                            {
                                storeInventory.Quantity = storeInventory.Quantity - obj.Quantity;
                                _context.ProductInStocks.Update(storeInventory);
                            }
                        }

                        //Trả lại dữ liệu cho bảng MaterialStoreExpGoodsDetails
                        //Chú ý: Bản ghi detail luôn tồn tại khi tạo mới phiếu xuất kho theo PO_CUS (Khi lưu Header)
                        var expGoodsDetail = _context.ProductExportDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                        if (expGoodsDetail != null)
                        {
                            expGoodsDetail.Quantity = expGoodsDetail.Quantity + obj.Quantity;
                            _context.ProductExportDetails.Update(expGoodsDetail);
                        }

                        var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                        if (header != null)
                        {
                            //Trả lại lượng sản phẩm còn phải xuất trong bảng ContractProductDetails
                            //Chú ý: Bản ghi detail luôn tồn tại khi tạo hợp đồng
                            var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == header.LotProductCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport - obj.Quantity;
                                _context.PoSaleProductDetails.Update(poProductDetail);
                            }
                        }

                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                        if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                        {
                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                            if (subProduct != null)
                            {
                                subProduct.InStock = subProduct.InStock == null ? obj.Quantity : subProduct.InStock - obj.Quantity;
                                _context.SubProducts.Update(subProduct);
                            }
                        }
                        else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                        {
                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                            if (product != null)
                            {
                                product.InStock = product.InStock == null ? obj.Quantity : product.InStock - obj.Quantity;
                                _context.MaterialProducts.Update(product);
                            }
                        }

                        _context.SaveChanges();

                        //Thêm log dữ liệu
                        var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                        //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                        var detailQrcode = _context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(obj.TicketCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail,
                                DetailQrcode = detailQrcode
                            };
                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductExportHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductExportHeaders.Update(header);
                                _context.SaveChanges();
                            }
                        }

                        msg.Title = "Thêm chi tiết sản phẩm thành công";

                        //Thay đổi dữ liệu bảng dự báo
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { prodPackageInfo.ProductCode, 0, obj.Quantity, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm chi tiết sản phẩm";
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteDetailProductCoid([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var prodPackageInfoHistoryUpdate = _context.ProdPackageDeliverys.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                var quantity = prodPackageInfoHistoryUpdate.Size == null ? 0 : (decimal)prodPackageInfoHistoryUpdate.Size;

                var chk = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode));
                if (chk)
                {
                    var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(prodPackageInfoHistoryUpdate.CoilCode));
                    if (prodPackageInfo != null)
                    {
                        prodPackageInfo.Remain = prodPackageInfo.Remain + quantity;
                        _context.ProdPackageReceiveds.Update(prodPackageInfo);

                        prodPackageInfoHistoryUpdate.IsDeleted = true;
                        prodPackageInfoHistoryUpdate.DeletedBy = User.Identity.Name;
                        prodPackageInfoHistoryUpdate.DeletedTime = DateTime.Now;

                        _context.ProdPackageDeliverys.Update(prodPackageInfoHistoryUpdate);

                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                        var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                        if (mapping != null)
                        {
                            mapping.Quantity = mapping.Quantity + quantity;
                            mapping.UpdatedBy = User.Identity.Name;
                            mapping.UpdatedTime = DateTime.Now;
                            _context.ProductLocatedMappings.Update(mapping);

                            //Sửa số lượng sản phẩm ra khỏi bảng Kho
                            var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                            if (storeInventory != null)
                            {
                                storeInventory.Quantity = storeInventory.Quantity + quantity;
                                _context.ProductInStocks.Update(storeInventory);
                            }
                        }

                        //Trả lại dữ liệu cho bảng MaterialStoreExpGoodsDetails
                        //Chú ý: Bản ghi detail luôn tồn tại khi tạo mới phiếu xuất kho theo PO_CUS (Khi lưu Header)
                        var expGoodsDetail = _context.ProductExportDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == prodPackageInfoHistoryUpdate.TicketExpCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                        if (expGoodsDetail != null)
                        {
                            expGoodsDetail.Quantity = expGoodsDetail.Quantity - quantity;
                            _context.ProductExportDetails.Update(expGoodsDetail);
                        }

                        var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == prodPackageInfoHistoryUpdate.TicketExpCode);
                        if (header != null)
                        {
                            //Trả lại lượng sản phẩm còn phải xuất trong bảng ContractProductDetails
                            //Chú ý: Bản ghi detail luôn tồn tại khi tạo hợp đồng
                            var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == header.LotProductCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport + quantity;
                                _context.PoSaleProductDetails.Update(poProductDetail);
                            }
                        }

                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                        if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                        {
                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                            if (subProduct != null)
                            {
                                subProduct.InStock = subProduct.InStock == null ? quantity : subProduct.InStock + quantity;
                                _context.SubProducts.Update(subProduct);
                            }
                        }
                        else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                        {
                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                            if (product != null)
                            {
                                product.InStock = product.InStock == null ? quantity : product.InStock + quantity;
                                _context.MaterialProducts.Update(product);
                            }
                        }

                        _context.SaveChanges();

                        //Thêm log dữ liệu
                        var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                        //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                        var detailQrcode = _context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail,
                                DetailQrcode = detailQrcode
                            };
                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductExportHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductExportHeaders.Update(header);
                                _context.SaveChanges();
                            }
                        }

                        msg.Title = "Xóa chi tiết sản phẩm thành công";

                        //Thay đổi dữ liệu bảng dự báo
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { prodPackageInfo.ProductCode, quantity, 0, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa chi tiết sản phẩm";
            }
            return Json(msg);
        }
        #endregion

        #region Phần chi tiết sản phẩm theo xuất lẻ
        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertDetailProductOdd([FromBody] MaterialStoreExpModelDetailInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //Check xem bảng giá có không
                var headerCode = string.Empty;
                var dateNow = DateTime.Now;
                var listSalePrice = _context.ProductCostHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.EffectiveDate).ToList();
                var salePriceApply = listSalePrice.FirstOrDefault(x => !x.IsDeleted && x.EffectiveDate <= dateNow && x.ExpiryDate >= dateNow);
                if (salePriceApply != null)
                {
                    headerCode = salePriceApply.HeaderCode;
                }
                else
                {
                    headerCode = listSalePrice.Where(x => dateNow >= x.ExpiryDate).FirstOrDefault().HeaderCode;
                }
                if (!string.IsNullOrEmpty(headerCode))
                {
                    var chk = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    if (chk)
                    {
                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(obj.ProductCoil));
                        if (prodPackageInfo != null)
                        {
                            prodPackageInfo.Remain = prodPackageInfo.Remain - obj.Quantity;
                            _context.ProdPackageReceiveds.Update(prodPackageInfo);

                            var prodPackageInfoHistory = new ProdPackageDelivery
                            {
                                CoilCode = prodPackageInfo.CoilCode,
                                CoilRelative = prodPackageInfo.CoilRelative,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                LineCode = prodPackageInfo.LineCode,
                                PackType = prodPackageInfo.PackType,
                                PositionInStore = prodPackageInfo.PositionInStore,
                                ProductCoil = prodPackageInfo.ProductCoil,
                                ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
                                ProductQrCode = prodPackageInfo.ProductQrCode,
                                ProductCode = prodPackageInfo.ProductCode,
                                ProductType = prodPackageInfo.ProductType,
                                ProductLot = prodPackageInfo.ProductLot,
                                RackCode = prodPackageInfo.RackCode,
                                RackPosition = prodPackageInfo.RackPosition,
                                Remain = (int)obj.Quantity,
                                Size = (int)obj.Quantity,
                                TicketCode = prodPackageInfo.TicketCode,
                                TicketExpCode = obj.TicketCode,
                            };
                            _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);

                            //Get giá
                            decimal salePrice = 0;
                            var productCostDetail = _context.ProductCostDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(obj.ProductCode) && x.HeaderCode.Equals(headerCode));
                            if (productCostDetail != null)
                            {
                                if (productCostDetail.PriceCostDefault != null)
                                    salePrice = (decimal)productCostDetail.PriceCostDefault;
                            }


                            //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                            var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                            if (mapping != null)
                            {
                                mapping.Quantity = mapping.Quantity - obj.Quantity;
                                mapping.UpdatedBy = User.Identity.Name;
                                mapping.UpdatedTime = DateTime.Now;
                                _context.ProductLocatedMappings.Update(mapping);

                                //Sửa số lượng sản phẩm ra khỏi bảng Kho
                                var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                                if (storeInventory != null)
                                {
                                    storeInventory.Quantity = storeInventory.Quantity - obj.Quantity;
                                    _context.ProductInStocks.Update(storeInventory);
                                }
                            }

                            //Insert bảng detail
                            var objNewDetail = new ProductExportDetail
                            {
                                //LotProductCode = .LotProductCode,
                                TicketCode = obj.TicketCode,
                                //Currency = obj.Currency,

                                ProductCode = obj.ProductCode,
                                ProductType = obj.ProductType,
                                ProductQrCode = obj.ProductQrCode,
                                Quantity = obj.Quantity,
                                Unit = obj.Unit,
                                SalePrice = salePrice,
                                TaxRate = obj.TaxRate,
                                Discount = obj.Discount,
                                Commission = obj.Commission,
                                RackCode = obj.RackCode,
                                Status = obj.Status,

                                ProductCoil = obj.ProductCoil,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                DeletionToken = "NA"
                            };
                            _context.ProductExportDetails.Add(objNewDetail);


                            var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);

                            //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                            if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                            {
                                var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                                if (subProduct != null)
                                {
                                    subProduct.InStock = subProduct.InStock == null ? obj.Quantity : subProduct.InStock - obj.Quantity;
                                    _context.SubProducts.Update(subProduct);
                                }
                            }
                            else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                            {
                                var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                                if (product != null)
                                {
                                    product.InStock = product.InStock == null ? obj.Quantity : product.InStock - obj.Quantity;
                                    _context.MaterialProducts.Update(product);
                                }
                            }

                            _context.SaveChanges();

                            //Thêm log dữ liệu
                            var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                            //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                            var detailQrcode = _context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(obj.TicketCode)).ToList();
                            if (header != null)
                            {
                                var logData = new
                                {
                                    Header = header,
                                    Detail = detail,
                                    DetailQrcode = detailQrcode
                                };
                                var listLogData = new List<object>();

                                if (!string.IsNullOrEmpty(header.LogData))
                                {
                                    listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                    logData.Header.LogData = null;
                                    listLogData.Add(logData);
                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProductExportHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                                else
                                {
                                    listLogData.Add(logData);

                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProductExportHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                            }

                            msg.Title = "Thêm chi tiết sản phẩm thành công";

                            //Thay đổi dữ liệu bảng dự báo
                            string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { prodPackageInfo.ProductCode, obj.Quantity, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                            _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không có bảng giá. Vui lòng tạo bảng giá";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm chi tiết sản phẩm";
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteDetailProductOdd([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var expGoodsDetail = _context.ProductExportDetails.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                if (expGoodsDetail != null)
                {
                    var prodPackageInfoHistoryUpdate = _context.ProdPackageDeliverys.FirstOrDefault(x => !x.IsDeleted && x.CoilCode == expGoodsDetail.ProductCoil && (decimal)x.Size == expGoodsDetail.Quantity);
                    var quantity = expGoodsDetail.Quantity;

                    var chk = _context.ProductExportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode));
                    if (chk)
                    {
                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(prodPackageInfoHistoryUpdate.CoilCode));
                        if (prodPackageInfo != null)
                        {
                            prodPackageInfo.Remain = prodPackageInfo.Remain + quantity;
                            _context.ProdPackageReceiveds.Update(prodPackageInfo);

                            prodPackageInfoHistoryUpdate.IsDeleted = true;
                            prodPackageInfoHistoryUpdate.DeletedBy = User.Identity.Name;
                            prodPackageInfoHistoryUpdate.DeletedTime = DateTime.Now;

                            _context.ProdPackageDeliverys.Update(prodPackageInfoHistoryUpdate);

                            //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                            var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                            if (mapping != null)
                            {
                                mapping.Quantity = mapping.Quantity + quantity;
                                mapping.UpdatedBy = User.Identity.Name;
                                mapping.UpdatedTime = DateTime.Now;
                                _context.ProductLocatedMappings.Update(mapping);

                                //Sửa số lượng sản phẩm ra khỏi bảng Kho
                                var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                                if (storeInventory != null)
                                {
                                    storeInventory.Quantity = storeInventory.Quantity + quantity;
                                    _context.ProductInStocks.Update(storeInventory);
                                }
                            }

                            //Xóa bản ghi bảng MaterialStoreExpGoodsDetails
                            expGoodsDetail.IsDeleted = true;
                            expGoodsDetail.DeletedBy = User.Identity.Name;
                            expGoodsDetail.DeletedTime = DateTime.Now;
                            expGoodsDetail.DeletionToken = Guid.NewGuid().ToString();
                            _context.ProductExportDetails.Update(expGoodsDetail);

                            //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                            if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                            {
                                var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                                if (subProduct != null)
                                {
                                    subProduct.InStock = subProduct.InStock == null ? quantity : subProduct.InStock + quantity;
                                    _context.SubProducts.Update(subProduct);
                                }
                            }
                            else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                            {
                                var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                                if (product != null)
                                {
                                    product.InStock = product.InStock == null ? quantity : product.InStock + quantity;
                                    _context.MaterialProducts.Update(product);
                                }
                            }

                            _context.SaveChanges();

                            //Thêm log dữ liệu
                            var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == prodPackageInfoHistoryUpdate.TicketExpCode);
                            var detail = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                            //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                            var detailQrcode = _context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                            if (header != null)
                            {
                                var logData = new
                                {
                                    Header = header,
                                    Detail = detail,
                                    DetailQrcode = detailQrcode
                                };
                                var listLogData = new List<object>();

                                if (!string.IsNullOrEmpty(header.LogData))
                                {
                                    listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                    logData.Header.LogData = null;
                                    listLogData.Add(logData);
                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProductExportHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                                else
                                {
                                    listLogData.Add(logData);

                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProductExportHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                            }

                            msg.Title = "Xóa chi tiết sản phẩm thành công";

                            //Thay đổi dữ liệu bảng dự báo
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { prodPackageInfo.ProductCode, quantity, 0, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                            _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa chi tiết sản phẩm";
            }
            return Json(msg);
        }
        #endregion

        #region Chi tiết sản phẩm theo xuất lẻ Vatco

        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> InsertDetailProductOddVatco([FromBody] ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var parentMapping = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group)
                    .FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
                if (obj.IsMultiple == true)
                {
                    var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
                    var startCode = obj.ProductCode.TrimEnd(digits);
                    var listProduct = _context.ProductLocatedMappings
                        .Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                        .Select(delegate (ProductLocatedMapping product)
                        {
                            var number = GetNumberInEndOfString(product.ProductCode);
                            return new
                            {
                                ProductCode = product.ProductCode,
                                MapId = product.Id,
                                Number = !string.IsNullOrEmpty(number) ? int.Parse(number) : -1,
                                Quantity = product.Quantity,
                                Weight = product.Weight
                            };
                        })
                        .ToList();
                    var stringStart = GetNumberInEndOfString(obj.ProductCode);
                    var numberStart = !string.IsNullOrEmpty(stringStart) ? int.Parse(stringStart) : -1;
                    var listProductFilter = listProduct.Where(x => x.Number >= numberStart && x.Number < (numberStart + obj.Quantity) && x.Quantity > 0)
                        .ToList();
                    var remainWeight = obj.Weight ?? 0;
                    if (listProductFilter.Count < obj.Quantity)
                    {
                        msg.Title = "Không đủ sản phẩm tồn kho để tự sinh";
                        msg.Error = true;
                        return msg;
                    }
                    foreach (var item in listProductFilter)
                    {
                        obj.ProductCode = item.ProductCode;
                        obj.ProductNo = "1";
                        //obj.Weight = remainWeight >= item.Weight ? item.Weight : remainWeight;
                        obj.MapId = item.MapId;
                        //remainWeight -= (item.Weight ?? 0);
                        await InsertDetailSingle(obj);
                    }
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else if (parentMapping?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    return await InsertDetailWeight(obj);
                }
                else
                {
                    return await InsertDetailSingle(obj);
                }
                //CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        private async Task<JMessage> InsertDetailSingle(ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
            var materialProduct = _context.MaterialProducts.Include(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);
            var listProdStrNo = new List<ProdStrNo>();
            try
            {
                listProdStrNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNo);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            if (listProdStrNo.Count == 0)
            {
                msg.Error = true;
                msg.Title = "Thứ tự không hợp lệ!";
                return msg;
            }
            if (parentMapping != null && parentMapping.ListProdStrNo.Count > 0 && parentMapping.ListProdStrNo.ContainsRange(listProdStrNo))
            {
                var quantity = listProdStrNo.SumQuantity();
                if (quantity > parentMapping.Quantity)
                {
                    msg.Error = true;
                    msg.Title = "Số lượng xuất không hợp lệ";
                    return msg;
                }
                //var listProductNo = Enumerable.Range(parentMapping.ListProductNo.FirstOrDefault(), int.Parse(obj.Quantity.ToString())).ToList();
                //parentMapping.ListProductNo.RemoveRange(0, int.Parse(obj.Quantity.ToString()));
                //not ready yet
                parentMapping.ListProdStrNo.Extract(listProdStrNo);
                parentMapping.Quantity -= quantity;
                if ((parentMapping.Weight ?? 0) >= (obj.Weight ?? 0))
                {
                    parentMapping.Weight -= obj.Weight;
                }
                else if (materialProduct?.Group?.GroupType == "STATIC_TANK"
                || materialProduct?.Group?.GroupType == "BOTTLE")
                {
                    msg.Error = true;
                    msg.Title = "Khối lượng xuất vượt quá khối lượng hiện tại của bồn chứa, bình";
                    return msg;
                }
                if (parentMapping.Quantity == 0)
                {
                    parentMapping.IsDeleted = true;
                    parentMapping.DeletionToken = Guid.NewGuid().ToString();
                }
                //if (parentMapping.Weight == 0)
                //{
                //    parentMapping.Quantity = 0;
                //}
                _context.ProductLocatedMappings.Update(parentMapping);
                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = parentMapping.IdImpProduct,
                    IdLocMapOld = parentMapping.Id,
                    IdLocatedMapping = -1,
                    MappingCode = "",
                    MappingCodeOld = parentMapping.MappingCode,
                    StoreCode = parentMapping.WHS_Code,
                    GattrCode = parentMapping.GattrCode,
                    ProductCode = parentMapping.ProductCode,
                    ProductNo = obj.ProductNo,
                    ProductQrCode = parentMapping.ProductQrCode,
                    Quantity = quantity,
                    Unit = parentMapping.Unit,
                    TicketCode = obj.TicketCode,
                    Type = "EXPORT_FULL",
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);
                var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                if (parentInStock != null)
                {
                    //parentInStock.ListProductNo.RemoveRange(0, int.Parse(obj.Quantity.ToString()));
                    //not ready yet
                    parentInStock.ListProdStrNo.Extract(listProdStrNo);
                    parentInStock.Quantity -= quantity;
                    if (parentInStock.Weight >= obj.Weight)
                    {
                        parentInStock.Weight -= obj.Weight;
                    }
                    if (parentInStock.Quantity == 0)
                    {
                        parentInStock.IsDeleted = true;
                        parentInStock.DeletionToken = Guid.NewGuid().ToString();
                        parentInStock.DeletedBy = ESEIM.AppContext.UserName;
                    }
                    //if (parentInStock.Weight == 0)
                    //{
                    //    parentInStock.Quantity = 0;
                    //}
                    _context.ProductInStocks.Update(parentInStock);
                    //var newParentInStock = new ProductInStock
                    //{
                    //    IdImpProduct = parentInStock.IdImpProduct,
                    //    LotProductCode = parentInStock.LotProductCode,
                    //    StoreCode = parentInStock.StoreCode,
                    //    ProductCode = parentInStock.ProductCode,
                    //    ProductType = parentInStock.ProductType,
                    //    ProductQrCode = parentInStock.ProductQrCode,
                    //    Quantity = quantity,
                    //    //ListProductNo = listProductNo,
                    //    ListProdStrNo = listProdStrNo,
                    //    Unit = parentInStock.Unit,
                    //    CreatedBy = User.Identity.Name,
                    //    CreatedTime = DateTime.Now,
                    //    IsDeleted = false,
                    //    //MarkWholeProduct = mark.Any() ? true : false,
                    //    PackCode = parentInStock.PackCode,
                    //    GattrCode = parentMapping.GattrCode,
                    //    DeletionToken = "NA"
                    //};
                    //_context.ProductInStocks.Add(newParentInStock);
                }
                var detail = new ProductExportDetail
                {
                    TicketCode = obj.TicketCode,
                    GattrCode = parentMapping.GattrCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    LotProductCode = obj.LotProductCode,
                    ProductQrCode = obj.ProductQrCode,
                    ProductCode = obj.ProductCode,
                    ProdCustomJson = obj.ProdCustomJson,
                    IsCustomized = obj.IsCustomized,
                    Quantity = quantity,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Status = obj.Status,
                    Weight = obj.Weight,
                    MapId = obj.MapId,
                    ExpType = obj.ExpType,
                    PackCode = obj.PackCode,
                    PackLot = obj.PackLot,
                    DeletionToken = "NA"
                };
                _context.ProductExportDetails.Add(detail);
                var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "EXPORT",
                    ActTime = DateTime.Now,
                    ActBy = ESEIM.AppContext.UserName,
                    ProductNo = listProdStrNo.ToFlatString(),
                    //MappingCode = parentMapping.MappingCode,
                    SupCode = header?.SupCode,
                    CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = "Sản phẩm không tồn tại ở vị trí";
            }
            return msg;
        }

        private async Task<JMessage> InsertDetailWeight(ExportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
            var listProdStrNo = new List<ProdStrNo>() { new ProdStrNo(1) };
            var materialProduct = _context.MaterialProducts.Include(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);
            if (parentMapping != null && parentMapping.ListProdStrNo.Count > 0 && parentMapping.Quantity >= obj.Quantity)
            {
                //parentMapping.ListProdStrNo.Extract(listProdStrNo);
                parentMapping.Quantity -= obj.Quantity;
                if ((parentMapping.Weight ?? 0) >= (obj.Weight ?? 0))
                {
                    parentMapping.Weight -= obj.Weight;
                }
                else if (materialProduct?.Group?.GroupType == "STATIC_TANK"
                || materialProduct?.Group?.GroupType == "BOTTLE")
                {
                    msg.Error = true;
                    msg.Title = "Khối lượng xuất vượt quá khối lượng hiện tại của bồn chứa, bình";
                    return msg;
                }
                _context.ProductLocatedMappings.Update(parentMapping);
                var mappingLog = new ProductLocatedMappingLog
                {
                    IdImpProduct = parentMapping.IdImpProduct,
                    IdLocMapOld = parentMapping.Id,
                    IdLocatedMapping = -1,
                    MappingCode = "",
                    MappingCodeOld = parentMapping.MappingCode,
                    StoreCode = parentMapping.WHS_Code,
                    GattrCode = parentMapping.GattrCode,
                    ProductCode = parentMapping.ProductCode,
                    ProductNo = "1",
                    ProductQrCode = parentMapping.ProductQrCode,
                    Quantity = obj.Quantity,
                    Unit = parentMapping.Unit,
                    TicketCode = obj.TicketCode,
                    Type = "EXPORT_FULL",
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    DeletionToken = "NA"
                };

                _context.ProductLocatedMappingLogs.Add(mappingLog);
                var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == obj.ProductCode)
                    .ToList().FirstOrDefault(x => x.Quantity >= obj.Quantity);
                if (parentInStock != null)
                {
                    //parentInStock.ListProductNo.RemoveRange(0, int.Parse(obj.Quantity.ToString()));
                    //not ready yet
                    //parentInStock.ListProdStrNo.Extract(listProdStrNo);
                    parentInStock.Quantity -= obj.Quantity;
                    if (parentInStock.Weight >= obj.Weight)
                    {
                        parentInStock.Weight -= obj.Weight;
                    }
                    _context.ProductInStocks.Update(parentInStock);
                }
                var detail = new ProductExportDetail
                {
                    TicketCode = obj.TicketCode,
                    GattrCode = parentMapping.GattrCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    LotProductCode = obj.LotProductCode,
                    ProductQrCode = obj.ProductQrCode,
                    ProductCode = obj.ProductCode,
                    ProdCustomJson = obj.ProdCustomJson,
                    IsCustomized = obj.IsCustomized,
                    Quantity = obj.Quantity,
                    Weight = obj.Weight,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Status = obj.Status,
                    MapId = obj.MapId,
                    ExpType = obj.ExpType,
                    PackCode = obj.PackCode,
                    PackLot = obj.PackLot,
                    DeletionToken = "NA"
                };
                _context.ProductExportDetails.Add(detail);
                var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "EXPORT",
                    ActTime = DateTime.Now,
                    ActBy = ESEIM.AppContext.UserName,
                    ProductNo = listProdStrNo.ToFlatString(),
                    //MappingCode = parentMapping.MappingCode,
                    SupCode = header?.SupCode,
                    CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            else if (parentMapping.Quantity < obj.Quantity)
            {
                msg.Error = true;
                msg.Title = "Khối lượng xuất không hợp lệ";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Sản phẩm không tồn tại ở vị trí";
            }
            return msg;
        }

        private string GetNumberInEndOfString(string input)
        {
            return string.Concat(input.ToArray().Reverse().TakeWhile(char.IsNumber).Reverse());
        }
        private static readonly log4net.ILog logProduct = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> InsertDetailProductDetails([FromBody] ExportPartialDetails data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var obj = data.ExportDetailParent;
                var testMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                var checkMapping = testMapping?.ListProdStrNo.Include(obj.ParentProductNumber.Value) ?? false;
                if (checkMapping == false)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự không tồn tại trong dãy!";
                    return Json(msg);
                }
                var sumQuantityExp = data.ListExportDetails.Count > 0 ? data.ListExportDetails.Sum(x => x.Quantity) : 0;
                if (data.ListExportDetails.Count == 0 && sumQuantityExp == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có linh kiện, phụ kiện nào xuất!";
                    return Json(msg);
                }
                var gattrCode = "";
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == obj.ParentFlatCode);
                if (groupAttribute == null)
                {
                    var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                    var newGroupAttribute = new ProductGattrExt
                    {
                        //GattrCode = (maxGroupId + 1).ToString(),
                        GattrFlatCode = obj.ParentFlatCode,
                        GattrJson = obj.ParentCustomJson,
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Type = "EXPORT",
                        IdSource = obj.ParentMappingId
                    };
                    _context.ProductGattrExts.Add(newGroupAttribute);
                    await _context.SaveChangesAsync();
                    maxGroupId = newGroupAttribute.Id;
                    newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                    gattrCode = newGroupAttribute.GattrCode;
                    _context.ProductGattrExts.Update(newGroupAttribute);
                    logProduct.Info(newGroupAttribute.Id);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    gattrCode = groupAttribute.GattrCode;
                }
                var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                if (parentMapping != null /*&& obj.ParentProductNumber.HasValue*/ && parentMapping.ListProdStrNo.Count > 0)
                {
                    //obj.ParentProductNumber = parentMapping.ListProductNo.FirstOrDefault();
                    //parentMapping.ListProductNo.Remove(obj.ParentProductNumber.Value);
                    var newId = -1;
                    if (parentMapping.ListProdStrNo.SumQuantity() > 1)
                    {
                        parentMapping.ListProdStrNo.Extract(obj.ParentProductNumber.Value);
                        parentMapping.Quantity -= 1;
                        _context.ProductLocatedMappings.Update(parentMapping);
                        var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == parentMapping.ProductCode
                        && x.IdImpProduct == parentMapping.IdImpProduct && x.GattrCode == gattrCode && x.MappingCode == parentMapping.MappingCode);
                        if (checkLocated == null)
                        {
                            var newParentMapping = new ProductLocatedMapping
                            {
                                IdImpProduct = parentMapping.IdImpProduct,
                                MappingCode = parentMapping.MappingCode,
                                WHS_Code = parentMapping.WHS_Code,
                                ProductCode = parentMapping.ProductCode,
                                ProductType = parentMapping.ProductType,
                                ProductQrCode = parentMapping.ProductQrCode,
                                Quantity = 1,
                                ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(obj.ParentProductNumber.Value) },
                                //ListProductNo = new List<int> { obj.ParentProductNumber.Value },
                                Unit = parentMapping.Unit,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                GattrCode = gattrCode,
                                DeletionToken = "NA"
                            };
                            _context.ProductLocatedMappings.Add(newParentMapping);
                            await _context.SaveChangesAsync();
                            newId = newParentMapping.Id;
                        }
                        else
                        {
                            checkLocated.ListProdStrNo.Add(new ProdStrNo(obj.ParentProductNumber.Value));
                            checkLocated.Quantity++;
                            _context.ProductLocatedMappings.Update(checkLocated);
                            newId = checkLocated.Id;
                        }
                    }
                    else
                    {
                        parentMapping.GattrCode = gattrCode;
                        parentMapping.UpdatedBy = User.Identity.Name;
                        parentMapping.UpdatedTime = DateTime.Now;
                        newId = parentMapping.Id;
                    }
                    var mappingLog = new ProductLocatedMappingLog
                    {
                        IdImpProduct = parentMapping.IdImpProduct,
                        IdLocMapOld = parentMapping.Id,
                        IdLocatedMapping = newId,
                        MappingCode = parentMapping.MappingCode,
                        MappingCodeOld = parentMapping.MappingCode,
                        StoreCode = parentMapping.WHS_Code,
                        GattrCode = gattrCode,
                        ProductCode = parentMapping.ProductCode,
                        ProductNo = obj.ParentProductNumber.Value.ToString(),
                        ProductQrCode = parentMapping.ProductQrCode,
                        Quantity = 1,
                        Unit = parentMapping.Unit,
                        TicketCode = obj.TicketCode,
                        Type = "EXPORT_PARTIAL",
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                    /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                    if (parentInStock != null)
                    {
                        //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                        if (parentInStock.ListProdStrNo.SumQuantity() > 1)
                        {
                            parentInStock.ListProdStrNo.Extract(obj.ParentProductNumber.Value);
                            parentInStock.Quantity -= 1;
                            _context.ProductInStocks.Update(parentInStock);
                            var newParentInStock = new ProductInStock
                            {
                                IdImpProduct = parentInStock.IdImpProduct,
                                LotProductCode = parentInStock.LotProductCode,
                                StoreCode = parentInStock.StoreCode,
                                ProductCode = parentInStock.ProductCode,
                                ProductType = parentInStock.ProductType,
                                ProductQrCode = parentInStock.ProductQrCode,
                                Quantity = 1,
                                ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(obj.ParentProductNumber.Value) },
                                Unit = parentInStock.Unit,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                PackCode = parentInStock.PackCode,
                                GattrCode = gattrCode,
                                DeletionToken = "NA"
                            };
                            _context.ProductInStocks.Add(newParentInStock);
                        }
                        else
                        {
                            parentInStock.GattrCode = gattrCode;
                            parentInStock.UpdatedBy = User.Identity.Name;
                            parentInStock.UpdatedTime = DateTime.Now;
                        }
                    }
                    await _context.SaveChangesAsync();
                    foreach (var item in data.ListExportDetails)
                    {
                        await InsertDetailProductPartial(item, parentMapping.IdImpProduct.Value, obj.ParentProductNumber.Value);
                    }
                    msg.Title = "Xuất thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Sản phẩm không tồn tại ở vị trí";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                logProduct.Info(ex.Message);
                await CleanGattr();
            }
            return Json(msg);
        }
        private async Task CleanGattr()
        {
            try
            {
                var gAttrNulls = _context.ProductGattrExts.Where(x => x.GattrCode == null).ToList();
                _context.ProductGattrExts.RemoveRange(gAttrNulls);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return;
        }


        private async Task<JsonResult> InsertDetailProductPartial(ExportDetail obj, int idImpProduct, int parentProductNumber)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listProductNo = new List<ProdStrNo> { new ProdStrNo(int.Parse(obj.Quantity.ToString())) };
                var detail = new ProductExportDetail
                {
                    TicketCode = obj.TicketCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProductNo,
                    LotProductCode = obj.LotProductCode,
                    ProductQrCode = obj.ProductQrCode,
                    ProductCode = obj.ProductCode,
                    ProdCustomJson = obj.ProdCustomJson,
                    IsCustomized = obj.IsCustomized,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Status = obj.Status,
                    MapId = obj.MapId,
                    ExpType = obj.ExpType,
                    DeletionToken = "NA"
                };
                _context.ProductExportDetails.Add(detail);
                await _context.SaveChangesAsync();
                var impParent = new ProductExpParent
                {
                    IdImpProduct = idImpProduct,
                    IdExpProduct = detail.Id,
                    IdProductParent = obj.MapId,
                    Number = parentProductNumber,
                    IsDeleted = false,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                };
                _context.ProductExpParents.Add(impParent);
                var header = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);
                var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.MapId);
                var mpStatus = new MpStatus()
                {
                    ActStatus = "EXPORT",
                    ActTime = DateTime.Now,
                    ActBy = ESEIM.AppContext.UserName,
                    ProductNo = listProductNo.ToFlatString(),
                    //MappingCode = mapping?.MappingCode,
                    SupCode = header?.SupCode,
                    CusCode = header?.CusCode,
                };
                materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
                materialProduct.MpStatuses.Add(mpStatus);
                await _context.SaveChangesAsync();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                //CleanUpStock(obj.ProductQrCode, obj.WHS_Code, obj.ProductCode);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        private string GetPositionInStore(string line, string rack)
        {
            var position = "";
            var poLine = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(line));
            var poRack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(rack));
            position = poLine.L_Text + ", " + poRack.RackName;
            return position;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListProductCodeVatco(string storeCode, string lotCode, string productCode = "", string group = "", int pageNo = 1, int pageSize = 500, string content = "", int id = -1)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            if (string.IsNullOrEmpty(lotCode))
            {
                //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
                var search = !string.IsNullOrEmpty(content) ? content : "";
                var store = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
                var groupCode = !string.IsNullOrEmpty(group) ? group : "";
                //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
                string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group", "@store", "@id" };
                object[] val = new object[] { pageNo, pageSize, search, productCode, groupCode, "", id };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_MAPPING]", param, val);
                var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                    .Select(b => new
                    {
                        Id = b.Id,
                        IdImpProduct = b.IdImpProduct,
                        MapId = b.IdMapping,
                        Code = b.ProductQrCode,
                        Name = $"{b.ProductName} - {b.ProductCode} [ {b.IdImpProduct} - {b.MappingCode} - {b.StatusName} ]",
                        Quantity = b.Quantity,
                        MappingCode = b.MappingCode,
                        Unit = b.Unit,
                        UnitName = b.UnitName,
                        ProductCode = b.ProductCode,
                        ProductNo = b.ProductNo,
                        AttributeCode = "",
                        AttributeName = "",
                        ProductType = b.TypeCode,
                        ImpType = b.ImpType,
                        GroupType = b.GroupType
                    }).ToList();
                //return query;
                return data;
            }
            else
            {
                var rs = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                          join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals d.TicketCode
                          join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                          join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                          from c2 in c1.DefaultIfEmpty()
                          join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                          from e2 in e1.DefaultIfEmpty()
                          where string.IsNullOrEmpty(storeCode) || d.StoreCode.Equals(storeCode)
                          select new
                          {
                              IdProduct = b.Id,
                              Code = a.ProductCode,
                              Name = string.Format("{0} - {1}", b.ProductName, b.ProductCode),
                              a.Unit,
                              a.ProductCode,
                              a.ProductQrCode,
                              UnitName = c2.ValueSet,
                              a.Quantity,
                              AttributeCode = "",
                              AttributeName = "",
                              ProductType = b.TypeCode,
                              e2.SupCode,
                              e2.SupName,
                              Lot = a.ProductLot,
                              Packing = a.PackType,
                              b.Weight,
                              UnitWeight = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.UnitWeight)).ValueSet,
                              b.High,
                              b.Wide,
                              b.Long
                          }).ToList();

                var dataRs = rs.GroupBy(x => x.ProductQrCode).Select(x => new
                {
                    x.First().IdProduct,
                    x.First().Code,
                    x.First().Name,
                    x.First().ProductCode,
                    x.First().Unit,
                    x.First().UnitName,
                    x.First().Quantity,
                    x.First().AttributeCode,
                    x.First().AttributeName,
                    x.First().ProductType,
                    x.First().SupCode,
                    x.First().SupName,
                    x.First().ProductQrCode,
                    x.First().Lot,
                    x.First().Packing,
                    x.First().Weight,
                    x.First().UnitWeight,
                    x.First().Wide,
                    x.First().Long,
                    x.First().High
                });

                var listB = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotCode)
                             join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted) on a1.ContractCode equals a.ContractCode
                             join d in dataRs on a.ProductCode equals d.ProductCode
                             join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on d.ProductQrCode equals c.ProductQrCode
                             //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                             join b in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals b.ObjectCode
                             join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                 on new { b.CategoryCode, b.ObjectType } equals new
                                 { CategoryCode = e.Code, ObjectType = e.PAreaType }
                                 //join f in _context.MapStockProdIns.Where(x => !x.IsDeleted) on c.Id equals f.MapId
                             join g in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals g.CodeSet into g1
                             from g2 in g1.DefaultIfEmpty()
                             select new
                             {
                                 Id = d.IdProduct,
                                 d.Code,
                                 d.Name,
                                 d.ProductCode,
                                 Unit = a.Unit,
                                 UnitName = g2 != null ? g2.ValueSet : "",
                                 Quantity = a.Quantity,
                                 d.AttributeCode,
                                 d.AttributeName,
                                 d.ProductType,
                                 d.SupCode,
                                 d.SupName,
                                 d.ProductQrCode,
                                 Position = string.Format("{0} - {1}", e.PAreaDescription, c.MappingCode),
                                 MapId = c.Id,
                                 MarkWholeProduct = false,
                                 d.Lot,
                                 d.Packing,
                                 d.Weight,
                                 d.UnitWeight,
                                 d.Wide,
                                 d.Long,
                                 d.High,
                                 c.MappingCode
                             });
                return listB;
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetListDetailDelivery(string ticketCode)
        {
            var msg = new JMessage();
            try
            {
                var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
                var data = (from a in _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                            join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                            join c in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.MapId equals c.Id into c1
                            from c in c1.DefaultIfEmpty()
                            //join d in _context.EDMSLines on c.LineCode equals d.LineCode
                            //join e in _context.EDMSRacks on c.RackCode equals e.RackCode
                            //join f in _context.EDMSFloors on c.FloorCode equals f.FloorCode
                            join d in _context.PAreaMappingsStore.Where(x => !x.IsDeleted) on c.MappingCode equals d.ObjectCode
                            into d1
                            from d in d1.DefaultIfEmpty()
                            join e in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false)
                                on new { d.CategoryCode, d.ObjectType } equals new
                                { CategoryCode = e.Code, ObjectType = e.PAreaType }
                            into e1
                            from e in e1.DefaultIfEmpty()
                            select new ProductExpDetail
                            {
                                Id = a.Id,
                                ProductName = b.ProductName,
                                ProductCode = b.ProductCode,
                                Quantity = a.Quantity,
                                Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Unit)).ValueSet,
                                SalePrice = a.SalePrice,
                                Status = a.Status,
                                UnitMoney = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Currency)).ValueSet,
                                Position = d != null ? d.ObjectCode : "Đã thay đổi",
                                IsCustomized = a.IsCustomized,
                                ProdCustomJson = a.ProdCustomJson,
                                Type = a.ExpType == "PARTIAL" ? "Rút linh kiện" : "Rút toàn bộ",
                                IdProduct = b.Id,
                                Serial = b.Serial,
                                Weight = a.Weight,
                                PackCode = a.PackCode,
                                PackLot = a.PackLot
                            }).ToList().OrderByDescending(x => x.Id);
                foreach (var item in data)
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
                }
                msg.Object = data;
            }
            catch (Exception ex)
            {

            }
            return Json(msg);
        }
        public class ExportPartialDetails
        {
            public ProductImportDetail ExportDetailParent { get; set; }
            public List<ExportDetail> ListExportDetails { get; set; }
        }

        public class ExportDetail
        {
            public string TicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string ProductCode { get; set; }
            public string ProductNo { get; set; }
            public string ProductQrCode { get; set; }
            public decimal Quantity { get; set; }
            public string Unit { get; set; }
            public string SrcUnit { get; set; }
            public string ProductType { get; set; }
            public string WHS_Code { get; set; }
            public decimal? SalePrice { get; set; }
            public string Currency { get; set; }
            public int MapId { get; set; }
            public bool MarkWholeProduct { get; set; }
            public string JsonPack { get; set; }
            public decimal MaxQuantity { get; set; }
            public string ProdCustomJson { get; set; }
            public bool? IsCustomized { get; set; }
            public string ExpType { get; set; }
            public string Status { get; set; }
            public bool? IsMultiple { get; set; }
            public decimal? Weight { get; set; }
            public string PackCode { get; set; }
            public string PackLot { get; set; }
        }
        #endregion

        #region Get thông tin chung
        [AllowAnonymous]
        [HttpPost]
        public object GetListLotProduct()
        {
            //Giờ lấy theo lô hàng bán ra để xuất kho (phiếu đặt hàng Customer)
            var rs = (from a in _context.PoSaleHeaderNotDones
                      orderby a.ContractHeaderID descending
                      select new
                      {
                          Code = a.ContractCode,
                          Name = a.Title,

                      });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListLotProduct4Update(string lotProductCode)
        {
            //Giờ lấy theo lô hàng bán ra để xuất kho (phiếu đặt hàng Customer)
            var rs1 = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                       orderby a.ContractHeaderID descending
                       select new
                       {
                           Code = a.ContractCode,
                           Name = a.Title,
                       });
            var rs2 = (from a in _context.PoSaleHeaderNotDones.Where(x => x.ContractCode != lotProductCode)
                       orderby a.ContractHeaderID descending
                       select new
                       {
                           Code = a.ContractCode,
                           Name = a.Title,
                       });
            return rs1.Concat(rs2);
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListStore()
        {
            var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true).OrderBy(x => x.WHS_Name).Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
            //var rs = _context.WarehouseZoneStructs.Where(x => !x.IsDeleted && x.ZoneType == "WAREHOUSE").OrderBy(x => x.ZoneName).Select(x => new { Code = x.ZoneCode, Name = x.ZoneName });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListContract()
        {
            var rs = _context.PoSaleHeaders.Where(x => !x.IsDeleted).OrderBy(x => x.Title).Select(x => new { Code = x.ContractCode, Name = x.Title, Version = x.Version });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListCustomer()
        {
            var rs = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_ACTIVE").OrderBy(x => x.CusName).Select(x => new { Code = x.CusCode, Name = x.CusName });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public string GetCustomer(string contractCode)
        {
            var rs = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == contractCode).Select(x => new { x.CusCode }).FirstOrDefault();
            if (rs != null)
            {
                return rs.CusCode;
            }
            else
            {
                return null;
            }
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListUserExport()
        {
            //var rs = _context.Users.Where(x => x.Active && x.UserName != "admin").OrderBy(x => x.GivenName).Select(x => new { Code = x.UserName, Name = x.GivenName });
            var data = from a in _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                           //join b in _context.AdUserInGroups.Where(x => x.IsMain) on a.Id equals b.UserId
                       orderby a.Name
                       select a;
            return data;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListReason()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListCurrency()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListProduct(string storeCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            var rs = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                      join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                      join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                      from e2 in e1.DefaultIfEmpty()
                      select new
                      {
                          Code = a.ProductQrCode,
                          Name = string.Format("Thành phẩm_{0} - {1}", b.ProductName, b.ProductCode),
                          Unit = a.Unit,
                          ProductCode = a.ProductCode,
                          UnitName = c2.ValueSet,
                          Quantity = a.Quantity,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                          e2.SupCode,
                          e2.SupName
                      })
                        .Concat(from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                                join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                                join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                from e2 in e1.DefaultIfEmpty()
                                select new
                                {
                                    Code = a.ProductQrCode,
                                    Name = string.Format("{0} - {1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                                    Unit = b.Unit,
                                    ProductCode = b.ProductQrCode,
                                    UnitName = c2.ValueSet,
                                    Quantity = a.Quantity,
                                    b.AttributeCode,
                                    b.AttributeName,
                                    ProductType = "SUB_PRODUCT",
                                    e2.SupCode,
                                    e2.SupName
                                });
            //return Json(query.ToList());

            return rs;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListProductCode(string storeCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            var rs = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                      join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                      join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                      from e2 in e1.DefaultIfEmpty()
                      select new
                      {
                          Code = a.ProductCode,
                          Name = string.Format("{0} - {1}", b.ProductName, b.ProductCode),
                          Unit = a.Unit,
                          ProductCode = a.ProductCode,
                          ProductQrCode = a.ProductQrCode,
                          UnitName = c2.ValueSet,
                          Quantity = a.Quantity,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = b.TypeCode,
                          e2.SupCode,
                          e2.SupName,
                          Lot = a.ProductLot
                      }).ToList();
            //.Concat(from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
            //        join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
            //        join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode
            //        join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
            //        from c2 in c1.DefaultIfEmpty()
            //        join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
            //        from e2 in e1.DefaultIfEmpty()
            //        select new
            //        {
            //            Code = a.ProductQrCode,
            //            Name = string.Format("{0} - {1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
            //            Unit = b.Unit,
            //            ProductCode = b.ProductQrCode,
            //            UnitName = c2.ValueSet,
            //            Quantity = a.Quantity,
            //            b.AttributeCode,
            //            b.AttributeName,
            //            ProductType = "SUB_PRODUCT",
            //            e2.SupCode,
            //            e2.SupName
            //        }).ToList();

            var dataRs = rs.GroupBy(x => x.ProductCode).Select(x => new
            {
                x.First().Code,
                x.First().Name,
                x.First().ProductCode,
                x.First().ProductQrCode,
                x.First().Unit,
                x.First().UnitName,
                x.First().Quantity,
                x.First().AttributeCode,
                x.First().AttributeName,
                x.First().ProductType,
                x.First().SupCode,
                x.First().SupName,
                x.First().Lot
            });

            var listProductCode = from b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted)
                                  join c in _context.ProductInStocks.Where(x => !x.IsDeleted) on b.ProductQrCode equals c.ProductQrCode
                                  join d in dataRs on c.ProductCode equals d.ProductCode
                                  join e in _context.EDMSRacks on b.RackCode equals e.RackCode into e1
                                  from e2 in e1.DefaultIfEmpty()
                                      //join f in _context.MapStockProdIns.Where(x => x.Quantity != 0 && x.Quantity != null) on b.Id equals f.MapId
                                  select new
                                  {
                                      d.Code,
                                      d.Name,
                                      d.ProductCode,
                                      d.Unit,
                                      d.UnitName,
                                      b.Quantity,
                                      d.AttributeCode,
                                      d.AttributeName,
                                      d.ProductType,
                                      d.SupCode,
                                      d.SupName,
                                      d.ProductQrCode,
                                      Position = e2 != null ? string.Format("{0} - {1}", e2.RackName, b.RackPosition) : b.RackPosition,
                                      MapId = b.Id,
                                      c.MarkWholeProduct,
                                      d.Lot
                                  };

            return listProductCode;
        }



        [AllowAnonymous]
        [HttpGet]
        public object GetPositionProduct(string productCode, string productLot, string storeCode)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && x.ProductCode.Equals(productCode) && x.ProductLot.Equals(productLot) && (x.Remain != null && x.Remain > 0))
                               join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                               join c in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode.Equals(storeCode)) on a.ProductQrCode equals c.ProductQrCode
                               let listProd = a.CoilCode.Split("_", StringSplitOptions.None)
                               select new
                               {
                                   a.Id,
                                   a.ProductQrCode,
                                   ProductCoil = a.CoilCode,
                                   ProductCoilRelative = a.CoilRelative,
                                   a.Remain,
                                   a.Size,
                                   a.TicketCode,
                                   a.PackType,
                                   a.PositionInStore,
                                   a.RackCode,
                                   a.RackPosition,
                                   a.CreatedBy,
                                   a.CreatedTime,
                                   a.UpdatedBy,
                                   a.UpdatedTime,
                                   sProductCoil = !string.IsNullOrEmpty(a.CoilCode) ? listProd[listProd.Length - 2] : "",
                               };

                msg.Error = false;
                msg.Object = listCoil;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListProduct4QrCode(string storeCode, string productCode, string productType)
        {
            if (productType == "FINISHED_PRODUCT")
            {
                var rs = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT" && x.ProductCode == productCode)
                          join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                          join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                          join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                          from c2 in c1.DefaultIfEmpty()
                          join e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals e.ProductQrCode
                          select new
                          {
                              Code = a.ProductCode,
                              Name = string.Format("Thành phẩm_{0} - {1}", b.ProductName, b.ProductCode),
                              Unit = a.Unit,
                              ProductCode = a.ProductCode,
                              UnitName = c2.ValueSet,
                              Quantity = a.Quantity,
                              AttributeCode = "",
                              AttributeName = "",
                              ProductType = "FINISHED_PRODUCT",
                          }).ToList();

                var rsData = rs.GroupBy(x => x.ProductCode).Select(x => new
                {
                    x.First().Code,
                    x.First().Name,
                    x.First().Unit,
                    x.First().ProductCode,
                    x.First().UnitName,
                    x.First().Quantity,
                    x.First().AttributeCode,
                    x.First().AttributeName,
                    x.First().ProductType,
                });

                return rsData;
            }
            else
            {
                var rs = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT" && x.ProductCode == productCode)
                          join d in _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                          join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode
                          join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                          from c2 in c1.DefaultIfEmpty()
                          join e in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals e.ProductQrCode
                          select new
                          {
                              Code = a.ProductQrCode,
                              Name = string.Format("{0} - {1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                              Unit = b.Unit,
                              ProductCode = b.ProductQrCode,
                              UnitName = c2.ValueSet,
                              Quantity = a.Quantity,
                              b.AttributeCode,
                              b.AttributeName,
                              ProductType = "SUB_PRODUCT",
                          }).ToList();

                var rsData = rs.GroupBy(x => x.ProductCode).Select(x => new
                {
                    x.First().Code,
                    x.First().Name,
                    x.First().Unit,
                    x.First().ProductCode,
                    x.First().UnitName,
                    x.First().Quantity,
                    x.First().AttributeCode,
                    x.First().AttributeName,
                    x.First().ProductType,
                });

                return rsData;
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListGridProduct(string ticketExpCode, string productCode, string productType)
        {
            if (productType == "FINISHED_PRODUCT")
            {
                var rs = (from a in _context.ProdPackageDeliverys.Where(y => !y.IsDeleted && y.TicketExpCode == ticketExpCode && y.ProductCode == productCode)
                          join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                          join d in _context.EDMSLines on c.LineCode equals d.LineCode
                          join e in _context.EDMSFloors on d.FloorCode equals e.FloorCode
                          join f in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals f.ProductCode
                          join g in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f.Unit equals g.CodeSet
                          let name = e.FloorName + " - " + d.L_Text + " - " + c.RackName
                          let listProd = a.CoilCode.Split("_", StringSplitOptions.None)
                          orderby f.ProductName
                          select new
                          {
                              a.Id,
                              ProductCode = productCode,
                              ProductType = "FINISHED_PRODUCT",
                              ProductName = "Thành phẩm _ " + f.ProductName,
                              ProductQrCode = a.ProductQrCode,
                              sProductQrCode = CommonUtil.GenerateQRCode(a.ProductQrCode),
                              Unit = f.Unit,
                              UnitName = g.ValueSet,

                              Quantity = a.Size,
                              RackCode = a.RackCode,
                              RackName = name,
                              ProductCoil = a.CoilCode,
                              a.ProductLot,
                              sProductCoil = !string.IsNullOrEmpty(a.CoilCode) ? listProd[listProd.Length - 2] : "",
                          });
                return rs;
            }
            else
            {
                var rs = (from a in _context.ProdPackageDeliverys.Where(y => !y.IsDeleted && y.TicketExpCode == ticketExpCode && y.ProductCode == productCode)
                          join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                          join d in _context.EDMSLines on c.LineCode equals d.LineCode
                          join e in _context.EDMSFloors on d.FloorCode equals e.FloorCode
                          join f in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals f.ProductQrCode
                          join i in _context.MaterialProducts.Where(y => !y.IsDeleted) on f.ProductCode equals i.ProductCode
                          join g in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f.Unit equals g.CodeSet
                          let name = e.FloorName + " - " + d.L_Text + " - " + c.RackName
                          let listProd = a.CoilCode.Split("_", StringSplitOptions.None)
                          orderby f.AttributeName
                          select new
                          {
                              a.Id,
                              ProductCode = productCode,
                              ProductType = "SUB_PRODUCT",
                              ProductName = i.ProductCode + " _ " + f.AttributeName,
                              ProductQrCode = a.ProductQrCode,
                              sProductQrCode = CommonUtil.GenerateQRCode(a.ProductQrCode),
                              Unit = f.Unit,
                              UnitName = g.ValueSet,

                              Quantity = a.Size,
                              RackCode = a.RackCode,
                              RackName = name,
                              ProductCoil = a.CoilCode,
                              a.ProductLot,
                              sProductCoil = !string.IsNullOrEmpty(a.CoilCode) ? listProd[listProd.Length - 2] : "",
                          });
                return rs;
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListCoilByProdQrCode(string storeCode, string productCode, string productType, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var ProdPackageInfos = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && x.ProductQrCode.Equals(productQrCode) && x.Remain > 0).Select(x => new
                {
                    x.Id,
                    x.ProductQrCode,
                    ProductCoil = x.CoilCode,
                    ProductCoilRelative = x.CoilRelative,
                    x.Remain,
                    x.Size,
                    x.TicketCode,
                    x.PackType,
                    x.PositionInStore,
                    x.RackCode,
                    x.RackPosition,
                    x.CreatedBy,
                    x.CreatedTime,
                    x.UpdatedBy,
                    x.UpdatedTime,
                    x.UnitCoil,
                    x.ProductImpType,
                    x.ProductLot,
                    IsOrder = !string.IsNullOrEmpty(x.RackCode) ? "Đã xếp kho" : "Chưa xếp kho",
                }).ToList();

                var ListCoil = from a in ProdPackageInfos
                               select new
                               {
                                   a.Id,
                                   a.ProductQrCode,
                                   a.ProductCoil,
                                   a.ProductCoilRelative,
                                   a.Remain,
                                   a.Size,
                                   a.TicketCode,
                                   a.PackType,
                                   a.PositionInStore,
                                   a.RackCode,
                                   a.RackPosition,
                                   a.CreatedBy,
                                   a.CreatedTime,
                                   a.UpdatedBy,
                                   a.UpdatedTime,
                                   a.UnitCoil,
                                   a.ProductImpType,
                                   a.ProductLot,
                                   a.IsOrder,
                               };

                mess.Object = ListCoil;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListLotByProdQrCode(string storeCode, string productCode, string productType, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {

                var listLot = new List<ProdPackageReceived>();
                var prodPackageInfos = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && x.ProductQrCode.Equals(productQrCode) && x.Remain > 0).Select(x => new
                {
                    x.Id,
                    x.ProductQrCode,
                    ProductCoil = x.CoilCode,
                    ProductCoilRelative = x.CoilRelative,
                    x.Remain,
                    x.Size,
                    x.TicketCode,
                    x.PackType,
                    x.PositionInStore,
                    x.RackCode,
                    x.RackPosition,
                    x.CreatedBy,
                    x.CreatedTime,
                    x.UpdatedBy,
                    x.UpdatedTime,
                    x.UnitCoil,
                    x.ProductImpType,
                    x.ProductLot,
                    StoreCode = "",
                    IsOrder = !string.IsNullOrEmpty(x.RackCode) ? "Đã xếp kho" : "Chưa xếp kho",
                }).ToList();

                foreach (var item in prodPackageInfos)
                {
                    var _storeCode = item.RackCode.Split("_")[item.RackCode.Split("_").Length - 1];
                    if (string.IsNullOrEmpty(storeCode) || _storeCode.Equals(storeCode))
                    {
                        var obj = new ProdPackageReceived
                        {
                            Id = item.Id,
                            ProductQrCode = item.ProductQrCode,
                            ProductCoil = item.ProductCoil,
                            ProductCoilRelative = item.ProductCoilRelative,
                            Remain = item.Remain,
                            Size = item.Size,
                            TicketCode = item.TicketCode,
                            PackType = item.PackType,
                            PositionInStore = item.PositionInStore,
                            RackCode = item.RackCode,
                            RackPosition = item.RackPosition,
                            CreatedBy = item.CreatedBy,
                            CreatedTime = item.CreatedTime,
                            UpdatedBy = item.UpdatedBy,
                            UpdatedTime = item.UpdatedTime,
                            UnitCoil = item.UnitCoil,
                            ProductImpType = item.ProductImpType,
                            ProductLot = item.ProductLot,
                            StoreCode = _storeCode,
                        };

                        listLot.Add(obj);
                    }
                }

                var listRs = listLot.GroupBy(x => new { x.ProductLot, x.UnitCoil }).Select(p => new
                {
                    p.First().ProductLot,
                    Quantity = p.Count(),
                    QuantityUnit = p.Sum(y => y.Remain),
                    p.First().UnitCoil,
                    p.First().StoreCode
                });
                mess.Object = listRs;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListProductLot(string productCode, string storeCode)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var rs = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && (x.Remain != null && x.Remain > 0))
                         join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                         join c in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode.Equals(productCode) && x.StoreCode.Equals(storeCode)) on a.ProductQrCode equals c.ProductQrCode
                         group a.ProductLot by a.ProductLot into g
                         select new
                         {
                             Code = g.Key,
                             Name = g.Key
                         };

                msg.Error = false;
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListRackCode(string productQrCode)
        {
            var rs = from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
                     join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                     join c in _context.EDMSLines on b.LineCode equals c.LineCode
                     join d in _context.EDMSFloors on c.FloorCode equals d.FloorCode
                     let name = d.FloorName + " - " + c.L_Text + " - " + b.RackName
                     orderby name
                     select new
                     {
                         Code = a.RackCode,
                         Name = name,
                         Quantity = a.Quantity,
                     };
            return rs;
        }
        ////Hướng cũ - mỗi sản phẩm khi import là 1 giá khác nhau
        //[AllowAnonymous]
        [HttpPost]
        //public object GetSalePrice(string qrCode)
        //{
        //    var rs = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted && x.ProductCode == qrCode)
        //              join b in _context.ProductCostHeaders.Where(x => !x.IsDeleted && x.EffectiveDate <= DateTime.Now && x.ExpiryDate >= DateTime.Now) on a.HeaderCode equals b.HeaderCode
        //              select new
        //              {
        //                  SalePrice = a.PriceCost,
        //                  TaxRate = a.Tax,
        //                  //Discount = a.Discount,
        //                  //Commission = a.Commission,
        //                  Discount = 0,
        //                  Commission = 0,
        //              }).FirstOrDefault();
        //    return rs;
        //}
        [AllowAnonymous]
        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListPaymentStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        //Hướng mới - xuất kho theo lô sản phẩm bán (PO_Customer)
        [AllowAnonymous]
        [HttpPost]
        public object GetLotProduct(string lotProductCode, string storeCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            if (!string.IsNullOrEmpty(storeCode))
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport,
                                       Quantity = 0,
                                       QuantityNeedExport = a.QuantityNeedExport,
                                       QuantityInStockTotal = productInStockTotal,
                                       QuantityInStock = productInStock,
                                       QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                       e2.SupCode,
                                       e2.SupName,
                                   });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
            else
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport,
                                       QuantityNeedExport = a.QuantityNeedExport,
                                       Quantity = 0,
                                       QuantityInStockTotal = productInStockTotal,
                                       e2.SupCode,
                                       e2.SupName,
                                   });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
        }

        //Hướng mới - xuất kho theo lô sản phẩm bán (PO_Customer)
        //cộng thêm số lượng từ phiếu xuất kho chi tiết cho số lượng order
        [AllowAnonymous]
        [HttpPost]
        public object GetLotProduct4Update(string lotProductCode, string storeCode, string ticketCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            //var today = DateTime.Now.ToString("ddMMyyyy-HHmm");
            if (!string.IsNullOrEmpty(storeCode))
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInDetailExp = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                       //Quantity = Math.Min(productInStock, a.QuantityNeedExport),
                                       Quantity = 0,
                                       //QuantityInStockTotal = (decimal)b1.InStock,
                                       QuantityInStockTotal = productInStockTotal,
                                       QuantityInStock = productInStock,
                                       QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                       e2.SupCode,
                                       e2.SupName,
                                   })
                                   .Concat(from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                           join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.ContractCode equals a.ContractCode
                                           join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                           join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.ProductCode equals d.ProductCode
                                           join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                           from e2 in e1.DefaultIfEmpty()
                                               //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInDetailExp = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           orderby b1.AttributeName
                                           select new
                                           {
                                               ProductCode = a.ProductCode,
                                               ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                               ProductType = "SUB_PRODUCT",
                                               //ProductQrCode = productQrCode,
                                               //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                               Unit = b1.Unit,
                                               UnitName = (c1 != null ? c1.ValueSet : ""),
                                               QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                               //Quantity = Math.Min(productInStock, a.QuantityNeedExport),
                                               Quantity = 0,
                                               //QuantityInStockTotal = (decimal)b1.InStock,
                                               QuantityInStockTotal = productInStockTotal,
                                               QuantityInStock = productInStock,
                                               QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                               e2.SupCode,
                                               e2.SupName,
                                           });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
            else
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInDetailExp = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                       //Quantity = a.QuantityNeedExport,
                                       Quantity = 0,
                                       QuantityInStockTotal = productInStockTotal,
                                       e2.SupCode,
                                       e2.SupName,
                                   })
                                   .Concat(from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                           join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.ContractCode equals a.ContractCode
                                           join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                           join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.ProductCode equals d.ProductCode
                                           join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                           from e2 in e1.DefaultIfEmpty()
                                               //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInDetailExp = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           orderby b1.AttributeName
                                           select new
                                           {
                                               ProductCode = a.ProductCode,
                                               ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                               ProductType = "SUB_PRODUCT",
                                               //ProductQrCode = productQrCode,
                                               //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                               Unit = b1.Unit,
                                               UnitName = (c1 != null ? c1.ValueSet : ""),
                                               QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                               //Quantity = a.QuantityNeedExport,
                                               Quantity = 0,
                                               QuantityInStockTotal = productInStockTotal,
                                               e2.SupCode,
                                               e2.SupName,
                                           });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
        }

        //[AllowAnonymous]
        [HttpPost]
        //public object Getsupplier()
        //{
        //    var supplier = _context.Suppliers.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Id = x.SupID, Name = x.SupName });
        //    return supplier;
        //}
        //[AllowAnonymous]
        [HttpPost]
        //public object GetUser()
        //{
        //    var query = _context.Users.Where(x => x.Active && x.UserName != "admin").AsParallel().Select(x => new { Id = x.Id, Name = x.GivenName });
        //    return query;
        //}
        //[AllowAnonymous]
        [HttpGet]
        //public object GetUnit(string impCode)
        //{
        //    var unit = _context.ProductImportDetails.Where(x => x.ImpCode == impCode).Select(x => x.Unit);
        //    var list = _context.CommonSettings.Where(x => unit.Any(y => x.CodeSet == y)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        //    return list;
        //}
        #endregion

        #region Tạo mã QR_Code
        [AllowAnonymous]
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }
        #endregion

        #region Khu vực các model
        public class JTableProductCustom : JTableModel
        {
            public string LotProductCode { get; set; }
        }
        public class JTableProductRes
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string Quantity { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string LotProductCode { get; set; }
            public double Cost { get; set; }
            public double Tax { get; set; }
            public string Note { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
        }
        public class MaterialStoreExpModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string QrTicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string Title { get; set; }
            public string UserExport { get; set; }
            public string UserExportName { get; set; }
            public string UserReceipt { get; set; }
            public decimal? CostTotal { get; set; }
            public string Currency { get; set; }
            public string CurrencyName { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            public string Note { get; set; }
            public string PositionGps { get; set; }
            public string PositionText { get; set; }
            public string FromDevice { get; set; }
            public decimal? TotalPayed { get; set; }
            public decimal? TotalMustPayment { get; set; }
            public DateTime? InsurantTime { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
            public DateTime? NextTimePayment { get; set; }
            public string Reason { get; set; }
            public string ReasonName { get; set; }
            public string StoreCodeReceipt { get; set; }
            public string PaymentStatus { get; set; }
            public string PaymentStatusName { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public DateTime? DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
        }
        public class MaterialStoreExpModelInsert
        {
            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string StoreCode { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string Reason { get; set; }
            public string StoreCodeReceipt { get; set; }
            public decimal CostTotal { get; set; }
            public string Currency { get; set; }
            public decimal Discount { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalMustPayment { get; set; }
            public decimal TotalPayed { get; set; }
            public string PaymentStatus { get; set; }
            public string NextTimePayment { get; set; }
            public string UserExport { get; set; }
            public string Note { get; set; }
            public string UserReceipt { get; set; }
            public string InsurantTime { get; set; }
            public string TimeTicketCreate { get; set; }
            public string Status { get; set; }
            public string WorkflowCat { get; set; }
            public string ActRepeat { get; set; }
            public List<MaterialStoreExpModelDetailInsert> ListProduct { get; set; }
            public List<MaterialStoreExpModelDetailInsertPo> ListPoProduct { get; set; }
            public string GroupType { get; set; }
            public string SupCode { get; set; }
        }
        public class MaterialStoreExpModelDetailInsertPo : MaterialStoreExpModelDetailInsert
        {
            public List<MaterialStoreExpModelDetailInsert> ListProductInRack { get; set; }
        }
        public class MaterialStoreExpModelDetailInsert
        {
            public int? Id { get; set; }
            public string TicketCode { get; set; }
            public string ProductCoil { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string ProductQrCode { get; set; }
            public string sProductQrCode { get; set; }
            public string RackCode { get; set; }
            public string RackName { get; set; }
            public decimal Quantity { get; set; }
            public decimal QuantityOrder { get; set; }
            public decimal QuantityInStockTotal { get; set; }
            public decimal QuantityInStock { get; set; }
            public decimal QuantityMax { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public string Status { get; set; }
            public decimal? SalePrice { get; set; }
            public int? TaxRate { get; set; }
            public int? Discount { get; set; }
            public int? Commission { get; set; }
            public decimal Total { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal DiscountTotal { get; set; }
            public decimal CommissionTotal { get; set; }
            public int MapId { get; set; }
        }
        #endregion

        #region Số tiền thành chữ
        private static String ones(String Number)
        {
            int _Number = Convert.ToInt32(Number);
            String name = "";
            switch (_Number)
            {

                case 1:
                    name = "Một";
                    break;
                case 2:
                    name = "Hai";
                    break;
                case 3:
                    name = "Ba";
                    break;
                case 4:
                    name = "Bốn";
                    break;
                case 5:
                    name = "Năm";
                    break;
                case 6:
                    name = "Sáu";
                    break;
                case 7:
                    name = "Bảy";
                    break;
                case 8:
                    name = "Tám";
                    break;
                case 9:
                    name = "Chín";
                    break;
            }
            return name;
        }
        private static String tens(String Number)
        {
            int _Number = Convert.ToInt32(Number);
            String name = null;
            switch (_Number)
            {
                case 10:
                    name = "Mười";
                    break;
                case 11:
                    name = "Mười một";
                    break;
                case 12:
                    name = "Mười hai";
                    break;
                case 13:
                    name = "Mười ba";
                    break;
                case 14:
                    name = "Mười bốn";
                    break;
                case 15:
                    name = "Mười năm";
                    break;
                case 16:
                    name = "Mười sáu";
                    break;
                case 17:
                    name = "Mười bảy";
                    break;
                case 18:
                    name = "Mười tám";
                    break;
                case 19:
                    name = "Mười chín";
                    break;
                case 20:
                    name = "Hai mươi";
                    break;
                case 30:
                    name = "Ba mươi";
                    break;
                case 40:
                    name = "Bốn mươi";
                    break;
                case 50:
                    name = "Năm mươi";
                    break;
                case 60:
                    name = "Sáu mươi";
                    break;
                case 70:
                    name = "Bảy mươi";
                    break;
                case 80:
                    name = "Tám mươi";
                    break;
                case 90:
                    name = "Chín mươi";
                    break;
                default:
                    if (_Number > 0)
                    {
                        name = tens(Number.Substring(0, 1) + "0") + " " + ones(Number.Substring(1));
                    }
                    break;
            }
            return name;
        }

        private static String ConvertWholeNumber(String Number)
        {
            string word = "";
            try
            {
                bool beginsZero = false;//tests for 0XX   
                bool isDone = false;//test if already translated   
                double dblAmt = (Convert.ToDouble(Number));
                //if ((dblAmt > 0) && number.StartsWith("0"))   
                if (dblAmt > 0)
                {//test for zero or digit zero in a nuemric   
                    beginsZero = Number.StartsWith("0");

                    int numDigits = Number.Length;
                    int pos = 0;//store digit grouping   
                    String place = "";//digit grouping name:hundres,thousand,etc...   
                    switch (numDigits)
                    {
                        case 1://ones' range   

                            word = ones(Number);
                            isDone = true;
                            break;
                        case 2://tens' range   
                            word = tens(Number);
                            isDone = true;
                            break;
                        case 3://hundreds' range   
                            pos = (numDigits % 3) + 1;
                            place = " Trăm ";
                            break;
                        case 4://thousands' range   
                        case 5:
                        case 6:
                            pos = (numDigits % 4) + 1;
                            place = " Nghìn ";
                            break;
                        case 7://millions' range   
                        case 8:
                        case 9:
                            pos = (numDigits % 7) + 1;
                            place = " Triệu ";
                            break;
                        case 10://Billions's range   
                        case 11:
                        case 12:

                            pos = (numDigits % 10) + 1;
                            place = " Tỉ ";
                            break;
                        //add extra case options for anything above Billion...   
                        default:
                            isDone = true;
                            break;
                    }
                    if (!isDone)
                    {//if transalation is not done, continue...(Recursion comes in now!!)   
                        if (Number.Substring(0, pos) != "0" && Number.Substring(pos) != "0")
                        {
                            try
                            {
                                word = ConvertWholeNumber(Number.Substring(0, pos)) + place + ConvertWholeNumber(Number.Substring(pos));
                            }
                            catch { }
                        }
                        else
                        {
                            word = ConvertWholeNumber(Number.Substring(0, pos)) + ConvertWholeNumber(Number.Substring(pos));
                        }


                    }
                    //ignore digit grouping names   
                    if (word.Trim().Equals(place.Trim())) word = "";
                }
            }
            catch { }
            return word.Trim();
        }
        #endregion

        #region Language
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCj.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_customerLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_commonSettingController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Workflow
        [AllowAnonymous]
        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProductExportHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                && x.ObjectType.Equals("EXPORT_STORE"));
            if (check != null)
            {
                var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                var name = new ComboxModel
                {
                    IntsCode = initial.ActivityInstCode,
                    Code = initial.ActivityCode,
                    Name = initial.Title,
                    Status = initial.Status,
                    UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName : null,
                    UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
                };
                list.Add(name);
                var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            IntsCode = inti.ActivityInstCode,
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                            UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName : null,
                            UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }
                    count++;
                }
                var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent)).ActivityCode;
                var user = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(role) && x.UserId.Equals(ESEIM.AppContext.UserId));
                var hh = "";
                if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                {
                    hh = "TYPE_ACTIVITY_INITIAL";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
                {
                    hh = "TYPE_ACTIVITY_REPEAT";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
                {
                    hh = "TYPE_ACTIVITY_END";
                }
                if (user != null)
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };

                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    else { return data; }
                }
                else
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    else { return data; }
                }
            }
            else
            {
                return data;
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.ProductExportHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x => new
            {
                x.Status
            });
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetStepWorkFlow(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var value = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(code));
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
            };
            list.Add(name);
            var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            if (location != null)
            {
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }
                    count++;
                }
                return new { list };
            }
            else
            {
                return new { list };
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetItemHeader(int id)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProductExportHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                        && x.ObjectType.Equals("EXPORT_STORE"));
            if (check != null)
            {
                var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                var name = new ComboxModel
                {
                    IntsCode = initial.ActivityInstCode,
                    Code = initial.ActivityCode,
                    Name = initial.Title,
                    Status = initial.Status,
                    UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName : null,
                    UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
                };
                list.Add(name);
                var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
                var next = location.ActivityDestination;
                var count = 1;
                foreach (var item in value)
                {
                    var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                    if (inti != null && count < value.Count())
                    {
                        var name2 = new ComboxModel
                        {
                            IntsCode = inti.ActivityInstCode,
                            Code = inti.ActivityCode,
                            Name = inti.Title,
                            Status = inti.Status,
                            UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null ?
                               _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName : null,
                            UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
                        };
                        list.Add(name2);
                        var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                        if (location2 != null)
                        {
                            next = location2.ActivityDestination;
                        }
                    }
                    count++;
                }
                var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent)).ActivityInstCode;
                var user = _context.ExcuterControlRoleInsts.FirstOrDefault(x => !x.IsDeleted && x.ActivityCodeInst.Equals(role) && x.UserId.Equals(ESEIM.AppContext.UserId));
                var hh = "";
                if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                {
                    hh = "TYPE_ACTIVITY_INITIAL";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
                {
                    hh = "TYPE_ACTIVITY_REPEAT";
                }
                else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
                {
                    hh = "TYPE_ACTIVITY_END";
                }
                if (user != null)
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };

                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = true, list, current };
                    }
                    else { return data; }
                }
                else
                {
                    if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    if (hh.Equals("TYPE_ACTIVITY_END"))
                    {
                        var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                           .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                        return new { data, com, editrole = false, list, current };
                    }
                    else { return data; }
                }
            }
            else
            {
                return data;
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProductExportHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode) && x.ObjectType.Equals("EXPORT_STORE"));
            var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
            var current = check.MarkActCurrent;
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                IntsCode = initial.ActivityInstCode,
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
            };
            list.Add(name);
            var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            var next = location.ActivityDestination;
            var count = 1;
            foreach (var item in value)
            {
                var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                if (inti != null && count < value.Count())
                {
                    var name2 = new ComboxModel
                    {
                        IntsCode = inti.ActivityInstCode,
                        Code = inti.ActivityCode,
                        Name = inti.Title,
                        Status = inti.Status,
                    };
                    list.Add(name2);
                    var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                    if (location2 != null)
                    {
                        next = location2.ActivityDestination;
                    }
                }
                count++;
            }
            return new { list, current };
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var prod = _context.ProductExportHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            return Json(prod);
        }

        public class ComboxModel
        {
            public string IntsCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string UpdateTime { get; set; }
            public string UpdateBy { get; set; }
        }

        public class JsonCommand
        {
            public int Id { get; set; }
            public string CommandSymbol { get; set; }
            public string ConfirmedBy { get; set; }
            public string Confirmed { get; set; }
            public string ConfirmedTime { get; set; }
            public string Approved { get; set; }
            public string ApprovedBy { get; set; }
            public string ApprovedTime { get; set; }
            public string Message { get; set; }
            public string ActA { get; set; }
            public string ActB { get; set; }
            public bool IsLeader { get; set; }
        }
        #endregion


        #region Import Word/Excel
        public class ModelImportWord
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string UnitName { get; set; }
            public decimal Quantity { get; set; }
            public decimal? Cost { get; set; }
            public string TicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string Status { get; set; }
            public string PositionNo { get; set; }
            public List<ModelImportWordPosition> ListPosition { get; set; }
        }
        public class ModelImportWordPosition
        {
            public int? MapId { get; set; }
            public string ProductNo { get; set; }
        }
        public string Import(Microsoft.AspNetCore.Http.IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            System.IO.Stream stream = new System.IO.MemoryStream();
            Microsoft.AspNetCore.Http.IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;

            Syncfusion.EJ2.DocumentEditor.WordDocument document = Syncfusion.EJ2.DocumentEditor.WordDocument.Load(stream, GetFormatType(type.ToLower()));
            //document.Save(streamSave);

            string sfdt = Newtonsoft.Json.JsonConvert.SerializeObject(document);

            document.Dispose();
            var outputStream = Syncfusion.EJ2.DocumentEditor.WordDocument.Save(sfdt, FormatType.Html);
            outputStream.Position = 0;
            StreamReader reader = new StreamReader(outputStream);
            string value = reader.ReadToEnd().ToString();
            return value;
        }

        internal static Syncfusion.EJ2.DocumentEditor.FormatType GetFormatType(string format)
        {
            if (string.IsNullOrEmpty(format))
                throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            switch (format.ToLower())
            {
                case ".dotx":
                case ".docx":
                case ".docm":
                case ".dotm":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Docx;
                case ".dot":
                case ".doc":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Doc;
                case ".rtf":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Rtf;
                case ".txt":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Txt;
                case ".xml":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.WordML;
                default:
                    throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertFromWord([FromBody] List<ModelImportWord> data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                var firstItem = data.FirstOrDefault();
                if (firstItem != null)
                {
                    var impHeader = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == firstItem.TicketCode);
                    if (impHeader != null)
                    {
                        msg.Error = true;
                        msg.Title = "Mã phiếu xuất " + impHeader.TicketCode + " đã được sử dụng!";
                        return Json(msg);
                    }
                }
                foreach (var item in data)
                {
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode));

                    //var checkDetail = _context.StopContractDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeeCode.Equals(item.EmployeeCode) && x.DecisionNum.Equals(item.DecisionNum));
                    if (materialProduct == null)
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm " + item.ProductCode + " không tồn tại!";
                        return Json(msg);
                    }
                    else
                    {
                        var listProdNo = item.ListPosition.Select(x => ListProdStrNoHelper.GetListProdStrNo(x.ProductNo)).ToList();
                        var sumQuantity = listProdNo.Count > 0 ? listProdNo.Sum(x => x.SumQuantity()) : 0;
                        if (item.Quantity != sumQuantity)
                        {
                            msg.Error = true;
                            msg.Title = $"Số lượng xuất của sản phẩm {item.ProductCode} không hợp lệ!";
                            return Json(msg);
                        }
                        foreach (var itemPosition in item.ListPosition)
                        {
                            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == itemPosition.MapId);
                            if (parentMapping == null)
                            {
                                msg.Error = true;
                                msg.Title = "Sản phẩm " + item.ProductCode + " không tồn tại ở vị trí!";
                                return Json(msg);
                            }
                            else
                            {
                                var unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ValueSet) && !string.IsNullOrEmpty(item.UnitName)
                                                                    && x.ValueSet.ToLower() == item.UnitName.ToLower() && x.Group == "UNIT")?.CodeSet ?? "";
                                var exportDetail = new ExportDetail
                                {
                                    TicketCode = item.TicketCode,
                                    LotProductCode = item.LotProductCode,
                                    ProductCode = item.ProductCode,
                                    ProductNo = itemPosition.ProductNo,
                                    Unit = unit,
                                    Status = item.Status,
                                    MapId = itemPosition.MapId ?? -1,
                                    ExpType = "FULL",
                                    SalePrice = item.Cost
                                };
                                msg = InsertDetailProductOddVatco(exportDetail).Result;
                            }
                        }
                        if (msg.Error)
                        {
                            return Json(msg);
                        }
                    }
                    //else
                    //{
                    //    msg.Error = true;
                    //    msg.Title = "Mã nhân viên " + item.EmployeeCode + " đã ở trong quyết định  !";
                    //    return Json(msg);
                    //}
                    msg.Title = "Thêm thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public string SaveInputFile(Microsoft.AspNetCore.Http.IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            System.IO.Stream stream = new System.IO.MemoryStream();
            Microsoft.AspNetCore.Http.IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;
            var fileName = $"Phiếu xuất {DateTime.Now.ToString("ddMMyyy-hhmm")}{type.ToLower()}";
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
            var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
            FileStream streamSave = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            stream.Seek(0, SeekOrigin.Begin);
            stream.CopyTo(streamSave);
            streamSave.Close();
            return pathFileDownLoad;
        }

        private async Task<JMessage> InsertProductCategory(MaterialProduct obj)
        {
            var msg = new JMessage();
            try
            {
                var check = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && !x.IsDeleted);
                if (check == null)
                {
                    DateTime? foreCastTime = !string.IsNullOrEmpty(obj.sForeCastTime) ? DateTime.ParseExact(obj.sForeCastTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    MaterialProduct model = new MaterialProduct();

                    if (!string.IsNullOrEmpty(obj.GroupCode))
                    {
                        switch (obj.GroupCode)
                        {
                            case "REM":
                                model.PriceCostCatelogue = obj.PricePerM;
                                break;
                            case "THAM":
                                model.PriceCostCatelogue = obj.PricePerM2;
                                break;
                            case "SAN":
                                model.PriceCostCatelogue = obj.PricePerM2;
                                break;
                        }
                    }
                    model.QrCode = obj.ProductCode + "_" + obj.ProductName + "_" + obj.GroupCode + "_" + obj.TypeCode;
                    model.Barcode = obj.ProductCode;
                    model.ProductCode = obj.ProductCode;
                    model.ProductName = obj.ProductName;
                    model.GroupCode = obj.GroupCode;
                    model.Unit = obj.Unit;
                    model.Note = obj.Note;
                    model.Image = obj.Image;
                    //model.ProductGroup = null;
                    model.CreatedBy = ESEIM.AppContext.UserName;
                    model.CreatedTime = DateTime.Now.Date;
                    model.IsDeleted = false;

                    model.Material = obj.Material;
                    model.Pattern = obj.Pattern;
                    model.Wide = obj.Wide;
                    model.High = obj.High;
                    model.Long = obj.Long;
                    model.Weight = obj.Weight;
                    model.UnitWeight = obj.UnitWeight;
                    model.Inheritance = obj.Inheritance;
                    model.Status = obj.Status;
                    model.TypeCode = obj.TypeCode;
                    model.Description = obj.Description;
                    model.PricePerM = obj.PricePerM;
                    model.PricePerM2 = obj.PricePerM2;
                    model.InStock = 0;
                    model.ForecastInStock = obj.ForecastInStock;
                    model.ForecastTime = foreCastTime;
                    model.Label = obj.Label;
                    model.ImpType = obj.ImpType;
                    model.Packing = obj.Packing;
                    model.Json = obj.Json;

                    model.Brand = obj.Brand;
                    model.Supplier = obj.Supplier;
                    model.DeletionToken = "NA";
                    model.MpStatuses = new List<MpStatus>();

                    _context.MaterialProducts.Add(model);

                    //New Unit from pack
                    //UnitFromPack(obj.Json);

                    await _context.SaveChangesAsync();

                    msg.Error = false;
                    msg.Object = model;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["MLP_MSG_PRODUCT"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Sản phẩm đã tồn tại, không thể thêm";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["MLP_CURD_LBL_PRODUCT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return msg;
        }
        #endregion

        #region Package

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> ExportFromPackage(string packCode, string ticketCode, string createdBy = "")
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var package = _context.PackageObjects
                    .FirstOrDefault(x => x.PackCode == packCode);
                if (package == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy pallet!";
                    return Ok(msg);
                }
                if (package.StatusReady != "EXP_READY")
                {
                    msg.Error = true;
                    msg.Title = "Palet không sẵn sàng!";
                    return Ok(msg);
                }
                var packageDetails = _context.ProductInPallets
                    .Where(x => x.PackCode == packCode && x.IsDeleted == false).ToList();
                if (packageDetails.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để xuất!";
                    return Ok(msg);
                }
                foreach (var item in packageDetails)
                {
                    var productInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    if (productInStock == null || item.IdImpProduct == null || item.IdImpProduct == -1)
                    {
                        msg.Error = true;
                        msg.Title = "Palet chưa được nhập!";
                        return Ok(msg);
                    }
                    var productLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    if (productLocatedMapping == null)
                    {
                        msg.Error = true;
                        msg.Title = "Palet chưa được xếp!";
                        return Ok(msg);
                    }
                }
                foreach (var item in packageDetails)
                {
                    var quantity = item.ListProdStrNo.SumQuantity();
                    var today = DateTime.Now.ToString("ddMMyyyy-HHmm"); //format('DDMMYYYY-HHmm')
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                    var productLocatedMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct);
                    var newDetail = new ExportDetail()
                    {
                        Currency = "VND",
                        //PackType = "",
                        ProductCode = item.ProductCode,
                        //AttrCustom = "",
                        ProductQrCode = $"{item.ProductCode}_SL.{quantity}_T.{today}",
                        ProductType = materialProduct?.TypeCode,
                        ProductNo = item.ProductNo,
                        Quantity = quantity,
                        SalePrice = 0,
                        TicketCode = ticketCode,
                        SrcUnit = materialProduct.Unit,
                        //UserName = createdBy,
                        ExpType = "FULL",
                        //ParentMappingId = -1,
                        //ParentProductNumber = -1,
                        MapId = productLocatedMapping.Id,
                        Weight = item.Measure,
                        IsMultiple = false,
                        PackCode = packCode,
                        PackLot = package?.PackLot
                    };
                    item.IdImpProduct = -1;
                    msg = await InsertDetailProductOddVatco(newDetail);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                }
                if (package != null)
                {
                    //package.StatusReady = "NON_READY";
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi nhập!";
            }

            return Ok(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> DeletePackageExport(string ticketCode, string packCode)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var listDeleteDetail = _context.ProductExportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.PackCode == packCode).ToList();
                var ticket = _context.ProductExportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == ticketCode);
                if (ticket?.TicketStatus == "INITIAL_DONE")
                {
                    msg.Error = true;
                    msg.Title = "Phiếu xuất đã xử lý xong không được xóa chi tiết";
                    return Ok(msg);
                }
                if (listDeleteDetail.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để xóa!";
                    return Ok(msg);
                }
                foreach (var item in listDeleteDetail)
                {
                    msg = await DelDeliveryDetail(item.Id);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Ok(msg);
        }
        #endregion
    }

    internal class ProductExpDetail
    {
        public int Id { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public decimal Quantity { get; set; }
        public string Unit { get; set; }
        public decimal? SalePrice { get; set; }
        public string Status { get; set; }
        public string UnitMoney { get; set; }
        public string Position { get; set; }
        public bool? IsCustomized { get; set; }
        public string ProdCustomJson { get; set; }
        public string ProductStatus { get; set; }
        public int IdProduct { get; set; }
        public string Type { get; set; }
        public string Serial { get; set; }

        public decimal? Weight { get; set; }
        public string TicketCode { get; set; }
        public string TicketName { get; set; }
        public string PackCode { get; set; }
        public string PackLot { get; set; }

        public ProductExpDetail()
        {

        }

        public ProductExpDetail(int id, string productName, string productCode, decimal quantity, string unit, decimal? salePrice, string status, string unitMoney, string position, bool? isCustomized, string prodCustomJson, int idProduct)
        {
            Id = id;
            ProductName = productName;
            ProductCode = productCode;
            Quantity = quantity;
            Unit = unit;
            SalePrice = salePrice;
            Status = status;
            UnitMoney = unitMoney;
            Position = position;
            IsCustomized = isCustomized;
            ProdCustomJson = prodCustomJson;
            IdProduct = idProduct;
        }

        public override bool Equals(object obj)
        {
            return obj is ProductExpDetail other &&
                   Id == other.Id &&
                   ProductName == other.ProductName &&
                   ProductCode == other.ProductCode &&
                   Quantity == other.Quantity &&
                   Unit == other.Unit &&
                   SalePrice == other.SalePrice &&
                   Status == other.Status &&
                   UnitMoney == other.UnitMoney &&
                   Position == other.Position &&
                   IsCustomized == other.IsCustomized &&
                   ProdCustomJson == other.ProdCustomJson &&
                   IdProduct == other.IdProduct;
        }

        public override int GetHashCode()
        {
            HashCode hash = new HashCode();
            hash.Add(Id);
            hash.Add(ProductName);
            hash.Add(ProductCode);
            hash.Add(Quantity);
            hash.Add(Unit);
            hash.Add(SalePrice);
            hash.Add(Status);
            hash.Add(UnitMoney);
            hash.Add(Position);
            hash.Add(IsCustomized);
            hash.Add(ProdCustomJson);
            hash.Add(IdProduct);
            return hash.ToHashCode();
        }
    }
}