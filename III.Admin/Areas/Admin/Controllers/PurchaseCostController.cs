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
    public class PurchaseCostController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<PurchaseCostController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public PurchaseCostController(EIMDBContext context, IStringLocalizer<PurchaseCostController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public class JTableModelPurchaseCost : JTableModel
        {
            //public string CusCode { get; set; }
            //public string StoreCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }

        }
        [Breadcrumb("ViewData.CrumbPurcharCost", AreaName = "Admin", FromAction = "Index", FromController = typeof(ReportWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbRptWHHome"] = _sharedResources["COM_CRUMB_RPT_WARE_HOUSE"];
            ViewData["CrumbPurcharCost"] = _sharedResources["COM_CRUMB_PURCHARE_COST"];
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableModelPurchaseCost jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(jTablePara.FromDate, jTablePara.ToDate);

                var count = query.Count();
                //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CostTotal", "Currency", "CurrencyName", "Discount", "Commission", "TaxTotal", "TimeTicketCreate");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<PurchaseCostModel>(), jTablePara.Draw, 0, "Id", "CostTotal", "Currency", "CurrencyName", "Discount", "Commission", "TaxTotal", "TimeTicketCreate");
                return Json(jdata);
            }
        }
        [NonAction]
        public IQueryable<PurchaseCostModel> FuncJTable(string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProdReceivedHeaders.Where(x => x.IsDeleted != true && x.Reason == "IMP_FROM_BUY").AsNoTracking()
                         join b in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.TicketCode equals b.TicketCode
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON") on a.Reason equals e.CodeSet
                         join g in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Currency equals g.CodeSet
                         where
                         //(string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate <= fromDate))
                         //&& (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate >= toDate))
                                  ((fromDate == null) || (a.TimeTicketCreate.HasValue && a.TimeTicketCreate.Value.Date >= fromDate))
                                     && ((toDate == null) || (a.TimeTicketCreate.HasValue && a.TimeTicketCreate.Value.Date <= toDate))
                         select new PurchaseCostModel
                         {
                             Id = a.Id,
                             //CostTotal = a.CostTotal,
                             CostTotal = b.SalePrice,
                             Currency = b.Currency,
                             CurrencyName = g.ValueSet,
                             Discount = a.Discount,
                             Commission = a.Commission,
                             TaxTotal = a.TaxTotal,
                             TimeTicketCreate = a.TimeTicketCreate,
                         });
            

            var results = from p in query
                          group p by new { p.TimeTicketCreate, p.Currency } into g
                          orderby g.Key.TimeTicketCreate descending
                          select new PurchaseCostModel
                          {
                              Id = g.FirstOrDefault().Id,
                              CostTotal = g.Sum(x => x.CostTotal),
                              Currency = g.Key.Currency,
                              CurrencyName = g.FirstOrDefault().CurrencyName,
                              Discount = g.Sum(x => x.Discount),
                              Commission = g.Sum(x => x.Commission),
                              TaxTotal = g.Sum(x => x.TaxTotal),
                              TimeTicketCreate = g.Key.TimeTicketCreate,
                          };

            return results;
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableModelPurchaseCost jTablePara)
        {
            var query = FuncJTable(jTablePara.FromDate, jTablePara.ToDate).ToList();
            foreach (var item in query)
            {
                if (item.Currency != "VND")
                {
                    var rateChange = _context.FundExchagRates.FirstOrDefault(x => x.Currency.ToLower().Equals(item.Currency.ToLower()));
                    if (rateChange != null)
                    {
                        item.CostTotal = item.CostTotal * rateChange.Rate;
                    }
                }
            }

            var sumCostTotal = query.Sum(x => x.CostTotal);
            var sumDiscount = query.Sum(x => x.Discount);
            var sumCommission = query.Sum(x => x.Commission);
            var sumTaxTotal = query.Sum(x => x.TaxTotal);

            var rs = new { totalCostTotal = sumCostTotal, totalDiscount = sumDiscount, totalCommission = sumCommission, totalTaxTotal = sumTaxTotal };
            return Json(rs);
        }


        [HttpGet]
        public ActionResult ExportExcel(string FromDate, string ToDate)
        {
            //int pageInt = int.Parse(page);
            //int length = int.Parse(row);
            //Get data View
            var listData = FuncJTable(FromDate, ToDate).AsNoTracking().ToList();
            var listExport = new List<PurchaseCostExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new PurchaseCostExportModel();
                itemExport.No = no;
                itemExport.TimeTicketCreate = item.TimeTicketCreate != null ? item.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "";
                itemExport.CurrencyName = item.CurrencyName;
                itemExport.CostTotal = item.CostTotal;
                itemExport.Discount = item.Discount;
                itemExport.Commission = item.Commission;
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
            IWorksheet sheetRequest = workbook.Worksheets.Create("TienMuaHang");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            //sheetRequest.Range["H1"].ColumnWidth = 24;
            //sheetRequest.Range["I1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:G1"].Merge(true);

            sheetRequest.Range["A1"].Text = "TIỀN MUA HÀNG";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NGÀY TẠO PHIẾU";
            sheetRequest["C2"].Text = "TIỀN TỆ";
            sheetRequest["D2"].Text = "TỔNG TIỀN";
            sheetRequest["E2"].Text = "CHIẾU KHẤU";
            sheetRequest["F2"].Text = "HOA HỒNG";
            sheetRequest["G2"].Text = "THUẾ";


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
            var fileName = "ExportTienMuaHang" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
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
        public class PurchaseCostModel
        {
            public int Id { get; set; }
            //public string CusCode { get; set; }
            //public string CusName { get; set; }
            //public string StoreCode { get; set; }
            //public string StoreName { get; set; }
            //public string UserExport { get; set; }
            //public string UserExportName { get; set; }
            public decimal? CostTotal { get; set; }
            public string Currency { get; set; }
            public string CurrencyName { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            //public decimal? TotalPayed { get; set; }
            //public decimal? TotalMustPayment { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
        }

        public class PurchaseCostExportModel
        {
            public int No { get; set; }
            //public string CusCode { get; set; }
            //public string CusName { get; set; }
            //public string StoreCode { get; set; }
            //public string StoreName { get; set; }
            //public string UserExport { get; set; }
            //public string UserExportName { get; set; }
            public string TimeTicketCreate { get; set; }
            public string CurrencyName { get; set; }
            public decimal? CostTotal { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
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