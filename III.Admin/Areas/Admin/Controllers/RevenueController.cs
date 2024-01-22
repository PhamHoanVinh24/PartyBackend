using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using System.IO;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RevenueController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<RevenueController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public RevenueController(EIMDBContext context, IStringLocalizer<RevenueController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        //{
        //    _context = context;
        //}
        public class JTableModelRevenue : JTableModel
        {
            //public string CusCode { get; set; }
            //public string StoreCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }

        }
        [Breadcrumb("ViewData.CrumbRevenue", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbRevenue"] = _sharedResources["COM_CRUMB_REVENUE"];
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableModelRevenue jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                var data1 = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var data = data1.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ContractTitle", "ContractNo", "Currency", "CurrencyName", "Budget", "RealBudget", "TaxTotal", "BudgetExcludeTax", "TimeTicketCreate");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<RevenueModel>(), jTablePara.Draw, 0, "Id", "ContractTitle", "ContractNo", "Currency", "CurrencyName", "Budget", "RealBudget", "TaxTotal", "BudgetExcludeTax", "TimeTicketCreate");
                return Json(jdata);
            }
        }
        [NonAction]
        public IQueryable<RevenueModel> FuncJTable(string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            //var query = (from a in_context.ProdDeliveryHeaders.Where(x => !x.IsDeleted).AsNoTracking()
            var query = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted).AsNoTracking()
                             //join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals c.WHS_Code
                             //join d in _context.Users.Where(x => x.Active) on a.UserExport equals d.UserName
                             //join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON") on a.Reason equals e.CodeSet into e1
                             //from e2 in e1.DefaultIfEmpty()
                         join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)) on a.Currency equals g.CodeSet into g1
                         from g2 in g1.DefaultIfEmpty()
                             //join b in _context.Customerss.Where(x => x.IsDeleted != true) on a.CusCode equals b.CusCode into b1
                             //from b2 in b1.DefaultIfEmpty()
                         where
                         //(string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
                         //&& (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                         //&& 
                         (string.IsNullOrEmpty(FromDate) || (a.EffectiveDate >= fromDate))
                         && (string.IsNullOrEmpty(ToDate) || (a.EffectiveDate <= toDate))
                         select new RevenueModel
                         {
                             Id = a.ContractHeaderID,
                             //CusCode = a.CusCode,
                             //CusName = b2 != null ? b2.CusName : "",
                             //StoreCode = a.StoreCode,
                             //StoreName = c.WHS_Code,
                             //UserExport = a.UserExport,
                             //UserExportName = d.GivenName,
                             //CostTotal = a.BudgetExcludeTax,
                             Currency = a.Currency,
                             CurrencyName = g2.ValueSet,
                             Discount = 0,
                             Commission = 0,
                             //TotalPayed = a.TotalPayed,
                             //TotalMustPayment = a.TotalMustPayment,
                             TimeTicketCreate = a.EffectiveDate,
                             ContractTitle = a.Title,
                             ContractNo = a.ContractNo,
                             Budget = a.Budget,//Tổng tiền trước thuế
                             RealBudget = a.RealBudget,//Tổng tiền sau thuế
                             TaxTotal = a.RealBudget - a.Budget,//Tổng thuế= Tổng tiền sau thuế - Tổng tiền trước thuế
                             BudgetExcludeTax = a.RealBudget * a.ExchangeRate // Tổng tiền đã quy đổi
                         });

            //var results = from p in query
            //              group p by new { p.TimeTicketCreate, p.Currency } into g
            //              orderby g.Key.TimeTicketCreate descending
            //              select new RevenueModel
            //              {
            //                  Id = g.FirstOrDefault().Id,
            //                  CostTotal = g.Sum(x => x.CostTotal),
            //                  Currency = g.Key.Currency,
            //                  CurrencyName = g.FirstOrDefault().CurrencyName,
            //                  Discount = g.Sum(x => x.Discount),
            //                  Commission = g.Sum(x => x.Commission),
            //                  TaxTotal = g.Sum(x => x.TaxTotal),
            //                  TimeTicketCreate = g.Key.TimeTicketCreate,
            //              };

            return query;
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableModelRevenue jTablePara)
        {
            var query = FuncJTable(jTablePara.FromDate, jTablePara.ToDate).ToList();
            foreach(var item in query)
            {
                if (item.Currency != "VND")
                {
                    var rateChange = _context.FundExchagRates.FirstOrDefault(x => x.Currency.ToLower().Equals(item.Currency.ToLower()));
                    if (rateChange != null)
                    {
                        item.Budget = item.Budget * rateChange.Rate;
                        item.RealBudget = item.RealBudget * rateChange.Rate;
                        item.TaxTotal = item.TaxTotal * rateChange.Rate;
                        item.BudgetExcludeTax = item.BudgetExcludeTax * rateChange.Rate;
                    }
                }
            }

            var sumBugetTotal = query.Sum(x => x.Budget);
            var sumRealBuget = query.Sum(x => x.RealBudget);
            var sumBudgetExcludeTax = query.Sum(x => x.BudgetExcludeTax);
            //var sumCommission = query.Sum(x => x.Commission);
            var sumTaxTotal = query.Sum(x => x.TaxTotal);

            var rs = new { totalBuget = sumBugetTotal, totalRealBuget = sumRealBuget, totalBudgetExcludeTax = sumBudgetExcludeTax, totalTaxTotal = sumTaxTotal };
            return Json(rs);
        }


        [HttpGet]
        public ActionResult ExportExcel(string FromDate, string ToDate)
        {
            //int pageInt = int.Parse(page);
            //int length = int.Parse(row);
            //Get data View
            var listData = FuncJTable(FromDate, ToDate).AsNoTracking().ToList();
            var listExport = new List<RevenueExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new RevenueExportModel();
                itemExport.No = no;
                itemExport.TimeTicketCreate = item.TimeTicketCreate != null ? item.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "";
                itemExport.CurrencyName = item.CurrencyName;
                //itemExport.CostTotal = item.CostTotal;
                //itemExport.Discount = item.Discount;
                //itemExport.ToDate = item.ToDate != null ? item.ToDate.ToString("dd/MM/yyyy") : "";
                //itemExport.Commission = item.Commission;
                //itemExport.Budget = item.Budget;
                itemExport.ContractTitle = item.ContractTitle;
                itemExport.ContractNo = item.ContractNo;
                itemExport.RealBudget = item.RealBudget;
                itemExport.RealBudget = item.RealBudget;
                itemExport.BudgetExcludeTax = item.BudgetExcludeTax;
                itemExport.TaxTotal = item.TaxTotal;
                //itemExport.Percent = item.Percent.ToString();

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
            IWorksheet sheetRequest = workbook.Worksheets.Create("DoanhThuBanHang");
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
            //sheetRequest.Range["I1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:H1"].Merge(true);

            sheetRequest.Range["A1"].Text = "DOANH THU BÁN HÀNG";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NGÀY HIỆU LỰC";
            sheetRequest["C2"].Text = "TÊN HỢP ĐỒNG";
            sheetRequest["D2"].Text = "SỐ HỢP ĐỒNG";
            sheetRequest["E2"].Text = "TIỀN TỆ";
            sheetRequest["F2"].Text = "TỔNG TIỀN SAU THUẾ CHƯA QUY ĐỔI";
            sheetRequest["G2"].Text = "TỔNG TIỀN SAU THUẾ ĐÃ QUY ĐỔI(VNĐ)";
            sheetRequest["H2"].Text = "THUẾ";


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
            var fileName = "ExportDoanhThuBanHang" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        #region Get thông tin chung
        //[HttpPost]
        //public object GetListStore()
        //{
        //    var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").OrderBy(x => x.WHS_Name).Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
        //    return rs;
        //}
        //[HttpPost]
        //public object GetListCustomer()
        //{
        //    var rs = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "ACTIVE").OrderBy(x => x.CusName).Select(x => new { Code = x.CusCode, Name = x.CusName });
        //    return rs;
        //}
        //[HttpPost]
        //public object GetListUserExport()
        //{
        //    var rs = _context.Users.Where(x => x.Active && x.UserName != "admin").OrderBy(x => x.GivenName).Select(x => new { Code = x.UserName, Name = x.GivenName });
        //    return rs;
        //}
        //[HttpPost]
        //public object GetListCurrency()
        //{
        //    var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        //    return rs;
        //}
        #endregion

        #region Khu vực các model
        public class RevenueModel
        {
            public int Id { get; set; }
            //public string CusCode { get; set; }
            //public string CusName { get; set; }
            //public string StoreCode { get; set; }
            //public string StoreName { get; set; }
            //public string UserExport { get; set; }
            //public string UserExportName { get; set; }
            public string ContractTitle { get; set; }
            public string ContractNo { get; set; }
            public decimal? CostTotal { get; set; }
            public string Currency { get; set; }
            public string CurrencyName { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            //public decimal? TotalPayed { get; set; }
            //public decimal? TotalMustPayment { get; set; }
            public DateTime? TimeTicketCreate { get; set; }

            public decimal? RealBudget { get; set; }//Tổng tiền sau thuế
            public decimal? Budget { get; set; }//Tổng tiền trước thuế
            public decimal? BudgetExcludeTax { get; set; }//Tiền đã quy đổi (VNĐ)

        }

        public class RevenueExportModel
        {
            public int No { get; set; }
            //public string CusCode { get; set; }
            //public string CusName { get; set; }
            //public string StoreCode { get; set; }
            //public string StoreName { get; set; }
            //public string UserExport { get; set; }
            //public string UserExportName { get; set; }
            public string TimeTicketCreate { get; set; }
            public string ContractTitle { get; set; }
            public string ContractNo { get; set; }
            public string CurrencyName { get; set; }
            public decimal? RealBudget { get; set; }//Tổng tiền sau thuế
            //public decimal? Budget { get; set; }//Tổng tiền trước thuế
            public decimal? BudgetExcludeTax { get; set; }//Tiền đã quy đổi (VNĐ)
            //public decimal? CostTotal { get; set; }
            //public decimal? Discount { get; set; }
            //public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            //public decimal? TotalPayed { get; set; }
            //public decimal? TotalMustPayment { get; set; }
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