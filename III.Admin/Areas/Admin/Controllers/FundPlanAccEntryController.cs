using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using ESEIM;
using III.Domain.Enums;
using System.Collections.Generic;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundPlanAccEntryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<FundPlanAccEntryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public FundPlanAccEntryController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<FundPlanAccEntryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbFundPlan", AreaName = "Admin", FromAction = "Index", FromController = typeof(FundsHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuFinance"] = _sharedResources["COM_CRUMB_MENU_FINANCE"];
            ViewData["CrumbFundHome"] = _sharedResources["COM_CRUMB_FUND_HOME"];
            ViewData["CrumbFundPlan"] = _sharedResources["COM_CRUMB_FUND_PLAN"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelAct jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromTime) ? DateTime.ParseExact(jTablePara.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToTime) ? DateTime.ParseExact(jTablePara.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            string Currency = jTablePara.Currency;
            var query = from a in _context.FundAccEntrys
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false) on a.CatCode equals b.CatCode
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_FUND")) on a.StatusObject equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where (!a.IsDeleted && a.IsPlan == true
                                   && (string.IsNullOrEmpty(jTablePara.AetType) || (a.AetType.Equals(jTablePara.AetType)))
                                  && ((fromDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date >= fromDate))
                                  && ((toDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date <= toDate))
                                  && (string.IsNullOrEmpty(jTablePara.Status) || (a.StatusObject.Equals(jTablePara.Status)))
                                  && (string.IsNullOrEmpty(jTablePara.Payer) || a.Payer.Contains(jTablePara.Payer))
                                  && ((string.IsNullOrEmpty(jTablePara.CatCode) || a.CatCode.Equals(jTablePara.CatCode))))
                        select new
                        {
                            CatName = b.CatName,
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            Total = a.Total,
                            Payer = a.Payer,
                            Currency = a.Currency,
                            IsPlan = a.IsPlan.Value,
                            //Status = _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(a => a.Id).Action,
                            //  Status = _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id) != null ? _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id).Action : "",
                            Status = a.Status,
                            StatusObject = c != null ? c.ValueSet : "",
                            Receiptter = a.Receiptter,
                            Deadline = a.DeadLine.Value,
                            Type = a.IsCompleted == true ? 4 : a.DeadLine.Value < DateTime.Today ? 1 : a.DeadLine.Value == DateTime.Today ? 2 : 3,

                        };
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Type", "Id", "AetCode", "Title", "AetType", "AetDescription", "Total", "Payer", "Receiptter", "Deadline", "Currency", "IsPlan", "Status", "CatName", "StatusObject");
            return Json(jdata);
        }
        #region Lấy dữ liệu đổ vào combobox 
        [HttpPost]
        public object GetCurrency()
        {
            var data = _context.FundAccEntrys.Select(x => new { Currency = x.Currency }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetCatCode()
        {
            var data = _context.FundCatReptExpss.Where(x => x.IsDeleted == false).Select(x => new { CatCode = x.CatCode }).AsNoTracking().ToList();
            //var data = _context.FundCatReptExpss.Where(x => x.IsDeleted == false).Select(x => new { CatCode = x.CatCode }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetAetRelative()
        {
            var data = _context.FundAccEntrys.Select(x => new { AetRelative = x.AetRelative }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        #endregion
        #region action
        [HttpPost]
        public JsonResult GetListFundCategoryParent()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.FundCatReptExpss.Where(x => x.CatParent != null && x.IsDeleted == false)
                    .Select(x => new
                    {
                        CatParent = x.CatParent,
                        x.CatName
                    })
                    .DistinctBy(x => x.CatParent).ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(CommonUtil.ResourceValue("PPAE_MSG_ERROR_INFOR"));//"Có lỗi khi lấy thông tin!";

            }
            return Json(msg);
        }


        //xuất Exel
        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string fromDatePara, string toDatePara, string title, string aetType, string total, string currency, string payer, string receiptter, string status, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            //Get data View
            //var listData = _context.FundAccEntrys.Where(x => x.IsPlan == true && x.IsDeleted == true).Select(x => new { x.Title, x.AetType, x.Total, x.Currency, x.Payer, x.Receiptter, x.Status }).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
            var fromDate = !string.IsNullOrEmpty(fromDatePara) ? DateTime.ParseExact(fromDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(toDatePara) ? DateTime.ParseExact(toDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var listData = (from a in _context.FundAccEntrys
                            join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                            on a.CatCode equals b.CatCode
                            join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.StatusObject equals c.CodeSet into c1
                            from c in c1.DefaultIfEmpty()
                            where (!a.IsDeleted && a.IsPlan == true
                                       && (string.IsNullOrEmpty(aetType) || (a.AetType.Equals(aetType)))
                                      && ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                      && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                                      && (string.IsNullOrEmpty(status) || (a.StatusObject.Equals(status)))
                                      && (string.IsNullOrEmpty(payer) || a.Payer.Equals(payer))
    )
                            select new
                            {
                                CatName = b.CatName,
                                Id = a.Id,
                                AetCode = a.AetCode,
                                Title = a.Title,
                                AetType = a.AetType,
                                AetRelativeType = a.AetRelativeType,
                                AetDescription = a.AetDescription,
                                Total = a.Total,
                                Payer = a.Payer,
                                Currency = a.Currency,
                                IsPlan = a.IsPlan,
                                Status = c != null ? c.ValueSet : "",
                                Receiptter = a.Receiptter,
                                Deadline = a.DeadLine,
                                Type = a.IsCompleted == true ? 4 : a.DeadLine < DateTime.Today ? 1 : a.DeadLine == DateTime.Today ? 2 : 3,

                            }).OrderUsingSortExpression(orderBy).AsNoTracking().ToList(); ;
            var listExport = new List<FundPlanAccEntryExportModel>();
            var no = 1;

            foreach (var item in listData)
            {

                var itemExport = new FundPlanAccEntryExportModel();

                itemExport.No = no;
                itemExport.CatName = item.CatName;
                itemExport.Title = item.Title;
                itemExport.AetType = item.AetType;
                itemExport.Total = item.Total;
                itemExport.Currency = item.Currency;
                itemExport.Payer = item.Payer;
                itemExport.Receiptter = item.Receiptter;
                itemExport.Status = item.Status;
                itemExport.StatusPlan = "";
                if (item.Type == 4)
                {
                    itemExport.StatusPlan = "Đã hoàn thành";
                }
                else if (item.Type == 3)
                {
                    itemExport.StatusPlan = "Chưa đến hạn";
                }
                else if (item.Type == 2)
                {
                    itemExport.StatusPlan = "Đến hạn";
                }
                else if (item.Type == 1)
                {
                    itemExport.StatusPlan = "Quá hạn";
                }
                //if (item.Status == "CREATED")
                //{
                //    itemExport.Status = "Khởi tạo";
                //}
                //else if (item.Status == "PENDING")
                //{
                //    itemExport.Status = "Đang chờ";
                //}
                //else if (item.Status == "APPROVED")
                //{
                //    itemExport.Status = "Đã duyệt";
                //}
                //else if (item.Status == "REFUSE")
                //{
                //    itemExport.Status = "Từ chối";
                //}
                //else
                //{
                //    itemExport.Status = "Hủy bỏ";
                //}

                if (item.AetType == "Receipt")
                {
                    itemExport.AetType = "Thu";
                }
                else if (item.AetType == "Expense")
                {
                    itemExport.AetType = "Chi";
                }
                //itemExport.LeaderIdea = item.LeaderIdea == "undefined" ? "Không ý kiến" : item.LeaderIdea;
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
            IWorksheet sheetRequest = workbook.Worksheets.Create("KeHoachThuChi");
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
            //sheetRequest.Range["I1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:J1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Kế Hoạch Thu Chi";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            //sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "Tên danh mục";
            sheetRequest["C2"].Text = "Tiêu đề";
            sheetRequest["D2"].Text = "Loại";
            sheetRequest["E2"].Text = "Số Tiền";
            sheetRequest["F2"].Text = "Loại Tiền";
            sheetRequest["G2"].Text = "Người Trả";
            sheetRequest["H2"].Text = "Người Nhận";
            sheetRequest["I2"].Text = "Trạng thái duyệt";
            sheetRequest["J2"].Text = "Trạng Thái kế hoạch";


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
            sheetRequest["A2:J2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:J2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportPhieuThuChi" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        public class FundAccEntrysJtableModel
        {
            public int Id { get; set; }
            public string AetCode { get; set; }
            public string Title { get; set; }
            public string AetType { get; set; }
            public string AetDescription { get; set; }
            public bool IsPlan { get; set; }
            public string CatCode { get; set; }
            public DateTime? DeadLine { get; set; }
            public string AetRelative { get; set; }
            public string AetRelativeType { get; set; }
            public string Payer { get; set; }
            public string Receiptter { get; set; }
            public decimal Total { get; set; }
            public string Currency { get; set; }
            public string Status { get; set; }
            //public int ActivityId { get; set; }
            //public string ActCode { get; set; }
            //public string ActTitle { get; set; }
            //public string ActType { get; set; }
            //public string ActNote { get; set; }
            //public string ActMember { get; set; }
        }
        public class JTableModelAct : JTableModel
        {
            public int Id { get; set; }
            public string AetCode { get; set; }
            public string Title { get; set; }
            public string AetType { get; set; }
            public string AetDescription { get; set; }
            public bool IsPlan { get; set; }
            public string CatCode { get; set; }
            public DateTime? DeadLine { get; set; }
            public string AetRelative { get; set; }
            public string AetRelativeType { get; set; }
            public string Payer { get; set; }
            public string Receiptter { get; set; }
            public decimal Total { get; set; }
            public string Currency { get; set; }
            public string Status { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
        }
        public class JTableModelFile : JTableModel
        {
            public int Id { get; set; }
            public string FileCode { get; set; }
            public string FileName { get; set; }
            public string FileType { get; set; }
            public string FileSize { get; set; }
            public string Description { get; set; }
            public string AetCode { get; set; }
        }
        public class FundPlanAccEntryExportModel
        {
            public int? No { get; set; }
            public string CatName { get; set; }
            public string Title { get; set; }
            public string AetType { get; set; }
            public decimal Total { get; set; }
            public string Currency { get; set; }
            public string Payer { get; set; }
            public string Receiptter { get; set; }
            public string Status { get; set; }
            public string StatusPlan { get; set; }
        }
        #endregion
        public (decimal totalReceipt, decimal totalExpense) Total(string fromDatePara, string toDatePara, string aetType, string status, string payer, string catCode)
        {
            var fromDate = !string.IsNullOrEmpty(fromDatePara) ? DateTime.ParseExact(fromDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(toDatePara) ? DateTime.ParseExact(toDatePara, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.FundAccEntrys
                        join b in _context.FundCatReptExpss.Where(x => x.IsDeleted == false)
                        on a.CatCode equals b.CatCode
                        where (!a.IsDeleted
                                  && ((fromDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date >= fromDate))
                                  && ((toDate == null) || (a.DeadLine.HasValue && a.DeadLine.Value.Date <= toDate)))
                                   && (string.IsNullOrEmpty(aetType) || (a.AetType.Equals(aetType)))
                                    && (string.IsNullOrEmpty(status) || (_context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id).Action.Equals(status)))
                                    && (string.IsNullOrEmpty(payer) || (a.Payer.Equals(payer)))
                                    && (string.IsNullOrEmpty(catCode) || (a.CatCode.Equals(catCode)))
                                    && ((a.IsPlan == true))
                        //&& (a.IsCompleted == true)
                        orderby a.CreatedTime
                        select new
                        {
                            CatName = b.CatName,
                            Id = a.Id,
                            AetCode = a.AetCode,
                            Title = a.Title,
                            AetType = a.AetType,
                            AetRelativeType = a.AetRelativeType,
                            AetDescription = a.AetDescription,
                            Total = a.Total,
                            Payer = a.Payer,
                            Currency = a.Currency,

                            Status = _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id) != null ? _context.FundAccEntryTrackings.Where(x => x.AetCode == a.AetCode).MaxBy(x => x.Id).Action : "",
                            Receiptter = a.Receiptter

                        };
            decimal totalReceipt = query.Where(x => x.AetType == "Receipt").Sum(x => x.Currency == "VND" ? x.Total : x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            decimal totalExpense = query.Where(x => x.AetType == "Expense").Sum(x => x.Currency == "VND" ? x.Total : x.Total * (1 / (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals(x.Currency)).Rate)) * (_context.FundExchagRates.FirstOrDefault(z => z.IsDeleted == false && z.Currency.Equals("VND")).Rate));
            return (totalReceipt, totalExpense);

        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
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