using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using System.Drawing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Internal;
using Color = Syncfusion.Drawing.Color;
using Syncfusion.EJ2.Linq;
using SmartBreadcrumbs.Attributes;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ContractReportController : BaseController
    {
        private readonly EIMDBContext _context;
        private TimeSpan _timeWorking;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ContractReportController> _stringLocalizer;
        private readonly IGoogleApiService _googleAPI;
        private readonly IParameterService _parameterService;

        public ContractReportController(EIMDBContext context,
            IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment, IGoogleApiService googleAPI, 
            IParameterService parameterService,
            IUploadService upload, IStringLocalizer<ContractReportController> stringLocalizer)
        {
            _context = context;
            _timeWorking = new TimeSpan(8, 30, 0);
            _sharedResources = sharedResources;
            _googleAPI = googleAPI;
            _parameterService = parameterService;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["Title"] = _stringLocalizer["CRPT_CRUMB_STATISCAL_END_CONTRACT"];
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]ContractModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.Fromto) ? DateTime.ParseExact(jTablePara.Fromto, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.Dateto) ? DateTime.ParseExact(jTablePara.Dateto, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.StopContractHeaders.Where(x => !x.IsDeleted)
                        join b in _context.StopContractDetails on a.DecisionNum equals b.DecisionNum
                        join c in _context.HREmployees on b.EmployeeCode equals c.Id.ToString()
                        where b.IsDeleted == false && a.Status.Equals("FINAL_DONE") 
                         && (string.IsNullOrEmpty(jTablePara.DepartmentCode) || c.unit.Equals(jTablePara.DepartmentCode))
                         && (string.IsNullOrEmpty(jTablePara.DecisionBy) || b.DeletedBy.ToLower().Contains(jTablePara.DecisionBy.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.DecisionNum) || a.DecisionNum.Equals(jTablePara.DecisionNum))
                         && (fromDate == null || (a.DecisionDate.Value >= fromDate.Value))
                         && (toDate == null || (a.DecisionDate.Value <= toDate.Value))

                        select new
                        {
                            b.Id,
                            b.EmployeeCode,
                            c.fullname,                           
                            a.DecisionNum,
                            DecisionDate = b.SessionDate,
                            Depart = _context.AdDepartments.FirstOrDefault(x=>x.DepartmentCode.Equals(c.unit)) != null ? _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode.Equals(c.unit)).Title : "",
                            c.gender,
                            c.birthday,
                            b.Reason
                            
                        };
            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "fullname","EmployeeCode", "DecisionNum", "DecisionDate", "gender", "birthday", "Reason", "Depart");
            return Json(jdata);
        }

        [HttpPost]
        public byte[] GeneratorPicture(string path)
        {
            path = _hostingEnvironment.WebRootPath + path;
            using (Image image = Image.FromFile(path))
            {
                using (MemoryStream m = new MemoryStream())
                {
                    image.Save(m, image.RawFormat);
                    byte[] imageBytes = m.ToArray();
                    return imageBytes;
                }
            }
        }
        public JsonResult InsertImage(EmployeeCert obj, IFormFile images)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.EmployeeCerts.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (images != null)
                    {
                        var upload = _upload.UploadImage(images);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            data.ImgPath = "/uploads/Images/" + upload.Object.ToString();
                          
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Có lỗi khi thêm ảnh";
                        msg.Title = _stringLocalizer["EDMSR_MSG_UPLOAD_FILE_NULL"];
                        return Json(msg);
                    }

                    _context.EmployeeCerts.Update(data);
                    _context.SaveChanges();
                    //msg.Title = "Tải ảnh thành công";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_SUCCESS_DOWLOAD"];
                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm ảnh";
                msg.Title = _stringLocalizer["CMS_ITEM_MSG_ERR_ADD_IMG"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetEmployee(int page, int pageSize, string productname)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var begin = (page - 1) * pageSize;
                var rs = _context.HREmployees.Where(x => (string.IsNullOrEmpty(productname) || x.employee_code.Equals(productname) || x.employee_code.ToUpper().Contains(productname.ToUpper())) && x.status != "END_CONTRACT").OrderBy(x => x.fullname).Select(x => new
                {
                    Code = x.employee_code,
                    Name1 = x.fullname,
                    Name = string.Format("{0} - {1}", x.employee_code, x.fullname)
                });
                var lstSup = rs.Skip(begin).Take(pageSize).AsNoTracking().ToList();
                msg.Object = lstSup;
            }
            catch (Exception ex) { }
            return msg;
        }
        [HttpGet]
        public object getdataChart(string DepartmentCode)
        {
            List<string> ListMonth = new List<string>() { "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" };
            var timeNowYear = DateTime.Now.Year;
            var countEnd = (from d in ListMonth
                                join c in (from a in _context.StopContractHeaders.Where(x=>x.Status.Equals("FINAL_DONE"))
                                           join b in _context.StopContractDetails on a.DecisionNum equals b.DecisionNum
                                           join e in _context.HREmployees on b.EmployeeCode equals e.Id.ToString()
                                           where
                                            (string.IsNullOrEmpty(DepartmentCode) || e.unit.Equals(DepartmentCode))
                                           select new
                                           {
                                               date = b.SessionDate.Value.ToString("MM"),
                                           }).OrderBy(x => x.date).GroupBy(x => x.date).Select(x => new dataModel
                                           {
                                               date = x.Key,
                                               Count = x.Count()
                                           }) on d equals c.date into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new dataModel
                                {
                                    date = d,
                                    Count = c2 != null ? c2.Count : 0,
                                }).ToList();
            return countEnd;
        }
        [HttpPost]
        public object GetReport()
        {
            var query = (from a in _context.CommonSettings
                         join b in _context.VocaCertCats on a.CodeSet equals b.TermUnit
                         where !b.IsDeleted
                         select new { a, b });
            var data = query.Select(x => new
            {
                Code = x.b.CertCode,
                Name = x.b.CertName,
                Time = x.b.CertTerm,
                Unit = x.a.ValueSet
            });
            return data;
        }
        [HttpPost]
        public object GetDepart()
        {
            //Lấy dữ liệu phòng ban
            var data = _context.AdDepartments.Select(x => new { Code = x.DepartmentCode, Name = x.Title}).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public JsonResult GetListSpecialized()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => x.Group == "EMPLOYEE_SPECIALIEXD").Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListEmployeeLevel()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => x.Group == "EMPLOYEE_Level").Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert(EmployeeCerts obj, IFormFile images)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var certificate = _context.EmployeeCerts.FirstOrDefault(x => x.Id == obj.Id || (x.CertCode == obj.CertCode && x.EmployeeCode == obj.EmployeeCode ));
                if (certificate != null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CRPT_MSG_EXIST_CERTIFICATE"];
                }
                else
                {
                    var fileName="";
                    if (images != null)
                    {
                        var upload = _upload.UploadImage(images);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            fileName = "/uploads/Images/" + upload.Object.ToString();

                        }
                    }
                    DateTime? CertDate = !string.IsNullOrEmpty(obj.CertDateLicense) ? DateTime.ParseExact(obj.CertDateLicense, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var employee = new EmployeeCert()
                    {
                        CertCode = obj.CertCode,
                        CertNum = obj.CertNum,
                        CertDateLicense = CertDate,
                        EmployeeCode = obj.EmployeeCode,
                        Noted = obj.Noted,
                        ImgPath = fileName,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,

                    };
                   
                    _context.EmployeeCerts.Add(employee);
                    _context.SaveChanges();
                    msg.Object = obj.Id;
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];

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
        public JsonResult Update(EmployeeCerts obj, IFormFile images)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var fileName = "";
                if (images != null)
                {
                    var upload = _upload.UploadImage(images);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        fileName = "/uploads/Images/" + upload.Object.ToString();

                    }
                }
                DateTime? CertDate = !string.IsNullOrEmpty(obj.CertDateLicense) ? DateTime.ParseExact(obj.CertDateLicense, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.EmployeeCerts.FirstOrDefault(x => !x.IsDeleted && x.Id == obj.Id);
                if (data != null)
                {
                    data.CertCode = obj.CertCode;
                    data.CertNum = obj.CertNum;
                    data.EmployeeCode = obj.EmployeeCode;
                    data.CertDateLicense = CertDate;
                    data.Noted = obj.Noted;
                    data.ImgPath = fileName;
                    //data.ImgPath = obj.PathIMG;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                  
                    _context.EmployeeCerts.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
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
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.EmployeeCerts.FirstOrDefault(x => !x.IsDeleted && x.Id == Id);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public JsonResult Delete(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EmployeeCerts.FirstOrDefault(x => !x.IsDeleted && x.Id == Id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.EmployeeCerts.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
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
        public ActionResult ExportExcel(string DepartmentCode ,string DecisionBy, string DecisionNum, string Fromto, string Dateto)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(Fromto) ? DateTime.ParseExact(Fromto, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(Dateto) ? DateTime.ParseExact(Dateto, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.StopContractHeaders.Where(x => !x.IsDeleted)
                         join b in _context.StopContractDetails on a.DecisionNum equals b.DecisionNum
                         join c in _context.HREmployees on b.EmployeeCode equals c.Id.ToString()
                          where b.IsDeleted == false && a.Status.Equals("FINAL_DONE")
                          && (string.IsNullOrEmpty(DepartmentCode) || c.unit.Equals(DepartmentCode))
                         && (string.IsNullOrEmpty(DecisionBy) || b.DeletedBy.ToLower().Contains(DecisionBy.ToLower()))
                         && (string.IsNullOrEmpty(DecisionNum) || a.DecisionNum.Equals(DecisionNum))
                         && (fromDate == null || (a.DecisionDate.Value >= fromDate.Value))
                         && (toDate == null || (a.DecisionDate.Value <= toDate.Value))                       
                         select new
                         {
                             b.Id,
                             b.EmployeeCode,
                             c.fullname,
                             a.DecisionNum,
                             a.DecisionDate,
                             Gender = c.gender == 1  ? "Nam" :"Nữ",
                             c.birthday,
                             b.Reason
                         }).ToList();
            var listExport = new List<HrEmployeeModelExcel>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new HrEmployeeModelExcel();

                itemExport.No = no;
                itemExport.EmployeeCode = item.EmployeeCode;
                itemExport.fullname = item.fullname;
                itemExport.DecisionNum = item.DecisionNum;
                itemExport.DecisionDate = item.DecisionDate.ToString();
                itemExport.Gender = item.Gender;
                itemExport.BirthDay = item.birthday.ToString();
                itemExport.Reason = item.Reason;
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2016;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Quyet-dinh-cham-dut-hop-dong");
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

            sheetRequest.Range["A1"].Text = "Quyết định chấm dứt nhân viên";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã nhân viên";
            sheetRequest["C2"].Text = "Tên nhân viên";
            sheetRequest["D2"].Text = "Số quyết định";
            sheetRequest["E2"].Text = "Ngày quyết định";
            sheetRequest["F2"].Text = "Giới tính";
            sheetRequest["G2"].Text = "Ngày sinh";
            sheetRequest["H2"].Text = "Lý do";
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
            sheetRequest["A2:H2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:H2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Quyet-dinh-cham-dut-hop-dong" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }
        public JsonResult UploadFile(IFormFile fileUpload)

        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                List<EmployeeCert> list = new List<EmployeeCert>();
                if (fileUpload != null && fileUpload.Length > 0)
                {

                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];
                    var user = _context.Users.FirstOrDefault(x => x.UserName.Equals(User.Identity.Name));
                    if (worksheet.Rows.Length > 1)
                    {
                        var title = worksheet.Rows[1].Cells;
                        if (
                            title[0].DisplayText.Trim() == "Số hiệu" &&
                            title[1].DisplayText.Trim() == "Mã CC - Thẻ AT" &&
                            title[2].DisplayText.Trim() == "Mã nhân viên" &&
                            title[3].DisplayText.Trim() == "Ngày cấp"          
                            )
                        {
                            var lengthc = worksheet.Columns.Length;
                            var length = worksheet.Rows.Length;
                            //var day = worksheet.GetValueRowCol(2, 4).ToString().Trim();
                            //var month = worksheet.GetValueRowCol(2, 6).ToString().Trim();
                            //var year = worksheet.GetValueRowCol(2, 8).ToString().Trim();
                            //var time = day + "/" + month + "/" + year;

                            for (int i = 3; i <= length; i++)
                            {
                                DateTime? fromDate = string.IsNullOrEmpty(worksheet.GetValueRowCol(i, 4).ToString()) ? DateTime.ParseExact(worksheet.GetValueRowCol(i, 4).ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                                var obj = new EmployeeCert
                                {
                                    CertNum = worksheet.GetValueRowCol(i, 1).ToString(),
                                    CertCode = worksheet.GetValueRowCol(i, 2).ToString(),
                                    EmployeeCode =(worksheet.GetValueRowCol(i, 3).ToString()),
                                    CertDateLicense = DateTime.Now.Date,           
                                    CreatedTime = DateTime.Now,
                                    CreatedBy = User.Identity.Name,
                                    IsDeleted = false
                                };
                                list.Add(obj);
                            }
                            msg.Object = list;
                            msg.Title = _stringLocalizer["CRPT_MSG_READ_FILE_EXCEL_SUCCESS"];
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["CRPT_MSG_FILE_NOT_COMPA"];
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CRPT_MSG_FILE_EXCEL_NO_DATA"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CRPT_MSG_FILE_EXCEL_NO_DATA"];
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult SaveData([FromBody] List<cert> data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                if (data != null)
                {
                    foreach (var tem in data)
                    {
                        
                        //DateTime? fromDate = !string.IsNullOrEmpty(CertDateLicense).ToString()) ? DateTime.ParseExact(CertDateLicense).ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        var cer = new EmployeeCert
                        {
                            CertNum = tem.CertNum,
                            CertCode = tem.CertCode,
                            EmployeeCode = tem.EmployeeCode,
                            //CertDateLicense = tem.CertDateLicense,
                          
                        };
                        _context.EmployeeCerts.Add(cer);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CRPT_MSG_DATA_EMPTY"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class dataModel
        {
            public string date { get; set; }
            public int Count { get; set; }
        }
        public class cert
        {
            public bool Check { get; set; }
            public int Id { get; set; }
            public string CertNum { get; set; }
            public string CertCode { get; set; }

            public string EmployeeCode { get; set; }

            public string CertDateLicense { get; set; }
        
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value}));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        public class HrEmployeeModel1 : JTableModel
        {
          
            public int No { get; set; }
            public string CertCode { get; set; }
            public string CertName { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }
      
            public string FromTo { get; set; }
            public string Dateto { get; set; }

        }
        public class HrEmployeeModelExcel
        {
            public int No { get; set; }
            public string EmployeeCode { get; set; }
            public string fullname { get; set; }
            public string DecisionNum { get; set; }
            public string DecisionDate { get; set; }
            public string Gender { get; set; }
            public string BirthDay { get; set; }
            public string Reason { get; set; }
        }
        public class HrEmployeeModel : JTableModel
        {
            public string CertName { get; set; }
            public int No { get; set; }
            public string CertCode { get; set; }
            public string EmployeeName { get; set; }
            public string EmployeeCode { get; set; }
            public string DepartmentCode { get; set; }
            public string FromTo { get; set; }
            public string Dateto { get; set; }
            public string Status { get; set; }
            public string Style { get; set; }
            public string Duration { get; set; }
        }
        public class ContractModel : JTableModel
        {

            public string DepartmentCode { get; set; }
            public string Fromto { get; set; }
            public string Dateto { get; set; }
            public string DecisionBy { get; set; }
            public string DecisionNum { get; set; }
        }
        public class EmployeeCerts
        {
            public int Id { get; set; }
            public string CertCode { get; set; }
            public string CertNum { get; set; }
            public string EmployeeCode { get; set; }

            public string CertDateLicense { get; set; }
            public string Noted { get; set; }
        }
    }
}