using DocumentFormat.OpenXml.Spreadsheet;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using static Dropbox.Api.Paper.ListPaperDocsSortBy;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileContractController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IRepositoryService _repositoryService;
        public MobileContractController(
            EIMDBContext context,
            IRepositoryService repositoryService)
        {
            _context = context;
            _repositoryService = repositoryService;
        }
        #region RequestImp Header

        public class RequestImpProductHeaderModel : RequestImpProductHeader
        {
            public string UserName { get; set; }
        }
        [HttpPost]
        public JsonResult GenReqCodeImp()
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

        // contract
        [HttpPost]
        public object GetListPoProduct()
        {

            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var today = DateTime.Now.Date;
                var listContractHeader = _context.PoSaleHeaders.Where(x => !x.IsDeleted)
                    .OrderByDescending(p => p.ContractHeaderID);
                var listLogProductDetail = new List<LogProductDetail>();
                foreach (var item in listContractHeader)
                {
                    if (!string.IsNullOrEmpty(item.LogProductDetail))
                        listLogProductDetail.AddRange(
                            JsonConvert.DeserializeObject<List<LogProductDetail>>(item.LogProductDetail));
                }

                var listProductDetail = listLogProductDetail
                    .Where(x => x.ImpQuantity < 0 && x.EstimateDate.Date >= today).GroupBy(x => x.ContractCode).Select(
                        x => new
                        {
                            Code = x.FirstOrDefault().ContractCode,
                            Quantity = x.Sum(y => y.ImpQuantity) * -1
                        });
                msg.Object = (from a in listProductDetail
                              join b in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on a.Code equals b.ContractCode
                              select new
                              {
                                  a.Code,
                                  Name = b.Title,
                                  a.Quantity,
                                  b.CusCode,
                                  listProductDetail = listLogProductDetail.Where(p => p.ContractCode.Equals(b.ContractCode))
                              }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy thông tin!";

            }

            return msg;
        }
        [HttpPost]
        public object GetListProductContract(int pageNo = 1, int pageSize = 10, string content = "", string productCode = "", string contract = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var productcode = !string.IsNullOrEmpty(productCode) ? productCode : "";
            var groupCode = "";
            var contractCode = !string.IsNullOrEmpty(contract) ? contract : "";
            //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group", "@contractCode" };
            object[] val = new object[] { pageNo, pageSize, search, productcode, groupCode, contractCode };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_CAT_CONTRACT]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(b => new
                {
                    Id = b.Id,
                    Code = b.ProductCode,
                    Name = $"{b.ProductName} - {b.ProductCode}",
                    Unit = b.Unit,
                    ProductCode = b.ProductCode,
                    UnitName = b.UnitName,
                    AttributeCode = "",
                    AttributeName = "",
                    ProductType = b.TypeCode,
                    ImpType = b.ImpType,
                    Serial = b.Serial,
                    Image = b.Image
                }).ToList();
            //return query;
            return data;
        }

        // project
        [HttpPost]
        public object GetProjects()
        {
            var data = _context.Projects.Where(x => !x.FlagDeleted).OrderByDescending(x => x.CreatedTime).ThenByDescending(x => x.Id).Select(x => new { Code = x.ProjectCode, Name = x.ProjectTitle }).ToList();
            return Json(data);
        }
        [HttpPost]
        public object GetListProductProject(int pageNo = 1, int pageSize = 10, string content = "", string productCode = "", string project = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            var productcode = !string.IsNullOrEmpty(productCode) ? productCode : "";
            var groupCode = "";
            var projectCode = !string.IsNullOrEmpty(project) ? project : "";
            //var searchStore = !string.IsNullOrEmpty(storeCode) ? storeCode : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@productCode", "@group", "@projectCode" };
            object[] val = new object[] { pageNo, pageSize, search, productcode, groupCode, projectCode };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("[P_GET_LIST_PRODUCT_CAT_PROJECT]", param, val);
            var data = CommonUtil.ConvertDataTable<MaterialProductInStock>(rs)
                .Select(b => new
                {
                    Id = b.Id,
                    Code = b.ProductCode,
                    Name = $"{b.ProductName} - {b.ProductCode}",
                    Unit = b.Unit,
                    ProductCode = b.ProductCode,
                    UnitName = b.UnitName,
                    AttributeCode = "",
                    AttributeName = "",
                    ProductType = b.TypeCode,
                    ImpType = b.ImpType,
                    Serial = b.Serial,
                    Image = b.Image
                }).ToList();
            //return query;
            return data;
        }

        [HttpPost]
        public JsonResult InsertRequestImp([FromBody] RequestImpProductHeaderModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted
                                                            && (x.ReqCode.Equals(obj.ReqCode)));
                if (data == null)
                {
                    var statusObjLog = new JsonLog
                    {
                        Code = obj.StatusObject,
                        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.CreatedBy)).GivenName,
                        CreatedTime = DateTime.Now,
                    };

                    var listStatusObjLog = new List<JsonLog>();
                    listStatusObjLog.Add(statusObjLog);


                    obj.IsDeleted = false;
                    obj.CreatedBy = obj.CreatedBy;
                    //obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.Status = "";
                    obj.ListStatusObjectLog = listStatusObjLog;
                    obj.TimeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    _context.RequestImpProductHeaders.Add(obj);
                    _context.SaveChanges();
                    InsertPOCusTracking(obj);
                    msg.Object = "Thêm mới thành công Y/C đặt hàng"; /*"Thêm mới thành công Y/C đặt hàng";*/
                }
                else
                {
                    msg.Error = true;
                    msg.Object = "Mã Y/C hoặc số đơn hàng đặt hàng đã tồn tại, không thể thêm mới"; /*"Mã Y/C hoặc số đơn hàng đặt hàng đã tồn tại, không thể thêm mới";*/
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Có lỗi khi thêm đơn đặt hàng"; //"Có lỗi khi thêm đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateRequestImp([FromBody] RequestImpProductHeaderModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.UpdatedBy = obj.UpdatedBy;
                    data.UpdatedTime = DateTime.Now;
                    data.StatusObject = obj.StatusObject;
                    data.UserRequest = obj.UserRequest;
                    data.TimeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var statusObjLog = new JsonLog
                    {
                        Code = obj.StatusObject,
                        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.StatusObject)).ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(obj.UpdatedBy)).GivenName,
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

                    msg.Object = "Cập nhật thành công Y/C đặt hàng";// "Cập nhật thành công Y/C đặt hàng<br/>";
                    var checkInPo = _context.RequestPoSups.Where(x => !x.IsDeleted && x.ReqCode.Equals(data.ReqCode)).ToList();
                    if (checkInPo.Count > 0)
                    {
                        if (!msg.Error)
                        {
                            msg.Error = true;
                            msg.Object = "Yêu cầu đặt hàng này đã tồn tại trong đơn đặt hàng.Vui lòng vào đơn hàng để cập nhật lại";// "Yêu cầu đặt hàng này đã tồn tại trong đơn đặt hàng.Vui lòng vào đơn hàng để cập nhật lại";
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Object = "Y/C đặt hàng không tồn tại, vui lòng làm mới trang"; //"Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Có lỗi khi cập nhật Y/C đặt hàng";// "Có lỗi khi cập nhật Y/C đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteRequestImp(int id, string userName)
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
                        msg.Object = "Lỗi xóa";
                        return Json(msg);
                    }

                    data.DeletedBy = userName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.RequestImpProductHeaders.Update(data);
                    _context.SaveChanges();

                    msg.Object = "Xóa thành công Y/C đặt hàng";// "Xóa thành công Y/C đặt hàng";
                }
                else
                {
                    msg.Error = true;
                    msg.Object = "Y/C đặt hàng không tồn tại, vui lòng làm mới trang"; //" Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Có lỗi khi xóa Y/C đặt hàng";// "Có lỗi khi xóa Y/C đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetImpStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.ImpStatus))
                .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo });
            return Json(data);
        }
        #endregion
        #region RequestImp Detail

        public class RequestImpProductDetailModel
        {
            public string ReqCode { get; set; }
            public string ProductCode { get; set; }
            public decimal? RateConversion { get; set; }

            public decimal? RateLoss { get; set; }

            public decimal Quantity { get; set; }
            public string Unit { get; set; }
            public string SupCode { get; set; }
            public string sExpectedDate { get; set; }
            public string UserName { get; set; }
            public string Note { get; set; }
            public int Id { get; set; }
        }

        [HttpGet]
        public object GetRequestImpDetail(string reqCode)
        {
            //int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted && x.ReqCode.Equals(reqCode))
                             //join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                             //from b2 in b1.DefaultIfEmpty()
                         join b in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals b.SupCode into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ReqCode.Equals(reqCode)
                         select new
                         {
                             a.Id,
                             a.ReqCode,
                             ProductName = c2.ProductName,
                             a.ProductCode,
                             SupCode = a.SupCode,
                             SupName = b != null ? b.SupName : "",
                             a.Quantity,
                             a.Unit,
                             UnitName = d2 != null ? d2.ValueSet : null,
                             a.PoCount,
                             a.RateConversion,
                             a.RateLoss,
                             a.Note,
                             a.ExpectedDate,
                             SExpectedDate = a.ExpectedDate.HasValue ? a.ExpectedDate.Value.ToString("dd/MM/yyyy") : "",
                             //ProductTypeName = b2 != null ? "Nguyên liệu" : "Thành phẩm",
                         }).ToList();

            //var count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "ProductCode", "ProductName", "Quantity", "Unit", "UnitName", "PoCount", "RateConverison", "RateLoss", "ProductTypeName");
            return Json(query);
        }

        [HttpPost]
        public JMessage InsertRequestImpDetail([FromBody] RequestImpProductDetailModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var expectedDate = !string.IsNullOrEmpty(obj.sExpectedDate) ? DateTime.ParseExact(obj.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode == obj.ProductCode);
                if (data == null)
                {
                    var item = new RequestImpProductDetail();
                    item.Id = 0;
                    item.ReqCode = obj.ReqCode;
                    item.RateConversion = obj.RateConversion;
                    item.RateLoss = obj.RateLoss;
                    item.Quantity = obj.Quantity;
                    item.Unit = obj.Unit;
                    item.IsDeleted = false;
                    item.ExpectedDate = expectedDate;
                    item.SupCode = obj.SupCode;
                    item.Note = obj.Note;
                    item.ProductCode = obj.ProductCode;
                    item.CreatedBy = obj.UserName;
                    item.CreatedTime = DateTime.Now;
                    _context.RequestImpProductDetails.Add(item);
                    _context.SaveChanges();
                    msg.Object = "Thêm mới sản phẩm thành công";// "Thêm mới sản phẩm thành công";

                }
                else
                {
                    msg.Error = true;
                    msg.Object = "Mã sản phẩm đã tồn tại, không thể thểm mới";// "Mã sản phẩm đã tồn tại, không thể thêm mới";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Có lỗi khi thêm sản phẩm"; //"Có lỗi khi thêm sản phẩm";
            }
            return msg;
        }

        [HttpPut]
        public JsonResult UpdateRequestImpDetail([FromBody] RequestImpProductDetailModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var item = obj;
                var expectedDate = !string.IsNullOrEmpty(obj.sExpectedDate) ? DateTime.ParseExact(obj.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    //data.PoCount = item.PoCount;
                    data.RateConversion = item.RateConversion;
                    data.RateLoss = item.RateLoss;
                    data.Quantity = item.Quantity;
                    data.Unit = item.Unit;
                    data.Note = item.Note;
                    data.ExpectedDate = expectedDate;
                    data.SupCode = item.SupCode;
                    data.Note = item.Note;
                    data.UpdatedBy = item.UserName;
                    data.UpdatedTime = DateTime.Now;

                    _context.RequestImpProductDetails.Update(data);
                    _context.SaveChanges();

                    msg.Object = "Cập nhật sản phẩm cho Y/C đặt hàng thành công";// "Cập nhật sản phẩm cho Y/C đặt hàng thành công <br/>";
                }
                else
                {
                    msg.Error = true;
                    msg.Object = "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";// "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Có lỗi khi sửa sản phẩm";// "Có lỗi khi sửa sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteRequestImpDetail(int id, string userName)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = userName;
                    data.DeletedTime = DateTime.Now;

                    _context.RequestImpProductDetails.Update(data);
                    _context.SaveChanges();

                    msg.Object = "Xóa sản phẩm thành công";// "Cập nhật sản phẩm cho Y/C đặt hàng thành công <br/>";
                }
                else
                {
                    msg.Error = true;
                    msg.Object = "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";// "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = "Có lỗi khi xóa sản phẩm"; //"Có lỗi khi xóa sản phẩm";
            }
            return Json(msg);
        }

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

                msg.Object = "Thêm log thành công";// "Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        public class UpdateContent
        {
            public PoBuyerHeader Header { get; set; }
            public List<PoBuyerDetail> Detail { get; set; }
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

                msg.Object = "Thêm log thành công";// "Thêm log thành công";
            }
            catch (Exception ex)
            {
                throw;
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetWorkFlow()
        {
            //var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value)
            //    .Select(x => new { Code = x.WfCode, Name = x.WfName });
            //return Json(data);
            JMessage msg = new JMessage { Error = false };
            try
            {
                msg.Object = _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                .Select(x => new { Code = x.WfCode, Name = x.WfName });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }

            return Json(msg);
        }
        public class JTableModelSetting : JTableModel
        {
            public string SettingCode { get; set; }
            public string SettingValue { get; set; }
            public string SettingGroup { get; set; }
            public string SettingMainGroup { get; set; }
        }
        public class DataType
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        [HttpGet]
        public List<DataType> GetDataType()
        {
            var data = new List<DataType>();

            var dataTypeText = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.Text),
                Name = DataTypeEnum.Text.DescriptionAttr(),
            };
            data.Add(dataTypeText);

            var dataTypeNumber = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.Number),
                Name = DataTypeEnum.Number.DescriptionAttr(),
            };
            data.Add(dataTypeNumber);

            var dataTypeMoney = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.Money),
                Name = DataTypeEnum.Money.DescriptionAttr(),
            };
            data.Add(dataTypeMoney);

            var dataTypeDateTime = new DataType
            {
                Code = EnumHelper<DataTypeEnum>.GetDisplayValue(DataTypeEnum.DateTime),
                Name = DataTypeEnum.DateTime.DescriptionAttr(),
            };
            data.Add(dataTypeDateTime);

            return data;
        }
        [HttpPost]
        public object JTableDetail([FromBody] JTableModelSetting jTablePara)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listDataType = GetDataType();
                var query = from a in _context.CommonSettings
                            join b in listDataType on a.Type equals b.Code into b1
                            from b2 in b1.DefaultIfEmpty()
                            where (a.Group == jTablePara.SettingGroup)
                            select new
                            {
                                SettingID = a.SettingID,
                                Code = a.CodeSet,
                                Name = a.ValueSet,
                                Type = a.Type,
                                TypeName = b2.Name,
                                CreatedBy = a.CreatedBy,
                                CreatedTime = a.CreatedTime
                            };
                int count = query.Count();
                var data = query.Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
                msg.Object = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "SettingID", "Code", "Name", "Type", "TypeName", "CreatedBy", "CreatedTime");
            }
            catch
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }
        #endregion
        #region RequestImp Project
        [HttpGet]
        public object GetRequestImpProject(string reqCode)
        {
            var query = (from a in _context.MappingMains
                         join b in _context.Projects on a.ObjCode equals b.ProjectCode
                         where a.ObjRootCode == reqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project)
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
                where a.ObjCode == reqCode && a.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice)
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
            return Json(query);
        }

        [HttpPost]
        public JsonResult InsertRequestImpProject([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => (x.ObjRootCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project) && x.ObjCode == obj.ObjCode) || ((x.ObjCode == obj.ObjRootCode && x.ObjType == EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice) && x.ObjRootCode == obj.ObjCode)));
                if (checkExist == null)
                {
                    obj.ObjType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.Project);
                    obj.ObjRootType = EnumHelper<MappingEnum>.GetDisplayValue(MappingEnum.RqPrice);
                    //obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MappingMains.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thất bại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpPut]
        public JsonResult UpdateRequestImpProject([FromBody] MappingMain obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.MappingMains.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist != null)
                {
                    checkExist.ObjRelative = obj.ObjRelative;
                    checkExist.ObjNote = obj.ObjNote;
                    checkExist.UpdatedBy = obj.UpdatedBy;
                    checkExist.UpdatedTime = DateTime.Now;
                    _context.MappingMains.Update(checkExist);
                    _context.SaveChanges();
                    msg.Title = "Thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thất bại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpDelete]
        public JsonResult DeleteRequestImpProject(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MappingMains.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MappingMains.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }
        #endregion

        #region RequestPrice Header

        [HttpPost]
        public JsonResult GenReqCodePrice()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.RequestPriceHeaders.Where(x => x.CreatedTime.Year == yearNow && x.CreatedTime.Month == monthNow).ToList();
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
        public JsonResult InsertRequestPrice([FromBody] RequestPriceHeaderModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode));
                if (data == null)
                {
                    DateTime? expectedDate = !string.IsNullOrEmpty(obj.sExpectedDate) ? DateTime.ParseExact(obj.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? timeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var model = new RequestPriceHeader
                    {
                        ReqCode = obj.ReqCode,
                        Title = obj.Title,
                        Status = obj.Status,
                        ListProductDetail = obj.ListProductDetail,
                        ExpectedDate = expectedDate,
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        LogStatus = JsonConvert.SerializeObject(new List<EDMSStatus>
                        {
                                new EDMSStatus
                                {
                                    Type=EnumHelper<TypeLogStatus>.GetDisplayValue(TypeLogStatus.StatusReceipt),
                                    Status = obj.Status,
                                    Reason = "",
                                    CreatedBy = obj.CreatedBy,
                                    CreatedTime = DateTime.Now,
                                }
                            }),
                        UserRequest = obj.UserRequest,
                        TimeTicketCreate = timeTicketCreate,
                    };

                    _context.RequestPriceHeaders.Add(model);

                    var file = obj.File;
                    if (file != null)
                    {
                        var check = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                        if (check == null)
                        {
                            var edmsFile = new EDMSFile
                            {
                                FileCode = file.FileCode,
                                FileName = file.FileName,
                                FileSize = file.FileSize,
                                FileTypePhysic = file.FileTypePhysic,
                                Desc = file.Desc,
                                Tags = file.Tags,
                                Url = file.Url,
                                ReposCode = file.ReposCode,
                                NumberDocument = file.NumberDocument,
                                MimeType = file.MimeType,
                                CloudFileId = file.CloudFileId,
                                CreatedTime = DateTime.Now,
                                CreatedBy = obj.CreatedBy,
                            };
                            _context.EDMSFiles.Add(edmsFile);
                            var category = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == "HG");
                            if (category != null)
                            {
                                var getSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == category.CatCode);
                                if (getSetting != null)
                                {
                                    var edmsRepoCatFile = new EDMSRepoCatFile
                                    {
                                        FileCode = file.FileCode,
                                        ReposCode = getSetting.ReposCode,
                                        CatCode = getSetting.CatCode,
                                        ObjectCode = obj.ReqCode,
                                        ObjectType = "REQUEST_PRICE_FILE",
                                        Path = getSetting.Path,
                                        FolderId = getSetting.FolderId
                                    };
                                    _context.EDMSRepoCatFiles.Add(edmsRepoCatFile);
                                }
                            }
                        }
                    }

                    _context.SaveChanges();
                    msg.ID = model.Id;
                    msg.Title = "Thêm mới thành công Y/C hỏi giá";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã Y/C hoặc số đơn hàng hỏi giá đã tồn tại, không thể thêm mới"; /*"Mã Y/C hoặc số đơn hàng đặt hàng đã tồn tại, không thể thêm mới";*/
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm đơn hỏi giá";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateRequestPrice([FromBody] RequestPriceHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var expectedDate = !string.IsNullOrEmpty(obj.sExpectedDate) ? DateTime.ParseExact(obj.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? timeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.ExpectedDate = expectedDate;
                    data.TimeTicketCreate = timeTicketCreate;
                    data.UserRequest = obj.UserRequest;
                    data.UpdatedBy = obj.UpdatedBy;
                    data.UpdatedTime = DateTime.Now;

                    if (data.Status != obj.Status)
                    {
                        data.ListStatus.Add(new EDMSStatus
                        {
                            Type = EnumHelper<TypeLogStatus>.GetDisplayValue(TypeLogStatus.StatusReceipt),
                            Status = obj.Status,
                            Reason = "",
                            CreatedBy = obj.UpdatedBy,
                            CreatedTime = DateTime.Now,
                        });
                        data.LogStatus = JsonConvert.SerializeObject(data.ListStatus);
                    }

                    data.Status = obj.Status;

                    _context.RequestPriceHeaders.Update(data);
                    var file = obj.File;
                    if (file != null)
                    {
                        var check = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                        if (check == null)
                        {
                            var edmsFile = new EDMSFile
                            {
                                FileCode = file.FileCode,
                                FileName = file.FileName,
                                FileSize = file.FileSize,
                                FileTypePhysic = file.FileTypePhysic,
                                Desc = file.Desc,
                                Tags = file.Tags,
                                Url = file.Url,
                                ReposCode = file.ReposCode,
                                NumberDocument = file.NumberDocument,
                                MimeType = file.MimeType,
                                CloudFileId = file.CloudFileId,
                                CreatedTime = DateTime.Now,
                                CreatedBy = obj.UpdatedBy,
                            };
                            _context.EDMSFiles.Add(edmsFile);
                            var category = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == "HG");
                            if (category != null)
                            {
                                var getSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == category.CatCode);
                                if (getSetting != null)
                                {
                                    var edmsRepoCatFile = new EDMSRepoCatFile
                                    {
                                        FileCode = file.FileCode,
                                        ReposCode = getSetting.ReposCode,
                                        CatCode = getSetting.CatCode,
                                        ObjectCode = obj.ReqCode,
                                        ObjectType = "REQUEST_PRICE_FILE",
                                        Path = getSetting.Path,
                                        FolderId = getSetting.FolderId
                                    };
                                    _context.EDMSRepoCatFiles.Add(edmsRepoCatFile);
                                }
                            }
                        }
                    }

                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công Y/C hỏi giá";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Y/C hỏi giá không tồn tại, vui lòng làm mới trang"; //"Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi cập nhật Y/C hỏi giá";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteRequestPrice(int id, string userName)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                var status = data.Status;
                if (data != null)
                {
                    data.DeletedBy = userName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.RequestPriceHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công Y/C hỏi giá";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Y/C hỏi giá không tồn tại, vui lòng làm mới trang"; //" Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa Y/C hỏi giá";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItemRequestPrice(int Id)
        {
            var msg = new JMessage();
            var data = _context.RequestPriceHeaders.FirstOrDefault(x => x.Id == Id);
            if (data != null)
                data.sExpectedDate = data.ExpectedDate.HasValue ? data.ExpectedDate.Value.ToString("dd/MM/yyyy") : null;

            //var session = HttpContext.Session;
            //session.SetInt32("IdObject", Id);

            data.File = (from a in _context.EDMSRepoCatFiles
                         join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                         where a.ObjectCode == data.ReqCode && a.ObjectType == "REQUEST_PRICE_FILE"
                         select new EDMSFile
                         {
                             FileID = b.FileID,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             Url = b.Url
                         }).AsNoTracking().LastOrDefault();

            msg.Object = data;
            return Json(msg);
        }
        #endregion

        #region RequestPrice Detail
        [HttpPost]
        public object GetRequestPriceDetail(string reqCode)
        {
            //int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = (from a in _context.RequestPriceDetails.Where(x => !x.IsDeleted && x.ReqCode.Equals(reqCode))
                         join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals d.SupCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         where a.ReqCode.Equals(reqCode)
                         select new
                         {
                             a.Id,
                             a.ReqCode,
                             ProductName = b2 != null ? b2.AttributeName : c2.ProductName,
                             UnitName = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(c2.Unit)).ValueSet,
                             a.ProductCode,
                             a.Quantity,
                             a.Price,
                             a.Note,
                             d2.SupCode,
                             d2.SupName,
                             ProductTypeName = b2 != null ? "Nguyên liệu" : "Thành phẩm",
                         });

            //var count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "ProductCode", "ProductName", "UnitName", "Quantity", "Price", "Note", "SupCode", "SupName", "ProductTypeName");
            return Json(query);
        }

        [HttpPost]
        public JMessage InsertRequestPriceDetail([FromBody] RequestPriceDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExits = _context.RequestPriceHeaders.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode));
                if (checkExits == null)
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng bấm lưu trước khi thêm sản phẩm";
                    //msg.Title = _stringLocalizer["SRWP_MSG_SAVE_BEFORE_INSERT_PRODUCT"];
                    return msg;
                }

                var data = _context.RequestPriceDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode == obj.ProductCode && x.SupCode == obj.SupCode);
                if (data == null)
                {
                    var model = new RequestPriceDetail
                    {
                        ProductCode = obj.ProductCode,
                        ProductType = obj.ProductType,
                        Quantity = obj.Quantity,
                        Price = obj.Price,
                        ReqCode = obj.ReqCode,
                        Note = obj.Note,
                        SupCode = obj.SupCode,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now
                    };
                    _context.RequestPriceDetails.Add(model);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới sản phẩm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã sản phẩm đã tồn tại, không thể thêm mới";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm sản phẩm";
            }
            return msg;
        }

        [HttpPost]
        public JsonResult UpdateRequestPriceDetail([FromBody] RequestPriceDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode == obj.ProductCode && x.SupCode == obj.SupCode);
                if (data != null)
                {
                    data.Quantity = obj.Quantity;
                    data.Price = obj.Price;
                    data.Note = obj.Note;
                    data.SupCode = obj.SupCode;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    _context.RequestPriceDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật sản phẩm cho Y/C hỏi giá thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi sửa sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteRequestPriceDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.RequestPriceDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.RequestPriceDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa sản phẩm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã sản phẩm không tồn tại tồn tại, không thể xóa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa sản phẩm";
            }
            return Json(msg);
        }
        #endregion
    }
}
