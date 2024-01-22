using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Syncfusion.XlsIO;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Http;
using Syncfusion.EJ2.DocumentEditor;
using System.Data;
using III.Domain.Common;
using DataTable = System.Data.DataTable;
using static III.Admin.Controllers.CardJobController;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductImportController : BaseWarehouseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<MaterialImpStoreController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCj;
        private readonly IStringLocalizer<MaterialProductController> _materialProductController;
        private readonly IStringLocalizer<MaterialProductAttributeMainController> _mpamStringLocalizer;
        private readonly IStringLocalizer<CommonSettingController> _commonSettingController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public ProductImportController(
            EIMDBContext context,
            IHostingEnvironment hostingEnvironment,
            IStringLocalizer<MaterialImpStoreController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService,
            IStringLocalizer<CommonSettingController> commonSettingController,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<MaterialProductController> materialProductController,
            IStringLocalizer<MaterialProductAttributeMainController> mpamStringLocalizer,
            IStringLocalizer<WorkflowActivityController> workflowActivityController,
            IStringLocalizer<CardJobController> stringLocalizerCj)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
            _commonSettingController = commonSettingController;
            _workflowActivityController = workflowActivityController;
            _mpamStringLocalizer = mpamStringLocalizer;
            _materialProductController = materialProductController;
            _stringLocalizerCj = stringLocalizerCj;
        }
        public class JTableModelMaterialImpStoreDetail : JTableModel
        {
            public string ExpCode { get; set; }
            public string StoreName { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }

        }
        public class JTableModelMaterialStoreImpGoodsHeaders : JTableModel
        {
            public string Title { get; set; }
            public string CusCode { get; set; }
            public string StoreCode { get; set; }
            public string UserImport { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ReasonName { get; set; }
            public string SupplierCode { get; set; }
        }
        public class JTableModelMaterialStoreImpGoodsDetails : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string GroupType { get; set; }
            public string Status { get; set; }
            public string SupplierCode { get; set; }
            public string UserImport { get; set; }
        }
        public class JtableAttributeModel : JTableModel
        {
            public string ProductCode { get; set; }
            public string Uuid { get; set; }
        }
        [AllowAnonymous]
        [Breadcrumb("ViewData.CrumbImpStore", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbSaleWHHome"] = _sharedResources["COM_CRUMB_SALE_WH"];
            ViewData["CrumbImpStore"] = _sharedResources["COM_CRUMB_IMP_STORE"];
            return View();
        }

        #region Header

        [NonAction]
        public JsonResult JTable([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara, int userType = 0)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(userType, jTablePara.Title, jTablePara.CusCode, jTablePara.StoreCode, jTablePara.UserImport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.ReasonName, jTablePara.SupplierCode);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.QrTicketCode = CommonUtil.GenerateQRCode(item.TicketCode);
                //}
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserImport", "UserImportName", "UserSend", "Note", "PositionGps", "PositionText", "FromDevice", "InsurantTime", "TimeTicketCreate", "Reason", "ReasonName", "StoreCodeSend", "CreatedBy");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<MaterialStoreImpModel>(), jTablePara.Draw, 0, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserImport", "UserImportName", "UserSend", "Note", "PositionGps", "PositionText", "FromDevice", "InsurantTime", "TimeTicketCreate", "Reason", "ReasonName", "StoreCodeSend", "CreatedBy");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object GridDataOfUser([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GridDataOfBranch([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GridDataOfAdmin([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 10);
        }

        [NonAction]
        public IQueryable<MaterialStoreImpModel> FuncJTable(int userType, string Title, string CusCode, string StoreCode,
            string UserImport, string FromDate, string ToDate, string ReasonName, string SupCode = "")
        {
            var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProductImportHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                             //join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals c.ObjectCode
                             //into c1
                             //from c in c1.DefaultIfEmpty()
                             //join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals f.Code
                             //into f1
                             //from f in f1.DefaultIfEmpty()
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true) on a.StoreCode equals c.WHS_Code into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.Users.Where(x => x.Active) on a.UserImport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON") on a.Reason equals e.CodeSet into e1
                         from e in e1.DefaultIfEmpty()
                             //field khách hàng trong phiếu nhập chính là nhà cung cấp (hiện tại chưa sửa)
                         join b in _context.Suppliers.Where(x => x.IsDeleted != true) on a.SupCode equals b.SupCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(Title) || (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                         && (string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
                         && (string.IsNullOrEmpty(SupCode) || (a.SupCode == SupCode))
                         && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                         && (string.IsNullOrEmpty(UserImport) || (a.UserImport == UserImport))
                         && (string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate >= fromDate))
                         && (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate <= toDate))
                         && (string.IsNullOrEmpty(ReasonName) || (a.Reason == ReasonName))
                             //Điều kiện phân quyền dữ liệu
                             && (userType == 10
                                    || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                    || (userType == 0 && session.UserName == a.CreatedBy)
                                )
                         select new MaterialStoreImpModel
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             CusCode = a.SupCode,
                             CusName = b2 != null ? b2.SupName : "",
                             StoreCode = a.StoreCode,
                             StoreName = c != null ? c.WHS_Name : "",
                             Title = a.Title,
                             UserImport = a.UserImport,
                             UserImportName = d.GivenName,
                             UserSend = a.UserSend,
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
                             StoreCodeSend = a.StoreCodeSend,
                             CreatedBy = a.CreatedBy,
                         });
            return query;
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTableDetail([FromBody] JTableModelMaterialStoreImpGoodsDetails jTablePara)
        {
            try
            {

                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
                var query = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                             join a1 in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals a1.TicketCode
                             join a2 in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals a2.PackCode into a21
                             from a2 in a21.DefaultIfEmpty()
                             join a3 in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                              new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = a3.IdImpProduct.Value, a3.GattrCode } into a31
                             from a3 in a31.DefaultIfEmpty()
                             join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                             join b4 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b4.Code
                             join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                             from f in f1.DefaultIfEmpty()
                             join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                             on a.Unit equals c.CodeSet into c1
                             from c in c1.DefaultIfEmpty()
                             join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                             from m2 in m1.DefaultIfEmpty()
                             join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                             from d1 in d2.DefaultIfEmpty()
                             join h in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                             on a.GattrCode equals h.GattrCode into h1
                             from h in h1.DefaultIfEmpty()
                             where
                             (string.IsNullOrEmpty(jTablePara.ProductCode) || (a.ProductCode == jTablePara.ProductCode))
                             && (string.IsNullOrEmpty(jTablePara.GroupType) || (a1.GroupType == jTablePara.GroupType))
                             && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status != null && a.Status.Contains(jTablePara.Status)))
                             && (string.IsNullOrEmpty(jTablePara.SupplierCode) || (a1.SupCode == jTablePara.SupplierCode))
                             && (string.IsNullOrEmpty(jTablePara.FromDate) || (a1.TimeTicketCreate >= fromDate))
                             && (string.IsNullOrEmpty(jTablePara.ToDate) || (a1.TimeTicketCreate <= toDate))
                             && (string.IsNullOrEmpty(jTablePara.UserImport) || (a1.UserImport == jTablePara.UserImport))
                             select new ProductImpDetail
                             {
                                 Id = a.Id,
                                 TicketCode = a.TicketCode,
                                 ProductName = b.ProductName,
                                 ProductCode = b.ProductCode,
                                 Quantity = a.Quantity,
                                 QuantityIsSet = a.QuantityIsSet,
                                 Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                                 SalePrice = a.SalePrice,
                                 CurrencyCode = a.Currency,
                                 Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                                 //QrCode = CommonUtil.GeneratorQRCode(a.ProductQrCode),
                                 ProductQRCode = a.ProductQrCode,
                                 ProductNo = a3 != null ? a3.ProductNo : /*a.ProductNo*/"",
                                 Remain = a.Quantity - a.QuantityIsSet,
                                 PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                                 PackName = a2 != null ? a2.PackName : "Chưa đóng gói",
                                 PackCode = a.PackCode,
                                 //SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                                 UnitCode = a.Unit,
                                 IsCustomized = a.IsCustomized,
                                 ProdCustomJson = a.ProdCustomJson,
                                 ImpType = a.ImpType,
                                 Status = a.Status,
                                 Serial = b.Serial,
                                 TicketName = a1.Title,
                                 Weight = a.Weight
                                 //IdProduct = e.Id
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
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "ProductName", "PackType", "SalePrice", "Quantity", "QuantityIsSet", "Unit", "Currency", "ProductStatus", "Serial", "TicketCode", "TicketName", "Weight");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<ProductImpDetail>(), jTablePara.Draw, 0, "Id", "ProductCode", "ProductName", "PackType", "SalePrice", "Quantity", "QuantityIsSet", "Unit", "Currency", "ProductStatus", "Serial", "TicketCode", "TicketName", "Weight");
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

                switch (type)
                {
                    case "ODD":
                        {
                            var impODD = _context.ProductImportHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noODD = 1;
                            if (impODD.Count > 0)
                                noODD = noODD + impODD.Count;
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("IMP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                                isExist = _context.ProductImportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
                                noODD++;
                            }
                            break;
                        }
                    case "PO":
                        {
                            var impPO = _context.ProductImportHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                            var noPO = 1;
                            if (impPO.Count > 0)
                                noPO = noPO + impPO.Count;
                            var isExist = true;
                            while (isExist)
                            {
                                ticketCode = string.Format("IMP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
                                isExist = _context.ProductImportHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode));
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
        public JsonResult GetCountImport()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var countHeader = (from a in _context.ProductImportHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                                   join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true) on a.StoreCode equals c.WHS_Code into c1
                                   from c in c1.DefaultIfEmpty()
                                   join d in _context.Users.Where(x => x.Active) on a.UserImport equals d.UserName
                                   join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON") on a.Reason equals e.CodeSet into e1
                                   from e in e1.DefaultIfEmpty()
                                   join b in _context.Suppliers.Where(x => x.IsDeleted != true) on a.SupCode equals b.SupCode into b1
                                   from b2 in b1.DefaultIfEmpty()
                                   select a).Count();
                var countDetail = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted)
                                   join a1 in _context.ProductImportHeaders.Where(x => !x.IsDeleted) on a.TicketCode equals a1.TicketCode
                                   join a2 in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals a2.PackCode into a21
                                   from a2 in a21.DefaultIfEmpty()
                                   join a3 in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                                    new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = a3.IdImpProduct.Value, a3.GattrCode } into a31
                                   from a3 in a31.DefaultIfEmpty()
                                   join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                   join b4 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b4.Code
                                   join f in _context.EDMSWareHouses.Where(x => !x.WHS_Flag) on a.StoreCode equals f.WHS_Code into f1
                                   from f in f1.DefaultIfEmpty()
                                   join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                                   on a.Unit equals c.CodeSet into c1
                                   from c in c1.DefaultIfEmpty()
                                   join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                                   from m2 in m1.DefaultIfEmpty()
                                   join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                                   from d1 in d2.DefaultIfEmpty()
                                   join h in _context.ProductGattrExts.Where(x => !x.IsDeleted)
                                   on a.GattrCode equals h.GattrCode into h1
                                   from h in h1.DefaultIfEmpty()
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

        [AllowAnonymous]
        [HttpPost]
        public JsonResult CountCoil()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var no = 1;
                var listCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted).ToList();
                if (listCoil.Count > 0)
                    no = no + listCoil.Count;

                mess.Object = no;
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
        public JsonResult GetItem([FromBody] int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", id);

                var item = _context.ProductImportHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
                    x.SupCode,
                    x.CusCode,
                    x.Reason,
                    x.StoreCodeSend,
                    x.UserImport,
                    x.Note,
                    x.UserSend,
                    x.Status,
                    x.WorkflowCat,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                    x.GroupType,
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProductImportDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "SUB_PRODUCT")
                                   join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductQrCode
                                   join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                   from d2 in d1.DefaultIfEmpty()
                                   join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                   from a in a2.DefaultIfEmpty()
                                   orderby b1.ProductCode
                                   select new
                                   {
                                       ProductCode = g.ProductCode,
                                       ProductName = b1.AttributeName,
                                       ProductType = "SUB_PRODUCT",
                                       ProductQrCode = g.ProductQrCode,
                                       sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                       Unit = b1.Unit,
                                       UnitName = c1.ValueSet,
                                       //QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                       QuantityOrder = g.Quantity - g.QuantityIsSet,
                                       Quantity = g.Quantity,
                                       QuantityPoCount = a != null ? int.Parse(a.Quantity, 0) : 0,//Lấy ra số lượng từ P0
                                       //QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                       QuantityNeedSet = a != null ? a.QuantityNeedImport : 0,
                                       QuantityIsSet = g.QuantityIsSet,
                                       SalePrice = g.SalePrice,
                                       ProductLot = g.ProductLot,
                                       ProductCoil = g.ProductCoil,
                                       PackType = g.PackType,
                                       ImpType = d2.ValueSet,
                                       ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                       {
                                           k.Id,
                                           k.ProductQrCode,
                                           ProductName = b1.AttributeName,
                                           ProductCoil = k.CoilCode,
                                           ProductCoilRelative = k.CoilRelative,
                                           k.Remain,
                                           k.Size,
                                           k.TicketCode,
                                           k.PackType,
                                           k.PositionInStore,
                                           k.RackCode,
                                           k.RackPosition,
                                           k.CreatedBy,
                                           k.CreatedTime,
                                           k.UpdatedBy,
                                           k.UpdatedTime,
                                           k.UnitCoil,
                                           k.ProductImpType,
                                           k.ProductLot,
                                           IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                       })
                                   })
                                   .Concat(from g in _context.ProductImportDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "FINISHED_PRODUCT")
                                           join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductCode
                                           join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                           from d2 in d1.DefaultIfEmpty()
                                           join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                           from a in a2.DefaultIfEmpty()
                                           orderby b1.ProductCode
                                           select new
                                           {
                                               ProductCode = g.ProductCode,
                                               ProductName = b1.ProductName,
                                               ProductType = "FINISHED_PRODUCT",
                                               ProductQrCode = g.ProductQrCode,
                                               sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                               Unit = b1.Unit,
                                               UnitName = c1.ValueSet,
                                               //QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                               QuantityOrder = g.Quantity - g.QuantityIsSet,
                                               Quantity = g.Quantity,
                                               QuantityPoCount = a != null ? int.Parse(a.Quantity, 0) : 0,//Lấy ra số lượng từ P0
                                               //QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                               QuantityNeedSet = a != null ? a.QuantityNeedImport : 0,
                                               QuantityIsSet = g.QuantityIsSet,
                                               SalePrice = g.SalePrice,
                                               ProductLot = g.ProductLot,
                                               ProductCoil = g.ProductCoil,
                                               PackType = g.PackType,
                                               ImpType = d2.ValueSet,
                                               ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                               {
                                                   k.Id,
                                                   k.ProductQrCode,
                                                   ProductName = b1.ProductName,
                                                   ProductCoil = k.CoilCode,
                                                   ProductCoilRelative = k.CoilRelative,
                                                   k.Remain,
                                                   k.Size,
                                                   k.TicketCode,
                                                   k.PackType,
                                                   k.PositionInStore,
                                                   k.RackCode,
                                                   k.RackPosition,
                                                   k.CreatedBy,
                                                   k.CreatedTime,
                                                   k.UpdatedBy,
                                                   k.UpdatedTime,
                                                   k.UnitCoil,
                                                   k.ProductImpType,
                                                   k.ProductLot,
                                                   IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                               })
                                           });
                foreach (var product in ListProduct)
                {
                    product.ListCoil.OrderBy(x => x.CreatedTime).ThenBy(p => p.IsOrder);
                }
                mess.Object = new { Header = item, ListProduct };
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
        public async Task<JsonResult> Insert([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangePoSup = false;
                var poOldTime = DateTime.Now;
                var chk = await _context.ProductImportHeaders.AnyAsync(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProductImportHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
                        SupCode = obj.SupCode,
                        CusCode = obj.CusCode,
                        Reason = obj.Reason,
                        StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "",
                        UserImport = obj.UserImport,
                        Note = obj.Note,
                        UserSend = obj.UserSend,
                        InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Status = "",
                        WorkflowCat = obj.WorkflowCat,
                        SrcData = obj.SrcData,
                        GroupType = obj.GroupType,
                        DeletionToken = "NA"
                    };
                    _context.ProductImportHeaders.Add(objNew);
                    await _context.SaveChangesAsync();
                    msg.Title = _stringLocalizer["MIS_MSG_ADD_MATERIAL_EXP_STORE_HOURE"];
                    var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail
                        };

                        var listLogData = new List<object>();
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.ProductImportHeaders.Update(header);
                        await _context.SaveChangesAsync();
                    }

                    msg.ID = header.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MIS_MSG_MATERIAL_IMPORT_WARE_HOURE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var prod = _context.ProductImportHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            return Json(prod);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult Update([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;
                var objUpdate = _context.ProductImportHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    var lstStatus = new List<JsonStatus>();

                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                                    join b in _context.ProductExportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                    select a.Id).Any();

                    //Check xem sản phẩm đã được xếp kho thì không cho sửa kho nhập
                    var chkOrdering = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                                       join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.Id equals b.IdImpProduct
                                       select a.Id).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE_EXPORT"];
                    }
                    else if (chkOrdering && !objUpdate.StoreCode.Equals(obj.StoreCode))
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIST_SORT_PRODUCT_CANNOT_EDIT"];
                    }
                    else
                    {
                        var oldTimeTicketCreate = objUpdate.TimeTicketCreate;

                        //Update bảng header
                        objUpdate.LotProductCode = obj.LotProductCode;
                        objUpdate.TicketCode = obj.TicketCode;
                        objUpdate.Title = obj.Title;
                        objUpdate.StoreCode = obj.StoreCode;
                        objUpdate.SupCode = obj.SupCode;
                        objUpdate.CusCode = obj.CusCode;
                        objUpdate.Reason = obj.Reason;
                        objUpdate.StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "";
                        objUpdate.UserImport = obj.UserImport;
                        objUpdate.Note = obj.Note;
                        objUpdate.UserSend = obj.UserSend;
                        objUpdate.SrcData = obj.SrcData;
                        objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        objUpdate.GroupType = obj.GroupType;
                        objUpdate.UpdatedBy = ESEIM.AppContext.UserName;
                        objUpdate.UpdatedTime = DateTime.Now;
                        msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
                        var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                        var detail = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail
                            };

                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductImportHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProductImportHeaders.Update(header);

                            }
                        }

                        //Work flow update status
                        var session = HttpContext.GetSessionUser();
                        if (!string.IsNullOrEmpty(objUpdate.Status))
                        {
                            lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                        }
                        objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);
                        _context.ProductImportHeaders.Update(objUpdate);
                        _context.SaveChanges();
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MIS_MSG_CODE_EXITS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MIS_MSG_ERRO_EDIT_IMPORT_WARE_HOURE"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult Delete([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProductImportHeaders.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["MIS_TITLE_INFORMATION_SHIPMENT"]);
                }
                else
                {
                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                                    join b in _context.ProductExportDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                    select a.Id).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_DELTE_IMPORT_WARE_HOURE"];
                        return Json(msg);
                    }

                    //Check xem sản phẩm đã được xếp kho chưa
                    var chkMapping = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                                      join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.Quantity > 0) on a.Id equals b.IdImpProduct
                                      //join c in _context.MapStockProdIns on b.Id equals c.MapId
                                      select a.Id).Any();
                    if (chkMapping)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_NOT_DELETE"];
                        return Json(msg);
                    }
                    //xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.DeletionToken = Guid.NewGuid().ToString();
                    _context.ProductImportHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    listDetail.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = ESEIM.AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                        x.DeletionToken = Guid.NewGuid().ToString();

                        //xóa tồn kho 
                        var listDetailStock = _context.ProductInStocks.Include(y => y.Product).ThenInclude(y => y.Group)
                        .Where(y => !y.IsDeleted && y.IdImpProduct == x.Id).ToList();
                        listDetailStock.Where(y => y.Product != null && y.Product.Group != null && y.Product.Group.GroupType != "STATIC_TANK")
                        .ToList().ForEach(y =>
                        {
                            y.IsDeleted = true;
                            y.DeletedBy = ESEIM.AppContext.UserName;
                            y.DeletedTime = DateTime.Now;
                            y.DeletionToken = Guid.NewGuid().ToString();
                        });
                        _context.ProductInStocks.UpdateRange(listDetailStock);
                    });
                    _context.ProductImportDetails.UpdateRange(listDetail);

                    //Xóa attr value của phiếu
                    var lstAttrValue = _context.ProdReceivedAttrValues.Where(x => x.TicketImpCode.Equals(data.TicketCode) && !x.IsDeleted).ToList();
                    if (lstAttrValue.Any())
                    {
                        lstAttrValue.ForEach(x =>
                        {
                            x.IsDeleted = true;
                            x.DeletedBy = ESEIM.AppContext.UserName;
                            x.DeletedTime = DateTime.Now;
                        });
                        _context.ProdReceivedAttrValues.UpdateRange(lstAttrValue);
                        var lstStockAttrValue = _context.ProdInStockAttrValues.Where(x => x.TicketImpCode.Equals(data.TicketCode) && !x.IsDeleted).ToList();
                        lstStockAttrValue.ForEach(x =>
                        {
                            x.IsDeleted = true;
                            x.DeletedBy = ESEIM.AppContext.UserName;
                            x.DeletedTime = DateTime.Now;
                        });
                        _context.ProdInStockAttrValues.UpdateRange(lstStockAttrValue);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode));
                    var detail = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail
                        };

                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductImportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProductImportHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MIS_MSG_DELETE_ERRO_FAIL"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetListCoilByProdQrCode(string ticketCode, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProductImportHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
                    x.SupCode,
                    x.Reason,
                    x.StoreCodeSend,
                    x.UserImport,
                    x.Note,
                    x.UserSend,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProductImportDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "SUB_PRODUCT" && y.ProductQrCode == productQrCode)
                                   join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductQrCode
                                   join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                   from d2 in d1.DefaultIfEmpty()
                                   join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                   from a in a2.DefaultIfEmpty()
                                   orderby b1.ProductCode
                                   select new
                                   {
                                       ProductCode = g.ProductCode,
                                       ProductName = b1.AttributeName,
                                       ProductType = "SUB_PRODUCT",
                                       ProductQrCode = g.ProductQrCode,
                                       sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                       Unit = b1.Unit,
                                       UnitName = c1.ValueSet,
                                       QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                       Quantity = g.Quantity,
                                       QuantityPoCount = int.Parse(a.Quantity, 0),//Lấy ra số lượng từ P0
                                       QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                       QuantityIsSet = g.QuantityIsSet,
                                       SalePrice = g.SalePrice,
                                       ProductLot = g.ProductLot,
                                       ProductCoil = g.ProductCoil,
                                       PackType = g.PackType,
                                       ImpType = d2.ValueSet,
                                       ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                       {
                                           k.Id,
                                           k.ProductQrCode,
                                           ProductName = b1.AttributeName,
                                           ProductCoil = k.CoilCode,
                                           ProductCoilRelative = k.CoilRelative,
                                           k.Remain,
                                           k.Size,
                                           k.TicketCode,
                                           k.PackType,
                                           k.PositionInStore,
                                           k.RackCode,
                                           k.RackPosition,
                                           k.CreatedBy,
                                           k.CreatedTime,
                                           k.UpdatedBy,
                                           k.UpdatedTime,
                                           k.UnitCoil,
                                           k.ProductImpType,
                                           k.ProductLot,
                                           IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                       })
                                   })
                                   .Concat(from g in _context.ProductImportDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "FINISHED_PRODUCT" && y.ProductQrCode == productQrCode)
                                           join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductCode
                                           join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                           from d2 in d1.DefaultIfEmpty()
                                           join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                           from a in a2.DefaultIfEmpty()
                                           orderby b1.ProductCode
                                           select new
                                           {
                                               ProductCode = g.ProductCode,
                                               ProductName = b1.ProductName,
                                               ProductType = "FINISHED_PRODUCT",
                                               ProductQrCode = g.ProductQrCode,
                                               sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                               Unit = b1.Unit,
                                               UnitName = c1.ValueSet,
                                               QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                               Quantity = g.Quantity,
                                               QuantityPoCount = int.Parse(a.Quantity, 0),//Lấy ra số lượng từ P0
                                               QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                               QuantityIsSet = g.QuantityIsSet,
                                               SalePrice = g.SalePrice,
                                               ProductLot = g.ProductLot,
                                               ProductCoil = g.ProductCoil,
                                               PackType = g.PackType,
                                               ImpType = d2.ValueSet,
                                               ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                               {
                                                   k.Id,
                                                   k.ProductQrCode,
                                                   ProductName = b1.ProductName,
                                                   ProductCoil = k.CoilCode,
                                                   ProductCoilRelative = k.CoilRelative,
                                                   k.Remain,
                                                   k.Size,
                                                   k.TicketCode,
                                                   k.PackType,
                                                   k.PositionInStore,
                                                   k.RackCode,
                                                   k.RackPosition,
                                                   k.CreatedBy,
                                                   k.CreatedTime,
                                                   k.UpdatedBy,
                                                   k.UpdatedTime,
                                                   k.UnitCoil,
                                                   k.ProductImpType,
                                                   k.ProductLot,
                                                   IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                               })
                                           });
                var ListCoil = ListProduct.FirstOrDefault() != null ? ListProduct.FirstOrDefault().ListCoil.OrderBy(x => x.CreatedTime).ThenBy(p => p.RackCode) : null;
                mess.Object = new { Header = item, ListCoil };
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
        public JsonResult GetUpdateLog(string ticketCode)
        {
            var msg = new JMessage();
            var data = _context.ProductImportHeaders.FirstOrDefault(x => x.TicketCode == ticketCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }
        #endregion

        #region Detail
        private static readonly log4net.ILog logProduct = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> InsertDetail([FromBody] ProductImportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Check product is exist in Receive with conditions: ticket, product, unit, packing
                //var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(obj.TicketCode));

                var testMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                //var checkMapping = testMapping?.ListProdStrNo.Include(obj.ParentProductNumber.Value) ?? false;
                //if (checkMapping == false && obj.ImpType == "RETURN")
                //{
                //    msg.Error = true;
                //    msg.Title = "Thứ tự không tồn tại trong dãy!";
                //    return msg;
                //}

                //var listProductNo = Enumerable.Range(1, decimal.ToInt32(obj.Quantity)).ToList();

                if (obj.ImpType == "CUSTOM")
                {
                    var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == obj.GattrFlatCode);
                    if (groupAttribute == null)
                    {
                        var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                        var newGroupAttribute = new ProductGattrExt
                        {
                            //GattrCode = maxGroupId.ToString(),
                            GattrFlatCode = obj.GattrFlatCode,
                            GattrJson = obj.ProdCustomJson,
                            IsDeleted = false,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            Type = "IMPORT_CUSTOM",
                            IdSource = _context.ProductImportDetails.Where(x => !x.IsDeleted).ToList().Count
                        };
                        _context.ProductGattrExts.Add(newGroupAttribute);
                        await _context.SaveChangesAsync();
                        maxGroupId = newGroupAttribute.Id;
                        newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                        obj.GattrCode = newGroupAttribute.GattrCode;
                        _context.ProductGattrExts.Update(newGroupAttribute);
                        logProduct.Info(newGroupAttribute.Id);
                    }
                    else
                    {
                        obj.GattrCode = groupAttribute.GattrCode;
                    }
                    await _context.SaveChangesAsync();
                }
                if (obj.IsMultiple == true)
                {
                    var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
                    var startCode = obj.ProductCode.TrimEnd(digits);
                    var listProduct = _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                        .Select(delegate (MaterialProduct product)
                        {
                            var number = GetNumberInEndOfString(product.ProductCode);
                            return new
                            {
                                ProductCode = product.ProductCode,
                                Number = !string.IsNullOrEmpty(number) ? int.Parse(number) : -1,
                                Weight = product.Weight
                            };
                        })
                        .ToList();
                    var stringStart = GetNumberInEndOfString(obj.ProductCode);
                    var numberStart = !string.IsNullOrEmpty(stringStart) ? int.Parse(stringStart) : -1;
                    var listProductFilter = listProduct.Where(x => x.Number >= numberStart && x.Number < (numberStart + obj.Quantity))
                        .ToList();
                    var remainWeight = obj.Weight ?? 0;
                    if (listProductFilter.Count < obj.Quantity)
                    {
                        msg.Title = "Không đủ danh mục sản phẩm để tự sinh";
                        msg.Error = true;
                        return msg;
                    }
                    foreach (var item in listProductFilter)
                    {
                        obj.ProductCode = item.ProductCode;
                        obj.Quantity = 1;
                        //obj.Weight = remainWeight >= item.Weight ? item.Weight : remainWeight;
                        //remainWeight -= (item.Weight ?? 0);
                        //obj.Weight = item.Weight;
                        msg = await InsertDetailSingle(obj);
                        if (msg.Error)
                        {
                            return msg;
                        }
                    }
                }
                else
                {
                    msg = await InsertDetailSingle(obj);
                    if (msg.Error)
                    {
                        return msg;
                    }
                }

                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
                Console.WriteLine(ex.Message);
                logProduct.Info(ex.Message);
                await CleanGattr();
            }
            return msg;
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

        private async Task<JMessage> InsertDetailSingle(ProductImportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            var maxId = _context.ProductImportDetails.AsNoTracking().MaxBy(x => x.Id) != null ?
                _context.ProductImportDetails.AsNoTracking().MaxBy(x => x.Id).Id : 1;
            var returnId = -1;
            var check = _context.ProductImportDetails.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
            && x.ProductCode.Equals(obj.ProductCode));
            var materialProduct = _context.MaterialProducts.Include(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.ProductCode == obj.ProductCode);

            var productQrCode = "";
            var listProdStrNo = new List<ProdStrNo>();
            if (!string.IsNullOrEmpty(obj.ProductNo))
            {
                listProdStrNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNo);
            }
            else if (obj.Quantity > 0)
            {
                listProdStrNo = new List<ProdStrNo>() { new ProdStrNo(1, decimal.ToInt32(obj.Quantity)) };
            }
            var packCode = "";
            var checkSumWeight = _context.ProductInStocks.AsNoTracking().Where(x => !x.IsDeleted
            && x.ProductCode.Equals(obj.ProductCode)).Sum(x => x.Weight);
            var sumWeight = checkSumWeight + obj.Weight;
            if (sumWeight > materialProduct.Weight && (materialProduct?.Group?.GroupType == "STATIC_TANK"
                || materialProduct?.Group?.GroupType == "BOTTLE"))
            {
                msg.Title = "Khối lượng nhập vượt quá dung tích bồn chứa, bình";
                msg.Error = true;
                return msg;
            }
            if (materialProduct?.Group?.GroupType == "BOTTLE")
            {
                var checkBottle = _context.ProductInStocks.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(obj.ProductCode));
                if (checkBottle != null)
                {
                    msg.Title = "Vỏ đã được nhập trước đó";
                    msg.Error = true;
                    return msg;
                }
            }
            if (check == null || materialProduct?.Group?.GroupType != "STATIC_TANK")
            {
                var receiveDetail = new ProductImportDetail
                {
                    TicketCode = obj.TicketCode,
                    ProductCode = obj.ProductCode,
                    ProductQrCode = productQrCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    ProductType = obj.ProductType,
                    Quantity = obj.Quantity,
                    Unit = obj.Unit,
                    SalePrice = obj.SalePrice,
                    Currency = obj.Currency,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    QuantityIsSet = 0,
                    PackType = obj.PackType,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    ImpType = obj.ImpType,
                    PackCode = obj.PackCode ?? $"PACK_{obj.ProductCode + "_" + maxId}",
                    PackLot = obj.PackLot,
                    GattrCode = obj.GattrCode,
                    Status = obj.Status,
                    Weight = obj.Weight,
                    IsDeleted = false,
                    DeletionToken = "NA"
                };

                //var listPack = new List<WarehouseRecordsPack>();

                //for (int i = 1; i <= obj.Quantity; i++)
                //{
                //    packCode = receiveDetail.PackCode;

                //    if (obj.Quantity > 1)
                //        packCode = $"{receiveDetail.PackCode}_{i}";

                //    var pack = new WarehouseRecordsPack
                //    {
                //        PackCode = packCode,
                //        QrCode = packCode,
                //        PackName = packCode,
                //        PackLevel = "0",
                //        PackHierarchyPath = packCode,
                //        PackType = "PACK_TYPE_BOX",
                //        PackQuantity = 1,
                //        CreatedBy = User.Identity.Name,
                //        CreatedTime = DateTime.Now,
                //        ImportHeaderCode = obj.TicketCode,
                //        //PackParent = GetParent(obj.ProductCode, obj.PackType, obj.TicketCode)
                //    };

                //    listPack.Add(pack);
                //}

                //foreach (var item in listPack)
                //{
                //    var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                //    if (!exitPack)
                //        _context.WarehouseRecordsPacks.Add(item);
                //}

                //receiveDetail.PackCode = listPack.FirstOrDefault()?.PackCode;
                _context.ProductImportDetails.Add(receiveDetail);
                await _context.SaveChangesAsync();
                maxId = receiveDetail.Id;
                returnId = receiveDetail.Id;
                receiveDetail.ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId;
                productQrCode = receiveDetail.ProductQrCode;
                if (materialProduct?.Group?.GroupType == "STATIC_TANK")
                {
                    receiveDetail.QuantityIsSet = obj.Quantity;
                }
                _context.ProductImportDetails.Update(receiveDetail);
            }
            else if (materialProduct?.Group?.GroupType == "STATIC_TANK")
            {
                check.Quantity += obj.Quantity;
                check.SalePrice = (check.SalePrice ?? 0) + (obj.SalePrice ?? 0);
                check.QuantityIsSet = check.Quantity;
                check.Status = obj.Status;
                check.Weight += obj.Weight;
                _context.ProductImportDetails.Update(check);
                returnId = check.Id;
            }
            var listProdNo = new List<ProdStrNo> { new ProdStrNo(1) };
            var tankInStock = _context.ProductInStocks.Include(x => x.Product).ThenInclude(x => x.Group).FirstOrDefault(x => !x.IsDeleted
            && x.ProductCode == obj.ProductCode && x.Product != null && x.Product.Group != null
            && x.Product.Group.GroupType == "STATIC_TANK");
            if (tankInStock != null)
            {
                tankInStock.Quantity += obj.Quantity;
                tankInStock.Weight += obj.Weight;
                //tankInStock.IdImpProduct = maxId;
                tankInStock.ParentId = obj.ParentId;
                tankInStock.ListProdStrNo = listProdNo;
                _context.ProductInStocks.Update(tankInStock);
            }
            else
            {
                var storeInventoryObj = new ProductInStock
                {
                    IdImpProduct = maxId,
                    LotProductCode = obj.LotProductCode,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdStrNo,
                    StoreCode = obj.StoreCode,
                    IsCustomized = obj.IsCustomized,
                    ProductCode = obj.ProductCode,
                    ProductType = obj.ProductType,
                    ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId,
                    Quantity = obj.Quantity,
                    Weight = obj.Weight,
                    Unit = obj.Unit,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    //MarkWholeProduct = mark.Any() ? true : false,
                    PackCode = packCode,
                    GattrCode = obj.GattrCode,
                    DeletionToken = "NA"
                };
                if (materialProduct?.Group?.GroupType == "STATIC_TANK")
                {
                    storeInventoryObj.ListProdStrNo = listProdNo;
                }
                _context.ProductInStocks.Add(storeInventoryObj);
            }

            var tankMapping = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group).FirstOrDefault(x => !x.IsDeleted
            && x.ProductCode == obj.ProductCode && x.Product != null && x.Product.Group != null
            && x.Product.Group.GroupType == "STATIC_TANK");
            if (tankMapping != null && tankInStock != null)
            {
                tankMapping.Quantity = tankInStock.Quantity;
                tankMapping.Weight = tankInStock.Weight;
                tankMapping.ListProdStrNo = listProdNo;
                _context.ProductLocatedMappings.Update(tankMapping);
            }
            else if (materialProduct?.Group?.GroupType == "STATIC_TANK")
            {
                var mapping = new ProductLocatedMapping
                {
                    IdImpProduct = maxId,
                    //ListProductNo = listProductNo,
                    ListProdStrNo = listProdNo,
                    //WHS_Code = data.WHS_Code,
                    WHS_Code = obj.StoreCode,
                    //FloorCode = data.FloorCode,
                    //LineCode = data.LineCode,
                    //RackCode = data.RackCode,
                    //RackPosition = data.RackPosition,
                    MappingCode = "",
                    ProductQrCode = obj.ProductCode + "_" + obj.TicketCode + "_" + maxId,
                    ProductCode = obj.ProductCode,
                    Quantity = obj.Quantity,
                    Weight = obj.Weight,
                    Unit = obj.Unit,
                    //Ordering = data.Ordering,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    TicketImpCode = obj.TicketCode,
                    GattrCode = obj.GattrCode,
                    IsDeleted = false,
                    DeletionToken = "NA"
                };
                _context.ProductLocatedMappings.Add(mapping);
            }
            var header = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
            var mpStatus = new MpStatus()
            {
                ActStatus = "IMPORT",
                ActTime = DateTime.Now,
                ActBy = User.Identity.Name,
                ProductNo = listProdStrNo.ToFlatString(),
                //MappingCode = tankMapping?.MappingCode,
                SupCode = header?.SupCode,
                CusCode = header?.CusCode,
            };
            materialProduct.MpStatuses = materialProduct.MpStatuses != null ? materialProduct.MpStatuses : new List<MpStatus>();
            materialProduct.MpStatuses.Add(mpStatus);

            await _context.SaveChangesAsync();
            msg.ID = returnId;
            return msg;
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateDetail([FromBody] ProductImportDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var detail = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ProductCode.Equals(obj.ProductCode) && x.Unit.Equals(obj.Unit) && x.PackType.Equals(obj.PackType));

                var maxId = _context.ProductImportDetails.MaxBy(x => x.Id) != null ? _context.ProductImportDetails.MaxBy(x => x.Id).Id : 1;
                if (detail != null)
                {
                    detail.Unit = obj.Unit;
                    detail.Quantity = obj.Quantity;
                    detail.SalePrice = obj.SalePrice;
                    detail.Currency = obj.Currency;
                    detail.PackCode = obj.PackCode;
                    _context.ProductImportDetails.Update(detail);

                    var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(obj.ProductQrCode));
                    if (storeInventory != null)
                    {
                        storeInventory.PackCode = obj.PackCode;
                        _context.ProductInStocks.Update(storeInventory);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //[AllowAnonymous]
        //[HttpGet]
        //public JsonResult GetPackageObjects()
        //{

        //}

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertDetailByLot([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Remove old product
                var oldProd = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && !string.IsNullOrEmpty(x.LotProductCode));
                foreach (var item in oldProd)
                {
                    var prodInStock = _context.ProductInStocks.FirstOrDefault(x => x.ProductQrCode.Equals(item.ProductQrCode) && !x.IsDeleted);
                    prodInStock.Quantity = prodInStock.Quantity - item.Quantity;
                    _context.ProductInStocks.Update(prodInStock);

                    var mapping = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode)
                    && x.TicketImpCode.Equals(item.TicketCode));
                    if (mapping.Any())
                    {
                        foreach (var map in mapping)
                        {
                            map.IsDeleted = true;
                            map.DeletionToken = Guid.NewGuid().ToString();
                            var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == map.Id);
                            if (stockArrangePut != null)
                                _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }
                }
                _context.ProductImportDetails.RemoveRange(oldProd);

                if (obj.ListProduct.Any())
                {
                    var maxId = _context.ProductImportDetails.MaxBy(x => x.Id) != null ? _context.ProductImportDetails.MaxBy(x => x.Id).Id : 1;
                    foreach (var item in obj.ListProduct)
                    {
                        var receiveDetail = new ProductImportDetail
                        {
                            TicketCode = obj.TicketCode,
                            LotProductCode = obj.LotProductCode,
                            ProductCode = item.ProductCode,
                            ProductQrCode = item.ProductCode + "_" + maxId,
                            Quantity = item.Quantity,
                            Unit = item.Unit,
                            SalePrice = item.SalePrice,
                            Currency = obj.Currency,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            QuantityIsSet = 0,
                            PackType = item.PackType,
                            Status = obj.Status,
                            MarkWholeProduct = true
                        };
                        _context.ProductImportDetails.Add(receiveDetail);
                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(receiveDetail.ProductQrCode));
                        if (storeInventory != null)
                        {
                            storeInventory.Quantity = storeInventory.Quantity + item.Quantity;
                            _context.ProductInStocks.Update(storeInventory);
                        }
                        else
                        {
                            var storeInventoryObj = new ProductInStock
                            {
                                LotProductCode = obj.LotProductCode,
                                StoreCode = obj.StoreCode,
                                ProdCustomJson = obj.ProdCustomJson,
                                IsCustomized = obj.IsCustomized,
                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                ProductQrCode = item.ProductCode + "_" + maxId,
                                Quantity = item.Quantity,
                                Unit = item.Unit,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                MarkWholeProduct = true,
                                DeletionToken = "NA"
                            };
                            _context.ProductInStocks.Add(storeInventoryObj);
                        }
                        maxId++;
                    }
                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }

            return Json(msg);
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

        [AllowAnonymous]
        [HttpPost]
        public List<TreeView> GetTreePackByTicket(string ticketCode)
        {
            var data = _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted && x.ImportHeaderCode.Equals(ticketCode));
            var dataOrder = GetSubTreeRecordsPack(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetSubTreeRecordsPack(List<WarehouseRecordsPack> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.PackParent) && x.IsDeleted == false).OrderBy(x => x.PackName).ToList()
                : data.Where(x => x.PackParent == catParent && x.IsDeleted == false).OrderBy(x => x.PackName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ID,
                    Code = item.PackCode,
                    Title = item.PackName,
                    ParentCode = item.PackParent,
                    Level = tab,
                    HasChild = data.Any(x => !string.IsNullOrEmpty(x.PackParent) && x.PackParent.Equals(item.PackCode))
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeRecordsPack(data, item.PackCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetProductDetail(string ticketCode)
        {
            var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            //var listTest = _context.BottleInStocks.Where(x => x.Id == 3).Include(x => x.Product).ToList();
            //var data = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode) && x.ImpType == "DEFAULT")
            //.Include(x => x.Product)
            //.Include(x => x.BottleDetails).ThenInclude(y => y.Product)
            //.Include(x => x.BottleInStocks).ThenInclude(y => y.Detail)
            //.Include(x => x.ProductInStocks).ThenInclude(y => y.Product)
            //.ToList();

            var data1 = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         //join b1 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b1.Code into b11
                         //from b1 in b11.DefaultIfEmpty()
                         join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                          new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                         from d in d1.DefaultIfEmpty()
                         join e in _context.PackageObjects on a.PackCode equals e.PackCode into e1
                         from e in e1.DefaultIfEmpty()
                             //from e in _context.ProductInStocks.Where(x => !x.IsDeleted)
                             //where a.ProductCode == e.ProductCode && b1 != null && (b1.GroupType == "STATIC_TANK" || b1.GroupType == "BOTTLE")
                             //join e in _context.ProductInStocks.Where(x => !x.IsDeleted) on
                             // a.ProductCode equals e.ProductCode into e1
                             //from e in e1.DefaultIfEmpty()
                             //join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on
                             // a.ProductCode equals f.ProductCode into f1
                             //from f in f1.DefaultIfEmpty()
                             //join e in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                         select new ProductImpDetail
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             ProductName = b.ProductName,
                             ProductCode = b.ProductCode,
                             Quantity = a.Quantity,
                             QuantityIsSet = a.QuantityIsSet,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                             SalePrice = a.SalePrice,
                             CurrencyCode = a.Currency,
                             Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                             QrCode = CommonUtil.GeneratorQRCode(a.ProductQrCode),
                             ProductQRCode = a.ProductQrCode,
                             ProductNo = d != null ? d.ProductNo : /*a.ProductNo*/"",
                             //GroupType = b1 != null ? b1.GroupType : "",
                             Remain = a.Quantity - a.QuantityIsSet,
                             PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                             PackName = e != null ? e.PackName : "Chưa đóng gói",
                             PackCode = e != null ? e.PackCode : "",
                             PackLot = a.PackLot,
                             SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                             UnitCode = a.Unit,
                             IsCustomized = a.IsCustomized,
                             ProdCustomJson = a.ProdCustomJson,
                             ImpType = a.ImpType,
                             Status = a.Status,
                             Serial = b.Serial,
                             Weight = a.Weight,
                             //BottleWeight = e != null ? e.Weight : 0
                             //IdProduct = e.Id
                         }).ToList().DistinctBy(x => x.Id).OrderByDescending(x => x.Id);
            foreach (var item in data1)
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
            //var resultData = new List<ProductImpDetail>();
            //var result = data.GroupBy(x => x.Id);
            //foreach (var item in result)
            //{
            //    var itemDetail = item.FirstOrDefault();
            //    var listAllProductNo = item.SelectMany(x => ListProdStrNoHelper.GetListProdStrNo(x.ProductNo)).ToList();
            //    itemDetail.ProductNo = listAllProductNo.ToString();
            //    resultData.Add(itemDetail);
            //}
            return Json(data1);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetProductDetailNew(string ticketCode)
        {
            var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            //var listTest = _context.BottleInStocks.Where(x => x.Id == 3).Include(x => x.Product).ToList();
            //var data = _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode) && x.ImpType == "DEFAULT")
            //.Include(x => x.Product)
            //.Include(x => x.BottleDetails).ThenInclude(y => y.Product)
            //.Include(x => x.BottleInStocks).ThenInclude(y => y.Detail)
            //.Include(x => x.ProductInStocks).ThenInclude(y => y.Product)
            //.ToList();

            var data1 = (from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                         join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join b1 in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals b1.Code into b11
                         from b1 in b11.DefaultIfEmpty()
                         join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct.HasValue) on
                          new { IdImpProduct = a.Id, a.GattrCode } equals new { IdImpProduct = d.IdImpProduct.Value, d.GattrCode } into d1
                         from d in d1.DefaultIfEmpty()
                             //from e in _context.ProductInStocks.Where(x => !x.IsDeleted)
                             //where a.ProductCode == e.ProductCode && b1 != null && (b1.GroupType == "STATIC_TANK" || b1.GroupType == "BOTTLE")
                             //join e in _context.ProductInStocks.Where(x => !x.IsDeleted) on
                             // a.ProductCode equals e.ProductCode into e1
                             //from e in e1.DefaultIfEmpty()
                             //join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on
                             // a.ProductCode equals f.ProductCode into f1
                             //from f in f1.DefaultIfEmpty()
                             //join e in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                         select new ProductImpDetail
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             ProductName = b.ProductName,
                             ProductCode = b.ProductCode,
                             Quantity = a.Quantity,
                             QuantityIsSet = a.QuantityIsSet,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                             SalePrice = a.SalePrice,
                             CurrencyCode = a.Currency,
                             Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                             QrCode = CommonUtil.GeneratorQRCode(a.ProductQrCode),
                             ProductQRCode = a.ProductQrCode,
                             ProductNo = d != null ? d.ProductNo : /*a.ProductNo*/"",
                             ProductNoImp = a.ProductNo,
                             GroupType = b1 != null ? b1.GroupType : "",
                             Remain = a.Quantity - a.QuantityIsSet,
                             PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                             PackName = c != null ? c.PackName : "Chưa đóng gói",
                             PackCode = a.PackCode,
                             SProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                             UnitCode = a.Unit,
                             IsCustomized = a.IsCustomized,
                             ProdCustomJson = a.ProdCustomJson,
                             ImpType = a.ImpType,
                             Status = a.Status,
                             Serial = b.Serial,
                             Weight = a.Weight,
                             IsSelected = false
                             //BottleWeight = e != null ? e.Weight : 0
                             //IdProduct = e.Id
                         }).ToList().DistinctBy(x => x.Id).OrderByDescending(x => x.Id);
            foreach (var item in data1)
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
                item.ListPosition = GetDetailPostion(item.Id, item.GroupType, item.ProductCode);
                item.IsTankStatic = item.GroupType == "STATIC_TANK";
                if (item.GroupType == "STATIC_TANK")
                {
                    item.ProductNoInput = "1";
                }
                //item.SumSalePrice = item.ListBottleDetails.Sum(x => x.SalePrice ?? 0);
            }
            //var resultData = new List<ProductImpDetail>();
            //var result = data.GroupBy(x => x.Id);
            //foreach (var item in result)
            //{
            //    var itemDetail = item.FirstOrDefault();
            //    var listAllProductNo = item.SelectMany(x => ListProdStrNoHelper.GetListProdStrNo(x.ProductNo)).ToList();
            //    itemDetail.ProductNo = listAllProductNo.ToString();
            //    resultData.Add(itemDetail);
            //}
            return Json(data1);
        }

        private List<DetailPosition> GetDetailPostion(int idImportProduct, string groupType, string productCode)
        {
            if (groupType == "STATIC_TANK")
            {
                return _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductCode == productCode)
                    .Select(x => new DetailPosition {
                        ProductNo = x.ProductNo,
                        PositionInStore = !string.IsNullOrEmpty(x.MappingCode) ? x.MappingCode : "Không xác định"
                        }).ToList();
            }
            return _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.IdImpProduct == idImportProduct)
                    .Select(x => new DetailPosition {
                        ProductNo = x.ProductNo,
                        PositionInStore = !string.IsNullOrEmpty(x.MappingCode) ? x.MappingCode : "Không xác định"
                    }).ToList();
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> DeleteDetail(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    var checkExport = _context.ProductExportDetails.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
                    if (checkExport.Any())
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"];
                        return msg;
                    }

                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.DeletionToken = Guid.NewGuid().ToString();
                    _context.ProductImportDetails.Update(data);

                    var checkPack = _context.ProductImportDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PackCode) && x.PackCode.Equals(data.PackCode));
                    if (checkPack.Count() == 1)
                    {
                        var pack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(data.PackCode));
                        if (pack != null)
                        {
                            pack.IsDeleted = true;
                            _context.WarehouseRecordsPacks.Update(pack);
                        }
                    }

                    //var prodInStock = _context.ProductInStocks.FirstOrDefault(x => x.ProductQrCode.Equals(data.ProductQrCode) && !x.IsDeleted);
                    //prodInStock.Quantity = prodInStock.Quantity - data.Quantity;
                    //_context.ProductInStocks.Update(prodInStock);

                    //Delete stock
                    var stocking = _context.ProductInStocks.Include(x => x.Product).ThenInclude(x => x.Group)
                        .Where(x => !x.IsDeleted && x.IdImpProduct.Equals(data.Id));
                    if (stocking.Any(x => x.Product != null && x.Product.Group != null && x.Product.Group.GroupType != "STATIC_TANK"))
                    {
                        foreach (var item in stocking)
                        {
                            item.IsDeleted = true;
                            item.DeletionToken = Guid.NewGuid().ToString();
                            //var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                            //if (stockArrangePut != null)
                            //    _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }

                    //Delete mapping
                    var mapping = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group)
                        .Where(x => !x.IsDeleted && x.IdImpProduct.Equals(data.Id));
                    if (mapping.Any(x => x.Product != null && x.Product.Group != null && x.Product.Group.GroupType != "STATIC_TANK"))
                    {
                        foreach (var item in mapping)
                        {
                            item.IsDeleted = true;
                            item.DeletionToken = Guid.NewGuid().ToString();
                            //var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                            //if (stockArrangePut != null)
                            //    _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }

                    await _context.SaveChangesAsync();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult UnitFromPack(string json)
        {
            var msg = new JMessage();
            try
            {
                var data = JsonConvert.DeserializeObject<JsonPackValue>(json);
                if (data != null)
                {
                    InsertUnitFromPack(json);
                    _context.SaveChanges();
                    var lstJson = new List<string>();
                    if (!string.IsNullOrEmpty(data.A.Key))
                    {
                        lstJson.Add(data.A.Key);
                        if (!string.IsNullOrEmpty(data.B.Key))
                            lstJson.Add(data.B.Key);
                        if (!string.IsNullOrEmpty(data.C.Key))
                            lstJson.Add(data.C.Key);
                        if (!string.IsNullOrEmpty(data.D.Key))
                            lstJson.Add(data.D.Key);
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

        [NonAction]
        public void InsertUnitFromPack(string json)
        {
            try
            {
                var data = JsonConvert.DeserializeObject<JsonPackValue>(json);
                if (data != null)
                {
                    var units = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    if (!string.IsNullOrEmpty(data.A.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.A.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.A.Key);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.B.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.B.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.B.Key);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.C.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.C.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.C.Key);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.D.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.D.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.D.Key);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        [NonAction]
        public void InsertUnit(string value)
        {
            var unit = new CommonSetting
            {
                CodeSet = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit) + DateTime.Now.ToString("yyyyMMddHHmmss"),
                ValueSet = value,
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)
            };
            _context.CommonSettings.Add(unit);
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
        [AllowAnonymous]
        [HttpPost]
        public object GetListProdStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        [AllowAnonymous]
        [HttpPost]
        public object getTicket(string product)
        {

            var data = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.ProdCode == product);
            return Json(data);

        }


        // category
        [AllowAnonymous]
        [HttpPost]
        public object GetListProductCategory(int pageNo = 1, int pageSize = 10, string content = "", string productCode = "", string group = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var productcode = !string.IsNullOrEmpty(productCode) ? productCode : "";
            var groupCode = !string.IsNullOrEmpty(group) ? group : "";
            //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group" };
            object[] val = new object[] { pageNo, pageSize, search, productcode, groupCode };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_CAT_NOT_FUEL]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(b => new
                {
                    Id = b.Id,
                    Code = b.ProductCode,
                    Name = $"{b.ProductName} - {b.ProductCode}",
                    Unit = b.Unit,
                    ProductCode = b.ProductCode,
                    ProductName = b.ProductName,
                    UnitName = b.UnitName,
                    AttributeCode = "",
                    AttributeName = "",
                    ProductType = b.TypeCode,
                    GroupCode = b.GroupCode,
                    GroupType = b.GroupType,
                    Weight = b.Weight,
                    UnitWeight = b.UnitWeight,
                    ImpType = b.ImpType
                }).ToList();
            //return query;
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetProductGroupTypes()
        {
            return ListProdStrNoHelper.GetProductGroupImpExp();
        }
        // mapping
        [AllowAnonymous]
        [HttpPost]
        public object GetListProductMapping(int pageNo = 1, int pageSize = 10, string content = "", int id = -1)
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group", "@store", "@id" };
            object[] val = new object[] { pageNo, pageSize, search, "", "", "", id };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_MAPPING]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(b => new
                {
                    IdImpProduct = b.IdImpProduct,
                    Id = b.IdMapping,
                    Code = b.ProductCode,
                    Name = $"{b.ProductName} - {b.ProductCode} [ {b.IdImpProduct} - {(b.CreatedTimeMapping.HasValue ? b.CreatedTimeMapping.Value.ToString("dd/MM/yyyy HH:mm") : "")} - {b.MappingCode} ]",
                    Unit = b.Unit,
                    ProductCode = b.ProductCode,
                    ProductNo = b.ProductNo,
                    UnitName = b.UnitName,
                    AttributeCode = "",
                    AttributeName = "",
                    ProductType = b.TypeCode,
                    ImpType = b.ImpType
                }).ToList();
            //return query;
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListComponent([FromBody] JtableAttributeModel jTablePara)
        {
            var query = from a in _context.ProductComponents
                        where a.ProductCode == jTablePara.ProductCode
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.Code,
                            Name = _context.MaterialProducts.FirstOrDefault(x => x.IsDeleted == false && a.Code == x.ProductCode).ProductName,
                            a.Quantity,
                            UnitName = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : "",
                            UnitCode = a.Unit,
                            a.CreatedTime,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking()/*.Skip(intBeginFor).Take(jTablePara.Length)*/.ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Quantity", "UnitName", "UnitCode", "CreatedTime");

            return Json(jdata);
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListAttribute([FromBody] JtableAttributeModel jTablePara)
        {
            //int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductAttrGalaxys
                        join b in _context.AttrGalaxys on a.AttrCode equals b.Code into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.ProductCode == jTablePara.ProductCode
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            AttrName = b2 != null ? b2.Name : "",
                            a.AttrValue,
                            a.CreatedTime,
                            Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                            Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                            DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                            Parent = b2 != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name : "" : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking()/*.Skip(intBeginFor).Take(jTablePara.Length)*/.ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");

            return Json(jdata);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetMappingJson(int parentMappingId)
        {
            var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == parentMappingId);
            if (parentMapping != null)
            {
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrCode == parentMapping.GattrCode);
                return groupAttribute?.GattrJson;
            }
            return null;
        }
        #endregion

        #region Order product Vatco
        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> OrderMultiProduct([FromBody] List<ProductCrudMapping> data)
        {
            var msg = new JMessage();
            foreach (var item in data)
            {
                msg = await OrderProductVatco(item);
                if (msg.Error)
                {
                    return msg;
                }
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> OrderProductVatco([FromBody] ProductCrudMapping data)
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
                else
                {
                    var prodInStock = prodDetail != null ? _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == data.IdImpProduct
                     && x.GattrCode == prodDetail.GattrCode) : null;
                    //var listAllProductNo = _context.ProductInStocks.Where(x => !x.IsDeleted
                    //&& x.Id.Equals(data.IdImpProduct)).ToList()
                    //.SelectMany(x => ListProdStrNoHelper.GetListProdStrNo(x.ProductNo)).ToList();
                    var listProdNo = new List<ProdStrNo>();
                    try
                    {
                        listProdNo = ListProdStrNoHelper.GetListProdStrNo(data.ProductNo);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                    if (listProdNo.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không hợp lệ!";
                        return msg;
                    }
                    //var testMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.ParentMappingId);
                    var checkMapping = prodInStock != null ? prodInStock.ListProdStrNo.ContainsRange(listProdNo) : false;
                    if (checkMapping == false)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự không tồn tại trong dãy!";
                        return msg;
                    }
                    var checkProdDetailIntersect = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.IdImpProduct == data.IdImpProduct)
                        .ToList().Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                    if (checkProdDetailIntersect == true)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự đã được xếp!";
                        return msg;
                    }

                    //var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == data.RackCode);
                    //var productInRackCount = getProductInRack(data.RackCode);

                    if (prodDetail != null || true)
                    {
                        var quantity = listProdNo.SumQuantity();
                        //if (((prodDetail.QuantityIsSet ?? 0) + quantity) > prodDetail.Quantity)
                        //{
                        //    msg.Error = true;
                        //    msg.Title = "Số lượng nhập không hợp lệ";
                        //    return Json(msg);
                        //}
                        //var listProductNo = Enumerable.Range(decimal.ToInt32(prodDetail.QuantityIsSet ?? 0) + 1, decimal.ToInt32(data.Quantity ?? 1)).ToList();
                        //Thêm vào bảng Product_Entity_Mapping
                        var newId = -1;
                        var checkLocated = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == data.ProductCode
                        && x.IdImpProduct == data.IdImpProduct && x.GattrCode == prodDetail.GattrCode && x.MappingCode == data.MappingCode);
                        if (checkLocated == null)
                        {
                            var mapping = new ProductLocatedMapping
                            {
                                IdImpProduct = data.IdImpProduct,
                                //ListProductNo = listProductNo,
                                ListProdStrNo = listProdNo,
                                //WHS_Code = data.WHS_Code,
                                WHS_Code = data.WHS_Code,
                                //FloorCode = data.FloorCode,
                                //LineCode = data.LineCode,
                                //RackCode = data.RackCode,
                                //RackPosition = data.RackPosition,
                                MappingCode = data.MappingCode,
                                ProductQrCode = data.ProductQrCode,
                                ProductCode = data.ProductCode,
                                Quantity = quantity,
                                Unit = data.UnitCode,
                                Ordering = data.Ordering,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                TicketImpCode = data.TicketCode,
                                GattrCode = prodDetail.GattrCode,
                                Weight = prodDetail.Weight,
                                DeletionToken = "NA"
                            };
                            _context.ProductLocatedMappings.Add(mapping);
                            await _context.SaveChangesAsync();
                            newId = mapping.Id;
                        }
                        else
                        {
                            checkLocated.ListProdStrNo.AddRange(listProdNo);
                            checkLocated.Quantity = checkLocated.ListProdStrNo.SumQuantity();
                            _context.ProductLocatedMappings.Update(checkLocated);
                            newId = checkLocated.Id;
                        }

                        var mappingLog = new ProductLocatedMappingLog
                        {
                            IdImpProduct = data.IdImpProduct,
                            IdLocMapOld = -1,
                            IdLocatedMapping = newId,
                            MappingCode = data.MappingCode,
                            MappingCodeOld = "",
                            StoreCode = data.WHS_Code,
                            GattrCode = data.GattrCode,
                            ProductCode = data.ProductCode,
                            ProductNo = data.ProductNo,
                            ProductQrCode = data.ProductQrCode,
                            Quantity = quantity,
                            Unit = data.UnitCode,
                            TicketCode = prodDetail.TicketCode,
                            Type = "ARRANGE_IMP",
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                            //MarkWholeProduct = mark.Any() ? true : false,
                            DeletionToken = "NA"
                        };

                        _context.ProductLocatedMappingLogs.Add(mappingLog);
                        var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(data.ProductCode));
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

                        //Thêm vào bảng Product_Entity_Mapping
                        //var checkInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodDetail.ProductCode
                        //    && x.IdImpProduct == data.IdImpProduct && x.GattrCode == prodDetail.GattrCode && x.StoreCode == data.WHS_Code);
                        //if (checkInStock == null)
                        //{
                        //    var newParentInStock = new ProductInStock
                        //    {
                        //        IdImpProduct = data.IdImpProduct,
                        //        LotProductCode = prodDetail.LotProductCode,
                        //        StoreCode = data.WHS_Code,
                        //        ProductCode = prodDetail.ProductCode,
                        //        ProductType = prodDetail.ProductType,
                        //        ProductQrCode = prodDetail.ProductQrCode,
                        //        Quantity = quantity,
                        //        ListProdStrNo = listProdNo,
                        //        Unit = prodDetail.Unit,
                        //        CreatedBy = User.Identity.Name,
                        //        CreatedTime = DateTime.Now,
                        //        IsDeleted = false,
                        //        //MarkWholeProduct = mark.Any() ? true : false,
                        //        PackCode = prodDetail.PackCode,
                        //        GattrCode = prodDetail.GattrCode,
                        //        DeletionToken = "NA"
                        //    };
                        //    _context.ProductInStocks.Add(newParentInStock);
                        //}
                        //else
                        //{
                        //    checkInStock.ListProdStrNo.AddRange(listProdNo);
                        //    checkInStock.Quantity = checkInStock.ListProdStrNo.SumQuantity();
                        //    _context.ProductInStocks.Update(checkInStock);
                        //}

                        //Update quantity is set in detail
                        if (prodDetail.QuantityIsSet != null) prodDetail.QuantityIsSet += quantity;
                        else prodDetail.QuantityIsSet = quantity;
                        _context.ProductImportDetails.Update(prodDetail);

                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Chi tiết phiếu nhập không tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        private async Task<JMessage> OrderProductStaticTank([FromBody] ProductCrudMapping data)
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
            return msg;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JMessage> OrderProductComponent([FromBody] ProductCrudMapping data)
        {
            var msg = new JMessage();
            try
            {
                //if (obj.ImpType == "RETURN")
                //{
                var prodDetail = _context.ProductImportDetails.AsParallel().FirstOrDefault(x => !x.IsDeleted
                && x.Id.Equals(data.IdImpProduct));
                if (prodDetail == null)
                {
                    msg.Error = true;
                    msg.Title = "Chi tiết phiếu nhập không tồn tại";
                    return msg;
                }
                if (prodDetail.QuantityIsSet == prodDetail.Quantity)
                {
                    msg.Error = true;
                    msg.Title = "Chi tiết phiếu nhập đã được xếp";
                    return msg;
                }
                var gattrCode = "";
                var groupAttribute = _context.ProductGattrExts.FirstOrDefault(x => !x.IsDeleted && x.GattrFlatCode == data.ParentFlatCode);
                if (groupAttribute == null)
                {
                    var maxGroupId = _context.ProductGattrExts.MaxBy(x => x.Id) != null ? _context.ProductGattrExts.MaxBy(x => x.Id).Id : 1;
                    var newGroupAttribute = new ProductGattrExt
                    {
                        //GattrCode = (maxGroupId + 1).ToString(),
                        GattrFlatCode = data.ParentFlatCode,
                        GattrJson = data.ParentCustomJson,
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Type = "IMPORT_RETURN",
                        IdSource = data.ParentMappingId
                    };
                    _context.ProductGattrExts.Add(newGroupAttribute);
                    await _context.SaveChangesAsync();
                    maxGroupId = newGroupAttribute.Id;
                    newGroupAttribute.GattrCode = newGroupAttribute.Id.ToString();
                    gattrCode = newGroupAttribute.GattrCode;
                    _context.ProductGattrExts.Update(newGroupAttribute);
                    logProduct.Info(newGroupAttribute.Id);
                }
                else
                {
                    gattrCode = groupAttribute.GattrCode;
                }
                var parentMapping = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == data.ParentMappingId);
                if (parentMapping != null /*&& obj.ParentProductNumber.HasValue*/ && parentMapping.ListProdStrNo.Count > 0
                    && parentMapping.ListProdStrNo.Include(data.ParentProductNumber.Value))
                {
                    //obj.ParentProductNumber = parentMapping.ListProductNo.FirstOrDefault();
                    //parentMapping.ListProductNo.Remove(obj.ParentProductNumber.Value);
                    var newId = -1;
                    if (parentMapping.ListProdStrNo.SumQuantity() > 1)
                    {
                        parentMapping.ListProdStrNo.Extract(data.ParentProductNumber.Value);
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
                                ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(data.ParentProductNumber.Value) },
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
                            checkLocated.ListProdStrNo.Add(new ProdStrNo(data.ParentProductNumber.Value));
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
                        ProductNo = data.ParentProductNumber.Value.ToString(),
                        ProductQrCode = parentMapping.ProductQrCode,
                        Quantity = 1,
                        Unit = parentMapping.Unit,
                        TicketCode = data.TicketCode,
                        Type = "IMPORT_RETURN",
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        //MarkWholeProduct = mark.Any() ? true : false,
                        DeletionToken = "NA"
                    };

                    _context.ProductLocatedMappingLogs.Add(mappingLog);
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(parentMapping.ProductCode));
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
                    var parentInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.IdImpProduct == parentMapping.IdImpProduct/* && x.GattrCode == obj.GattrCode*/
                    /*&& x.ListProductNo.ContainsRange(parentMapping.ListProductNo)*/).ToList().FirstOrDefault(x => x.ListProdStrNo.ContainsRange(parentMapping.ListProdStrNo));
                    if (parentInStock != null)
                    {
                        //parentInStock.ListProductNo.Remove(obj.ParentProductNumber.Value);
                        if (parentInStock.ListProdStrNo.SumQuantity() > 1)
                        {
                            parentInStock.ListProdStrNo.Extract(data.ParentProductNumber.Value);
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
                                //ListProductNo = new List<int> { obj.ParentProductNumber.Value },
                                ListProdStrNo = new List<ProdStrNo> { new ProdStrNo(data.ParentProductNumber.Value) },
                                Unit = parentInStock.Unit,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                                //MarkWholeProduct = mark.Any() ? true : false,
                                //PackCode = packCode,
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
                    var impParent = new ProductImpParent
                    {
                        IdImpProduct = data.IdImpProduct,
                        IdProductParent = parentMapping.Id,
                        Number = data.ParentProductNumber,
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.ProductImpParents.Add(impParent);
                    prodDetail.QuantityIsSet = prodDetail.Quantity;
                    _context.ProductImportDetails.Update(prodDetail);
                    await _context.SaveChangesAsync();
                    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thiết bị cha không tồn tại";
                }
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                logProduct.Info(ex.Message);
                await CleanGattr();
            }
            return msg;
        }

        private List<int> GetListProductNo(string value)
        {
            var listItem = string.IsNullOrEmpty(value)
                ? new List<string>()
                : value.Split(", ").ToList();
            var listProductNo = new List<int>();
            foreach (var item in listItem)
            {
                if (item.Contains(".."))
                {
                    var startNo = int.Parse(item.Split("..")[0].Trim());
                    var endNo = int.Parse(item.Split("..")[1].Trim());
                    var count = endNo - startNo - 1;
                    var listItemNo = Enumerable.Range(startNo, count).ToList();
                    listProductNo.AddRange(listItemNo);
                }
                else
                {
                    listProductNo.Add(int.Parse(item));
                }
            }
            return listProductNo;
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
        [HttpPost]
        public JsonResult DeleteOrderProduct(int id)
        {
            var msg = new JMessage();
            var data = _context.ProductLocatedMappings.Include(x => x.Product).ThenInclude(x => x.Group)
                .FirstOrDefault(x => !x.IsDeleted && x.Id == id);
            if (data != null)
            {
                if (data?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    data.MappingCode = "";
                    _context.ProductLocatedMappings.Update(data);
                }
                else
                {
                    var checkExport = from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.Id.Equals(data.IdImpProduct))
                                          //join b in _context.MapStockProdIns.Where(x => !x.IsDeleted) on a.MapId equals b.MapId
                                      select new
                                      {
                                          a.ProductQrCode,
                                          //b.MapId
                                      };
                    if (checkExport.Any())
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_PROD_EXP_CANNOT_DEL"];
                        return Json(msg);
                    }

                    //Delete
                    data.IsDeleted = true;
                    data.DeletionToken = Guid.NewGuid().ToString();
                    _context.ProductLocatedMappings.Update(data);

                    var prodDetail = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == data.IdImpProduct);
                    if (prodDetail != null)
                    {
                        prodDetail.QuantityIsSet = Convert.ToInt32(prodDetail.QuantityIsSet - data.Quantity);
                        _context.ProductImportDetails.Update(prodDetail);

                        msg.Object = prodDetail.Quantity - prodDetail.QuantityIsSet;
                    }
                    //else
                    //{
                    //    msg.Error = true;
                    //    msg.Title = "Chi tiết nhập đã bị xóa";
                    //    //msg.Title = _sharedResources["COM_VALIDATE_NOT_FOUND_DATA"];
                    //    return Json(msg);
                    //}
                }
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            return Json(msg);
        }

        #endregion

        #region Attr value product
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAttrProduct(string product)
        {
            //var data = from a in _context.ProductAttrGalaxys.Where(x => !x.IsDeleted && x.ProductCode.Equals(product))
            //           join b in _context.AttrGalaxys on a.AttrCode equals b.Code into b1
            //           from b2 in b1.DefaultIfEmpty()
            //           orderby a.Id descending
            //           select new
            //           {
            //               a.Id,
            //               a.AttrCode,
            //               AttrName = b2 != null ? b2.Name : "",
            //               Unit = b2 != null ? b2.Unit : "",
            //           };
            var packType = _context.CommonSettings.Where(x => x.Group.Equals("PACK_ATTR") && !x.IsDeleted)
                .Select(x => new
                {
                    x.SettingID,
                    AttrCode = x.CodeSet,
                    AttrName = x.ValueSet
                });

            return Json(packType);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertAttrValue([FromBody] ProdReceivedAttrValue obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.ProdReceivedAttrValues.FirstOrDefault(x => x.TicketImpCode.Equals(obj.TicketImpCode)
                && !x.IsDeleted && x.ProdCode.Equals(obj.ProdCode) && x.Code.Equals(obj.Code));
                if (check == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ProdReceivedAttrValues.Add(obj);

                    var attrValueStock = new ProdInStockAttrValue
                    {
                        TicketImpCode = obj.TicketImpCode,
                        ProdCode = obj.ProdCode,
                        Code = obj.Code,
                        Value = obj.Value,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Unit = obj.Unit
                    };
                    _context.ProdInStockAttrValues.Add(attrValueStock);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    check.Value = obj.Value;
                    check.Unit = obj.Unit;
                    _context.ProdReceivedAttrValues.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    //msg.Error = true;
                    //msg.Title = _stringLocalizer["MIS_MSG_ATTR_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAttrValue(string ticketCode, string product)
        {
            //var data = from a in _context.ProdReceivedAttrValues.Where(x => x.ProdCode.Equals(product) && x.TicketImpCode.Equals(ticketCode) && !x.IsDeleted)
            //           join b in _context.AttrGalaxys on a.Code equals b.Code
            //           join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProdCode equals c.ProductCode
            //           select new
            //           {
            //               a.ID,
            //               c.ProductName,
            //               b.Name,
            //               a.Value,
            //               Unit = !string.IsNullOrEmpty(a.Unit) ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : ""
            //           };
            var data = from a in _context.ProdReceivedAttrValues.Where(x => x.ProdCode.Equals(product) && !x.IsDeleted
                       && x.TicketImpCode.Equals(ticketCode))
                       join b in _context.CommonSettings on a.Code equals b.CodeSet
                       join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProdCode equals c.ProductCode
                       select new
                       {
                           a.ID,
                           c.ProductName,
                           Name = b.ValueSet,
                           a.Value,
                           Unit = !string.IsNullOrEmpty(a.Unit) ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : ""
                       };
            return Json(data);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteAttrValue(int id)
        {
            var msg = new JMessage();
            var data = _context.ProdReceivedAttrValues.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null)
            {
                var attrValueStock = _context.ProdInStockAttrValues.FirstOrDefault(x => x.ProdCode.Equals(data.ProdCode)
                && x.Code.Equals(data.Code) && x.TicketImpCode.Equals(data.TicketImpCode));
                attrValueStock.IsDeleted = true;
                attrValueStock.DeletedBy = ESEIM.AppContext.UserName;
                attrValueStock.DeletedTime = DateTime.Now;
                _context.ProdInStockAttrValues.Update(attrValueStock);

                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.ProdReceivedAttrValues.Update(data);

                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetItemAttrValue(int id)
        {
            var data = _context.ProdReceivedAttrValues.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            return Json(data);
        }

        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetInfoProduct(string product, string ticket, bool loadDefault, string fuelCode = "")
        {
            var attrValue = _context.ProdReceivedAttrValues.Where(x => x.ProdCode.Equals(product) && !x.IsDeleted && x.TicketImpCode.Equals(ticket));
            var data = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.Equals(product))
                        join b in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on a.GroupCode equals b.Code into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.UnitWeight equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        select new InfoProduct
                        {
                            Packing = loadDefault ? a.Packing : (attrValue.Any() ? attrValue.FirstOrDefault(x => x.Code == "PACK_ATTR") != null ? attrValue.FirstOrDefault(x => x.Code == "PACK_ATTR").Value : a.Packing : a.Packing),
                            High = a.High,
                            Wide = a.Wide,
                            Long = a.Long,
                            Weight = a.Weight,
                            UnitWeightCode = a.UnitWeight,
                            UnitWeight = c2 != null ? c2.ValueSet : "",
                            GroupType = b != null ? b.GroupType : "",
                            GroupCode = a.GroupCode
                        }).FirstOrDefault();
            var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
            var startCode = product.TrimEnd(digits);
            var listNumberString = _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                .ToList().Select(x => GetNumberInEndOfString(x.ProductCode));
            var listNumber = listNumberString.Select(delegate (string input)
            {
                if (string.IsNullOrEmpty(input))
                {
                    return -1;
                }
                else
                {
                    return int.Parse(input);
                }
            });
            var minNumber = listNumber.Min() != -1 ? listNumber.Min() : 1;
            data.MinNumber = minNumber;
            //var objUsed = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == product)
            //join b in _context.ProductImportDetails
            //.Include(x => x.Product)
            //.ThenInclude(x => x.Group)
            //.Where(x => !x.IsDeleted) on a.ParentId equals b.Id
            //select b).ToList().FirstOrDefault(x => x.Product.GroupCode != fuelCode);
            //data.IsUsed = objUsed != null;
            //data.FuelName = objUsed?.Product?.Group?.Name;
            return Json(data);
        }

        private string GetNumberInEndOfString(string input)
        {
            return string.Concat(input.ToArray().Reverse().TakeWhile(char.IsNumber).Reverse());
        }
        #endregion

        #region Get thông tin chung
        [AllowAnonymous]
        [HttpPost]
        public object GetListLotProduct()
        {
            //Giờ lấy theo lô hàng mua về để nhập kho (phiếu đặt hàng Supplier)
            var rs = (from a in _context.PoBuyerHeaderNotDones
                      orderby a.Id descending
                      select new
                      {
                          Code = a.PoSupCode,
                          Name = a.PoTitle,//Vì bỏ Title nên lấy mã Code hiển thị
                      }).ToList();
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListLotProduct4Update(string lotProductCode)
        {
            //Giờ lấy theo lô hàng mua về để nhập kho (phiếu đặt hàng Supplier)
            var rs1 = (from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.PoSupCode,
                           Name = a.PoTitle,
                       });
            var rs2 = (from a in _context.PoBuyerHeaderNotDones.Where(x => x.PoSupCode != lotProductCode)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.PoSupCode,
                           Name = a.PoTitle,
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
        //Đối với phiếu nhập kho thì khách hàng chuyển thành Nhà cung cấp (hiện vẫn giữ tên field & API theo khách hàng, chỉ thay đổi Bảng gọi ra)
        [AllowAnonymous]
        [HttpPost]
        public object GetListSupplier()
        {
            var rs = _context.Suppliers.Where(x => !x.IsDeleted).OrderBy(x => x.SupName).Select(x => new { Code = x.SupCode, Name = x.SupName });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListUserImport()
        {
            //var rs = _context.Users.Where(x => x.Active && x.UserName != "admin").OrderBy(x => x.GivenName).Select(x => new { Code = x.UserName, Name = x.GivenName });
            var data = from a in _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                           //join b in _context.AdUserInGroups.Where(x => x.IsMain) on a.Id equals b.UserId
                           //orderby a.Name
                       select a;
            return data;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListReason()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
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
        public object GetListProductRelative()
        {
            var rs = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted)
                     join b in _context.ProductImportDetails.Where(x => !x.IsDeleted) on new { a.TicketCode, a.ProductQrCode } equals new { b.TicketCode, b.ProductQrCode }
                     select new
                     {
                         Code = a.CoilCode,
                         a.CoilRelative,
                         b.ProductCode,
                         b.ProductQrCode,
                         a.TicketCode,
                         Name = a.CoilCode,
                         b.SalePrice,
                         b.Quantity,
                         b.ProductLot
                     };
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListProduct()
        {
            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted /*&& x.TypeCode == "FINISHED_PRODUCT"*/)
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b.ImpType equals d.CodeSet into d1
                      from d2 in d1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                          Id = b.Id,
                          Code = b.ProductCode,
                          Name = string.Format("{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = b.TypeCode,
                          ImpType = d2.ValueSet,
                          GroupCode = b.GroupCode
                      };

            return rs1;
        }

        public object GetListProductByStore(string storeCode)
        {


            var rs = from a in _context.ProductInStocks.Where(x => x.ProductType == "FINISHED_PRODUCT")

                     from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                         Code = b.ProductQrCode,
                         Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                      };

            return rs1.Concat(rs);
        }
        //[AllowAnonymous]
        [HttpPost]
        //public object GetListRackCode(string productQrCode)
        //{
        //    var rs = from a in _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
        //             join b in _context.EDMSRacks on a.RackCode equals b.RackCode
        //             join c in _context.EDMSLines on b.LineCode equals c.LineCode
        //             join d in _context.EDMSFloors on c.FloorCode equals d.FloorCode
        //             let name = d.FloorName + " - " + c.L_Text + " - " + b.RackName
        //             orderby name
        //             select new
        //             {
        //                 Code = a.RackCode,
        //                 Name = name,
        //                 Quantity = a.Quantity,
        //             };
        //    return rs;
        //}
        //[AllowAnonymous]
        [HttpPost]
        //public object GetSalePrice(string qrCode)
        //{
        //    var rs = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted && x.LotProductCode == qrCode)
        //              join b in _context.ProductCostHeaders.Where(x => !x.IsDeleted && x.EffectiveDate <= DateTime.Now && x.ExpiryDate >= DateTime.Now) on a.HeaderCode equals b.HeaderCode
        //              select new
        //              {
        //                  SalePrice = a.Price,
        //                  TaxRate = a.Tax,
        //                  Discount = a.Discount,
        //                  Commission = a.Commission,
        //              }).FirstOrDefault();
        //    return rs;
        //}
        [AllowAnonymous]
        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListPaymentStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_PAYMENT_STATUS").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        //Hướng mới - nhập kho từ lô sản phẩm được đặt hàng mua về (PO_Supplier)
        [AllowAnonymous]
        [HttpPost]
        public object GetLotProduct(string lotProductCode)
        {
            var today = DateTime.Now.ToString("ddMMyyyy-HHmm");

            var ListProduct = (from a1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                               join a in _context.PoBuyerDetails.Where(x => !x.IsDeleted) on a1.PoSupCode equals a.PoSupCode
                               join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                               join c1 in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.Unit equals c1.CodeSet into c2
                               from c1 in c2.DefaultIfEmpty()
                               join d in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                               from d2 in d1.DefaultIfEmpty()
                               let productQrCode = a.ProductCode + "_0_" + a.PoSupCode + "_T." + today
                               orderby b1.ProductName
                               select new
                               {
                                   ProductCode = a.ProductCode,
                                   ProductName = b1.ProductName,
                                   ProductType = "FINISHED_PRODUCT",
                                   ProductQrCode = productQrCode,
                                   sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                   Unit = b1.Unit,
                                   UnitName = (c1 != null ? c1.ValueSet : ""),
                                   QuantityOrder = 0,
                                   Quantity = int.Parse(a.Quantity),
                                   QuantityPoCount = int.Parse(a.Quantity, 0),
                                   SalePrice = a.UnitPrice != null ? a.UnitPrice : 0,
                                   //QuantityIsSet = decimal.Parse(a.Quantity) - a.QuantityNeedImport,
                                   QuantityIsSet = 0,
                                   QuantityNeedSet = a.QuantityNeedImport,
                                   QuantityNeedOrder = 0,
                                   sQuantityCoil = 0,
                                   ImpType = d2.ValueSet,
                                   ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).Select(k => new
                                   {
                                       k.Id,
                                       k.ProductQrCode,
                                       ProductCoil = k.CoilCode,
                                       ProductCoilRelative = k.CoilRelative,
                                       k.Remain,
                                       k.Size,
                                       k.TicketCode,
                                       k.PackType,
                                       k.PositionInStore,
                                       k.RackCode,
                                       k.RackPosition,
                                       k.CreatedBy,
                                       k.CreatedTime,
                                       k.UpdatedBy,
                                       k.UpdatedTime,
                                       IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                   })
                               });


            var SupCode = _context.PoBuyerHeaders.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == lotProductCode)?.SupCode;

            return new { ListProduct, SupCode = SupCode };
        }
        [AllowAnonymous]
        [HttpGet]
        public object GetListProductInStore(string rackCode)
        {
            try
            {
                var prodMapping = _context.ProductEntityMappingLogs.AsParallel().Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode)).ToList();
                var query2 = (from a in prodMapping
                              join b in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a.ProductQrCode equals b.ProductQrCode
                              join c1 in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals c1.ProductQrCode into c2
                              from c in c2.DefaultIfEmpty()
                              join d in _context.Users on a.CreatedBy equals d.UserName into d1
                              from d2 in d1.DefaultIfEmpty()
                              select new
                              {
                                  a.Id,
                                  a.WHS_Code,
                                  a.FloorCode,
                                  a.LineCode,
                                  a.Ordering,
                                  a.ProductQrCode,
                                  a.RackCode,
                                  a.RackPosition,
                                  a.Quantity,
                                  a.Unit,
                                  c.AttributeName,
                                  CreatedBy = d2.GivenName,
                                  CreatedTime = a.CreatedTime != null ? a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : null,
                              });
                var query1 = (from a in prodMapping
                              join b in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.ProductQrCode equals b.ProductQrCode
                              join c1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals c1.ProductCode into c2
                              from c in c2.DefaultIfEmpty()
                              join d in _context.Users on a.CreatedBy equals d.UserName into d1
                              from d2 in d1.DefaultIfEmpty()
                              select new
                              {
                                  a.Id,
                                  a.WHS_Code,
                                  a.FloorCode,
                                  a.LineCode,
                                  a.Ordering,
                                  a.ProductQrCode,
                                  a.RackCode,
                                  a.RackPosition,
                                  a.Quantity,
                                  a.Unit,
                                  AttributeName = c.ProductName,
                                  CreatedBy = d2.GivenName,
                                  CreatedTime = a.CreatedTime != null ? a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : null,
                              });
                var query = query1.Concat(query2);
                var data = query.OrderByDescending(x => x.Id);
                return Json(data);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public string GetQuantityEmptyInRack(string rackCode)
        {
            try
            {
                //var rs = _context.WarehouseZoneStructs.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(rackCode));
                var rs = _context.EDMSRacks.AsParallel().FirstOrDefault(x => x.RackCode.Equals(rackCode));
                if (rs != null)
                {
                    var prodMapping = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode));
                    var instock = Convert.ToInt32(prodMapping.Sum(x => x.Quantity));
                    var result = rs.CNT_Box - instock;
                    return result.ToString();
                }
                else
                {
                    return "0";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //Lấy danh sách dãy bên sản phẩm
        [AllowAnonymous]
        [HttpGet]
        public object GetListLine(string storeCode)
        {
            try
            {
                var rs = (from a in _context.EDMSFloors.Where(x => x.WHS_Code == storeCode && x.Status == "1")
                          join b in _context.EDMSLines on a.FloorCode equals b.FloorCode
                          select b).ToList();

                for (int i = 0; i < rs.Count; i++)
                {
                    var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(rs[i].LineCode)).ToList();
                    if (listRack.Count > 0)
                    {
                        foreach (var rack in listRack)
                        {
                            var checkCount = GetQuantityEmptyInRack(rack.RackCode);
                            if (checkCount.Equals("..."))
                            {
                                rs.RemoveAt(i);
                                i--;
                            }
                        }
                        var temp = new List<EDMSFile>();
                    }
                    else
                    {
                        rs.RemoveAt(i);
                        i--;
                    }
                };

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
                var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(lineCode) && x.R_Status == "1").ToList();

                for (int i = 0; i < listRack.Count; i++)
                {
                    var checkCount = GetQuantityEmptyInRack(listRack[i].RackCode);
                    if (checkCount.Equals("..."))
                    {
                        listRack.RemoveAt(i);
                    }
                }

                return Json(listRack);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object CheckProductInStore(string idImportProduct)
        {
            try
            {
                var inStore = true;
                var obj = _context.ProductInStocks.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct?.ToString() == idImportProduct);
                if (obj != null)
                    inStore = true;

                var prodDetail = _context.ProductImportDetails.Include(x => x.Product).ThenInclude(x => x.Group)
                    .FirstOrDefault(x => !x.IsDeleted && x.Id.ToString() == idImportProduct);
                if (prodDetail?.Product?.Group?.GroupType == "STATIC_TANK")
                {
                    inStore = false;
                }
                return Json(inStore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object CheckProductInStoreCoil(string productQrCode, string coilCode)
        {
            try
            {
                var inStore = false;
                var obj = _context.ProdPackageReceiveds.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode) && x.CoilCode.Equals(coilCode));
                if (obj != null)
                    inStore = true;

                return Json(inStore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object CheckProductCoilOrderingStore(string productQrCode)
        {
            try
            {
                var isOrdering = false;
                var obj = _context.ProdPackageReceiveds.AsParallel().Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode) && !string.IsNullOrEmpty(x.RackCode)).ToList();
                if (obj.Count > 0)
                    isOrdering = true;

                return Json(isOrdering);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public object CheckQuantityMaxProductInStore(string productQrCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.ProductInStocks.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                if (obj != null)
                {
                    var prodList = _context.ProductLocatedMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).ToList();
                    var quantity = prodList.Sum(x => x.Quantity);
                    var quantityMax = obj.Quantity - quantity;
                    msg.Object = quantityMax;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpGet]
        public object GetPositionProduct(string productQrCode, string productCoil)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = (from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode))
                                join b in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                                where a.ProductQrCode.Equals(productQrCode) && (string.IsNullOrEmpty(productCoil) || a.CoilCode.Equals(productCoil))
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
                                    a.UpdatedTime
                                }).OrderBy(x => x.CreatedTime).ThenBy(p => p.RackCode);

                //var prodMapping = _context.ProductLocatedMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                //if (prodMapping != null)
                //{
                //    var lineCode = prodMapping.LineCode;
                //    var rackCode = prodMapping.RackCode;
                //    var listRack = _context.EDMSRacks.Where(x => x.LineCode == prodMapping.LineCode).AsNoTracking().ToList();

                //    msg.Error = false;
                //    msg.Object = new { LineCode = lineCode, RackCode = rackCode, ListRack = listRack };
                //}

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
        [HttpGet]
        public object GetProductNotInStore(string productQrCode, string productCoil)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.RackCode))
                               where a.ProductQrCode.Equals(productQrCode) && (string.IsNullOrEmpty(productCoil) || a.CoilCode.Equals(productCoil))
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
                                   a.UpdatedTime
                               };

                //var prodMapping = _context.ProductLocatedMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                //if (prodMapping != null)
                //{
                //    var lineCode = prodMapping.LineCode;
                //    var rackCode = prodMapping.RackCode;
                //    var listRack = _context.EDMSRacks.Where(x => x.LineCode == prodMapping.LineCode).AsNoTracking().ToList();

                //    msg.Error = false;
                //    msg.Object = new { LineCode = lineCode, RackCode = rackCode, ListRack = listRack };
                //}

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
        [HttpGet]
        public object SetCoilInStore(int id, string rackCode)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var prodInfo = _context.ProdPackageReceiveds.AsParallel().FirstOrDefault(x => x.Id.Equals(id));
                if (prodInfo != null)
                {
                    prodInfo.PositionInStore = rackCode;

                    _context.ProdPackageReceiveds.Update(prodInfo);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = "Xếp thành công";
                }
                else
                {
                    msg.Title = "Không lấy được thông tin cuộn";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public object OrderingProductInStore([FromBody] ProductLocatedMapping data)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                //if (data.ListCoil.Count > 0)
                //{
                //    //var prodPackageInfo = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode)).ToList();
                //    //if (prodPackageInfo.Count>0)
                //    //{
                //    //    foreach (var item in prodPackageInfo)
                //    //    {
                //    //        item.PositionInStore = null;
                //    //        item.RackCode = null;
                //    //        item.RackPosition = null;
                //    //    }

                //    //    _context.ProdPackageReceiveds.UpdateRange(prodPackageInfo);
                //    //    _context.SaveChanges();
                //    //}

                //    var listCoilProcess = new List<ProdPackageInfoCustom>();

                //    foreach (var item in data.ListCoil)
                //    {
                //        var check = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.CoilCode) && string.IsNullOrEmpty(x.RackCode));
                //        if (check != null)
                //            listCoilProcess.Add(item);
                //    }

                //    if (listCoilProcess.Count > 0)
                //    {
                //        foreach (var productCoil in listCoilProcess)
                //        {
                //            var prodMapping = _context.ProductLocatedMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productCoil.ProductQrCode) && x.RackCode.Equals(productCoil.RackCode));
                //            var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == productCoil.RackCode);
                //            var productInRackCount = getProductInRack(productCoil.RackCode);
                //            if (rack != null)
                //            {
                //                //if (rack.CNT_Box >= (productInRackCount + productCoil.Size))
                //                //{

                //                //}
                //                //else
                //                //{
                //                //    msg.Error = true;
                //                //    msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NON_SORT_AMOUNT_PRODUCT"));
                //                //}

                //                //Cho phép xếp 1 sản phẩm xếp nhiều lần ở 1 vị trị không cộng dồn thêm vào bảng log
                //                if (!string.IsNullOrEmpty(productCoil.LineCode))
                //                {
                //                    var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(productCoil.LineCode));
                //                    if (line != null)
                //                    {
                //                        data.LineCode = line.LineCode;

                //                        var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                //                        if (floor != null)
                //                        {
                //                            data.FloorCode = floor.FloorCode;

                //                            var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                //                            if (wareHouse != null)
                //                                data.WHS_Code = wareHouse.WHS_Code;
                //                        }
                //                    }


                //                    //Cập nhật lại vị trí trong bảng ProdPackageInfos
                //                    var prodPackageInfoUpdate = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(productCoil.CoilCode) && x.ProductQrCode.Equals(productCoil.ProductQrCode));
                //                    if (prodPackageInfoUpdate != null)
                //                    {
                //                        prodPackageInfoUpdate.PositionInStore = productCoil.PositionInStore;
                //                        prodPackageInfoUpdate.RackCode = productCoil.RackCode;
                //                        prodPackageInfoUpdate.RackPosition = productCoil.RackPosition;
                //                        prodPackageInfoUpdate.UpdatedBy = User.Identity.Name;
                //                        prodPackageInfoUpdate.UpdatedTime = DateTime.Now;
                //                        _context.ProdPackageReceiveds.Update(prodPackageInfoUpdate);
                //                        _context.SaveChanges();
                //                    }
                //                }
                //                //Trường hợp chưa được xếp trong bảng mapping
                //                if (prodMapping == null)
                //                {
                //                    if (!string.IsNullOrEmpty(productCoil.LineCode))
                //                    {
                //                        var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(productCoil.LineCode));
                //                        if (line != null)
                //                        {
                //                            data.LineCode = line.LineCode;

                //                            var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                //                            if (floor != null)
                //                            {
                //                                data.FloorCode = floor.FloorCode;

                //                                var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                //                                if (wareHouse != null)
                //                                    data.WHS_Code = wareHouse.WHS_Code;
                //                            }
                //                        }

                //                        //Thêm vào bảng Product_Entity_Mapping
                //                        var mapping = new ProductLocatedMapping
                //                        {
                //                            WHS_Code = data.WHS_Code,
                //                            FloorCode = data.FloorCode,
                //                            LineCode = productCoil.LineCode,
                //                            RackCode = productCoil.RackCode,
                //                            RackPosition = productCoil.RackPosition,
                //                            ProductQrCode = productCoil.ProductQrCode,
                //                            Quantity = productCoil.Size,
                //                            Unit = data.Unit,
                //                            Ordering = data.Ordering,
                //                            CreatedBy = User.Identity.Name,
                //                            CreatedTime = DateTime.Now,
                //                            DeletionToken = "NA"
                //                        };

                //                        _context.ProductLocatedMappings.Add(mapping);
                //                        _context.SaveChanges();

                //                        //Cập nhật số lượng đã xếp kho trong bảng detail
                //                        var materialStoreImpGoodsDetails = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                //                        materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet + (decimal)mapping.Quantity;
                //                        _context.ProductImportDetails.Update(materialStoreImpGoodsDetails);
                //                        _context.SaveChanges();

                //                        // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_SUCCESS"));
                //                        msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                //                        //return Json(msg);
                //                    }
                //                }
                //                else
                //                {
                //                    prodMapping.Quantity = prodMapping.Quantity + productCoil.Size;
                //                    prodMapping.UpdatedBy = User.Identity.Name;
                //                    prodMapping.UpdatedTime = DateTime.Now;
                //                    _context.ProductLocatedMappings.Update(prodMapping);

                //                    //Cập nhật số lượng đã xếp kho trong bảng detail
                //                    var materialStoreImpGoodsDetails = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                //                    materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet + (decimal)productCoil.Size;
                //                    _context.ProductImportDetails.Update(materialStoreImpGoodsDetails);

                //                    _context.SaveChanges();
                //                    // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_SUCCESS"));
                //                    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                //                    //return Json(msg);
                //                }
                //            }
                //            else
                //            {
                //                msg.Error = true;
                //                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NON_SORT_RACK_EXITS"));
                //                msg.Title = _stringLocalizer["MIS_MSG_NON_SORT_RACK_EXITS"];
                //            }
                //        }
                //    }
                //    else
                //    {
                //        msg.Error = true;
                //        msg.Title = "Không có sản phẩm nào được xếp";
                //    }
                //}
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = "Không có sản phẩm nào để xếp";
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_FAIL"));
                msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_FAIL"];
            }

            msg.Object = data;

            return Json(msg);
        }


        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetInfoUserImport(string userName)
        {
            var user = (from a in _context.Users.Where(x => x.UserName.Equals(userName))
                        join b in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BranchId equals b.OrgAddonCode
                        join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentId equals c.DepartmentCode
                        select new
                        {
                            BranchName = b.OrgName,
                            Department = c.Title
                        }).FirstOrDefault();
            return Json(user);
        }

        [AllowAnonymous]
        [HttpGet]
        private decimal getProductInRack(string RackCode)
        {
            decimal count = 0;
            var query = from a in _context.EDMSRacks.Where(x => x.RackCode == RackCode)
                        join d in _context.ProductLocatedMappings.Where(x => x.IsDeleted == false) on a.RackCode equals d.RackCode
                        select new
                        {
                            a.RackCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }
        [AllowAnonymous]
        [HttpGet]
        private string GetPositionInfo(string rackCode)
        {
            var positionInfo = string.Empty;
            var whsName = string.Empty;
            var floorName = string.Empty;
            var lineName = string.Empty;
            var rackName = string.Empty;
            var mapping = _context.ProductLocatedMappings.FirstOrDefault(x => x.RackCode == rackCode);
            if (mapping != null)
            {
                var whs = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Code.Equals(mapping.WHS_Code));
                if (whs != null)
                    whsName = whs.WHS_Name;

                var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(mapping.FloorCode));
                if (floor != null)
                    floorName = floor.FloorName;

                var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(mapping.LineCode));
                if (line != null)
                    lineName = line.L_Text;

                var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(mapping.RackCode));
                if (rack != null)
                    rackName = rack.RackName;

                positionInfo = string.Format("{0}, {1}, {2}, {3}", rackName, lineName, floorName, whsName);
            }
            return positionInfo;
        }
        [AllowAnonymous]
        [HttpGet]
        public object CheckProductInExpTicket(string productQrCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                if (!string.IsNullOrEmpty(productQrCode))
                {
                    var query = _context.ProductExportDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                    if (query != null)
                    {
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"));
                        var query2 = _context.ProductLocatedMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                        if (query2 != null)
                        {
                            msg.Error = true;
                            //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"));
                            msg.Title = String.Format(CommonUtil.ResourceValue("Sản phẩm đã có trong phiếu xuất kho và đã được xếp kho. Không được phép xóa !"));
                            return Json(msg);
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NO_CODE_PRODUCT"));
                    msg.Title = _stringLocalizer["MIS_MSG_NO_CODE_PRODUCT"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NO_CHECK_CODE_PRODUCT"));
                msg.Title = _stringLocalizer["MIS_MSG_NO_CHECK_CODE_PRODUCT"];
            }

            return Json(msg);
        }

        public object DeleteProductInStore(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                var check = _context.ProdPackageReceiveds.FirstOrDefault(x => x.Id.Equals(id));
                if (check != null)
                {
                    var prodMapping = _context.ProductLocatedMappings.AsParallel().FirstOrDefault(x => x.ProductQrCode.Equals(check.ProductQrCode) && x.RackCode.Equals(check.RackCode));
                    if (prodMapping != null)
                    {
                        prodMapping.Quantity = prodMapping.Quantity > check.Size ? prodMapping.Quantity - check.Size : 0;
                        _context.ProductLocatedMappings.Update(prodMapping);
                        _context.SaveChanges();

                        //Cập nhật số lượng đã xếp kho trong bảng detail
                        var materialStoreImpGoodsDetails = _context.ProductImportDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodMapping.ProductQrCode);
                        materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet > (decimal)check.Size ? materialStoreImpGoodsDetails.QuantityIsSet - (decimal)check.Size : 0;
                        _context.ProductImportDetails.Update(materialStoreImpGoodsDetails);
                        _context.SaveChanges();

                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_DELETE_PRODUCT_SUCCESS"));
                        msg.Title = _stringLocalizer["MIS_MSG_DELETE_PRODUCT_SUCCESS"];
                        //return Json(msg);

                        //Xóa bỏ vị trí trong bảng PROD_PACKAGE_INFO
                        check.RackCode = null;
                        check.RackPosition = null;
                        check.PositionInStore = null;
                        _context.ProdPackageReceiveds.Update(check);
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_PRODUCT_SORT_WARE_HOURE"));
                        msg.Title = _stringLocalizer["MIS_MSG_PRODUCT_SORT_WARE_HOURE"];
                        //return Json(msg);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_FAIL"));
                msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_FAIL"];
            }

            return Json(msg);
        }

        //Export Excel
        [AllowAnonymous]
        [HttpGet]
        public ActionResult ExportExcelProduct(string ticketCode)
        {
            var impHeader = _context.ProductImportHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
            {
                x.LotProductCode,
                x.TicketCode,
                x.Title,
                x.StoreCode,
                x.SupCode,
                x.Reason,
                x.StoreCodeSend,
                x.UserImport,
                x.Note,
                x.UserSend,
                Branch = _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)) != null ? _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)).Branch.OrgName : "",
                InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                CreatedTime = x.TimeTicketCreate.HasValue ? "Ngày " + x.TimeTicketCreate.Value.Day + " tháng " + x.TimeTicketCreate.Value.Month + " năm " + x.TimeTicketCreate.Value.Year : "",
                StoreName = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_Name : "",
                StoreAddress = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_ADDR_Text : ""
            }).FirstOrDefault();

            var listProduct = (from g in _context.ProductImportDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && y.ProductType == "SUB_PRODUCT")
                               join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductQrCode
                               join c1 in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c1.CodeSet
                               join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                               from d2 in d1.DefaultIfEmpty()
                               join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                               from a in a2.DefaultIfEmpty()
                               orderby b1.ProductCode
                               select new
                               {
                                   ProductCode = g.ProductCode,
                                   ProductName = b1.AttributeName,
                                   ProductType = "SUB_PRODUCT",
                                   ProductQrCode = g.ProductQrCode,
                                   sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                   Unit = b1.Unit,
                                   UnitName = c1.ValueSet,
                                   QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                   Quantity = g.Quantity,
                                   QuantityPoCount = a != null ? int.Parse(a.Quantity) : 0,//Lấy ra số lượng từ P0
                                   QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                   QuantityIsSet = g.QuantityIsSet,
                                   SalePrice = g.SalePrice,
                                   ProductLot = g.ProductLot,
                                   ProductCoil = g.ProductCoil,
                                   PackType = g.PackType,
                                   ImpType = d2.ValueSet,
                                   ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                   {
                                       k.Id,
                                       k.ProductQrCode,
                                       ProductName = b1.AttributeName,
                                       ProductCoil = k.CoilCode,
                                       ProductCoilRelative = k.CoilRelative,
                                       k.Remain,
                                       k.Size,
                                       k.TicketCode,
                                       k.PackType,
                                       k.PositionInStore,
                                       k.RackCode,
                                       k.RackPosition,
                                       k.CreatedBy,
                                       k.CreatedTime,
                                       k.UpdatedBy,
                                       k.UpdatedTime,
                                       k.UnitCoil,
                                       k.ProductImpType,
                                       k.ProductLot
                                   })
                               })
                               .Concat(from g in _context.ProductImportDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && y.ProductType == "FINISHED_PRODUCT")
                                       join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductCode
                                       join c1 in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c1.CodeSet
                                       join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                       from d2 in d1.DefaultIfEmpty()
                                       join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                       from a in a2.DefaultIfEmpty()
                                       orderby b1.ProductCode
                                       select new
                                       {
                                           ProductCode = g.ProductCode,
                                           ProductName = b1.ProductName,
                                           ProductType = "FINISHED_PRODUCT",
                                           ProductQrCode = g.ProductQrCode,
                                           sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                           Unit = b1.Unit,
                                           UnitName = c1.ValueSet,
                                           QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                           Quantity = g.Quantity,
                                           QuantityPoCount = a != null ? int.Parse(a.Quantity) : 0,//Lấy ra số lượng từ P0
                                           QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                           QuantityIsSet = g.QuantityIsSet,
                                           SalePrice = g.SalePrice,
                                           ProductLot = g.ProductLot,
                                           ProductCoil = g.ProductCoil,
                                           PackType = g.PackType,
                                           ImpType = d2.ValueSet,
                                           ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                           {
                                               k.Id,
                                               k.ProductQrCode,
                                               ProductName = b1.ProductName,
                                               ProductCoil = k.CoilCode,
                                               ProductCoilRelative = k.CoilRelative,
                                               k.Remain,
                                               k.Size,
                                               k.TicketCode,
                                               k.PackType,
                                               k.PositionInStore,
                                               k.RackCode,
                                               k.RackPosition,
                                               k.CreatedBy,
                                               k.CreatedTime,
                                               k.UpdatedBy,
                                               k.UpdatedTime,
                                               k.UnitCoil,
                                               k.ProductImpType,
                                               k.ProductLot
                                           })
                                       });


            var data = listProduct.ToList();

            var listExport = new List<ProdDeliveryDetailExport>();
            var no = 1;
            foreach (var item in data)
            {
                var itemExport = new ProdDeliveryDetailExport();
                itemExport.No = no;
                itemExport.ProductName = item.ProductName;
                itemExport.ProductCode = item.ProductCode;
                itemExport.Unit = item.UnitName;
                itemExport.QuantityPO = item.QuantityPoCount;
                itemExport.Quantity = item.Quantity;
                itemExport.SalePrice = item.SalePrice;
                itemExport.TotalAmount = item.SalePrice ?? 0 * item.Quantity;

                no = no + 1;
                listExport.Add(itemExport);
            }

            if (impHeader != null)
            {

            }

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                var pathTemplate = Path.Combine(_hostingEnvironment.WebRootPath, "files\\ImportStore_Template.xlsx");

                FileStream fileStream = new FileStream(pathTemplate, FileMode.Open, FileAccess.Read);

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
                marker.AddVariable("impHeader", impHeader);

                //Process the markers in the template
                marker.ApplyMarkers();


                int row = 14;
                int totalRow = row + listExport.Count();

                worksheet.Range["A15" + ":H" + totalRow].CellStyle = bodyStyle;
                worksheet.UsedRange.AutofitColumns();
                worksheet.UsedRange.AutofitRows();
                worksheet.ImportData(listExport, 14, 1, false);

                worksheet.Columns[2].ColumnWidth = 15;
                worksheet.Columns[7].ColumnWidth = 24;
                worksheet.Range["A2"].Text = "ĐƠN VỊ: " + impHeader.Branch;
                worksheet.Range["A3"].Text = "Bộ phận: ";
                worksheet.Range["B10"].Text = "Nhập tại kho: " + impHeader.StoreName + " Địa điểm: " + impHeader.StoreAddress;
                worksheet.Range["B" + totalRow + ":D" + totalRow].Merge(true);
                worksheet.Range["B" + totalRow].CellStyle.Font.Bold = true;
                worksheet.Range["B" + totalRow].Text = "Cộng: ";
                worksheet.Range["E" + totalRow].Text = ((int)listExport.Sum(x => x.QuantityPO)).ToString();
                worksheet.Range["F" + totalRow].Text = ((int)listExport.Sum(x => x.Quantity)).ToString();
                worksheet.Range["G" + totalRow].Text = ((int)listExport.Sum(x => x.SalePrice)).ToString();
                worksheet.Range["H" + totalRow].Text = ((int)listExport.Sum(x => x.TotalAmount)).ToString();

                worksheet.Range["A" + (totalRow + 1)].Text = "Tổng số tiền(viết bằng chữ): " + ConvertWholeNumber(((int)listExport.Sum(x => x.TotalAmount)).ToString());
                worksheet.Range["A" + (totalRow + 2)].Text = "Số chứng từ gốc kèm theo: " + impHeader.LotProductCode;
                //Saving the workbook as stream
                workbook.Version = ExcelVersion.Excel2010;

                string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var fileName = "ExportFile_Phieu_Nhap_Kho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx";
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;
                return File(ms, ContentType, fileName);
            }
        }
        #endregion

        #region Tạo mã QR_Code
        [AllowAnonymous]
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }
        #endregion

        #region Pack Record to Packing
        [AllowAnonymous]
        [HttpPost]
        public JsonResult ConvertRecords2Packing(string packCode)
        {
            var packing = "";
            var data = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(packCode));
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.PackHierarchyPath))
                {
                    if (data.PackHierarchyPath.Contains("/"))
                    {
                        var arrPack = data.PackHierarchyPath.Split("/", StringSplitOptions.None);
                        foreach (var item in arrPack)
                        {
                            var pack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(item));
                            if (pack != null)
                            {

                                if (string.IsNullOrEmpty(packing))
                                {
                                    packing = pack.PackName;
                                }
                                else
                                {
                                    packing = packing + " x " + pack.PackQuantity + " " + pack.PackName;
                                }
                            }
                        }
                    }
                    else
                    {
                        packing = data.PackName;
                    }
                }
            }
            return Json(packing);
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
        public class MaterialStoreImpModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string QrTicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string Title { get; set; }
            public string UserImport { get; set; }
            public string UserImportName { get; set; }
            public string UserSend { get; set; }
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
            public string StoreCodeSend { get; set; }
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
        public class MaterialStoreImpModelInsert
        {
            public MaterialStoreImpModelInsert()
            {
                ListProduct = new List<MaterialStoreImpModelDetailInsert>();
            }
            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string StoreCode { get; set; }
            public string CusCode { get; set; }
            public string Reason { get; set; }
            public string StoreCodeSend { get; set; }
            public decimal CostTotal { get; set; }
            public string Currency { get; set; }
            public decimal Discount { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalMustPayment { get; set; }
            public decimal TotalPayed { get; set; }
            public string PaymentStatus { get; set; }
            public string NextTimePayment { get; set; }
            public string UserImport { get; set; }
            public string Note { get; set; }
            public string UserSend { get; set; }
            public string InsurantTime { get; set; }
            public string TimeTicketCreate { get; set; }
            public List<MaterialStoreImpModelDetailInsert> ListProduct { get; set; }
            public string PoSupCode { get; set; }
            public string Section { get; set; }
            public int QuantityImp { get; set; }
            public string Status { get; set; }
            public string WorkflowCat { get; set; }
            public string ActRepeat { get; set; }
            public string ProdCustomJson { get; set; }
            public string SrcData { get; set; }
            public bool? IsCustomized { get; set; }
            public string GroupType { get; set; }
            public string SupCode { get; set; }
        }
        public class MaterialStoreImpModelDetailInsert
        {
            public MaterialStoreImpModelDetailInsert()
            {
                ListCoil = new List<MaterialStoreImpModelDetailInsert>();
            }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string ProductQrCode { get; set; }
            public string sProductQrCode { get; set; }
            public string RackCode { get; set; }
            public string RackName { get; set; }
            public decimal Quantity { get; set; }
            public decimal QuantityIsSet { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public decimal? SalePrice { get; set; }
            public int? TaxRate { get; set; }
            public int? Discount { get; set; }
            public int? Commission { get; set; }
            public decimal Total { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal DiscountTotal { get; set; }
            public decimal CommissionTotal { get; set; }
            public string ProductCoil { get; set; }
            public string sProductCoil { get; set; }
            public string ProductLot { get; set; }
            public string ProductCoilRelative { get; set; }
            public string PackType { get; set; }
            public string QuantityCoil { get; set; }
            public string ValueCoil { get; set; }
            public string UnitCoil { get; set; }
            public string ProductImpType { get; set; }
            public string RuleCoil { get; set; }
            public string RackPosition { get; set; }
            public string PositionInStore { get; set; }
            public List<MaterialStoreImpModelDetailInsert> ListCoil { get; set; }
        }
        #endregion

        #region 
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
                .Union(_commonSettingController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCj.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_mpamStringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
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
            var data = _context.ProductImportHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                && x.ObjectType.Equals("IMPORT_STORE"));
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

        [AllowAnonymous]
        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.ProductImportHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x => new
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
            var data = _context.ProductImportHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode)
                        && x.ObjectType.Equals("IMPORT_STORE"));
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
        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProductImportHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.TicketCode) && x.ObjectType.Equals("IMPORT_STORE"));
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

        public class Packing
        {
            public string PackType { get; set; }
            public string PackCode { get; set; }
            public int CountUnit { get; set; }
        }

        #endregion

        #region Import Word/Excel
        [AllowAnonymous]
        [HttpPost]
        public string ImportFromServer(int idRepoCatFile)
        {
            var obj = DownloadFileFromServer(idRepoCatFile);
            Stream stream = new MemoryStream(obj.stream);
            stream.Position = 0;
            var type = obj.type;

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
        [NonAction]
        public (byte[] stream, string type) DownloadFileFromServer(int idRepoCatFile)
        {
            byte[] fileStream = new byte[0];

            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Token = (b != null ? b.Token : null),
                            Type = (b != null ? b.Type : null),
                            ReposCode = (b != null ? b.ReposCode : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
            }
            int index = data.FileName.LastIndexOf('.');
            string type = index > -1 && index < data.FileName.Length - 1 ?
                data.FileName.Substring(index) : ".docx";

            return (fileStream, type);
        }
        public class ModelImportWord
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string LotProductCode { get; set; }
            public string UnitName { get; set; }
            public decimal Quantity { get; set; }
            public decimal? Cost { get; set; }
            public string TicketCode { get; set; }
            public string Status { get; set; }
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

        public class AdvanceSearchObj
        {
            public string ListCode { get; set; }
            public string BoardCode { get; set; }
            public string CardName { get; set; }
            public string Member { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Status { get; set; }
            public string ObjDependency { get; set; }
            public string ObjCode { get; set; }
            //public List<Properties> ListObjCode { get; set; }
            //public int TabBoard { get; set; }
            //public int Page { get; set; }
            public string Description { get; set; }
            public string Comment { get; set; }
            public string SubItem { get; set; }
            public string Object { get; set; }
            public string BranchId { get; set; }
            public string ObjType { get; set; }
            public string Project { get; set; }
            public string Department { get; set; }
            public string Group { get; set; }
            public string UserId { get; set; }
            public string Supplier { get; set; }
            public string Customer { get; set; }
            public string Contract { get; set; }
            public string UserName { get; set; }
            public string BoardSearch { get; set; }
            //public int CurrentPageList { get; set; }
            public string WorkflowInstCode { get; set; }
            public string TimeType { get; set; }
            //public bool TimeTypeCreated { get; set; }
            //public bool TimeTypeStart { get; set; }
            //public bool TimeTypeEnd { get; set; }
            //public bool TimeTypeCompleted { get; set; }
        }

        public class GridCardJtable
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public string ListName { get; set; }
            public DateTime Deadline { get; set; }
            public string Currency { get; set; }
            public decimal Cost { get; set; }
            public decimal Completed { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public DateTime? UpdateTime { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string UpdatedTimeTxt { get; set; }
            public string Priority { get; set; }
            public string WorkType { get; set; }
            public string BoardName { get; set; }
            public DateTime CreatedDate { get; set; }
            public string Total { get; set; }
            public string TotalRow { get; set; }
            public string BoardCode { get; set; }
            public string BoardType { get; set; }
            public bool IsShowLabelAssign { get; set; }
            public string GroupAssign { get; set; }
            public string DepartmentAssign { get; set; }
            public string WfName { get; set; }
            public string ActName { get; set; }
            public string WorkflowCode { get; set; }
            public string LastActivity { get; set; }
            public string Description { get; set; }
            public bool IsRead { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public List<GridCardJtable> GetGirdCardBoard(AdvanceSearchObj dataSearch)
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == ESEIM.AppContext.UserName);
            //var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var fromDateNew = DateTime.Now.AddDays(-30);
            var fromDatePara = fromDateNew.ToString("yyyy-MM-dd");
            var toDatePara = DateTime.Now.ToString("yyyy-MM-dd");
            var listUserOfBranch = "";
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }
            string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch", "@UserName",
                        "@ListUserOfBranch", "@DepartmentId", "@BoardSearch", "@UserId", "@BranchId", "@Status", "@CardName", "@ListCode", "@Group",
                        "@Project", "@Customer", "@Supplier", "@Contract", "@UserIdSearch", "@UserNameSearch", "@DepartmentSearch", "@WorkflowInstCode",
                        "@TimeTypeCreated", "@TimeTypeStart", "@TimeTypeEnd", "@TimeTypeCompleted"};

            object[] val = new object[] { 1, 100 ,fromDatePara, toDatePara, session.IsAllData, session.IsUser,
                        session.IsBranch, session.UserName, listUserOfBranch, !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                        !string.IsNullOrEmpty(dataSearch.BoardSearch) ? dataSearch.BoardSearch : "", session.UserId, !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "",
                        !string.IsNullOrEmpty(dataSearch.Status) ? dataSearch.Status : "", dataSearch.CardName ?? "", !string.IsNullOrEmpty(dataSearch.ListCode) ? dataSearch.ListCode : "",
                        !string.IsNullOrEmpty(dataSearch.Group) ? dataSearch.Group : "", !string.IsNullOrEmpty(dataSearch.Project) ? dataSearch.Project : "",
                        !string.IsNullOrEmpty(dataSearch.Customer) ? dataSearch.Customer : "", !string.IsNullOrEmpty(dataSearch.Supplier) ? dataSearch.Supplier: "",
                        !string.IsNullOrEmpty(dataSearch.Contract) ? dataSearch.Contract: "", !string.IsNullOrEmpty(dataSearch.UserId) ? dataSearch.UserId : "",
                        !string.IsNullOrEmpty(dataSearch.UserName) ? dataSearch.UserName : "", !string.IsNullOrEmpty(dataSearch.Department) ? dataSearch.Department: "",
                        !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : "",
                        false, true, true, false };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_ALL_BOARD_CARD_WITH_CONDITION", param, val);
            var query = CommonUtil.ConvertDataTable<GridCardJtable>(rs);
            return query;
        }


        public class JTableModelFile : JTableModel
        {
            public string ItemCode { get; set; }
            public string CardCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        public class FileCardJob
        {
            public int Id { get; set; }
            public string FileCode { get; set; }
            public string FileName { get; set; }
            public string FileTypePhysic { get; set; }
            public string Desc { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CloudFileId { get; set; }
            public string ReposName { get; set; }
            public int FileID { get; set; }
            public decimal SizeOfFile { get; set; }
            public string TypeFile { get; set; }
            public string ListUserShare { get; set; }
            public string MimeType { get; set; }
            public string Type { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectName { get; set; }
            public string CreatedBy { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            //if (string.IsNullOrEmpty(jTablePara.CardCode))
            //{
            //    return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            //}
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var cardObjects = GetGirdCardBoard(new AdvanceSearchObj());
            //var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
            //                                               .Select(p => new
            //                                               {
            //                                                   p.FileID,
            //                                                   p.ListUserShare,
            //                                                   p.UserShares
            //                                               }).ToList();
            var session = HttpContext.GetSessionUser();

            //string[] param = new string[] { "@CardCode" };
            //object[] val = new object[] { jTablePara.CardCode };
            //DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_FILE_CARD_JOB", param, val);
            //var query = CommonUtil.ConvertDataTable<FileCardJob>(rs);

            var query1 = (from a in _context.EDMSRepoCatFiles.Where(x =>
                                     //x.ObjectCode == objectCode &&
                                     x.ObjectType == "CARDJOB")
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          //join c in cardObjects on a.ObjectCode equals c.CardCode
                          //join c in _context.FilesShareObjectUsers
                          //.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(userName)))
                          //on b.FileCode equals c.FileID into c1
                          //from c in c1.DefaultIfEmpty()
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                              //where (session.UserType == 10 || b.CreatedBy == ESEIM.AppContext.UserName)
                              //where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) ||
                              //       b.CreatedBy.Equals(userName) || session.UserType == 10)
                          select new FileCardJob
                          {
                              Id = a.Id,
                              FileCode = b.FileCode,
                              FileName = b.FileName,
                              FileTypePhysic = b.FileTypePhysic,
                              MimeType = b.MimeType,
                              Desc = b.Desc,
                              CreatedTime = b.CreatedTime.Value,
                              CloudFileId = b.CloudFileId,
                              ReposName = f != null ? f.ReposName : "",
                              FileID = b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                              Type = "NO_SHARE",
                              ObjectCode = a.ObjectCode,
                          }).ToList();
            var query2 = (
                                 from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted
                                 && !string.IsNullOrEmpty(x.ObjectRelative)
                                 //&& x.ObjectRelative.Contains(objectCode)
                                  && x.ObjectRelative.Contains("JOBCARD"))
                                 join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                                 join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                                 //from d in cardObjects
                                 join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                                 from f in f1.DefaultIfEmpty()
                                 let rela = JsonConvert.DeserializeObject<ObjRelative>(a.ObjectRelative)
                                 where /*rela.ObjectInstance.Equals(d.CardCode) &&*/ rela.ObjectType.Equals("JOBCARD")
                                 select new FileCardJob
                                 {
                                     Id = c.Id,
                                     FileCode = b.FileCode,
                                     FileName = b.FileName,
                                     FileTypePhysic = b.FileTypePhysic,
                                     MimeType = b.MimeType,
                                     Desc = b.Desc,
                                     CreatedTime = b.CreatedTime.Value,
                                     CloudFileId = b.CloudFileId,
                                     ReposName = f != null ? f.ReposName : "",
                                     FileID = b.FileID,
                                     SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                                     Type = "SHARE",
                                     ObjectCode = rela.ObjectInstance,
                                 }).ToList();
            var query = query1.Union(query2).ToList();
            var queryFilter = (from a in query
                               where cardObjects.Any(x => x.CardCode == a.ObjectCode)
                               select a).Select(delegate (FileCardJob x)
                               {
                                   x.ObjectName = cardObjects.
                                   FirstOrDefault(y => y.CardCode == x.ObjectCode).CardName;
                                   return x;
                               }).ToList();

            int count = queryFilter.Count();
            var data = queryFilter.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc",
                "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile", "ListUserShare", "ObjectCode", "ObjectName", "CreatedBy");
            return jdata;
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
                    var impHeader = _context.ProductImportHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == firstItem.TicketCode);
                    if (impHeader != null)
                    {
                        msg.Error = true;
                        msg.Title = "Mã phiếu nhập " + impHeader.TicketCode + " đã được sử dụng!";
                        return Json(msg);
                    }
                }
                foreach (var item in data)
                {
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode));
                    //var checkDetail = _context.StopContractDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeeCode.Equals(item.EmployeeCode) && x.DecisionNum.Equals(item.DecisionNum));
                    if (materialProduct != null /*&& checkDetail == null*/)
                    {
                        var unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ValueSet) && !string.IsNullOrEmpty(item.UnitName)
                        && x.ValueSet.ToLower() == item.UnitName.ToLower() && x.Group == "UNIT")?.CodeSet ?? "";
                        var receiveDetail = new ProductImportDetail
                        {
                            TicketCode = item.TicketCode,
                            ProductCode = item.ProductCode,
                            LotProductCode = item.LotProductCode,
                            Quantity = item.Quantity,
                            Unit = unit,
                            Status = item.Status,
                            SalePrice = item.Cost
                        };
                        msg = InsertDetail(receiveDetail).Result;
                        if (msg.Error)
                        {
                            return Json(msg);
                        }
                    }
                    else if (materialProduct == null)
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm " + item.ProductCode + " không tồn tại  !";
                        return Json(msg);
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
            var fileName = $"Phiếu nhập {DateTime.Now.ToString("ddMMyyy-hhmm")}{type.ToLower()}";
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
            var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
            FileStream streamSave = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            stream.Seek(0, SeekOrigin.Begin);
            stream.CopyTo(streamSave);
            streamSave.Close();
            return pathFileDownLoad;
        }

        [AllowAnonymous]
        public JsonResult UploadFileExcel(MaterialStoreImpModelInsert header, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var listProdStatus = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PROD_STAT").OrderBy(x => x.ValueSet)
                    .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
                List<ProductImpInput> list = new List<ProductImpInput>();
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    if (!string.IsNullOrEmpty(ExcelController.docmodel.File_Path))
                    {
                        var pathTo = _hostingEnvironment.WebRootPath + ExcelController.docmodel.File_Path;
                        var fileStream = new FileStream(pathTo, FileMode.Open);
                        workbook = application.Workbooks.Open(fileStream);
                        fileStream.Close();
                    }
                    var id = 0;
                    for (int i = 0; i < 1; i++)
                    {
                        IWorksheet worksheet = workbook.Worksheets[i];
                        var user = _context.Users.FirstOrDefault(x => x.UserName.Equals(User.Identity.Name));
                        if (worksheet.Rows.Length > 1)
                        {
                            var length = worksheet.Rows.Count();
                            var intSkip = 5;
                            var listInSheets = worksheet.Rows.Skip(intSkip).Select(delegate (IRange range, int index)
                            {
                                var obj = new ProductImpInput();
                                if ((index + intSkip < length)
                                && !string.IsNullOrEmpty(worksheet.GetValueRowCol(index + intSkip, 2).ToString())
                                && !string.IsNullOrEmpty(worksheet.GetValueRowCol(index + intSkip, 15).ToString()))
                                {
                                    var validateObj = new ProductImpInput();
                                    validateObj.ProductCode = worksheet.GetValueRowCol(index + intSkip, 2).ToString().Replace("\"", "").Trim();
                                    validateObj.ProductName = worksheet.GetValueRowCol(index + intSkip, 3).ToString().Replace("\"", "").Trim();
                                    validateObj.UnitName = worksheet.GetValueRowCol(index + intSkip, 4).ToString().Replace("\"", "").Trim();
                                    validateObj.Source = worksheet.GetValueRowCol(index + intSkip, 5).ToString().Replace("\"", "").Trim();
                                    validateObj.ProductStatus = worksheet.GetValueRowCol(index + intSkip, 6).ToString().Replace("\"", "").Trim();
                                    validateObj.SQuantity = worksheet.GetValueRowCol(index + intSkip, 13).ToString().Replace("\"", "").Trim();
                                    validateObj.SCost = worksheet.GetValueRowCol(index + intSkip, 14).ToString().Replace("\"", "").Trim();
                                    validateObj.StoreCode = worksheet.GetValueRowCol(index + intSkip, 15).ToString().Replace("\"", "").Trim();
                                    id++;
                                    obj.Id = id;
                                    obj.TicketCode = header.TicketCode;
                                    obj.ProductCode = validateObj.ProductCode;
                                    obj.ProductName = validateObj.ProductName;
                                    obj.UnitName = validateObj.UnitName;
                                    var objUnit = !string.IsNullOrEmpty(validateObj.UnitName) ? _context.CommonSettings.FirstOrDefault(x =>
                                        !x.IsDeleted &&
                                        x.ValueSet.ToLower().Equals(validateObj.UnitName.ToLower())) : null;
                                    obj.Unit = objUnit != null ? objUnit.CodeSet : "";
                                    obj.Source = validateObj.Source;
                                    obj.ProductStatus = validateObj.ProductStatus;
                                    var listItemStatus = (from a in validateObj.ProductStatus.Split(",")
                                                          join b in listProdStatus on a.Trim() equals b.Name
                                                          select b.Code); // reserve name to code
                                    obj.Status = string.Join(", ", listItemStatus);
                                    obj.SCost = validateObj.SCost;
                                    obj.SQuantity = validateObj.SQuantity;
                                    obj.SalePrice = !string.IsNullOrEmpty(validateObj.SCost) ? Math.Round(decimal.Parse(validateObj.SCost.Replace(",", "")), 0) : 0;
                                    obj.Quantity = !string.IsNullOrEmpty(validateObj.SQuantity) ? Math.Round(decimal.Parse(validateObj.SQuantity), 0) : 0;
                                    obj.StoreCode = (validateObj.StoreCode.Split("-").FirstOrDefault()?.Trim() ?? "");
                                }
                                else
                                {
                                    obj.Id = -1;
                                }
                                return obj;
                            }).Where(x => x.Id != -1).ToList();
                            list = list.Concat(listInSheets).ToList();
                        }
                    }
                    msg.Object = new
                    {
                        //Header = header,
                        Detail = list
                    };
                    msg.Title = "Đọc dữ liệu từ file Excel thành công !";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File excel không có dữ liệu !";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }

        [AllowAnonymous]
        public async Task<JMessage> ValidateData([FromBody] ModelImportExcel data)
        {
            var msg = new JMessage() { };
            try
            {
                foreach (var validateObj in data.ListEmp)
                {
                    // return true if encounter any error
                    validateObj.CheckProductCode = !_context.MaterialProducts.Any(x => !x.IsDeleted && x.ProductCode.Equals(validateObj.ProductCode));
                    validateObj.CheckUnit = !_context.CommonSettings.Any(x => !x.IsDeleted && x.ValueSet.ToLower().Equals(validateObj.UnitName.ToLower()));
                    validateObj.CheckStore = !_context.EDMSWareHouses.Any(x => x.WHS_Code.ToLower().Equals(validateObj.StoreCode.ToLower()));
                    if (/*validateObj.CheckProductCode.Value || */validateObj.CheckUnit.Value || validateObj.CheckStore.Value)
                    {
                        msg.Title = "Một số bản ghi không hợp lệ yêu cầu sửa lại file excel";
                        msg.Error = true;
                    }
                    else if (validateObj.CheckProductCode.Value)
                    {
                        var msg1 = await InsertProductCategory(new MaterialProduct()
                        {
                            ProductCode = validateObj.ProductCode,
                            TypeCode = "FINISHED_PRODUCT",
                            Unit = validateObj.Unit,
                            Packing = $"Hộp * 10 {validateObj.UnitName}",
                            ProductName = validateObj.ProductName,
                            ImpType = "DEFAULT"
                        });
                        if (msg1.Error == false)
                        {
                            validateObj.CheckProductCode = false;
                        }
                        else
                        {
                            msg.Title = "Một số bản ghi không hợp lệ yêu cầu sửa lại file excel";
                            msg.Error = true;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            msg.Object = data;
            return msg;
        }
        [AllowAnonymous]
        public async Task<JsonResult> InsertFromExcel([FromBody] ModelImportExcel data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                foreach (var item in data.ListEmp)
                {
                    var mp = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode));
                    //var checkDetail = _context.StopContractDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeeCode.Equals(item.EmployeeCode) && x.DecisionNum.Equals(item.DecisionNum));
                    if (mp != null /*&& checkDetail == null*/)
                    {
                        var receiveDetail = new ProductImportDetail
                        {
                            ProductCode = item.ProductCode,
                            ProductType = mp.TypeCode,
                            ProductQrCode = "",
                            Quantity = item.Quantity,
                            Unit = item.Unit,
                            SalePrice = item.SalePrice,
                            Currency = "VND",
                            TicketCode = item.TicketCode,
                            StoreCode = item.StoreCode,
                            PackType = "",
                            Status = item.Status,
                            ImpType = "DEFAULT",
                            ProdCustomJson = "",
                            ParentMappingId = null,
                        };
                        msg = await InsertDetail(receiveDetail);
                        if (msg.Error)
                        {
                            return Json(msg);
                        }
                    }
                    else if (mp == null)
                    {
                        msg.Error = true;
                        msg.Title = "Sản phẩm " + item.ProductCode + " không tồn tại  !";
                        return Json(msg);
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
        public class ModelImportExcel
        {
            public string TicketCode { get; set; }
            public List<ProductImpInput> ListEmp { get; set; }
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
        [HttpGet]
        public IActionResult GetListPackage(string statusReady = "")
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                //int intBeginFor = (pageNo - 1) * pageSize;
                var rs = _context.PackageObjects
                    //.Where(x => /*x.StatusReady == statusReady &&*/ (string.IsNullOrEmpty(content)
                    //|| (x.PackCode != null && x.PackCode.Contains(content))
                    //|| (x.PackName != null && x.PackName.Contains(content))))
                    .OrderBy(x => x.Id)
                    .Select(x => new { Code = x.PackCode, Name = (x.PackName + " - " + x.PackCode) })
                    .ToList()
                    /*.Skip(intBeginFor).Take(pageSize)*/;
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetListPackagePaging(int pageNo = 1, int pageSize = 10, string content = "", string statusReady = "")
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBeginFor = (pageNo - 1) * pageSize;
                var rs = _context.PackageObjects
                    .Where(x => /*x.StatusReady == statusReady &&*/ (string.IsNullOrEmpty(content)
                    || (x.PackCode != null && x.PackCode.Contains(content))
                    || (x.PackName != null && x.PackName.Contains(content))))
                    .OrderBy(x => x.Id)
                    .Select(x => new { Code = x.PackCode, Name = (x.PackName + " - " + x.PackCode) })
                    .ToList().Skip(intBeginFor).Take(pageSize);
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> ImportFromPackage(string packCode, string ticketCode, string createdBy = "")
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
                if (package.StatusReady != "IMP_READY")
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
                    msg.Title = "Không có sp trong pallet để nhập!";
                    return Ok(msg);
                }
                foreach (var item in packageDetails)
                {
                    var productInStock = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.IdImpProduct == item.IdImpProduct 
                                                                                    && x.PackCode == packCode);
                    if (productInStock != null && item.IdImpProduct != null && item.IdImpProduct > 0)
                    {
                        msg.Error = true;
                        msg.Title = "Palet đã được được nhập!";
                        return Ok(msg);
                    }
                }
                foreach (var item in packageDetails)
                {
                    var quantity = item.ListProdStrNo.SumQuantity();
                    var today = DateTime.Now.ToString("ddMMyyyy-HHmm"); //format('DDMMYYYY-HHmm')
                    var materialProduct = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                    var newDetail = new ProductImportDetail()
                    {
                        Currency = "VND",
                        PackType = "",
                        ProductCode = item.ProductCode,
                        //AttrCustom = "",
                        ProductQrCode = $"{item.ProductCode}_SL.{quantity}_T.{today}",
                        ProductType = materialProduct?.TypeCode,
                        ProductNo = item.ProductNo,
                        Quantity = quantity,
                        SalePrice = 0,
                        TicketCode = ticketCode,
                        Unit = materialProduct.Unit,
                        //CreatedBy = createdBy,
                        ImpType = "DEFAULT",
                        ParentMappingId = -1,
                        ParentProductNumber = -1,
                        Weight = item.Measure,
                        IsMultiple = false,
                        PackCode = packCode,
                        PackLot = package?.PackLot
                    };
                    msg = await InsertDetail(newDetail);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                    item.IdImpProduct = msg.ID;
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
        public async Task<IActionResult> DeletePackageImport(string ticketCode, string packCode)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var listDeleteDetail = _context.ProductImportDetails
                        .Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.PackCode == packCode).ToList();
                if (listDeleteDetail.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không có sp trong pallet để xóa!";
                    return Ok(msg);
                }
                foreach (var item in listDeleteDetail)
                {
                    msg = await DeleteDetail(item.Id);
                    if (msg.Error)
                    {
                        return Ok(msg);
                    }
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = e.ToString();
            }
            return Ok(msg);
        }

        #endregion
    }
    public class ProductImpInput
    {
        public int? Id { get; set; }
        public string TicketCode { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string UnitName { get; set; }
        public string Unit { get; set; }
        public string Source { get; set; }
        public string Status { get; set; }
        public string ProductStatus { get; set; }
        public string SQuantity { get; set; }
        public decimal Quantity { get; set; }
        public string SCost { get; set; }
        public decimal? SalePrice { get; set; }
        public string StoreCode { get; set; }
        public bool? CheckProductCode { get; set; }
        public bool? CheckUnit { get; set; }
        public bool? CheckStore { get; set; }
    }

    public class ProductImpDetail
    {
        public int Id { get; set; }
        public string TicketCode { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public string GroupCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal? QuantityIsSet { get; set; }
        public string Unit { get; set; }
        public decimal? SalePrice { get; set; }
        public decimal? SumSalePrice { get; set; }
        public string CurrencyCode { get; set; }
        public string Currency { get; set; }
        public byte[] QrCode { get; set; }
        public string ProductQRCode { get; set; }
        public string ProductNo { get; set; }
        public decimal? Remain { get; set; }
        public string PackType { get; set; }
        public string PackName { get; set; }
        public string PackCode { get; set; }
        public string SProductQrCode { get; set; }
        public string UnitCode { get; set; }
        public bool? IsCustomized { get; set; }
        public string ProdCustomJson { get; set; }
        public string ImpType { get; set; }
        public string Status { get; set; }
        public string ProductStatus { get; set; }
        public string BottleCode { get; set; }
        public string BottleName { get; set; }
        public List<ProductImportDetail> ListBottleDetails { get; set; }
        public List<ProductInStock> ListProductInStocks { get; set; }
        public string Serial { get; set; }
        public decimal? Weight { get; set; }
        public string TicketName { get; set; }
        public string GroupType { get; set; }
        public decimal? BottleWeight { get; set; }
        public List<DetailPosition> ListPosition { get; set; }
        public bool? IsTankStatic { get; set; }
        public bool? IsSelected { get; set; }
        public string ProductNoImp { get; set; }
        public string ProductNoInput { get; set; }
        public string PackLot { get; set; }
    }
    public class DetailPosition
    {
        public string PositionInStore { get; set; }
        public string ProductNo { get; set; }
    }

    public class InfoProduct
    {
        public string Packing { get; set; }
        public decimal? High { get; set; }
        public decimal? Wide { get; set; }
        public decimal? Long { get; set; }
        public decimal? Weight { get; set; }
        public string UnitWeight { get; set; }
        public bool? IsUsed { get; set; }
        public string FuelName { get; set; }
        public int MinNumber { get; set; }
        public string GroupCode { get; set; }
        public string GroupType { get; set; }
        public string UnitWeightCode { get; set; }

        public InfoProduct()
        {
            //Packing = packing;
            //High = high;
            //Wide = wide;
            //Long = @long;
            //Weight = weight;
            //UnitWeight = unitWeight;
        }

        //public override bool Equals(object obj)
        //{
        //    return obj is InfoProduct other &&
        //           Packing == other.Packing &&
        //           High == other.High &&
        //           Wide == other.Wide &&
        //           Long == other.Long &&
        //           Weight == other.Weight &&
        //           UnitWeight == other.UnitWeight;
        //}

        //public override int GetHashCode()
        //{
        //    return HashCode.Combine(Packing, High, Wide, Long, Weight, UnitWeight);
        //}
    }
}
