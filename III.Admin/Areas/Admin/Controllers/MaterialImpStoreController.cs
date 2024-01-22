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
using static III.Admin.Controllers.ProjectController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialImpStoreController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<MaterialImpStoreController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<MaterialProductController> _materialProductController;
        private readonly IStringLocalizer<CommonSettingController> _commonSettingController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public MaterialImpStoreController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<MaterialImpStoreController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService, IStringLocalizer<CommonSettingController> commonSettingController,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<MaterialProductController> materialProductController,
            IStringLocalizer<WorkflowActivityController> workflowActivityController)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
            _commonSettingController = commonSettingController;
            _workflowActivityController = workflowActivityController;
            _materialProductController = materialProductController;
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
        }
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

                var query = FuncJTable(userType, jTablePara.Title, jTablePara.CusCode, jTablePara.StoreCode, jTablePara.UserImport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.ReasonName);

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

        [HttpPost]
        public object GridDataOfUser([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [HttpPost]
        public object GridDataOfBranch([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [HttpPost]
        public object GridDataOfAdmin([FromBody] JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 10);
        }

        [NonAction]
        public IQueryable<MaterialStoreImpModel> FuncJTable(int userType, string Title, string CusCode, string StoreCode, string UserImport, string FromDate, string ToDate, string ReasonName)
        {
            var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProdReceivedHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                         join c in _context.PAreaMappingsStore.Where(x => !x.IsDeleted && x.ObjectType == "AREA") on a.StoreCode equals c.ObjectCode
                         join f in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false && x.PAreaType == "AREA") on c.CategoryCode equals f.Code
                         //join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals c.WHS_Code
                         //join c in _context.WarehouseZoneStructs.Where(x => !x.IsDeleted && x.ZoneType == "WAREHOUSE") on a.StoreCode equals c.ZoneCode
                         join d in _context.Users.Where(x => x.Active) on a.UserImport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON") on a.Reason equals e.CodeSet into e1
                         from e in e1.DefaultIfEmpty()
                             //field khách hàng trong phiếu nhập chính là nhà cung cấp (hiện tại chưa sửa)
                         join b in _context.Suppliers.Where(x => x.IsDeleted != true) on a.CusCode equals b.SupCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(Title) || (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                         && (string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
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
                             CusCode = a.CusCode,
                             CusName = b2 != null ? b2.SupName : "",
                             StoreCode = a.StoreCode,
                             StoreName = f.PAreaDescription,
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
                        var impODD = _context.ProdReceivedHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                        var noODD = 1;
                        if (impODD.Count > 0)
                            noODD = noODD + impODD.Count;
                        ticketCode = string.Format("IMP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                        break;
                    case "PO":
                        var impPO = _context.ProdReceivedHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                        var noPO = 1;
                        if (impPO.Count > 0)
                            noPO = noPO + impPO.Count;
                        ticketCode = string.Format("IMP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
                        break;
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

        [HttpPost]
        public JsonResult GetItem([FromBody] int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", id);

                var item = _context.ProdReceivedHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
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
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "SUB_PRODUCT")
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
                                   .Concat(from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "FINISHED_PRODUCT")
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
        [HttpPost]
        public JsonResult Insert([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangePoSup = false;
                var poOldTime = DateTime.Now;
                var chk = _context.ProdReceivedHeaders.Any(x => x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProdReceivedHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
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
                        WorkflowCat = obj.WorkflowCat
                    };
                    _context.ProdReceivedHeaders.Add(objNew);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["MIS_MSG_ADD_MATERIAL_EXP_STORE_HOURE"];
                    var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
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

                        _context.ProdReceivedHeaders.Update(header);
                        _context.SaveChanges();
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

        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var prod = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
            return Json(prod);
        }

        [HttpPost]
        public JsonResult Update([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;
                var objUpdate = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    var lstStatus = new List<JsonStatus>();

                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                                    join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                    select a.Id).Any();

                    //Check xem sản phẩm đã được xếp kho thì không cho sửa kho nhập
                    var chkOrdering = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                                       join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
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
                        objUpdate.CusCode = obj.CusCode;
                        objUpdate.Reason = obj.Reason;
                        objUpdate.StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "";
                        objUpdate.UserImport = obj.UserImport;
                        objUpdate.Note = obj.Note;
                        objUpdate.UserSend = obj.UserSend;
                        objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                        objUpdate.UpdatedBy = ESEIM.AppContext.UserName;
                        objUpdate.UpdatedTime = DateTime.Now;
                        msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
                        var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                        var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
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

                                _context.ProdReceivedHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdReceivedHeaders.Update(header);

                            }
                        }

                        //Work flow update status
                        var session = HttpContext.GetSessionUser();
                        if (!string.IsNullOrEmpty(objUpdate.Status))
                        {
                            lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(objUpdate.Status);
                        }
                        objUpdate.JsonData = CommonUtil.JsonData(objUpdate, obj, objUpdate.JsonData, session.FullName);
                        _context.ProdReceivedHeaders.Update(objUpdate);
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

        [HttpPost]
        public JsonResult Delete([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["MIS_TITLE_INFORMATION_SHIPMENT"]);
                }
                else
                {
                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                                    join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                    select a.Id).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_DELTE_IMPORT_WARE_HOURE"];
                        return Json(msg);
                    }

                    //Check xem sản phẩm đã được xếp kho chưa
                    var chkMapping = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                                      join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.Quantity > 0) on a.ProductQrCode equals b.ProductQrCode
                                      join c in _context.MapStockProdIns on b.Id equals c.MapId
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
                    _context.ProdReceivedHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    listDetail.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = ESEIM.AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                    });
                    _context.ProdReceivedDetails.UpdateRange(listDetail);

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
                    var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode));
                    var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
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

                            _context.ProdReceivedHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdReceivedHeaders.Update(header);
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

        [HttpGet]
        public JsonResult GetListCoilByProdQrCode(string ticketCode, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProdReceivedHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
                    x.CusCode,
                    x.Reason,
                    x.StoreCodeSend,
                    x.UserImport,
                    x.Note,
                    x.UserSend,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "SUB_PRODUCT" && y.ProductQrCode == productQrCode)
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
                                   .Concat(from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "FINISHED_PRODUCT" && y.ProductQrCode == productQrCode)
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

        [HttpPost]
        public JsonResult GetUpdateLog(string ticketCode)
        {
            var msg = new JMessage();
            var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode == ticketCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }
        #endregion

        #region Detail
        [HttpPost]
        public JMessage InsertDetail([FromBody] ProdReceivedDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Check product is exist in Receive with conditions: ticket, product, unit, packing
                var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(obj.TicketCode));

                var check = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ProductCode.Equals(obj.ProductCode) && x.Unit.Equals(obj.Unit) && (x.SalePrice == obj.SalePrice) && x.PackType.Equals(obj.PackType)
                && (x.IsCustomized == false || (x.IsCustomized == true && x.ProdCustomJson == obj.ProdCustomJson)));

                var maxId = _context.ProdReceivedDetails.MaxBy(x => x.Id) != null ? _context.ProdReceivedDetails.MaxBy(x => x.Id).Id : 1;

                var packCode = "";
                var productQrCode = "";
                if (check == null)
                {
                    var receiveDetail = new ProdReceivedDetail
                    {
                        TicketCode = obj.TicketCode,
                        ProductCode = obj.ProductCode,
                        ProductQrCode = obj.ProductCode + "_" + maxId,
                        ProdCustomJson = obj.ProdCustomJson,
                        IsCustomized = obj.IsCustomized,
                        ProductType = obj.ProductType,
                        Quantity = obj.Quantity,
                        Unit = obj.Unit,
                        SalePrice = obj.SalePrice,
                        Currency = obj.Currency,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        QuantityIsSet = 0,
                        PackType = obj.PackType,
                        MarkWholeProduct = mark.Any() ? true : false,
                        PackCode = $"PACK_{obj.ProductCode + "_" + maxId}"
                    };

                    productQrCode = receiveDetail.ProductQrCode;

                    var listPack = new List<WarehouseRecordsPack>();

                    for (int i = 1; i <= obj.Quantity; i++)
                    {
                        packCode = receiveDetail.PackCode;

                        if (obj.Quantity > 1)
                            packCode = $"{receiveDetail.PackCode}_{i}";

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
                            ImportHeaderCode = obj.TicketCode,
                            //PackParent = GetParent(obj.ProductCode, obj.PackType, obj.TicketCode)
                        };

                        listPack.Add(pack);
                    }

                    foreach (var item in listPack)
                    {
                        var exitPack = _context.WarehouseRecordsPacks.Any(x => !x.IsDeleted && x.PackCode.Equals(item.PackCode));
                        if (!exitPack)
                            _context.WarehouseRecordsPacks.Add(item);
                    }

                    receiveDetail.PackCode = listPack.FirstOrDefault()?.PackCode;
                    _context.ProdReceivedDetails.Add(receiveDetail);
                }
                else
                {
                    productQrCode = check.ProductQrCode;
                    packCode = check.PackCode;
                    check.Quantity += obj.Quantity;
                    //check.SalePrice += obj.SalePrice;
                    _context.ProdReceivedDetails.Update(check);
                }
                var storeInventory = _context.ProductInStockOlds.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                if (storeInventory != null)
                {
                    storeInventory.Quantity = storeInventory.Quantity + obj.Quantity;
                    storeInventory.PackCode = packCode;
                    _context.ProductInStockOlds.Update(storeInventory);
                }
                else
                {
                    var storeInventoryObj = new ProductInStockOld
                    {
                        LotProductCode = obj.LotProductCode,
                        StoreCode = obj.StoreCode,
                        ProdCustomJson = obj.ProdCustomJson,
                        IsCustomized = obj.IsCustomized,
                        ProductCode = obj.ProductCode,
                        ProductType = obj.ProductType,
                        ProductQrCode = obj.ProductCode + "_" + maxId,
                        Quantity = obj.Quantity,
                        Unit = obj.Unit,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        MarkWholeProduct = mark.Any() ? true : false,
                        PackCode = packCode
                    };
                    _context.ProductInStockOlds.Add(storeInventoryObj);
                }
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        [HttpPost]
        public JsonResult UpdateDetail([FromBody] ProdReceivedDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var detail = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && x.ProductCode.Equals(obj.ProductCode) && x.Unit.Equals(obj.Unit) && x.PackType.Equals(obj.PackType));

                var maxId = _context.ProdReceivedDetails.MaxBy(x => x.Id) != null ? _context.ProdReceivedDetails.MaxBy(x => x.Id).Id : 1;
                if (detail != null)
                {
                    detail.Unit = obj.Unit;
                    detail.Quantity = obj.Quantity;
                    detail.SalePrice = obj.SalePrice;
                    detail.Currency = obj.Currency;
                    detail.PackCode = obj.PackCode;
                    _context.ProdReceivedDetails.Update(detail);

                    var storeInventory = _context.ProductInStockOlds.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(obj.ProductQrCode));
                    if (storeInventory != null)
                    {
                        storeInventory.PackCode = obj.PackCode;
                        _context.ProductInStockOlds.Update(storeInventory);
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

        [HttpPost]
        public JsonResult InsertDetailByLot([FromBody] MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Remove old product
                var oldProd = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)
                && !string.IsNullOrEmpty(x.LotProductCode));
                foreach (var item in oldProd)
                {
                    var prodInStock = _context.ProductInStockOlds.FirstOrDefault(x => x.ProductQrCode.Equals(item.ProductQrCode) && !x.IsDeleted);
                    prodInStock.Quantity = prodInStock.Quantity - item.Quantity;
                    _context.ProductInStockOlds.Update(prodInStock);

                    var mapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode)
                    && x.TicketImpCode.Equals(item.TicketCode));
                    if (mapping.Any())
                    {
                        foreach (var map in mapping)
                        {
                            map.IsDeleted = true;
                            var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == map.Id);
                            if (stockArrangePut != null)
                                _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }
                }
                _context.ProdReceivedDetails.RemoveRange(oldProd);

                if (obj.ListProduct.Any())
                {
                    var maxId = _context.ProdReceivedDetails.MaxBy(x => x.Id) != null ? _context.ProdReceivedDetails.MaxBy(x => x.Id).Id : 1;
                    foreach (var item in obj.ListProduct)
                    {
                        var receiveDetail = new ProdReceivedDetail
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
                            MarkWholeProduct = true
                        };
                        _context.ProdReceivedDetails.Add(receiveDetail);
                        var storeInventory = _context.ProductInStockOlds.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(receiveDetail.ProductQrCode));
                        if (storeInventory != null)
                        {
                            storeInventory.Quantity = storeInventory.Quantity + item.Quantity;
                            _context.ProductInStockOlds.Update(storeInventory);
                        }
                        else
                        {
                            var storeInventoryObj = new ProductInStockOld
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
                                MarkWholeProduct = true
                            };
                            _context.ProductInStockOlds.Add(storeInventoryObj);
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
                var listDetail = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode) && x.ProductCode.Equals(productCode))
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

        [HttpGet]
        public JsonResult GetProductDetail(string ticketCode)
        {
            var data = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(ticketCode))
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                        join c in _context.WarehouseRecordsPacks.Where(x => !x.IsDeleted) on a.PackCode equals c.PackCode into c1
                        from c in c1.DefaultIfEmpty()
                        join e in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals e.ProductCode
                        select new
                        {
                            a.Id,
                            a.TicketCode,
                            b.ProductName,
                            b.ProductCode,
                            a.Quantity,
                            a.QuantityIsSet,
                            Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Unit).ValueSet,
                            a.SalePrice,
                            CurrencyCode = a.Currency,
                            Currency = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Currency).ValueSet,
                            QrCode = CommonUtil.GeneratorQRCode(a.ProductCode),
                            ProductQRCode = a.ProductQrCode,
                            Remain = a.Quantity - a.QuantityIsSet,
                            PackType = !string.IsNullOrEmpty(a.PackType) ? a.PackType : "",
                            PackName = c != null ? c.PackName : "Chưa đóng gói",
                            PackCode = a.PackCode,
                            sProductQrCode = CommonUtil.GenerateQRCode("SP:" + a.ProductQrCode + "_P:" + a.TicketCode + "_SL:" + a.Quantity),
                            UnitCode = a.Unit,
                            IsCustomized = a.IsCustomized,
                            ProdCustomJson = a.ProdCustomJson,
                            IdProduct = e.Id
                        }).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeleteDetail(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    var checkExport = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode));
                    if (checkExport.Any())
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"];
                        return Json(msg);
                    }

                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProdReceivedDetails.Update(data);

                    var checkPack = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PackCode) && x.PackCode.Equals(data.PackCode));
                    if (checkPack.Count() == 1)
                    {
                        var pack = _context.WarehouseRecordsPacks.FirstOrDefault(x => !x.IsDeleted && x.PackCode.Equals(data.PackCode));
                        if (pack != null)
                        {
                            pack.IsDeleted = true;
                            _context.WarehouseRecordsPacks.Update(pack);
                        }
                    }

                    var prodInStock = _context.ProductInStockOlds.FirstOrDefault(x => x.ProductQrCode.Equals(data.ProductQrCode) && !x.IsDeleted);
                    prodInStock.Quantity = prodInStock.Quantity - data.Quantity;
                    _context.ProductInStockOlds.Update(prodInStock);

                    //Delete mapping
                    var mapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode)
                    && x.TicketImpCode.Equals(data.TicketCode));
                    if (mapping.Any())
                    {
                        foreach (var item in mapping)
                        {
                            item.IsDeleted = true;
                            var stockArrangePut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == item.Id);
                            if (stockArrangePut != null)
                                _context.StockArrangePutEntrys.Remove(stockArrangePut);
                        }
                    }

                    _context.SaveChanges();
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
            return Json(msg);
        }

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

        #endregion

        #region Order product Vatco
        public object OrderProductVatco([FromBody] ProductEntityMapping data)
        {
            var msg = new JMessage();
            try
            {
                var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted
                && x.ProductQrCode.Equals(data.ProductQrCode) && x.MappingCode.Equals(data.MappingCode));

                //var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == data.RackCode);
                //var productInRackCount = getProductInRack(data.RackCode);

                if (prodMapping == null)
                {
                    //Thêm vào bảng Product_Entity_Mapping
                    var mapping = new ProductEntityMapping
                    {
                        //WHS_Code = data.WHS_Code,
                        WHS_Code = data.WHS_Code,
                        //FloorCode = data.FloorCode,
                        //LineCode = data.LineCode,
                        //RackCode = data.RackCode,
                        //RackPosition = data.RackPosition,
                        MappingCode = data.MappingCode,
                        ProductQrCode = data.ProductQrCode,
                        ProductCode = data.ProductCode,
                        Quantity = data.Quantity,
                        Unit = data.UnitCode,
                        Ordering = data.Ordering,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        TicketImpCode = data.TicketCode
                    };
                    _context.ProductEntityMappings.Add(mapping);

                    //Thêm dữ liệu bảng bút toán xếp kho
                    var mark = _context.ProdReceivedAttrValues.Where(x => !x.IsDeleted && x.TicketImpCode.Equals(data.TicketCode));

                    var mapId = _context.ProductEntityMappings.MaxBy(x => x.Id);
                    var idMapping = mapId != null ? (mapId.Id + 1) : 1;
                    var stockArrangePut = new StockArrangePutEntry
                    {
                        MapId = idMapping,
                        ProdCode = data.ProductQrCode,
                        Quantity = data.Quantity,
                        MarkWholeProduct = mark.Any() ? true : false
                    };
                    _context.StockArrangePutEntrys.Add(stockArrangePut);

                    //Map vị trí trong kho
                    var mapStock = new MapStockProdIn
                    {
                        MapId = idMapping,
                        ProdCode = data.ProductQrCode,
                        Quantity = data.Quantity,
                        Unit = data.UnitCode
                    };
                    _context.MapStockProdIns.Add(mapStock);

                    //Update quantity is set in detail
                    var prodDetail = _context.ProdReceivedDetails.FirstOrDefault(x => x.ProductQrCode.Equals(data.ProductQrCode)
                    && x.TicketCode.Equals(data.TicketCode) && !x.IsDeleted);
                    if (prodDetail != null)
                    {
                        if (data.Quantity != null) prodDetail.QuantityIsSet += data.Quantity.Value;
                        _context.ProdReceivedDetails.Update(prodDetail);
                    }

                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                }
                else
                {
                    prodMapping.Quantity = prodMapping.Quantity + data.Quantity;
                    prodMapping.UpdatedBy = User.Identity.Name;
                    prodMapping.UpdatedTime = DateTime.Now;

                    var stockArrangePut = new StockArrangePutEntry
                    {
                        MapId = prodMapping.Id,
                        ProdCode = data.ProductQrCode,
                        Quantity = data.Quantity
                    };
                    _context.StockArrangePutEntrys.Add(stockArrangePut);

                    var mapStock = _context.MapStockProdIns.FirstOrDefault(x => x.MapId == prodMapping.Id);
                    if (mapStock != null)
                    {
                        mapStock.Quantity += data.Quantity;

                        _context.ProductEntityMappings.Update(prodMapping);
                        _context.MapStockProdIns.Update(mapStock);
                    }

                    //Update quantity is set in detail
                    var prodDetail = _context.ProdReceivedDetails.FirstOrDefault(x => x.ProductCode.Equals(data.ProductCode)
                    && x.TicketCode.Equals(data.TicketCode) && !x.IsDeleted);
                    if (prodDetail != null)
                    {
                        if (data.Quantity != null) prodDetail.QuantityIsSet += data.Quantity.Value;
                        _context.ProdReceivedDetails.Update(prodDetail);
                    }

                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetPositionProductVatco(string product, string ticketCode)
        {
            var data = (from a in _context.ProductEntityMappings.Where(x => !x.IsDeleted)
                //join b in _context.EDMSLines on a.LineCode equals b.LineCode
                //join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                where a.ProductQrCode.Equals(product) && a.TicketImpCode.Equals(ticketCode)
                select new
                {
                    a.Id,
                    a.ProductQrCode,
                    a.Remain,
                    a.Size,
                    Ordered = a.Size,
                    a.TicketImpCode,
                    PositionInStore = a.MappingCode,
                    //a.RackCode,
                    //a.RackPosition,
                    a.CreatedBy,
                    a.CreatedTime,
                    a.UpdatedBy,
                    a.UpdatedTime
                }).OrderBy(x => x.CreatedTime).ThenBy(p => p.PositionInStore);
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeleteOrderProduct(int id)
        {
            var msg = new JMessage();
            var data = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
            if (data != null)
            {
                var checkExport = from a in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode))
                                  join b in _context.MapStockProdIns.Where(x => !x.IsDeleted) on a.MapId equals b.MapId
                                  select new
                                  {
                                      a.ProductQrCode,
                                      b.MapId
                                  };
                if (checkExport.Any())
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MIS_MSG_PROD_EXP_CANNOT_DEL"];
                    return Json(msg);
                }

                var prodDetail = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketImpCode)
                && data.ProductQrCode.Equals(x.ProductQrCode));
                if (prodDetail != null)
                {
                    prodDetail.QuantityIsSet = Convert.ToInt32(prodDetail.QuantityIsSet - data.Quantity);
                    _context.ProdReceivedDetails.Update(prodDetail);

                    var stockArrangPut = _context.StockArrangePutEntrys.FirstOrDefault(x => x.MapId == id);
                    if (stockArrangPut != null)
                    {
                        _context.StockArrangePutEntrys.Remove(stockArrangPut);
                    }
                    var mapStockIn = _context.MapStockProdIns.FirstOrDefault(x => x.MapId == id);
                    if (mapStockIn != null)
                        _context.MapStockProdIns.Remove(mapStockIn);
                    //Delete
                    data.IsDeleted = true;
                    _context.ProductEntityMappings.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    msg.Object = prodDetail.Quantity - prodDetail.QuantityIsSet;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_VALIDATE_NOT_FOUND_DATA"];
                }

            }
            return Json(msg);
        }

        #endregion

        #region Attr value product
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

        [HttpPost]
        public JsonResult GetItemAttrValue(int id)
        {
            var data = _context.ProdReceivedAttrValues.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetInfoProduct(string product, string ticket, bool loadDefault)
        {
            var attrValue = _context.ProdReceivedAttrValues.Where(x => x.ProdCode.Equals(product) && !x.IsDeleted && x.TicketImpCode.Equals(ticket));
            var data = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.Equals(product))
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.UnitWeight equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        select new
                        {
                            Packing = loadDefault ? a.Packing : (attrValue.Any() ? attrValue.FirstOrDefault(x => x.Code == "PACK_ATTR") != null ? attrValue.FirstOrDefault(x => x.Code == "PACK_ATTR").Value : a.Packing : a.Packing),
                            a.High,
                            a.Wide,
                            a.Long,
                            a.Weight,
                            UnitWeight = c2 != null ? c2.ValueSet : "",
                        }).FirstOrDefault();
            return Json(data);

        }
        #endregion

        #region Get thông tin chung
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

        [HttpPost]
        public object GetListStore()
        {
            var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true).OrderBy(x => x.WHS_Name).Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
            //var rs = _context.WarehouseZoneStructs.Where(x => !x.IsDeleted && x.ZoneType == "WAREHOUSE").OrderBy(x => x.ZoneName).Select(x => new { Code = x.ZoneCode, Name = x.ZoneName });
            return rs;
        }
        //Đối với phiếu nhập kho thì khách hàng chuyển thành Nhà cung cấp (hiện vẫn giữ tên field & API theo khách hàng, chỉ thay đổi Bảng gọi ra)
        [HttpPost]
        public object GetListCustomer()
        {
            var rs = _context.Suppliers.Where(x => !x.IsDeleted).OrderBy(x => x.SupName).Select(x => new { Code = x.SupCode, Name = x.SupName });
            return rs;
        }
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
        [HttpPost]
        public object GetListReason()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListCurrency()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListProductRelative()
        {
            var rs = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted)
                     join b in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on new { a.TicketCode, a.ProductQrCode } equals new { b.TicketCode, b.ProductQrCode }
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
        [HttpPost]
        public object GetListProduct()
        {
            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
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
                          ImpType = d2.ValueSet
                      };

            return rs1;
        }

        public object GetListProductByStore(string storeCode)
        {


            var rs = from a in _context.ProductInStockOlds.Where(x => x.ProductType == "FINISHED_PRODUCT")

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
        //[HttpPost]
        //public object GetListRackCode(string productQrCode)
        //{
        //    var rs = from a in _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
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
        //[HttpPost]
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
        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListPaymentStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_PAYMENT_STATUS").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        //Hướng mới - nhập kho từ lô sản phẩm được đặt hàng mua về (PO_Supplier)
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
        [HttpGet]
        public object GetListProductInStore(string rackCode)
        {
            try
            {
                var prodMapping = _context.ProductEntityMappingLogs.AsParallel().Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode)).ToList();
                var query2 = (from a in prodMapping
                              join b in _context.ProductInStockOlds.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a.ProductQrCode equals b.ProductQrCode
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
                              join b in _context.ProductInStockOlds.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.ProductQrCode equals b.ProductQrCode
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
        [HttpGet]
        public string GetQuantityEmptyInRack(string rackCode)
        {
            try
            {
                //var rs = _context.WarehouseZoneStructs.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ZoneCode.Equals(rackCode));
                var rs = _context.EDMSRacks.AsParallel().FirstOrDefault(x => x.RackCode.Equals(rackCode));
                if (rs != null)
                {
                    var prodMapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode));
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
        [HttpGet]
        public object CheckProductInStore(string productQrCode)
        {
            try
            {
                var inStore = false;
                var obj = _context.ProductInStockOlds.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                if (obj != null)
                    inStore = true;

                return Json(inStore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
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
        [HttpGet]
        public object CheckQuantityMaxProductInStore(string productQrCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.ProductInStockOlds.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                if (obj != null)
                {
                    var prodList = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).ToList();
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
        [HttpGet]
        public object GetPositionProduct(string productQrCode, string productCoil)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = (from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode))
                                join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
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

                //var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
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

                //var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
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
        [HttpPost]
        public object OrderingProductInStore([FromBody] ProductEntityMapping data)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                if (data.ListCoil.Count > 0)
                {
                    //var prodPackageInfo = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode)).ToList();
                    //if (prodPackageInfo.Count>0)
                    //{
                    //    foreach (var item in prodPackageInfo)
                    //    {
                    //        item.PositionInStore = null;
                    //        item.RackCode = null;
                    //        item.RackPosition = null;
                    //    }

                    //    _context.ProdPackageReceiveds.UpdateRange(prodPackageInfo);
                    //    _context.SaveChanges();
                    //}

                    var listCoilProcess = new List<ProdPackageInfoCustom>();

                    foreach (var item in data.ListCoil)
                    {
                        var check = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.CoilCode) && string.IsNullOrEmpty(x.RackCode));
                        if (check != null)
                            listCoilProcess.Add(item);
                    }

                    if (listCoilProcess.Count > 0)
                    {
                        foreach (var productCoil in listCoilProcess)
                        {
                            var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productCoil.ProductQrCode) && x.RackCode.Equals(productCoil.RackCode));
                            var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == productCoil.RackCode);
                            var productInRackCount = getProductInRack(productCoil.RackCode);
                            if (rack != null)
                            {
                                //if (rack.CNT_Box >= (productInRackCount + productCoil.Size))
                                //{

                                //}
                                //else
                                //{
                                //    msg.Error = true;
                                //    msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NON_SORT_AMOUNT_PRODUCT"));
                                //}

                                //Cho phép xếp 1 sản phẩm xếp nhiều lần ở 1 vị trị không cộng dồn thêm vào bảng log
                                if (!string.IsNullOrEmpty(productCoil.LineCode))
                                {
                                    var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(productCoil.LineCode));
                                    if (line != null)
                                    {
                                        data.LineCode = line.LineCode;

                                        var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                                        if (floor != null)
                                        {
                                            data.FloorCode = floor.FloorCode;

                                            var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                                            if (wareHouse != null)
                                                data.WHS_Code = wareHouse.WHS_Code;
                                        }
                                    }


                                    //Cập nhật lại vị trí trong bảng ProdPackageInfos
                                    var prodPackageInfoUpdate = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(productCoil.CoilCode) && x.ProductQrCode.Equals(productCoil.ProductQrCode));
                                    if (prodPackageInfoUpdate != null)
                                    {
                                        prodPackageInfoUpdate.PositionInStore = productCoil.PositionInStore;
                                        prodPackageInfoUpdate.RackCode = productCoil.RackCode;
                                        prodPackageInfoUpdate.RackPosition = productCoil.RackPosition;
                                        prodPackageInfoUpdate.UpdatedBy = User.Identity.Name;
                                        prodPackageInfoUpdate.UpdatedTime = DateTime.Now;
                                        _context.ProdPackageReceiveds.Update(prodPackageInfoUpdate);
                                        _context.SaveChanges();
                                    }
                                }
                                //Trường hợp chưa được xếp trong bảng mapping
                                if (prodMapping == null)
                                {
                                    if (!string.IsNullOrEmpty(productCoil.LineCode))
                                    {
                                        var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(productCoil.LineCode));
                                        if (line != null)
                                        {
                                            data.LineCode = line.LineCode;

                                            var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                                            if (floor != null)
                                            {
                                                data.FloorCode = floor.FloorCode;

                                                var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                                                if (wareHouse != null)
                                                    data.WHS_Code = wareHouse.WHS_Code;
                                            }
                                        }

                                        //Thêm vào bảng Product_Entity_Mapping
                                        var mapping = new ProductEntityMapping
                                        {
                                            WHS_Code = data.WHS_Code,
                                            FloorCode = data.FloorCode,
                                            LineCode = productCoil.LineCode,
                                            RackCode = productCoil.RackCode,
                                            RackPosition = productCoil.RackPosition,
                                            ProductQrCode = productCoil.ProductQrCode,
                                            Quantity = productCoil.Size,
                                            Unit = data.Unit,
                                            Ordering = data.Ordering,
                                            CreatedBy = User.Identity.Name,
                                            CreatedTime = DateTime.Now,
                                        };

                                        _context.ProductEntityMappings.Add(mapping);
                                        _context.SaveChanges();

                                        //Cập nhật số lượng đã xếp kho trong bảng detail
                                        var materialStoreImpGoodsDetails = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                                        materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet + (decimal)mapping.Quantity;
                                        _context.ProdReceivedDetails.Update(materialStoreImpGoodsDetails);
                                        _context.SaveChanges();

                                        // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_SUCCESS"));
                                        msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                                        //return Json(msg);
                                    }
                                }
                                else
                                {
                                    prodMapping.Quantity = prodMapping.Quantity + productCoil.Size;
                                    prodMapping.UpdatedBy = User.Identity.Name;
                                    prodMapping.UpdatedTime = DateTime.Now;
                                    _context.ProductEntityMappings.Update(prodMapping);

                                    //Cập nhật số lượng đã xếp kho trong bảng detail
                                    var materialStoreImpGoodsDetails = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                                    materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet + (decimal)productCoil.Size;
                                    _context.ProdReceivedDetails.Update(materialStoreImpGoodsDetails);

                                    _context.SaveChanges();
                                    // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_SUCCESS"));
                                    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                                    //return Json(msg);
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NON_SORT_RACK_EXITS"));
                                msg.Title = _stringLocalizer["MIS_MSG_NON_SORT_RACK_EXITS"];
                            }
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không có sản phẩm nào được xếp";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không có sản phẩm nào để xếp";
                }
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

        [HttpGet]
        private decimal getProductInRack(string RackCode)
        {
            decimal count = 0;
            var query = from a in _context.EDMSRacks.Where(x => x.RackCode == RackCode)
                        join d in _context.ProductEntityMappings.Where(x => x.IsDeleted == false) on a.RackCode equals d.RackCode
                        select new
                        {
                            a.RackCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }
        [HttpGet]
        private string GetPositionInfo(string rackCode)
        {
            var positionInfo = string.Empty;
            var whsName = string.Empty;
            var floorName = string.Empty;
            var lineName = string.Empty;
            var rackName = string.Empty;
            var mapping = _context.ProductEntityMappings.FirstOrDefault(x => x.RackCode == rackCode);
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
        [HttpGet]
        public object CheckProductInExpTicket(string productQrCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                if (!string.IsNullOrEmpty(productQrCode))
                {
                    var query = _context.ProdDeliveryDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                    if (query != null)
                    {
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"));
                        var query2 = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
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
                    var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => x.ProductQrCode.Equals(check.ProductQrCode) && x.RackCode.Equals(check.RackCode));
                    if (prodMapping != null)
                    {
                        prodMapping.Quantity = prodMapping.Quantity > check.Size ? prodMapping.Quantity - check.Size : 0;
                        _context.ProductEntityMappings.Update(prodMapping);
                        _context.SaveChanges();

                        //Cập nhật số lượng đã xếp kho trong bảng detail
                        var materialStoreImpGoodsDetails = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodMapping.ProductQrCode);
                        materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet > (decimal)check.Size ? materialStoreImpGoodsDetails.QuantityIsSet - (decimal)check.Size : 0;
                        _context.ProdReceivedDetails.Update(materialStoreImpGoodsDetails);
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
        [HttpGet]
        public ActionResult ExportExcelProduct(string ticketCode)
        {
            var impHeader = _context.ProdReceivedHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
            {
                x.LotProductCode,
                x.TicketCode,
                x.Title,
                x.StoreCode,
                x.CusCode,
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

            var listProduct = (from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && y.ProductType == "SUB_PRODUCT")
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
                               .Concat(from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && y.ProductType == "FINISHED_PRODUCT")
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
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }
        #endregion

        #region Pack Record to Packing
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
            public bool? IsCustomized { get; set; }
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
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_commonSettingController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
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

        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.TicketCode.Equals(code)).Select(x => new
            {
                x.Status
            });
            return data;
        }

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

        [HttpPost]
        public object GetItemHeader(int id)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
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

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode.Equals(code) && !x.IsDeleted);
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

        #region Import Word
        public class ModelImportWord
        {
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string UnitName { get; set; }
            public decimal Quantity { get; set; }
            public decimal Cost { get; set; }
            public string TicketCode { get; set; }
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

        [HttpPost]
        public JsonResult InsertFromWord([FromBody] List<ModelImportWord> data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                var firstItem = data.FirstOrDefault();
                if (firstItem != null)
                {
                    var impHeader = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == firstItem.TicketCode);
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
                        var unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.ValueSet == item.UnitName && x.Group == "UNIT")?.CodeSet ?? "";
                        var receiveDetail = new ProdReceivedDetail
                        {
                            TicketCode = item.TicketCode,
                            ProductCode = item.ProductCode,
                            Quantity = item.Quantity,
                            Unit = unit,
                            SalePrice = item.Cost
                        };
                        msg = InsertDetail(receiveDetail);
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
        #endregion
    }
}
