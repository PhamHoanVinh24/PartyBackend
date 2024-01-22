using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Globalization;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM;
using Lucene.Net.Search;
using System.Collections.Generic;
using static III.Admin.Controllers.InventoryController;
using DocumentFormat.OpenXml.Drawing;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using System.IO;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using Microsoft.AspNetCore.Http;
using Microsoft.SqlServer.Management.Smo;
using System.Text;
using Newtonsoft.Json;
using static log4net.Appender.RollingFileAppender;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ServiceRegistController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ServiceRegistController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly string test = "Ok";
        public ServiceRegistController(EIMDBContext context, IUploadService upload,
            IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment,
            IActionLogService actionLog, IStringLocalizer<ServiceRegistController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        public JsonResult JTable([FromBody] JTableModelServiceRegist jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var fromDate = !string.IsNullOrEmpty(jTablePara.BeginTime) ? DateTime.ParseExact(jTablePara.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.EndTime) ? DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query1 = from a in _context.ServiceRegists
                            join b in _context.Customerss.Where(x => x.IsDeleted == false) on a.ObjectCode equals b.CusCode into ab
                            from seCus in ab.DefaultIfEmpty()
                            join c in _context.HREmployees on a.ObjectCode equals c.employee_code into ac
                            from seEmpl in ac.DefaultIfEmpty()
                            join d in _context.ServiceCategorys on a.ServiceCode equals d.ServiceCode into ad
                            from seSerCate in ad.DefaultIfEmpty()
                            where
                            (string.IsNullOrEmpty(jTablePara.PaymentStatus) || (!string.IsNullOrEmpty(a.PaymentStatus) && a.PaymentStatus.ToLower().Contains(jTablePara.PaymentStatus.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.ObjectCode) || (!string.IsNullOrEmpty(a.ObjectCode) && a.ObjectCode.ToLower().Contains(jTablePara.ObjectCode.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.BeginTime) || (a.BeginTime >= fromDate))
                            && (string.IsNullOrEmpty(jTablePara.EndTime) || (a.EndTime <= toDate))
                            && a.IsDeleted == false
                            && (seCus.CusName!=null || seEmpl.fullname!=null )
                            && seSerCate.ServiceName!=null
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                CustomerName = seCus.CusName ?? seEmpl.fullname ?? string.Empty,
                                ServiceName = seSerCate.ServiceName ?? string.Empty,
                                a.ObjectCode,
                                a.ObjectType,
                                a.Status,
                                a.BeginTime,
                                a.EndTime,
                                a.PaymentStatus,
                                a.ServiceCode,
                                a.ServiceType
                            };
                var query = query1;
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CustomerName", "ServiceName", "ObjectCode", "ObjectType", "Status", "BeginTime", "EndTime", "PaymentStatus", "ServiceCode", "ServiceType");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "CustomerName", "ServiceName", "ObjectCode", "ObjectType", "Status", "BeginTime", "EndTime", "PaymentStatus", "ServiceCode", "ServiceType");
                return Json(jdata);
            }
        }

        [HttpGet]
        public ActionResult ExportExcel(string BeginTime, string EndTime, string PaymentStatus, string ObjectCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(BeginTime) ? DateTime.ParseExact(BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(EndTime) ? DateTime.ParseExact(EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var baseQuery = from a in _context.ServiceRegists
                                join b in _context.Customerss on a.ObjectCode equals b.CusCode into ab
                                from seCus in ab.DefaultIfEmpty()
                                join c in _context.HREmployees on a.ObjectCode equals c.employee_code into ac
                                from seEmpl in ac.DefaultIfEmpty()
                                join d in _context.ServiceCategorys on a.ServiceCode equals d.ServiceCode into ad
                                from seSerCate in ad.DefaultIfEmpty()
                                where
                                (string.IsNullOrEmpty(PaymentStatus) || (!string.IsNullOrEmpty(a.PaymentStatus) && a.PaymentStatus.ToLower().Contains(PaymentStatus.ToLower())))
                                && (string.IsNullOrEmpty(ObjectCode) || (!string.IsNullOrEmpty(a.ObjectCode) && a.ObjectCode.ToLower().Contains(ObjectCode.ToLower())))
                                && (string.IsNullOrEmpty(BeginTime) || (a.BeginTime >= fromDate))
                                && (string.IsNullOrEmpty(EndTime) || (a.EndTime <= toDate))
                                && a.IsDeleted == false
                                orderby a.Id descending
                                select new ServiceRegistRes
                                {
                                    Id = a.Id,
                                    CustomerName = seCus.CusName ?? seEmpl.fullname ?? string.Empty,
                                    ServiceName = seSerCate.ServiceName ?? string.Empty,
                                    Status = a.Status,
                                    BeginTime = a.BeginTime,
                                    EndTime = a.EndTime,
                                    PaymentStatus = a.PaymentStatus
                                };

                // Sắp xếp kết quả
                var sortedQuery = baseQuery.OrderByDescending(a => a.Id);
                var results = sortedQuery.ToList();

                //Tạo list Export
                var listExport = new List<IExportModel>();
                listExport = HandleInventoryExportModel(results);

                //Cấu hình excel
                ExcelEngine excelEngine = new ExcelEngine();
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2010;

                IWorkbook workbook = application.Workbooks.Create(1);
                workbook.Version = ExcelVersion.Excel97to2003;
                IWorksheet sheetRequest = workbook.Worksheets.Create("TonKho");
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

                sheetRequest.Range["A1"].Text = "Danh sách khách hàng";
                sheetRequest.Range["A1"].CellStyle.Font.FontName = "Arial";
                sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
                sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
                sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 0, 0);
                sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

                sheetRequest.ImportData(listExport, 2, 1, true);

                sheetRequest["A2"].Text = "TT";
                sheetRequest["B2"].Text = "Tên khách hàng";
                sheetRequest["C2"].Text = "Tên dịch vụ";
                sheetRequest["D2"].Text = "Trạng thái";
                sheetRequest["E2"].Text = "Ngày bắt đầu";
                sheetRequest["F2"].Text = "Ngày kết thúc";
                sheetRequest["G2"].Text = "Trạng thái thanh toán";

                IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
                tableHeader.Font.Color = ExcelKnownColors.White;
                tableHeader.Font.Bold = true;
                tableHeader.Font.Size = 11;
                tableHeader.Font.FontName = "Arial";
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
                var fileName = "ExportTonKho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;

                return File(ms, ContentType, fileName);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
                return Ok(msg);
            }
        }

        public class ServiceRegistRes
        {
            public int Id { get; set; }
            public string CustomerName { get; set; }
            public string ServiceName { get; set; }
            public string Status { get; set; }
            public DateTime? BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public string PaymentStatus { get; set; }
        }

        public class ServiceRegistExportModel : IExportModel
        {
            public int No { get; set; }
            public string CustomerName { get; set; }
            public string ServiceName { get; set; }
            public string Status { get; set; }
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string PaymentStatus { get; set; }
        }

        private List<IExportModel> HandleInventoryExportModel(List<ServiceRegistRes> rs)
        {
            var listExport = new List<IExportModel>();
            var no = 1;
            foreach (var item in rs)
            {
                var itemExport = new ServiceRegistExportModel();
                itemExport.No = no;
                itemExport.CustomerName = item.CustomerName;
                itemExport.ServiceName = item.ServiceName;
                itemExport.Status = item.Status;
                itemExport.BeginTime = item.BeginTime.HasValue ? item.BeginTime.Value.Date.ToString("dd/MM/yyyy") : "";
                itemExport.EndTime = item.EndTime.HasValue ? item.EndTime.Value.Date.ToString("dd/MM/yyyy") : "";
                itemExport.PaymentStatus = item.PaymentStatus;
                no = no + 1;
                listExport.Add(itemExport);
            }
            return listExport;
        }

        interface IExportModel
        {
            int No { get; set; }
        }

        [HttpGet]
        public IActionResult GeneratePdf(string BeginTime, string EndTime, string PaymentStatus, string ObjectCode)
        {
            var fromDate = !string.IsNullOrEmpty(BeginTime) ? DateTime.ParseExact(BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(EndTime) ? DateTime.ParseExact(EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var baseQuery = from a in _context.ServiceRegists
                            join b in _context.Customerss on a.ObjectCode equals b.CusCode into ab
                            from seCus in ab.DefaultIfEmpty()
                            join c in _context.HREmployees on a.ObjectCode equals c.employee_code into ac
                            from seEmpl in ac.DefaultIfEmpty()
                            join d in _context.ServiceCategorys on a.ServiceCode equals d.ServiceCode into ad
                            from seSerCate in ad.DefaultIfEmpty()
                            where
                            (string.IsNullOrEmpty(PaymentStatus) || (!string.IsNullOrEmpty(a.PaymentStatus) && a.PaymentStatus.ToLower().Contains(PaymentStatus.ToLower())))
                            && (string.IsNullOrEmpty(ObjectCode) || (!string.IsNullOrEmpty(a.ObjectCode) && a.ObjectCode.ToLower().Contains(ObjectCode.ToLower())))
                            && (string.IsNullOrEmpty(BeginTime) || (a.BeginTime >= fromDate))
                            && (string.IsNullOrEmpty(EndTime) || (a.EndTime <= toDate))
                            && a.IsDeleted == false
                            orderby a.Id descending
                            select new ServiceRegistRes
                            {
                                Id = a.Id,
                                CustomerName = seCus.CusName ?? seEmpl.fullname ?? string.Empty,
                                ServiceName = seSerCate.ServiceName ?? string.Empty,
                                Status = a.Status,
                                BeginTime = a.BeginTime,
                                EndTime = a.EndTime,
                                PaymentStatus = a.PaymentStatus
                            };

            // Sắp xếp kết quả
            var sortedQuery = baseQuery.OrderByDescending(a => a.Id);
            var results = sortedQuery.ToList();

            // Gọi hàm GeneratePdf để tạo tệp PDF
            byte[] pdfData = GeneratePdf(results);

            // Trả về tệp PDF
            string ContentType = "application/pdf";
            var fileName = "DanhSachKhachHang" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".pdf";
            return File(pdfData, ContentType, fileName);
        }

        public byte[] GeneratePdf(List<ServiceRegistRes> data)
        {
            PdfSharp.Pdf.PdfDocument document = new PdfSharp.Pdf.PdfDocument();

            // Tạo một trang mới
            PdfSharp.Pdf.PdfPage page = document.AddPage();

            // Tạo đối tượng XGraphics để vẽ trên trang
            PdfSharp.Drawing.XGraphics gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page);

            // Tạo một font Unicode cho văn bản
            PdfSharp.Drawing.XFont font = new PdfSharp.Drawing.XFont("Arial Unicode MS", 10, PdfSharp.Drawing.XFontStyle.Regular);

            // Kích thước bảng và số hàng cột
            int rowCount = data.Count;
            int columnCount = 7;
            double tableX = 50;
            double tableY = 50;
            double tableWidth = page.Width - 100;
            double cellMargin = 5;
            double rowHeight = 20;

            // Số lượng dòng cần xuống dòng
            int linesPerPage = (int)((page.Height - tableY) / rowHeight);

            // Vẽ viền bảng
            PdfSharp.Drawing.XRect tableRect = new PdfSharp.Drawing.XRect(tableX, tableY, tableWidth, rowHeight * (linesPerPage + 1));
            gfx.DrawRectangle(PdfSharp.Drawing.XPens.Black, tableRect);
            string[] label = { "STT", "Tên khách hàng", "Tên dịch vụ", "Trạng thái", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái thanh toán" };

            // Vẽ label
            for (int col = 0; col < label.Length; col++)
            {
                PdfSharp.Drawing.XRect cellRect = new PdfSharp.Drawing.XRect(tableX + col * (tableWidth / columnCount), tableY, tableWidth / columnCount, rowHeight);
                gfx.DrawRectangle(PdfSharp.Drawing.XPens.Black, cellRect);
                gfx.DrawString(label[col], font, PdfSharp.Drawing.XBrushes.Black, cellRect, PdfSharp.Drawing.XStringFormats.Center);
            }

            // Vẽ các ô và định dạng nội dung
            int row = 0;
            double h = rowHeight + tableY;
            foreach (var item in data)
            {
                if (row >= linesPerPage)
                {
                    // Nếu đã vượt quá số lượng dòng trên trang, thêm trang mới
                    page = document.AddPage();
                    gfx = PdfSharp.Drawing.XGraphics.FromPdfPage(page);
                    h = rowHeight;
                    row = 0;
                }

                int col = 0;
                row++;

                // Chạy qua các thuộc tính của Res
                foreach (var field in typeof(ServiceRegistRes).GetProperties())
                {
                    var fieldValue = field.GetValue(item)?.ToString();
                    PdfSharp.Drawing.XRect cellRect = new PdfSharp.Drawing.XRect(tableX + col * (tableWidth / columnCount), h, tableWidth / columnCount, rowHeight);
                    gfx.DrawRectangle(PdfSharp.Drawing.XPens.Black, cellRect);

                    // Tính toán số lượng dòng cần xuống dòng
                    var textSize = gfx.MeasureString(fieldValue, font);
                    double maxWidth = (tableWidth / columnCount) - (2 * cellMargin);
                    int maxCharacters = (int)(maxWidth / (textSize.Width / fieldValue.Length));
                    string cellText = fieldValue;

                    if (textSize.Width > maxWidth)
                    {
                        // Tách dữ liệu thành các dòng
                        var lines = new List<string>();
                        while (cellText.Length > maxCharacters)
                        {
                            lines.Add(cellText.Substring(0, maxCharacters));
                            cellText = cellText.Substring(maxCharacters);
                        }
                        lines.Add(cellText);

                        // Vẽ từng dòng
                        double yOffset = h;
                        foreach (var line in lines)
                        {
                            gfx.DrawString(line, font, PdfSharp.Drawing.XBrushes.Black, cellRect.Left + cellMargin, yOffset, PdfSharp.Drawing.XStringFormats.TopLeft);
                            yOffset += 50;
                        }
                    }
                    else
                    {
                        gfx.DrawString(cellText, font, PdfSharp.Drawing.XBrushes.Black, cellRect.Left + cellMargin, h, PdfSharp.Drawing.XStringFormats.TopLeft);
                    }

                    col++;
                }
                h += rowHeight;
            }

            // Chuyển tệp PDF thành mảng byte
            using (MemoryStream stream = new MemoryStream())
            {
                document.Save(stream);
                document.Close();
                return stream.ToArray();
            }
        }

        [HttpPost]
        public object GetServiceUser()
        {
            var data = _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { Code = x.CusCode, Name = x.CusName });
            return data;
        }
        [HttpPost]
        public object GetServiceEmployee()
        {
            var data = _context.HREmployees.Select(x => new { Code = x.employee_code, Name = x.fullname });
            return data;
        }
        [HttpPost]
        public object GetServiceCategory()
        {
            var data = _context.ServiceCategorys.Where(x => !x.IsDeleted).Select(x => new { Id = x.ServiceCatID, Code = x.ServiceCode, Name = x.ServiceName });
            return data;
        }

        [HttpPost]
        public IActionResult GetServiceByID(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var obj = _context.ServiceRegists.FirstOrDefault(m => m.Id == id);

                dynamic cus;
                if (obj.ObjectType == "Organization")
                    cus = _context.Customerss.Where(x => !x.IsDeleted).Where(x => x.CusCode == obj.ObjectCode).Select(x => new { Type = "Tổ chức", Name = x.CusName }).FirstOrDefault();
                else
                    cus = _context.HREmployees.Where(x => x.employee_code == obj.ObjectCode).Select(x => new { Type = "Cá nhân", Name = x.fullname }).FirstOrDefault();

                msg.Object = new { obj, cus };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }
            return Ok(msg);
        }

        public class ModelRequestSR
        {
            public string ServiceCode { get; set; }
            public string ObjectType { get; set; }
            public string ObjectCode { get; set; }
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string Status { get; set; }
            public string PaymentStatus { get; set; }
            public string ServiceType { get; set; }
            public string SeviceUpdate { get; set; }
            public bool IsServcieAdditional { get; set; }
            public string ListServiceAdditional { get; set; }
        }

        public class ModelWarning
        {
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string ServiceType { get; set; }

            public string PaymentStatus { get; set; }
        }
        public class Additional
        {
            public string CodeHeader { get; set; }
            public string Name { get; set; }
            public int Price { get; set; }
            public int ObjFromValue { get; set; }
            public int ObjToValue { get; set; }
            public GroupCode Group { get; set; }
        }
        public class GroupCode
        {
            public string ObjectCode { get; set; }
            public string ObjectName { get; set; }
        }
        [HttpPost]
        public IActionResult Insert([FromBody] ModelRequestSR obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (obj == null || string.IsNullOrWhiteSpace(obj.ServiceCode)
                || string.IsNullOrWhiteSpace(obj.ObjectType)
                || string.IsNullOrWhiteSpace(obj.ObjectCode)
                || string.IsNullOrWhiteSpace(obj.BeginTime)
                || string.IsNullOrWhiteSpace(obj.EndTime)
                || string.IsNullOrWhiteSpace(obj.PaymentStatus)
                || string.IsNullOrWhiteSpace(obj.ServiceType))
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                return Ok(msg);
            }
            try
            {
                var _serviceRegist = new ServiceRegist();
                var checkExist = _context.ServiceRegists.FirstOrDefault(x => x.ServiceCode == obj.ServiceCode
                                                                                && x.ObjectCode == obj.ObjectCode
                                                                                && x.IsDeleted == false);
                if (checkExist == null)
                {
                    _serviceRegist.CreatedBy = ESEIM.AppContext.UserName;
                    _serviceRegist.CreatedTime = DateTime.Now;
                    var item = new ServiceRegist();

                    item.EndTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    item.BeginTime = DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    if (item.EndTime < item.BeginTime)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                        return Ok(msg);
                    }
                    item.Status = obj.Status;
                    item.CreatedTime = DateTime.Now.Date;
                    item.CreatedBy = ESEIM.AppContext.UserName;
                    item.ServiceType = obj.ServiceType;
                    item.ServiceCode = obj.ServiceCode;
                    item.PaymentStatus = obj.PaymentStatus;
                    item.ObjectType = obj.ObjectType;
                    item.ObjectCode = obj.ObjectCode;
                    Additional[] additional=null;
                    if (obj.IsServcieAdditional)
                    {
                        additional = JsonConvert.DeserializeObject<Additional[]>(obj.ListServiceAdditional);
                        item.LogPay = obj.ListServiceAdditional;
                    }
                    if (!string.IsNullOrEmpty(item.Status) && item.Status == "Kích hoạt")
                    {
                        dynamic cus;
                        if (obj.ObjectType == "Organization")
                            cus = _context.Customerss.Where(x => !x.IsDeleted).Where(x => x.CusCode == obj.ObjectCode).Select(x => new { Type = "Tổ chức", Name = x.CusName }).FirstOrDefault();
                        else
                            cus = _context.HREmployees.Where(x => x.employee_code == obj.ObjectCode).Select(x => new { Type = "Cá nhân", Name = x.fullname }).FirstOrDefault();

                        var logStatus = new LogAction
                        {
                            Name = cus.Name,
                            BeginTIme = DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                            EndTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                            PaymentStatus = item.PaymentStatus,
                            ServiceType = item.ServiceType,
                            ServiceCode = item.ServiceCode,
                            CreateTime = item.CreatedTime,
                            CreateBy = item.CreatedBy,
                        };

                        List<LogAction> logActions = new List<LogAction>();
                        logActions.Add(logStatus);
                        item.LogAction = LogAction.ToJsonString(logActions);
                    }
                    _context.ServiceRegists.Add(item);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                    return Ok(msg); // Trả về HTTP 200 OK khi thành công
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer[""]);
                    return Ok(msg); // Trả về HTTP 409 Conflict khi trùng dữ liệu
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer[""]);
                // Log ex here if needed
                return Ok(msg); // Trả về HTTP 500 Internal Server Error khi có lỗi
            }
        }

        public bool CheckDateService(ServiceRegist obj)
        {
            var list = _context.ServiceRegists.Where(x => x.ObjectCode == obj.ObjectCode)
                .Where(x => x.ObjectType == obj.ObjectType)
                .Where(x => x.ServiceCode == x.ServiceCode)
                .Where(x => x.BeginTime > obj.EndTime || x.EndTime < obj.BeginTime)
                .ToArray();

            return list.Length == 0;
        }

        [HttpPost]
        public object Update(int id, [FromBody] ModelRequestSR obj)
        {

            var msg = new JMessage { Error = false, Title = "" };

            if (obj == null || string.IsNullOrWhiteSpace(obj.ServiceCode))
            {
                return new JMessage { Error = true, Title = _sharedResources["COM_MSG_INVALID_FORMAT"] };
            }
            try
            {
                var item = _context.ServiceRegists.FirstOrDefault(x => x.Id.Equals(id));
                if (item != null)
                {
                    item.Status = obj.Status;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.ServiceType = obj.ServiceType;
                    item.ServiceCode = obj.ServiceCode;
                    item.EndTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    item.BeginTime = DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    if (item.EndTime < item.BeginTime)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                        return msg;
                    }
                    item.PaymentStatus = obj.PaymentStatus;
                    if (obj.IsServcieAdditional)
                    {
                        var additional = JsonConvert.DeserializeObject<Additional[]>(obj.ListServiceAdditional);
                        item.LogPay = obj.ListServiceAdditional;
                    }
                    if (!string.IsNullOrEmpty(item.Status))
                    {
                        dynamic cus;
                        if (obj.ObjectType == "Organization")
                            cus = _context.Customerss.Where(x => !x.IsDeleted).Where(x => x.CusCode == obj.ObjectCode).Select(x => new { Type = "Tổ chức", Name = x.CusName }).FirstOrDefault();
                        else
                            cus = _context.HREmployees.Where(x => x.employee_code == obj.ObjectCode).Select(x => new { Type = "Cá nhân", Name = x.fullname }).FirstOrDefault();

                        var logStatus = new LogAction
                        {
                            Name = cus.Name,
                            BeginTIme = DateTime.ParseExact(obj.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                            EndTime = DateTime.ParseExact(obj.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture),
                            PaymentStatus = item.PaymentStatus,
                            ServiceType = item.ServiceType,
                            ServiceCode = item.ServiceCode,
                            UpdateBy = item.UpdatedBy,
                            UpdateTime = item.UpdatedTime,
                        };

                        List<LogAction> logActions = LogAction.ToListLogAction(item.LogAction);
                        logActions.Add(logStatus);
                        item.LogAction = LogAction.ToJsonString(logActions);
                    }
                    _context.ServiceRegists.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], ""); ;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND"];
                }


                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return msg;
            }
        }


        [HttpPost]
        public object CheckSubscription([FromBody] ModelWarning obj)
        {
            var msg = new JMessage { Error = false, Title = "", Code = "" };
            DateTime endDateTime;
            string dateFormat = "dd/MM/yyyy"; // Định dạng ngày tháng dd/MM/yyyy
            if (!DateTime.TryParseExact(obj.EndTime, dateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out endDateTime))
            {
                msg.Error = true;
                msg.Title = "Ngày kết thúc không hợp lệ.";
                return msg;
            }

            DateTime today = DateTime.Now;
            int daysRemaining = 0;

            if (obj.ServiceType == "Daily")
            {

                daysRemaining = (endDateTime - today).Days;
                msg.Code = (daysRemaining == 0) ? "RENEW_PROMPT" : "";
                msg.Error = false;
                msg.Title = CheckRemainingDays(daysRemaining, obj.ServiceType, obj.PaymentStatus);
            }
            else if (obj.ServiceType == "Weekly")
            {
                int weeksRemaining = (int)Math.Floor((endDateTime - today).TotalDays / 7);
                msg.Code = (weeksRemaining == 0) ? "RENEW_PROMPT" : "";
                msg.Error = false;
                msg.Title = CheckRemainingDays(weeksRemaining, obj.ServiceType, obj.PaymentStatus);


            }
            else if (obj.ServiceType == "Monthly")
            {
                int monthsRemaining = ((endDateTime.Year - today.Year) * 12) + endDateTime.Month - today.Month;
                msg.Code = (monthsRemaining == 0) ? "RENEW_PROMPT" : "";
                msg.Error = false;
                msg.Title = CheckRemainingDays(monthsRemaining, obj.ServiceType, obj.PaymentStatus);

            }
            else if (obj.ServiceType == "Annual")
            {
                int yearsRemaining = endDateTime.Year - today.Year;
                msg.Code = (yearsRemaining == 0) ? "RENEW_PROMPT" : "";
                msg.Error = false;
                msg.Title = CheckRemainingDays(yearsRemaining, obj.ServiceType, obj.PaymentStatus);

            }
            else if (obj.ServiceType == "None")
            {
                daysRemaining = (endDateTime - today).Days;
                msg.Code = (daysRemaining == 0) ? "RENEW_PROMPT" : "";
                msg.Error = false;
                msg.Title = CheckRemainingDays(daysRemaining, obj.ServiceType, obj.PaymentStatus);
            }
            else
            {
                msg.Error = true;
                msg.Title = "Loại dịch vụ không hợp lệ.";

            }

            return msg;
        }

        [HttpPost]
        private string CheckRemainingDays(int daysRemaining, string serviceType, string paymentStatus)
        {
            if (daysRemaining < 0)
            {
                if (paymentStatus == "Chưa thanh toán")
                {
                    return "Dịch vụ của bạn đã quá hạn và chưa được thanh toán!";
                }
                return "Dịch vụ của bạn đã hết hạn!";
            }
            else if (daysRemaining <= 7)
            {
                if (paymentStatus == "Chưa thanh toán")
                {
                    switch (serviceType)
                    {
                        case "Daily":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} ngày và chưa được thanh toán.";
                        case "Weekly":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} tuần và chưa được thanh toán.";
                        case "Monthly":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} tháng và chưa được thanh toán.";
                        case "Annual":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} năm và chưa được thanh toán.";
                        case "None":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} ngày và chưa được thanh toán.";
                        default:
                            return "Dịch vụ của bạn sẽ hết hạn trong " + daysRemaining + " ngày và chưa được thanh toán.";
                    }
                }
                else
                {
                    switch (serviceType)
                    {
                        case "Daily":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} ngày.";
                        case "Weekly":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} tuần.";
                        case "Monthly":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} tháng.";
                        case "Annual":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} năm.";
                        case "None":
                            return $"Dịch vụ của bạn sẽ hết hạn trong {daysRemaining} ngày.";
                        default:
                            return "Dịch vụ của bạn sẽ hết hạn trong " + daysRemaining + " ngày.";
                    }
                }
            }

            else
            {
                if (paymentStatus == "Chưa thanh toán")
                {
                    return "Dịch vụ của bạn vẫn còn hiệu lực và chưa được thanh toán.";
                }
                return "Dịch vụ của bạn vẫn còn hiệu lực.";
            }
        }


        class LogAction
        {
            public string Name { get; set; }
            public DateTime BeginTIme { get; set; }
            public DateTime EndTime { get; set; }
            public string PaymentStatus { get; set; }
            public string ServiceType { get; set; }
            public string ServiceCode { get; set; }
            public DateTime? CreateTime { get; set; }
            public string CreateBy { get; set; }
            public DateTime? UpdateTime { get; set; }
            public string UpdateBy { get; set; }

            public static string ToJsonString(List<LogAction> logActions)
            {
                return JsonConvert.SerializeObject(logActions);
            }
            public static List<LogAction> ToListLogAction(string json)
            {
                List<LogAction> logActions = string.IsNullOrEmpty(json)
                ? new List<LogAction>()
                : JsonConvert.DeserializeObject<List<LogAction>>(json);
                return logActions;
            }
        }


        [HttpPost]
        public object DeleteServiceRegist(int id)
        {
            var msg = new JMessage { Error = true }; try
            {
                var serviceRegist = _context.ServiceRegists.FirstOrDefault(x => x.Id == id);
                if (serviceRegist != null)
                {
                    serviceRegist.IsDeleted = true;
                    serviceRegist.DeletedTime = DateTime.Now;
                    serviceRegist.DeletedBy = ESEIM.AppContext.UserName;
                    _context.Entry(serviceRegist).State = EntityState.Modified;
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }

        }
        //Hàm lấy bảng giá dịch vụ mới nhất theo khoản thời gian và loại khách hàng
        [HttpPost]
        public object GetServiceCostHeader([FromBody] ModelRequestSR model)
        {
            var msg = new JMessage() { Error = false };
            if (string.IsNullOrEmpty(model.ObjectType)
                || string.IsNullOrEmpty(model.BeginTime)
                || string.IsNullOrEmpty(model.EndTime)
                || string.IsNullOrEmpty(model.ServiceCode))
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy bảng giá nào";
                return msg;
            }
            try
            {
                var data2 = _context.ServiceCategoryCostConditions.Where(x => !x.IsDeleted).Where(x => x.ServiceCatCode.Equals(model.ServiceCode));
                if (data2.Count() == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bảng giá nào chứa dịch vụ này";
                    return msg;
                }

                var EndTime = DateTime.ParseExact(model.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var BeginTime = DateTime.ParseExact(model.BeginTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                var query = from a in _context.ServiceCategoryCostHeaders
                            where a.IsDeleted == false
                            && BeginTime.CompareTo(a.EffectiveDate) >= 0
                            && EndTime.CompareTo(a.ExpiryDate) <= 0
                            select new
                            {
                                a.Id,
                                a.Title,
                                a.CreatedTime,
                                a.HeaderCode,
                                Group = new
                                {
                                    //Nếu loại khách hàng là tổ chức thì lấy giá chuẩn đại lý ngược lai thì lấy giá chuẩn khách lẻ
                                    Normal = data2.Where(x => x.HeaderCode.Equals(a.HeaderCode) && x.ObjectCode == (model.ObjectType == "Organization" ? "SERVICE_CONDITION20190425184913" : "SERVICE_CONDITION20190425191055"))
                                        .Select(x => new
                                        {
                                            x.Price,
                                            Title = _context.CommonSettings.FirstOrDefault(x2 => x2.CodeSet.Equals(x.ObjectCode) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x2 => x2.CodeSet.Equals(x.ObjectCode) && !x.IsDeleted).ValueSet : null,
                                        }).FirstOrDefault(),
                                    //Nếu loại khách hàng là tổ chức thì lấy giá mở rộng đại lý ngược lai thì lấy giá mở rộng khách lẻ
                                    Extent = data2.Where(x => x.HeaderCode.Equals(a.HeaderCode) && x.ObjectCode == (model.ObjectType == "Organization" ? "SERVICE_CONDITION20190425191109" : "SERVICE_CONDITION_000"))
                                        .Select(x => new
                                        {
                                            x.Price,
                                            Title = _context.CommonSettings.FirstOrDefault(x2 => x2.CodeSet.Equals(x.ObjectCode) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x2 => x2.CodeSet.Equals(x.ObjectCode) && !x.IsDeleted).ValueSet : null,
                                        }).FirstOrDefault(),
                                }
                            };
                var data = query.ToList();
                if (data.Count() == 0)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bảng giá nào chứa dịch vụ này";
                }
                else
                {
                    var NewDate = data.Max(x => x.CreatedTime);
                    var results = data.FirstOrDefault(x => x.CreatedTime.Equals(NewDate));
                    msg.Object = results;
                }
                return msg;
            }
            catch (Exception err)
            {
                msg.Error = true;
                msg.Title = err.Message;
                return msg;
            }
        } 
        [HttpPost]
        public object PriceByServiceCode(string ServiceCode, string ServiceCostHeaderCode)
        {
            List<string> ServiceCatCodes = new List<string>
            {
                "SERVICE_CONDITION20190425184913",
                "SERVICE_CONDITION20190425191055",
                "SERVICE_CONDITION20190425191109",
                "SERVICE_CONDITION_000"
            };
            var data = (from a in _context.ServiceCategoryCostConditions.Where(x => x.ServiceCatCode == ServiceCode)
                        join b in _context.ServiceCategorys on a.ServiceCatCode equals b.ServiceCode
                        join c in _context.ServiceCategoryGroups.Where(x => !x.IsDeleted) on b.ServiceGroup equals c.Code into c1
                        from c2 in c1.DefaultIfEmpty()
                        where !a.IsDeleted && !b.IsDeleted && a.HeaderCode.Equals(ServiceCostHeaderCode)
                        && !ServiceCatCodes.Contains(a.ServiceCatCode)
                        select new
                        {
                            a.Id,
                            a.Price,
                            a.ObjFromValue,
                            a.ObjToValue,
                            a.ObjectCode,
                            ObjectName = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ObjectCode) && !x.IsDeleted).ValueSet : null,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit) && !x.IsDeleted).ValueSet : null,
                            ServiceUnit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ServiceUnit) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.ServiceUnit) && !x.IsDeleted).ValueSet : null,
                            Currency = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Currency) && !x.IsDeleted) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Currency) && !x.IsDeleted).ValueSet : null,
                            a.ServiceCatCode,
                            ServiceName = c2 != null ? string.Concat(b.ServiceName, "(" + c2.Name + ")") : b.ServiceName,
                        }).Select(x => new
                        {
                            x.Id,
                            Group = new { x.ObjectCode, x.ObjectName },
                            Name = "Từ:" + x.ObjFromValue + "--Đến:" + x.ObjToValue + "(" + x.Unit + ")",
                            x.Price,
                            x.Currency,
                            x.ServiceCatCode,
                            x.ServiceName,
                            x.ObjFromValue,
                            x.ObjToValue
                        });
            var result = data.Where(x => !ServiceCatCodes.Contains(x.Group.ObjectCode)).GroupBy(x => x.Group).ToList();
            return result;
        }




        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var a = _stringLocalizer["SCP_COL_CREATED_BY"];
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        public class JTableModelServiceRegist : JTableModel
        {
            public string BeginTime { get; set; }
            public string EndTime { get; set; }
            public string ObjectCode { get; set; }
            public string PaymentStatus { get; set; }
        }

        public class JTableModelCustomer : JTableModel
        {
            public string CustomerCode { get; set; }
            public string CustomerName { get; set; }

        }
    }
}