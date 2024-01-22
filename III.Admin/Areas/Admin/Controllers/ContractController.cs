using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Syncfusion.Drawing;
using Syncfusion.XlsIO;
namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class ContractController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<ContractController> _stringLocalizer;
        private readonly IStringLocalizer<CustomerController> _customerLocalizer;
        private readonly IStringLocalizer<SupplierController> _supplierLocalizer;
        private readonly IStringLocalizer<ProjectController> _projectController;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<SendRequestImportProductController> _sendRequestImportProductController;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<AttributeManagerController> _attrManagerController;
        private readonly IStringLocalizer<MaterialProductController> _materialProductController;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IStringLocalizer<FundAccEntryController> _funcAccEntryLocalizer;
        private readonly IFCMPushNotification _notification;
        private readonly IRepositoryService _repositoryService;
        private readonly ICardJobService _cardService;
        public ContractController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ContractController> stringLocalizer,
            IStringLocalizer<CustomerController> customerLocalizer,
            IStringLocalizer<SupplierController> supplierLocalizer,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<ProjectController> projectController,
            IStringLocalizer<SendRequestImportProductController> sendRequestImportProductController,
            IStringLocalizer<CardJobController> cardJobController, IFCMPushNotification notification,
            IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService, ICardJobService cardService,
            IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<AttributeManagerController> attrManagerController,
            IStringLocalizer<MaterialProductController> materialProductController,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController,
            IStringLocalizer<WorkflowActivityController> workflowActivityController,
            IStringLocalizer<FundAccEntryController> functionAccEntryLocalizer)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _customerLocalizer = customerLocalizer;
            _supplierLocalizer = supplierLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _projectController = projectController;
            _cardJobController = cardJobController;
            _sendRequestImportProductController = sendRequestImportProductController;
            _sharedResources = sharedResources;
            _notification = notification;
            _repositoryService = repositoryService;
            _cardService = cardService;
            _fileObjectShareController = fileObjectShareController;
            _attrManagerController = attrManagerController;
            _materialProductController = materialProductController;
            _edmsRepositoryController = edmsRepositoryController;
            _workflowActivityController = workflowActivityController;
            _funcAccEntryLocalizer = functionAccEntryLocalizer;
        }

        [Breadcrumb("ViewData.CrumbContract", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContractHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbContractHome"] = _sharedResources["COM_CRUMB_CONTRACT_HOME"];
            ViewData["CrumbContract"] = _sharedResources["COM_CRUMB_CONTRACT"];
            return View();
        }

        #region ComboboxValue
        [HttpPost]
        public JsonResult GetListCommon()
        {
            var list = _context.CommonSettings.OrderBy(x => x.SettingID).Where(x => x.IsDeleted == false).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, x.Group, Icon = x.Logo }).AsNoTracking();
            return Json(list);
        }

        [HttpPost]
        public JsonResult GetStatusPOCus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractStatusPoCus)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public object GetContract()
        {
            var data = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted)
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals d.CusCode
                        select new { a.ContractNo, Code = a.ContractCode, Name = a.Title });
            return data;
            //return _context.PoSaleHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.ContractHeaderID).Select(x => new { x.ContractNo, Code = x.ContractCode, Name = x.Title });
        }
        #endregion

        #region Contract Header
        public class ProductSearch
        {
            public int ProductID { get; set; }
            public string HeaderCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string PathImg { get; set; }
            public decimal? Cost { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public string AttributeCode { get; set; }
            public string AttributeName { get; set; }
            public string ProductType { get; set; }
            public decimal? PricePerM { get; set; }
            public decimal? PricePerM2 { get; set; }
            public decimal? PriceCostCatelogue { get; set; }
            public decimal? PriceCostAirline { get; set; }
            public decimal? PriceCostSea { get; set; }
            public decimal? PriceRetailBuild { get; set; }
            public decimal? PriceRetailBuildAirline { get; set; }
            public decimal? PriceRetailBuildSea { get; set; }
            public decimal? PriceRetailNoBuild { get; set; }
            public decimal? PriceRetailNoBuildAirline { get; set; }
            public decimal? PriceRetailNoBuildSea { get; set; }
            public int Tax { get; set; }
            public string Origin { get; set; }
            public string Type { get; set; }
            public string Value { get; set; }
        }
        public class jTableView
        {
            public int id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string cusCode { get; set; }
            public string cusName { get; set; }
            public string contractNo { get; set; }
            public string status { get; set; }
            public string icon { get; set; }
            public string duration { get; set; }
            public DateTime? contractDate { get; set; }
            public decimal? budget { get; set; }
            public decimal? budgetExcludeTax { get; set; }
            public string currency { get; set; }
            public string signer { get; set; }
            public DateTime? sEndDate { get; set; }
            public decimal? ExchangeRate { get; set; }
            public DateTime? CreatedTime { get; set; }
            public decimal Percent { get; set; }
            public string ExpirationDate { get; set; }
            public string RenewalDate { get; set; }
            public string PaymentNextDate { get; set; }
            public bool IsViewed { get; set; }

        }
        [HttpPost]
        public object JTable([FromBody] JTableModelContract jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.PoSaleHeaders
                         join d in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals d.CusCode
                         join b in _context.CommonSettings on a.StatusObject equals b.CodeSet into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings on a.Currency equals c.CodeSet into c1
                         from c2 in c1.DefaultIfEmpty()
                         join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName
                         where ((a.IsDeleted == false) &&
                                ((fromDate == null) || (a.ContractDate.HasValue && a.ContractDate.Value.Date >= fromDate)) &&
                                ((toDate == null) || (a.ContractDate.HasValue && a.ContractDate.Value.Date <= toDate)) &&
                                (a.ContractCode.ToLower().Contains(jTablePara.ContractCode.ToLower()) || a.Title.ToLower().Contains(jTablePara.ContractCode.ToLower())) &&
                                (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode)) &&
                                (string.IsNullOrEmpty(jTablePara.BranchId) || f.BranchId.Equals(jTablePara.BranchId)) &&
                                (string.IsNullOrEmpty(jTablePara.Status) || a.StatusObject.Contains(jTablePara.Status)) &&
                                (string.IsNullOrEmpty(jTablePara.BudgetF) || a.Budget >= Convert.ToDecimal(jTablePara.BudgetF)) &&
                                (string.IsNullOrEmpty(jTablePara.BudgetT) || a.Budget <= Convert.ToDecimal(jTablePara.BudgetT)) &&
                                (string.IsNullOrEmpty(jTablePara.Currency) || a.Currency.Contains(jTablePara.Currency)))
                                 //Điều kiện phân quyền dữ liệu
                                 && (session.IsAllData
                                 || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                 || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select new jTableView
                         {
                             id = a.ContractHeaderID,
                             Code = a.ContractCode,
                             Name = a.Title,
                             cusCode = a.CusCode,
                             cusName = d.CusName,
                             contractNo = a.ContractNo,
                             status = b2 != null ? b2.ValueSet : "",
                             icon = b2.Logo,
                             duration = a.Duration,
                             contractDate = a.ContractDate,
                             budget = a.Budget,
                             budgetExcludeTax = a.BudgetExcludeTax,
                             currency = c2.ValueSet,
                             signer = a.Signer,
                             sEndDate = a.EndDate,
                             ExchangeRate = a.ExchangeRate,
                             CreatedTime = a.CreatedTime,
                             Percent = 0,
                             IsViewed = string.IsNullOrEmpty(a.ListUserView) ? false : a.ListUserView.Contains(ESEIM.AppContext.UserId) ? true : false,
                         });

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).OrderByDescending(x => x.CreatedTime).ThenBy(x => x.Name).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            for (var i = 0; i < data.Count(); i++)
            {
                var tuple = _cardService.GetPercentJCObject("CONTRACT", data[i].Code, session.IsAllData, session.IsBranch, session.IsUser, session.UserName, session.ListUserOfBranch != null ? string.Join(",", session.ListUserOfBranch) : "", session.UserId, !string.IsNullOrEmpty(session.DepartmentCode) ? session.DepartmentCode : "");
                data[i].Percent = tuple.Item1;
                data[i].ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(data[i].Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(data[i].Code)).AttrValue : "";
                data[i].RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)).AttrValue : "";
                data[i].PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)).AttrValue : "";
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "Code", "status", "Percent", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate", "CreatedTime", "ExpirationDate", "RenewalDate", "PaymentNextDate", "IsViewed");
            return Json(jdata);
        }

        [HttpPost]
        public object JtreeSigner()
        {
            var data = _context.PoSaleHeaders.DistinctBy(a => a.Signer).Select(x => x.Signer).ToList();
            return data;
        }

        [HttpPost]
        public async Task<JsonResult> InsertContract([FromBody] ContractHeaderModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                using (await userLock.LockAsync(obj.ContractCode.ToLower()))
                {
                    var checkExist = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.ToLower() == obj.ContractCode.ToLower() && !x.IsDeleted);
                    if (checkExist == null)
                    {
                        DateTime? ctdate = !string.IsNullOrEmpty(obj.ContractDate) ? DateTime.ParseExact(obj.ContractDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        DateTime? effective = !string.IsNullOrEmpty(obj.sEffectiveDate) ? DateTime.ParseExact(obj.sEffectiveDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        DateTime? end = !string.IsNullOrEmpty(obj.sEndDate) ? DateTime.ParseExact(obj.sEndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        DateTime? acceptanceTime = !string.IsNullOrEmpty(obj.AcceptanceTime) ? DateTime.ParseExact(obj.AcceptanceTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                        var statusObjLog = new JsonLog
                        {
                            Code = obj.StatusObject,
                            Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            CreatedTime = DateTime.Now,
                        };

                        var listStatusObjLog = new List<JsonLog>();
                        listStatusObjLog.Add(statusObjLog);

                        var data = new PoSaleHeader()
                        {
                            ContractCode = obj.ContractCode,
                            ContractDate = ctdate,
                            ContractNo = obj.ContractNo,
                            ContractType = obj.ContractType,
                            Currency = obj.Currency,
                            CusCode = obj.CusCode,
                            PrjCode = obj.PrjCode,
                            Describe = obj.Describe,
                            Duration = obj.Duration,
                            LocationHardCopy = obj.LocationHardCopy,
                            MainService = obj.MainService,
                            Signer = obj.Signer,
                            Tags = obj.Tags,
                            Title = obj.Title,
                            Version = 0,  //Fix khi thêm mới version = 0
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            EffectiveDate = effective,
                            RealBudget = obj.RealBudget,
                            Budget = obj.Budget,
                            BudgetExcludeTax = obj.BudgetExcludeTax,
                            TaxAmount = obj.TaxAmount ?? 0,
                            EndDate = end,
                            ExchangeRate = obj.ExchangeRate,
                            AcceptanceTime = acceptanceTime,
                            Maintenance = obj.Maintenance,
                            Discount = obj.Discount ?? 0,
                            Commission = obj.Commission ?? 0,
                            ListUserView = ESEIM.AppContext.UserId,
                            Status = "",
                            WorkflowCat = obj.WorkflowCat,
                            StatusObject = obj.StatusObject,
                            ListStatusObjectLog = listStatusObjLog,
                        };

                        data.LastBudget = data.RealBudget * (1 - data.Discount / 100 - data.Commission / 100);

                        if (data.EffectiveDate != null && data.Duration != null)
                        {
                            data.EstimateTime = data.EffectiveDate.Value.AddDays(Int32.Parse(data.Duration));
                        }
                        _context.PoSaleHeaders.Add(data);
                        await _context.SaveChangesAsync();
                        await InsertPOCusTracking(data);
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CONTRACT_LBL_CONTRACT"]);//"Thêm hợp đồng thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CONTRACT_CURD_LBL_CONTRACT_CODE"]); //"Mã hợp đồng đã tồn tại";
                    }
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_LBL_CONTRACT"]); //"Có lỗi xảy ra khi thêm hợp đồng!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == contractCode);
                var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.IsDeleted == false && x.ContractHeaderID == id);
                contract.ListUserView += ";" + ESEIM.AppContext.UserId;
                _context.SaveChanges();

                var session = HttpContext.Session;
                session.SetInt32("IdObject", contract.ContractHeaderID);

                var data = _context.PoSaleHeaders.Where(x => x.ContractCode == contract.ContractCode && x.IsDeleted == false).Select(x => new PoSaleHeader
                {
                    ContractHeaderID = x.ContractHeaderID,
                    ContractCode = x.ContractCode,
                    Title = x.Title,
                    ContractType = x.ContractType,
                    ContractDate = x.ContractDate,
                    ContractNo = x.ContractNo,
                    Duration = x.Duration,
                    Version = x.Version,
                    Status = x.Status,
                    Signer = x.Signer,
                    MainService = x.MainService,
                    Budget = x.Budget,
                    Currency = x.Currency,
                    LocationHardCopy = x.LocationHardCopy,
                    Describe = x.Describe,
                    CusCode = x.CusCode,
                    ContractRelative = x.ContractRelative,
                    Tags = x.Tags,
                    CreatedBy = x.CreatedBy,
                    CreatedTime = x.CreatedTime,
                    UpdatedBy = x.UpdatedBy,
                    UpdatedTime = x.UpdatedTime,
                    DeletedBy = x.DeletedBy,
                    DeletedTime = x.DeletedTime,
                    IsDeleted = x.IsDeleted,
                    EffectiveDate = x.EffectiveDate,
                    EndDate = x.EndDate,
                    RealBudget = x.RealBudget,
                    Confirm = x.Confirm,
                    EstimateTime = x.EstimateTime,
                    //LogProductDetail = x.LogProductDetail,
                    PrjCode = x.PrjCode,
                    BudgetExcludeTax = x.BudgetExcludeTax,
                    TaxAmount = x.TaxAmount,
                    ExchangeRate = x.ExchangeRate,
                    AcceptanceTime = x.AcceptanceTime,
                    Maintenance = x.Maintenance,
                    Discount = x.Discount,
                    Commission = x.Commission,
                    LastBudget = x.LastBudget,
                    IsChangeProduct = x.IsChangeProduct,
                    WorkflowCat = x.WorkflowCat,
                    StatusObject = x.StatusObject,
                    ListStatusObjectLog = x.ListStatusObjectLog
                    //LogData = x.LogData,
                }).MaxBy(x => x.Version);

                data.Confirm = GetConfirmText(data.Confirm);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpGet]
        public async Task<JsonResult> GetInfoFromPrj(string prjCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var ctCode = FuncGetContractCode("");
                var chkContractHeader = _context.PoSaleHeaders.Any(x => !x.IsDeleted && x.ContractCode == ctCode);
                if (chkContractHeader)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_PLEASE_RELOAD_THE_PROJECT"]);
                }
                else
                {
                    //Get thông tin mã hợp đồng & project
                    var data = _context.Projects.Where(x => x.ProjectCode == prjCode && x.FlagDeleted == false).Select(x => new
                    {
                        CusCode = x.CustomerCode,
                        EffectiveDate = x.StartTime,
                        EndDate = x.EndTime,
                        Duration = x.EndTime.Subtract(x.StartTime).TotalDays.ToString(),
                        BudgetExcludeTax = (decimal?)x.Budget,
                        ContractCode = ctCode,
                    }).FirstOrDefault();

                    //Tạo detail sản phẩm hợp đồng
                    var projectProducts = _context.ProjectProducts.Where(x => x.ProjectCode == prjCode).Select(x => new PoSaleProductDetail
                    {
                        ContractCode = ctCode,
                        ProductCode = x.ProductCode,
                        Quantity = x.Quantity != null ? (decimal)x.Quantity : 0,
                        Unit = x.Unit,
                        Cost = x.Cost,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Tax = x.Tax,
                        Commission = x.Commission != null ? (double)x.Commission : 0,
                        CustomFee = x.CustomFee != null ? (double)x.CustomFee : 0,
                        Discount = x.Discount != null ? (double)x.Discount : 0,
                        PriceType = x.PriceType,
                        ProductType = x.ProductType,
                        Note = x.Note,
                        QuantityNeedExport = x.Quantity != null ? (decimal)x.Quantity : 0,
                    }).ToList();
                    if (projectProducts.Any())
                    {
                        _context.PoSaleProductDetails.AddRange(projectProducts);
                    }

                    //Tạo detail dịch vụ hợp đồng
                    var projectService = _context.ProjectServices.Where(x => x.ProjectCode == prjCode).Select(x => new ContractServiceDetail
                    {
                        ServiceCode = x.ServiceCode,
                        Quantity = x.Quantity != null ? (decimal)x.Quantity : 0,
                        Unit = x.Unit,
                        ContractCode = ctCode,
                        Note = x.Note,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    }).ToList();
                    if (projectService.Any())
                    {
                        _context.ContractServiceDetails.AddRange(projectService);
                    }

                    //Tạo hearder hợp đồng
                    PoSaleHeader contractNew = new PoSaleHeader();
                    contractNew.ContractCode = ctCode;
                    contractNew.PrjCode = prjCode;
                    contractNew.CusCode = data.CusCode;
                    contractNew.EffectiveDate = data.EffectiveDate;
                    contractNew.EndDate = data.EndDate;
                    contractNew.EstimateTime = data.EndDate;
                    contractNew.Duration = data.Duration;
                    contractNew.BudgetExcludeTax = data.BudgetExcludeTax;
                    contractNew.Budget = projectProducts.Sum(x => x.Quantity * x.Cost);
                    contractNew.RealBudget = projectProducts.Sum(x => x.Quantity * x.Cost * (decimal)(1 + x.Tax / 100));
                    contractNew.LastBudget = contractNew.RealBudget;

                    _context.PoSaleHeaders.Add(contractNew);

                    await _context.SaveChangesAsync();


                    var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == ctCode);

                    msg.Object = new
                    {
                        CusCode = data.CusCode,
                        EffectiveDate = data.EffectiveDate,
                        EndDate = data.EndDate,
                        Duration = data.Duration,
                        BudgetExcludeTax = data.BudgetExcludeTax,
                        Budget = contractNew.Budget,
                        RealBudget = contractNew.RealBudget,
                        LastBudget = contractNew.LastBudget,
                        ContractCode = data.ContractCode,
                        Id = contract.ContractHeaderID,
                    };
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_DOWNLOAD_PROJECT_DATA_SUCCESSFULLY"]);

                    //Thêm dữ liệu bảng cảnh báo
                    foreach (var obj in projectProducts)
                    {
                        string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@ContractCode", "@EstimateDate" };
                        object[] val = new object[] { obj.ProductCode, obj.Quantity, obj.ProductType, obj.ContractCode, contractNew.EstimateTime.Value.Date };
                        _repositoryService.CallProc("PR_INSERT_PO_SALE_PRODUCT_DETAIL", param, val);

                        int? count = 0;
                        count = _context.ForecastProductInStocks.Where(x => x.ProductCode == obj.ProductCode && x.ProductType == obj.ProductType && x.ForecastDate.Value.Date == contract.EstimateTime.Value.Date).Sum(x => x.CntForecast);

                        int count1 = (count == null ? 0 : count.Value);
                        if (obj.Quantity + count1 > 0)
                        {
                            var success = await InsertChangeProductLog(contract, obj.ProductCode, obj.ProductType, count1, contract.EstimateTime.Value.Date);
                        }
                        else
                        {
                            var success = await InsertChangeProductLog(contract, obj.ProductCode, obj.ProductType, -1 * obj.Quantity, contract.EstimateTime.Value.Date);
                        }
                        if (count < 0)
                        {
                            //msg.Error = true;
                            msg.ID = count1;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_DOWNLOAD_PROJECT_DATA_SUCCESSFULLY"]) + ". <br/> " + String.Format(_stringLocalizer["CONTRACT_CURD_MSG_WARNING"]) + " <br/> - " + String.Format(_stringLocalizer["CONTRACT_CURD_MSG_PLEASE_ORDER"]);
                        }
                        await UpdateRequestImpDetail(obj.ContractCode);
                        //var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                        //if (contractHeader != null)
                        //{
                        //    //Sửa tổng giá trị hợp đồng
                        //    contractHeader.Budget = contractHeader.Budget + (obj.Cost * obj.Quantity);
                        //    contractHeader.RealBudget = contractHeader.RealBudget + (obj.Cost * obj.Quantity) * (1 + (decimal)obj.Tax / 100);
                        //    contractHeader.LastBudget = contractHeader.RealBudget * (1 - contractHeader.Discount / 100 - contractHeader.Commission / 100);
                        //    //Sửa trạng thái IsChangeProduct nếu hợp đồng đã được duyệt
                        //    if (contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REQUEST" && contract.Status != "CONTRACT_STATUS_PO_CUS_FACCO_REJECTED" && contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REJECTED")
                        //    {
                        //        contract.IsChangeProduct = true;
                        //    }
                        //    _context.PoSaleHeaders.Update(contractHeader);
                        //    msg.Object = new
                        //    {
                        //        contractHeader.Budget,
                        //        contractHeader.RealBudget,
                        //        TaxDetail = contractHeader.RealBudget - contractHeader.Budget,
                        //        LastBudget = contractHeader.LastBudget
                        //    };
                        //    _context.SaveChanges();
                        //    //Thêm vào Tracking
                        //    InsertPOCusTracking(contractHeader);
                        //}
                        //Thêm vào Tracking
                        await InsertPOCusTracking(contract);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetCustomerFromPrj(string prjCode)
        {
            var query = from a in _context.ProjectCusSups.Where(x => x.ProjectCode == prjCode && x.ObjType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
                        join b in _context.Customerss on a.ObjCode equals b.CusCode
                        where b.IsDeleted == false
                        select new
                        {
                            Code = b.CusCode,
                            Name = b.CusName,
                            a.IsMain
                        };
            return query;
        }

        [HttpGet]
        public object GetCusName(string cusCode)
        {
            var query = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == cusCode);
            if (query != null)
            {
                return query.CusName;
            }
            else
            {
                return "";
            }
        }

        [HttpGet]
        public JsonResult GetListSupString(string contractCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                             join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && x.PoCode == contractCode) on a.ReqCode equals b.ReqCode
                             //join c1 in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals c1.CodeSet into c2
                             //from c in c2.DefaultIfEmpty()
                             join d1 in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals d1.SupCode into d2
                             from d in d2.DefaultIfEmpty()
                             join e1 in _context.PoBuyerDetails.Where(x => !x.IsDeleted) on new { a.ReqCode, a.ProductCode, a.ProductType } equals new { e1.ReqCode, e1.ProductCode, e1.ProductType } into e2
                             from e in e2.DefaultIfEmpty()
                             select new
                             {
                                 SupName = d != null ? d.SupName : "",
                             });
                var listSup = query.Select(x => x.SupName).Distinct().ToList();


                //var listSup = _context.VHisImpProducts.Where(x => x.PoCusCode == contractCode).Select(x => x.SupName).Distinct().ToList();
                var listSupString = string.Join("; ", listSup);
                msg.Object = listSupString;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateContract([FromBody] ContractHeaderModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                DateTime? ctdate = !string.IsNullOrEmpty(obj.ContractDate) ? DateTime.ParseExact(obj.ContractDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? effective = !string.IsNullOrEmpty(obj.sEffectiveDate) ? DateTime.ParseExact(obj.sEffectiveDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? end = !string.IsNullOrEmpty(obj.sEndDate) ? DateTime.ParseExact(obj.sEndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? acceptanceTime = !string.IsNullOrEmpty(obj.AcceptanceTime) ? DateTime.ParseExact(obj.AcceptanceTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                int dem = 0;
                var contractCode = "";
                foreach (var c in obj.ContractCode)
                {
                    if (c == '_')
                    {
                        dem++;
                    }
                }
                if (dem > 1)
                {
                    var idx = obj.ContractCode.LastIndexOf("_");
                    contractCode = obj.ContractCode.Substring(0, idx);
                }
                else
                {
                    contractCode = obj.ContractCode;
                }
                var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == contractCode && x.IsDeleted == false);
                var versionBase = data.Version;
                var contractCodeBase = data.ContractCode;

                //Nếu tạo phụ lục => đưa hợp đồng hiện tại vào các bảng history
                if (data.Version != obj.Version)
                {
                    PoSaleHeader contractHis = new PoSaleHeader();
                    contractHis.IsDeleted = data.IsDeleted;
                    contractHis.IsChangeProduct = data.IsChangeProduct;
                    contractHis.AcceptanceTime = data.AcceptanceTime;
                    contractHis.ContractDate = data.ContractDate;
                    contractHis.CreatedTime = data.CreatedTime;
                    contractHis.DeletedTime = data.DeletedTime;
                    contractHis.EffectiveDate = data.EffectiveDate;
                    contractHis.EndDate = data.EndDate;
                    contractHis.EstimateTime = data.EstimateTime;
                    contractHis.UpdatedTime = data.UpdatedTime;
                    contractHis.Budget = data.Budget;
                    contractHis.BudgetExcludeTax = data.BudgetExcludeTax;
                    contractHis.Commission = data.Commission;
                    contractHis.Discount = data.Discount;
                    contractHis.ExchangeRate = data.ExchangeRate;
                    contractHis.LastBudget = data.LastBudget;
                    contractHis.RealBudget = data.RealBudget;
                    contractHis.TaxAmount = data.TaxAmount;
                    contractHis.Maintenance = data.Maintenance;
                    contractHis.Confirm = data.Confirm;
                    contractHis.ContractCode = data.ContractCode;
                    contractHis.ContractNo = data.ContractNo;

                    contractHis.ContractRelative = data.ContractRelative;

                    contractHis.ContractType = data.ContractType;
                    contractHis.CreatedBy = data.CreatedBy;
                    contractHis.Currency = data.Currency;
                    contractHis.CusCode = data.CusCode;
                    contractHis.DeletedBy = data.DeletedBy;
                    contractHis.Describe = data.Describe;
                    contractHis.Duration = data.Duration;
                    contractHis.LocationHardCopy = data.LocationHardCopy;
                    contractHis.LogData = data.LogData;
                    contractHis.LogProductDetail = data.LogProductDetail;
                    contractHis.MainService = data.MainService;
                    contractHis.PrjCode = data.PrjCode;
                    //contractHis.sEffectiveDate = data.sEffectiveDate;
                    //contractHis.sEndDate = data.sEndDate;
                    contractHis.Signer = data.Signer;
                    contractHis.Status = data.Status;
                    contractHis.Tags = data.Tags;
                    contractHis.Title = data.Title;
                    contractHis.UpdatedBy = data.UpdatedBy;
                    contractHis.Version = data.Version;
                    //contractHis.ContractHeaderID = data.ContractHeaderID;

                    _context.PoSaleHeaders.Add(contractHis);

                    //Tạo các bản ghi tăng version cho các bảng chi tiết
                    var contractProductHis = _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode && x.ContractVersion == data.Version)
                                                     .Select(x => new PoSaleProductDetail
                                                     {
                                                         Commission = x.Commission,
                                                         Cost = x.Cost,
                                                         CreatedBy = x.CreatedBy,
                                                         CreatedTime = x.CreatedTime,
                                                         CustomFee = x.CustomFee,
                                                         DeletedBy = x.DeletedBy,
                                                         DeletedTime = x.DeletedTime,
                                                         Discount = x.Discount,
                                                         //Id = x.Id,
                                                         IsDeleted = x.IsDeleted,
                                                         Note = x.Note,
                                                         PriceType = x.PriceType,
                                                         ProductCode = x.ProductCode,
                                                         ProductName = x.ProductName,
                                                         ProductType = x.ProductType,
                                                         Quantity = x.Quantity,
                                                         QuantityNeedExport = x.QuantityNeedExport,
                                                         Tax = x.Tax,
                                                         Unit = x.Unit,
                                                         UpdatedBy = x.UpdatedBy,
                                                         UpdatedTime = x.UpdatedTime,
                                                         ContractCode = obj.ContractCode,
                                                         ContractVersion = obj.Version,
                                                     })
                                                    .ToList();
                    _context.PoSaleProductDetails.AddRange(contractProductHis);

                    var contractServiceHis = _context.ContractServiceDetails.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode && x.ContractVersion == data.Version)
                                                     .Select(x => new ContractServiceDetail
                                                     {
                                                         Commission = x.Commission,
                                                         Cost = x.Cost,
                                                         CreatedBy = x.CreatedBy,
                                                         CreatedTime = x.CreatedTime,
                                                         Currency = x.Currency,
                                                         CustomFee = x.CustomFee,
                                                         DeletedBy = x.DeletedBy,
                                                         DeletedTime = x.DeletedTime,
                                                         Discount = x.Discount,
                                                         //Id = x.Id,
                                                         IsDeleted = x.IsDeleted,
                                                         Note = x.Note,
                                                         Quantity = x.Quantity,
                                                         ServiceCode = x.ServiceCode,
                                                         ServiceName = x.ServiceName,
                                                         Tax = x.Tax,
                                                         Unit = x.Unit,
                                                         UpdatedBy = x.UpdatedBy,
                                                         UpdatedTime = x.UpdatedTime,
                                                         ContractCode = obj.ContractCode,
                                                         ContractVersion = obj.Version,
                                                     })
                                                    .ToList();
                    _context.ContractServiceDetails.AddRange(contractServiceHis);

                    var contractAttributeHis = _context.ContractAttributes.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode && x.ContractVersion == data.Version)
                                                     .Select(x => new ContractAttribute
                                                     {
                                                         AttrCode = x.AttrCode,
                                                         AttrGroup = x.AttrGroup,
                                                         AttrValue = x.AttrValue,
                                                         //ContractAttributeID = x.ContractAttributeID,
                                                         CreatedBy = x.CreatedBy,
                                                         CreatedTime = x.CreatedTime,
                                                         DeletedBy = x.DeletedBy,
                                                         DeletedTime = x.DeletedTime,
                                                         IsDeleted = x.IsDeleted,
                                                         Note = x.Note,
                                                         UpdatedBy = x.UpdatedBy,
                                                         UpdatedTime = x.UpdatedTime,
                                                         ContractCode = obj.ContractCode,
                                                         ContractVersion = obj.Version,
                                                     })
                                                    .ToList();
                    _context.ContractAttributes.AddRange(contractAttributeHis);

                    var contractSchedulePayHis = _context.ContractSchedulePays.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode && x.ContractVersion == data.Version)
                                                     .Select(x => new ContractSchedulePay
                                                     {
                                                         Condition = x.Condition,
                                                         CreatedBy = x.CreatedBy,
                                                         CreatedTime = x.CreatedTime,
                                                         DeletedBy = x.DeletedBy,
                                                         DeletedTime = x.DeletedTime,
                                                         EstimateTime = x.EstimateTime,
                                                         //Id = x.Id,
                                                         IsDeleted = x.IsDeleted,
                                                         Money = x.Money,
                                                         Note = x.Note,
                                                         PayTimes = x.PayTimes,
                                                         Percentage = x.Percentage,
                                                         Quantity = x.Quantity,
                                                         UpdatedBy = x.UpdatedBy,
                                                         UpdatedTime = x.UpdatedTime,
                                                         ContractCode = obj.ContractCode,
                                                         ContractVersion = obj.Version,
                                                     })
                                                    .ToList();
                    _context.ContractSchedulePays.AddRange(contractSchedulePayHis);
                }

                DateTime? oldEtimateTime = data.EstimateTime;
                data.ContractCode = obj.ContractCode;
                data.ContractDate = ctdate;
                data.ContractNo = obj.ContractNo;
                data.ContractType = obj.ContractType;
                data.Currency = obj.Currency;
                data.CusCode = obj.CusCode;
                data.PrjCode = obj.PrjCode;
                data.Describe = obj.Describe;
                data.Duration = obj.Duration;
                data.LocationHardCopy = obj.LocationHardCopy;
                data.MainService = obj.MainService;
                data.Signer = obj.Signer;
                //data.Status = obj.Status;
                data.Tags = obj.Tags;
                data.Title = obj.Title;
                data.Version = obj.Version;
                if (obj.IsLoadProject == true)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now.Date;
                }
                else
                {
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now.Date;
                }
                data.EffectiveDate = effective;
                data.EndDate = end;
                data.RealBudget = obj.RealBudget;
                data.Budget = obj.Budget;
                data.BudgetExcludeTax = obj.BudgetExcludeTax;
                data.ExchangeRate = obj.ExchangeRate;
                data.AcceptanceTime = acceptanceTime;
                data.Maintenance = obj.Maintenance;
                data.TaxAmount = obj.TaxAmount ?? 0;
                data.Discount = obj.Discount ?? 0;
                data.Commission = obj.Commission ?? 0;
                data.LastBudget = data.RealBudget * (1 - data.Discount / 100 - data.Commission / 100);
                data.ListUserView = ";" + ESEIM.AppContext.UserId;
                data.StatusObject = obj.StatusObject;

                if (!string.IsNullOrEmpty(obj.StatusObject))
                {
                    var statusObjLog = new JsonLog
                    {
                        Code = obj.StatusObject,
                        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                        CreatedTime = DateTime.Now,
                    };

                    if (data.ListStatusObjectLog.Count > 0)
                    {
                        if (data.ListStatusObjectLog.LastOrDefault()?.Code != obj.StatusObject)
                            data.ListStatusObjectLog.Add(statusObjLog);
                    }
                    else
                    {
                        data.ListStatusObjectLog.Add(statusObjLog);
                    }
                }

                //if (!string.IsNullOrEmpty(obj.Confirm))
                //{
                //    if (string.IsNullOrEmpty(data.Confirm))
                //    {
                //        data.Confirm = InsertConfirmText(obj.Confirm);
                //    }
                //    else if (GetConfirmText(data.Confirm).ToLower() != obj.Confirm.ToLower())
                //    {
                //        data.Confirm = UpdateConfirmText(data.Confirm, obj.Confirm);
                //    }
                //}
                if (data.EffectiveDate != null && data.Duration != null)
                {
                    data.EstimateTime = data.EffectiveDate.Value.AddDays(Int32.Parse(data.Duration));
                }
                if (oldEtimateTime.Value.Date != data.EstimateTime.Value.Date)
                {
                    string[] param = new string[] { "@ContractCode", "@OldEstimateDate", "@EstimateDate" };
                    object[] val = new object[] { data.ContractCode, oldEtimateTime.Value.Date, data.EstimateTime.Value.Date };
                    _repositoryService.CallProc("PR_UPDATE_PO_SALE_HEADER", param, val);
                    var list = (from a in _context.PoSaleProductDetails.Where(x => x.IsDeleted == false && x.ContractCode == data.ContractCode)
                                join b in _context.ForecastProductInStocks on a.ProductCode equals b.ProductCode
                                where a.ProductType == b.ProductType && b.ForecastDate.Value.Date == data.EstimateTime.Value.Date
                                select new Compare
                                {
                                    ProductCode = a.ProductCode,
                                    ProductType = a.ProductType,
                                    Quantity = a.Quantity,
                                    CntForecast = (b.CntForecast == null ? 0 : b.CntForecast.Value)
                                }).ToList();
                    string log = UpdateLog(data.LogProductDetail, list);
                    data.LogProductDetail = log;
                }

                //Work flow update status
                //var lstStatus = new List<JsonStatus>();
                var session = HttpContext.GetSessionUser();
                //if (!string.IsNullOrEmpty(data.Status))
                //{
                //    lstStatus = JsonConvert.DeserializeObject<List<JsonStatus>>(data.Status);
                //}
                //if (obj.Status != "INITIAL_BEGIN")
                //{
                //    var status = new JsonStatus
                //    {
                //        StatusCode = obj.Status,
                //        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName ?? "",
                //        StatusName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Status)).ValueSet ?? "",
                //        CreatedTime = DateTime.Now,
                //    };

                //    lstStatus.Add(status);
                //    data.Status = JsonConvert.SerializeObject(lstStatus);

                //}
                data.JsonData = CommonUtil.JsonData(data, obj, data.JsonData, session.FullName);

                _context.PoSaleHeaders.Update(data);
                await _context.SaveChangesAsync();

                //Nếu tạo phụ lục => thêm relative
                if (versionBase != obj.Version)
                {
                    RelativeModel objRelative = new RelativeModel();
                    objRelative.ContractCode = obj.ContractCode;
                    objRelative.ContractRelative = new ContractRelativeModel();
                    objRelative.ContractRelative.ContractCode = contractCodeBase;
                    objRelative.ContractRelative.Relative = "CONTRACT_RELATIVE_APPENDIX";
                    await InsertRelative(objRelative);
                }

                await InsertPOCusTracking(data);
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CONTRACT_LBL_CONTRACT"]); //"Cập nhật hợp đồng thành công!";

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["CONTRACT_LBL_CONTRACT"]); //"Có lỗi khi cập nhập hợp đồng !:" + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetUpdateLog(string ContractCode)
        {
            //var data = _context.PoCusUpdateTrackings.Where(x => x.PoCusCode == ContractCode && x.IsDeleted == false).OrderByDescending(x => x.Id).ToList();
            //foreach (var item in data)
            //{
            //    var sUpdateContent = item.UpdateContent;
            //    if (!string.IsNullOrEmpty(sUpdateContent))
            //    {
            //        try
            //        {
            //            var updateContent = JsonConvert.DeserializeObject<UpdateContent>(sUpdateContent);
            //            var header = updateContent.Header;
            //            var detail = updateContent.Detail;
            //        }
            //        catch (Exception ex) { }
            //    }
            //}
            //JMessage msg = new JMessage();
            //msg.Object = data;
            //return Json(msg);
            var msg = new JMessage();
            var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == ContractCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContract(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractHeaderID == id);
                if (data != null)
                {
                    //Check hợp đồng đã được đưa vào Yêu cầu đặt hàng
                    var chkUsingReqImp = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted && x.PoCode == data.ContractCode);
                    if (chkUsingReqImp)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_FAILED_TO_DELETE_CONTRACT"]);
                        return Json(msg);
                    }

                    //Check hợp đồng đã được xuất kho (trả hàng)
                    var chkUsingImpTicket = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.LotProductCode == data.ContractCode);
                    if (chkUsingImpTicket)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_NOT_DELETE_CONTRACT"]); //"Không xóa được hợp đồng đã tạo phiếu xuất kho.";
                        return Json(msg);
                    }

                    data.DeletedTime = DateTime.Now.Date;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.IsDeleted = true;
                    _context.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_LBL_CONTRACT"]); //"Xóa thành công";

                    var list = _context.PoSaleProductDetails.Where(x => x.IsDeleted == false && x.ContractCode == data.ContractCode).ToList();
                    foreach (var item in list)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                        object[] val = new object[] { item.ProductCode, item.Quantity, 0, item.ProductType, data.EstimateTime.Value.Date };
                        _repositoryService.CallProc("PR_UPDATE_CONTRACT_DETAIL", param, val);
                    }

                    //Xóa các bảng chi tiết
                    list.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.PoSaleProductDetails.UpdateRange(list);

                    var listContact = _context.ContractDetails.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode).ToList();
                    listContact.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ContractDetails.UpdateRange(listContact);

                    var listContractMemberTags = _context.ContractMemberTags.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode).ToList();
                    listContractMemberTags.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ContractMemberTags.UpdateRange(listContractMemberTags);

                    var listContactNotes = _context.ContactNotes.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode).ToList();
                    listContactNotes.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ContactNotes.UpdateRange(listContactNotes);

                    var listEDMSRepoCatFiles = _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract) && x.ObjectCode == data.ContractCode).ToList();
                    _context.EDMSRepoCatFiles.RemoveRange(listEDMSRepoCatFiles);

                    var listContractAttributes = _context.ContractAttributes.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode).ToList();
                    listContractAttributes.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ContractAttributes.UpdateRange(listContractAttributes);

                    var listContractServiceDetails = _context.ContractServiceDetails.Where(x => !x.IsDeleted && x.ContractCode == data.ContractCode).ToList();
                    listContractServiceDetails.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.ContractServiceDetails.UpdateRange(listContractServiceDetails);

                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_NOT_FIND_CONTRACT"]); //"Không tìm thấy hợp đồng, bạn vui lòng làm mới trang.";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_LBL_CONTRACT"]); //"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetCustomers()
        {

            var data = _context.Customerss.Where(y => y.IsDeleted == false).OrderByDescending(x => x.CusID).Select(x => new { Code = x.CusCode, Name = x.CusName, Role = x.Role, x.Address, x.ZipCode, x.MobilePhone, x.PersonInCharge, x.Email }).ToList();
            return Json(data);
        }

        [HttpPost]
        public object GetProjects()
        {
            var data = _context.Projects.Where(x => !x.FlagDeleted).OrderByDescending(x => x.Id).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).ToList();
            return Json(data);
        }

        [HttpPost]
        public object GetListProjectAdd(string prjCode)
        {
            if (string.IsNullOrEmpty(prjCode))
            {
                //var data = (from a in _context.Projects.Where(x => !x.FlagDeleted)
                //            join b1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.ProjectCode equals b1.PrjCode into b2
                //            from b in b2.DefaultIfEmpty()
                //            where b == null
                //            orderby a.Id descending
                //            select new
                //            {
                //                Code = a.ProjectCode,
                //                Name = a.ProjectTitle
                //            }).ToList();
                var data = _context.Projects.Where(x => !x.FlagDeleted).Select(x => new
                {
                    Code = x.ProjectCode,
                    Name = x.ProjectTitle
                }).ToList();
                return Json(data);
            }
            else
            {
                var data = (from a in _context.Projects.Where(x => !x.FlagDeleted)
                            join b1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.ProjectCode equals b1.PrjCode into b2
                            from b in b2.DefaultIfEmpty()
                            where b == null || (b != null && b.PrjCode == prjCode)
                            orderby a.Id descending
                            select new
                            {
                                Code = a.ProjectCode,
                                Name = a.ProjectTitle
                            }).ToList();
                return Json(data);
            }
        }

        [HttpPost]
        public object InsertConfirmText(string contractCode, string confirm)
        {
            var listConfirm = new List<ConfirmText>();
            var json = string.Empty;
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(contractCode) && !x.IsDeleted);
                if (obj != null)
                {
                    try
                    {
                        listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                    }
                    catch (Exception)
                    {

                    }
                    var confirmObj = new ConfirmText
                    {
                        Id = Guid.NewGuid().ToString(),
                        Body = confirm,
                        CreateTime = DateTime.Now.ToString("dd/MM/yyyy hh:mm"),
                        UserName = User.Identity.Name
                    };
                    listConfirm.Add(confirmObj);

                    json = JsonConvert.SerializeObject(listConfirm);
                    obj.Confirm = json;
                    _context.PoSaleHeaders.Update(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_NOT_SUCCESS"]); //"Thêm không thành công";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
        }

        [HttpPost]
        public object UpdateConfirmTextById(string contractCode, string id, string confirm)
        {
            var json = string.Empty;
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(contractCode) && !x.IsDeleted);
                if (obj != null)
                {
                    if (!string.IsNullOrEmpty(obj.Confirm))
                    {
                        var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                        if (listConfirm.Count > 0)
                        {
                            foreach (var item in listConfirm)
                            {
                                if (item.Id.Equals(id))
                                    item.Body = confirm;
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoSaleHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_UPDATE_SUCCESS"]); //"Cập nhật thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_UPDATE_NOT_SUCCESS"]); //"Cập nhật không thành công";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
        }

        [HttpPost]
        public object DeleteConfirmTextById(string contractCode, string id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(contractCode) && !x.IsDeleted);
                if (obj != null)
                {
                    if (!string.IsNullOrEmpty(obj.Confirm))
                    {
                        var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                        if (listConfirm.Count > 0)
                        {
                            var itemDelete = listConfirm.FirstOrDefault(x => x.Id == id);
                            if (itemDelete != null)
                            {
                                listConfirm.Remove(itemDelete);
                                obj.Confirm = JsonConvert.SerializeObject(listConfirm);
                                _context.PoSaleHeaders.Update(obj);
                                _context.SaveChanges();
                                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], "");
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                            }
                        }
                    }
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
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public string GetConfirmText(string confirmInDB)
        {
            var data = string.Empty;
            try
            {
                if (!string.IsNullOrEmpty(confirmInDB))
                {
                    var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(confirmInDB);
                    if (listConfirm.Count > 0)
                    {
                        var obj = listConfirm.LastOrDefault(x => x.UserName.Equals(User.Identity.Name));
                        if (obj != null)
                            data = obj.Body;
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return data;
        }

        [HttpPost]
        public object GetListConfirmText(string ContractCode)
        {
            var data = new List<ConfirmText>();
            try
            {
                var obj = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(ContractCode) && !x.IsDeleted);
                if (obj != null)
                {
                    if (!string.IsNullOrEmpty(obj.Confirm))
                    {
                        var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                        if (listConfirm.Count > 0)
                        {
                            data = listConfirm.Where(x => x.UserName.Equals(User.Identity.Name)).ToList();
                            data.ForEach(x => x.UserName = _context.Users.FirstOrDefault(p => p.UserName.Equals(x.UserName))?.GivenName);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(data);
        }

        [HttpPost]
        public string UpdateConfirmText(string confirmInDB, string confirm)
        {
            var json = string.Empty;
            try
            {
                if (!string.IsNullOrEmpty(confirmInDB))
                {
                    var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(confirmInDB);
                    var confirmText = new ConfirmText
                    {
                        Id = Guid.NewGuid().ToString(),
                        Body = confirm,
                        CreateTime = DateTime.Now.ToString("dd/MM/yyyy hh:mm"),
                        UserName = User.Identity.Name
                    };

                    listConfirm.Add(confirmText);

                    json = JsonConvert.SerializeObject(listConfirm);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return json;
        }

        [HttpPost]
        public JsonResult GetProductCost()
        {
            var prices = FunctionProductPrice();
            var products = FunctionProducts();
            var query = from a in products
                        join b in prices on a.Code equals b.ProductCode into b2
                        from b in b2.DefaultIfEmpty()
                        select new ProductPrices
                        {
                            HeaderCode = a.HeaderCode,
                            Code = a.Code,
                            Name = a.Name,
                            Unit = a.Unit,
                            UnitName = a.UnitName,
                            AttributeCode = a.AttributeCode,
                            AttributeName = a.AttributeName,
                            ProductType = a.ProductType,
                            PricePerM = a.PricePerM,
                            PriceCostCatelogue = (b != null ? b.PriceCostCatelogue : (a.PriceCostCatelogue)),
                            PriceCostAirline = (b != null ? b.PriceCostAirline : (a.PriceCostAirline)),
                            PriceCostSea = (b != null ? b.PriceCostSea : (a.PriceCostSea)),
                            PriceRetailBuild = (b != null ? b.PriceRetailBuild : (a.PriceRetailBuild)),
                            PriceRetailBuildAirline = (b != null ? b.PriceRetailBuildAirline : (a.PriceRetailBuildAirline)),
                            PriceRetailBuildSea = (b != null ? b.PriceRetailBuildSea : (a.PriceRetailBuildSea)),
                            PriceRetailNoBuild = (b != null ? b.PriceRetailNoBuild : (a.PriceRetailNoBuild)),
                            PriceRetailNoBuildAirline = (b != null ? b.PriceRetailNoBuildAirline : (a.PriceRetailNoBuildAirline)),
                            PriceRetailNoBuildSea = (b != null ? b.PriceRetailNoBuildSea : (a.PriceRetailNoBuildSea)),
                            Tax = (b != null ? b.Tax : (a.Tax)),
                            Pack = a.Pack
                        };
            return Json(query.ToList());
        }

        [NonAction]
        public IEnumerable<ProductPrice> FunctionProductPrice()
        {
            var currentTime = DateTime.Now;
            var query = from a in _context.ProductCostHeaders.Where(x => x.IsDeleted == false)
                        join b in _context.ProductCostDetails.Where(x => x.IsDeleted == false)
                        on a.HeaderCode equals b.HeaderCode
                        where
                        a.EffectiveDate != null && a.ExpiryDate != null &&
                        a.EffectiveDate.Date <= currentTime.Date && currentTime.Date <= a.ExpiryDate.Date
                        select new ProductPrice
                        {
                            HeaderCode = a.HeaderCode,
                            ProductCode = b.ProductCode,
                            PriceCostCatelogue = b.PriceCostCatelogue,
                            PriceCostAirline = b.PriceCostAirline,
                            PriceCostSea = b.PriceCostSea,

                            PriceRetailBuild = b.PriceRetailBuild,
                            PriceRetailBuildAirline = b.PriceRetailBuildAirline,
                            PriceRetailBuildSea = b.PriceRetailBuildSea,

                            PriceRetailNoBuild = b.PriceRetailNoBuild,
                            PriceRetailNoBuildAirline = b.PriceRetailNoBuildAirline,
                            PriceRetailNoBuildSea = b.PriceRetailNoBuildSea,
                            Tax = b.Tax
                        };
            return query;

        }

        [NonAction]
        public IEnumerable<ProductPrices> FunctionProducts()
        {
            var currentTime = DateTime.Now;
            //var rs = from b in _context.SubProducts.Where(x => !x.IsDeleted)
            //         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
            //         from c2 in c1.DefaultIfEmpty()
            //         orderby b.ProductCode
            //         select new ProductPrices
            //         {
            //             Code = b.ProductQrCode,
            //             Name = b.AttributeName,
            //             Unit = b.Unit,
            //             UnitName = c2.ValueSet,
            //             AttributeCode = b.AttributeCode,
            //             AttributeName = b.AttributeName,
            //             ProductType = "SUB_PRODUCT",
            //             //PricePerM = b.Value.Split("*", StringSplitOptions.None)[2],
            //             PriceCostCatelogue = b.PriceCostCatelogue,
            //             PriceCostAirline = b.PriceCostAirline,
            //             PriceCostSea = b.PriceCostSea,
            //             PriceRetailBuild = b.PriceRetailBuild,
            //             PriceRetailBuildAirline = b.PriceRetailBuildAirline,
            //             PriceRetailBuildSea = b.PriceRetailBuildSea,
            //             PriceRetailNoBuild = b.PriceRetailNoBuild,
            //             PriceRetailNoBuildAirline = b.PriceRetailNoBuildAirline,
            //             PriceRetailNoBuildSea = b.PriceRetailNoBuildSea,
            //             Tax = 0
            //         };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted)
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new ProductPrices
                      {
                          Code = b.ProductCode,
                          Name = string.Format("{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = b.TypeCode,
                          PricePerM = b.PricePerM != null ? b.PricePerM.ToString() : null,
                          PriceCostCatelogue = b.PriceCostCatelogue,
                          PriceCostAirline = b.PriceCostAirline,
                          PriceCostSea = b.PriceCostSea,
                          PriceRetailBuild = b.PriceRetailBuild,
                          PriceRetailBuildAirline = b.PriceRetailBuildAirline,
                          PriceRetailBuildSea = b.PriceRetailBuildSea,
                          PriceRetailNoBuild = b.PriceRetailNoBuild,
                          PriceRetailNoBuildAirline = b.PriceRetailNoBuildAirline,
                          PriceRetailNoBuildSea = b.PriceRetailNoBuildSea,
                          Tax = 0,
                          Pack = b.Packing
                      };

            //var query = rs1.Concat(rs);
            return rs1;

        }

        [HttpPost]
        public object GetProductUnit()
        {

            var data = _context.CommonSettings
                .Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;


        }

        [HttpPost]
        public object JTableProduct([FromBody] JTableProductSearch param)
        {
            int intBeginFor = (param.CurrentPage - 1) * param.Length;

            var queryPoSup = from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                             join b1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b1.PoSupCode into b2
                             from b in b2.DefaultIfEmpty()
                             join c1 in _context.CommonSettings on b.Status equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             select new
                             {
                                 b.Status,
                                 StatusName = c.ValueSet,
                                 a.ReqCode,
                                 a.ProductCode,
                                 a.ProductType
                             };

            var queryReq = from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted)
                           join b1 in _context.RequestImpProductDetails.Where(x => !x.IsDeleted) on a.ReqCode equals b1.ReqCode into b2
                           from b in b2.DefaultIfEmpty()
                           select new
                           {
                               a.PoCode,
                               a.ReqCode,
                               b.ProductCode,
                               b.ProductType
                           };

            var queryJoin = from a in queryReq
                            join b1 in queryPoSup on new { a.ReqCode, a.ProductCode, a.ProductType } equals new { b1.ReqCode, b1.ProductCode, b1.ProductType } into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                a.PoCode,
                                a.ProductCode,
                                a.ProductType,
                                b.StatusName
                            };

            var queryDistinct = queryJoin.DistinctBy(p => new { p.PoCode, p.ProductCode, p.ProductType }).Select(x => new
            {
                PoCode = x.PoCode,
                ProductCode = x.ProductCode,
                ProductType = x.ProductType,
                StatusName = x.StatusName
            });

            var query = from a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ContractCode) && x.ContractCode.Equals(param.ContractCode))
                        join b1 in _context.CommonSettings on a.Unit equals b1.CodeSet into b2
                        from b in b2.DefaultIfEmpty()
                        join c1 in queryJoin on new { a.ContractCode, a.ProductCode, a.ProductType } equals new { ContractCode = c1.PoCode, c1.ProductCode, c1.ProductType } into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            a.Quantity,
                            UnitPrice = a.Cost,
                            a.Unit,
                            a.Tax,
                            a.Note,
                            sUnit = (b != null ? b.ValueSet : ""),
                            PriceType = a.PriceType,
                            a.ProductType,
                            StatusName = c != null && !string.IsNullOrEmpty(c.StatusName) ? c.StatusName : "Chưa đặt hàng",
                        };

            //var query = from a in _context.PoSaleProductDetails
            //            join b in _context.CommonSettings on a.Unit equals b.CodeSet into b2
            //            from b in b2.DefaultIfEmpty()
            //            where a.IsDeleted == false && !string.IsNullOrEmpty(a.ContractCode)
            //            && a.ContractCode.Equals(param.ContractCode)
            //            select new
            //            {
            //                Id = a.Id,
            //                ProductCode = a.ProductCode,
            //                a.Quantity,
            //                UnitPrice = a.Cost,
            //                a.Unit,
            //                a.Tax,
            //                a.Note,
            //                sUnit = (b != null ? b.ValueSet : ""),
            //                PriceType = a.PriceType,
            //                a.ProductType
            //            };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(param.QueryOrderBy).Skip(intBeginFor).Take(param.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, param.Draw, count, "Id", "ProductCode", "Quantity", "UnitPrice", "Unit", "Tax", "Note", "sUnit", "PriceType", "ProductType", "StatusName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetProductInContract(string contractCode)
        {
            var queryPoSup = from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                             join b1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b1.PoSupCode into b2
                             from b in b2.DefaultIfEmpty()
                             join c1 in _context.CommonSettings on b.Status equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             select new
                             {
                                 b.Status,
                                 StatusName = c.ValueSet,
                                 a.ReqCode,
                                 a.ProductCode,
                                 a.ProductType
                             };

            var queryReq = from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted)
                           join b1 in _context.RequestImpProductDetails.Where(x => !x.IsDeleted) on a.ReqCode equals b1.ReqCode into b2
                           from b in b2.DefaultIfEmpty()
                           select new
                           {
                               a.PoCode,
                               a.ReqCode,
                               b.ProductCode,
                               b.ProductType
                           };

            var queryJoin = from a in queryReq
                            join b1 in queryPoSup on new { a.ReqCode, a.ProductCode, a.ProductType } equals new { b1.ReqCode, b1.ProductCode, b1.ProductType } into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                a.PoCode,
                                a.ProductCode,
                                a.ProductType,
                                b.StatusName
                            };

            var queryDistinct = queryJoin.DistinctBy(p => new { p.PoCode, p.ProductCode, p.ProductType }).Select(x => new
            {
                PoCode = x.PoCode,
                ProductCode = x.ProductCode,
                ProductType = x.ProductType,
                StatusName = x.StatusName
            });

            var query = from a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ContractCode) && x.ContractCode.Equals(contractCode))
                        join b1 in _context.CommonSettings on a.Unit equals b1.CodeSet into b2
                        from b in b2.DefaultIfEmpty()
                        join c1 in queryJoin on new { a.ContractCode, a.ProductCode, a.ProductType } equals new { ContractCode = c1.PoCode, c1.ProductCode, c1.ProductType } into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            a.Quantity,
                            UnitPrice = a.Cost,
                            a.Unit,
                            a.Tax,
                            a.Note,
                            sUnit = (b != null ? b.ValueSet : ""),
                            PriceType = a.PriceType,
                            a.ProductType,
                            StatusName = c != null && !string.IsNullOrEmpty(c.StatusName) ? c.StatusName : "Chưa đặt hàng",
                        };
            return Json(query);
        }

        [NonAction]
        private string UpdateLog(string log, List<Compare> list)
        {
            List<LogProductDetail> listLog = new List<LogProductDetail>();
            if (!string.IsNullOrEmpty(log))
            {
                listLog = JsonConvert.DeserializeObject<List<LogProductDetail>>(log);
                foreach (var item in listLog)
                {
                    foreach (var item1 in list)
                    {
                        if (item.ProductCode == item1.ProductCode && item.ProductType == item1.ProductType)
                        {
                            if (item1.Quantity + item1.CntForecast > 0)
                            {
                                item.ImpQuantity = item1.CntForecast;
                            }
                            else
                            {
                                item.ImpQuantity = -1 * (double)item1.Quantity;
                            }
                        }
                    }
                }
            }
            log = JsonConvert.SerializeObject(listLog);
            return log;
        }

        [NonAction]
        public async Task<object> InsertPOCusTracking(PoSaleHeader obj1)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var poHeader = obj1;
                var contractActivitys = _context.ContractActivitys.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractAttributes = _context.ContractAttributes.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractFiles = _context.ContractFiles.Where(x => x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractMemberTags = _context.ContractMemberTags.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractPeopleTags = _context.ContractPeopleTags.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractProductDetails = _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractServiceDetails = _context.ContractServiceDetails.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var contractPayments = _context.MaterialPaymentTickets.Where(x => x.PayObjId.Equals(obj1.ContractCode) && x.PayType.Equals("PAYMENT_CONTRACT")).ToList();
                var contractNotes = _context.ContactNotes.Where(x => x.ContractCode.Equals(obj1.ContractCode)).ToList();
                var LogProductDetailOld = poHeader.LogProductDetail;
                var jsonData = new
                {
                    Header = poHeader,
                    Detail = new
                    {
                        ServiceDetail = contractServiceDetails,
                        ProductDetail = contractProductDetails,
                        File = contractFiles,
                        Attribute = contractAttributes,
                        MemberTag = contractMemberTags,
                        //Activity = contractActivitys,
                        Payment = contractPayments,
                        Note = contractNotes
                    }
                };

                var json = JsonConvert.SerializeObject(jsonData);
                var obj = new PoCusUpdateTracking
                {
                    Status = obj1.Status,
                    PoCusCode = obj1.ContractCode,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    UpdateContent = json
                };

                _context.PoCusUpdateTrackings.Add(obj);

                //Thêm field LogData trong bảng Header
                var listLogData = new List<object>();
                var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode));
                if (!string.IsNullOrEmpty(contract.LogData))
                {
                    listLogData = JsonConvert.DeserializeObject<List<object>>(contract.LogData);
                    jsonData.Header.LogData = null;
                    jsonData.Header.LogProductDetail = null;
                    listLogData.Add(jsonData);
                    contract.LogData = JsonConvert.SerializeObject(listLogData);
                    contract.LogProductDetail = LogProductDetailOld;
                    _context.PoSaleHeaders.Update(contract);
                }
                else
                {
                    listLogData.Add(jsonData);

                    contract.LogData = JsonConvert.SerializeObject(listLogData);

                    _context.PoSaleHeaders.Update(contract);
                }

                await _context.SaveChangesAsync();

                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_LOG_SUCCESS"]); //"Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        [NonAction]
        public void InsertPOCusTrackingRaw(PoSaleHeader obj1)
        {

            var poHeader = obj1;
            var contractActivitys = _context.ContractActivitys.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractAttributes = _context.ContractAttributes.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractFiles = _context.ContractFiles.Where(x => x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractMemberTags = _context.ContractMemberTags.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractPeopleTags = _context.ContractPeopleTags.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractProductDetails = _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractServiceDetails = _context.ContractServiceDetails.Where(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var contractPayments = _context.MaterialPaymentTickets.Where(x => x.PayObjId.Equals(obj1.ContractCode) && x.PayType.Equals("PAYMENT_CONTRACT")).ToList();
            var contractNotes = _context.ContactNotes.Where(x => x.ContractCode.Equals(obj1.ContractCode)).ToList();
            var LogProductDetailOld = poHeader.LogProductDetail;
            var jsonData = new
            {
                Header = poHeader,
                Detail = new
                {
                    ServiceDetail = contractServiceDetails,
                    ProductDetail = contractProductDetails,
                    File = contractFiles,
                    Attribute = contractAttributes,
                    MemberTag = contractMemberTags,
                    //Activity = contractActivitys,
                    Payment = contractPayments,
                    Note = contractNotes
                }
            };

            var json = JsonConvert.SerializeObject(jsonData);
            var obj = new PoCusUpdateTracking
            {
                Status = obj1.Status,
                PoCusCode = obj1.ContractCode,
                CreatedBy = User.Identity.Name,
                CreatedTime = DateTime.Now,
                IsDeleted = false,
                UpdateContent = json
            };

            _context.PoCusUpdateTrackings.Add(obj);

            //Thêm field LogData trong bảng Header
            var listLogData = new List<object>();
            var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj1.ContractCode));
            if (!string.IsNullOrEmpty(contract.LogData))
            {
                listLogData = JsonConvert.DeserializeObject<List<object>>(contract.LogData);
                jsonData.Header.LogData = null;
                jsonData.Header.LogProductDetail = null;
                listLogData.Add(jsonData);
                contract.LogData = JsonConvert.SerializeObject(listLogData);
                contract.LogProductDetail = LogProductDetailOld;
                _context.PoSaleHeaders.Update(contract);
            }
            else
            {
                listLogData.Add(jsonData);

                contract.LogData = JsonConvert.SerializeObject(listLogData);

                _context.PoSaleHeaders.Update(contract);
            }
        }
        [HttpGet]
        public object GetCustommerContactInfo(string cusCode)
        {
            var contact = _context.Contacts.FirstOrDefault(x => !x.IsDeleted && x.CusCode.Equals(cusCode));
            return Json(contact);
        }
        [HttpPost]
        public object UpdateCustommerContactInfo([FromBody] CustommerContactInfo contact)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var check = _context.Contacts.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(contact.ContactId));
                if (check != null)
                {
                    check.ContactName = contact.ContactName;
                    check.MobilePhone = contact.ContactPhone;
                    check.Email = contact.ContactEmail;
                    check.UpdateTime = DateTime.Now;

                    _context.Contacts.Update(check);
                    _context.SaveChanges();
                }
                else
                {
                    if (!string.IsNullOrEmpty(contact.ContactName))
                    {
                        var obj = new Contact
                        {
                            CusCode = contact.CusCode,
                            ContactName = contact.ContactName,
                            MobilePhone = contact.ContactPhone,
                            Email = contact.ContactEmail,
                            CreateTime = DateTime.Now,
                        };

                        _context.Contacts.Add(obj);
                        _context.SaveChanges();
                    }
                }

                msg.Title = String.Format(_stringLocalizer["CONTRACR_MSG_UPDATE_CUS_CONTRACT_INFO_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACR_MSG_UPDATE_CUS_CONTRACT_INFO_FAIL"]);
                throw ex;
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetCountContract()
        {
            var countAll = 0;
            var assignSuccess = 0;
            var assignNotSuccess = 0;
            var session = HttpContext.GetSessionUser();
            var contracts = _context.PoSaleHeaders.Where(x => !x.IsDeleted);
            if (session.IsAllData)
            {
                countAll = contracts.Count();
                var success = (from a in contracts
                               join b in _context.AssignMemberToOjects.Where(x => !x.IsDeleted) on a.ContractCode equals b.ObjId
                               let listStatus = !string.IsNullOrEmpty(a.Status) ? JsonConvert.DeserializeObject<List<JsonLog>>(a.Status) : new List<JsonLog>()
                               let status = listStatus.OrderByDescending(x => x.CreatedTime).FirstOrDefault(x => x.Code.Equals("FINAL_DONE"))
                               where (a.CreatedBy.Equals(session.UserName) || b.UserId.Equals(session.UserId))
                                  && (status != null)
                               select new
                               {
                                   a.ContractHeaderID
                               }).Distinct();
                assignSuccess = success.Count();

                var notSuccess = (from a in contracts
                                  join b in _context.AssignMemberToOjects.Where(x => !x.IsDeleted) on a.ContractCode equals b.ObjId
                                  let listStatus = !string.IsNullOrEmpty(a.Status) ? JsonConvert.DeserializeObject<List<JsonLog>>(a.Status) : new List<JsonLog>()
                                  let status = listStatus.OrderByDescending(x => x.CreatedTime).FirstOrDefault(x => x.Code.Equals("FINAL_DONE"))
                                  where (a.CreatedBy.Equals(session.UserName) || b.UserId.Equals(session.UserId))
                                     && (status != null)
                                  select new
                                  {
                                      a.ContractHeaderID
                                  }).Distinct();
                assignNotSuccess = notSuccess.Count();
            }
            else
            {
                var data = (from a in contracts
                            join b in _context.AssignMemberToOjects.Where(x => !x.IsDeleted) on a.ContractCode equals b.ObjId
                            where (a.CreatedBy.Equals(session.UserName) || b.UserId.Equals(session.UserId))
                            select new
                            {
                                a.ContractHeaderID,
                                a.Status
                            }).Distinct();
                countAll = data.Count();
                var success = data.Where(x => x.Status == "CONTRACT_STATUS_PO_CUS_COMPLETE");
                assignSuccess = success.Count();
                var notSuccess = data.Where(x => x.Status != "CONTRACT_STATUS_PO_CUS_COMPLETE");
                assignNotSuccess = notSuccess.Count();
            }

            return new
            {
                All = countAll,
                AssignSuccess = assignSuccess,
                AssignNotSuccess = assignNotSuccess
            };
        }

        [HttpGet]
        public object GetCountInContractHome()
        {
            var session = HttpContext.GetSessionUser();
            //Po sales
            var data = _context.PoSaleHeaders.Where(x => !x.IsDeleted
                        && (session.IsAllData || x.CreatedBy.Equals(session.UserName)));
            var pending = data.Where(x => x.StatusObject.Equals("CONTRACT_STATUS_PO_PENDING"));

            //Po buy
            var po = _context.PoBuyerHeaders.Where(x => !x.IsDeleted
                        && (session.IsAllData || x.CreatedBy.Equals(session.UserName)));
            var pendingPo = po.Where(x => x.StatusObject != "CONTRACT_STATUS_PO_SUP_CREATED" && x.StatusObject != "CONTRACT_STATUS_PO_SUP_RECEIVED");

            //Request import product
            var rq = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && (session.IsAllData || x.CreatedBy.Equals(session.UserName)));
            var rqPending = rq.Where(x => x.StatusObject.Equals("IMP_STATUS_PENDING"));

            //Request work price
            var rqPrice = _context.RequestPriceHeaders.Where(x => !x.IsDeleted && (session.IsAllData || x.CreatedBy.Equals(session.UserName)));
            var rqPricePending = rqPrice.Where(x => x.Status.Equals("PRICE_STATUS_PENDING"));

            return new
            {
                Pending = pending.Count(),
                All = data.Count(),

                //PO Buy
                PendingPO = pendingPo.Count(),
                AllPO = po.Count(),

                //Request import
                RqImpPending = rqPending.Count(),
                AllRqImp = rq.Count(),

                //Request work price
                RqPricePending = rqPricePending.Count(),
                AllRqPrice = rqPrice.Count()
            };
        }
        #endregion

        #region ContractDetail
        public class JTableModelContractDetail : JTableModel
        {
            public string ContractCode { get; set; }
            public string ItemCode { get; set; }
            public string ItemName { get; set; }
        }

        [HttpPost]
        public object JTableDetail([FromBody] JTableModelContractDetail jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "code", "name", "quatity", "unit", "cost", "type");
            }
            int intBeginfor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ContractDetails
                        where (string.IsNullOrEmpty(jTablePara.ItemCode) || a.ItemCode.ToLower().Contains(jTablePara.ItemCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.ItemName) || a.ItemName.ToLower().Contains(jTablePara.ItemName.ToLower()))
                        && (a.IsDeleted == false && a.ContractCode == jTablePara.ContractCode)
                        select new
                        {
                            id = a.ContractDetailID,
                            code = a.ItemCode,
                            name = a.ItemName,
                            quatity = a.Quatity,
                            unit = a.Unit,
                            cost = a.Cost,
                            note = a.Note,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginfor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jData = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "name", "quatity", "unit", "cost", "Note");
            return Json(jData);
        }

        [HttpPost]
        public async Task<JsonResult> InsertContractDetail([FromBody] ContractDetail obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ContractDetails.FirstOrDefault(x => x.ItemCode == obj.ItemCode && x.ContractCode == obj.ContractCode);
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE"]);// "Mã chi tiết hợp đồng đã tồn tại!";
                }
                else
                {
                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == obj.ContractCode);
                    //add contract detail
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.ContractVersion = contractHeader.Version;
                    obj.Unit = contractHeader.Currency;
                    _context.ContractDetails.Add(obj);
                    await _context.SaveChangesAsync();


                    //update contract header
                    contractHeader.Budget = _context.ContractDetails.Where(x => x.ContractCode == obj.ContractCode).Select(x => x.Quatity * x.Cost).Sum();
                    _context.PoSaleHeaders.Update(contractHeader);
                    await _context.SaveChangesAsync();
                    msg.Object = contractHeader.Budget;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]);//"Thêm chi tiết hợp đồng thành công";

                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]);//"Có lỗi xảy ra khi thêm!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateContractDetail([FromBody] ContractDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == obj.ContractCode);
                //update contract detail
                obj.UpdatedBy = ESEIM.AppContext.UserName;
                obj.UpdatedTime = DateTime.Now;
                _context.ContractDetails.Update(obj);
                await _context.SaveChangesAsync();

                //update contract header
                contractHeader.Budget = _context.ContractDetails.Where(x => x.ContractCode == obj.ContractCode).Select(x => x.Quatity * x.Cost).Sum();
                await _context.SaveChangesAsync();
                msg.Object = contractHeader.Budget;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]);// "Cập nhập chi tiết hợp đồng thành công!";

                if (contractHeader != null)
                    await InsertPOCusTracking(contractHeader);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]); //"Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContractDetail(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var contractDetail = _context.ContractDetails.FirstOrDefault(x => x.ContractDetailID == id);
                if (contractDetail != null)
                {
                    //delete detail
                    _context.ContractDetails.Remove(contractDetail);
                    _context.SaveChanges();

                    //update header
                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == contractDetail.ContractCode);
                    var budget = _context.ContractDetails.Where(x => x.ContractCode == contractDetail.ContractCode).Select(x => x.Quatity * x.Cost).Sum();
                    contractHeader.Budget = budget;
                    _context.PoSaleHeaders.Update(contractHeader);
                    _context.SaveChanges();
                    msg.Object = contractHeader.Budget;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]); //"Xóa chi tiết hợp đồng thành công";
                }

                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]); //"Xóa chi tiết hợp đồng thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_CURD_TAB_DETAIL"]);// "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public async Task<object> DeleteProductInContract(int Id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoSaleProductDetails.FirstOrDefault(x => x.IsDeleted == false && x.Id == Id);
                if (data != null)
                {
                    var checkInReqImp = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                                         join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                                         where a.ProductCode.Equals(data.ProductCode) && a.ProductType.Equals(data.ProductType) && b.PoCode.Equals(data.ContractCode)
                                         select new
                                         {
                                             a.ProductCode
                                         }).ToList();

                    if (checkInReqImp.Count > 0)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACR_MSG_DELETE_PRODUCT_YC"]);
                        return Json(msg);
                    }

                    var isLockDetail = IsLockDetail(data.ContractCode);
                    if (isLockDetail == false)
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        _context.PoSaleProductDetails.Update(data);
                        await _context.SaveChangesAsync();
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_DELETE_PRODUCT_SUCCESS"]);
                        var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == data.ContractCode);
                        if (contract != null)
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                            object[] val = new object[] { data.ProductCode, data.Quantity, 0, data.ProductType, contract.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_UPDATE_CONTRACT_DETAIL", param, val);
                            await DeleteItemProductLog(contract, data.ProductCode, data.ProductType);
                            await UpdateRequestImpDetail(data.ContractCode);

                            //Sửa tổng giá trị hợp đồng
                            contract.Budget = contract.Budget - (data.Cost * data.Quantity);
                            contract.RealBudget = contract.RealBudget - (data.Cost * data.Quantity) * (1 + (decimal)data.Tax / 100);
                            contract.LastBudget = contract.RealBudget * (1 - contract.Discount / 100 - contract.Commission / 100);
                            //Sửa trạng thái IsChangeProduct nếu hợp đồng đã được duyệt
                            if (contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REQUEST" && contract.Status != "CONTRACT_STATUS_PO_CUS_FACCO_REJECTED" && contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REJECTED")
                            {
                                contract.IsChangeProduct = true;
                            }
                            _context.PoSaleHeaders.Update(contract);
                            await _context.SaveChangesAsync();
                            msg.Object = new
                            {
                                contract.Budget,
                                contract.RealBudget,
                                TaxDetail = contract.RealBudget - contract.Budget,
                                contract.LastBudget,
                            };

                            //Thêm vào field log
                            await InsertPOCusTracking(contract);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACR_MSG_DELETE_PRODUCT_YC_APPROVED"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_REFRESH"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_DELETE_PRODUCT_FAILED"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetContractDetail(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ContractDetails.FirstOrDefault(x => x.ContractDetailID == id);
                if (data != null)
                {
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]); //"Không tồn tại dữ liệu";
            }
            return Json(msg);
        }

        [NonAction]
        private bool IsLockDetail(string contractCode)
        {
            var data = _context.RequestImpProductHeaders.FirstOrDefault(x => x.PoCode == contractCode && x.IsDeleted == false);
            if (data != null)
            {
                if (data.Status != "APPROVED")
                    return false;
                return true;
            }
            else
            {
                return false;
            }
        }

        [NonAction]
        private async Task UpdateRequestImpDetail(string contractCode)
        {
            var requestImp = _context.RequestImpProductHeaders.FirstOrDefault(x => x.IsDeleted == false && x.PoCode == contractCode);
            if (requestImp != null)
            {
                var listDetail = _context.RequestImpProductDetails.Where(x => x.IsDeleted == false && x.ReqCode == requestImp.ReqCode);
                foreach (var item in listDetail)
                {
                    item.IsDeleted = true;
                }
                List<RequestImpProductDetail> list = GetListProduct(contractCode);

                foreach (var item1 in list)
                {
                    item1.ReqCode = requestImp.ReqCode;
                    item1.IsDeleted = false;
                    item1.CreatedBy = ESEIM.AppContext.UserName;
                    item1.CreatedTime = DateTime.Now;
                    item1.UpdatedBy = ESEIM.AppContext.UserName;
                    item1.UpdatedTime = DateTime.Now;
                    decimal a1 = decimal.Parse(item1.PoCount);
                    item1.Quantity = a1 * item1.RateLoss.Value / item1.RateConversion.Value;

                    RequestImpProductDetail c = null;
                    foreach (var item in listDetail)
                    {
                        if (item1.ProductCode == item.ProductCode && item1.ProductType == item.ProductType)
                        {
                            c = item;
                        }
                    }
                    if (c != null)
                    {
                        item1.RateConversion = c.RateConversion;
                        item1.RateLoss = c.RateLoss;
                        decimal a = decimal.Parse(item1.PoCount);
                        item1.Quantity = a * item1.RateLoss.Value / item1.RateConversion.Value;
                        item1.CreatedBy = c.CreatedBy;
                    }
                }
                _context.RequestImpProductDetails.RemoveRange(listDetail);
                _context.RequestImpProductDetails.AddRange(list);
                await _context.SaveChangesAsync();
                return;
            }
        }

        [NonAction]
        private List<RequestImpProductDetail> GetListProduct(string contractCode)
        {
            var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(contractCode));

            var listLogProductDetail = new List<LogProductDetail>();
            var listProductGroup = new List<RequestImpProductDetail>();
            if (contractHeader != null)
            {
                if (!string.IsNullOrEmpty(contractHeader.LogProductDetail))
                    listLogProductDetail.AddRange(JsonConvert.DeserializeObject<List<LogProductDetail>>(contractHeader.LogProductDetail));

                var listProductDetail = listLogProductDetail.Where(x => x.ImpQuantity < 0).GroupBy(p => p.ProductCode).Select(x => new
                {
                    x.FirstOrDefault().ProductCode,
                    x.FirstOrDefault().ContractCode,
                    Quantity = x.FirstOrDefault().ImpQuantity * -1
                });
                var listProduct = (from a in listProductDetail
                                   join b in _context.PoSaleProductDetails.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                                   join e in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals e.ProductQrCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                   join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals f.ProductCode into f1
                                   from f2 in f1.DefaultIfEmpty()
                                   join g in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals g.CodeSet into g1
                                   from g2 in g1.DefaultIfEmpty()
                                   where b.ContractCode.Equals(contractCode)
                                   select new RequestImpProductDetail
                                   {
                                       ProductCode = a.ProductCode,
                                       //ProductName = e2 != null ? string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
                                       ProductName = e2 != null ? e2.AttributeName : f2 != null ? f2.ProductName : null,
                                       ProductType = b.ProductType,
                                       Quantity = (decimal)a.Quantity,
                                       PoCount = a.Quantity.ToString(),
                                       RateConversion = 1,
                                       RateLoss = 1,
                                       Unit = b.Unit,
                                       UnitName = g2.ValueSet,
                                   }).ToList();

                listProductGroup = listProduct.GroupBy(x => x.ProductCode).Select(p => new RequestImpProductDetail
                {
                    ProductCode = p.LastOrDefault().ProductCode,
                    ProductName = p.LastOrDefault().ProductName,
                    ProductType = p.LastOrDefault().ProductType,
                    Quantity = p.LastOrDefault().Quantity,
                    PoCount = p.LastOrDefault().PoCount,
                    RateConversion = p.LastOrDefault().RateConversion,
                    RateLoss = p.LastOrDefault().RateLoss,
                    Unit = p.LastOrDefault().Unit,
                    UnitName = p.LastOrDefault().UnitName,
                }).ToList();
            }
            return listProductGroup;
        }
        #endregion

        #region ContractPeopleTag
        public class JTableModelContracPeople : JTableModel
        {
            public string ContractCode { get; set; }
        }
        [HttpPost]
        public object JTableTagPeople([FromBody] JTableModelContracPeople jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssignMemberToOjects.Where(x => !x.IsDeleted && x.ObjId.Equals(jTablePara.ContractCode) && x.ObjType.Equals("CONTRACT"))
                        join b in _context.Users on a.UserId equals b.Id
                        select new
                        {
                            Id = a.ID,
                            Assigner = b.GivenName,
                            AssignerTime = a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm"),
                            Note = a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Assigner", "AssignerTime", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult AssignToContract([FromBody] AssignMemberToContract obj)
        {
            var msg = new JMessage();
            try
            {
                var check = _context.AssignMemberToOjects.FirstOrDefault(x => !x.IsDeleted && x.UserId.Equals(obj.UserId) && x.ObjId.Equals(obj.ContractCode));
                if (check != null)
                {
                    msg.Error = true;
                    msg.Title = "Thành viên đã tồn tại";
                }
                else
                {
                    var assign = new AssignMemberToOject
                    {
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Note = obj.Note,
                        ObjId = obj.ContractCode,
                        ObjType = "CONTRACT",
                        UserId = obj.UserId
                    };
                    _context.AssignMemberToOjects.Add(assign);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
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
        public JsonResult DeleteAssignContract(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.AssignMemberToOjects.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.AssignMemberToOjects.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
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
        public object GetUserlogin()
        {
            var userName = ESEIM.AppContext.UserName;
            return userName;
        }
        [HttpPost]
        public object GetListUser()
        {
            var query = _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Id = x.Id, UserName = x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetTask()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Task)).Select(x => new { Code = x.ValueSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public async Task<JsonResult> InsertTagPeople([FromBody] EDMSModelTags obj)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var contractTags = new ContractMemberTag
                {
                    ContractCode = obj.ContractCode,
                    Assigner = string.Join(",", obj.ContractPeople.Select(x => x.UserName)),
                    AssignerTime = DateTime.Now,
                    Assignee = ESEIM.AppContext.UserName,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    TaskCode = obj.Task.Code,
                    Note = obj.Note,
                    IsDeleted = false,
                };
                _context.ContractMemberTags.Add(contractTags);
                await _context.SaveChangesAsync();
                mess.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_MEMBER_LIST_COL_ASSIGNEE"]); //"Thêm người ủy quyền thành công";

                var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                if (contractHeader != null)
                    await InsertPOCusTracking(contractHeader);
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_CURD_TAB_MEMBER_LIST_COL_ASSIGNEE"]);//"Có lỗi khi thêm người ủy quyền";
            }
            return Json(mess);
        }

        [HttpPost]
        public JsonResult DeleteTagPeople([FromBody] int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var tag = _context.ContractMemberTags.FirstOrDefault(x => x.Id == id);
                tag.IsDeleted = true;
                _context.ContractMemberTags.Update(tag);
                //_context.ContractMemberTags.Remove(tag);
                _context.SaveChanges();
                mess.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_MEMBER_LIST_COL_ASSIGNEE"]); //"Xóa người ủy quyền thành công";
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_CURD_TAB_MEMBER_LIST_COL_ASSIGNEE"]); //"Có lỗi khi xóa người ủy quyền";
            }
            return Json(mess);
        }

        public class AssignMemberToContract
        {
            public string ContractCode { get; set; }
            public string UserId { get; set; }
            public string Note { get; set; }
        }
        #endregion

        #region ContractNote
        public class JTableModelContractNote : JTableModel
        {
            public string ContractCode { get; set; }
            public string Title { get; set; }
            public string Note { get; set; }
        }
        [HttpPost]
        public object JTableContractNote([FromBody] JTableModelContractNote jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "ContractNoteId", "Title", "ContractCode", "Note", "Tags", "CreatedBy", "CreatedTime");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ContactNotes
                        where (string.IsNullOrEmpty(jTablePara.Title) || a.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Note) || a.Note.ToLower().Contains(jTablePara.Note.ToLower()))
                         && !a.IsDeleted && a.ContractCode == jTablePara.ContractCode
                        select new
                        {
                            a.ContractNoteId,
                            a.Title,
                            a.ContractCode,
                            a.Note,
                            a.Tags,
                            a.CreatedBy,
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ContractNoteId", "Title", "ContractCode", "Note", "Tags", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetContractNote([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ContactNotes.FirstOrDefault(x => x.ContractNoteId == id);
                if (data != null)
                {
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]);//"Không tồn tại dữ liệu";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> InsertContractNote([FromBody] ContactNote obj)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj == null)
                {
                    mess.Error = true;
                    mess.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);// "Có lỗi khi thêm ghi chú hợp đồng";
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ContactNotes.Add(obj);
                    await _context.SaveChangesAsync();
                    mess.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);//"Thêm ghi chú hợp đồng thành công";

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);//"Có lỗi khi thêm ghi chú hợp đồng";
            }
            return Json(mess);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateContractNote([FromBody] ContactNote obj)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj == null)
                {
                    mess.Error = true;
                    mess.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);// "Có lỗi khi cập nhâp ghi chú !";
                }
                else
                {
                    _context.ContactNotes.Update(obj);
                    await _context.SaveChangesAsync();
                    mess.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);// "Cập nhâp ghi chú thành công";

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);// "Có lỗi khi thêm ghi chú hợp đồng";
            }
            return Json(mess);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteContractNote([FromBody] int id)
        {
            var message = new JMessage { Error = false, Title = "" };
            try
            {
                var getContract = _context.ContactNotes.FirstOrDefault(x => x.ContractNoteId == id);
                getContract.IsDeleted = true;
                _context.ContactNotes.Update(getContract);
                await _context.SaveChangesAsync();
                message.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);// "Xóa ghi chú thành công";

                var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(getContract.ContractCode));
                if (contractHeader != null)
                    await InsertPOCusTracking(contractHeader);
            }
            catch (Exception ex)
            {
                message.Error = false;
                message.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_CURD_TITLE_NOTE"]);//"Xóa ghi chú lỗi";
            }
            return Json(message);
        }
        #endregion

        #region ContractNotification
        public class JTableModelContractNotification : JTableModel
        {
            public string ContractCode { get; set; }
        }
        [HttpPost]
        public object JTableNotification([FromBody] JTableModelContractNotification jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "NotifyID", "NotifyCode", "Title", "Content", "IsWarning", "ReceiverConfirm", "ConfirmTime");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Notifications
                        where !a.IsDeleted
                        select new Notification
                        {
                            NotifyID = a.NotifyID,
                            NotifyCode = a.NotifyCode,
                            Title = a.Title,
                            Content = a.Content,
                            IsWarning = a.IsWarning,
                            ReceiverConfirm = a.ReceiverConfirm,
                            ConfirmTime = a.ConfirmTime,
                            LstContractCode = a.LstContractCode
                        };
            var model = new List<Notification>();
            Parallel.ForEach(query, item =>
            {
                if (!string.IsNullOrEmpty(item.LstContractCode))
                {
                    var list = item.LstContractCode.Split(',');
                    if (list.Any(x => x == jTablePara.ContractCode))
                        model.Add(item);
                }
            });
            var listQuery = model.AsQueryable();
            var count = listQuery.Count();
            var data = listQuery.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(model, jTablePara.Draw, count, "NotifyID", "NotifyCode", "Title", "Content", "IsWarning", "ReceiverConfirm", "ConfirmTime");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult DeleteNotification([FromBody] int id)
        {
            var message = new JMessage { Error = false, Title = "" };
            try
            {
                var notification = _context.Notifications.FirstOrDefault(x => x.NotifyID == id);
                notification.IsDeleted = true;
                _context.Notifications.Update(notification);
                _context.SaveChanges();
                message.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_NOTIFICATION"]);//  "Xóa thông báo thành công";
            }
            catch (Exception ex)
            {
                message.Error = false;
                message.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_CURD_TAB_NOTIFICATION"]);//   "Xóa thông báo lỗi";
            }
            return Json(message);
        }
        #endregion

        #region ContractFile
        public class JTableModelFile : JTableModel
        {
            public string ContractCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                           .Select(p => new
                                                           {
                                                               p.FileID,
                                                               p.ListUserShare,
                                                               p.UserShares
                                                           }).ToList();
            var session = HttpContext.GetSessionUser();

            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.ContractCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          join g in listFileByUser on b.FileCode equals g.FileID into g1
                          from g in g1.DefaultIfEmpty()
                          where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) || b.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              TypeFile = "NO_SHARE",
                              ReposName = f != null ? f.ReposName : "",
                              b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                              ListUserShare = g.ListUserShare
                          }).Union(
                  from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                  join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                  join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  let rela = JsonConvert.DeserializeObject<ObjRelativeContract>(a.ObjectRelative)
                  where rela.ObjectInstance.Equals(jTablePara.ContractCode) && rela.ObjectType.Equals(EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      Desc = b.Desc != null ? b.Desc : "",
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.FileID,
                      SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                      ListUserShare = a.ListUserShare
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode",
                "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName",
                "TypeFile", "SizeOfFile", "FileID", "ListUserShare");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertContractFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        //var suggesstion = GetSuggestionsContractFile(obj.ContractCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_MR_NOT_BLANK"]);
                        //    return Json(msg);
                        //}
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                                && x.ObjectCode.Equals(obj.ContractCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Contract)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                        if (setting != null)
                        {
                            reposCode = setting.ReposCode;
                            path = setting.Path;
                            folderId = setting.FolderId;
                            catCode = setting.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
                            return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat(EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract), Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.ContractCode,
                        ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc != null ? obj.Desc : "",
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Object = edmsReposCatFile.Id;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_FILE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_FILE_FORMAT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_FAILED"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateContractFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }
                                else if (result.Status == WebExceptionStatus.Success)
                                {
                                    if (result.IsSaveUrlPreventive)
                                    {
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CONTRACR_MSG_UPDATE_CUS_CONTRACT_INFO_SUCCESS"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_UPDATE_FILE_NOT_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContractFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
                if (getRepository != null)
                {
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetContractFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";         
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsContractFile(string contractCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == contractCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult InsertFileShareContract([FromBody] ShareFilePermission obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
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

                if (data != null)
                {
                    var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));

                    var share = new UserShare
                    {
                        Code = obj.Code,
                        Name = obj.Name,
                        DepartmentName = obj.DepartmentName,
                        Permission = obj.Permission
                    };
                    var lstUserShare = new List<UserShare>();
                    if (check == null)
                    {
                        lstUserShare.Add(share);
                        var rela = new
                        {
                            ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                            ObjectInstance = data.Id
                        };
                        var files = new FilesShareObjectUser
                        {
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileID = data.FileCode,
                            FileCreated = User.Identity.Name,
                            FileUrl = data.Url,
                            FileName = data.FileName,
                            ObjectRelative = JsonConvert.SerializeObject(rela),
                            ListUserShare = JsonConvert.SerializeObject(lstUserShare)
                        };
                        _context.FilesShareObjectUsers.Add(files);
                        _context.SaveChanges();
                        msg.Title = "Chia sẻ thành công";
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(check.ListUserShare))
                        {
                            lstUserShare = JsonConvert.DeserializeObject<List<UserShare>>(check.ListUserShare);
                            var isAdded = false;
                            foreach (var item in lstUserShare)
                            {
                                if (item.Code == obj.Code)
                                {
                                    item.Permission = obj.Permission;
                                    isAdded = true;
                                    break;
                                }
                            }
                            if (isAdded)
                            {
                                check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                                check.UpdatedBy = ESEIM.AppContext.UserName;
                                check.UpdatedTime = DateTime.Now;
                                _context.FilesShareObjectUsers.Update(check);
                                _context.SaveChanges();
                                msg.Title = "Cập nhật thành công";
                            }
                            else
                            {
                                lstUserShare.Add(share);
                                check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                                check.UpdatedBy = ESEIM.AppContext.UserName;
                                check.UpdatedTime = DateTime.Now;
                                _context.FilesShareObjectUsers.Update(check);
                                _context.SaveChanges();
                                msg.Title = "Chia sẻ thành công";
                            }
                        }
                        else
                        {
                            lstUserShare.Add(share);
                            check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                            check.UpdatedBy = ESEIM.AppContext.UserName;
                            check.UpdatedTime = DateTime.Now;
                            _context.FilesShareObjectUsers.Update(check);
                            _context.SaveChanges();
                            msg.Title = "Chia sẻ thành công";
                        }
                    }
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
        public void AutoShareFilePermission([FromBody] AutoShareFileModel obj)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
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

            if (data != null)
            {
                var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                if (check == null)
                {
                    var rela = new
                    {
                        ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                        ObjectInstance = data.Id
                    };
                    var files = new FilesShareObjectUser
                    {
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileID = data.FileCode,
                        FileCreated = User.Identity.Name,
                        FileUrl = data.Url,
                        FileName = data.FileName,
                        ObjectRelative = JsonConvert.SerializeObject(rela),
                        ListUserShare = obj.LstShare
                    };
                    _context.FilesShareObjectUsers.Add(files);
                    _context.SaveChanges();
                }
            }
        }
        public class AutoShareFileModel
        {
            public int Id { get; set; }
            public string LstShare { get; set; }
        }
        public class ShareFilePermission
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
            public int Id { get; set; }
        }
        public class UserShare
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
        }
        public class ObjRelativeContract
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }
        #endregion

        #region ContractAttribute
        public class JTableModelAttribute : JTableModel
        {
            public string ContractCode { get; set; }
            public string AttrCode { get; set; }
            public string AttrValue { get; set; }
            public string PoSupCode { get; set; }
        }

        [HttpPost]
        public object JTableAttribute([FromBody] JTableModelAttribute jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "code", "value", "attrGroup");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ContractAttributes.Where(x => !x.IsDeleted && x.ContractCode == jTablePara.ContractCode)
                        where (string.IsNullOrEmpty(jTablePara.AttrCode) || a.AttrCode.ToLower().Contains(jTablePara.AttrCode.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.AttrValue) || a.AttrValue.ToLower().Contains(jTablePara.AttrValue.ToLower()))
                        select new
                        {
                            id = a.ContractAttributeID,
                            code = a.AttrCode,
                            value = a.AttrValue,
                            attrGroup = a.AttrGroup,
                            note = a.Note
                        };

            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "code", "value", "attrGroup", "note");
            return Json(jdata);

        }

        public async Task<JsonResult> InsertContractAttr([FromBody] ContractAttribute obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ContractAttributes.FirstOrDefault(x => x.AttrCode.ToLower() == obj.AttrCode.ToLower() && x.ContractCode == obj.ContractCode && !x.IsDeleted);
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE"]);// "Mã mở rộng đã tồn tai!";
                }
                else
                {
                    //var contractVersion = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == obj.ContractCode).Version;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    //obj.ContractVersion = contractVersion;
                    _context.ContractAttributes.Add(obj);
                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"].Value.ToLower());// "Thêm mở rộng thành công!";

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"].Value.ToLower());// "Có lỗi xảy ra khi thêm!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetContractAttr(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ContractAttributes.FirstOrDefault(x => x.ContractAttributeID == id);
                if (data != null)
                {
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]); // "Không tồn tại dữ liệu";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateContractAttr([FromBody] ContractAttribute obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ContractAttributes.FirstOrDefault(x => x.ContractAttributeID == obj.ContractAttributeID);
                if (data != null)
                {
                    data.AttrValue = obj.AttrValue;
                    data.AttrGroup = obj.AttrGroup;
                    data.Note = obj.Note;

                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.ContractAttributes.Update(data);
                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"]);// "Cập nhật mở rộng thành công!";

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_EXTEND_REFRESH"]); //"Không tồn tại thuộc tính mở rộng này, vui lòng làm mới trang";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public async Task<JsonResult> DeleteContractAttr(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ContractAttributes.FirstOrDefault(x => x.ContractAttributeID == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.Update(data);
                await _context.SaveChangesAsync();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"].Value.ToLower());// "Xóa mở rộng thành công!";

                var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(data.ContractCode));
                if (contractHeader != null)
                    await InsertPOCusTracking(contractHeader);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"].Value.ToLower());// "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetContractCode(string role)
        {
            JMessage msg = new JMessage() { Error = false };
            //var dt = "HD";
            //if (role == "ROLE20190320142618")
            //    dt = "DL";
            //if (role == "ROLE20190320142633")
            //    dt = "KL";
            //if (role == "ROLE20190320142645")
            //    dt = "DA";

            try
            {
                //DateTime now = DateTime.Now;
                ////var count = (from a in _context.PoSaleHeaders
                ////             join b in _context.Customerss on a.CusCode equals b.CusCode
                ////             where b.Role == role
                ////             select new
                ////             {
                ////                 a.CusCode
                ////             }
                ////             ).Count();
                //var count = 0;
                //var chkCode = "." + dt + "_";
                //var contractMax = (from a in _context.PoSaleHeaders.Where(x => x.ContractCode.Contains(chkCode))
                //                   orderby a.ContractHeaderID descending
                //                   select a.ContractCode
                //                   ).FirstOrDefault();
                ////var contractMax = (from a in _context.PoSaleHeaders.Where(x => x.ContractCode.Contains(chkCode))
                ////                   join b1 in _context.Customerss on a.CusCode equals b1.CusCode into b2
                ////                   from b in b2.DefaultIfEmpty()
                ////                   where (b == null || b.Role == role)
                ////                   orderby a.ContractHeaderID descending
                ////                   select a.ContractCode
                ////                   ).FirstOrDefault();
                //if (!string.IsNullOrEmpty(contractMax))
                //{
                //    string[] listSplit = contractMax.Split("_", StringSplitOptions.None);
                //    var idxLast = listSplit.Length - 1;
                //    if (idxLast >= 1)
                //    {
                //        Int32.TryParse(listSplit[idxLast], out count);
                //    }
                //}

                //if (count < 9)
                //{
                //    msg.Object = "T" + now.Month + "." + now.Year + "." + dt + "_0" + (count + 1);
                //}
                //else
                //{
                //    msg.Object = "T" + now.Month + "." + now.Year + "." + dt + "_" + (count + 1);
                //}
                msg.Object = FuncGetContractCode(role);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ERROR_CONTRACT_FRFRESH"]);//"Có lỗi khi lấy mã hợp đồng, vui lòng thử lại sau";
            }

            return Json(msg);
        }

        public string FuncGetContractCode(string role)
        {
            var dt = "HD";
            var rs = "";
            DateTime now = DateTime.Now;
            var count = 0;
            var chkCode = "." + dt + "_";
            //var contractMax = (from a in _context.PoSaleHeaders.Where(x => x.ContractCode.Contains(chkCode))
            //                   orderby a.ContractHeaderID descending
            //                   select a.ContractCode
            //                   ).FirstOrDefault();
            //if (!string.IsNullOrEmpty(contractMax))
            //{
            //    string[] listSplit = contractMax.Split("_", StringSplitOptions.None);
            //    var idxLast = listSplit.Length - 1;
            //    if (idxLast >= 1)
            //    {
            //        Int32.TryParse(listSplit[idxLast], out count);
            //    }
            //}

            count = _context.PoSaleHeaders.Where(x => x.ContractCode.Contains(chkCode) && x.Version == 0).Count();

            do
            {
                if (count < 9)
                {
                    count++;
                    rs = "T" + now.Month + "." + now.Year + "." + dt + "_0" + (count);
                }
                else
                {
                    count++;
                    rs = "T" + now.Month + "." + now.Year + "." + dt + "_" + (count);
                }
            } while (_context.PoSaleHeaders.Any(x => !x.IsDeleted && x.ContractCode == rs));
            return rs;

        }

        #endregion

        #region ContractSchedulePay
        public class JTableModelSchedulePay : JTableModel
        {
            public string ContractCode { get; set; }
        }

        [HttpPost]
        public object JTableSchedulePay([FromBody] JTableModelSchedulePay jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "PayTimes", "Percentage", "Money", "EstimateTime", "Note", "Condition", "Quantity");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ContractSchedulePays.Where(x => !x.IsDeleted && x.ContractCode == jTablePara.ContractCode)
                        select new
                        {
                            Id = a.Id,
                            PayTimes = a.PayTimes,
                            Percentage = a.Percentage,
                            Money = a.Money,
                            EstimateTime = a.EstimateTime,
                            Note = a.Note,
                            Condition = a.Condition,
                            Quantity = a.Quantity,
                        };

            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PayTimes", "Percentage", "Money", "EstimateTime", "Note", "Condition", "Quantity");
            return Json(jdata);
        }

        public async Task<JsonResult> InsertContractSchedulePay([FromBody] ContractSchedulePay obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkExist = _context.ContractSchedulePays.FirstOrDefault(x => x.PayTimes == obj.PayTimes && x.ContractCode == obj.ContractCode && !x.IsDeleted);
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_THE_PAYMENT_HAS_BEEN_DECLARED"]);
                }
                else
                {
                    obj.EstimateTime = !string.IsNullOrEmpty(obj.sEstimateTime) ? DateTime.ParseExact(obj.sEstimateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.ContractSchedulePays.Add(obj);
                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_ADD_PAYMENT_SCHEDULE_SUCCESSFULLY"]);

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR_ADD"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetContractSchedulePay(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ContractSchedulePays.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]);
            }
            return Json(msg);
        }

        [HttpGet]
        public int GetPayTimes(string contractCode)
        {
            var chkExist = _context.ContractSchedulePays.Any(x => !x.IsDeleted && x.ContractCode == contractCode);
            if (chkExist)
            {
                var data = _context.ContractSchedulePays.Where(x => !x.IsDeleted && x.ContractCode == contractCode).Max(x => x.PayTimes);
                return data + 1;
            }
            else
            {
                return 1;
            }
        }

        [HttpPost]
        public async Task<JsonResult> UpdateContractSchedulePay([FromBody] ContractSchedulePay obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.ContractSchedulePays.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    obj.EstimateTime = !string.IsNullOrEmpty(obj.sEstimateTime) ? DateTime.ParseExact(obj.sEstimateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    data.Percentage = obj.Percentage;
                    data.Money = obj.Money;
                    data.EstimateTime = obj.EstimateTime;
                    data.Condition = obj.Condition;
                    data.Quantity = obj.Quantity;
                    data.Note = obj.Note;

                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.ContractSchedulePays.Update(data);
                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_UPDATE_PAYMENT_SCHEDULE_SUCCESSFULLY"]);

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                        await InsertPOCusTracking(contractHeader);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]);
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public async Task<JsonResult> DeleteContractSchedulePay(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ContractSchedulePays.FirstOrDefault(x => x.Id == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.ContractSchedulePays.Update(data);
                await _context.SaveChangesAsync();
                msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_SUCCESSFULLY_DELETED_THE_PAYMENT"]);

                var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(data.ContractCode));
                if (contractHeader != null)
                    await InsertPOCusTracking(contractHeader);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        #endregion

        #region Contract Payment
        public class JTableModelPayment : JTableModel
        {
            public string ContractCode { get; set; }
            public string PaymentName { get; set; }
            public string PaymentType { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
        }
        [HttpPost]
        public object JTableContractTabPayment([FromBody] JTableModelPayment jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName", "DeadLine");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        //&& x.IsPlan == false
                                                        && x.ObjType == "CONTRACT"
                                                        && x.ObjCode == jTablePara.ContractCode
                                                        //&& (x.CatCode == "ADVANCE_CONTRACT" || x.CatCode == "PAY_CONTRACT")
                                                        //&& x.AetType == "Receipt"
                                                        && (string.IsNullOrEmpty(jTablePara.PaymentName) || x.Title.Contains(jTablePara.PaymentName))
                                                        )
                         join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_FUND")) on a.StatusObject equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         orderby a.CreatedTime descending
                         select new ViewAccEntry
                         {
                             Id = a.Id,
                             AetCode = a.AetCode,
                             Title = a.Title,
                             AetType = a.AetType,
                             AetTypeName = a.AetType == "Expense" ? "Chi" : "Thu",
                             CatCode = a.CatCode,
                             CatName = b.CatName,
                             DeadLine = a.DeadLine,
                             Payer = a.Payer,
                             Receiptter = a.Receiptter,
                             Total = a.Total,
                             Currency = a.Currency,
                             CreatedBy = a.CreatedBy,
                             SCreatedTime = a.CreatedTime.HasValue ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : "",
                             Status = a.StatusObjectLog,
                             AetRelativeType = a.AetRelativeType,
                             AetDescription = a.AetDescription,
                             IsApprove = 0,
                             TimeAlive = "",
                             IsOutTime = 0,
                             SLastLog = JsonConvert.SerializeObject(a.ListStatusObjectLog.LastOrDefault())
                         }).ToList();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "AetCode", "Title",
                "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName",
                "DeadLine", "IsApprove", "TimeAlive", "IsOutTime", "StatusObject", "SLastLog");

            return Json(jdata);
        }

        [HttpPost]
        public object GetTotalPayment([FromBody] JTableModelPayment jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return new { totalReceiptCus = 0, totalContract = 0, totalDebit = 0, totalReceipts = 0, totalExpense = 0 };
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        //&& x.IsPlan == false
                                                        && x.ObjType == "CONTRACT"
                                                        && x.ObjCode == jTablePara.ContractCode
                                                        //&& x.IsCompleted == true
                                                        //&& (x.StatusObject == "FUND_APPROVED")
                                                        //&& (x.CatCode == "ADVANCE_CONTRACT" || x.CatCode == "PAY_CONTRACT")
                                                        //&& x.AetType == "Receipt"
                                                        )
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        orderby a.CreatedTime descending
                        select new
                        {
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetTypeName = a.AetType == "Expense" ? "Chi" : "Thu",
                            CatCode = a.CatCode,
                            CatName = b.CatName,
                            DeadLine = a.DeadLine,
                            Payer = a.Payer,
                            Receiptter = a.Receiptter,
                            Total = a.Total,
                            Currency = a.Currency,
                            CreatedBy = a.CreatedBy,
                            Status = a.Status,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            IsApprove = 0,
                            TimeAlive = "",
                            IsOutTime = 0,
                            IsEndActApproved = a.ListStatusObjectLog.GroupBy(x => x.ObjectRelative)
                                     .Select(g => new JsonLog
                                     {
                                         Code = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().Code,
                                         Name = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().Name,
                                         ObjectRelative = g.Key,
                                         ObjectType = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().ObjectType,
                                         CreatedBy = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().CreatedBy,
                                         CreatedTime = g.OrderByDescending(x => x.CreatedTime).FirstOrDefault().CreatedTime
                                     })
                                     .Any(x =>
                                         x.ObjectType == EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.EndAct)
                                         && x.Code == "STATUS_ACTIVITY_END")
                        };
            var isVND = true;
            foreach (var item in query)
            {
                if (item.Currency != "VND")
                {
                    isVND = false;
                    break;
                }

            }
            //var totalReceipts = query.Where(x => x.AetType == "Receipt").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            //var totalExpense = query.Where(x => x.AetType == "Expense").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));

            //var totalReceiptCus = query.Where(x => x.AetType == "Receipt").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            //var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == jTablePara.ContractCode);
            //var totalContract = contract.RealBudget;
            //var totalDebit = totalContract - totalReceiptCus;
            //var rs = new { totalReceiptCus, totalContract, totalDebit, totalReceipts, totalExpense, isVND };

            decimal totalReceipt = query.Where(x => x.AetType == "Receipt").Sum(x =>
                x.Currency == "VND"
                    ? x.Total
                    : x.Total * (1 * GetRate(x.Currency)));
            decimal totalExpense = query.Where(x => x.AetType == "Expense").Sum(x =>
                x.Currency == "VND"
                    ? x.Total
                    : x.Total * (1 * GetRate(x.Currency)));
            decimal totalReceiptApproved = query
                .Where(x => x.AetType == "Receipt" && x.IsEndActApproved)
                .Sum(x =>
                    x.Currency == "VND"
                        ? x.Total
                        : x.Total * (1 * GetRate(x.Currency)));
            decimal totalExpenseApproved = query
                .Where(x => x.AetType == "Expense" && x.IsEndActApproved)
                .Sum(x =>
                    x.Currency == "VND"
                        ? x.Total
                        : x.Total * (1 * GetRate(x.Currency)));
            var result = new FuncAccEntryCountModel
            {
                TotalReceipt = totalReceipt,
                TotalExpense = totalExpense,
                TotalSurplus = totalReceipt - totalExpense,
                TotalReceiptApproved = totalReceiptApproved,
                TotalExpenseApproved = totalExpenseApproved,
                TotalSurplusApproved = totalReceiptApproved - totalExpenseApproved,
                IsVnd = true
            };
            return Json(result);
        }

        private decimal GetRate(string currency)
        {
            var rateExist = _context.FundExchagRates.Any(z =>
                z.Currency != null && z.IsDeleted == false && z.Currency.Equals(currency));
            if (rateExist)
            {
                return _context.FundExchagRates.FirstOrDefault(z =>
                    z.Currency != null && z.IsDeleted == false && z.Currency.Equals(currency)).Rate;
            }
            else
            {
                return 1;
            }
        }

        [HttpPost]
        public object GetPaymentType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PaymentEnum>.GetDisplayValue(PaymentEnum.PayType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetObjPayment()
        {
            var listSupplier = _context.Suppliers.Where(x => !x.IsDeleted).Select(x => new { Id = x.SupID, Name = x.SupName });
            var listCustomer = _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { Id = x.CusID, Name = x.CusName });
            var list = listSupplier.Concat(listCustomer);
            return list;
        }


        [HttpPost]
        public object CheckLimitTotal(string aetCode)
        {
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.IsDeleted == false && x.AetCode == aetCode && x.AetType == "Expense");
            var listChild = _context.FundAccEntrys
                                    .Where(x => x.IsDeleted == false && x.AetRelative == aetCode && x.AetType == "Expense")
                                    .Sum(x => x.Total);

            var obj = new
            {
                Currency = data.Currency,
                IsLimitTotal = data.AetType == "Expense" ? true : false,
                LimitTotal = data.Total - listChild,
            };
            return obj;
        }
        [HttpPost]
        public object CheckLimitTotalUpdate(string aetCode, string aetCodeChild)
        {
            var data = _context.FundAccEntrys.FirstOrDefault(x => x.IsDeleted == false && x.AetCode == aetCode && x.AetType == "Expense");
            var listChild = _context.FundAccEntrys
                                    .Where(x => x.IsDeleted == false && x.AetCode != aetCodeChild && x.AetRelative == aetCode && x.AetType == "Expense")
                                    .Sum(x => x.Total);

            var obj = new
            {
                Currency = data.Currency,
                IsLimitTotal = data.AetType == "Expense" ? true : false,
                LimitTotal = data.Total - listChild,
            };
            return obj;
        }
        #endregion

        #region Contract relative
        public class JTableModelContractOther : JTableModel
        {
            public string ContractCode { get; set; }
        }

        [HttpGet]
        public object GetListContractOrther(string contractCode)
        {
            var query = _context.PoSaleHeaders.Where(x => x.ContractCode != contractCode && x.IsDeleted == false).Select(x => new
            {
                Code = x.ContractCode,
                Name = x.Title,
            });
            return query;
        }

        //[HttpGet]
        //public object GetListContractOrther(string contractCode)
        //{
        //    var query = (_context.PoSaleHeaders.Where(x => x.ContractCode != contractCode && x.IsDeleted == false).Select(x => new
        //                {
        //                    Code = x.ContractCode,
        //                    Name = x.Title,
        //                    Type = "PO_SALE",
        //                    TypeName = "HĐ bán",
        //                }))
        //                .Union(_context.PoBuyerHeaders.Where(x => x.IsDeleted == false).Select(x => new
        //                {
        //                    Code = x.PoSupCode,
        //                    Name = x.PoTitle,
        //                    Type = "PO_BUYER",
        //                    TypeName = "HĐ mua",
        //                }));
        //    return query;
        //}

        [HttpPost]
        public object GetListRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractRelative)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object JTableContractRelated([FromBody] JTableModelContractOther jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "ContractHeaderID", "ContractCode", "Title", "CreatedBy", "CreatedTime", "Status");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == jTablePara.ContractCode);

            var listContractRelative = !string.IsNullOrEmpty(contract.ContractRelative) ? JsonConvert.DeserializeObject<List<ContractRelativeModel>>(contract.ContractRelative) : new List<ContractRelativeModel>();
            var query = (from a in listContractRelative
                         join b in _context.PoSaleHeaders on a.ContractCode equals b.ContractCode
                         select new
                         {
                             a.Id,
                             a.ContractCode,
                             b.Title,
                             a.CreatedBy,
                             a.CreatedTime,
                             a.Relative,
                             RelativeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Relative).ValueSet ?? "",
                         }).AsQueryable();
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ContractCode", "Title", "CreatedBy", "CreatedTime", "RelativeText", "Relative");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> InsertRelative([FromBody] RelativeModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == obj.ContractCode && x.IsDeleted == false);
                if (contract != null)
                {
                    obj.ContractRelative.CreatedBy = ESEIM.AppContext.UserName;
                    obj.ContractRelative.CreatedTime = DateTime.Now;
                    var listContractRelative = !string.IsNullOrEmpty(contract.ContractRelative) ? JsonConvert.DeserializeObject<List<ContractRelativeModel>>(contract.ContractRelative) : new List<ContractRelativeModel>();
                    obj.ContractRelative.Id = listContractRelative.Any() ? listContractRelative.Max(x => x.Id) + 1 : 1;
                    var checkExistRelative = listContractRelative.FirstOrDefault(x => x.ContractCode == obj.ContractRelative.ContractCode);
                    if (checkExistRelative == null)
                    {
                        listContractRelative.Add(obj.ContractRelative);
                        contract.ContractRelative = JsonConvert.SerializeObject(listContractRelative);
                        _context.PoSaleHeaders.Update(contract);
                        await _context.SaveChangesAsync();
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_SUCCESS"]);

                        //Update fiel log
                        await InsertPOCusTracking(contract);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_CONTRACR_EXTED"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_CONTRACR_NOT_EXTED"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_FAILED"]);
            };
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateRelative([FromBody] RelativeModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == obj.ContractCode && x.IsDeleted == false);
                if (contract != null)
                {
                    var listContractRelative = !string.IsNullOrEmpty(contract.ContractRelative) ? JsonConvert.DeserializeObject<List<ContractRelativeModel>>(contract.ContractRelative) : new List<ContractRelativeModel>();
                    var relative = listContractRelative.FirstOrDefault(x => x.Id == obj.ContractRelative.Id);
                    if (relative != null)
                    {
                        var checkExist = listContractRelative.FirstOrDefault(x => x.ContractCode == obj.ContractRelative.ContractCode && x.Id != obj.ContractRelative.Id);
                        if (checkExist == null)
                        {
                            relative.ContractCode = obj.ContractRelative.ContractCode;
                            relative.Relative = obj.ContractRelative.Relative;
                            contract.ContractRelative = JsonConvert.SerializeObject(listContractRelative);
                            _context.PoSaleHeaders.Update(contract);
                            await _context.SaveChangesAsync();
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_UPDATE_SUCCESS"]);

                            //Update fiel log
                            await InsertPOCusTracking(contract);
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_CONTRACR_EXTED"]);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_THE_RELATED_CONTRACT_DOES_NOT_EXIST"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_FAILED"]);
            };
            return Json(msg);
        }

        [HttpGet]
        public async Task<JsonResult> DeleteRelative(int id, string contractCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == contractCode && x.IsDeleted == false);
                if (contract != null)
                {
                    var listContractRelative = !string.IsNullOrEmpty(contract.ContractRelative) ? JsonConvert.DeserializeObject<List<ContractRelativeModel>>(contract.ContractRelative) : new List<ContractRelativeModel>();
                    var relative = listContractRelative.FirstOrDefault(x => x.Id == id);
                    if (relative != null)
                    {
                        listContractRelative.Remove(relative);
                        contract.ContractRelative = JsonConvert.SerializeObject(listContractRelative);
                        _context.PoSaleHeaders.Update(contract);
                        await _context.SaveChangesAsync();
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_DELETE_SUCCESS"]);

                        //Update fiel log
                        await InsertPOCusTracking(contract);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_CONTRACR_NOT_EXTED"]);
                    }
                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CONTRACT_CURD_TAB_ATTRIBUTE"]);// "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        #endregion

        #region Contract Member
        public class JTableModelContractMembers : JTableModel
        {
            public string ContractCode { get; set; }
        }
        [HttpPost]
        public object JTableContractMember([FromBody] JTableModelContractMembers jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "assigner", "time", "assignee", "task");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ContractMemberTags
                        where a.ContractCode.Equals(jTablePara.ContractCode) && a.IsDeleted == false
                        select new
                        {
                            id = a.Id,
                            assigner = a.Assigner,
                            time = a.AssignerTime,
                            assignee = a.Assignee,
                            task = a.TaskCode,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "assigner", "time", "assignee", "task");
            return Json(jdata);
        }
        #endregion

        #region Contract Activity
        public class JTableCardJob : JTableModel
        {
            public string ContractCode { get; set; }
        }

        [HttpPost]
        public JsonResult JTableContractCardjob([FromBody] JTableCardJob jtablePara)
        {
            if (string.IsNullOrEmpty(jtablePara.ContractCode))
            {
                return Json(JTableHelper.JObjectTable(new List<object>(), jtablePara.Draw, 0, "Id", "CardCode", "CardName", "Contract"));
            }
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            var query = from a in _context.CardMappings
                        join b in _context.WORKOSCards on a.CardCode equals b.CardCode
                        where b.IsDeleted == false && a.ContractCode.Equals(jtablePara.ContractCode)
                        select b;
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBegin).Take(jtablePara.Length).Select(x => new
            {
                x.CardID,
                x.CardCode,
                x.CardName,
                x.BeginTime,
                x.EndTime,
                Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet ?? "",
                x.Completed,
                x.Cost,
                Quantitative = string.Concat(x.Quantitative, _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.Unit).ValueSet ?? ""),
                ListName = _context.WORKOSLists.FirstOrDefault(y => y.ListCode == x.ListCode && y.IsDeleted == false).ListName ?? "",
                BoardName = _context.WORKOSBoards.FirstOrDefault(y => y.BoardCode == (_context.WORKOSLists.FirstOrDefault(z => z.ListCode == x.ListCode && z.IsDeleted == false).BoardCode ?? "")).BoardName ?? ""
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "CardID", "CardCode", "CardName", "BeginTime", "EndTime", "Status", "Completed", "Cost", "Quantitative", "ListName", "BoardName");
            return Json(jdata);
        }

        #endregion

        #region Contract Service
        public class JTableService : JTableModel
        {
            public string ContractCode { get; set; }
            public string Service { get; set; }
        }
        [HttpGet]
        public object GetService()
        {
            var list = (from a in _context.ServiceCategorys
                        where a.IsDeleted == false
                        && a.ServiceCode != "DV_000"
                        select new
                        {
                            Code = a.ServiceCode,
                            Name = a.ServiceName,
                            Unit = a.Unit,
                            Type = a.ServiceType,
                            ServiceGroup = a.ServiceGroup,

                        }).ToList();
            return list;

        }
        [HttpGet]
        public object GetServiceUnit()
        {
            var list = (from a in _context.CommonSettings
                        where a.IsDeleted == false
                        && a.Group == EnumHelper<ServiceEnum>.GetDisplayValue(ServiceEnum.ServiceUnit)
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        }).ToList();
            return list;

        }


        [HttpPost]
        public async Task<JsonResult> InsertService([FromBody] ContractServiceDetail obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ContractServiceDetails.FirstOrDefault(x => x.IsDeleted == false && x.ServiceCode == obj.ServiceCode && x.ContractCode == obj.ContractCode);
                if (data == null)
                {
                    var service = _context.ServiceCategorys.FirstOrDefault(x => x.IsDeleted == false && x.ServiceCode == obj.ServiceCode);
                    ContractServiceDetail detail = new ContractServiceDetail();
                    detail.ContractCode = obj.ContractCode;
                    detail.ServiceCode = obj.ServiceCode;
                    detail.ServiceName = obj.ServiceName;
                    detail.CreatedBy = ESEIM.AppContext.UserName;
                    detail.CreatedTime = DateTime.Now;
                    detail.IsDeleted = false;
                    detail.Unit = obj.Unit;
                    detail.Tax = obj.Tax;
                    detail.Cost = obj.Cost;
                    detail.Quantity = obj.Quantity;
                    detail.Note = obj.Note;


                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                    if (contractHeader != null)
                    {
                        //Sửa tổng giá trị hợp đồng
                        contractHeader.Budget = contractHeader.Budget + (obj.Cost * obj.Quantity);
                        contractHeader.RealBudget = contractHeader.RealBudget + (obj.Cost * obj.Quantity) * (1 + (decimal)obj.Tax / 100);
                        contractHeader.LastBudget = contractHeader.RealBudget * (1 - contractHeader.Discount / 100 - contractHeader.Commission / 100);
                        _context.PoSaleHeaders.Update(contractHeader);
                        msg.Object = new
                        {
                            contractHeader.Budget,
                            contractHeader.RealBudget,
                            TaxDetail = contractHeader.RealBudget - contractHeader.Budget,
                            contractHeader.LastBudget
                        };

                        //Thêm fiel đồng tiền thanh toán của detail
                        detail.Currency = contractHeader.Currency;
                    }

                    _context.ContractServiceDetails.Add(detail);

                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_SERVICE_ADD_SUCCESS"]);//"Thêm thành công dịch vụ";

                    if (contractHeader != null)
                    {
                        //Thêm vào Tracking - Thêm sau khi DB đã được lưu
                        await InsertPOCusTracking(contractHeader);
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_NOT_ADD_SERVICE_BEFORE_THAT"]);// "Không thể thêm dịch vụ đã thêm vào trước đó";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_SERVICE_ADD_ERROR"]);//"Có lỗi khi thêm dịch vụ";
            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> UpdateService([FromBody] ContractServiceDetail obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var currenrt = _context.ContractServiceDetails.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                var data = _context.ContractServiceDetails.FirstOrDefault(x => x.IsDeleted == false && x.ServiceCode == obj.ServiceCode && x.ContractCode == obj.ContractCode);
                if (currenrt != null)
                {
                    if (data == null || data != null && data.Id == currenrt.Id)
                    {
                        var oldValue = currenrt.Cost * currenrt.Quantity;
                        var oldValueReal = currenrt.Cost * currenrt.Quantity * (1 + (decimal)currenrt.Tax / 100);

                        currenrt.ContractCode = obj.ContractCode;
                        currenrt.ServiceCode = obj.ServiceCode;
                        currenrt.Quantity = obj.Quantity;
                        currenrt.Note = obj.Note;
                        currenrt.Cost = obj.Cost;
                        currenrt.Tax = obj.Tax;
                        currenrt.Unit = obj.Unit;
                        currenrt.Currency = obj.Currency;
                        currenrt.UpdatedBy = ESEIM.AppContext.UserName;
                        currenrt.UpdatedTime = DateTime.Now;

                        var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                        if (contractHeader != null)
                        {
                            //Sửa tổng giá trị hợp đồng
                            contractHeader.Budget = contractHeader.Budget + (obj.Cost * obj.Quantity) - oldValue;
                            contractHeader.RealBudget = contractHeader.RealBudget + (obj.Cost * obj.Quantity) * (1 + (decimal)obj.Tax / 100) - oldValueReal;
                            contractHeader.LastBudget = contractHeader.RealBudget * (1 - contractHeader.Discount / 100 - contractHeader.Commission / 100);
                            _context.PoSaleHeaders.Update(contractHeader);
                            msg.Object = new
                            {
                                contractHeader.Budget,
                                contractHeader.RealBudget,
                                TaxDetail = contractHeader.RealBudget - contractHeader.Budget,
                                contractHeader.LastBudget
                            };

                            //Thêm fiel đồng tiền thanh toán của detail
                            currenrt.Currency = contractHeader.Currency;
                        }

                        _context.ContractServiceDetails.Update(currenrt);

                        await _context.SaveChangesAsync();
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_SERVICE_UPDATE_SUCCESS"]);//"Cập nhật thành công dịch vụ";

                        if (contractHeader != null)
                        {
                            //Thêm vào Tracking - Thêm sau khi DB được lưu
                            await InsertPOCusTracking(contractHeader);
                        }
                    }
                    else if (data != null && data.Id != currenrt.Id)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ALREADY_SERVICE_IN_CONTRACT"]);//"Đã có dịch vụ này trong hợp đồng, không thể cập nhật";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_SERVICE_NOT_EXIST_REFRESH"]);//"Dịch vụ không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_SERVICE_ADD_ERROR"]);//"Có lỗi khi thêm dịch vụ";
            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> DeleteServiceDetail(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.ContractServiceDetails.FirstOrDefault(x => x.IsDeleted == false && x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ContractServiceDetails.Update(data);

                    var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(data.ContractCode));
                    if (contractHeader != null)
                    {
                        //Sửa tổng giá trị hợp đồng
                        contractHeader.Budget = contractHeader.Budget - (data.Cost * data.Quantity);
                        contractHeader.RealBudget = contractHeader.RealBudget - (data.Cost * data.Quantity) * (1 + (decimal)data.Tax / 100);
                        contractHeader.LastBudget = contractHeader.RealBudget * (1 - contractHeader.Discount / 100 - contractHeader.Commission / 100);
                        _context.PoSaleHeaders.Update(contractHeader);
                        msg.Object = new
                        {
                            contractHeader.Budget,
                            contractHeader.RealBudget,
                            TaxDetail = contractHeader.RealBudget - contractHeader.Budget,
                            contractHeader.LastBudget
                        };
                    }

                    await _context.SaveChangesAsync();
                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_SERVICE_DELETE_SUCCESS"]);//"Xóa thành công dịch vụ";

                    if (contractHeader != null)
                    {
                        //Thêm vào Tracking - Thêm sau khi DB được lưu
                        await InsertPOCusTracking(contractHeader);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ALREADY_EXIST_SERVICE_IN_CONTRACT"]);//"Dịch vụ không tồn tại trong hợp đồng";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ALREADY_EXIST_SERVICE_IN_CONTRACT"]);//"Có lỗi khi thêm dịch vụ";
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetServiceDetail(int Id)
        {

            var data = _context.ContractServiceDetails.FirstOrDefault(x => x.IsDeleted == false && x.Id == Id);
            return data;
        }
        [HttpPost]
        public JsonResult JTableContractService([FromBody] JTableService jtablePara)
        {
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            var query = from a in _context.PoSaleHeaders
                        join b in _context.ContractServiceDetails on a.ContractCode equals b.ContractCode
                        join c in _context.ServiceCategorys on b.ServiceCode equals c.ServiceCode into c2
                        from c in c2.DefaultIfEmpty()
                        where a.IsDeleted == false && b.IsDeleted == false &&
                              a.ContractCode == jtablePara.ContractCode
                              && ((string.IsNullOrEmpty(jtablePara.Service)) || (!string.IsNullOrEmpty(jtablePara.Service) && (
                              b.ServiceCode.ToLower().Contains(jtablePara.Service.ToLower()) ||
                              (c != null && c.ServiceName.ToLower().Contains(jtablePara.Service.ToLower()))
                              )))
                        select new
                        {
                            b.Id,
                            b.ServiceCode,
                            ServiceName = (c != null ? c.ServiceName : ""),
                            b.Quantity,
                            Unit = b.Unit,
                            b.Cost,
                            b.Currency,
                            b.Tax,
                            b.Note
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBegin).Take(jtablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "Id", "ServiceCode", "ServiceName", "Quantity", "Unit", "Cost", "Currency", "Tax", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public object GetCostByServiceAndCondition()
        {
            try
            {
                var query1 = GetServiceConditionPrice();
                var lisst = query1.ToList();
                if (query1 != null)
                {
                    var query = from a in _context.ServiceCategorys.Where(x => x.IsDeleted == false)
                                join b in lisst on a.ServiceCode equals b.ServiceCode into b2
                                from b1 in b2.DefaultIfEmpty()
                                select new GetCostModel
                                {
                                    ServiceCode = a.ServiceCode,
                                    Condition = (b1 != null ? b1.Condition : ""),
                                    Price = (b1 != null ? b1.Price : -1),
                                    ConditionName = (b1 != null ? b1.ConditionName : "Không xác định"),
                                    ConditionRange = (b1 != null ? b1.ConditionRange : "Không xác định")
                                };

                    return Json(query.ToList());
                }
                else
                {
                    var query = from a in _context.ServiceCategorys.Where(x => x.IsDeleted == false)
                                select new GetCostModel
                                {
                                    ServiceCode = a.ServiceCode,
                                    Condition = "",
                                    Price = -999,
                                    ConditionName = "Không xác định",
                                    ConditionRange = "Không xác định"
                                };

                    return Json(query.ToList());
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        #endregion

        #region Contract Product

        [HttpPost]
        public object GetServiceCondition()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_CONDITION").Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Priority = x.Priority });
            return data;
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
                         //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
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
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
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

        [HttpGet]
        public JsonResult GetPriceOption(string customerCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var list = new List<Properties>();
            var check = _context.Customerss.FirstOrDefault(x => x.CusCode == customerCode && !x.IsDeleted);
            if (check != null)
            {
                if (check.Role == EnumHelper<CustomerRoleEnum>.GetDisplayValue(CustomerRoleEnum.Agency))
                {
                    var catelogue = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Catelogue),
                        Name = PriceAgency.Catelogue.DescriptionAttr(),
                    };
                    list.Add(catelogue);

                    var airline = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Airline),
                        Name = PriceAgency.Airline.DescriptionAttr(),
                    };
                    list.Add(airline);

                    var sea = new Properties
                    {
                        Code = EnumHelper<PriceAgency>.GetDisplayValue(PriceAgency.Sea),
                        Name = PriceAgency.Sea.DescriptionAttr(),
                    };
                    list.Add(sea);
                }
                else
                {
                    var airline = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Airline),
                        Name = PriceRetail.Airline.DescriptionAttr(),
                    };
                    list.Add(airline);

                    var buid = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Buid),
                        Name = PriceRetail.Buid.DescriptionAttr(),
                    };
                    list.Add(buid);

                    var noBuid = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuid),
                        Name = PriceRetail.NoBuid.DescriptionAttr(),
                    };
                    list.Add(noBuid);

                    var noBuidAirline = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuidAirline),
                        Name = PriceRetail.NoBuidAirline.DescriptionAttr(),
                    };
                    list.Add(noBuidAirline);

                    var noBuidSea = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.NoBuidSea),
                        Name = PriceRetail.NoBuidSea.DescriptionAttr(),
                    };
                    list.Add(noBuidSea);

                    var sea = new Properties
                    {
                        Code = EnumHelper<PriceRetail>.GetDisplayValue(PriceRetail.Sea),
                        Name = PriceRetail.Sea.DescriptionAttr(),
                    };
                    list.Add(sea);
                }
                msg.Object = list;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<object> InsertProduct([FromBody] PoSaleProductDetail obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.ProductCode.ToLower()))
                {
                    var isLockDetail = IsLockDetail(obj.ContractCode);
                    if (isLockDetail == false)
                    {
                        var checkInReqImp = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                                             join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                                             where b.PoCode.Equals(obj.ContractCode)
                                             select new
                                             {
                                                 a.ProductCode
                                             }).ToList();

                        if (checkInReqImp.Count > 0)
                        {
                            msg.Error = true;
                            msg.Title = string.Format(_stringLocalizer["CONTRACT_MSG_PO_IN_YC"]);
                            return Json(msg);
                        }


                        var data = _context.PoSaleProductDetails.FirstOrDefault(x => x.IsDeleted == false && x.ProductCode == obj.ProductCode && x.ContractCode == obj.ContractCode);
                        if (data == null)
                        {

                            PoSaleProductDetail detail = new PoSaleProductDetail();
                            detail.ContractCode = obj.ContractCode;
                            detail.ProductCode = obj.ProductCode;
                            detail.ProductName = obj.ProductName;
                            detail.CreatedBy = ESEIM.AppContext.UserName;
                            detail.CreatedTime = DateTime.Now;
                            detail.IsDeleted = false;
                            detail.Unit = obj.Unit;
                            detail.Tax = obj.Tax;
                            detail.Cost = obj.Cost;
                            detail.Quantity = obj.Quantity;
                            detail.QuantityNeedExport = obj.Quantity;
                            detail.PriceType = obj.PriceType;
                            detail.ProductType = obj.ProductType;
                            //detail.Commission = obj.Commission;
                            //detail.CustomFee = obj.CustomFee;
                            //detail.Discount = obj.Discount;
                            detail.Note = obj.Note;
                            _context.PoSaleProductDetails.Add(detail);
                            await _context.SaveChangesAsync();
                            msg.Error = false;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_PRODUCT_SUCCESS"]);//"Thêm thành công sản phẩm";

                            var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == obj.ContractCode);

                            if (contract != null)
                            {
                                //Convert Json to Object
                                var jsonPack = JsonConvert.DeserializeObject<JsonPackValue>(obj.PackJson);
                                var quantityEx = ExchangeQuantityByPack(obj.ProductCode, jsonPack, obj.Unit, obj.Pack);



                                string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@ContractCode", "@EstimateDate", "@CntProductInStock" };
                                object[] val = new object[] { obj.ProductCode, obj.Quantity, obj.ProductType, obj.ContractCode, contract.EstimateTime.Value.Date, quantityEx };
                                _repositoryService.CallProc("PR_INSERT_PO_SALE_PRODUCT_DETAIL", param, val);

                                int? count = 0;
                                count = _context.ForecastProductInStocks.Where(x => x.ProductCode == obj.ProductCode && x.ProductType == obj.ProductType && x.ForecastDate.Value.Date == contract.EstimateTime.Value.Date).Sum(x => x.CntForecast);

                                int count1 = (count == null ? 0 : count.Value);
                                if (detail.Quantity + count1 > 0)
                                {
                                    var success = await InsertChangeProductLog(contract, obj.ProductCode, obj.ProductType, count1, contract.EstimateTime.Value.Date);
                                }
                                else
                                {
                                    var success = await InsertChangeProductLog(contract, obj.ProductCode, obj.ProductType, -1 * detail.Quantity, contract.EstimateTime.Value.Date);
                                }
                                if (count <= 0)
                                {
                                    msg.Error = true;
                                    msg.ID = count1;
                                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_PRODUCT_SUCCESS"]) + " <br/> " + String.Format(_stringLocalizer["CONTRACT_CURD_MSG_WARNING"]) + " <br/> - " + String.Format(_stringLocalizer["CONTRACT_CURD_MSG_PLEASE_ORDER"]);
                                }
                                await UpdateRequestImpDetail(obj.ContractCode);
                                var contractHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                                if (contractHeader != null)
                                {
                                    //Sửa tổng giá trị hợp đồng
                                    contractHeader.Budget = contractHeader.Budget + (obj.Cost * obj.Quantity);
                                    contractHeader.RealBudget = contractHeader.RealBudget + (obj.Cost * obj.Quantity) * (1 + (decimal)obj.Tax / 100);
                                    contractHeader.LastBudget = contractHeader.RealBudget * (1 - contractHeader.Discount / 100 - contractHeader.Commission / 100);
                                    //Sửa trạng thái IsChangeProduct nếu hợp đồng đã được duyệt
                                    if (contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REQUEST" && contract.Status != "CONTRACT_STATUS_PO_CUS_FACCO_REJECTED" && contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REJECTED")
                                    {
                                        contract.IsChangeProduct = true;
                                    }
                                    _context.PoSaleHeaders.Update(contractHeader);
                                    msg.Object = new
                                    {
                                        contractHeader.Budget,
                                        contractHeader.RealBudget,
                                        TaxDetail = contractHeader.RealBudget - contractHeader.Budget,
                                        LastBudget = contractHeader.LastBudget
                                    };
                                    await _context.SaveChangesAsync();
                                    //Thêm vào Tracking
                                    await InsertPOCusTracking(contractHeader);
                                }
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_PRODUCT_NOT_ADD"]);//"Không thể thêm sản phẩm đã thêm vào trước đó";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_PRODUCT_ADD_ERROR"]);//"Có lỗi khi thêm sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateProductInContract([FromBody] PoSaleProductDetail obj)
        {
            JMessage msg = new JMessage() { Error = false };
            decimal oldQuantity = 0;
            try
            {
                var check = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(obj.ContractCode));
                if (check != null)
                {
                    var isLockDetail = IsLockDetail(check.ContractCode);
                    if (isLockDetail == false)
                    {
                        var data = _context.PoSaleProductDetails.FirstOrDefault(x => x.IsDeleted == false && x.ProductCode == obj.ProductCode && x.ContractCode == obj.ContractCode);
                        if (data != null)
                        {
                            var checkInReqImp = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                                                 join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                                                 where a.ProductCode.Equals(data.ProductCode) && a.ProductType.Equals(data.ProductType) && b.PoCode.Equals(data.ContractCode)
                                                 select new
                                                 {
                                                     a.ProductCode
                                                 }).ToList();

                            if (checkInReqImp.Count > 0)
                            {
                                msg.Error = true;
                                msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_ORDER_ARE_NOT_EDITED_OR_DELETED"]);
                                return Json(msg);
                            }

                            var oldValue = data.Cost * data.Quantity;
                            var oldValueReal = data.Cost * data.Quantity * (1 + (decimal)data.Tax / 100);

                            oldQuantity = data.Quantity;
                            data.UpdatedBy = ESEIM.AppContext.UserName;
                            data.UpdatedTime = DateTime.Now;
                            data.Unit = obj.Unit;
                            data.Tax = obj.Tax;
                            data.Cost = obj.Cost;
                            data.Quantity = obj.Quantity;
                            data.QuantityNeedExport = obj.Quantity;
                            data.PriceType = obj.PriceType;
                            data.Note = obj.Note;
                            _context.PoSaleProductDetails.Update(data);
                            await _context.SaveChangesAsync();
                            msg.Error = false;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_PRODUCT_UPDATE_SUCCESS"]);//"Cập nhật thành công sản phẩm";

                            var contract = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == obj.ContractCode);
                            if (contract != null && oldQuantity != obj.Quantity)
                            {
                                string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                                object[] val = new object[] { obj.ProductCode, oldQuantity, obj.Quantity, data.ProductType, contract.EstimateTime.Value.Date };
                                _repositoryService.CallProc("PR_UPDATE_CONTRACT_DETAIL", param, val);

                                //var success = InsertChangeProductLog(contract, obj.ProductCode, obj.ProductType, data.Quantity, contract.EstimateTime.Value.Date);
                                await UpdateChangeProductLog(contract, obj.ProductCode, data.ProductType, oldQuantity, obj.Quantity, contract.EstimateTime.Value.Date);
                                int? count = 0;
                                var it = _context.ForecastProductInStocks.Where(x => x.ProductCode == obj.ProductCode && x.ProductType == data.ProductType && x.ForecastDate.Value.Date == contract.EstimateTime.Value.Date).ToList();

                                count = _context.ForecastProductInStocks.Where(x => x.ProductCode == obj.ProductCode && x.ProductType == data.ProductType && x.ForecastDate.Value.Date == contract.EstimateTime.Value.Date).Sum(x => x.CntForecast);

                                if (count <= 0)
                                {
                                    msg.Error = true;
                                    msg.ID = count ?? 0;
                                    msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_SUCCESSFULLY_REPAIRED_THE_PRODUCT"]) + " <br/> " + String.Format(_stringLocalizer["CONTRACT_CURD_MSG_WARNING"]) + " <br/> - " + String.Format(_stringLocalizer["CONTRACT_CURD_MSG_PLEASE_ORDER"]);
                                }
                                await UpdateRequestImpDetail(obj.ContractCode);
                            }
                            if (contract != null)
                            {
                                //Sửa tổng giá trị hợp đồng
                                contract.Budget = contract.Budget + (obj.Cost * obj.Quantity) - oldValue;
                                contract.RealBudget = contract.RealBudget + (obj.Cost * obj.Quantity) * (1 + (decimal)obj.Tax / 100) - oldValueReal;
                                contract.LastBudget = contract.RealBudget * (1 - contract.Discount / 100 - contract.Commission / 100);
                                //Sửa trạng thái IsChangeProduct nếu hợp đồng đã được duyệt
                                if (contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REQUEST" && contract.Status != "CONTRACT_STATUS_PO_CUS_FACCO_REJECTED" && contract.Status != "CONTRACT_STATUS_PO_CUS_CUS_REJECTED")
                                {
                                    contract.IsChangeProduct = true;
                                }
                                _context.PoSaleHeaders.Update(contract);
                                await _context.SaveChangesAsync();
                                msg.Object = new
                                {
                                    contract.Budget,
                                    contract.RealBudget,
                                    TaxDetail = contract.RealBudget - contract.Budget,
                                    contract.LastBudget,
                                };

                                //Thêm vào field log
                                await InsertPOCusTracking(contract);
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_PRODUCT_IN_CONTRACT_REFRESH"]);//"Không tồn tại sản phẩm này trong hợp đồng, vui lòng làm mới trang";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_CANNOT_BE_UPDATED"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_CONTRACT_NOT_FOUND"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_TAB_PRODUCT_ADD_ERROR"]);//"Có lỗi khi thêm sản phẩm";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetItemProductInContract(string contractCode, string productCode, string productType)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                //var query = (from a in _context.VHisImpProducts
                //             where a.PoCusCode == contractCode
                //                    && a.ProductCode == productCode
                //                    && a.ProductType == productType
                //             select new
                //             {
                //                 SupName = a.SupName,
                //                 Quantity = a.QuantityExp,
                //                 UnitName = a.UnitName,
                //                 UnitPrice = a.SupPrice,
                //                 Currency = a.CurrencyName,
                //             });
                var query = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted && x.ProductCode == productCode && x.ProductType == productType)
                             join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && x.PoCode == contractCode) on a.ReqCode equals b.ReqCode
                             join c1 in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             join d1 in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals d1.SupCode into d2
                             from d in d2.DefaultIfEmpty()
                             join e1 in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.ProductCode == productCode && x.ProductType == productType) on a.ReqCode equals e1.ReqCode into e2
                             from e in e2.DefaultIfEmpty()
                             select new
                             {
                                 SupName = d != null ? d.SupName : "",
                                 Quantity = a.Quantity,
                                 UnitName = c != null ? c.ValueSet : "",
                                 Status = e != null ? "Đã đặt hàng" : "Chưa đặt hàng",
                                 UnitPrice = e != null ? e.UnitPrice : null,
                                 Currency = e != null ? "VNĐ" : null,
                             });
                msg.Object = query;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["MSG_LOAD_FAIL"], _stringLocalizer["USER_USERNAME"].Value.ToLower());
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult GetCostTotalContract()
        {
            DateTime now = DateTime.Now;
            var query = from a in _context.ServiceCategoryCostHeaders.Where(x => x.IsDeleted == false)
                        join b in _context.ServiceCategoryCostConditions.Where(x => x.IsDeleted == false) on a.HeaderCode equals b.HeaderCode

                        where (a.EffectiveDate != null && a.EffectiveDate.Date <= now.Date)
                        && (a.ExpiryDate == null || (a.ExpiryDate != null && now.Date < a.ExpiryDate.Date))
                        && b.ServiceCatCode == "DV_000"
                        select new
                        {
                            Price = b.Rate,
                            b.ObjFromValue,
                            b.ObjToValue
                        };

            return Json(query.ToList());
        }

        [NonAction]
        public IEnumerable<GetCostModel> GetServiceConditionPrice()
        {
            DateTime now = DateTime.Now;
            var query = from a in _context.ServiceCategoryCostHeaders.Where(x => x.IsDeleted == false)
                        join b in _context.ServiceCategoryCostConditions.Where(x => x.IsDeleted == false) on a.HeaderCode equals b.HeaderCode
                        join c in _context.CommonSettings on b.ObjectCode equals c.CodeSet into c2
                        from c in c2.DefaultIfEmpty()
                        where (a.EffectiveDate != null && a.EffectiveDate.Date <= now.Date)
                        && (a.ExpiryDate == null || (a.ExpiryDate != null && now.Date < a.ExpiryDate.Date))
                        && c.Group == "SERVICE_CONDITION"
                        select new GetCostModel
                        {
                            ServiceCode = b.ServiceCatCode,
                            Condition = b.ObjectCode,
                            Price = b.Price,
                            ConditionName = (c != null ? c.ValueSet : ""),
                            ConditionRange = (b.ObjFromValue + " -> " + b.ObjToValue)
                        };
            return query;
        }

        [NonAction]
        public async Task<bool> InsertChangeProductLog(PoSaleHeader contract, string productCode, string productType, decimal impQuantity, DateTime estimate)
        {
            var listLog = new List<LogProductDetail>();
            var json = string.Empty;
            try
            {
                string log = contract.LogProductDetail;
                if (!string.IsNullOrEmpty(log))
                {
                    listLog = JsonConvert.DeserializeObject<List<LogProductDetail>>(log);
                    foreach (var item in listLog)
                    {
                        if (item.ProductCode == productCode && item.ProductType == productType)
                        {
                            listLog.Remove(item);
                            break;
                        }
                    }
                }
                LogProductDetail log1 = new LogProductDetail();
                log1.ContractCode = contract.ContractCode;
                log1.ProductCode = productCode;
                log1.ProductType = productType;
                log1.CreatedTime = DateTime.Now;
                log1.ImpQuantity = (double)impQuantity;
                log1.EstimateDate = estimate;

                listLog.Add(log1);
                json = JsonConvert.SerializeObject(listLog);
                contract.LogProductDetail = json;
                _context.PoSaleHeaders.Update(contract);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
                throw ex;
            }
        }

        [NonAction]
        public async Task<bool> UpdateChangeProductLog(PoSaleHeader contract, string productCode, string productType, decimal oldQuantity, decimal newQuantity, DateTime estimate)
        {
            decimal impQuantity = oldQuantity - newQuantity;
            // impQuantity: Chêch lệch giữa 2 lần sửa đổi
            var listLog = new List<LogProductDetail>();
            var json = string.Empty;
            try
            {
                string log = contract.LogProductDetail;
                LogProductDetail item1 = null;
                if (!string.IsNullOrEmpty(log))
                {
                    listLog = JsonConvert.DeserializeObject<List<LogProductDetail>>(log);
                    foreach (var item in listLog)
                    {
                        if (item.ProductCode == productCode && item.ProductType == productType)
                        {
                            item1 = item;
                            listLog.Remove(item);
                            break;
                        }
                    }
                }
                if (item1 != null)
                {
                    item1.ImpQuantity = item1.ImpQuantity + (double)impQuantity;
                    listLog.Add(item1);
                }
                else
                {
                    LogProductDetail log1 = new LogProductDetail();
                    log1.ContractCode = contract.ContractCode;
                    log1.ProductCode = productCode;
                    log1.ProductType = productType;
                    log1.CreatedTime = DateTime.Now;
                    log1.ImpQuantity = (double)impQuantity;
                    log1.EstimateDate = estimate;
                    listLog.Add(log1);
                }

                json = JsonConvert.SerializeObject(listLog);
                contract.LogProductDetail = json;
                _context.PoSaleHeaders.Update(contract);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
                throw ex;
            }
        }

        [NonAction]
        public async Task<bool> DeleteItemProductLog(PoSaleHeader contract, string productCode, string productType)
        {
            var listLog = new List<LogProductDetail>();
            var json = string.Empty;
            try
            {
                string log = contract.LogProductDetail;
                if (!string.IsNullOrEmpty(log))
                {
                    listLog = JsonConvert.DeserializeObject<List<LogProductDetail>>(log);
                    foreach (var item in listLog)
                    {
                        if (item.ProductCode == productCode && item.ProductType == productType)
                        {
                            listLog.Remove(item);
                            break;
                        }
                    }
                }
                json = JsonConvert.SerializeObject(listLog);
                contract.LogProductDetail = json;
                _context.PoSaleHeaders.Update(contract);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
                throw ex;
            }
        }

        [HttpGet]
        public string GetProjectCode(int id)
        {
            var query = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == id)?.ProjectCode;
            return query;
        }

        [HttpGet]
        public string GetContractFromProject(string projectCode)
        {
            var query = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.PrjCode == projectCode)?.ContractCode;
            return query;
        }

        [HttpGet]
        public bool ChkExistRequestImp(string poCode)
        {
            var query = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted && (x.PoCode == poCode || x.ProjectCode == poCode));
            return query;
        }

        ////Dùng linq join trực tiếp các bảng
        //[HttpGet]
        //public object GetItemProductInContract(string contractCode, string productCode, string productType)
        //{
        //    try
        //    {
        //        var query2 = (from a in _context.MaterialStoreExpGoodsDetails
        //                                    .Where(x => !x.IsDeleted && x.LotProductCode == contractCode && x.ProductCode == productCode && x.ProductType == productType)
        //                                    .AsNoTracking()
        //                      join b in _context.ProductInStockExps
        //                                     .Where(x => x.ProductCode == productCode && x.ProductType == productType)
        //                                     .AsNoTracking()
        //                                     on a.TicketCode equals b.TicketCode
        //                      join c in _context.MaterialStoreImpGoodsDetails
        //                                     .Where(x => !x.IsDeleted)
        //                                     .AsNoTracking()
        //                                     on b.ProductQrCode equals c.ProductQrCode
        //                      join d in _context.MaterialStoreImpGoodsHeaders
        //                                     .Where(x => !x.IsDeleted)
        //                                     .AsNoTracking()
        //                                     on c.TicketCode equals d.TicketCode
        //                      join e in _context.Suppliers
        //                                     .Where(x => !x.IsDeleted)
        //                                     .AsNoTracking()
        //                                     on d.CusCode equals e.SupCode
        //                      select new
        //                      {
        //                          Quantity = b.Quantity,
        //                          Unit = c.Unit,
        //                          ProductQrCode = c.ProductQrCode,
        //                          LotProductCode = c.LotProductCode,
        //                          CreatedTime = c.CreatedTime,
        //                          SupName = e.SupName,
        //                      });
        //        var query3 = (from e in _context.PoBuyerHeaders
        //                                     .Where(x => !x.IsDeleted)
        //                                     .AsNoTracking()
        //                      join g in _context.PoBuyerDetails
        //                                     .Where(x => !x.IsDeleted && x.ProductCode == productCode && x.ProductType == productType)
        //                                     .AsNoTracking()
        //                                     on e.PoSupCode equals g.PoSupCode
        //                      select new
        //                      {
        //                          PoSupCode = e.PoSupCode,
        //                          UnitPrice = g.UnitPrice,
        //                          Currency = g.Currency,
        //                      });
        //        var query = (from a in query2.Where(x => !string.IsNullOrEmpty(x.LotProductCode))
        //                     join b in query3 on a.LotProductCode equals b.PoSupCode
        //                     join c1 in _context.CommonSettings
        //                                    .Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Currency))
        //                                    .AsNoTracking()
        //                                    on b.Currency equals c1.CodeSet into c2
        //                     from c in c2.DefaultIfEmpty()
        //                     join d1 in _context.CommonSettings
        //                                    .Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Unit))
        //                                    .AsNoTracking()
        //                                    on a.Unit equals d1.CodeSet into d2
        //                     from d in d2.DefaultIfEmpty()
        //                     select new
        //                     {
        //                         SupName = a.SupName,
        //                         Quantity = a.Quantity,
        //                         UnitName = d != null ? d.ValueSet : "",
        //                         UnitPrice = b.UnitPrice,
        //                         Currency = c != null ? c.ValueSet : "",
        //                     })
        //                     .Union(from a in query2.Where(x => string.IsNullOrEmpty(x.LotProductCode))
        //                            join d1 in _context.CommonSettings
        //                                           .Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Unit))
        //                                           .AsNoTracking()
        //                                           on a.Unit equals d1.CodeSet into d2
        //                            from d in d2.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                SupName = a.SupName,
        //                                Quantity = a.Quantity,
        //                                UnitName = d != null ? d.ValueSet : "",
        //                                UnitPrice = (decimal?)null,
        //                                Currency = "",
        //                            })
        //                     ;
        //        return Json(query);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_LOAD_FAIL"), _stringLocalizer["USER_USERNAME").ToLower()), Object = ex });
        //    }
        //}

        //Gọi dữ liệu từ view

        public string GetValueRequire(string value)
        {
            var str = string.Empty;

            try
            {
                if (!string.IsNullOrEmpty(value))
                {
                    var listConditionValue = new List<string>();
                    var listCondition = value.Split(";");
                    foreach (var item in listCondition)
                    {
                        if (!string.IsNullOrEmpty(item))
                        {
                            var conditionCode = item.Split("|")[0];
                            var conditionValue = item.Split("|")[1];
                            var conditionName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(conditionCode))?.ValueSet;

                            listConditionValue.Add(string.Concat(conditionName, "|", conditionValue));
                        }

                    }

                    str = string.Join(";", listConditionValue);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return str;
        }

        [NonAction]
        private decimal ExchangeQuantityByPack(string productCode, JsonPackValue json, string unit, string pack)
        {
            decimal quantity = 0;
            var unitName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(unit) && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))).ValueSet;
            var prodInStock = from a in _context.ProductImportDetails.Where(x => !x.IsDeleted && x.PackType.Equals(pack) && x.ProductCode.Equals(productCode))
                              join b in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.Id equals b.IdImpProduct
                              join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))) on b.Unit equals c.CodeSet
                              select new
                              {
                                  b.Quantity,
                                  b.Unit,
                                  UnitNameStore = c.ValueSet
                              };
            foreach (var item in prodInStock)
            {
                if (!string.IsNullOrEmpty(json.A.Key))
                {
                    if (unitName.ToLower().Equals(json.A.Key.ToLower()) && item.UnitNameStore.ToLower().Equals(json.A.Key.ToLower()))
                    {
                        quantity += item.Quantity;
                    }
                    if (!string.IsNullOrEmpty(json.B.Key))
                    {
                        if (unitName.ToLower().Equals(json.B.Key.ToLower()))
                        {
                            if (item.UnitNameStore.ToLower().Equals(json.A.Key.ToLower()))
                            {
                                quantity += (item.Quantity * Convert.ToInt32(json.B.Value));
                            }
                            else if (item.UnitNameStore.ToLower().Equals(json.B.Key.ToLower()))
                            {
                                quantity += item.Quantity;
                            }
                        }

                        if (!string.IsNullOrEmpty(json.C.Key))
                        {
                            if (unitName.ToLower().Equals(json.C.Key.ToLower()))
                            {
                                if (item.UnitNameStore.ToLower().Equals(json.A.Key.ToLower()))
                                {
                                    quantity += (item.Quantity * Convert.ToInt32(json.B.Value) * Convert.ToInt32(json.C.Value));
                                }
                                else if (item.UnitNameStore.ToLower().Equals(json.B.Key.ToLower()))
                                {
                                    quantity += (item.Quantity * Convert.ToInt32(json.B.Value));
                                }
                                else if (item.UnitNameStore.ToLower().Equals(json.C.Key.ToLower()))
                                {
                                    quantity += item.Quantity;
                                }
                            }
                            if (!string.IsNullOrEmpty(json.D.Key))
                            {
                                if (unitName.ToLower().Equals(json.D.Key.ToLower()))
                                {
                                    if (item.UnitNameStore.ToLower().Equals(json.A.Key.ToLower()))
                                    {
                                        quantity += (item.Quantity * Convert.ToInt32(json.B.Value) * Convert.ToInt32(json.C.Value) * Convert.ToInt32(json.D.Value));
                                    }
                                    else if (item.UnitNameStore.ToLower().Equals(json.B.Key.ToLower()))
                                    {
                                        quantity += (item.Quantity * Convert.ToInt32(json.B.Value) * Convert.ToInt32(json.C.Value));
                                    }
                                    else if (item.UnitNameStore.ToLower().Equals(json.C.Key.ToLower()))
                                    {
                                        quantity += (item.Quantity * Convert.ToInt32(json.C.Value));
                                    }
                                    else
                                    {
                                        quantity += item.Quantity;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return quantity;
        }

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcelProduct(string contractCode)
        {
            var contractInfo = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted)
                                join b in _context.Projects.Where(x => !x.FlagDeleted) on a.PrjCode equals b.ProjectCode into b1
                                from b2 in b1.DefaultIfEmpty()
                                join c in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals c.CusCode
                                join d in _context.CommonSettings.Where(x => !x.IsDeleted) on c.CusGroup equals d.CodeSet into d1
                                from d2 in d1.DefaultIfEmpty()
                                where a.ContractCode.Equals(contractCode)
                                select new
                                {
                                    a.ContractCode,
                                    a.ContractNo,
                                    ContractDate = a.ContractDate.HasValue ? a.ContractDate.Value.ToString("dd/MM/yyyy") : null,
                                    EffectiveDate = a.EffectiveDate.HasValue ? a.EffectiveDate.Value.ToString("dd/MM/yyyy") : null,
                                    a.Duration,
                                    EndDate = a.EndDate.HasValue ? a.EndDate.Value.ToString("dd/MM/yyyy") : null,
                                    ProjectName = b2.ProjectTitle,
                                    ProjectAddress = b2.Address,
                                    a.CusCode,
                                    c.CusName,
                                    CusAddress = c.Address,
                                    CusType = d2.ValueSet,
                                    c.TaxCode
                                }).FirstOrDefault();

            var query1 = from a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted)
                         join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals b.CodeSet into b1
                         from b2 in b1.DefaultIfEmpty()
                         where !string.IsNullOrEmpty(a.ContractCode) && a.ContractCode.Equals(contractCode)
                         select new
                         {
                             Id = a.Id,
                             Code = a.ProductCode,
                             Name = a.ProductType == "SUB_PRODUCT" ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)) != null ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)).AttributeName : null : _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)).ProductName : null,
                             a.Quantity,
                             a.Unit,
                             UnitName = b2.ValueSet,
                             UnitPrice = a.Cost,
                             ValueRequire = ""
                         };

            var query2 = from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted)
                         join b in _context.ContractServiceDetails.Where(x => !x.IsDeleted) on a.ContractCode equals b.ContractCode
                         join c in _context.ServiceCategorys.Where(x => !x.IsDeleted) on b.ServiceCode equals c.ServiceCode into c2
                         from c in c2.DefaultIfEmpty()
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals d.CodeSet into d1
                         from d2 in d1.DefaultIfEmpty()
                         where !string.IsNullOrEmpty(a.ContractCode) && a.ContractCode.Equals(contractCode)
                         select new
                         {
                             b.Id,
                             Code = b.ServiceCode,
                             Name = (c != null ? c.ServiceName : ""),
                             b.Quantity,
                             Unit = b.Unit,
                             UnitName = d2.ValueSet,
                             UnitPrice = b.Cost,
                             ValueRequire = b.Note
                         };

            var query = query1.Concat(query2);

            var data = query.AsNoTracking().ToList();

            var listExport = new List<ContractDetailExport>();
            var no = 1;
            foreach (var item in data)
            {
                var itemExport = new ContractDetailExport();
                itemExport.No = no;
                itemExport.Code = item.Code;
                itemExport.Name = item.Name;
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.UnitName;
                itemExport.Price = item.UnitPrice;
                itemExport.ValueRequire = GetValueRequire(item.ValueRequire);
                itemExport.TotalAmount = item.Quantity * item.UnitPrice;

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("File_Export_Donhang");
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

            sheetRequest.Range["A1:H1"].Merge(true);
            sheetRequest.Range["D2:H2"].Merge(true);

            sheetRequest.Range["A2:B2"].Merge(true);
            sheetRequest.Range["A3:B3"].Merge(true);
            sheetRequest.Range["A4:B4"].Merge(true);
            sheetRequest.Range["A5:B5"].Merge(true);
            sheetRequest.Range["A6:B6"].Merge(true);
            sheetRequest.Range["A7:B7"].Merge(true);
            sheetRequest.Range["A8:B8"].Merge(true);
            sheetRequest.Range["A9:B9"].Merge(true);
            sheetRequest.Range["A10:B10"].Merge(true);
            sheetRequest.Range["A11:B11"].Merge(true);
            sheetRequest.Range["A12:B12"].Merge(true);
            sheetRequest.Range["A13:B13"].Merge(true);
            sheetRequest.Range["A14:B14"].Merge(true);
            sheetRequest.Range["A15:B15"].Merge(true);

            sheetRequest.Range["A1"].Text = "ĐƠN HÀNG";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri Light";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["A2"].Text = "Tên khách hàng:";
            sheetRequest.Range["A3"].Text = "Địa chỉ khách hàng:";
            sheetRequest.Range["A4"].Text = "Mã số thuế:";
            sheetRequest.Range["A5"].Text = "Đối tượng:";
            sheetRequest.Range["A6"].Text = "Tên dự án:";
            sheetRequest.Range["A7"].Text = "Địa chỉ dự án:";
            sheetRequest.Range["A8"].Text = "Tên người liên hệ:";
            sheetRequest.Range["A9"].Text = "SĐT liên hệ:";
            sheetRequest.Range["A10"].Text = "Email người liên hệ:";
            sheetRequest.Range["A11"].Text = "Số hợp đồng:";
            sheetRequest.Range["A12"].Text = "Ngày ký hợp đồng:";
            sheetRequest.Range["A13"].Text = "Ngày hiệu lực:";
            sheetRequest.Range["A14"].Text = "Thời gian thực hiện:";
            sheetRequest.Range["A15"].Text = "Ngày kết thúc:";

            if (contractInfo != null)
            {
                sheetRequest.Range["D2"].Text = "Số đơn hàng: " + contractInfo.ContractCode;
                sheetRequest.Range["D2"].CellStyle.Font.Bold = true;
                sheetRequest.Range["D2"].CellStyle.Font.Size = 12;
                sheetRequest.Range["D2"].CellStyle.Font.FontName = "Calibri Light";
                sheetRequest.Range["C2"].Text = contractInfo.CusName;
                sheetRequest.Range["C3"].Text = contractInfo.CusAddress;
                sheetRequest.Range["C4"].Text = contractInfo.TaxCode;
                sheetRequest.Range["C5"].Text = contractInfo.CusType;
                sheetRequest.Range["C6"].Text = contractInfo.ProjectName;
                sheetRequest.Range["C7"].Text = contractInfo.ProjectAddress;

                var contact = _context.Contacts.FirstOrDefault(x => !x.IsDeleted && x.CusCode.Equals(contractInfo.CusCode));
                if (contact != null)
                {
                    sheetRequest.Range["C8"].Text = contact.ContactName;
                    sheetRequest.Range["C8"].CellStyle.Font.Bold = true;
                    sheetRequest.Range["C8"].CellStyle.Font.Size = 12;

                    sheetRequest.Range["C9"].Text = contact.MobilePhone;
                    sheetRequest.Range["C10"].Text = contact.Email;
                }

                sheetRequest.Range["C11"].Text = contractInfo.ContractNo;
                sheetRequest.Range["C12"].Text = contractInfo.ContractDate;
                sheetRequest.Range["C13"].Text = contractInfo.EffectiveDate;
                sheetRequest.Range["C14"].Text = contractInfo.Duration;
                sheetRequest.Range["C15"].Text = contractInfo.EndDate;
            }
            sheetRequest.Range["C2:C15"].CellStyle.Font.FontName = "Calibri Light";
            sheetRequest.Range["A2:A15"].CellStyle.Font.FontName = "Calibri Light";
            sheetRequest.ImportData(listExport, 16, 1, true);

            sheetRequest["A16"].Text = "TT";
            sheetRequest["B16"].Text = "Mã sản phẩm/Dịch vụ";
            sheetRequest["C16"].Text = "Tên sản phẩm/Dịch vụ";
            sheetRequest["D16"].Text = "Khối lượng";
            sheetRequest["E16"].Text = "Đơn vị";
            sheetRequest["F16"].Text = "Đơn giá";
            sheetRequest["G16"].Text = "Giá trị ràng buộc";
            sheetRequest["H16"].Text = "Thành tiền";

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri Light";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Medium;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Medium;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Medium;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Medium;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Medium;
            sheetRequest["A16:H16"].CellStyle = tableHeader;

            IStyle tableHeaderBoder = workbook.Styles.Add("TableHeaderStyleBoder");
            tableHeaderBoder.Font.Size = 11;
            tableHeaderBoder.Font.FontName = "Calibri Light";
            tableHeaderBoder.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeaderBoder.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeaderBoder.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Medium;
            tableHeaderBoder.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Medium;
            tableHeaderBoder.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Medium;
            tableHeaderBoder.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Medium;
            tableHeaderBoder.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Medium;
            var row = 17 + listExport.Count;
            sheetRequest["A17:H" + row].CellStyle = tableHeaderBoder;

            sheetRequest.Range["A2:M2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportFile_Donhang" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
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

        #region Contract History Version
        public class JTableModelHistoryVersion : JTableModel
        {
            public string ContractCode { get; set; }
        }
        [HttpPost]
        public object JTableHistoryVersion([FromBody] JTableModelHistoryVersion jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.PoSaleHeaderHiss.Where(x => !x.IsDeleted && x.ContractCode == jTablePara.ContractCode).OrderBy(x => x.ContractHeaderID)
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals d.CusCode
                        join b in _context.CommonSettings on a.Status equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.Currency equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        select new
                        {
                            id = a.ContractHeaderID,
                            Code = a.ContractCode,
                            Name = a.Title,
                            cusCode = a.CusCode,
                            cusName = d.CusName,
                            contractNo = a.ContractNo,
                            status = b2.ValueSet,
                            icon = b2.Logo,
                            duration = a.Duration,
                            contractDate = a.ContractDate,
                            budget = a.Budget,
                            budgetExcludeTax = a.BudgetExcludeTax,
                            currency = c2.ValueSet,
                            signer = a.Signer,
                            sEndDate = a.EndDate,
                            ExchangeRate = a.ExchangeRate,
                            Version = a.Version,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate", "Version");
            return Json(jdata);
        }
        //[HttpGet]
        //public JsonResult GetItemHistoryVersion(int id)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.PoSaleHeaderHiss.Select(x => new ContractHeaderHis
        //        {
        //            ContractHeaderID = x.ContractHeaderID,
        //            ContractCode = x.ContractCode,
        //            Title = x.Title,
        //            ContractType = x.ContractType,
        //            ContractDate = x.ContractDate,
        //            ContractNo = x.ContractNo,
        //            Duration = x.Duration,
        //            Version = x.Version,
        //            Status = x.Status,
        //            Signer = x.Signer,
        //            MainService = x.MainService,
        //            Budget = x.Budget,
        //            Currency = x.Currency,
        //            LocationHardCopy = x.LocationHardCopy,
        //            Describe = x.Describe,
        //            CusCode = x.CusCode,
        //            ContractRelative = x.ContractRelative,
        //            Tags = x.Tags,
        //            CreatedBy = x.CreatedBy,
        //            CreatedTime = x.CreatedTime,
        //            UpdatedBy = x.UpdatedBy,
        //            UpdatedTime = x.UpdatedTime,
        //            DeletedBy = x.DeletedBy,
        //            DeletedTime = x.DeletedTime,
        //            IsDeleted = x.IsDeleted,
        //            EffectiveDate = x.EffectiveDate,
        //            EndDate = x.EndDate,
        //            RealBudget = x.RealBudget,
        //            Confirm = x.Confirm,
        //            EstimateTime = x.EstimateTime,
        //            //LogProductDetail = x.LogProductDetail,
        //            PrjCode = x.PrjCode,
        //            BudgetExcludeTax = x.BudgetExcludeTax,
        //            TaxAmount = x.TaxAmount,
        //            ExchangeRate = x.ExchangeRate,
        //            AcceptanceTime = x.AcceptanceTime,
        //            Maintenance = x.Maintenance,
        //            Discount = x.Discount,
        //            Commission = x.Commission,
        //            LastBudget = x.LastBudget,
        //            IsChangeProduct = x.IsChangeProduct,
        //            //LogData = x.LogData,
        //        }).FirstOrDefault(x => x.ContractHeaderID == id);


        //        data.Confirm = GetConfirmText(data.Confirm);
        //        if (data != null)
        //        {
        //            msg.Object = data;
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED")); //"Có lỗi khi lấy dữ liệu!"; 
        //    }
        //    return Json(msg);
        //}
        [HttpGet]
        public JsonResult GetItemHistoryVersion(string contractCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PoSaleHeaders.Select(x => new PoSaleHeader
                {
                    ContractHeaderID = x.ContractHeaderID,
                    ContractCode = x.ContractCode,
                    Title = x.Title,
                    ContractType = x.ContractType,
                    ContractDate = x.ContractDate,
                    ContractNo = x.ContractNo,
                    Duration = x.Duration,
                    Version = x.Version,
                    Status = x.Status,
                    Signer = x.Signer,
                    MainService = x.MainService,
                    Budget = x.Budget,
                    Currency = x.Currency,
                    LocationHardCopy = x.LocationHardCopy,
                    Describe = x.Describe,
                    CusCode = x.CusCode,
                    ContractRelative = x.ContractRelative,
                    Tags = x.Tags,
                    CreatedBy = x.CreatedBy,
                    CreatedTime = x.CreatedTime,
                    UpdatedBy = x.UpdatedBy,
                    UpdatedTime = x.UpdatedTime,
                    DeletedBy = x.DeletedBy,
                    DeletedTime = x.DeletedTime,
                    IsDeleted = x.IsDeleted,
                    EffectiveDate = x.EffectiveDate,
                    EndDate = x.EndDate,
                    RealBudget = x.RealBudget,
                    Confirm = x.Confirm,
                    EstimateTime = x.EstimateTime,
                    //LogProductDetail = x.LogProductDetail,
                    PrjCode = x.PrjCode,
                    BudgetExcludeTax = x.BudgetExcludeTax,
                    TaxAmount = x.TaxAmount,
                    ExchangeRate = x.ExchangeRate,
                    AcceptanceTime = x.AcceptanceTime,
                    Maintenance = x.Maintenance,
                    Discount = x.Discount,
                    Commission = x.Commission,
                    LastBudget = x.LastBudget,
                    IsChangeProduct = x.IsChangeProduct,
                    //LogData = x.LogData,
                }).FirstOrDefault(x => x.ContractCode == contractCode);


                data.Confirm = GetConfirmText(data.Confirm);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS_FILE"]); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableProductHis([FromBody] JTableProductSearch param)
        {
            int intBeginFor = (param.CurrentPage - 1) * param.Length;

            var queryPoSup = from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                             join b1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b1.PoSupCode into b2
                             from b in b2.DefaultIfEmpty()
                             join c1 in _context.CommonSettings on b.Status equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             select new
                             {
                                 b.Status,
                                 StatusName = c.ValueSet,
                                 a.ReqCode,
                                 a.ProductCode,
                                 a.ProductType
                             };

            var queryReq = from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted)
                           join b1 in _context.RequestImpProductDetails.Where(x => !x.IsDeleted) on a.ReqCode equals b1.ReqCode into b2
                           from b in b2.DefaultIfEmpty()
                           select new
                           {
                               a.PoCode,
                               a.ReqCode,
                               b.ProductCode,
                               b.ProductType
                           };

            var queryJoin = from a in queryReq
                            join b1 in queryPoSup on new { a.ReqCode, a.ProductCode, a.ProductType } equals new { b1.ReqCode, b1.ProductCode, b1.ProductType } into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                a.PoCode,
                                a.ProductCode,
                                a.ProductType,
                                b.StatusName
                            };

            var queryDistinct = queryJoin.DistinctBy(p => new { p.PoCode, p.ProductCode, p.ProductType }).Select(x => new
            {
                PoCode = x.PoCode,
                ProductCode = x.ProductCode,
                ProductType = x.ProductType,
                StatusName = x.StatusName
            });

            var query = from a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ContractCode) && x.ContractCode.Equals(param.ContractCode))
                        join b1 in _context.CommonSettings on a.Unit equals b1.CodeSet into b2
                        from b in b2.DefaultIfEmpty()
                        join c1 in queryJoin on new { a.ContractCode, a.ProductCode, a.ProductType } equals new { ContractCode = c1.PoCode, c1.ProductCode, c1.ProductType } into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            a.Quantity,
                            UnitPrice = a.Cost,
                            a.Unit,
                            a.Tax,
                            a.Note,
                            sUnit = (b != null ? b.ValueSet : ""),
                            PriceType = a.PriceType,
                            a.ProductType,
                            StatusName = c != null && !string.IsNullOrEmpty(c.StatusName) ? c.StatusName : "Chưa đặt hàng",
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(param.QueryOrderBy).Skip(intBeginFor).Take(param.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, param.Draw, count, "Id", "ProductCode", "Quantity", "UnitPrice", "Unit", "Tax", "Note", "sUnit", "PriceType", "ProductType", "StatusName");
            return Json(jdata);
        }

        #endregion

        #region Contract Po
        [HttpPost]
        public JsonResult GetContractPoBuyer()
        {
            var query = _context.PoBuyerHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.PoSupCode, Name = x.PoTitle });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetContractSale()
        {
            var query = _context.PoSaleHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.ContractCode, Name = x.Title });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetRqImpProduct()
        {
            var query = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.ReqCode, Name = x.Title });
            return Json(query);
        }

        [HttpGet]
        public object GetObjectRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Relative)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public object JtableContractPo([FromBody] JtableFileModel jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoBuyerHeaderPayments on a.ObjCode equals b.PoSupCode
                         join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                         where a.ObjRootCode == jTablePara.ContractCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.Type,
                             b.OrderBy,
                             b.Consigner,
                             c.SupName,
                             b.CreatedTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy))
                join b in _context.PoBuyerHeaderPayments on a.ObjRootCode equals b.PoSupCode
                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                where a.ObjCode == jTablePara.ContractCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.Type,
                    b.OrderBy,
                    b.Consigner,
                    c.SupName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Type", "OrderBy", "Consigner", "SupName", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractPo([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_CURD_MSG_GET_DATA_FAILED"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_ADDED_THIS_PURCHASE_CONTRACT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult UpdateContractPo([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = ESEIM.AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContractPo(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }
        #endregion

        #region contract Request Import Product
        [HttpPost]
        public object JtableRequestImportProduct([FromBody] JtableFileModel jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.RequestImpProductHeaders on a.ObjCode equals b.ReqCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ObjRootCode == jTablePara.ContractCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.Title,
                             b.CusCode,
                             c.CusName,
                             CreatedBy = d2.GivenName,
                             b.CreatedTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice))
                join b in _context.RequestImpProductHeaders on a.ObjRootCode equals b.ReqCode
                join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                from d2 in d1.DefaultIfEmpty()
                where a.ObjCode == jTablePara.ContractCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
                select new
                {
                    a.Id,
                    a.ObjCode,
                    b.Title,
                    b.CusCode,
                    c.CusName,
                    CreatedBy = d2.GivenName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                }
                );
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Title", "CusCode", "CusName", "CreatedBy", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertRequestImportProduct([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_ADDED_THIS_ORDER_REQUEST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateRequestImportProduct([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = ESEIM.AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteRequestImportProduct(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }
        #endregion

        #region Contract Project
        [HttpPost]
        public object JtableContractProject([FromBody] JtableFileModel jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.Projects on a.ObjCode equals b.ProjectCode
                         where a.ObjRootCode == jTablePara.ContractCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.ProjectTitle,
                             b.Budget,
                             Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == b.Currency).ValueSet ?? "",
                             b.StartTime,
                             b.EndTime,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project))
                join b in _context.Projects on a.ObjRootCode equals b.ProjectCode
                where a.ObjCode == jTablePara.ContractCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
                select new
                {
                    a.Id,
                    a.ObjCode,
                    b.ProjectTitle,
                    b.Budget,
                    Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == b.Currency).ValueSet ?? "",
                    b.StartTime,
                    b.EndTime,
                    a.ObjRelative,
                    a.ObjNote
                });

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "ProjectTitle", "Budget", "Currency", "StartTime", "EndTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractProject([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRAT_CURD_MSG_ADDED_THIS_PROJECT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateContractProject([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = ESEIM.AppContext.UserName;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContractProject(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"]);
            }
            return Json(msg);
        }
        #endregion

        #region Schedule contract sales
        [HttpPost]
        public JsonResult ScheduleContractSales(int month, int year)
        {
            var session = HttpContext.GetSessionUser();
            var msg = new JMessage();
            var lstCountContract = new List<CalendarContractSales>();
            var listDateInMonth = DateTimeExtensions.GetDates(year, month);
            var contracts = from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted)
                            where (session.IsAllData
                             || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                             || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                            select new
                            {
                                a.EndDate,
                                a.Status,
                                a.ContractCode
                            };
            foreach (var item in listDateInMonth)
            {
                var countExpired = (from a in contracts
                                    join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_HET_HAN")) on a.ContractCode equals b.ObjCode
                                    where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                    select new
                                    {
                                        a.ContractCode
                                    }).DistinctBy(x => x.ContractCode).Count();
                var countNextPay = (from a in contracts
                                    join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO")) on a.ContractCode equals b.ObjCode
                                    where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                    select new
                                    {
                                        a.ContractCode
                                    }).DistinctBy(x => x.ContractCode).Count();

                var countRenew = (from a in contracts
                                  join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO")) on a.ContractCode equals b.ObjCode
                                  where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                  select new
                                  {
                                      a.ContractCode
                                  }).DistinctBy(x => x.ContractCode).Count();

                var calendar = new CalendarContractSales
                {
                    Date = item,
                    Expried = countExpired,
                    Nextpay = countNextPay,
                    Renew = countRenew
                };
                lstCountContract.Add(calendar);
            }
            msg.Object = lstCountContract;
            return Json(msg);
        }

        [HttpPost]
        public object JTableCalendar([FromBody] CalendarContractModel jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            var attrCode = "";
            if (jTablePara.Value == 1)
            {
                attrCode = "NGAY_HET_HAN";
            }
            else if (jTablePara.Value == 2)
            {
                attrCode = "NGAY_THANH_TOAN_TIEP_THEO";
            }
            else
            {
                attrCode = "NGAY_GIA_HAN_TIEP_THEO";
            }

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var toDate = !string.IsNullOrEmpty(jTablePara.Date) ? DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.PoSaleHeaders
                         join d in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals d.CusCode
                         join b in _context.CommonSettings on a.Status equals b.CodeSet into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings on a.Currency equals c.CodeSet into c1
                         from c2 in c1.DefaultIfEmpty()
                         join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName
                         join g in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode == attrCode) on a.ContractCode equals g.ObjCode
                         where ((a.IsDeleted == false) && (toDate == null || (toDate.Value.ToString("dd/MM/yyyy") == g.AttrValue))
                                 //Điều kiện phân quyền dữ liệu
                                 && (session.IsAllData
                                 || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                 || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy)))
                         select new jTableView
                         {
                             id = a.ContractHeaderID,
                             Code = a.ContractCode,
                             Name = a.Title,
                             cusCode = a.CusCode,
                             cusName = d.CusName,
                             contractNo = a.ContractNo,
                             status = b2.ValueSet,
                             icon = b2.Logo,
                             duration = a.Duration,
                             contractDate = a.ContractDate,
                             budget = a.Budget,
                             budgetExcludeTax = a.BudgetExcludeTax,
                             currency = c2.ValueSet,
                             signer = a.Signer,
                             sEndDate = a.EndDate,
                             ExchangeRate = a.ExchangeRate,
                             CreatedTime = a.CreatedTime,
                             Percent = 0,
                         }).DistinctBy(x => x.Code);

            var count = query.Count();
            var data = query.OrderByDescending(x => x.CreatedTime).ThenBy(x => x.Name).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            for (var i = 0; i < data.Count(); i++)
            {
                var tuple = _cardService.GetPercentJCObject("CONTRACT", data[i].Code, session.IsAllData, session.IsBranch, session.IsUser, session.UserName, session.ListUserOfBranch != null ? string.Join(",", session.ListUserOfBranch) : "", session.UserId, !string.IsNullOrEmpty(session.DepartmentCode) ? session.DepartmentCode : "");
                data[i].Percent = tuple.Item1;
                data[i].ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(data[i].Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(data[i].Code)).AttrValue : "";
                data[i].RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)).AttrValue : "";
                data[i].PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(data[i].Code)).AttrValue : "";
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "Code", "status", "Percent", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate", "CreatedTime", "ExpirationDate", "RenewalDate", "PaymentNextDate");
            return Json(jdata);
        }


        public class CalendarContractSales
        {
            public int Nextpay { get; set; }
            public int Renew { get; set; }
            public int Expried { get; set; }
            public DateTime Date { get; set; }
        }
        public class CalendarContractModel : JTableModel
        {
            public string Date { get; set; }
            public int Value { get; set; }
        }
        #endregion

        #region Status
        [HttpPost]
        public JsonResult GetLogStatus(string contractCode)
        {
            var contract = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(contractCode) && !x.IsDeleted);
            return Json(contract);
        }
        #endregion

        #region Workflow
        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.ContractCode)
                && x.ObjectType.Equals("CONTRACT"));
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

        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode.Equals(code)).Select(x => new
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

        [HttpPost]
        public object GetItemHeader(int id)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractHeaderID == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.ContractCode)
                        && x.ObjectType.Equals("CONTRACT"));
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
            var data = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.ContractCode) && x.ObjectType.Equals("CONTRACT"));
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
            public string StatusValue { get; set; }
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

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_customerLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_supplierLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_projectController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_sendRequestImportProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_attrManagerController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_materialProductController.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_funcAccEntryLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
               .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
    public class JTableModelContract : JTableModel
    {
        //public string Key { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string ContractCode { get; set; }
        public string Status { get; set; }
        public string BudgetF { get; set; }
        public string BudgetT { get; set; }
        public string CusCode { get; set; }
        public string Currency { get; set; }
        public string BranchId { get; set; }
    }
    public class EDMSModelTags
    {
        public string ContractCode { get; set; }
        public string Note { get; set; }
        public Properties Task { get; set; }
        public List<EDMSRepositoryUserModel> ContractPeople { get; set; }
    }
    public class GetCostModel
    {
        public string ServiceCode { get; set; }
        public string Condition { get; set; }
        public string ConditionName { get; set; }
        public string ConditionRange { get; set; }
        public decimal Price { get; set; }

    }
    public class Compare
    {
        public string ProductCode { get; set; }
        public string ProductType { get; set; }
        public decimal Quantity { get; set; }
        public int CntForecast { get; set; }
    }
    public class Properties
    {
        public int? Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }
    public class ContractHeaderModel
    {
        public ContractHeaderModel()
        {
            ListStatusObjectLog = new List<JsonLog>();
        }
        public int ContractHeaderID { get; set; }
        public string ContractCode { get; set; }
        public string ContractDate { get; set; }
        public string ContractNo { get; set; }
        public string ContractType { get; set; }
        public string Currency { get; set; }
        public string CusCode { get; set; }
        public string Describe { get; set; }
        public string Duration { get; set; }
        public string LocationHardCopy { get; set; }
        public string MainService { get; set; }
        public string Signer { get; set; }
        public string Status { get; set; }
        public string Tags { get; set; }
        public string Title { get; set; }
        public int Version { get; set; }
        public string sEffectiveDate { get; set; }
        public string sEndDate { get; set; }
        public decimal? RealBudget { get; set; }
        public decimal? Budget { get; set; }
        public decimal? BudgetExcludeTax { get; set; }
        public decimal? TaxAmount { get; set; }
        public string Confirm { get; set; }
        public string PrjCode { get; set; }
        public decimal? ExchangeRate { get; set; }
        public string AcceptanceTime { get; set; }
        public int? Maintenance { get; set; }
        public string ContactName { get; set; }
        public string ContactPhone { get; set; }
        public string ContactEmail { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Commission { get; set; }
        public bool? IsLoadProject { get; set; }
        public string WorkflowCat { get; set; }
        public string ActRepeat { get; set; }
        public string StatusObject { get; set; }
        public List<JsonLog> ListStatusObjectLog { get; set; }
    }
    public class JTableProductSearch : JTableModel
    {
        public string ContractCode { get; set; }
    }

    public class CustommerContactInfo
    {
        public int? ContactId { get; set; }
        public string CusCode { get; set; }
        public string ContactName { get; set; }
        public string ContactPhone { get; set; }
        public string ContactEmail { get; set; }
    }

    public class ProductPrices
    {
        public string HeaderCode { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Unit { get; set; }
        public string UnitName { get; set; }
        public string PathImg { get; set; }

        public string AttributeCode { get; set; }
        public string AttributeName { get; set; }
        public string ProductType { get; set; }
        public string PricePerM { get; set; }
        public string PricePerM2 { get; set; }
        public decimal? PriceCostCatelogue { get; set; }
        public decimal? PriceCostAirline { get; set; }
        public decimal? PriceCostSea { get; set; }
        public decimal? PriceRetailBuild { get; set; }
        public decimal? PriceRetailBuildAirline { get; set; }
        public decimal? PriceRetailBuildSea { get; set; }
        public decimal? PriceRetailNoBuild { get; set; }
        public decimal? PriceRetailNoBuildAirline { get; set; }
        public decimal? PriceRetailNoBuildSea { get; set; }
        public int? Tax { get; set; }
        public string Pack { get; set; }
    }
    public class ProductPrice
    {
        public string HeaderCode { get; set; }
        public string ProductCode { get; set; }
        public decimal? PriceCostCatelogue { get; set; }
        public decimal? PriceCostAirline { get; set; }
        public decimal? PriceCostSea { get; set; }
        public decimal? PriceRetailBuild { get; set; }
        public decimal? PriceRetailBuildAirline { get; set; }
        public decimal? PriceRetailBuildSea { get; set; }
        public decimal? PriceRetailNoBuild { get; set; }
        public decimal? PriceRetailNoBuildAirline { get; set; }
        public decimal? PriceRetailNoBuildSea { get; set; }
        public int Tax { get; set; }
    }
}