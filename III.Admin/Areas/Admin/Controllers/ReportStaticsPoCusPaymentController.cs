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
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class ReportStaticsPoCusPaymentController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<ReportStaticsPoCusPaymentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public class JTableReportStaticsPoCusPaymentModelCustom : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
        }
        public ReportStaticsPoCusPaymentController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext, IStringLocalizer<ReportStaticsPoCusPaymentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }

        [Breadcrumb("ViewData.CrumbPoCusPayment", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbPoCusPayment"] = _sharedResources["COM_CRUMB_PO_CUS_PAYMENT"];
            return View();
        }


        public object JTable([FromBody]JTableReportStaticsPoCusPaymentModelCustom jTablePara)
        {
            var count = 0;
            var intBeginFor = 1;
            try
            {
                DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = new List<ReportStaticsPoCusPaymentGrid>();

                string[] param = new string[] { "@fromDate", "@toDate", "@contractCode", "@cusCode", "@startRecord", "@endRecord" };
                object[] val = new object[] { fromDate, toDate, jTablePara.ContractCode, jTablePara.CusCode, intBeginFor + 1, intBeginFor + jTablePara.Length };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_TRADE_REVENUE_PO_CUS_PAYMENT_JOIN_PAGING_4_ADMIN", param, val);
                query = CommonUtil.ConvertDataTable<ReportStaticsPoCusPaymentGrid>(rs);
                if (query.Any())
                {
                    count = query.FirstOrDefault().CountTotal;
                }
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "ContractCode", "Title", "EffectiveDate", "ContractNo", "CusCode", "CusName", "ExchangeRate", "RealBudget", "PaymentVnd", "RevenueAfterTaxVnd", "DebtVnd", "TotalPaymentVnd", "TotalRevenueAfterTaxVnd", "TotalDebtVnd");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                return Json("");
            }
        }
        [HttpPost]
        public object GetListContract()
        {
            var rs = _context.PoSaleHeaders.Where(x => !x.IsDeleted).OrderBy(x => x.Title).Select(x => new { Code = x.ContractCode, Name = x.Title, ContractNo = x.ContractNo });
            return rs;
        }
        [HttpPost]
        public JsonResult GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return Json(rs);
        }
        [HttpPost]
        public object GetListProduct()
        {
            var query = (from a in _context.VProductAllTables
                         orderby a.ProductName
                         select new
                         {
                             Code = a.ProductCode,
                             Name = a.ProductName,
                             ProductType = a.ProductType,
                         }).AsNoTracking();
            return Json(query);
        }
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

        ////Export Excel
        //[HttpGet]
        //public ActionResult ExportExcel(string page, string row, string customerName, string areaExport, string productCode, string brandCode, string fromDate, string toDate, string dateSearch, string orderBy)
        //{
        //    int pageInt = int.Parse(page);
        //    int length = int.Parse(row);
        //    var intBeginFor = 1;
        //    var session = HttpContext.GetSessionUser();
        //    intBeginFor = (pageInt - 1) * length;

        //    var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
        //    var startDateNow = new DateTime(date.Year, date.Month, 1);
        //    var startDateNext = new DateTime(date.Year, date.Month, 1);
        //    startDateNext = startDateNext.AddMonths(1);

        //    var query = new List<VCGroupCustomerCareModel>();

        //    if (session.UserType == 10)
        //    {
        //        string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@startRecord", "@endRecord", "@allData" };
        //        object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, productCode, brandCode, intBeginFor + 1, intBeginFor + length, 0 };
        //        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Export_4_Admin", param, val);
        //        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
        //    }
        //    else
        //    {
        //        if (session.TypeStaff == 10)
        //        {
        //            string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@listArea", "@startRecord", "@endRecord", "@allData" };
        //            object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, productCode, brandCode, session.Area, intBeginFor + 1, intBeginFor + length, 0 };

        //            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Export_4_Manager", param, val);
        //            query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
        //        }
        //        else if (session.TypeStaff == 0)
        //        {
        //            string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@userName", "@startRecord", "@endRecord", "@allData" };
        //            object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, productCode, brandCode, session.UserName, intBeginFor + 1, intBeginFor + length, 0 };
        //            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Export_4_User", param, val);
        //            query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
        //        }
        //    }

        //    //var listData = FuncJTable(CustomerName, Area, Staff, ProductCode, BrandCode, FromDate, ToDate).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
        //    var listExport = new List<ReportStaticsPoCusPaymentExportModel>();
        //    var no = 1;
        //    foreach (var item in query)
        //    {
        //        var itemExport = new ReportStaticsPoCusPaymentExportModel();
        //        itemExport.No = no;
        //        itemExport.CustomerName = item.CusName;
        //        itemExport.Area = item.AreaName;
        //        itemExport.ProductName = item.ProductName;
        //        itemExport.BrandName = item.BrandName;
        //        itemExport.ConsumpMonthly = item.ConsumpMonthly.ToString();
        //        //itemExport.BuyCost = item.BuyCost.ToString();
        //        //itemExport.SaleCost = item.SaleCost.ToString();
        //        //itemExport.Staff = item.Staff;
        //        //itemExport.CreatedTime = item.CreatedTime != null ? item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "";

        //        //if (item.Percent == 100)
        //        //{
        //        //    itemExport.Percent = "100%";
        //        //}
        //        //else if (item.Percent == 0)
        //        //{
        //        //    itemExport.Percent = "0%";
        //        //}
        //        //else
        //        //{
        //        //    itemExport.Percent = String.Format("{0:0.00}", item.Percent) + "%";
        //        //}
        //        no = no + 1;
        //        listExport.Add(itemExport);
        //    }

        //    ExcelEngine excelEngine = new ExcelEngine();
        //    IApplication application = excelEngine.Excel;
        //    application.DefaultVersion = ExcelVersion.Excel2010;

        //    IWorkbook workbook = application.Workbooks.Create(1);
        //    workbook.Version = ExcelVersion.Excel97to2003;
        //    IWorksheet sheetRequest = workbook.Worksheets.Create("SanLuong");
        //    workbook.Worksheets[0].Remove();
        //    IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
        //    sheetRequest.Range["A1"].ColumnWidth = 24;
        //    sheetRequest.Range["B1"].ColumnWidth = 24;
        //    sheetRequest.Range["C1"].ColumnWidth = 24;
        //    sheetRequest.Range["D1"].ColumnWidth = 24;
        //    sheetRequest.Range["E1"].ColumnWidth = 24;
        //    sheetRequest.Range["F1"].ColumnWidth = 24;
        //    //sheetRequest.Range["G1"].ColumnWidth = 24;
        //    //sheetRequest.Range["H1"].ColumnWidth = 24;
        //    //sheetRequest.Range["I1"].ColumnWidth = 24;
        //    //sheetRequest.Range["J1"].ColumnWidth = 24;
        //    //sheetRequest.Range["K1"].ColumnWidth = 24;


        //    sheetRequest.Range["A1:F1"].Merge(true);

        //    sheetRequest.Range["A1"].Text = "SẢN LƯỢNG TIÊU THỤ";
        //    sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
        //    sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
        //    sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
        //    sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
        //    sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

        //    sheetRequest.ImportData(listExport, 2, 1, true);

        //    sheetRequest["A2"].Text = "TT";
        //    sheetRequest["B2"].Text = "NPP/ĐL/CH";
        //    sheetRequest["C2"].Text = "KHU VỰC";
        //    sheetRequest["D2"].Text = "CHỦNG LOẠI";
        //    sheetRequest["E2"].Text = "THƯƠNG HIỆU";
        //    sheetRequest["F2"].Text = "SẢN LƯỢNG TIÊU THỤ (T)";
        //    //sheetRequest["G2"].Text = "TỒN KHO (T)";
        //    //sheetRequest["H2"].Text = "GIÁ MUA";
        //    //sheetRequest["I2"].Text = "GIÁ BÁN";
        //    //sheetRequest["J2"].Text = "NHÂN VIÊN";
        //    //sheetRequest["K2"].Text = "THỜI GIAN";


        //    IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
        //    tableHeader.Font.Color = ExcelKnownColors.White;
        //    tableHeader.Font.Bold = true;
        //    tableHeader.Font.Size = 11;
        //    tableHeader.Font.FontName = "Calibri";
        //    tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
        //    tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
        //    tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
        //    tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
        //    sheetRequest["A2:F2"].CellStyle = tableHeader;
        //    sheetRequest.Range["A2:F2"].RowHeight = 20;
        //    sheetRequest.UsedRange.AutofitColumns();

        //    string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        //    var fileName = "ExportSanLuong" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
        //    MemoryStream ms = new MemoryStream();
        //    workbook.SaveAs(ms);
        //    workbook.Close();
        //    excelEngine.Dispose();
        //    ms.Position = 0;
        //    return File(ms, ContentType, fileName);
        //}
    }

    //public class ReportStaticsPoCusPaymentExportModel
    //{
    //    public int No { get; set; }
    //    public string CustomerName { get; set; }
    //    public string Area { get; set; }
    //    public string ProductName { get; set; }
    //    public string BrandName { get; set; }
    //    public string ConsumpMonthly { get; set; }
    //}
    public class ReportStaticsPoCusPaymentGrid
    {
        public System.Int64 Id { get; set; }
        public string ContractCode { get; set; }
        public string Title { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public string ContractNo { get; set; }
        public string CusCode { get; set; }
        public decimal? ExchangeRate { get; set; }
        public decimal? RealBudget { get; set; }
        public decimal PaymentVnd { get; set; }
        public decimal RevenueAfterTaxVnd { get; set; }
        public decimal DebtVnd { get; set; }
        public string CusName { get; set; }
        public int CountTotal { get; set; }
        public decimal TotalRevenueAfterTaxVnd { get; set; }
        public decimal TotalPaymentVnd { get; set; }
        public decimal TotalDebtVnd { get; set; }
    }
}