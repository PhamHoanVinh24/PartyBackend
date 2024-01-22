using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Hosting.Internal;
using Syncfusion.XlsIO;
using SmartBreadcrumbs.Attributes;
using Color = Syncfusion.Drawing.Color;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class HrEmployeeMobilizationChartController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<HrEmployeeMobilizationChartController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public HrEmployeeMobilizationChartController(EIMDBContext context, IUploadService upload, IGoogleApiService googleAPIService,
            IHostingEnvironment hostingEnvironment, IOptions<AppSettings> appSettings,
            IStringLocalizer<HrEmployeeMobilizationChartController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbHrEmployeeMobilization", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]

        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbHrEmployeeMobilization"] = _sharedResources["COM_CRUMB_HR_MOBILIZATION_CHART"];
            return View();
        }

        #region Index

        public class JTableModelCustom : JTableModel
        {
            public string DecisionNum { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
            public string DepartBegin { get; set; }
            public string DepartLate { get; set; }


        }

        [HttpPost]
        public object JTableMain([FromBody] JTableModelCustom jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTime) ? DateTime.ParseExact(jTablePara.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToTime) ? DateTime.ParseExact(jTablePara.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.DecisionMovementHeaders.Where(x => !x.IsDeleted)
                        join b in _context.DecisionMovementDetails on a.DecisionNum equals b.DecisionNum
                        join c in _context.HREmployees on b.EmployeesCode equals c.Id.ToString()
                        where b.IsDeleted == false && a.Status.Equals("FINAL_DONE")
                         && (string.IsNullOrEmpty(jTablePara.DepartBegin) || c.unit.Equals(jTablePara.DepartBegin))
                         && (string.IsNullOrEmpty(jTablePara.DepartLate) || b.NewDepartCode.Equals(jTablePara.DepartLate))
                         && (string.IsNullOrEmpty(jTablePara.DecisionNum) || b.DecisionNum.Equals(jTablePara.DecisionNum))
                         && (fromDate == null || (b.FromTime.Value >= fromDate.Value))
                         && (toDate == null || (b.ToTime.Value <= toDate.Value))
                        select new
                        {
                            b.Id,
                            b.EmployeesCode,
                            c.fullname,
                            a.DecisionNum,
                            b.NewDepartCode,
                            c.unit,
                            b.FromTime,
                            b.ToTime,
                            c.gender,
                            c.birthday,
                        };
            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "unit" ,"fullname", "EmployeesCode", "DecisionNum", "FromTime", "ToTime", "NewDepartCode");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableMainDead([FromBody] JTableModelCustom jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTime) ? DateTime.ParseExact(jTablePara.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToTime) ? DateTime.ParseExact(jTablePara.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.DecisionMovementHeaders.Where(x => !x.IsDeleted)
                        join b in _context.DecisionMovementDetails.Where(x => !x.IsDeleted && x.ToTime.Value.Date < DateTime.Now.Date) on a.DecisionNum equals b.DecisionNum
                        join c in _context.HREmployees on b.EmployeesCode equals c.Id.ToString()
                        where b.IsDeleted == false && a.Status.Equals("FINAL_DONE")
                         && (string.IsNullOrEmpty(jTablePara.DepartBegin) || c.unit.Equals(jTablePara.DepartBegin))
                         && (string.IsNullOrEmpty(jTablePara.DepartLate) || b.NewDepartCode.Equals(jTablePara.DepartLate))
                         && (string.IsNullOrEmpty(jTablePara.DecisionNum) || b.DecisionNum.Equals(jTablePara.DecisionNum))
                         && (fromDate == null || (b.FromTime.Value.Date >= fromDate.Value))
                         && (toDate == null || (b.ToTime.Value.Date <= toDate.Value))

                        select new
                        {
                            b.Id,
                            b.EmployeesCode,
                            c.fullname,
                            a.DecisionNum,
                            b.NewDepartCode,
                            c.unit,
                            b.FromTime,
                            b.ToTime,
                            c.gender,
                            c.birthday,


                        };
            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "unit", "fullname", "EmployeesCode", "DecisionNum", "FromTime", "ToTime", "NewDepartCode");
            return Json(jdata);
        }
        public class ModelHr
        {
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Permanentresidence { get; set; }
            public string EmployeeType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? EmployeeId { get; set; }
            public string Unit { get; set; }
            public string Position { get; set; }
            public string BranchId { get; set; }

            public string Gender { get; set; }
            public DateTime BirthDay { get; set; }
            public string NumberOfYears { get; set; }
            public string YearsOfWork { get; set; }
            public string Wage { get; set; }
            public string EducationalLevel { get; set; }
        }
        [HttpPost]
        public object JTableMain2([FromBody] List<int> arr)
        {
                var query = from a in _context.HREmployees.Where(x => x.flag == 1 && arr.Any(p=>p.Equals(x.Id)))
                            join b in _context.Roles on a.position equals b.Id
                            join c in _context.AdDepartments on a.unit equals c.DepartmentCode
                            select new
                            {
                                a.Id,
                                a.fullname,
                                a.gender,
                                a.phone,
                                a.permanentresidence,
                                a.employeetype,
                                a.picture,
                                a.birthofplace,
                                BirthDay = a.birthday.Value.ToString("dd/MM/yyyy"),
                                a.unit,
                                a.position,
                                unitName = c.Title,
                                positionName = b.Title,
                                a.employee_code
                            };
            return query;
        }
        public class PayScaleDetailModel
        {
            public string ScaleCode { get; set; }
            public decimal Ranges { get; set; }
        }

        [HttpGet]
        public object GetRangesScale(string code)
        {
            var data = from a in _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(code))
                       select new
                       {
                           Code = a.Ranges
                       };
            return data;
        }
        [HttpPost]
        public object GetRangesScaleCoeff([FromBody] PayScaleDetailModel obj)
        {
            var data = from a in _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(obj.ScaleCode) && x.Ranges==obj.Ranges.ToString())
                       select new
                       {
                           Coeff = a.Coeff
                       };
            return data;
        }


        [HttpPost]
        public object JTable([FromBody]JTableModelHrEmployeeTermination jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var decisionDate = !string.IsNullOrEmpty(jTablePara.DecisionDate) ? DateTime.ParseExact(jTablePara.DecisionDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var decisionMakingDate = !string.IsNullOrEmpty(jTablePara.DecisionMakingDate) ? DateTime.ParseExact(jTablePara.DecisionMakingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.HrEmployeeDecisions.Where(x => !x.IsDeleted)
                        where (string.IsNullOrEmpty(jTablePara.DecisionCode) || a.DecisionCode.ToLower().Contains(jTablePara.DecisionCode.ToLower()))
                        && (decisionDate == null || (a.DecisionDate.HasValue && a.DecisionDate.Value.Date == decisionDate.Value.Date))
                        && (decisionMakingDate == null || (a.DecisionMakingDate.HasValue && a.DecisionMakingDate.Value.Date == decisionMakingDate.Value.Date))
                        && a.Style == 2
                        select new
                        {
                            a.Id,
                            a.DecisionCode,
                            DecisionDate = a.DecisionDate.Value.ToString("dd/MM/yyyy"),
                            DecisionMakingDate = a.DecisionMakingDate.Value.ToString("dd/MM/yyyy"),
                            Status = a.DecisionCode == "" ? "Chưa xử lý" : "Đã xử lý",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "DecisionCode", "DecisionDate", "DecisionMakingDate", "Status");
            return Json(jdata);
        }
        public class HrEmployeeDecisionModel
        {
            public int Id { get; set; }
            public string DecisionCode { get; set; }
            public string DecisionWakingDate { get; set; }
            public int StyleDecisionCode { get; set; }
        }
        #endregion

        #region
        [HttpPost]
        public JsonResult GetListEmpolyee()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.HREmployees.Where(x => x.flag == 1 && x.status == "WORKING")
                    .Select(x => new
                    {
                        Id = x.Id,
                        fullname = x.fullname + " - " + x.employee_code,
                        DepartmentId = x.unit,
                        RoleId = x.position,
                        DepartmentName = _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.unit) == null ? "" : _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.unit).Title,
                        RoleName = _context.Roles.FirstOrDefault(y => y.Id == x.position) == null ? "" : _context.Roles.FirstOrDefault(y => y.Id == x.position).Title,
                    }).ToList();
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListDepartment()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.AdDepartments.Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        Code = x.DepartmentCode,
                        Name = x.Title
                    });
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListRole()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.Roles.Where(x => x.Status == true)
                    .Select(x => new
                    {
                        Code = x.Id,
                        Name = x.Title
                    });
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListReason()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => x.Group == "STYLEMPLOYEETERMINASION").Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class EployeeMobilization
        {
            public int StyleDecisionCode { get; set; }
            public string DecisionId { get; set; }
            public string EmployeeId { get; set; }
            public string DepartmentIdOld { get; set; }
            public string RoleIdOld { get; set; }
            public string DepartmentIdNew { get; set; }
            public string RoleIdNew { get; set; }
            public string Wage { get; set; }
            public string WageLevel { get; set; }
            public string Reason { get; set; }
            public string FormDate { get; set; }
            public string ToDate { get; set; }
        }
        [HttpPost]
        public JsonResult GetListEployeeMobilization(string DecistionId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = (from a in _context.HREmployeeMobilizations
                              join b in _context.HREmployees on a.EmployeeId equals b.Id.ToString()
                              where a.IsDeleted == false && b.flag == 1 && a.DecisionId == DecistionId
                              select new
                              {
                                  a.Id,
                                  EmployeeCode = b.employee_code,
                                  FullName = b.fullname,
                                  DepartmentNameOld = _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdOld) == null ? "" : _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdOld).Title,
                                  DepartmentNameNew = _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdNew) == null ? "" : _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdNew).Title,
                                  RoleNameOld = _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdOld) == null ? "" : _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdOld).Title,
                                  RoleNameNew = _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdNew) == null ? "" : _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdNew).Title,
                                  WageLevel = a.WageLevel,
                                  Reason = a.Reason,
                                  FormDate = a.FormDate != null ? a.FormDate.Value.ToString("dd/MM/yyyy") : "",
                                  ToDate = a.ToDate != null ? a.ToDate.Value.ToString("dd/MM/yyyy") : "",
                              }).ToList();
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion
        public class HrEmployeeModelExcel
        {
            public int No { get; set; }
            public string EmployeeCode { get; set; }
            public string fullname { get; set; }
            public string DecisionNum { get; set; }
            public string DepartmentCode { get; set; }

            public string DepartmentNew{ get; set; }

            public string FromTime { get; set; }
            public string ToTime { get; set; }

        }
        #region thêm sửa xóa quyết định điều động

        public class ModelHeaderDetail
        {
            public string Id { get; set; }
            public string Reason { get; set; }
            public string PayScaleCode { get; set; }
            public string Ranges { get; set; }
            public string Role { get; set; }
            public string DepartCode { get; set; }
        }
        public class ModelHeader
        {
            public string DecisionNum { get; set; }
            public string DecisionDate { get; set; }
            public string DecideBy { get; set; }
            public string AprovedBy { get; set; }
            public string AprovedTime { get; set; }
            public string Status { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
             public List<ModelHeaderDetail> arr3 { get; set; }
        }

        [HttpPost]
        public JsonResult InsertDecisionMovement([FromBody] ModelHeader obj)
        {

            var msg = new JMessage { Title = "", Error = false };
            try
            {
                DateTime DecisionDate = DateTime.Parse(obj.DecisionDate, new System.Globalization.CultureInfo("pt-BR"));
                DateTime FromTime = DateTime.Parse(obj.FromTime, new System.Globalization.CultureInfo("pt-BR"));
                DateTime ToTime = DateTime.Parse(obj.ToTime, new System.Globalization.CultureInfo("pt-BR"));
                var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.DecisionNum == obj.DecisionNum && !x.IsDeleted);
                if (data == null)
                {
                    var Dice = new DecisionMovementHeader()
                    {
                        DecisionNum = obj.DecisionNum,
                        Status = obj.Status,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };

                    foreach (var item in obj.arr3)
                    {
                        var detail = new DecisionMovementDetail()
                        {
                            EmployeesCode = item.Id,
                            DecisionNum = obj.DecisionNum,
                            ReasonMovement = item.Reason,
                            PayScaleCode = item.PayScaleCode,
                            NewDepartCode = item.DepartCode,
                            NewRole = item.Role,
                            //PayCoeff = _context.PayScaleDetails.FirstOrDefault(x=>!x.IsDeleted && x.ScaleCode.Equals(item.PayScaleCode) && x.Ranges == item.Ranges).Coeff,
                            //PayRanges = Convert.ToDecimal(item.Ranges),
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now

                        };
                        _context.DecisionMovementDetails.Add(detail);
                    }

                    _context.DecisionMovementHeaders.Add(Dice);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["HMC_MSG_RECORD_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        #endregion
        [HttpGet]
        public ActionResult ExportExcel(string DepartmentCode, string DecisionBy, string DecisionNum, string Fromto, string Dateto)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(Fromto) ? DateTime.ParseExact(Fromto, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(Dateto) ? DateTime.ParseExact(Dateto, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.DecisionMovementHeaders.Where(x => !x.IsDeleted && x.Status.Equals("FINAL_DONE"))
                         join b in _context.DecisionMovementDetails on a.DecisionNum equals b.DecisionNum
                         join c in _context.HREmployees on b.EmployeesCode equals c.Id.ToString()
                         where b.IsDeleted == false
                            && (string.IsNullOrEmpty(DepartmentCode) || c.unit.Equals(DepartmentCode))
                            && (string.IsNullOrEmpty(DecisionNum) || a.DecisionNum.Equals(DecisionNum))
                            && (fromDate == null || (b.FromTime.Value >= fromDate.Value))
                            && (toDate == null || (b.ToTime.Value <= toDate.Value))
                         select new HrEmployeeModelExcel
                         {
                             EmployeeCode = b.EmployeesCode,
                             fullname = c.fullname,
                             DecisionNum = b.DecisionNum,
                             DepartmentNew = _context.AdDepartments.FirstOrDefault(x=>x.DepartmentCode.Equals(b.NewDepartCode)).Title,
                             DepartmentCode = _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode.Equals(c.unit)).Title,
                             FromTime = b.FromTime.HasValue ? b.FromTime.Value.ToString("dd/MM/yyyy") : "",
                             ToTime = b.ToTime.HasValue ? b.ToTime.Value.ToString("dd/MM/yyyy") : "",
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
                itemExport.DepartmentCode = item.DepartmentCode;
                itemExport.DepartmentNew = item.DepartmentNew;
                itemExport.FromTime = item.FromTime.ToString();
                itemExport.ToTime = item.ToTime.ToString();

                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2016;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Quyet-dinh-dieu-dong-hop-dong");
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

            sheetRequest.Range["A1"].Text = "Quyết định điều động nhân viên";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Mã nhân viên";
            sheetRequest["C2"].Text = "Tên nhân viên";
            sheetRequest["D2"].Text = "Số quyết định";
            sheetRequest["E2"].Text = "Đơn vị";
            sheetRequest["F2"].Text = "Đơn vị mới";
            sheetRequest["G2"].Text = "Từ ngày";
            sheetRequest["H2"].Text = "Đến ngày";
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
            var fileName = "Quyet-dinh-dieu-dong-hop-dong" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        public class JTableModelHrEmployeeTermination : JTableModel
        {

            public string DecisionCode { get; set; }
            public string DecisionDate { get; set; }
            public string DecisionMakingDate { get; set; }

        }

    }
}