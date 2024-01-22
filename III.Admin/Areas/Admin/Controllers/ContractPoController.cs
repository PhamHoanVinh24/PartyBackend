using System;
using System.Collections;
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
using static III.Admin.Controllers.ContractController;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class ContractPoController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<ContractPoController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<AttributeManagerController> _attrManagerController;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivity;
        private readonly IRepositoryService _repositoryService;
        public ContractPoController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractPoController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<AttributeManagerController> attrManagerController, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IRepositoryService repositoryService, IStringLocalizer<WorkflowActivityController> workflowActivity)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _stringLocalizerFp = stringLocalizerFp;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
            _attrManagerController = attrManagerController;
            _edmsRepositoryController = edmsRepositoryController;
            _workflowActivity = workflowActivity;
        }
        [Breadcrumb("ViewData.CrumbContractPO", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContractHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbContractHome"] = _sharedResources["COM_CRUMB_CONTRACT_HOME"];
            ViewData["CrumbContractPO"] = _sharedResources["COM_CRUMB_CONTRACT_PO"];
            return View();
        }

        #region ComboboxValue
        [HttpPost]
        public JsonResult GetListCommon()
        {
            var list = _context.CommonSettings.OrderBy(x => x.SettingID).Where(x => x.IsDeleted == false).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, x.Group, Icon = x.Logo }).AsNoTracking();
            return Json(list);
        }
        #endregion

        #region Po Sup Header
        public class JTableModelContract : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ContractCode { get; set; }
            public string PoSupCode { get; set; }
            public string Status { get; set; }
            public string BudgetF { get; set; }
            public string BudgetT { get; set; }
            public string Signer { get; set; }
            public string Currency { get; set; }
            public string ProjectCode { get; set; }
            public string BranchId { get; set; }
        }

        public class JTableModelDetail : JTableModel
        {
            public string PoSupCode { get; set; }
        }
        public class RequestModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string PoCode { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelContract jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            string poSupCode = jTablePara.PoSupCode;
            string status = jTablePara.Status;

            if (string.IsNullOrEmpty(jTablePara.ContractCode) && string.IsNullOrEmpty(jTablePara.ProjectCode))
            {
                var query = (from a in _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted).Where
                        (x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate)) &&
                              ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate)) &&
                              (string.IsNullOrEmpty(jTablePara.PoSupCode) || x.PoSupCode.ToLower().Contains(poSupCode.ToLower()) || (x.PoTitle.ToLower().Contains(poSupCode.ToLower()))) &&
                              (string.IsNullOrEmpty(jTablePara.Status) || x.StatusObject.Equals(status)))
                             join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode into b1
                             from b2 in b1.DefaultIfEmpty()
                             join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode into c1
                             from c2 in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusObject equals d.CodeSet into d1
                             from d2 in d1.DefaultIfEmpty()
                             join k in _context.Users.Where(x => x.Active) on a.CreatedBy equals k.UserName
                             join e in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_HET_HAN")) on a.PoSupCode equals e.ObjCode into e1
                             from e2 in e1.DefaultIfEmpty()
                             join f in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO")) on a.PoSupCode equals f.ObjCode into f1
                             from f2 in f1.DefaultIfEmpty()
                             join g in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO")) on a.PoSupCode equals g.ObjCode into g1
                             from g2 in g1.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(jTablePara.BranchId) || k.BranchId.Equals(jTablePara.BranchId))
                             //Điều kiện phân quyền dữ liệu
                             && (session.IsAllData
                             || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                             || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                             select new
                             {
                                 Id = a.Id,
                                 PoSupCode = a.PoSupCode,
                                 PoTitle = a.PoTitle,
                                 OrderBy = a.OrderBy,
                                 Consigner = a.Consigner,
                                 Mobile = a.Mobile,
                                 Buyer = a.Buyer,
                                 BuyerCode = a.BuyerCode + " - " + b2.CusName,
                                 SupCode = a.SupCode,
                                 SupName = c2.SupName,
                                 CreatedBy = a.CreatedBy,
                                 CreatedTime = a.CreatedTime,
                                 Status = d2 != null ? d2.ValueSet : "",
                                 Icon = d2.Logo,
                                 Type = a.Type,
                                 ExpirationDate = e2 != null ? e2.AttrValue : "",
                                 RenewalDate = f2 != null ? f2.AttrValue : "",
                                 PaymentNextDate = g2 != null ? g2.AttrValue : "",
                                 //TotalAmount = a.TotalAmount.HasValue ? a.TotalAmount.Value : 0,
                                 //TotalPayment = a.TotalPayment.HasValue ? a.TotalPayment.Value : 0,
                                 //ContractNo = (e == null ? "" : ""),
                                 IsViewed = string.IsNullOrEmpty(a.ListUserView) ? false : a.ListUserView.Contains(ESEIM.AppContext.UserId) ? true : false,
                             }).DistinctBy(x => x.PoSupCode);
                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle",
                    "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status",
                    "Icon", "Type", "TotalAmount", "TotalPayment", "ContractNo", "Title", "ExpirationDate",
                    "RenewalDate", "PaymentNextDate", "IsViewed");
                return Json(jdata);
            }
            else
            {
                var query = (from a in _context.PoBuyerHeaderPayments
                        .Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate)) &&
                              ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate)) &&
                              (string.IsNullOrEmpty(jTablePara.PoSupCode) || x.PoSupCode.ToLower().Contains(poSupCode.ToLower()) || (x.PoTitle.ToLower().Contains(poSupCode.ToLower()))) &&
                              (string.IsNullOrEmpty(jTablePara.Status) || x.StatusObject.Equals(status)))
                             join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                             join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                             join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusObject equals d.CodeSet into d1
                             from d2 in d1.DefaultIfEmpty()
                                 //from e in _context.RequestImpProductHeaders
                                 //join f in _context.PoBuyerDetails on e.ReqCode equals f.ReqCode
                                 //join g in _context.PoSaleHeaders
                             from e in _context.PoBuyerDetails.Where(x => x.PoSupCode == a.PoSupCode && x.Type == "REQUEST")
                             join f in _context.RequestImpProductHeaders on e.ReqCode equals f.ReqCode
                             join k in _context.Users.Where(x => x.Active) on a.CreatedBy equals k.UserName
                             //join g in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on f.PoCode equals g.ContractCode

                             //join e in _context.PoBuyerDetails on a.PoSupCode equals e.PoSupCode into e2
                             //from e in e2.DefaultIfEmpty()

                             //join e in _context.PoBuyerDetails.Where(x => x.Type == "REQUEST") on a.PoSupCode equals e.PoSupCode
                             //join f in _context.RequestImpProductHeaders on e.ReqCode equals f.ReqCode
                             //join g in _context.PoSaleHeaders on f.PoCode equals g.ContractCode
                             join l in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_HET_HAN")) on a.PoSupCode equals l.ObjCode into l1
                             from l2 in l1.DefaultIfEmpty()
                             join m in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO")) on a.PoSupCode equals m.ObjCode into m1
                             from m2 in m1.DefaultIfEmpty()
                             join n in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO")) on a.PoSupCode equals n.ObjCode into n1
                             from n2 in n1.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(jTablePara.ContractCode) || f.PoCode == jTablePara.ContractCode)
                             && (string.IsNullOrEmpty(jTablePara.ProjectCode) || f.ProjectCode == jTablePara.ProjectCode)
                             && (string.IsNullOrEmpty(jTablePara.BranchId) || k.BranchId.Equals(jTablePara.BranchId))
                             //Điều kiện phân quyền dữ liệu
                             && (session.IsAllData
                             || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                             || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                             select new
                             {
                                 Id = a.Id,
                                 PoSupCode = a.PoSupCode,
                                 PoTitle = a.PoTitle,
                                 OrderBy = a.OrderBy,
                                 Consigner = a.Consigner,
                                 Mobile = a.Mobile,
                                 Buyer = a.Buyer,
                                 BuyerCode = a.BuyerCode + " - " + b.CusName,
                                 SupCode = a.SupCode,
                                 SupName = c.SupName,
                                 CreatedBy = a.CreatedBy,
                                 CreatedTime = a.CreatedTime,
                                 Status = d2.ValueSet,
                                 Icon = d2.Logo,
                                 Type = a.Type,
                                 ExpirationDate = l2 != null ? l2.AttrValue : "",
                                 RenewalDate = m2 != null ? m2.AttrValue : "",
                                 PaymentNextDate = n2 != null ? n2.AttrValue : "",
                                 //TotalAmount = a.TotalAmount,
                                 //TotalPayment = a.TotalPayment,
                                 //ContractNo = (e == null ? "" : ""),
                                 IsViewed = string.IsNullOrEmpty(a.ListUserView) ? false : a.ListUserView.Contains(ESEIM.AppContext.UserId) ? true : false,
                             }).DistinctBy(x => x.PoSupCode);
                //var group = query.GroupBy(a => new
                //{
                //    Id = a.Id
                //});
                //var query1 = group.Select(a => new 
                //{
                //    Id = a.Key.Id,
                //    PoSupCode = a.Select(x => x.PoSupCode).FirstOrDefault(),
                //    PoTitle = a.Select(x => x.PoTitle).FirstOrDefault(),
                //    OrderBy = a.Select(x => x.OrderBy).FirstOrDefault(),
                //    Consigner = a.Select(x => x.Consigner).FirstOrDefault(),
                //    Mobile = a.Select(x => x.Mobile).FirstOrDefault(),
                //    Buyer = a.Select(x => x.Buyer).FirstOrDefault(),
                //    BuyerCode = a.Select(x => x.BuyerCode).FirstOrDefault(),
                //    SupCode = a.Select(x => x.SupCode).FirstOrDefault(),
                //    SupName = a.Select(x => x.SupName).FirstOrDefault(),
                //    CreatedBy = a.Select(x => x.CreatedBy).FirstOrDefault(),
                //    CreatedTime = a.Select(x => x.CreatedTime).FirstOrDefault(),
                //    Status = a.Select(x => x.Status).FirstOrDefault(),
                //    Icon = a.Select(x => x.Icon).FirstOrDefault(),
                //    Type = a.Select(x => x.Type).FirstOrDefault(),
                //    TotalAmount = a.Select(x => x.TotalAmount).FirstOrDefault(),
                //    TotalPayment = a.Select(x => x.TotalPayment).FirstOrDefault(),
                //    ContractNo = string.Join(",", a.Select(y => y.ContractNo).Distinct()),
                //    Title = string.Join(",", a.Select(y => y.Title).Distinct())
                //});
                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle",
                    "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status",
                    "Icon", "Type", "TotalAmount", "TotalPayment", "ContractNo", "Title", "ExpirationDate",
                    "RenewalDate", "PaymentNextDate", "IsViewed");
                return Json(jdata);
            }
        }
        [HttpPost]
        public object JtreeSigner()
        {
            var data = _context.PoSaleHeaders.DistinctBy(a => a.Signer).Select(x => x.Signer).ToList();
            return data;
        }

        [HttpPost]
        public object GetCustomers()
        {
            var data = (from a in _context.Customerss.Where(x => x.IsDeleted == false)
                        select new
                        {
                            Id = a.CusID,
                            Code = a.CusCode,
                            Name = a.CusName,
                            Address = a.Address,
                            ZipCode = a.ZipCode,
                            MobilePhone = a.MobilePhone,
                            PersonInCharge = a.PersonInCharge,
                            Email = a.Email
                        }).OrderByDescending(x => x.Id).AsNoTracking();
            return Json(data);
        }
        [HttpPost]
        public object GetSuppliers()
        {
            var data = (from a in _context.Suppliers.Where(x => x.IsDeleted == false)
                            //join b in _context.SupplierExtends.Where(x=>x.isdeleted==false&&(x.ext_code.ToLower()=="zip_code"|| x.ext_code.ToLower() == "person_in_charge")) on a.SupID equals b.supplier_code 
                        select new
                        {
                            Id = a.SupID,
                            Code = a.SupCode,
                            Name = a.SupName,
                            Group = a.SupGroup,
                            Address = a.Address,
                            MobilePhone = a.Mobile,
                            Email = a.Email,
                            ListExtend = _context.SupplierExtends.Where(x => x.isdeleted == false && (x.ext_code.ToLower() == "zip_code" || x.ext_code.ToLower() == "person_in_charge") && x.supplier_code == a.SupID).ToList()
                        }).OrderByDescending(x => x.Id).AsNoTracking();

            return Json(data);
        }
        [HttpPost]
        public object GetListContractProjectReq()
        {
            var listContractCode = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted).Select(x => x.PoCode).ToList();
            var listProjectCode = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.PoCode)).Select(x => x.ProjectCode).ToList();

            var data = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted)
                        where listContractCode.Any(x => x == a.ContractCode)
                        orderby a.ContractHeaderID descending
                        select new { Code = a.ContractCode, Name = a.Title, Type = "CONTRACT", NameType = "HĐ" })
                        .Concat(from a in _context.Projects.Where(x => !x.FlagDeleted)
                                where listProjectCode.Any(x => x == a.ProjectCode)
                                orderby a.Id descending
                                select new { Code = a.ProjectCode, Name = a.ProjectTitle, Type = "PROJECT", NameType = "DA" });
            return Json(data);
        }
        [HttpPost]
        public object GetListSupCode(string Code, string Type)
        {
            if (Type == "CONTRACT")
            {
                var data = (from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && x.PoCode == Code)
                            join b in _context.RequestImpProductDetails.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                            join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                            select new { Code = b.SupCode, Name = c.SupName }).DistinctBy(x => x.Code);
                return Json(data);
            }
            else
            {
                var data = (from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.PoCode) && x.ProjectCode == Code)
                            join b in _context.RequestImpProductDetails.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                            join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                            select new { Code = b.SupCode, Name = c.SupName }).DistinctBy(x => x.Code);
                return Json(data);
            }
        }

        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]PoBuyerHeader obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.PoSupCode.ToLower()))
                {
                    DateTime? date = !string.IsNullOrEmpty(obj.sDateOfOrder) ? DateTime.ParseExact(obj.sDateOfOrder, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? estimateDate = !string.IsNullOrEmpty(obj.sEstimateTime) ? DateTime.ParseExact(obj.sEstimateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.IsDeleted == false && x.PoSupCode.ToLower() == obj.PoSupCode.ToLower());
                    if (data == null)
                    {
                        var statusObjLog = new JsonLog
                        {
                            Code = obj.StatusObject,
                            Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            CreatedTime = DateTime.Now,
                        };

                        var listStatusObjLog = new List<JsonLog>();
                        listStatusObjLog.Add(statusObjLog);

                        obj.IsDeleted = false;
                        obj.DateOfOrder = date;
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.CreatedTime = DateTime.Now;
                        obj.EstimateTime = estimateDate;
                        obj.Status = "";
                        obj.ListStatusObjectLog = listStatusObjLog;

                        //Facco bỏ title => lấy mặc định = code để view ra
                        //obj.PoTitle = obj.PoSupCode;
                        //Vatco
                        obj.PoTitle = obj.PoTitle;
                        obj.ListUserView = ESEIM.AppContext.UserId;
                        //obj.Confirm = InsertConfirmText(obj.Confirm);
                        _context.PoBuyerHeaders.Add(obj);
                        _context.SaveChanges();
                        InsertPOSupTracking(obj);
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_ORDER_SUCCESS"]);//"Thêm mới thành công đơn đặt hàng";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_ADD_NEW"]);//"Mã đơn đặt hàng đã tồn tại, không thể thêm mới";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_ERROR"]);//"Có lỗi khi thêm đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]PoBuyerHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                DateTime? date = !string.IsNullOrEmpty(obj.sDateOfOrder) ? DateTime.ParseExact(obj.sDateOfOrder, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? estimateDate = !string.IsNullOrEmpty(obj.sEstimateTime) ? DateTime.ParseExact(obj.sEstimateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(obj.PoSupCode));
                //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                if (checkImp != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                }
                else
                {
                    var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                    var status = data.Status;
                    if (data != null)
                    {
                        var oldEtimateTime = data.EstimateTime;
                        data.PoTitle = obj.PoTitle;
                        data.DateOfOrder = date;
                        data.OrderBy = obj.OrderBy;
                        data.Buyer = obj.Buyer;
                        data.Email = obj.Email;
                        //data.Status = obj.Status;
                        data.ShippingAdd = obj.ShippingAdd;
                        data.Consigner = obj.Consigner;
                        data.Mobile = obj.Mobile;
                        data.PaymentTerm = obj.PaymentTerm;
                        data.Noted = obj.Noted;
                        data.BuyerCode = obj.BuyerCode;
                        data.SupCode = obj.SupCode;
                        data.Type = obj.Type;
                        data.EstimateTime = estimateDate;
                        data.Currency = obj.Currency;
                        data.ExchangeRate = obj.ExchangeRate;
                        data.ContractCode = obj.ContractCode;
                        data.ProjectCode = obj.ProjectCode;
                        data.ListUserView = ESEIM.AppContext.UserId;
                        data.StatusObject = obj.StatusObject;

                        var statusObjLog = new JsonLog
                        {
                            Code = obj.StatusObject,
                            Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            CreatedTime = DateTime.Now,
                        };

                        if (data.ListStatusObjectLog.Count > 0)
                        {
                            if (data.ListStatusObjectLog.LastOrDefault() != null && data.ListStatusObjectLog.LastOrDefault().Code != obj.StatusObject)
                                data.ListStatusObjectLog.Add(statusObjLog);
                        }
                        else
                        {
                            data.ListStatusObjectLog.Add(statusObjLog);
                        }

                        if (obj.Confirm.ToLower() != GetConfirmText(data.Confirm).ToLower())
                            data.Confirm = UpdateConfirmText(data.Confirm, obj.Confirm);

                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;

                        _context.PoBuyerHeaders.Update(data);
                        _context.SaveChanges();
                        InsertPOSupTracking(data);

                        if (oldEtimateTime != null && data.EstimateTime != null && oldEtimateTime.Value.Date != data.EstimateTime.Value.Date)
                        {
                            string[] param = new string[] { "@PoSupCode", "@OldEstimateDate", "@EstimateDate" };
                            object[] val = new object[] { data.PoSupCode, oldEtimateTime.Value.Date, data.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_UPDATE_PO_BUYER_HEADER", param, val);
                        }

                        msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_SUCCESS"]);//"Cập nhật thành công đơn đặt hàng";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_REFRESH"]);//"Đơn đặt hàng không tồn tại, vui lòng làm mới trang";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_ERROR"]);//"Có lỗi khi cập nhật đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                var status = data.Status;
                if (data != null)
                {
                    var checkImp = _context.ProdReceivedDetails.Any(x => !x.IsDeleted && x.LotProductCode.Equals(data.PoSupCode));
                    //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                    if (checkImp)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_DELETE"]);//"Đơn đặt hàng đã được nhập kho không được phép xóa";
                        return Json(msg);
                    }

                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.PoBuyerHeaders.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS"]);//"Xóa thành công đơn đặt hàng";
                    var list = _context.PoBuyerDetails.Where(x => x.IsDeleted == false && x.PoSupCode == data.PoSupCode).ToList();
                    foreach (var item in list)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                        object[] val = new object[] { item.ProductCode, int.Parse(item.Quantity), 0, item.ProductType, data.EstimateTime.Value.Date };
                        _repositoryService.CallProc("PR_UPDATE_PO_BUYER_DETAIL", param, val);
                    }

                    //Xóa các bảng chi tiết
                    list.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.PoBuyerDetails.UpdateRange(list);

                    var listPoSupDetails = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == data.PoSupCode).ToList();
                    listPoSupDetails.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.PoBuyerDetails.UpdateRange(listPoSupDetails);

                    var listRequestPoSups = _context.RequestPoSups.Where(x => !x.IsDeleted && x.PoSupCode == data.PoSupCode).ToList();
                    listRequestPoSups.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.RequestPoSups.UpdateRange(listRequestPoSups);

                    var listPoSupAttributes = _context.PoSupAttributes.Where(x => !x.IsDeleted && x.PoSupCode == data.PoSupCode).ToList();
                    listPoSupAttributes.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.PoSupAttributes.UpdateRange(listPoSupAttributes);

                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_REFRESH"]);//"Đơn đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_ERROR"]);//"Có lỗi khi xóa đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.Id == Id);
            var session = HttpContext.Session;
            session.SetInt32("IdObject", Id);
            data.ListUserView += ";" + ESEIM.AppContext.UserId;
            _context.SaveChanges();
            data.sEstimateTime = data.EstimateTime.HasValue ? data.EstimateTime.Value.ToString("dd/MM/yyyy") : null;
            data.Confirm = GetConfirmText(data.Confirm);
            JMessage msg = new JMessage();
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetUpdateLog(string PoSupCode)
        {
            var data = _context.PoSupUpdateTrackings.Where(x => x.PoSupCode == PoSupCode && x.IsDeleted == false).OrderByDescending(x => x.Id).ToList();
            foreach (var item in data)
            {
                var sUpdateContent = item.UpdateContent;
                if (!string.IsNullOrEmpty(sUpdateContent))
                {
                    try
                    {
                        var updateContent = JsonConvert.DeserializeObject<UpdateContent>(sUpdateContent);
                        var header = updateContent.Header;
                        var detail = updateContent.Detail;
                    }
                    catch (Exception ex) { }
                }
            }
            JMessage msg = new JMessage();
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GenPoSupCode(string supCode)
        {

            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var poSupCode = string.Empty;
            var no = 1;
            var noText = "01";

            if (!string.IsNullOrEmpty(supCode))
            {
                var data = _context.PoBuyerHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
                if (data.Count > 0)
                {
                    no = data.Count + 1;
                    if (no < 10)
                    {
                        noText = "0" + no;
                    }
                    else
                    {
                        noText = no.ToString();
                    }
                }

                poSupCode = string.Format("{0}{1}{2}{3}{4}", "PO_", "T" + monthNow + ".", yearNow + "_", noText, "_" + supCode);
            }

            return Json(poSupCode);
        }
        [HttpPost]
        public JsonResult GetStatusPOSup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.ContractStatusPoSup)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }
        //Danh sách Y/C đặt hàng
        [HttpPost]
        public JsonResult GetListRequest(string fromDate, string toDate, string projectCode, string contractCode, string requestCode, string supCode)
        {
            var sfromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
            var stoDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
            var data = (from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && ((sfromDate == null || x.CreatedTime >= sfromDate)) && (stoDate == null || x.CreatedTime <= stoDate)
                        //Phần dự án - Hợp đồng để hoặc 1 trong 2
                        && ((string.IsNullOrEmpty(contractCode) || (x.PoCode == contractCode)) || (string.IsNullOrEmpty(projectCode) || (x.ProjectCode == projectCode)))
                        && (string.IsNullOrEmpty(requestCode) || (x.ReqCode.Contains(requestCode)))).Select(x => new { Code = x.ReqCode, Name = string.Concat(x.Title, "(", x.CreatedTime.ToString("dd/MM/yyyy HH:mm"), ")"), x.Status, x.PoCode })
                        join b in _context.RequestImpProductDetails on a.Code equals b.ReqCode
                        where b.SupCode.Equals(supCode) && a.Status != "IMP_STATUS_CANCEL"
                        select new RequestModel
                        {
                            Code = a.Code,
                            Name = a.Name,
                            PoCode = a.PoCode
                        });
            //if (!string.IsNullOrEmpty(projectCode))
            //{
            //    data = (from x in data
            //            join y in _context.PoSaleHeaders on x.PoCode equals y.ContractCode
            //            where y.PrjCode == projectCode && !y.IsDeleted
            //            select new RequestModel
            //            {
            //                Code = x.Code,
            //                Name = x.Name
            //            });
            //}
            data = data.GroupBy(x => x.Code).Select(p => new RequestModel { Code = p.Key, Name = p.First().Name });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListAllRequest()
        {
            var data = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.ReqCode, Name = string.Concat(x.Title, "(", x.CreatedTime.ToString("dd/MM/yyyy HH:mm"), ")") });
            return Json(data);
        }

        [HttpGet]
        public JsonResult CheckListProductByRequest(string reqCode, string supCode, string poSupCode)
        {
            var check = true;
            var query = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                         join b in _context.PoBuyerDetails.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                         join c in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on b.PoSupCode equals c.PoSupCode
                         where b.ReqCode.Equals(reqCode) && b.SupCode.Equals(supCode) && b.Type.Equals("REQUEST")
                         select new
                         {
                             b
                         }).ToList();

            if (query.Count == 0)
                check = false;

            return Json(check);
        }

        [HttpGet]
        public JsonResult GetListProductByRequest(string reqCode, string supCode)
        {
            try
            {
                var query = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                             join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                             join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode into d1
                             from d2 in d1.DefaultIfEmpty()
                             join e in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals e.SupCode into e1
                             from e2 in e1.DefaultIfEmpty()
                             join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName into f1
                             from f2 in f1.DefaultIfEmpty()
                             join i in _context.CommonSettings on a.Unit equals i.CodeSet into i1
                             from i2 in i1.DefaultIfEmpty()
                             where a.ReqCode.Equals(reqCode) && a.SupCode.Equals(supCode)
                             select new
                             {
                                 a.Id,
                                 a.ReqCode,
                                 ReqName = b.Title,
                                 b.Title,
                                 a.ProductCode,
                                 ProductName = a.ProductType == "SUB_PRODUCT" ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)) != null ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)).AttributeName : null : _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)).ProductName : null,
                                 a.ProductType,
                                 b.CusCode,
                                 d2.CusName,
                                 a.ExpectedDate,
                                 sExpectedDate = a.ExpectedDate != null ? a.ExpectedDate.Value.ToString("dd/MM/yyyy") : null,
                                 a.SupCode,
                                 e2.SupName,
                                 CreatedBy = f2.GivenName,
                                 a.CreatedTime,
                                 a.PoCount,
                                 a.Quantity,
                                 a.RateConversion,
                                 a.RateLoss,
                                 a.Unit,
                                 UnitName = i2.ValueSet,
                                 a.Note,
                             }).ToList();

                var poSupDetails = _context.PoBuyerDetails.Where(x => !string.IsNullOrEmpty(x.ReqCode) && !x.IsDeleted).ToList();
                var queryRs = query.Where(x => !poSupDetails.Any(p => p.ReqCode.Equals(x.ReqCode) && p.ProductCode.Equals(x.ProductCode) && p.ProductType.Equals(x.ProductType)));

                return Json(queryRs);
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        [HttpGet]
        public JsonResult GetListRequestByPoSupCode(string poSupCode)
        {
            var query = _context.PoSupRequestImpProducts.Where(x => x.PoSupCode.Equals(poSupCode)).ToList();
            return Json(query);
        }

        [HttpPost]
        public object GetCountContractPO()
        {
            var countAll = 0;
            var assignSuccess = 0;
            var assignNotSuccess = 0;
            var session = HttpContext.GetSessionUser();
            var contracts = _context.PoBuyerHeaders.Where(x => !x.IsDeleted);
            if (session.IsAllData)
            {
                countAll = contracts.Count();
                var success = (from a in contracts.Where(x => x.Status.Equals("CONTRACT_STATUS_PO_SUP_RECEIVED"))
                               join b in _context.AssignMemberToOjects.Where(x => !x.IsDeleted) on a.ContractCode equals b.ObjId
                               where (a.CreatedBy.Equals(session.UserName) || b.UserId.Equals(session.UserId))
                               select new
                               {
                                   a.Id
                               }).Distinct();
                assignSuccess = success.Count();

                var notSuccess = (from a in contracts.Where(x => x.Status != "CONTRACT_STATUS_PO_SUP_RECEIVED")
                                  join b in _context.AssignMemberToOjects.Where(x => !x.IsDeleted) on a.ContractCode equals b.ObjId
                                  where (a.CreatedBy.Equals(session.UserName) || b.UserId.Equals(session.UserId))
                                  select new
                                  {
                                      a.Id
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
                                a.Id,
                                a.Status
                            }).Distinct();
                countAll = data.Count();
                var success = data.Where(x => x.Status == "CONTRACT_STATUS_PO_SUP_RECEIVED");
                assignSuccess = success.Count();
                var notSuccess = data.Where(x => x.Status != "CONTRACT_STATUS_PO_SUP_RECEIVED");
                assignNotSuccess = notSuccess.Count();
            }

            return new
            {
                All = countAll,
                AssignSuccess = assignSuccess,
                AssignNotSuccess = assignNotSuccess
            };
        }
        #endregion

        #region Detail

        public class JTableModelPayment : JTableModel
        {
            public string ContractCode { get; set; }
            public string PaymentName { get; set; }
            public string PaymentType { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
        }
        [HttpPost]
        public object JTableContractTabPayment([FromBody]JTableModelPayment jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ContractCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName", "DeadLine");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.FundAccEntrys
                                            .Where(x => !x.IsDeleted
                                                        //&& x.IsPlan == false
                                                        && x.ObjType == "PO_SUPPLIER"
                                                        && x.ObjCode == jTablePara.ContractCode
                                                        //&& (x.CatCode == "ADVANCE_CONTRACT" || x.CatCode == "PAY_CONTRACT")
                                                        //&& x.AetType == "Expense"
                                                        && (string.IsNullOrEmpty(jTablePara.PaymentName) || x.Title.Contains(jTablePara.PaymentName))
                                                        )
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        let status = _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(a => a.Id).Action
                        orderby a.CreatedTime descending
                        select new
                        {
                            CatName = b.CatName,
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            Total = a.Total,
                            Payer = a.Payer,
                            Currency = a.Currency,
                            Status = status,
                            Receiptter = a.Receiptter,
                            DeadLine = a.DeadLine
                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Currency", "IsPlan", "Status", "CatName", "DeadLine");

            return Json(jdata);

        }

        [HttpPost]
        public object GetTotalPayment([FromBody]JTableModelPayment jTablePara)
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
                                                        && x.ObjType == "PO_SUPPLIER"
                                                        && x.ObjCode == jTablePara.ContractCode
                                                        //&& x.Status == "APPROVED"
                                                        //&& (x.CatCode == "ADVANCE_CONTRACT" || x.CatCode == "PAY_CONTRACT")
                                                        //&& x.AetType == "Expense"
                                                        && (string.IsNullOrEmpty(jTablePara.PaymentName) || x.Title.Contains(jTablePara.PaymentName))
                                                        )
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        let status = _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(a => a.Id).Action
                        where status == "APPROVED"
                        orderby a.CreatedTime descending
                        select new
                        {
                            CatName = b.CatName,
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            Total = a.Total,
                            Payer = a.Payer,
                            Currency = a.Currency,
                            Status = status,
                            Receiptter = a.Receiptter,
                            DeadLine = a.DeadLine
                        };

            var totalReceipts = query.Where(x => x.AetType == "Receipt").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            var totalExpense = query.Where(x => x.AetType == "Expense").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));

            var totalReceiptCus = query.Where(x => x.AetType == "Expense").Sum(x => x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            var contract = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == jTablePara.ContractCode && !string.IsNullOrEmpty(x.Quantity) && x.UnitPrice != null);
            var totalContract = contract.Sum(x => (decimal.Parse(x.Quantity) * (decimal)x.UnitPrice) * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            var totalDebit = totalContract - totalReceiptCus;
            var rs = new { totalReceiptCus, totalContract, totalDebit, totalReceipts, totalExpense };
            return Json(rs);
        }
        [HttpPost]
        public object JTableDetail([FromBody]JTableModelDetail jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode.Equals(jTablePara.PoSupCode))
                            //join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                            //from b2 in b1.DefaultIfEmpty()
                            //join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                            //from c2 in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        where a.PoSupCode.Equals(jTablePara.PoSupCode)
                        select new
                        {
                            a.Id,
                            a.PoSupCode,
                            ProductName = a.ProductType == "SUB_PRODUCT" ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)) != null ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)).AttributeName : null : _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)).ProductName : null,
                            a.ProductCode,
                            a.Quantity,
                            a.Unit,
                            UnitName = d2.ValueSet,
                            a.UnitPrice,
                            a.Note,
                            a.TotalAmount,
                            a.ProductType,
                            ProductTypeName = a.ProductType == "SUB_PRODUCT" ? "Nguyên liệu" : "Thành phẩm",
                            a.Currency,
                            CurrencyName = e2.ValueSet,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "ProductCode", "ProductName", "Quantity", "Unit", "UnitName", "UnitPrice", "Note", "TotalAmount", "ProductType", "ProductTypeName", "Currency", "CurrencyName");
            return Json(jdata);
        }

        public object JTableDetailImp(string poSupCode, string contractCode, string projectCode)
        {
            var query = from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode.Equals(poSupCode))
                        join g in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode.Equals(poSupCode) && (string.IsNullOrEmpty(contractCode) || x.ContractCode.Equals(contractCode)) && (string.IsNullOrEmpty(projectCode) || x.ProjectCode.Equals(projectCode))) on a.PoSupCode equals g.PoSupCode
                        join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals f.CusCode into f1
                        from f2 in f1.DefaultIfEmpty()
                        where a.PoSupCode.Equals(poSupCode) && a.Type == "REQUEST"
                        select new
                        {
                            a.Id,
                            a.PoSupCode,
                            ProductName = a.ProductType == "SUB_PRODUCT" ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)) != null ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)).AttributeName : null : _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)).ProductName : null,
                            a.ProductCode,
                            a.Quantity,
                            a.Unit,
                            a.Note,
                            a.UnitPrice,
                            UnitName = d2.ValueSet,
                            a.TotalAmount,
                            a.ProductType,
                            a.Type,
                            a.PoCount,
                            a.RateConversion,
                            a.RateLoss,
                            sExpectedDate = a.ExpectedDate != null ? a.ExpectedDate.Value.ToString("dd/MM/yyyy") : null,
                            ProductTypeName = a.ProductType == "SUB_PRODUCT" ? "Nguyên liệu" : "Thành phẩm",
                            a.Currency,
                            CurrencyName = e2.ValueSet,
                            a.ReqCode,
                            ReqName = b.Title,
                            f2.CusCode,
                            f2.CusName,
                        };

            return query;
        }

        [HttpPost]
        public async Task<JsonResult> InsertDetail([FromBody]PoBuyerDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(obj.PoSupCode));
                //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                if (checkImp != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                }
                else
                {
                    using (await userLock.LockAsync(obj.ProductCode.ToLower()))
                    {
                        var data = _context.PoBuyerDetails.FirstOrDefault(x => x.IsDeleted == false && x.PoSupCode == obj.PoSupCode && x.ProductCode == obj.ProductCode && x.ProductType == obj.ProductType);
                        if (data == null)
                        {
                            obj.Id = 0;
                            obj.IsDeleted = false;
                            obj.CreatedBy = ESEIM.AppContext.UserName;
                            obj.CreatedTime = DateTime.Now;
                            obj.TotalAmount = obj.UnitPrice * int.Parse(obj.Quantity);
                            obj.QuantityNeedImport = decimal.Parse(obj.Quantity);
                            obj.Type = "STORAGE";

                            _context.PoBuyerDetails.Add(obj);
                            _context.SaveChanges();
                            msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_ADD_PRODUCT_SUCCESS"]);//"Thêm mới sản phẩm thành công";

                            var contract = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == obj.PoSupCode);
                            if (contract != null)
                            {

                                string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@PoSupCode", "@EstimateDate" };
                                object[] val = new object[] { obj.ProductCode, obj.Quantity, obj.ProductType, obj.PoSupCode, contract.EstimateTime.Value.Date };
                                _repositoryService.CallProc("PR_INSERT_PO_SUPPLER_DETAIL", param, val);

                                InsertPOSupTracking(contract);
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["CP_MSG_CAN_NOT_ADD_NEW"]);//"Mã sản phẩm đã tồn tại, không thể thêm mới";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_ERROR"]);//"Có lỗi khi thêm sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateDetail([FromBody]PoBuyerDetail obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(obj.PoSupCode));
                //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                if (checkImp != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                }
                else
                {
                    var data = _context.PoBuyerDetails.FirstOrDefault(x => x.IsDeleted == false && x.PoSupCode == obj.PoSupCode && x.ProductCode == obj.ProductCode && x.ProductType == obj.ProductType);
                    if (data != null)
                    {
                        int oldQuantity = int.Parse(data.Quantity);

                        data.Quantity = obj.Quantity;
                        data.TotalAmount = obj.UnitPrice * int.Parse(obj.Quantity);
                        data.QuantityNeedImport = decimal.Parse(obj.Quantity);
                        data.Unit = obj.Unit;
                        data.UnitPrice = obj.UnitPrice;
                        data.Note = obj.Note;
                        data.Currency = obj.Currency;
                        data.Type = "STORAGE";
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;

                        _context.PoBuyerDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_EDIT_SUCCESS"]);//"Sửa sản phẩm thành công";

                        var contract = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == data.PoSupCode);
                        if (contract != null && oldQuantity != int.Parse(obj.Quantity))
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                            object[] val = new object[] { obj.ProductCode, oldQuantity, int.Parse(obj.Quantity), data.ProductType, contract.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_UPDATE_PO_BUYER_DETAIL", param, val);

                            InsertPOSupTracking(contract);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_EDIT"]);//"Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_EDIT_ERROR"]);//"Có lỗi khi sửa sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateDetailReqImp([FromBody]RequestImpProductHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var checkInsert = _context.PoBuyerHeaders.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode.Equals(obj.PoSupCode));
                if (checkInsert != null)
                {
                    if (obj.ListProductDetail.Count > 0)
                    {
                        var dataRemove = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode.Equals(obj.PoSupCode));
                        if (dataRemove != null)
                        {
                            foreach (var item in dataRemove)
                            {
                                string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                                object[] val = new object[] { item.ProductCode, item.Quantity, 0, item.ProductType, checkInsert.EstimateTime.Value.Date };
                                _repositoryService.CallProc("PR_UPDATE_PO_BUYER_DETAIL", param, val);
                            }

                            _context.PoBuyerDetails.RemoveRange(dataRemove);
                            _context.SaveChanges();
                        }

                        var dataReqSupRemove = _context.RequestPoSups.Where(x => !x.IsDeleted && x.PoSupCode.Equals(obj.PoSupCode));
                        if (dataReqSupRemove != null)
                        {
                            _context.RequestPoSups.RemoveRange(dataReqSupRemove);
                            _context.SaveChanges();
                        }

                        foreach (var item in obj.ListProductDetail.Distinct())
                        {

                            var expectedDate = !string.IsNullOrEmpty(item.sExpectedDate) ? DateTime.ParseExact(item.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            var data = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == obj.PoSupCode && x.ReqCode == item.ReqCode && x.ProductCode == item.ProductCode && x.SupCode == item.SupCode);
                            if (data != null)
                            {
                                data.PoSupCode = obj.PoSupCode;
                                data.ReqCode = item.ReqCode;
                                data.ProductCode = item.ProductCode;
                                data.ProductType = item.ProductType;
                                data.PoCount = item.PoCount;
                                data.RateConversion = item.RateConversion;
                                data.RateLoss = item.RateLoss;
                                data.Quantity = "" + item.Quantity;
                                data.TotalAmount = item.Quantity * item.UnitPrice;
                                data.Unit = item.Unit;
                                data.UnitPrice = item.UnitPrice;
                                data.Note = item.Note;
                                data.ExpectedDate = expectedDate;
                                data.SupCode = item.SupCode;
                                data.UpdatedBy = User.Identity.Name;
                                data.UpdatedTime = DateTime.Now;
                                data.QuantityNeedImport = item.Quantity;
                                data.Type = "REQUEST";
                                _context.PoBuyerDetails.Update(data);
                                _context.SaveChanges();
                                msg.Title = _stringLocalizer["CP_MSG_UPDATE_PRODUCT_SUCCESS"];
                            }
                            else
                            {
                                var poSupDetail = new PoBuyerDetail
                                {
                                    PoSupCode = obj.PoSupCode,
                                    ReqCode = item.ReqCode,
                                    ProductCode = item.ProductCode,
                                    ProductType = item.ProductType,
                                    PoCount = item.PoCount,
                                    RateConversion = item.RateConversion,
                                    RateLoss = item.RateLoss,
                                    Quantity = "" + item.Quantity,
                                    TotalAmount = item.Quantity * item.UnitPrice,
                                    Unit = item.Unit,
                                    UnitPrice = item.UnitPrice,
                                    Note = item.Note,
                                    ExpectedDate = expectedDate,
                                    SupCode = item.SupCode,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    QuantityNeedImport = item.Quantity,
                                    Type = "REQUEST"
                                };

                                _context.PoBuyerDetails.Add(poSupDetail);
                                _context.SaveChanges();
                                msg.Title = _stringLocalizer["CP_MSG_ADD_PRODUCT_SUCCESS"];
                            }
                            //var poSupDetail = new PoSupDetail
                            //{
                            //    PoSupCode = obj.PoSupCode,
                            //    ReqCode = item.ReqCode,
                            //    ProductCode = item.ProductCode,
                            //    ProductType = item.ProductType,
                            //    PoCount = item.PoCount,
                            //    RateConversion = item.RateConversion,
                            //    RateLoss = item.RateLoss,
                            //    Quantity = "" + item.Quantity,
                            //    TotalAmount = item.Quantity * item.UnitPrice,
                            //    Unit = item.Unit,
                            //    UnitPrice = item.UnitPrice,
                            //    Note = item.Note,
                            //    ExpectedDate = expectedDate,
                            //    SupCode = item.SupCode,
                            //    CreatedBy = User.Identity.Name,
                            //    CreatedTime = DateTime.Now,
                            //    QuantityNeedImport = item.Quantity,
                            //    Type = "REQUEST"
                            //};

                            //_context.PoBuyerDetails.Update(data);
                            //_context.SaveChanges();
                            //msg.Title = "Câp nhật sản phẩm cho đơn đặt hàng thành công";

                            var requestPoSup = new RequestPoSup
                            {
                                PoSupCode = obj.PoSupCode,
                                ReqCode = item.ReqCode,
                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                Quantity = item.Quantity,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                            };

                            _context.RequestPoSups.Add(requestPoSup);
                            _context.SaveChanges();

                            string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@PoSupCode", "@EstimateDate" };
                            object[] val = new object[] { item.ProductCode, item.Quantity, item.ProductType, obj.PoSupCode, checkInsert.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_INSERT_PO_SUPPLER_DETAIL", param, val);

                            InsertPOSupTracking(checkInsert);
                        }

                        //Xử lỷ trạng thái Y/C đặt hàng
                        var listProductProcessed = _context.RequestPoSups.Where(x => !x.IsDeleted).OrderBy(x => x.ReqCode).Select(x => new { x.ProductCode, x.ReqCode });
                        var listReqProcessed = _context.RequestPoSups.Where(x => !x.IsDeleted).GroupBy(x => x.ReqCode).Select(x => x.First().ReqCode).ToList();
                        var listReqCreated = new List<string>();
                        var listReqPending = new List<string>();
                        var listReqDone = new List<string>();

                        foreach (var reqCode in listReqProcessed)
                        {
                            var listProductInReq = _context.RequestImpProductDetails.Where(x => x.ReqCode.Equals(reqCode)).Select(x => new { x.ProductCode, x.ReqCode }).ToList();
                            var listProductCompare = listProductProcessed.Where(x => x.ReqCode.Equals(reqCode)).ToList();
                            var check = listProductInReq.Where(x => listProductCompare.Any(p => p.ProductCode.Equals(x.ProductCode) && p.ReqCode.Equals(x.ReqCode))).ToList();
                            if (check.Count == listProductInReq.Count)
                            {
                                listReqDone.Add(reqCode);
                            }
                            else
                            {
                                if (check.Count > 0)
                                {
                                    listReqPending.Add(reqCode);
                                }

                                if (check.Count == 0)
                                {
                                    listReqCreated.Add(reqCode);
                                }
                            }
                        }

                        var listReqCreateds = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && !x.Status.Equals("IMP_STATUS_CANCEL") && listReqCreated.Any(p => p.Equals(x.ReqCode))).ToList();
                        listReqCreateds.ForEach(x => x.Status = "IMP_STATUS_CREATED");

                        var listReqPendings = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && !x.Status.Equals("IMP_STATUS_CANCEL") && listReqPending.Any(p => p.Equals(x.ReqCode))).ToList();
                        listReqPendings.ForEach(x => x.Status = "IMP_STATUS_PENDING");

                        var listReqDones = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && !x.Status.Equals("IMP_STATUS_CANCEL") && listReqDone.Any(p => p.Equals(x.ReqCode))).ToList();
                        listReqDones.ForEach(x => x.Status = "IMP_STATUS_DONE");

                        if (listReqCreateds.Count > 0)
                            _context.RequestImpProductHeaders.UpdateRange(listReqCreateds);

                        if (listReqPendings.Count > 0)
                            _context.RequestImpProductHeaders.UpdateRange(listReqPendings);

                        if (listReqDones.Count > 0)
                            _context.RequestImpProductHeaders.UpdateRange(listReqDones);

                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CP_MSG_LIST_PRODUCT"];
                    }

                    //var poSupReqImp = new PoSupRequestImpProduct
                    //{
                    //    PoSupCode = obj.PoSupCode,
                    //    ReqCode = reqCode
                    //};

                    //var check = _context.PoSupRequestImpProducts.FirstOrDefault(x => x.PoSupCode.Equals(obj.PoSupCode) && x.ReqCode.Equals(reqCode));
                    //if (check == null)
                    //{
                    //    _context.PoSupRequestImpProducts.Add(poSupReqImp);
                    //    _context.SaveChanges();
                    //}

                    //if (!string.IsNullOrEmpty(obj.ReqCode))
                    //{
                    //    var listReqCode = obj.ReqCode.Split(",");
                    //    if (listReqCode.Length > 0)
                    //    {
                    //        foreach (var reqCode in listReqCode)
                    //        {
                    //            //var listRemove = _context.PoSupRequestImpProducts.Where(x => x.PoSupCode.Equals(obj.PoSupCode)).ToList();
                    //            //if (listRemove == null)
                    //            //{
                    //            //    _context.PoSupRequestImpProducts.RemoveRange(listRemove);
                    //            //    _context.SaveChanges();
                    //            //}

                    //            var impHeader = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(reqCode));
                    //            if (impHeader != null)
                    //            {

                    //            }
                    //            else
                    //            {
                    //                msg.Error = true;
                    //                msg.Title = "Vui lòng thêm phiếu Yêu cầu đặt hàng trước khi lưu sản phẩm";
                    //            }
                    //        }
                    //    }
                    //}
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CP_MSG_ADD_TICKET_BEFORE_SAVE_PRODUCT"];
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
        public JsonResult DeleteDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoBuyerDetails.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                if (data != null)
                {
                    var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(data.PoSupCode));
                    //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                    if (checkImp != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                    }
                    else
                    {
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        data.IsDeleted = true;

                        _context.PoBuyerDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS1"]);//"Xóa sản phẩm thành công";

                        var contract = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == data.PoSupCode);
                        if (contract != null)
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                            object[] val = new object[] { data.ProductCode, data.Quantity, 0, data.ProductType, contract.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_UPDATE_PO_BUYER_DETAIL", param, val);

                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_EDIT"]);//"Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS"]);//"Có lỗi khi xóa sản phẩm";
            }
            return Json(msg);
        }
        #endregion

        #region PO_SUP_UPDATE_TRACKING
        public object InsertPOSupTracking(PoBuyerHeader obj1)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var poHeader = obj1;
                var poDetail = _context.PoBuyerDetails.Where(x => x.PoSupCode.Equals(obj1.PoSupCode)).ToList();
                var jsonData = new UpdateContent
                {
                    Header = poHeader,
                    Detail = poDetail
                };

                var json = JsonConvert.SerializeObject(jsonData);
                var obj = new PoSupUpdateTracking
                {
                    Status = obj1.Status,
                    PoSupCode = obj1.PoSupCode,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    UpdateContent = json
                };

                _context.PoSupUpdateTrackings.Add(obj);
                _context.SaveChanges();

                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_LOG_SUCCESS"]);//"Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        [HttpPost]
        public object UpdatePOCusTracking(string poSupCode, string status)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var poHeader = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode));
                var poDetail = _context.PoBuyerDetails.Where(x => x.PoSupCode.Equals(poSupCode)).ToList();
                var jsonData = new UpdateContent
                {
                    Header = poHeader,
                    Detail = poDetail
                };

                var json = JsonConvert.SerializeObject(jsonData);
                var obj = new PoSupUpdateTracking
                {
                    Status = status,
                    PoSupCode = poSupCode,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    UpdateContent = json
                };

                _context.PoSupUpdateTrackings.Add(obj);
                _context.SaveChanges();

                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_LOG_SUCCESS"]);//"Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }

        //[HttpPost]
        //public string InsertConfirmText(string confirm)
        //{
        //    var json = string.Empty;
        //    try
        //    {
        //        var confirmText = new ConfirmText
        //        {
        //            Id = Guid.NewGuid().ToString(),
        //            Body = confirm,
        //            CreateTime = DateTime.Now.ToString("dd/MM/yyyy hh:mm"),
        //            UserName = User.Identity.Name
        //        };

        //        var listConfirm = new List<ConfirmText>();
        //        listConfirm.Add(confirmText);

        //        json = JsonConvert.SerializeObject(listConfirm);
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }

        //    return json;
        //}

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
        public object GetListConfirmText(string poSupCode)
        {
            var data = new List<ConfirmText>();
            try
            {
                var obj = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode) && !x.IsDeleted);
                if (obj != null)
                {
                    if (!string.IsNullOrEmpty(obj.Confirm))
                    {
                        var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                        if (listConfirm.Count > 0)
                        {
                            //data = listConfirm.Where(x => x.UserName.Equals(User.Identity.Name)).ToList();
                            data = listConfirm;
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
        public object UpdateConfirmTextById(string poSupCode, string id, string confirm)
        {
            var json = string.Empty;
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode) && !x.IsDeleted);
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
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_SUCCESS"]);//"Cập nhật thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_ERROR"]);//"Cập nhật không thành công";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
        }

        [HttpPost]
        public object InsertConfirmText(string poSupCode, string confirm)
        {
            var listConfirm = new List<ConfirmText>();
            var json = string.Empty;
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode) && !x.IsDeleted);
                if (obj != null)
                {
                    if (!string.IsNullOrEmpty(obj.Confirm))
                    {
                        listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                        if (listConfirm.Count > 0)
                        {
                            var check = listConfirm.FirstOrDefault(x => x.Body.Equals(confirm));
                            if (check == null)
                            {
                                var confirmObj = new ConfirmText
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Body = confirm,
                                    CreateTime = DateTime.Now.ToString("dd/MM/yyyy hh:mm"),
                                    UserName = User.Identity.Name
                                };
                                listConfirm.Add(confirmObj);
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = String.Format(_stringLocalizer["CP_MSG_CONTENT_IMPORT_OTHER_ CONTENTS"]);//"Nội dung đã tồn tại vui lòng nhập nội dung khác";
                                return Json(msg);
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_SUCCESS"]);//"Thêm thành công";
                    }
                    else
                    {
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
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_SUCCESS"]);//"Thêm thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_SUCCESS_ERROR"]);//"Thêm không thành công";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
        }

        [HttpPost]
        public object DeleteConfirmTextById(string poSupCode, string id)
        {
            var json = string.Empty;
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode) && !x.IsDeleted);
                if (obj != null)
                {
                    if (!string.IsNullOrEmpty(obj.Confirm))
                    {
                        var listConfirm = JsonConvert.DeserializeObject<List<ConfirmText>>(obj.Confirm);
                        if (listConfirm.Count > 0)
                        {
                            var item = listConfirm.FirstOrDefault(x => x.Id.Equals(id) && x.UserName.Equals(User.Identity.Name));
                            if (item != null)
                            {
                                listConfirm.Remove(item);
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = String.Format(_stringLocalizer["CP_MSG_NOTE_DELETE_NOTE"]);//"Bạn không thể xóa ý kiến của người khác";
                                return msg;
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS"]);//"Xóa thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_ERROR"]);//"Xóa không thành công";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
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
                         Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         Catalogue = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(x => x.ProductCode.Equals(b.ProductCode)).ProductName : "",
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                         ProductTypeName = "Nguyên liệu",
                         PriceM = b.Value
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          Catalogue = "",
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                          ProductTypeName = "Thành phẩm",
                          PriceM = ""
                      };

            return rs1.Concat(rs);
        }

        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        #endregion

        #region PO_SUP_UPDATE_TRACKING
        [HttpPost]
        public object GetSupName(int Id)
        {
            var query = from a in _context.PoBuyerHeaderPayments
                        join b in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals b.SupCode
                        where a.Id.Equals(Id)
                        select new
                        {
                            b.SupName
                        };
            if (query != null)
            {
                return query;
            }
            else
            {
                return "";
            }
        }

        [HttpPost]
        public object UpdatePOSupTracking(string poSupCode, string status, string confirm)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var poHeader = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode));
                var poDetail = _context.PoBuyerDetails.Where(x => x.PoSupCode.Equals(poSupCode)).ToList();
                var jsonData = new
                {
                    poHeader,
                    poDetail
                };

                var json = JsonConvert.SerializeObject(jsonData);
                var obj = new PoSupUpdateTracking
                {
                    Status = status,
                    PoSupCode = poSupCode,
                    //Confirm = confirm,
                    //ConfirmTime = !string.IsNullOrEmpty(confirm) ? DateTime.Now : (DateTime?)null,
                    CreatedBy = User.Identity.Name,
                    CreatedTime = DateTime.Now,
                    IsDeleted = false,
                    UpdateContent = json
                };

                _context.PoSupUpdateTrackings.Add(obj);
                _context.SaveChanges();

                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_LOG_SUCCESS"]);//"Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        #endregion

        #region Attribute

        public JsonResult InsertContractAttr([FromBody]PoSupAttribute obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkExist = _context.PoSupAttributes.FirstOrDefault(x => x.AttrCode.ToLower() == obj.AttrCode.ToLower() && x.PoSupCode == obj.PoSupCode);
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Mã mở rộng đã tồn tai!";
                }
                else
                {
                    //var contractVersion = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == obj.ContractCode).Version;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    //obj.ContractVersion = contractVersion;
                    _context.PoSupAttributes.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Thêm mở rộng thành công!";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Có lỗi xảy ra khi thêm!";
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
                var data = _context.PoSupAttributes.FirstOrDefault(x => x.ContractAttributeID == id);
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
        public JsonResult UpdateContractAttr([FromBody]PoSupAttribute obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoSupAttributes.FirstOrDefault(x => x.ContractAttributeID == obj.ContractAttributeID);
                if (data != null)
                {
                    data.AttrValue = obj.AttrValue;
                    data.AttrGroup = obj.AttrGroup;
                    data.Note = obj.Note;

                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PoSupAttributes.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Cập nhật mở rộng thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ATTRIBUTE_REFRESH"]);//"Không tồn tại thuộc tính mở rộng này, vui lòng làm mới trang";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult DeleteContractAttr(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.PoSupAttributes.FirstOrDefault(x => x.ContractAttributeID == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Xóa mở rộng thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["CP_TITLE_TAB_TTRIBUTE"]);// "Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public object JTableAttribute([FromBody]JTableModelAttribute jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PoSupAttributes.Where(x => !x.IsDeleted && x.PoSupCode == jTablePara.PoSupCode)
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
        #endregion

        #region Contract Po sale
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

        [HttpPost]
        public object GetProjects()
        {
            var data = _context.Projects.Where(x => !x.FlagDeleted).OrderByDescending(x => x.Id).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).ToList();
            return Json(data);
        }

        [HttpGet]
        public object GetObjectRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Relative)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public object JtableContractSale([FromBody]JTableModelContract jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.PoSupCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoSaleHeaders on a.ObjCode equals b.ContractCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         where a.ObjRootCode == jTablePara.PoSupCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             c.CusName,
                             b.ContractNo,
                             b.EndDate,
                             b.Title,
                             b.Budget,
                             b.BudgetExcludeTax,
                             b.ExchangeRate,
                             a.ObjRelative,
                             a.ObjNote
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale))
                join b in _context.PoSaleHeaders on a.ObjRootCode equals b.ContractCode
                join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                where a.ObjCode == jTablePara.PoSupCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    c.CusName,
                    b.ContractNo,
                    b.EndDate,
                    b.Title,
                    b.Budget,
                    b.BudgetExcludeTax,
                    b.ExchangeRate,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "CusName", "ContractNo", "EndDate", "Title", "Budget", "BudgetExcludeTax", "ExchangeRate", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractSale([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CP_MSG_CONTRACT_EXIST"];
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
        public JsonResult UpdateContractSale([FromBody]MappingMain obj)
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
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteContractSale(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        #endregion

        #region Request Import Product
        [HttpPost]
        public object JtableRequestImportProduct([FromBody]JTableModelContract jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.PoSupCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.RequestImpProductHeaders on a.ObjCode equals b.ReqCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         join d in _context.Users.Where(x => x.Active) on b.CreatedBy equals d.UserName into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ObjRootCode == jTablePara.PoSupCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
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
                where a.ObjCode == jTablePara.PoSupCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.Title,
                    b.CusCode,
                    c.CusName,
                    CreatedBy = d2.GivenName,
                    b.CreatedTime,
                    a.ObjRelative,
                    a.ObjNote
                });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "Title", "CusCode", "CusName", "CreatedBy", "CreatedTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertRequestImportProduct([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CP_MSG_RQ_IMP_EXIST"];
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
        public JsonResult UpdateRequestImportProduct([FromBody]MappingMain obj)
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
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        #endregion

        #region Project
        [HttpPost]
        public object JtableContractProject([FromBody]JTableModelContract jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.PoSupCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.Projects on a.ObjCode equals b.ProjectCode
                         where a.ObjRootCode == jTablePara.PoSupCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
                         select new
                         {
                             a.Id,
                             a.ObjCode,
                             b.ProjectTitle,
                             b.Budget,
                             Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == b.Currency).ValueSet ?? "",
                             b.StartTime,
                             b.EndTime,
                         }).Union(
                from a in _context.MappingMains.Where(x => x.ObjRootType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project))
                join b in _context.Projects on a.ObjRootCode equals b.ProjectCode
                where a.ObjCode == jTablePara.PoSupCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
                    b.ProjectTitle,
                    b.Budget,
                    Currency = _context.CommonSettings.FirstOrDefault(y => !y.IsDeleted && y.CodeSet == b.Currency).ValueSet ?? "",
                    b.StartTime,
                    b.EndTime,
                }
                );
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjCode", "ProjectTitle", "Budget", "Currency", "StartTime", "EndTime", "ObjRelative", "ObjNote");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertContractProject([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CP_MSG_PROJECT_EXIST"];
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
        public JsonResult UpdateContractProject([FromBody]MappingMain obj)
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
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string PoCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }
        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.PoCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                           .Select(p => new
                                                           {
                                                               p.FileID,
                                                               p.ListUserShare,
                                                               p.UserShares
                                                           }).ToList();
            var session = HttpContext.GetSessionUser();

            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.PoCode && x.ObjectType == EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier))
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
                              b.FileID,
                              ReposName = f != null ? f.ReposName : "",
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                              ListUserShare = g.ListUserShare
                          }).Union(
                  from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                  join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                  join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  let rela = JsonConvert.DeserializeObject<ObjRelativeContract>(a.ObjectRelative)
                  where rela.ObjectInstance.Equals(jTablePara.PoCode) && rela.ObjectType.Equals(EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier))
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      b.FileID,
                      ReposName = f != null ? f.ReposName : "",
                      SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                      ListUserShare = a.ListUserShare
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName",
                "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "ReposCode", "TypeFile",
                "FileID", "SizeOfFile", "ListUserShare");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertPOFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
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
                        //var suggesstion = GetSuggestionsPOFile(obj.PoCode);
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
                        //    msg.Title = _stringLocalizer["CP_MSG_ENTER_EXT_ATTR"];
                        //    return Json(msg);
                        //}

                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                                && x.ObjectCode.Equals(obj.PoCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.ContractPo)));
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
                            msg.Title = _stringLocalizer["CP_MSG_PLS_SELECT_FORDER"];
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
                        FileCode = string.Concat("PO", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.PoCode,
                        ObjectType = EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier),
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
                        Desc = obj.Desc,
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
                    msg.Title = _sharedResources["COM_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsPOFile(string poCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == poCode && x.ObjectType == EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult GetPOFile(int id)
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
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdatePOFile(EDMSRepoCatFileModel obj)
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
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CP_MSG_PLS_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CP_MSG_FILE_NOT_EXIST"];
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
        public JsonResult DeletePOFile(int id)
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
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
                }
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
                            ObjectType = EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier),
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
                        ObjectType = EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier),
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
        public class ObjRelativeContractPO
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }
        #endregion

        #region Schedule
        [HttpPost]
        public JsonResult ScheduleContractPO(int month, int year)
        {
            var session = HttpContext.GetSessionUser();
            var msg = new JMessage();
            var lstCountContract = new List<CalendarContractPO>();
            var listDateInMonth = DateTimeExtensions.GetDates(year, month);
            var contracts = from a in _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted)
                            where (session.IsAllData
                             || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                             || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                            select new
                            {
                                a.Status,
                                a.PoSupCode
                            };
            foreach (var item in listDateInMonth)
            {

                var countExpired = (from a in contracts
                                    join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_HET_HAN")) on a.PoSupCode equals b.ObjCode
                                    where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                    select new
                                    {
                                        a.PoSupCode
                                    }).DistinctBy(x => x.PoSupCode).Count();
                var countNextPay = (from a in contracts
                                    join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO")) on a.PoSupCode equals b.ObjCode
                                    where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                    select new
                                    {
                                        a.PoSupCode
                                    }).DistinctBy(x => x.PoSupCode).Count();
                var countRenew = (from a in contracts
                                  join b in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO")) on a.PoSupCode equals b.ObjCode
                                  where (!string.IsNullOrEmpty(b.AttrValue) && DateTime.ParseExact(b.AttrValue, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date == item.Date)
                                  select new
                                  {
                                      a.PoSupCode
                                  }).DistinctBy(x => x.PoSupCode).Count();

                var calendar = new CalendarContractPO
                {
                    Date = item,
                    Expried = countExpired,
                    NextPay = countNextPay,
                    Renew = countRenew
                };
                lstCountContract.Add(calendar);
            }
            msg.Object = lstCountContract;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult JTableCalendar([FromBody] CalendarContracPOtModel jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.Date) ? DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

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

            var query = (from a in _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted).Where(x => !x.IsDeleted)
                         join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                         from d2 in d1.DefaultIfEmpty()
                         join k in _context.Users.Where(x => x.Active) on a.CreatedBy equals k.UserName
                         join e in _context.AttributeManagerGalaxys.Where(x => !x.IsDeleted && x.AttrCode.Equals(attrCode)) on a.PoSupCode equals e.ObjCode
                         where (toDate == null || (toDate.Value.ToString("dd/MM/yyyy") == e.AttrValue)) &&
                         //Điều kiện phân quyền dữ liệu
                         (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select new JtableView
                         {
                             Id = a.Id,
                             PoSupCode = a.PoSupCode,
                             PoTitle = a.PoTitle,
                             OrderBy = a.OrderBy,
                             Consigner = a.Consigner,
                             Mobile = a.Mobile,
                             Buyer = a.Buyer,
                             BuyerCode = a.BuyerCode + " - " + b2.CusName,
                             SupCode = a.SupCode,
                             SupName = c2.SupName,
                             CreatedBy = a.CreatedBy,
                             CreatedTime = a.CreatedTime,
                             Status = d2.ValueSet,
                             Icon = d2.Logo,
                             Type = a.Type,
                         }).DistinctBy(x => x.PoSupCode);
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            for (var i = 0; i < data.Count(); i++)
            {
                data[i].ExpirationDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(data[i].PoSupCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_HET_HAN") && p.ObjCode.Equals(data[i].PoSupCode)).AttrValue : "";
                data[i].RenewalDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(data[i].PoSupCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_GIA_HAN_TIEP_THEO") && p.ObjCode.Equals(data[i].PoSupCode)).AttrValue : "";
                data[i].PaymentNextDate = _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(data[i].PoSupCode)) != null ? _context.AttributeManagerGalaxys.LastOrDefault(p => p.AttrCode.Equals("NGAY_THANH_TOAN_TIEP_THEO") && p.ObjCode.Equals(data[i].PoSupCode)).AttrValue : "";
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle", "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status", "Icon", "Type", "TotalAmount", "TotalPayment", "ContractNo", "Title", "ExpirationDate", "RenewalDate", "PaymentNextDate");
            return Json(jdata);
        }

        public class JtableView
        {
            public int Id { get; set; }
            public string PoSupCode { get; set; }
            public string PoTitle { get; set; }
            public string OrderBy { get; set; }
            public string Consigner { get; set; }
            public string Mobile { get; set; }
            public string Buyer { get; set; }
            public string BuyerCode { get; set; }
            public string SupCode { get; set; }
            public string SupName { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string Status { get; set; }
            public string Icon { get; set; }
            public string Type { get; set; }
            public string ExpirationDate { get; set; }
            public string RenewalDate { get; set; }
            public string PaymentNextDate { get; set; }
        }
        public class CalendarContractPO
        {
            public int NextPay { get; set; }
            public int Renew { get; set; }
            public int Expried { get; set; }
            public DateTime Date { get; set; }
        }
        public class CalendarContracPOtModel : JTableModel
        {
            public string Date { get; set; }
            public int Value { get; set; }
        }
        #endregion

        #region Member
        public class JTableModelContracPOPeople : JTableModel
        {
            public string ContractPOCode { get; set; }
        }
        [HttpPost]
        public object JTableMember([FromBody]JTableModelContracPOPeople jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssignMemberToOjects.Where(x => !x.IsDeleted && x.ObjId.Equals(jTablePara.ContractPOCode) && x.ObjType.Equals("CONTRACT_PO"))
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
        public JsonResult AssignToContractPO([FromBody] AssignMemberToContractPO obj)
        {
            var msg = new JMessage();
            try
            {
                var check = _context.AssignMemberToOjects.FirstOrDefault(x => !x.IsDeleted && x.UserId.Equals(obj.UserId) && x.ObjId.Equals(obj.ContractPOCode));
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
                        ObjId = obj.ContractPOCode,
                        ObjType = "CONTRACT_PO",
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
        public JsonResult DeleteAssignContractPO(int id)
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

        public class AssignMemberToContractPO
        {
            public string ContractPOCode { get; set; }
            public string UserId { get; set; }
            public string Note { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_attrManagerController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivity.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
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
            var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.PoSupCode)
                && x.ObjectType.Equals("CONTRACT_PO"));
            if (check != null)
            {
                var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                try
                {
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
                catch (Exception ex)
                {
                    return data;
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
            var data = _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode.Equals(code)).Select(x => new
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
            var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.PoSupCode)
                        && x.ObjectType.Equals("CONTRACT_PO"));
            if (check != null)
            {
                var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                try
                {
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
                catch (Exception ex)
                {
                    return data;
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
            var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.PoSupCode) && x.ObjectType.Equals("CONTRACT_PO"));
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
        #endregion

        #region Log status
        [HttpPost]
        public JsonResult GetLogStatus(string poSupCode)
        {
            var contractPO = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode.Equals(poSupCode) && !x.IsDeleted);
            return Json(contractPO);
        }
        #endregion
    }
    public class UpdateContent
    {
        public PoBuyerHeader Header { get; set; }
        public List<PoBuyerDetail> Detail { get; set; }
    }
}