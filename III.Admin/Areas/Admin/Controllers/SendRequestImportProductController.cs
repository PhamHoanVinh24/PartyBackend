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
    public class SendRequestImportProductController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SendRequestImportProductController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;
        private readonly IRepositoryService _repositoryService;

        public SendRequestImportProductController(EIMDBContext context, IUploadService upload,
            IHostingEnvironment hostingEnvironment, IStringLocalizer<SendRequestImportProductController> stringLocalizer,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
        IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<ContractController> contractController,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController,
            IRepositoryService repositoryService, IStringLocalizer<WorkflowActivityController> workflowActivityController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _cardJobController = cardJobController;
            _contractController = contractController;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
            _fileObjectShareController = fileObjectShareController;
            _edmsRepositoryController = edmsRepositoryController;
            _workflowActivityController = workflowActivityController;
        }
        [Breadcrumb("ViewData.CrumbSendRqImpProd", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContractHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbContractHome"] = _sharedResources["COM_CRUMB_CONTRACT_HOME"];
            ViewData["CrumbSendRqImpProd"] = _sharedResources["COM_CRUMB_RQ_IMP_PROD"];
            return View();
        }

        #region ComboboxValue
        [HttpPost]
        public JsonResult GetListCommon()
        {
            var list = _context.CommonSettings.Where(x => !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, x.Group }).AsNoTracking();
            return Json(list);
        }
        #endregion

        #region Contract Header
        public class JTableModelContract : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ContractCode { get; set; }
            public string PoSupCode { get; set; }
            public string ReqCode { get; set; }
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
            public string ReqCode { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelContract jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            string status = jTablePara.Status;

            var query = from a in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted)
                            //join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.PoCode equals b.ContractCode
                        join c in _context.Customerss.Where(x => !x.IsDeleted) on a.CusCode equals c.CusCode into c1
                        from c in c1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusObject equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName
                        where ((a.IsDeleted == false) &&
                              ((fromDate == null) || (a.CreatedTime.Date >= fromDate)) &&
                              ((toDate == null) || (a.CreatedTime.Date <= toDate)) &&
                              (string.IsNullOrEmpty(jTablePara.BranchId) || f.BranchId.Equals(jTablePara.BranchId)) &&
                              (string.IsNullOrEmpty(jTablePara.ReqCode) || a.ReqCode.ToLower().Contains(jTablePara.ReqCode.ToLower())) &&
                              (string.IsNullOrEmpty(jTablePara.ContractCode) || (a.PoCode.ToLower().Equals(jTablePara.ContractCode.ToLower()))) &&
                              (string.IsNullOrEmpty(jTablePara.ProjectCode) || (a.ProjectCode.ToLower().Equals(jTablePara.ProjectCode.ToLower()))) &&
                              (string.IsNullOrEmpty(jTablePara.Status) || a.StatusObject.Equals(status)))
                              //Điều kiện phân quyền dữ liệu
                              && (session.IsAllData
                              || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                              || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            a.Title,
                            a.PoCode,
                            a.CusCode,
                            c.CusName,
                            CreatedBy = f.GivenName,
                            a.CreatedTime,
                            Status = e2 != null ? e2.ValueSet : "",
                            Icon = e2.Logo
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().DistinctBy(x => x.ReqCode).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "Title", "PoCode", "CusCode", "CusName", "CreatedBy", "CreatedTime", "Status", "Icon");
            return Json(jdata);
        }
        [HttpPost]
        public object JtreeSigner()
        {
            var data = _context.PoSaleHeaders.Where(x => !x.IsDeleted).DistinctBy(a => a.Signer).Select(x => x.Signer).ToList();
            return data;
        }

        [HttpPost]
        public object GetCustomers()
        {
            var data = from a in _context.Customerss.Where(x => !x.IsDeleted)
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
                       };
            return Json(data.ToList());
        }
        [HttpPost]
        public object GetSuppliers()
        {
            var data = from a in _context.Suppliers.Where(x => !x.IsDeleted)
                           //join b in _context.SupplierExtends.Where(x=>x.isdeleted==false&&(x.ext_code.ToLower()=="zip_code"|| x.ext_code.ToLower() == "person_in_charge")) on a.SupID equals b.supplier_code 
                       orderby a.SupID descending
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
                       };

            return Json(data.ToList());
        }

        [HttpGet]
        public object GetListPoProduct(string contractCode)
        {
            var today = DateTime.Now.Date;
            var listContractHeader = _context.PoSaleHeaders.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(contractCode) || x.ContractCode.Equals(contractCode))).OrderByDescending(p => p.ContractHeaderID);
            var listLogProductDetail = new List<LogProductDetail>();
            foreach (var item in listContractHeader)
            {
                if (!string.IsNullOrEmpty(item.LogProductDetail))
                    listLogProductDetail.AddRange(JsonConvert.DeserializeObject<List<LogProductDetail>>(item.LogProductDetail));
            }

            var listProductDetail = listLogProductDetail.Where(x => x.ImpQuantity <= 0 && x.EstimateDate.Date >= today).GroupBy(x => x.ContractCode).Select(x => new
            {
                Code = x.FirstOrDefault().ContractCode,
                Quantity = x.Sum(y => y.ImpQuantity) * -1
            });
            var listPoCus = (from a in listProductDetail
                             join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.Code equals b.ContractCode
                             select new
                             {
                                 a.Code,
                                 Name = b.Title,
                                 a.Quantity,
                                 b.CusCode,
                                 listProductDetail = listLogProductDetail.Where(p => p.ContractCode.Equals(b.ContractCode))
                             }).ToList();
            return listPoCus;

        }

        [HttpPost]
        public object GetListProjectSearch()
        {
            var listPoCus = (from a in _context.Projects.Where(x => !x.FlagDeleted)
                                 //join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.ProjectCode equals b.PrjCode into b1
                                 //from b2 in b1.DefaultIfEmpty()
                                 //where b2 == null
                             orderby a.Id descending
                             select new
                             {
                                 Code = a.ProjectCode,
                                 Name = a.ProjectTitle,
                                 CusCode = a.CustomerCode,
                                 //listProductDetail = listLogProductDetail.Where(p => p.ContractCode.Equals(b.ContractCode))
                             }).ToList();
            return listPoCus;
        }

        [HttpPost]
        public object GetListProjectCode()
        {
            var listPoCus = (from a in _context.Projects.Where(x => !x.FlagDeleted)
                             join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.ProjectCode equals b.PrjCode into b1
                             from b2 in b1.DefaultIfEmpty()
                             where b2 == null
                             select new
                             {
                                 Code = a.ProjectCode,
                                 Name = a.ProjectTitle,
                                 CusCode = a.CustomerCode,
                                 //listProductDetail = listLogProductDetail.Where(p => p.ContractCode.Equals(b.ContractCode))
                             }).ToList();
            return listPoCus;
        }

        [HttpPost]
        public JsonResult GetImpStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.ImpStatus)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]RequestImpProductHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                //var data1 = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted
                //                                            && (x.ReqCode.Equals(obj.ReqCode)));
                //var data2 = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted
                //                                            && ((!string.IsNullOrEmpty(obj.PoCode) && x.PoCode.Equals(obj.PoCode))));
                //var data3 = _context.RequestImpProductHeaders.Any(x => !x.IsDeleted
                //                                            && ((!string.IsNullOrEmpty(obj.ProjectCode) && x.ProjectCode.Equals(obj.ProjectCode))));

                var data = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted
                                                            && (x.ReqCode.Equals(obj.ReqCode)
                                                                //|| (!string.IsNullOrEmpty(obj.PoCode) && x.PoCode.Equals(obj.PoCode))
                                                                //|| (!string.IsNullOrEmpty(obj.ProjectCode) && x.ProjectCode.Equals(obj.ProjectCode))
                                                                ));
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
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.Status = "";
                    obj.ListStatusObjectLog = listStatusObjLog;
                    if (obj.ListProductDetail.Count > 0)
                    {
                        msg = InsertDetail(obj);
                    }
                    if (!msg.Error)
                    {
                        _context.RequestImpProductHeaders.Add(obj);
                        _context.SaveChanges();
                        InsertPOCusTracking(obj);
                        msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_SUCCESS"]); /*"Thêm mới thành công Y/C đặt hàng";*/
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_ERR"]); /*"Mã Y/C hoặc số đơn hàng đặt hàng đã tồn tại, không thể thêm mới";*/
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_FAILED"]); //"Có lỗi khi thêm đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]RequestImpProductHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
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
                        if (data.ListStatusObjectLog.LastOrDefault()?.Code != obj.StatusObject)
                            data.ListStatusObjectLog.Add(statusObjLog);
                    }
                    else
                    {
                        data.ListStatusObjectLog.Add(statusObjLog);
                    }

                    _context.RequestImpProductHeaders.Update(data);
                    _context.SaveChanges();
                    InsertPOCusTracking(data);

                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_SUCCESS"]);// "Cập nhật thành công Y/C đặt hàng<br/>";
                    var checkInPo = _context.RequestPoSups.Where(x => !x.IsDeleted && x.ReqCode.Equals(data.ReqCode)).ToList();
                    if (checkInPo.Count > 0)
                    {
                        if (!msg.Error)
                        {
                            msg.Error = true;
                            msg.Title += String.Format(_stringLocalizer["SRIP_MSG_UPDATE_ERR"]);// "Yêu cầu đặt hàng này đã tồn tại trong đơn đặt hàng.Vui lòng vào đơn hàng để cập nhật lại";
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ERR_REQ_NOT_EXIST"]); //"Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_FAILED"]);// "Có lỗi khi cập nhật Y/C đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                var status = data.Status;
                if (data != null)
                {
                    //Check Yêu cầu đặt hàng đã được đưa vào Đơn hàng PO_SUP
                    var chkUsing = (from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted)
                                    join b in _context.PoBuyerDetails.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                    where b.ReqCode == data.ReqCode
                                    select (a.Id)).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SRIP_MSG_CAN_NOT_DEL_RQ_IMP"];
                        return Json(msg);
                    }

                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.RequestImpProductHeaders.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_DEL_SUCCESS"]);// "Xóa thành công Y/C đặt hàng";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ERR_REQ_NOT_EXIST"]); //" Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_DEL_FAILED"]);// "Có lỗi khi xóa Y/C đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            var data = _context.RequestImpProductHeaders.FirstOrDefault(x => x.Id == Id);
            if (data != null)
            {
                var session = HttpContext.Session;
                session.SetInt32("IdObject", Id);

                var listProduct = new List<RequestImpProductDetail>();
                if (!string.IsNullOrEmpty(data.ProjectCode))
                {
                    listProduct = GetListProductProject(data.ProjectCode);
                }
                else
                {
                    listProduct = GetListProductWithPoSale(data.PoCode);
                }
                var detail = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted && x.ReqCode.Equals(data.ReqCode))
                              join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                              from b2 in b1.DefaultIfEmpty()
                              join c in listProduct on a.ProductCode equals c.ProductCode into c1
                              from c in c1.DefaultIfEmpty()
                              select new RequestImpProductDetail
                              {
                                  ProductCode = a.ProductCode,
                                  //ProductName = e2 != null ? string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
                                  ProductName = c != null ? c.ProductName : _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(a.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(a.ProductCode)).ProductName : "",
                                  ProductType = a.ProductType,
                                  Quantity = a.Quantity,
                                  PoCount = !string.IsNullOrEmpty(a.PoCount) ? a.PoCount : "0",
                                  RateConversion = a.RateConversion,
                                  RateLoss = a.RateLoss,
                                  Unit = a.Unit,
                                  UnitName = b2.ValueSet,
                                  Note = a.Note,
                                  ExpectedDate = a.ExpectedDate,
                                  sExpectedDate = a.ExpectedDate != null ? a.ExpectedDate.Value.ToString("dd/MM/yyyy") : null,
                                  SupCode = a.SupCode,
                              }).ToList();
                data.ListProductDetail = detail;
                if (!string.IsNullOrEmpty(data.ProjectCode))
                {
                    data.ProjectName = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(data.ProjectCode))?.ProjectTitle /*+ "(" + data.ListProductDetail.Sum(x => double.Parse(x.PoCount)) + ")"*/;
                }
                else
                {
                    data.PoName = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(data.PoCode))?.Title + "(" + data.ListProductDetail.Sum(x => double.Parse(x.PoCount)) + ")";
                }
            }
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetUpdateLog(string ReqCode)
        {
            //var data = _context.PoSupUpdateTrackings.Where(x => x.PoSupCode == PoSupCode && !x.IsDeleted).OrderByDescending(x => x.Id).ToList();
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
            var data = _context.RequestImpProductHeaders.FirstOrDefault(x => x.ReqCode == ReqCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GenReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.RequestImpProductHeaders.Where(x => x.CreatedTime.Year == yearNow && x.CreatedTime.Month == monthNow).ToList();
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

            reqCode = string.Format("{0}{1}{2}{3}", "REQ_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }
        [HttpPost]
        public JsonResult GenTitle(string poCode)
        {
            var title = string.Empty;

            title = string.Format("{0}{1}", "YCNK_", poCode);

            return Json(title);
        }
        #endregion

        #region Detail
        [HttpGet]
        public object GetListProductWithContractBuyer(string contractCode)
        {
            var query = from a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted)
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where a.ContractCode == contractCode
                        select new
                        {
                            Code = a.ProductCode,
                            Name = b.ProductName,
                            b.Unit,
                            UnitName = c != null ? c.ValueSet : ""
                        };
            return query;
        }


        [HttpGet]
        public List<RequestImpProductDetail> GetListProduct(string contractCode)
        {
            var PoSaleHeader = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode.Equals(contractCode));

            var listLogProductDetail = new List<LogProductDetail>();
            var listProductGroup = new List<RequestImpProductDetail>();
            if (PoSaleHeader != null)
            {
                if (!string.IsNullOrEmpty(PoSaleHeader.LogProductDetail))
                    listLogProductDetail.AddRange(JsonConvert.DeserializeObject<List<LogProductDetail>>(PoSaleHeader.LogProductDetail));

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
                                       //ProductName = e2 != null ? string.Format("{0}-{1}_{2}", context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
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


        [HttpGet]
        public object GetListProductWithProject(string projectCode)
        {
            var query = from a in _context.ProjectProducts
                        join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where a.ProjectCode == projectCode
                        select new
                        {
                            Code = a.ProductCode,
                            Name = b.ProductName,
                            b.Unit,
                            UnitName = c != null ? c.ValueSet : ""
                        };
            return query;
        }

        [HttpGet]
        public object JTableDetail(string reqCode)
        {
            //int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted && x.ReqCode.Equals(reqCode))
                         join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ReqCode.Equals(reqCode)
                         select new
                         {
                             a.Id,
                             a.ReqCode,
                             ProductName = b2 != null ? b2.AttributeName : c2.ProductName,
                             a.ProductCode,
                             a.Quantity,
                             a.Unit,
                             UnitName = d2.ValueSet,
                             a.PoCount,
                             a.RateConversion,
                             a.RateLoss,
                             ProductTypeName = b2 != null ? "Nguyên liệu" : "Thành phẩm",
                         }).ToList();

            //var count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "ProductCode", "ProductName", "Quantity", "Unit", "UnitName", "PoCount", "RateConverison", "RateLoss", "ProductTypeName");
            return Json(query);
        }

        [HttpPost]
        public JMessage InsertDetail([FromBody]RequestImpProductHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                if (obj.ListProductDetail.Count > 0)
                {
                    var impProductHeader = _context.RequestImpProductHeaders.FirstOrDefault(x => 
                        x.ReqCode == obj.ListProductDetail.FirstOrDefault().ReqCode);
                    foreach (var item in obj.ListProductDetail)
                    {
                        var expectedDate = !string.IsNullOrEmpty(item.sExpectedDate) ? DateTime.ParseExact(item.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                        var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode == item.ProductCode);
                        if (data == null)
                        {
                            item.Id = 0;
                            item.ReqCode = obj.ReqCode;
                            item.IsDeleted = false;
                            item.ExpectedDate = expectedDate;
                            item.CreatedBy = ESEIM.AppContext.UserName;
                            item.CreatedTime = DateTime.Now;
                            _context.RequestImpProductDetails.Add(item);
                            msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_PRO_SUCCESS"]);// "Thêm mới sản phẩm thành công";

                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_PRO_CODE_EXTSTED"]);// "Mã sản phẩm đã tồn tại, không thể thêm mới";
                        }
                    }
                    _context.SaveChanges();
                    if (impProductHeader != null)
                        InsertPOCusTracking(impProductHeader);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_PRO_FAILED"]); //"Có lỗi khi thêm sản phẩm";
            }
            return msg;
        }

        [HttpPost]
        public JsonResult UpdateDetail([FromBody]RequestImpProductHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var impHeader = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode));
                if (impHeader != null)
                {
                    var impProductHeader = _context.RequestImpProductHeaders.FirstOrDefault(x => 
                        x.ReqCode == obj.ReqCode);
                    if (obj.ListProductDetail.Count > 0)
                    {
                        foreach (var item in obj.ListProductDetail)
                        {
                            var expectedDate = !string.IsNullOrEmpty(item.sExpectedDate) ? DateTime.ParseExact(item.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            if (item.Id >= 0)
                            {
                                var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode.ToLower() == item.ProductCode.ToLower());
                                if (data != null)
                                {
                                    data.PoCount = item.PoCount;
                                    data.RateConversion = item.RateConversion;
                                    data.RateLoss = item.RateLoss;
                                    data.Quantity = item.Quantity;
                                    data.Unit = item.Unit;
                                    data.Note = item.Note;
                                    data.ExpectedDate = expectedDate;
                                    data.SupCode = item.SupCode;
                                    data.Note = item.Note;
                                    data.UpdatedBy = ESEIM.AppContext.UserName;
                                    data.UpdatedTime = DateTime.Now;

                                    _context.RequestImpProductDetails.Update(data);

                                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_PRO_SUCCESS"]);// "Cập nhật sản phẩm cho Y/C đặt hàng thành công <br/>";
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_PRO_CODE_NOT_EXIST"]);// "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                                }
                            }
                            else
                            {
                                var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode.ToLower() == item.ProductCode.ToLower());
                                if (data == null)
                                {
                                    var reqImpProduct = new RequestImpProductDetail
                                    {
                                        ReqCode = obj.ReqCode,
                                        ProductCode = item.ProductCode,
                                        ProductName = item.ProductName,
                                        ProductType = item.ProductType,
                                        IsDeleted = false,
                                        ExpectedDate = expectedDate,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        PoCount = item.PoCount,
                                        RateConversion = item.RateConversion,
                                        RateLoss = item.RateLoss,
                                        Quantity = item.Quantity,
                                        Unit = item.Unit,
                                        Note = item.Note,
                                        SupCode = item.SupCode,

                                    };
                                    _context.RequestImpProductDetails.Add(reqImpProduct);
                                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_PRO_SUCCESS"]);// "Thêm mới sản phẩm thành công";
                                }
                                else
                                {
                                    data.PoCount = item.PoCount;
                                    data.RateConversion = item.RateConversion;
                                    data.RateLoss = item.RateLoss;
                                    data.Quantity = item.Quantity;
                                    data.Unit = item.Unit;
                                    data.Note = item.Note;
                                    data.ExpectedDate = expectedDate;
                                    data.SupCode = item.SupCode;
                                    data.Note = item.Note;
                                    data.UpdatedBy = ESEIM.AppContext.UserName;
                                    data.UpdatedTime = DateTime.Now;

                                    _context.RequestImpProductDetails.Update(data);

                                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_PRO_SUCCESS"]);// "Cập nhật sản phẩm cho Y/C đặt hàng thành công <br/>";
                                }
                            }

                        }
                        _context.SaveChanges();

                        var checkInPo = _context.RequestPoSups.Where(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode)).ToList();
                        if (checkInPo.Count > 0)
                        {
                            if (!msg.Error)
                            {
                                msg.Error = true;
                                msg.Title += String.Format(_stringLocalizer["SRIP_MSG_UPDATE_ERR"]); //"Yêu cầu đặt hàng này đã tồn tại trong đơn đặt hàng.Vui lòng vào đơn hàng để cập nhật lại";
                            }
                        }
                        
                    }
                    if (obj.ListDelProduct != null)
                    {
                        if (obj.ListDelProduct.Count > 0)
                        {
                            foreach (var item in obj.ListDelProduct)
                            {
                                var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode.ToLower() == item.ProductCode.ToLower());
                                if (data != null)
                                {
                                    data.IsDeleted = true;
                                    data.DeletedBy = ESEIM.AppContext.UserName;
                                    data.DeletedTime = DateTime.Now;
                                    _context.RequestImpProductDetails.Update(data);
                                }
                                _context.SaveChanges();
                            }

                            msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_PRO_SUCCESS"]);// "Cập nhật sản phẩm cho Y/C đặt hàng thành công <br/>";
                        }
                        else if (obj.ListProductDetail.Count == 0)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["SRIP_MSG_UPDATE_NO_DETAIL"];
                        }
                    }
                    else if (obj.ListProductDetail.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SRIP_MSG_UPDATE_NO_DETAIL"]; 
                    }
                    
                    if (impProductHeader != null)
                        InsertPOCusTracking(impProductHeader);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_ADD_REQ_FIRST"]);// "Vui lòng thêm phiếu yêu cầu đặt hàng trước khi lưu sản phẩm";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_PRO_FAILED"]);// "Có lỗi khi sửa sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    //Check chi tiết Yêu cầu đặt hàng đã được đưa vào Đơn hàng PO_SUP
                    var chkUsing = (from b in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                    where b.ReqCode == data.ReqCode
                                    select (b.Id)).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["SRIP_MSG_CAN_NOT_DEL_RQ_IMP"];
                        return Json(msg);
                    }

                    var checkImp = _context.ProdReceivedDetails.Any(x => x.LotProductCode.Equals(data.PoSupCode));
                    //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                    if (checkImp)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["SRIP_MSG_DEL_PRO_ERR"]); //"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                        return Json(msg);
                    }

                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;

                    _context.PoBuyerDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_DEL_PRO_SUCCESS"]); //"Xóa sản phẩm thành công";

                    var contract = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == data.PoSupCode);
                    if (contract != null)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                        object[] val = new object[] { data.ProductCode, data.Quantity, 0, data.ProductType, contract.EstimateTime.Value.Date };
                        _repositoryService.CallProc("PR_UPDATE_PO_BUYER_DETAIL", param, val);

                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_PRO_CODE_NOT_EXIST"]); //"Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_DEL_PRO_FAILED"]); //"Có lỗi khi xóa sản phẩm";
            }
            return Json(msg);
        }
        #endregion

        #region PO_CUS_UPDATE_TRACKING
        public object InsertPOCusTracking(RequestImpProductHeader obj1)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var poHeader = obj1;
                var poDetail = _context.RequestImpProductDetails.Where(x => x.ReqCode == obj1.ReqCode).ToList();
                var LogProductDetailOld = poHeader.LogProductDetail;
                var jsonData = new
                {
                    Header = poHeader,
                    Detail = new
                    {
                        //ServiceDetail = contractServiceDetails,
                        ProductDetail = poDetail,
                        //File = contractFiles,
                        //Attribute = contractAttributes,
                        //MemberTag = contractMemberTags,
                        ////Activity = contractActivitys,
                        //Payment = contractPayments,
                        //Note = contractNotes
                    }
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

                //Thêm field LogData trong bảng Header
                var listLogData = new List<object>();
                var contract = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj1.ReqCode));
                if (!string.IsNullOrEmpty(contract.LogData))
                {
                    listLogData = JsonConvert.DeserializeObject<List<object>>(contract.LogData);
                    jsonData.Header.LogData = null;
                    jsonData.Header.LogProductDetail = null;
                    listLogData.Add(jsonData);
                    contract.LogData = JsonConvert.SerializeObject(listLogData);
                    contract.LogProductDetail = LogProductDetailOld;
                    _context.RequestImpProductHeaders.Update(contract);
                }
                else
                {
                    listLogData.Add(jsonData);

                    contract.LogData = JsonConvert.SerializeObject(listLogData);

                    _context.RequestImpProductHeaders.Update(contract);
                }
                _context.SaveChanges();

                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_LOG_SUCCESS"]);// "Thêm log thành công";
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

                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_LOG_SUCCESS"]);// "Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
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

                        msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_LOG_SUCCESS"]);// "Cập nhật thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_UPDATE_LOG_FAILED"]);// "Cập nhật không thành công";
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
                                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_LOG_EXISTED"]); //"Nội dung đã tồn tại vui lòng nhập nội dung khác";
                                return Json(msg);
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["SRIP_MSG_TEXT_ADD_SUCCESS"]);// "Thêm thành công";
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

                        msg.Title = String.Format(_stringLocalizer["SRIP_MSG_TEXT_ADD_SUCCESS"]);// "Thêm thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_TEXT_ADD_FAILED"]);// "Thêm không thành công";
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
                                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_TEXT_CANT_DEL"]); //"Bạn không thể xóa ý kiến của người khác";
                                return msg;
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        msg.Title = String.Format(_stringLocalizer["SRIP_MSG_TEXT_DELL_SUCCESS"]); //"Xóa thành công";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["SRIP_MSG_TEXT_DELL_FAILED"]); //"Xóa không thành công";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
        }
        [HttpGet]
        public List<RequestImpProductDetail> GetListProductWithPoSale(string contractCode)
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

        [HttpGet]
        public List<RequestImpProductDetail> GetListProductProject(string projectCode)
        {
            var project = _context.Projects.FirstOrDefault(x => !x.FlagDeleted && x.ProjectCode.Equals(projectCode));

            var listProductGroup = new List<RequestImpProductDetail>();
            if (project != null)
            {
                var listProduct = (from b in _context.ProjectProducts
                                   join e in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals e.ProductQrCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                   join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals f.ProductCode into f1
                                   from f2 in f1.DefaultIfEmpty()
                                   join g in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals g.CodeSet into g1
                                   from g2 in g1.DefaultIfEmpty()
                                   where b.ProjectCode.Equals(projectCode)
                                   select new RequestImpProductDetail
                                   {
                                       ProductCode = b.ProductCode,
                                       ProductName = e2 != null ? e2.AttributeName : f2 != null ? f2.ProductName : null,
                                       ProductType = b.ProductType,
                                       Quantity = (decimal)b.Quantity,
                                       PoCount = b.Quantity.ToString(),
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
        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        #endregion

        #region PO_SUP_UPDATE_TRACKING

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

                msg.Title = String.Format(_stringLocalizer["SRIP_MSG_ADD_LOG_SUCCESS"]); //"Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        #endregion

        #region Contract Po
        [HttpPost]
        public JsonResult GetContractPoBuyer()
        {
            //var query = _context.PoBuyerHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedTime).ThenByDescending(x => x.Id).Select(x => new { Code = x.PoSupCode, Name = x.PoTitle });
            var query = _context.PoBuyerHeaderPayments.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedTime).ThenByDescending(x => x.Id).Select(x => new { Code = x.PoSupCode, Name = x.PoTitle });
            return Json(query);
        }

        [HttpPost]
        public object GetProjects()
        {
            var data = _context.Projects.Where(x => !x.FlagDeleted).OrderByDescending(x => x.CreatedTime).ThenByDescending(x => x.Id).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetContractSale()
        {
            var query = _context.PoSaleHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedTime).ThenBy(x => x.ContractNo).Select(x => new { Code = x.ContractCode, Name = x.Title });
            return Json(query);
        }

        [HttpGet]
        public object GetObjectRelative()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Relative)).OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }

        [HttpPost]
        public object JtableContractSale([FromBody]JTableModelDetail jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ReqCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoSaleHeaders on a.ObjCode equals b.ContractCode
                         join c in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals c.CusCode
                         where a.ObjRootCode == jTablePara.ReqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale)
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
                where a.ObjCode == jTablePara.ReqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
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
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale) && x.ObjCode == obj.ObjCode) || (x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjRootCode == obj.ObjCode));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoSale);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SRIP_MSG_ADD_CONTRACT"];
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

        #region Contract Po Buyer
        [HttpPost]
        public object JtableContractPoBuyer([FromBody]JTableModelDetail jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ReqCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.PoBuyerHeaderPayments on a.ObjCode equals b.PoSupCode
                         join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode
                         where a.ObjRootCode == jTablePara.ReqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy)
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
                 where a.ObjCode == jTablePara.ReqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
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
        public JsonResult InsertContractPoBuyer([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.PoBuy);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SRIP_MSG_ADD_CONTRACT"];
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
        public JsonResult UpdateContractPoBuyer([FromBody]MappingMain obj)
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
        public JsonResult DeleteContractPoBuyer(int id)
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
        public object JtableProject([FromBody]JTableModelDetail jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ReqCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "Code", "status", "icon", "duration", "Name", "budget", "currency", "signer", "cusCode", "cusName", "contractNo", "budgetExcludeTax", "contractDate", "sEndDate", "ExchangeRate");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MappingMains
                         join b in _context.Projects on a.ObjCode equals b.ProjectCode
                         where a.ObjRootCode == jTablePara.ReqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
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
                join b in _context.Projects on a.ObjCode equals b.ProjectCode
                where a.ObjCode == jTablePara.ReqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
                select new
                {
                    a.Id,
                    ObjCode = a.ObjRootCode,
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
        public JsonResult InsertProject([FromBody]MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SRIP_MSG_PRO_EXIST"];
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
        public JsonResult UpdateProject([FromBody]MappingMain obj)
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
        public JsonResult DeleteProject(int id)
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
            public int? FileID { get; set; }
            public string RequestCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.RequestCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.RequestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestImportProduct))
                          join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
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
                              b.IsFileMaster,
                              b.EditedFileBy,
                              b.EditedFileTime,
                              b.FileID,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.RequestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestImportProduct))
                  join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
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
                      b.IsFileMaster,
                      b.EditedFileBy,
                      b.EditedFileTime,
                      b.FileID,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            return jdata;
        }

        [HttpPost]
        public object JTableFileHistory([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.RequestCode) || jTablePara.FileID == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.RequestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestImportProduct))
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.FileParentId.Equals(jTablePara.FileID) && (x.IsFileMaster == null || x.IsFileMaster == false)) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
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
                             b.IsFileMaster,
                             EditedFileBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)).GivenName : "",
                             b.EditedFileTime,
                         }).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime");
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
                        //var suggesstion = GetSuggestionsRequestFile(obj.RequestCode);
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
                        //    msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_MR_NOT_BLANK"]);
                        //    return Json(msg);
                        //}
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                                && x.ObjectCode.Equals(obj.RequestCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.RqImportProduct)));
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
                            msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
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
                        FileCode = string.Concat(EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestImportProduct), Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.RequestCode,
                        ObjectType = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestImportProduct),
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
                        IsFileMaster = true
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_FILE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_FILE_FORMAT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_FAILED"]);
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
                        msg.Title = String.Format(_contractController["CONTRACR_MSG_UPDATE_CUS_CONTRACT_INFO_SUCCESS"]);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_contractController["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_UPDATE_FILE_NOT_EXIST"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _contractController[""]);// "Có lỗi xảy ra khi cập nhật!";
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
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _contractController[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _contractController[""]);//"Có lỗi xảy ra khi xóa!";
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
                    msg.Title = String.Format(_contractController["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"], _contractController[""]);//"Có lỗi xảy ra khi xóa!";         
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsRequestFile(string requestCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == requestCode && x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.RequestImportProduct)).MaxBy(x => x.Id);
            return query;
        }
        #endregion

        #region Workflow
        [HttpPost]
        public JsonResult GetLogStatus(string code)
        {
            var project = _context.RequestImpProductHeaders.FirstOrDefault(x => x.ReqCode.Equals(code) && !x.IsDeleted);
            return Json(project);
        }

        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.RequestImpProductHeaders.FirstOrDefault(x => x.ReqCode.Equals(code) && !x.IsDeleted);
            try
            {
                var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.ReqCode)
                        && x.ObjectType.Equals("RQ_IMPORT_PROD"));
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
            catch (Exception ex)
            {
                return data;
            }
        }

        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.RequestImpProductHeaders.Where(x => !x.IsDeleted && x.ReqCode.Equals(code)).Select(x => new
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
            var data = _context.RequestImpProductHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.ReqCode)
                        && x.ObjectType.Equals("RQ_IMPORT_PROD"));
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

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.RequestImpProductHeaders.FirstOrDefault(x => x.ReqCode.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.ReqCode) && x.ObjectType.Equals("RQ_IMPORT_PROD"));
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

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}