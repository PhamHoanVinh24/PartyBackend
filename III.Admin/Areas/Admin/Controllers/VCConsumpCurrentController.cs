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

    public class VCConsumpCurrentController : BaseController
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
            //public string Staff { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string BrandCode { get; set; }
            public string DateSearch { get; set; }
        }
        public class JTableVCConsumpCurrentModelCustom : JTableModel
        {
            public string CustomerName { get; set; }
            public string Area { get; set; }
            //public string Staff { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ProductCode { get; set; }
            public string BrandCode { get; set; }
            public string DateSearch { get; set; }
        }
        public VCConsumpCurrentController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext,
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


        public object JTable([FromBody]JTableVCConsumpCurrentModelCustom jTablePara)
        {
            var count = 0;
            var intBeginFor = 1;
            try
            {
                var session = HttpContext.GetSessionUser();
                DateTime date = !string.IsNullOrEmpty(jTablePara.DateSearch) ? DateTime.ParseExact(jTablePara.DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                var startDateNow = new DateTime(date.Year, date.Month, 1);
                var startDateNext = new DateTime(date.Year, date.Month, 1);
                startDateNext = startDateNext.AddMonths(1);

                intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = new List<VCGroupCustomerCareModel>();
                var querySum = new List<SumReport>();

                if (session.UserType == 10)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@startRecord", "@endRecord" };
                    object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, intBeginFor + 1, intBeginFor + jTablePara.Length };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Paging_4_Admin", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode" };
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Sum_4_Admin", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else
                {
                    if (session.TypeStaff == 10)
                    {
                        string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@listArea", "@startRecord", "@endRecord" };
                        object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, session.Area, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Paging_4_Manager", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@listArea" };
                        object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, session.Area };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Sum_4_Manager", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                    else if (session.TypeStaff == 0)
                    {
                        string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@userName", "@startRecord", "@endRecord" };
                        object[] val = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, session.UserName, intBeginFor + 1, intBeginFor + jTablePara.Length };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Paging_4_User", param, val);
                        query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);


                        string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@userName" };
                        object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, session.UserName };
                        DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Sum_4_User", param1, val1);
                        querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                    }
                }

                count = querySum.Select(x => x.Count).FirstOrDefault();
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "CusName", "AreaName", "ProductName", "BrandName", "ConsumpMonthly"); //, "Note"
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
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNext = new DateTime(date.Year, date.Month, 1);
            startDateNext = startDateNext.AddMonths(1);

            List<SumReport> querySum = new List<SumReport>();

            if (session.UserType == 10)
            {
                string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode" };
                object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode };
                DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Sum_4_Admin", param1, val1);
                querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@listArea" };
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, session.Area };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Sum_4_Manager", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param1 = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@userName" };
                    object[] val1 = new object[] { jTablePara.CustomerName, jTablePara.Area, startDateNext, startDateNow, jTablePara.ProductCode, jTablePara.BrandCode, session.UserName };
                    DataTable rs1 = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Sum_4_User", param1, val1);
                    querySum = CommonUtil.ConvertDataTable<SumReport>(rs1);
                }
            }

            var sumConsumpMonthly = querySum.Select(x => x.SumConsumpMonthly).FirstOrDefault();
            var rs = new { SumConsumpMonthly = sumConsumpMonthly };
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
            return GetListBrandFunc();
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
        public ActionResult ExportExcel(string page, string row, string customerName, string areaExport, string productCode, string brandCode, string fromDate, string toDate, string dateSearch, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            var intBeginFor = 1;
            var session = HttpContext.GetSessionUser();
            intBeginFor = (pageInt - 1) * length;

            var date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNext = new DateTime(date.Year, date.Month, 1);
            startDateNext = startDateNext.AddMonths(1);

            var query = new List<VCGroupCustomerCareModel>();

            if (session.UserType == 10)
            {
                string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@startRecord", "@endRecord", "@allData" };
                object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, productCode, brandCode, intBeginFor + 1, intBeginFor + length, 0 };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Export_4_Admin", param, val);
                query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@listArea", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, productCode, brandCode, session.Area, intBeginFor + 1, intBeginFor + length, 0 };

                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Export_4_Manager", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
                else if (session.TypeStaff == 0)
                {
                    string[] param = new string[] { "@cusCode", "@areaCode", "@startDateNext", "@startDateNow", "@productCode", "@brandCode", "@userName", "@startRecord", "@endRecord", "@allData" };
                    object[] val = new object[] { customerName, areaExport, startDateNext, startDateNow, productCode, brandCode, session.UserName, intBeginFor + 1, intBeginFor + length, 0 };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_Get_Consump_Search_Export_4_User", param, val);
                    query = CommonUtil.ConvertDataTable<VCGroupCustomerCareModel>(rs);
                }
            }

            //var listData = FuncJTable(CustomerName, Area, Staff, ProductCode, BrandCode, FromDate, ToDate).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
            var listExport = new List<VCConsumpCurrentExportModel>();
            var no = 1;
            foreach (var item in query)
            {
                var itemExport = new VCConsumpCurrentExportModel();
                itemExport.No = no;
                itemExport.CustomerName = item.CusName;
                itemExport.Area = item.AreaName;
                itemExport.ProductName = item.ProductName;
                itemExport.BrandName = item.BrandName;
                itemExport.ConsumpMonthly = item.ConsumpMonthly.ToString();
                //itemExport.BuyCost = item.BuyCost.ToString();
                //itemExport.SaleCost = item.SaleCost.ToString();
                //itemExport.Staff = item.Staff;
                //itemExport.CreatedTime = item.CreatedTime != null ? item.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "";

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
            IWorksheet sheetRequest = workbook.Worksheets.Create("SanLuong");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            //sheetRequest.Range["G1"].ColumnWidth = 24;
            //sheetRequest.Range["H1"].ColumnWidth = 24;
            //sheetRequest.Range["I1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;
            //sheetRequest.Range["K1"].ColumnWidth = 24;


            sheetRequest.Range["A1:F1"].Merge(true);

            sheetRequest.Range["A1"].Text = "SẢN LƯỢNG TIÊU THỤ";
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
            //sheetRequest["G2"].Text = "TỒN KHO (T)";
            //sheetRequest["H2"].Text = "GIÁ MUA";
            //sheetRequest["I2"].Text = "GIÁ BÁN";
            //sheetRequest["J2"].Text = "NHÂN VIÊN";
            //sheetRequest["K2"].Text = "THỜI GIAN";


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
            sheetRequest["A2:F2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:F2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportSanLuong" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        ////hàm cũ
        //[NonAction]
        //public IQueryable<VCConsumpCurrentModel> FuncJTable(string CustomerName, string Area, string Staff, string ProductCode, string BrandCode, string FromDate, string ToDate, string DateSearch)
        //{
        //    //DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    //DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    DateTime dateSearch = !string.IsNullOrEmpty(DateSearch) ? DateTime.ParseExact(DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

        //    var startDateNow = new DateTime(dateSearch.Year, dateSearch.Month, 1);
        //    var startDateNex = new DateTime(dateSearch.Year, dateSearch.Month, 1);
        //    startDateNex = startDateNex.AddMonths(1);

        //    var session = HttpContext.GetSessionUser();
        //    var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

        //    var query = (from e in _context.VcCustomerCares.Where(x => x.IsDeleted != true)
        //                                    .AsNoTracking().Select(x => new { x.Id, x.ProductCode, x.BrandCode, x.RouteCode, x.CreatedTime, x.ConsumpMonthly, x.Instock, x.BuyCost, x.SaleCost, x.CreatedBy })
        //                 join f1 in _context.VcProductCats.Where(x => x.IsDeleted != true)
        //                                    .AsNoTracking().Select(x => new { x.ProductCode, x.ProductName }) on e.ProductCode equals f1.ProductCode into f2
        //                 from f in f2.DefaultIfEmpty()
        //                 join g1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND")
        //                                    .AsNoTracking().Select(x => new { x.CodeSet, x.ValueSet }) on e.BrandCode equals g1.CodeSet into g2
        //                 from g in g2.DefaultIfEmpty()
        //                 join a in _context.VcSettingRoutes
        //                                    .Where(x => x.IsDeleted != true && x.CurrentStatus == "ROUTE_DONE" && (x.CreatedTime >= startDateNow) && (x.CreatedTime < startDateNex))
        //                                    .AsNoTracking().Select(x => new { x.Node, x.Note, x.RouteCode }) on e.RouteCode equals a.RouteCode
        //                 join b1 in _context.Users
        //                                    .AsNoTracking().Select(x => new { x.UserName, x.Area, x.GivenName }) on e.CreatedBy equals b1.UserName into b2
        //                 from b in b2.DefaultIfEmpty()
        //                 join d in _context.Customerss.Where(x => x.IsDeleted == false)
        //                                    .AsNoTracking().Select(x => new { x.CusCode, x.Area, x.CusName }) on a.Node equals d.CusCode
        //                 join c1 in _context.CommonSettings.Where(x => x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area))
        //                                    .AsNoTracking().Select(x => new { x.CodeSet, x.ValueSet }) on d.Area equals c1.CodeSet into c2
        //                 from c in c2.DefaultIfEmpty()
        //                 where
        //                 (string.IsNullOrEmpty(CustomerName) || (d != null && !string.IsNullOrEmpty(d.CusName) && d.CusName.ToLower().Contains(CustomerName.ToLower())))
        //                 && (string.IsNullOrEmpty(Area) || (c != null && !string.IsNullOrEmpty(c.CodeSet) && c.CodeSet == Area))
        //                 && (string.IsNullOrEmpty(Staff) || (b != null && !string.IsNullOrEmpty(b.GivenName) && b.GivenName.ToLower().Contains(Staff.ToLower()))
        //                                                 || (!string.IsNullOrEmpty(e.CreatedBy) && e.CreatedBy.ToLower().Contains(Staff.ToLower())))
        //                 && (string.IsNullOrEmpty(ProductCode) || (!string.IsNullOrEmpty(e.ProductCode) && e.ProductCode == ProductCode))
        //                 && (string.IsNullOrEmpty(BrandCode) || (!string.IsNullOrEmpty(e.BrandCode) && e.BrandCode == BrandCode))
        //                 //&& (string.IsNullOrEmpty(FromDate) || (a.CreatedTime >= fromDate))
        //                 //&& (string.IsNullOrEmpty(ToDate) || (a.CreatedTime <= toDate))

        //                 && (session.UserType == 10 ||
        //                    (session.TypeStaff == 10 && listArea.Any(y => !string.IsNullOrEmpty(y) && b != null && y == b.Area)) ||
        //                    (session.TypeStaff == 0 && a != null && e.CreatedBy == session.UserName))
        //                 group new { a, b, c, d, e, f, g } by new { d.CusName, e.ProductCode, e.BrandCode }
        //                 into grp
        //                 orderby grp.Key.CusName, grp.Key.BrandCode, grp.Key.ProductCode
        //                 select new VCConsumpCurrentModel
        //                 {
        //                     Id = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).e.Id,
        //                     CustomerName = grp.Key.CusName,
        //                     Area = grp.Select(x => x.c).First() != null ? grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).c.ValueSet : null,
        //                     ProductCode = grp.Key.ProductCode,
        //                     ProductName = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).f.ProductName,
        //                     BrandCode = grp.Key.BrandCode,
        //                     BrandName = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).g.ValueSet,
        //                     ConsumpMonthly = grp.Where(x1 => x1.e.CreatedTime <= grp.Max(y1 => y1.e.CreatedTime) && x1.e.CreatedTime >= startDateNow).Sum(y => y.e.ConsumpMonthly),
        //                     //ConsumpMonthly = grp.Where(x1 => x1.e.CreatedTime <= grp.Max(y1 => y1.e.CreatedTime) && x1.e.CreatedTime >= new DateTime(grp.Max(y1 => y1.e.CreatedTime).Year, grp.Max(y1 => y1.e.CreatedTime).Month, 1)).Sum(y => y.e.ConsumpMonthly),
        //                     Instock = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).e.Instock,
        //                     BuyCost = grp.FirstOrDefault().e.BuyCost,
        //                     SaleCost = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).e.SaleCost,
        //                     Staff = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).b.GivenName,
        //                     CreatedTime = grp.Max(x1 => x1.e.CreatedTime),
        //                     Note = grp.FirstOrDefault(x1 => x1.e.CreatedTime == grp.Max(y1 => y1.e.CreatedTime)).a.Note,
        //                 }).OrderByDescending(x => x.CreatedTime);
        //    return query;
        //}

        //[NonAction]
        //public IQueryable<VCConsumpCurrentModel> FuncJTable(string CustomerName, string Area, string ProductCode, string BrandCode, string FromDate, string ToDate, string DateSearch)
        //{
        //    //DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    //DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    DateTime date = !string.IsNullOrEmpty(DateSearch) ? DateTime.ParseExact(DateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

        //    var session = HttpContext.GetSessionUser();
        //    var listArea = GetListAreaFunc(session);

        //    //Lấy ra list bản ghi hoàn thành TRONG THÁNG HIỆN TẠI HOẶC NHẬP VÀO của các cửa hàng => Lấy được LIST SettingRouteCode TRONG THÁNG (mỗi khách hàng là 1 LIST)
        //    //Join với bảng Customer_Care & group theo khách hàng && Branch && Product => GROUP Lấy được tổng SẢN LƯỢNG các sản phẩm CỦA TẤT CẢ BẢN GHI TRONG THÁNG của cửa hàng
        //    var listSettingRoutesInMonth = GetListSettingRoutesInMonthFunc(session, date);

        //    var query1 = (from c in listArea
        //                  join d in _context.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
        //                                    .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
        //                  join a in listSettingRoutesInMonth
        //                                    on d.CusCode equals a.Node
        //                  join e in _context.VcCustomerCares.Where(x => x.IsDeleted != true).AsNoTracking()
        //                                     .Select(x => new { x.Id, x.ProductCode, x.BrandCode, x.RouteCode, x.ConsumpMonthly })
        //                                     on a.RouteCode equals e.RouteCode
        //                  join f in _context.VcProductCats.Where(x => x.IsDeleted != true)
        //                                     .AsNoTracking().Select(x => new { x.ProductCode, x.ProductName }) on e.ProductCode equals f.ProductCode
        //                  join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "VC_BRAND")
        //                                     .AsNoTracking().Select(x => new { x.CodeSet, x.ValueSet }) on e.BrandCode equals g.CodeSet
        //                  //join b in _context.Users
        //                  //                  .AsNoTracking().Select(x => new { x.UserName, x.GivenName }) on e.CreatedBy equals b.UserName
        //                  group new { c, d, e, f, g, a } by new { d.CusCode, e.ProductCode, e.BrandCode }
        //                  into grp
        //                  select new VCConsumpCurrentModel
        //                  {
        //                      AreaName = grp.FirstOrDefault().c.Name,
        //                      Area = grp.FirstOrDefault().c.Code,
        //                      CusCode = grp.Key.CusCode,
        //                      CustomerName = grp.FirstOrDefault().d.CusName,
        //                      ProductCode = grp.Key.ProductCode,
        //                      BrandCode = grp.Key.BrandCode,
        //                      ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly),
        //                      CreatedTime = grp.FirstOrDefault().a.CreatedTime,

        //                      Id = grp.FirstOrDefault().e.Id,
        //                      //BuyCost = grp.FirstOrDefault().e.BuyCost,
        //                      //SaleCost = grp.FirstOrDefault().e.SaleCost,
        //                      //CreatedBy = grp.FirstOrDefault().e.CreatedBy,

        //                      //Note = grp.FirstOrDefault().a.Note,
        //                      ProductName = grp.FirstOrDefault().f.ProductName,
        //                      BrandName = grp.FirstOrDefault().g.ValueSet,
        //                      //Staff = grp.FirstOrDefault().b.GivenName,
        //                  });

        //    var query = (from e in query1.Where(x => ((string.IsNullOrEmpty(CustomerName) || (!string.IsNullOrEmpty(x.CusCode) && x.CusCode == CustomerName))
        //                                            && (string.IsNullOrEmpty(Area) || (!string.IsNullOrEmpty(x.Area) && x.Area == Area))
        //                                            //&& (string.IsNullOrEmpty(Staff) || (!string.IsNullOrEmpty(x.Staff) && x.Staff.ToLower().Contains(Staff.ToLower()))
        //                                            //                                || (!string.IsNullOrEmpty(x.CreatedBy) && x.CreatedBy.ToLower().Contains(Staff.ToLower())))
        //                                            && (string.IsNullOrEmpty(ProductCode) || (!string.IsNullOrEmpty(x.ProductCode) && x.ProductCode == ProductCode))
        //                                            && (string.IsNullOrEmpty(BrandCode) || (!string.IsNullOrEmpty(x.BrandCode) && x.BrandCode == BrandCode))))
        //                 select new VCConsumpCurrentModel
        //                 {
        //                     //AreaName = e.AreaName,
        //                     Area = e.AreaName,
        //                     CustomerName = e.CustomerName,
        //                     ConsumpMonthly = e.ConsumpMonthly,

        //                     Id = e.Id,
        //                     ProductCode = e.ProductCode,
        //                     BrandCode = e.BrandCode,
        //                     //BuyCost = e.BuyCost,
        //                     //SaleCost = e.SaleCost,
        //                     //CreatedBy = e.CreatedBy,
        //                     CreatedTime = e.CreatedTime,

        //                     //Note = e.Note,
        //                     ProductName = e.ProductName,
        //                     BrandName = e.BrandName,
        //                     //Staff = e.Staff,
        //                 });
        //    return query;
        //}

        //[HttpGet]
        //public object GetItem(int id)
        //{
        //    try
        //    {

        //        var user = _context.Maintain_material_detailss.Single(x => x.Id == id);

        //        var temp = new
        //        {
        //            user.Id,
        //            user.ProductCode,
        //            user.ProductName,
        //            user.Create_time,
        //            user.Description,
        //            user.Image,
        //            user.Quantity,
        //            user.Brand,
        //            user.Status,
        //            user.BarCode,
        //            user.Price,
        //            user.Update_time

        //        };

        //        return Json(temp);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
        //    }
        //}


        //[HttpPost]
        //public JsonResult Update([FromBody]Maintain_material_details obj)
        //{
        //    var CusCode = HttpContext.GetSessionUser()?.CompanyCode;
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {

        //        Maintain_material_details obj2 = _context.Maintain_material_detailss.FirstOrDefault(x => x.Id == obj.Id);
        //        if (obj2 != null)
        //        {
        //            obj2.ProductCode = obj.ProductCode;
        //            obj2.ProductName = obj.ProductName;
        //            obj2.Status = obj.Status;
        //            obj2.BarCode = obj.BarCode;
        //            obj2.Brand = obj.Brand;
        //            obj2.Price = obj.Price;
        //            obj2.Quantity = obj.Quantity;
        //            obj2.Description = obj.Description;
        //            obj2.CusCode = CusCode;
        //            obj2.Update_time = DateTime.Now;

        //            _context.Maintain_material_detailss.Update(obj2);
        //            _context.Entry(obj2).State = EntityState.Modified;
        //        }

        //        var a = _context.SaveChanges();
        //        msg.Title = "Sửa khoản mục thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi sửa khoản mục";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public object DeleteChecked([FromBody]List<int> listIdI)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {



        //        foreach (var id in listIdI)
        //        {
        //            Maintain_material_details obj = _context.Maintain_material_detailss.FirstOrDefault(x => x.Id == id);
        //            if (obj != null)
        //            {
        //                obj.Flag = 1;
        //                _context.Maintain_material_detailss.Update(obj);
        //                _context.SaveChanges();
        //            }
        //        }
        //        msg.Title = "Xóa sản phẩm thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
        //        //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public object LockProduct([FromBody]int id)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {


        //        Maintain_material_details obj = _context.Maintain_material_detailss.FirstOrDefault(x => x.Id == id);
        //        if (obj != null)
        //        {
        //            obj.Status = (obj.Status == 1 ? 2 : 1);

        //            _context.Maintain_material_detailss.Update(obj);
        //            _context.SaveChanges();
        //        }

        //        msg.Title = "Thay đổi trạng thái sản phẩm thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
        //        //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

        //    }
        //    return Json(msg);
        //}


        //[HttpPost]
        //public JsonResult Insert([FromBody]Maintain_material_details obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    var CusCode = HttpContext.GetSessionUser()?.CompanyCode;
        //    try
        //    {
        //        Maintain_material_details rm = new Maintain_material_details
        //        {
        //            ProductCode = obj.ProductName,
        //            ProductName = obj.ProductName,
        //            Status = obj.Status,
        //            BarCode = obj.BarCode,
        //            Brand = obj.Brand,
        //            Price = obj.Price,
        //            Quantity = obj.Quantity,
        //            Description = obj.Description,
        //            CusCode = CusCode,
        //            Create_time = DateTime.Now

        //        };
        //        _context.Maintain_material_detailss.Add(rm);
        //        var a = _context.SaveChanges();
        //        msg.Title = "Thêm sản phẩm thành công";
        //        msg.Object = obj;
        //        msg.ID = 1;

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.ID = 0;
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi khi thêm khoản mục";
        //    }
        //    return Json(msg);
        //}        
    }


    public class VCConsumpCurrentModel
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string CusCode { get; set; }
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
    public class VCConsumpCurrentExportModel
    {
        public int No { get; set; }
        public string CustomerName { get; set; }
        public string Area { get; set; }
        public string ProductName { get; set; }
        public string BrandName { get; set; }
        public string ConsumpMonthly { get; set; }
        //public string Instock { get; set; }
        //public string BuyCost { get; set; }
        //public string SaleCost { get; set; }
        //public string Staff { get; set; }
        //public string CreatedTime { get; set; }
    }
}