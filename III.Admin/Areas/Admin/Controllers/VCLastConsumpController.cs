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

    public class VCLastConsumpController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IRepositoryService _repositoryService;
        public class JTableGetTotal
        {
            public string CustomerName { get; set; }
            public string Area { get; set; }
            public string Staff { get; set; }
            public string StaffCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string BrandCode { get; set; }
            public string DateSearch { get; set; }
        }
        public class JTableVCLastConsumpModelCustom : JTableModel
        {
            public string CustomerName { get; set; }
            public string Area { get; set; }
            public string Staff { get; set; }
            public string StaffCode { get; set; }

            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string BrandCode { get; set; }
            public string DateSearch { get; set; }
        }
        public VCLastConsumpController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext,
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


        public object JTable([FromBody]JTableVCLastConsumpModelCustom jTablePara)
        {
            var count = 0;
            var intBeginFor = 1;
            try
            {
                var session = HttpContext.GetSessionUser();
                DateTime date = !string.IsNullOrEmpty(jTablePara.DateSearch) ? DateTime.ParseExact(jTablePara.DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var yearMonth = date.ToString("yyyyMM");

                intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = new List<VCGroupCustomerCareModel>();
                var querySum = new List<SumReport>();

                if (session.UserType == 10)
                {
                    string[] param = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@startRecord", "@endRecord" };
                    object[] val = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, intBeginFor + 1, intBeginFor + jTablePara.Length };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Paging_4_Admin", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                    string[] param1 = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode" };
                    object[] val1 = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Sum_4_Admin", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@listArea", "@startRecord", "@endRecord" };
                        object[] val = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, session.Area, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Paging_4_Manager", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@listArea" };
                        object[] val1 = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Sum_4_Manager", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@createBy", "@startRecord", "@endRecord" };
                        object[] val = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, session.UserName, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Paging_4_User", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@createBy" };
                        object[] val1 = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Sum_4_User", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                }

                count = querySum.Select(x => x.Count).FirstOrDefault();
                //var data = query.ToList();
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "CusName", "AreaName", "ProductCode", "ProductName", "BrandCode", "BrandName", "ConsumpMonthly", "Staff", "CreatedTime"); //, "Note"
                return Json(jdata);
            }
            catch (Exception ex)
            {
                return Json("");
            }
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableGetTotal jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            DateTime date = !string.IsNullOrEmpty(jTablePara.DateSearch) ? DateTime.ParseExact(jTablePara.DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var yearMonth = date.ToString("yyyyMM");

            List<SumReport> querySum = new List<SumReport>();

            if (session.UserType == 10)
            {
                string[] param1 = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode" };
                object[] val1 = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode };
                DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Sum_4_Admin", param1, val1);
                querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param1 = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@listArea" };
                    object[] val1 = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, session.Area };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Sum_4_Manager", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param1 = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@createBy" };
                    object[] val1 = new object[] { yearMonth, jTablePara.StaffCode, jTablePara.Area, jTablePara.CustomerName, jTablePara.BrandCode, jTablePara.ProductCode, session.UserName };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Sum_4_User", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
            }

            var sumConsumpMonthly = querySum.Select(x => x.SumConsumpMonthly).FirstOrDefault();

            var rs = new { totalConsumpMonthly = sumConsumpMonthly };
            return Json(rs);
        }

        [HttpPost]
        public object GetListArea()
        {
            var session = HttpContext.GetSessionUser();
            return GetListAreaFunc(session);
        }
        [HttpPost]
        public object GetListProduct()
        {
            var query = (from a in _context.MaterialProducts
                         where a.IsDeleted != true
                         orderby a.ProductName
                         select new
                         {
                             Code = a.ProductCode,
                             Name = a.ProductName
                         }).AsNoTracking();
            return Json(query);
        }
        [HttpPost]
        public object GetListBrand()
        {
            var query = (from a in _context.CommonSettings
                         where a.Group == "VC_BRAND"
                         && a.IsDeleted != true
                         orderby a.ValueSet
                         select new
                         {
                             Code = a.CodeSet,
                             Name = a.ValueSet
                         }).AsNoTracking();
            return Json(query);
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
        public ActionResult ExportExcel(string page, string row, string customerName, string areaExport, string staffCode, string productCode, string brandCode, string fromDate, string toDate, string dateSearch, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            var intBeginFor = 1;

            var session = HttpContext.GetSessionUser();
            intBeginFor = (pageInt - 1) * length;

            var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var yearMonth = date.ToString("yyyyMM");

            var query = new List<VCGroupCustomerCareModel>();

            if (session.UserType == 10)
            {
                string[] param = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@startRecord", "@endRecord", "@allData" };
                object[] val = new object[] { yearMonth, staffCode, areaExport, customerName, brandCode, productCode, intBeginFor + 1, intBeginFor + length, 0 };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Export_4_Admin", param, val);
                query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@listArea", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { yearMonth, staffCode, areaExport, customerName, brandCode, productCode, session.Area, intBeginFor + 1, intBeginFor + length, 0 };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Export_4_Manager", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param = new string[] { "@yearMonth", "@userName", "@areaCode", "@cusCode", "@brandCode", "@productCode", "@createBy", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { yearMonth, staffCode, areaExport, customerName, brandCode, productCode, session.UserName, intBeginFor + 1, intBeginFor + length, 0 };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Last_Consump_Search_Export_4_Manager", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
            }
            var listExport = new List<VCLastConsumpExportModel>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new VCLastConsumpExportModel();
                itemExport.No = no;
                itemExport.CustomerName = item.CusName;
                itemExport.Area = item.AreaName;
                itemExport.ProductName = item.ProductName;
                itemExport.BrandName = item.BrandName;
                itemExport.ConsumpMonthly = item.ConsumpMonthly.ToString();
                itemExport.Staff = item.Staff;
                itemExport.CreatedTime = item.CreatedTime != null ? item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "";

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
            IWorksheet sheetRequest = workbook.Worksheets.Create("DuLieuNhapCuoiThang");
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

            sheetRequest.Range["A1"].Text = "DỮ LIỆU NHẬP CUỐI THÁNG";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NPP/ĐL/CH";
            sheetRequest["C2"].Text = "KHU VỰC";
            sheetRequest["D2"].Text = "CHỦNG LOẠI";
            sheetRequest["E2"].Text = "THƯƠNG HIỆU";
            sheetRequest["F2"].Text = "SẢN LƯỢNG TIÊU THỤ (T)";
            sheetRequest["G2"].Text = "NHÂN VIÊN";
            sheetRequest["H2"].Text = "THỜI GIAN";


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
            var fileName = "ExportDuLieuNhapCuoiThang" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
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


    public class VCLastConsumpModel
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string CusCode { get; set; }
        public string StaffCode { get; set; }
        public string Area { get; set; }
        public string AreaName { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string BrandCode { get; set; }
        public string BrandName { get; set; }
        public decimal? ConsumpMonthly { get; set; }
        public decimal? Instock { get; set; }
        public decimal? BuyCost { get; set; }
        public decimal? SaleCost { get; set; }
        public string Staff { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string Note { get; set; }
        public decimal? ProportionCal { get; set; }
    }
    public class VCLastConsumpExportModel
    {
        public int No { get; set; }
        public string CustomerName { get; set; }
        public string Area { get; set; }
        public string ProductName { get; set; }
        public string BrandName { get; set; }
        public string ConsumpMonthly { get; set; }
        public string Staff { get; set; }
        public string CreatedTime { get; set; }
    }
}