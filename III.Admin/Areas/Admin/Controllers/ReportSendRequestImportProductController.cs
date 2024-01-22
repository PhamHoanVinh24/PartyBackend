using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
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
using static III.Admin.Controllers.ContractController;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class ReportSendRequestImportProductController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ReportSendRequestImportProductController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public ReportSendRequestImportProductController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ReportSendRequestImportProductController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }
        [Breadcrumb("ViewData.CrumbRptRqImpProd", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContractHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbContractHome"] = _sharedResources["COM_CRUMB_CONTRACT_HOME"];
            ViewData["CrumbRptRqImpProd"] = _sharedResources["COM_CRUMB_REPORT_SEND_RQ"];
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

        #region Request Header
        public class JTableModelContract : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ContractCode { get; set; }
            public string PoSupCode { get; set; }
            public string ProductCode { get; set; }
            public string Title { get; set; }
            public string SupCode { get; set; }
            public string ReqCode { get; set; }
            public string Status { get; set; }
            public string BudgetF { get; set; }
            public string BudgetT { get; set; }
            public string Signer { get; set; }
            public string Currency { get; set; }
        }

        public class JTableModelDetail : JTableModel
        {
            public string ReqCode { get; set; }
            public string SupCode { get; set; }
        }
        [NonAction]
        public object JTable([FromBody]JTableModelContract jTablePara, int userType = 0)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                        join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                        join c in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on b.PoCode equals c.ContractCode
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals e.SupCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals g.ProductQrCode into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals h.ProductCode into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals i.CodeSet into i1
                        from i2 in i1.DefaultIfEmpty()
                        where ((fromDate == null) || (a.CreatedTime >= fromDate)) &&
                              ((toDate == null) || (a.CreatedTime <= toDate)) &&
                              (string.IsNullOrEmpty(jTablePara.ReqCode) || a.ReqCode.ToLower().Contains(jTablePara.ReqCode.ToLower())) &&
                              (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode)) &&
                              (string.IsNullOrEmpty(jTablePara.Title) || b.Title.ToLower().Contains(jTablePara.Title.ToLower())) &&
                              (string.IsNullOrEmpty(jTablePara.ContractCode) || (c.ContractCode.ToLower().Equals(jTablePara.ContractCode.ToLower()))) &&
                              (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))

                             //Điều kiện phân quyền dữ liệu
                             && (userType == 10
                                    || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                    || (userType == 0 && session.UserName == a.CreatedBy)
                                )
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            b.Title,
                            a.ProductCode,
                            ProductName = g2 != null ? g2.AttributeName : h2.ProductName,
                            a.ProductType,
                            b.CusCode,
                            d2.CusName,
                            a.ExpectedDate,
                            a.SupCode,
                            e2.SupName,
                            CreatedBy = f2.GivenName,
                            a.CreatedTime,
                            a.PoCount,
                            a.Quantity,
                            a.RateConversion,
                            a.RateLoss,
                            Unit = i2.ValueSet,
                            a.Note
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReqCode", "Title", "ProductCode", "ProductName", "ProductType", "CusCode", "CusName", "ExpectedDate", "SupCode", "SupName", "CreatedBy", "CreatedTime", "PoCount", "Quantity", "RateConversion", "RateLoss", "Unit", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public object GridDataOfUser([FromBody]JTableModelContract jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [HttpPost]
        public object GridDataOfBranch([FromBody]JTableModelContract jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [HttpPost]
        public object GridDataOfAdmin([FromBody]JTableModelContract jTablePara)
        {
            return JTable(jTablePara, 10);
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
                var data = _context.RequestImpProductHeaders.FirstOrDefault(x => !x.IsDeleted && (x.PoCode.Equals(obj.PoCode) || x.ReqCode.Equals(obj.ReqCode)));
                if (data == null)
                {
                    obj.IsDeleted = false;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.TimeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    _context.RequestImpProductHeaders.Add(obj);
                    _context.SaveChanges();

                    if (obj.ListProductDetail.Count > 0)
                    {
                        msg = InsertDetail(obj);
                    }

                    //msg.Title = "Thêm mới thành công Y/C đặt hàng";
                    msg.Title = _stringLocalizer["RSRIP_MSG_ADD_NEW_RQ_IMP"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Mã Y/C hoặc số đơn hàng đặt hàng đã tồn tại, không thể thêm mới";
                    msg.Title = _stringLocalizer["RSRIP_MSG_EXISTED_RQ_CODE_ORDER_NUMB"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm đơn đặt hàng";
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                    data.Status = obj.Status;
                    data.UserRequest = obj.UserRequest;
                    data.TimeTicketCreate = !string.IsNullOrEmpty(obj.STimeTicketCreate) ? DateTime.ParseExact(obj.STimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.RequestImpProductHeaders.Update(data);
                    _context.SaveChanges();

                    //msg.Title = "Cập nhật thành công Y/C đặt hàng<br/>";
                    msg.Title = _stringLocalizer["RSRIP_MSG_UPDATE_SUCCESS_RQ_IMP"];
                    var checkInPo = _context.RequestPoSups.Where(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode)).ToList();
                    if (checkInPo.Count > 0)
                    {
                        if (!msg.Error)
                        {
                            msg.Error = true;
                            //msg.Title += "Yêu cầu đặt hàng này đã tồn tại trong đơn đặt hàng. Vui lòng vào đơn hàng để cập nhật lại";
                            msg.Title += _stringLocalizer["RSRIP_MSG_EXISTED_IMP_RQ"];
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                    msg.Title = _stringLocalizer["RSRIP_MSG_NOT_EXISTED_IMP_RQ"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật Y/C đặt hàng";
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.RequestImpProductHeaders.Update(data);
                    _context.SaveChanges();

                    //msg.Title = "Xóa thành công Y/C đặt hàng";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["RSRIP_MSG_IMP_RQ"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = " Y/C đặt hàng không tồn tại, vui lòng làm mới trang";
                    msg.Title = _stringLocalizer["RSRIP_MSG_NOT_EXISTED_IMP_RQ"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa Y/C đặt hàng";
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                var listProduct = GetListProduct(data.PoCode);
                var detail = (from a in _context.RequestImpProductDetails.Where(x => x.ReqCode.Equals(data.ReqCode))
                              join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                              from b2 in b1.DefaultIfEmpty()
                              join c in listProduct on a.ProductCode equals c.ProductCode
                              select new RequestImpProductDetail
                              {
                                  ProductCode = a.ProductCode,
                                  //ProductName = e2 != null ? string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
                                  ProductName = c.ProductName,
                                  ProductType = a.ProductType,
                                  Quantity = a.Quantity,
                                  PoCount = a.PoCount,
                                  RateConversion = a.RateConversion,
                                  RateLoss = a.RateLoss,
                                  Unit = a.Unit,
                                  UnitName = b2.ValueSet,
                                  Note = a.Note,
                                  ExpectedDate = a.ExpectedDate,
                                  sExpectedDate = a.ExpectedDate != null ? a.ExpectedDate.Value.ToString("dd/MM/yyy") : null,
                                  SupCode = a.SupCode
                              }).ToList();
                data.ListProductDetail = detail;
                data.PoName = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode.Equals(data.PoCode))?.Title + "(" + data.ListProductDetail.Sum(x => int.Parse(x.PoCount)) + ")";
            }
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetUpdateLog(string PoSupCode)
        {
            var data = _context.PoSupUpdateTrackings.Where(x => x.PoSupCode == PoSupCode && !x.IsDeleted).OrderByDescending(x => x.Id).ToList();
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
                    catch (Exception ex)
                    {
                    }
                }
            }
            JMessage msg = new JMessage();
            msg.Object = data;
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

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string fromDate, string toDate, string reqCode, string supCode, string title, string productCode, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            var intBeginFor = 1;

            var session = HttpContext.GetSessionUser();
            intBeginFor = (pageInt - 1) * length;

            DateTime? sfromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? stoDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                        join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                        join c in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on b.PoCode equals c.ContractCode
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals e.SupCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in _context.SubProducts on a.ProductCode equals g.ProductQrCode into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in _context.MaterialProducts on a.ProductCode equals h.ProductCode into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in _context.CommonSettings on a.Unit equals i.CodeSet into i1
                        from i2 in i1.DefaultIfEmpty()
                        where (((sfromDate == null) || (a.CreatedTime >= sfromDate)) &&
                              ((stoDate == null) || (a.CreatedTime <= stoDate)) &&
                              (string.IsNullOrEmpty(reqCode) || a.ReqCode.ToLower().Contains(reqCode.ToLower())) &&
                              (string.IsNullOrEmpty(supCode) || a.SupCode.Equals(supCode)) &&
                              (string.IsNullOrEmpty(title) || b.Title.ToLower().Contains(title.ToLower())) &&
                              (string.IsNullOrEmpty(productCode) || a.ProductCode.Equals(productCode)))
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            b.Title,
                            a.ProductCode,
                            ProductName = g2 != null ? g2.AttributeName : h2.ProductName,
                            a.ProductType,
                            b.CusCode,
                            d2.CusName,
                            a.ExpectedDate,
                            a.SupCode,
                            e2.SupName,
                            CreatedBy = f2.GivenName,
                            a.CreatedTime,
                            a.PoCount,
                            a.Quantity,
                            a.RateConversion,
                            a.RateLoss,
                            Unit = i2.ValueSet,
                            a.Note
                        };

            var data = query.OrderUsingSortExpression(orderBy).AsNoTracking().ToList();

            var listExport = new List<RequestImpProductDetailExport>();
            var no = 1;
            foreach (var item in data)
            {
                var itemExport = new RequestImpProductDetailExport();
                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.SupName = item.SupName;
                itemExport.Title = item.Title;
                itemExport.PoCount = item.PoCount;
                itemExport.RateConversion = item.RateConversion;
                itemExport.RateLoss = item.RateLoss;
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.ExpectedDate = item.ExpectedDate != null ? item.ExpectedDate.Value.ToString("dd/MM/yyyy") : null;
                itemExport.CreatedTime = item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm");
                itemExport.Note = item.Note;

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Tonghop_YCNK");
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
            sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;
            sheetRequest.Range["L1"].ColumnWidth = 24;
            sheetRequest.Range["M1"].ColumnWidth = 24;


            sheetRequest.Range["A1:M1"].Merge(true);

            sheetRequest.Range["A1"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUM_REQUEST_IMPORT"].Value.ToUpper();
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_TT"].Value.ToUpper();
            sheetRequest["B2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_CODE"].Value.ToUpper();
            sheetRequest["C2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_NAME"].Value.ToUpper();
            sheetRequest["D2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUPPPLIER"].Value.ToUpper();
            sheetRequest["E2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_REQUEST_TITLE"].Value.ToUpper();
            sheetRequest["F2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_ORDER_NUMBER"].Value.ToUpper();
            sheetRequest["G2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_CONVERSION_RATE"].Value.ToUpper();
            sheetRequest["H2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_LOSS_RATIO"].Value.ToUpper();
            sheetRequest["I2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_ORDER_QUANTIY"].Value.ToUpper();
            sheetRequest["J2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_UNIT"].Value.ToUpper();
            sheetRequest["K2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_EXPECTED_DATE"].Value.ToUpper();
            sheetRequest["L2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_CREATED_DATE"].Value.ToUpper();
            sheetRequest["M2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_NOTE"].Value.ToUpper();

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:M2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:M2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonghop_YCNK" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpGet]
        public ActionResult ExportExcelToManufacurer(string page, string row, string fromDate, string toDate, string reqCode, string supCode, string title, string productCode, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            var intBeginFor = 1;

            var session = HttpContext.GetSessionUser();
            intBeginFor = (pageInt - 1) * length;

            DateTime? sfromDate = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? stoDate = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                        join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                        join c in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on b.PoCode equals c.ContractCode
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals e.SupCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in _context.SubProducts on a.ProductCode equals g.ProductQrCode into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in _context.MaterialProducts on a.ProductCode equals h.ProductCode into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in _context.CommonSettings on a.Unit equals i.CodeSet into i1
                        from i2 in i1.DefaultIfEmpty()
                        where (((sfromDate == null) || (a.CreatedTime >= sfromDate)) &&
                              ((stoDate == null) || (a.CreatedTime <= stoDate)) &&
                              (string.IsNullOrEmpty(reqCode) || a.ReqCode.ToLower().Contains(reqCode.ToLower())) &&
                              (string.IsNullOrEmpty(supCode) || a.SupCode.Equals(supCode)) &&
                              (string.IsNullOrEmpty(title) || b.Title.ToLower().Contains(title.ToLower())) &&
                              (string.IsNullOrEmpty(productCode) || a.ProductCode.Equals(productCode)))
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            b.Title,
                            a.ProductCode,
                            ProductName = g2 != null ? g2.AttributeName : h2.ProductName,
                            a.ProductType,
                            b.CusCode,
                            d2.CusName,
                            a.SupCode,
                            e2.SupName,
                            a.Quantity,
                            Unit = i2.ValueSet,
                            a.Note
                        };

            var data = query.OrderUsingSortExpression(orderBy).AsNoTracking().ToList();

            var listExport = new List<RequestImpProductDetailExportManufacurer>();
            var no = 1;
            foreach (var item in data)
            {
                var itemExport = new RequestImpProductDetailExportManufacurer();
                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.SupName = item.SupName;
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.Note = item.Note;

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Tonghop_YCNK");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;


            sheetRequest.Range["A1:G1"].Merge(true);

            sheetRequest.Range["A1"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUM_REQUEST_IMPORT"].Value.ToUpper();
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_TT"].Value.ToUpper();
            sheetRequest["B2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_CODE"].Value.ToUpper();
            sheetRequest["C2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_NAME"].Value.ToUpper();
            sheetRequest["D2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUPPPLIER"].Value.ToUpper();
            sheetRequest["E2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_ORDER_QUANTIY"].Value.ToUpper();
            sheetRequest["F2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_UNIT"].Value.ToUpper();
            sheetRequest["G2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_NOTE"].Value.ToUpper();

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:G2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:G2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonghop_YCNK" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }


        public class ModelExportExcel
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
            public string CreatedBy { get; set; }
            public string PoCount { get; set; }
            public string Unit { get; set; }
            public string Note { get; set; }
            public decimal Quantity { get; set; }
            public decimal? RateConversion { get; set; }
            public decimal? RateLoss { get; set; }
            public DateTime? ExpectedDate { get; set; }
            public DateTime? CreatedTime { get; set; }
        }

        [HttpGet]
        public ActionResult ExportExcelSelectRow(string listId)
        {
            var ids = listId.Split(",");
            var query = from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                        join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                        join c in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on b.PoCode equals c.ContractCode
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals e.SupCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in _context.SubProducts on a.ProductCode equals g.ProductQrCode into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in _context.MaterialProducts on a.ProductCode equals h.ProductCode into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in _context.CommonSettings on a.Unit equals i.CodeSet into i1
                        from i2 in i1.DefaultIfEmpty()
                        where ids.Any(x => x == a.Id.ToString())
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            b.Title,
                            a.ProductCode,
                            ProductName = g2 != null ? g2.AttributeName : h2.ProductName,
                            a.ProductType,
                            b.CusCode,
                            d2.CusName,
                            a.ExpectedDate,
                            a.SupCode,
                            e2.SupName,
                            CreatedBy = f2.GivenName,
                            a.CreatedTime,
                            a.PoCount,
                            a.Quantity,
                            a.RateConversion,
                            a.RateLoss,
                            Unit = i2.ValueSet,
                            a.Note
                        };
            var listExport = new List<RequestImpProductDetailExport>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new RequestImpProductDetailExport();
                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.SupName = item.SupName;
                itemExport.Title = item.Title;
                itemExport.PoCount = item.PoCount;
                itemExport.RateConversion = item.RateConversion;
                itemExport.RateLoss = item.RateLoss;
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.ExpectedDate = item.ExpectedDate != null ? item.ExpectedDate.Value.ToString("dd/MM/yyyy") : null;
                itemExport.CreatedTime = item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm");
                itemExport.Note = item.Note;

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Tonghop_YCNK");
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
            sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;
            sheetRequest.Range["L1"].ColumnWidth = 24;
            sheetRequest.Range["M1"].ColumnWidth = 24;


            sheetRequest.Range["A1:M1"].Merge(true);

            sheetRequest.Range["A1"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUM_REQUEST_IMPORT"].Value.ToUpper();
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 0, 0);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_TT"].Value.ToUpper();
            sheetRequest["B2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_CODE"].Value.ToUpper();
            sheetRequest["C2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_NAME"].Value.ToUpper();
            sheetRequest["D2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUPPPLIER"].Value.ToUpper();
            sheetRequest["E2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_REQUEST_TITLE"].Value.ToUpper();
            sheetRequest["F2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_ORDER_NUMBER"].Value.ToUpper();
            sheetRequest["G2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_CONVERSION_RATE"].Value.ToUpper();
            sheetRequest["H2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_LOSS_RATIO"].Value.ToUpper();
            sheetRequest["I2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_ORDER_QUANTIY"].Value.ToUpper();
            sheetRequest["J2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_UNIT"].Value.ToUpper();
            sheetRequest["K2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_EXPECTED_DATE"].Value.ToUpper();
            sheetRequest["L2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_CREATED_DATE"].Value.ToUpper();
            sheetRequest["M2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_NOTE"].Value.ToUpper();

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:M2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:M2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonghop_YCNK" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpGet]
        public ActionResult ExportExcelSelectRowToManufacurer(string listId)
        {
            var ids = listId.Split(",");
            var query = from a in _context.RequestImpProductDetails.Where(x => !x.IsDeleted)
                        join b in _context.RequestImpProductHeaders.Where(x => !x.IsDeleted) on a.ReqCode equals b.ReqCode
                        join c in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on b.PoCode equals c.ContractCode
                        join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals e.SupCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.Users.Where(x => x.Active) on a.CreatedBy equals f.UserName into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in _context.SubProducts on a.ProductCode equals g.ProductQrCode into g1
                        from g2 in g1.DefaultIfEmpty()
                        join h in _context.MaterialProducts on a.ProductCode equals h.ProductCode into h1
                        from h2 in h1.DefaultIfEmpty()
                        join i in _context.CommonSettings on a.Unit equals i.CodeSet into i1
                        from i2 in i1.DefaultIfEmpty()
                        where ids.Any(x => x == a.Id.ToString())
                        select new
                        {
                            a.Id,
                            a.ReqCode,
                            b.Title,
                            a.ProductCode,
                            ProductName = g2 != null ? g2.AttributeName : h2.ProductName,
                            a.ProductType,
                            b.CusCode,
                            d2.CusName,
                            a.ExpectedDate,
                            a.SupCode,
                            e2.SupName,
                            CreatedBy = f2.GivenName,
                            a.CreatedTime,
                            a.PoCount,
                            a.Quantity,
                            a.RateConversion,
                            a.RateLoss,
                            Unit = i2.ValueSet,
                            a.Note
                        };
            var listExport = new List<RequestImpProductDetailExportManufacurer>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new RequestImpProductDetailExportManufacurer();
                itemExport.No = no;
                itemExport.ProductCode = item.ProductCode;
                itemExport.ProductName = item.ProductName;
                itemExport.SupName = item.SupName;
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.Note = item.Note;
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Tonghop_YCNK");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;


            sheetRequest.Range["A1:G1"].Merge(true);

            sheetRequest.Range["A1"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUM_REQUEST_IMPORT"].Value.ToUpper();
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 0, 0);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_TT"].Value.ToUpper();
            sheetRequest["B2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_CODE"].Value.ToUpper();
            sheetRequest["C2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_PRODUCT_NAME"].Value.ToUpper();
            sheetRequest["D2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_SUPPPLIER"].Value.ToUpper();
            sheetRequest["E2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_ORDER_QUANTIY"].Value.ToUpper();
            sheetRequest["F2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_UNIT"].Value.ToUpper();
            sheetRequest["G2"].Text = _stringLocalizer["RSRIP_EXCEL_COL_NOTE"].Value.ToUpper();

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:G2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:G2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonghop_YCNK" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }
        #endregion

        #region Detail
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
                    foreach (var item in obj.ListProductDetail)
                    {
                        var expectedDate = !string.IsNullOrEmpty(item.sExpectedDate) ? DateTime.ParseExact(item.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                        var data = _context.RequestImpProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(obj.ReqCode) && x.ProductCode.ToLower() == item.ProductCode.ToLower());
                        if (data == null)
                        {
                            item.ReqCode = obj.ReqCode;
                            item.IsDeleted = false;
                            item.ExpectedDate = expectedDate;
                            item.CreatedBy = ESEIM.AppContext.UserName;
                            item.CreatedTime = DateTime.Now;
                            _context.RequestImpProductDetails.Add(item);
                            _context.SaveChanges();
                            //msg.Title = "Thêm mới sản phẩm thành công";
                            msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["RSRIP_MSG_NEW_PRODUCT"]);
                        }
                        else
                        {
                            msg.Error = true;
                            //msg.Title = "Mã sản phẩm đã tồn tại, không thể thêm mới";
                            msg.Title = _stringLocalizer["RSRIP_MSG_EXISTED_PRODUCT_CODE"];
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm sản phẩm";
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                    if (obj.ListProductDetail.Count > 0)
                    {
                        foreach (var item in obj.ListProductDetail)
                        {
                            var expectedDate = !string.IsNullOrEmpty(item.sExpectedDate) ? DateTime.ParseExact(item.sExpectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

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
                                _context.SaveChanges();
                                //msg.Title = "Sửa sản phẩm thành công";
                                msg.Title = _stringLocalizer["RSRIP_MSG_SUCCESS_PRODUCT_EDIT"];
                            }
                            else
                            {
                                msg.Error = true;
                                //msg.Title = "Mã sản phẩm không tồn tại, không thể chỉnh sửa";
                                msg.Title = _stringLocalizer["RSRIP_MSG_NOT_EXISTED_PRD_CODE"];
                            }
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Vui lòng thêm phiếu yêu cầu đặt hàng trước khi lưu sản phẩm";
                    msg.Title = _stringLocalizer["RSRIP_MSG_ADD_BEFORE_SAVE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi sửa sản phẩm";
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
                var data = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(data.PoSupCode));
                    //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                    if (checkImp != null)
                    {
                        msg.Error = true;
                        //msg.Title = "Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                        msg.Title = _stringLocalizer["RSRIP_MSG_NO_CRUD_ORDER"];
                    }
                    else
                    {
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        data.IsDeleted = true;

                        _context.PoBuyerDetails.Update(data);
                        _context.SaveChanges();
                        //msg.Title = "Xóa sản phẩm thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["RSRIP_MSG_PRODUCT"]);
                        var contract = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == data.PoSupCode);
                        if (contract != null)
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                            object[] val = new object[] { data.ProductCode, data.Quantity, 0, data.ProductType, contract.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_UPDATE_BUYER_DETAIL", param, val);

                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Mã sản phẩm không tồn tại, không thể chỉnh sửa";
                    msg.Title = _stringLocalizer["RSRIP_MSG_NOT_EXISTED_PRD_CODE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa sản phẩm";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public object UpdateExpectedDate(int id, string expectedDate)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (id != 0 && !string.IsNullOrEmpty(expectedDate))
                {
                    var check = _context.RequestImpProductDetails.FirstOrDefault(x => x.Id.Equals(id));
                    if (check != null)
                    {
                        var sExpectedDate = !string.IsNullOrEmpty(expectedDate) ? DateTime.ParseExact(expectedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                        check.ExpectedDate = sExpectedDate;
                        _context.RequestImpProductDetails.Update(check);
                        _context.SaveChanges();

                        var PoBuyerDetail = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.ReqCode.Equals(check.ReqCode) && x.ProductCode.Equals(check.ProductCode));
                        if (PoBuyerDetail != null)
                        {
                            PoBuyerDetail.ExpectedDate = sExpectedDate;
                            _context.PoBuyerDetails.Update(PoBuyerDetail);
                            _context.SaveChanges();
                        }

                        //msg.Title = "Cập nhật ngày dự kiến hàng về thành công<br/>";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["RSRIP_MSG_INCOME_PRD_DATE"]);
                        //var checkInPo = _context.RequestPoSups.Where(x => !x.IsDeleted && x.ReqCode.Equals(check.ReqCode)).ToList();
                        //if (checkInPo.Count > 0)
                        //{
                        //    if (!msg.Error)
                        //    {
                        //        msg.Error = true;
                        //        msg.Title += "Yêu cầu đặt hàng này đã tồn tại trong đơn đặt hàng.Vui lòng vào đơn hàng để cập nhật lại";
                        //    }
                        //}
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Cập nhật ngày dự kiến hàng về thất bại";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["RSRIP_MSG_INCOME_PRD_DATE"]);
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Cập nhật ngày dự kiến hàng về thất bại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["RSRIP_MSG_INCOME_PRD_DATE"]);
                }
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }
        #endregion

        #region PO_CUS_UPDATE_TRACKING
        public object InsertPOCusTracking(PoBuyerHeader obj1)
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

                //msg.Title = "Thêm log thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
            }
            catch (Exception ex)
            {
                throw;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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

                //msg.Title = "Thêm log thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
            }
            catch (Exception ex)
            {
                throw;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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

                        //msg.Title = "Cập nhật thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Cập nhật không thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["RSRIP_MSG_NO"]);
                }
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                                //msg.Title = "Nội dung đã tồn tại vui lòng nhập nội dung khác";
                                msg.Title = _stringLocalizer["RSRIP_MSG_EXISTED_CONTENT"];
                                return Json(msg);
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        //msg.Title = "Thêm thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
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

                        //msg.Title = "Thêm thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Thêm không thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["RSRIP_MSG_NO"]);
                }
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
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
                                //msg.Title = "Bạn không thể xóa ý kiến của người khác";
                                msg.Title = _stringLocalizer["RSRIP_MSG_CANNOT_REMOVE_OPINION"];
                                return msg;
                            }
                            json = JsonConvert.SerializeObject(listConfirm);
                        }

                        obj.Confirm = json;
                        _context.PoBuyerHeaders.Update(obj);
                        _context.SaveChanges();

                        //msg.Title = "Xóa thành công";
                        msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Xóa không thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["RSRIP_MSG_NO"]);
                }
            }
            catch (Exception ex)
            {
                throw ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        //[HttpGet]
        //public object GetListProduct(string contractCode)
        //{
        //    var today = DateTime.Now.Date;
        //    var rs = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted)
        //              join b in _context.PoSaleProductDetails.Where(x => !x.IsDeleted) on a.ContractCode equals b.ContractCode
        //              join d in _context.ForecastProductInStocks on new { b.ProductCode, b.ProductType } equals new { d.ProductCode, d.ProductType }
        //              join e in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals e.ProductQrCode into e1
        //              from e2 in e1.DefaultIfEmpty()
        //              join f in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals f.ProductCode into f1
        //              from f2 in f1.DefaultIfEmpty()
        //              join g in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals g.CodeSet into g1
        //              from g2 in g1.DefaultIfEmpty()
        //              where d.CntForecast != null && d.CntForecast < 0 && a.ContractCode.Equals(contractCode) && d.ForecastDate <= today
        //              orderby d.ForecastDate
        //              select new
        //              {
        //                  Code = d.ProductCode,
        //                  Name = e2 != null ? string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, e2.AttributeCode) : f2 != null ? string.Format("Thành phẩm_{0}-{1}", f2.ProductName, f2.ProductCode) : null,
        //                  d.ProductType,
        //                  Quantity = d.CntForecast * -1,
        //                  d.ForecastDate,
        //                  a.CusCode,
        //                  b.Unit,
        //                  UnitName= g2.ValueSet
        //              }).ToList();

        //    var data = rs.GroupBy(x => x.Code).Select(x => new
        //    {
        //        x.LastOrDefault().Code,
        //        x.LastOrDefault().Name,
        //        x.LastOrDefault().ForecastDate,
        //        x.LastOrDefault().Quantity,
        //        x.LastOrDefault().CusCode,
        //        x.LastOrDefault().Unit,
        //        x.LastOrDefault().UnitName
        //    }).ToList();

        //    return data;
        //}

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

                //msg.Title = "Thêm log thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
            }
            catch (Exception ex)
            {
                throw;
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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}