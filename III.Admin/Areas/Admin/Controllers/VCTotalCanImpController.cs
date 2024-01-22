using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using System.IO;
using III.Admin.Controllers;
using ESEIM;
using System.Data;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class VCTotalCanImpController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IRepositoryService _repositoryService;

        public class JTableVCTotalCanImpModelCustom : JTableModel
        {
            public string CustomerName { get; set; }
            public string Area { get; set; }
            public string Staff { get; set; }
            public string StaffCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string DateSearch { get; set; }

        }
        public class VCTotalCanImpExportModel
        {
            public int No { get; set; }
            public string CustomerName { get; set; }
            public string AreaName { get; set; }
            public string TotalCanImp { get; set; }
            public string Staff { get; set; }
            public string CreatedTime { get; set; }
            public string Note { get; set; }
        }
        public VCTotalCanImpController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager,
            IRepositoryService repositoryService)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _repositoryService = repositoryService;
        }

        public IActionResult Index()
        {
            return View();
        }


        //API call procedure
        public object JTable([FromBody]JTableVCTotalCanImpModelCustom jTablePara)
        {
            var count = 0;
            var intBeginFor = 1;
            try
            {
                var session = HttpContext.GetSessionUser();

                //DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                //DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime date = !string.IsNullOrEmpty(jTablePara.DateSearch) ? DateTime.ParseExact(jTablePara.DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();
                List<SumReport> querySum = new List<SumReport>();

                if (session.UserType == 10)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@startRecord", "@endRecord" };
                    object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, intBeginFor + 1, intBeginFor + jTablePara.Length };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Paging_4_Admin", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext" };
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Sum_4_Admin", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@listArea", "@startRecord", "@endRecord" };
                        object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, session.Area, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Paging_4_Manager", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@listArea" };
                        object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Sum_4_Manager", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@userName", "@startRecord", "@endRecord" };
                        object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, session.UserName, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Paging_4_User", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@userName" };
                        object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Sum_4_User", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                }

                count = querySum.Select(x => x.Count).FirstOrDefault();

                var data = query.ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CusName", "AreaCode", "AreaName", "TotalCanImp", "Staff", "CreatedTime", "Note");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                //var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CustomerName", "Area", "ProporCurrent", "TotalCanImp", "Staff", "CreatedTime");
                return Json("");
            }
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableVCTotalCanImpModelCustom jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            //DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime date = !string.IsNullOrEmpty(jTablePara.DateSearch) ? DateTime.ParseExact(jTablePara.DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNext = new DateTime(date.Year, date.Month, 1);
            startDateNext = startDateNext.AddMonths(1);

            List<SumReport> querySum = new List<SumReport>();

            if (session.UserType == 10)
            {
                string[] param1 = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext" };
                object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext };
                DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Sum_4_Admin", param1, val1);
                querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@listArea" };
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, session.Area };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Sum_4_Manager", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@userName" };
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, jTablePara.StaffCode, startDateNext, session.UserName };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Sum_4_User", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
            }

            var totalCanImp = querySum.Select(x => x.SumTotalCanImp).FirstOrDefault();

            var rs = new { TotalCanImp = totalCanImp };
            return Json(rs);
        }

        [HttpPost]
        public object GetListArea()
        {
            var session = HttpContext.GetSessionUser();
            return GetListAreaFunc(session);
        }
        //Lấy list Đại lý/Cửa hàng
        [HttpPost]
        public JsonResult GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return Json(rs);
        }

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string customerName, string areaExport, string staffCode, string fromDate, string toDate, string dateSearch, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            var intBeginFor = 1;
            //Get data View

            var session = HttpContext.GetSessionUser();
            intBeginFor = (pageInt - 1) * length;

            //DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNext = new DateTime(date.Year, date.Month, 1);
            startDateNext = startDateNext.AddMonths(1);

            List<VCGroupCustomerCareModel> query = new List<VCGroupCustomerCareModel>();

            if (session.UserType == 10)
            {
                string[] param = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@startRecord", "@endRecord", "@allData" };
                object[] val = new object[] { customerName, areaExport, staffCode, startDateNext, intBeginFor + 1, intBeginFor + length, 0 };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Export_4_Admin", param, val);
                query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@listArea", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { customerName, areaExport, staffCode, startDateNext, session.Area, intBeginFor + 1, intBeginFor + length, 0 };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Export_4_Manager", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@staff", "@startDateNext", "@userName", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { customerName, areaExport, staffCode, startDateNext, session.UserName, intBeginFor + 1, intBeginFor + length, 0 };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Total_Can_Imp_Search_Export_4_User", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
            }

            var listExport = new List<VCTotalCanImpExportModel>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new VCTotalCanImpExportModel();
                itemExport.No = no;
                itemExport.CustomerName = item.CusName;
                itemExport.AreaName = item.AreaName;
                itemExport.Staff = item.Staff;
                itemExport.CreatedTime = item.CreatedTime != null ? item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                itemExport.TotalCanImp = item.TotalCanImp.ToString();
                itemExport.Note = item.Note;

                //if (item.Percent == 100)
                //{
                //    itemExport.Percent = "100%";
                //}
                //else if (item.Percent == 0)
                //{
                //    itemExport.Percent = "0%";
                //}
                //else
                //{
                //    itemExport.Percent = String.Format("{0:0.00}", item.Percent) + "%";
                //}
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("TruLuongTrong");
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

            sheetRequest.Range["A1"].Text = "TRỮ LƯỢNG TRỐNG";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NPP/ĐL/CH";
            sheetRequest["C2"].Text = "KHU VỰC";
            sheetRequest["D2"].Text = "TRỮ LƯỢNG TRỐNG (T)";
            sheetRequest["E2"].Text = "NHÂN VIÊN";
            sheetRequest["F2"].Text = "THỜI GIAN";
            sheetRequest["G2"].Text = "GHI CHÚ";


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
            var fileName = "ExportTruLuongTrong" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }
        [HttpPost]
        public JsonResult GetAllStaff()
        {
            var list = (from a in _context.Users
                        where a.UserName.ToLower() != "admin" && a.Active == true
                        select new
                        {
                            a.Id,
                            a.UserName,
                            a.GivenName
                        }).ToList();
            return Json(list);
        }
    }
    public class VCTotalCanImpModel
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string CusCode { get; set; }
        public string Area { get; set; }
        public string AreaName { get; set; }
        public decimal? Proportion { get; set; }
        public decimal? ProportionCal { get; set; }
        public decimal? Instock { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Staff { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string Note { get; set; }
    }

    public class SumReport
    {
        public int Count { get; set; }
        public decimal SumTotalCanImp { get; set; }
        public decimal SumInstock { get; set; }
        public decimal SumConsumpMonthly { get; set; }
    }
}