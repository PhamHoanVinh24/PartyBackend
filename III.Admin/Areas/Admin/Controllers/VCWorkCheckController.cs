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

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class VCWorkCheckController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;

        public class JTableVCWorkCheckModelCustom : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string WpCode { get; set; }
            public string Name { get; set; }
            public string UserName { get; set; }

            public string CustomerName { get; set; }
            public string Checkout { get; set; }
        }
        public class VCWorkCheckModel
        {
            public int Id { get; set; }
            public DateTime? CheckinTime { get; set; }
            public bool? Checkin { get; set; }
            public DateTime? CheckoutTime { get; set; }
            public bool? Checkout { get; set; }
            public string CreatedBy { get; set; }
            public string Review { get; set; }
            public string Idea { get; set; }
            public string Address { get; set; }
            public string Name { get; set; }
            public string CustomerName { get; set; }
            public string WpCode { get; set; }
            public string TimeNode { get; set; }
            public string Image { get; set; }
        }
        public class VCWorkCheckExportModel
        {
            public int No { get; set; }
            public string WpCode { get; set; }
            public string Name { get; set; }
            public string CustomerName { get; set; }
            public string CheckinTime { get; set; }
            public string CheckoutTime { get; set; }
            public string Checkout { get; set; }
            public string TimeNode { get; set; }
        }
        public VCWorkCheckController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableVCWorkCheckModelCustom jTablePara)
        {
            //DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = FuncJTable(jTablePara.FromDate, jTablePara.ToDate, jTablePara.WpCode, jTablePara.UserName, jTablePara.CustomerName, jTablePara.Checkout);

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CheckinTime", "Checkin", "Checkout", "CheckoutTime", "CreatedBy", "Review", "Idea", "Address", "Name", "CustomerName", "WpCode", "TimeNode", "Image");
            return Json(jdata);
        }

        //Hàm cũ
        [NonAction]
        public IQueryable<VCWorkCheckModel> FuncJTable(string FromDate, string ToDate, string WpCode, string UserName, string CustomerName, string checkOut)
        {
            var session = HttpContext.GetSessionUser();
            //var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

            DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            bool hasCheckOut = false;
            if (!string.IsNullOrEmpty(checkOut))
                hasCheckOut = true;
            bool isCheckOut = false;
            if (hasCheckOut == true)
            {
                isCheckOut = bool.Parse(checkOut);
            }
            var dtnow = DateTime.Now;


            IQueryable<VCWorkCheckModel> query = null;

            if (session.UserType == 10)
            {
                query = from a in _context.VcWorkChecks.AsNoTracking()
                                      .Select(x => new { x.Id, x.UserName, x.CareCode, x.CheckinTime, x.CheckoutTime, x.Checkout, x.CreatedBy, x.Checkin, x.Review, x.Idea, x.Address, x.ImagePath })
                        join b1 in _context.Users.Where(x => x.Active).AsNoTracking()
                                           .Select(x => new { x.UserName, x.Area, x.GivenName })
                                           on a.UserName equals b1.UserName into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.VcSettingRoutes.Where(x => x.IsDeleted != true).AsNoTracking()
                                           .Select(x => new { x.WpCode, x.RouteCode, x.Node })
                                           on a.CareCode equals c.RouteCode
                        join d in _context.Customerss.Where(x => x.IsDeleted != true).AsNoTracking()
                                                //.Select(x => new { x.CusCode, x.Area, x.CusName })
                                                on c.Node equals d.CusCode
                        where (string.IsNullOrEmpty(FromDate) || (a.CheckinTime.Value.Date == fromDate.Value.Date))
                        && (string.IsNullOrEmpty(ToDate) || (a.CheckoutTime.Value.Date == toDate.Value.Date))
                        && (string.IsNullOrEmpty(WpCode) || (c != null && !string.IsNullOrEmpty(c.WpCode) && c.WpCode.ToLower().Contains(WpCode.ToLower())))
                        && (string.IsNullOrEmpty(UserName) || (b != null && !string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
                                                        || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
                        && (string.IsNullOrEmpty(CustomerName) || (d != null && !string.IsNullOrEmpty(d.CusCode) && d.CusCode == CustomerName))
                        && (!hasCheckOut || ((isCheckOut == false && !a.Checkout.HasValue) || (isCheckOut == true && a.Checkout.HasValue)))

                        select new VCWorkCheckModel
                        {
                            Id = a.Id,
                            CheckinTime = a.CheckinTime,
                            Checkin = a.Checkin,
                            Checkout = a.Checkout,
                            CheckoutTime = a.CheckoutTime,
                            CreatedBy = a.CreatedBy,
                            Review = a.Review,
                            Idea = a.Idea,
                            Address = a.Address,
                            Name = b != null ? b.GivenName : "",
                            CustomerName = d != null ? d.CusName : "",
                            WpCode = c != null ? c.WpCode : "",
                            TimeNode = (a.CheckinTime != null && a.CheckoutTime != null)
                                        ? (a.CheckoutTime.Value.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm")
                                        : (a.CheckinTime != null ? (dtnow.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm") : ""),
                            Image = a.ImagePath
                        };
                return query;
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = GetListAreaFunc(session);

                    query = from a in _context.VcWorkChecks.AsNoTracking()
                                     .Select(x => new { x.Id, x.UserName, x.CareCode, x.CheckinTime, x.CheckoutTime, x.Checkout, x.CreatedBy, x.Checkin, x.Review, x.Idea, x.Address, x.ImagePath })
                            join b in _context.Users.Where(x => x.Active).AsNoTracking()
                                               .Select(x => new { x.UserName, x.Area, x.GivenName })
                                               on a.UserName equals b.UserName
                            join c in _context.VcSettingRoutes.Where(x => x.IsDeleted != true).AsNoTracking()
                                               .Select(x => new { x.WpCode, x.RouteCode, x.Node })
                                               on a.CareCode equals c.RouteCode
                            join d in _context.Customerss.Where(x => x.IsDeleted != true).AsNoTracking()
                                                    //.Select(x => new { x.CusCode, x.Area, x.CusName })
                                                    on c.Node equals d.CusCode
                            join f in listArea.Select(x => x.Code) on b.Area equals f

                            where (string.IsNullOrEmpty(FromDate) || (a.CheckinTime.Value.Date == fromDate.Value.Date))
                            && (string.IsNullOrEmpty(ToDate) || (a.CheckoutTime.Value.Date == toDate.Value.Date))
                            && (string.IsNullOrEmpty(WpCode) || (c != null && !string.IsNullOrEmpty(c.WpCode) && c.WpCode.ToLower().Contains(WpCode.ToLower())))
                            && (string.IsNullOrEmpty(UserName) || (b != null && !string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
                                                            || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
                            && (string.IsNullOrEmpty(CustomerName) || (d != null && !string.IsNullOrEmpty(d.CusCode) && d.CusCode == CustomerName))
                            && (!hasCheckOut || ((isCheckOut == false && !a.Checkout.HasValue) || (isCheckOut == true && a.Checkout.HasValue)))

                            select new VCWorkCheckModel
                            {
                                Id = a.Id,
                                CheckinTime = a.CheckinTime,
                                Checkin = a.Checkin,
                                Checkout = a.Checkout,
                                CheckoutTime = a.CheckoutTime,
                                CreatedBy = a.CreatedBy,
                                Review = a.Review,
                                Idea = a.Idea,
                                Address = a.Address,
                                Name = b != null ? b.GivenName : "",
                                CustomerName = d != null ? d.CusName : "",
                                WpCode = c != null ? c.WpCode : "",
                                TimeNode = (a.CheckinTime != null && a.CheckoutTime != null)
                                            ? (a.CheckoutTime.Value.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm")
                                            : (a.CheckinTime != null ? (dtnow.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm") : ""),
                                Image = a.ImagePath
                            };
                    return query;
                }
                else if (session.TypeStaff == 0)
                {
                    query = from a in _context.VcWorkChecks.Where(x => x.CreatedBy == session.UserName).AsNoTracking()
                                     .Select(x => new { x.Id, x.UserName, x.CareCode, x.CheckinTime, x.CheckoutTime, x.Checkout, x.CreatedBy, x.Checkin, x.Review, x.Idea, x.Address, x.ImagePath })
                            join b1 in _context.Users.Where(x => x.Active).AsNoTracking()
                                               .Select(x => new { x.UserName, x.Area, x.GivenName })
                                               on a.UserName equals b1.UserName into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.VcSettingRoutes.Where(x => x.IsDeleted != true).AsNoTracking()
                                               .Select(x => new { x.WpCode, x.RouteCode, x.Node })
                                               on a.CareCode equals c.RouteCode
                            join d in _context.Customerss.Where(x => x.IsDeleted != true).AsNoTracking()
                                                    //.Select(x => new { x.CusCode, x.Area, x.CusName })
                                                    on c.Node equals d.CusCode
                            where (string.IsNullOrEmpty(FromDate) || (a.CheckinTime.Value.Date == fromDate.Value.Date))
                            && (string.IsNullOrEmpty(ToDate) || (a.CheckoutTime.Value.Date == toDate.Value.Date))
                            && (string.IsNullOrEmpty(WpCode) || (c != null && !string.IsNullOrEmpty(c.WpCode) && c.WpCode.ToLower().Contains(WpCode.ToLower())))
                            && (string.IsNullOrEmpty(UserName) || (b != null && !string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
                                                            || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
                            && (string.IsNullOrEmpty(CustomerName) || (d != null && !string.IsNullOrEmpty(d.CusCode) && d.CusCode == CustomerName))
                            && (!hasCheckOut || ((isCheckOut == false && !a.Checkout.HasValue) || (isCheckOut == true && a.Checkout.HasValue)))

                            select new VCWorkCheckModel
                            {
                                Id = a.Id,
                                CheckinTime = a.CheckinTime,
                                Checkin = a.Checkin,
                                Checkout = a.Checkout,
                                CheckoutTime = a.CheckoutTime,
                                CreatedBy = a.CreatedBy,
                                Review = a.Review,
                                Idea = a.Idea,
                                Address = a.Address,
                                Name = b != null ? b.GivenName : "",
                                CustomerName = d != null ? d.CusName : "",
                                WpCode = c != null ? c.WpCode : "",
                                TimeNode = (a.CheckinTime != null && a.CheckoutTime != null)
                                            ? (a.CheckoutTime.Value.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm")
                                            : (a.CheckinTime != null ? (dtnow.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm") : ""),
                                Image = a.ImagePath
                            };
                    return query;
                }
                else
                {
                    return query;
                }
            }
        }

        ////Hàm cũ
        //[NonAction]
        //public IQueryable<VCWorkCheckModel> FuncJTable(string FromDate, string ToDate, string WpCode, string UserName, string CustomerName, string checkOut)
        //{
        //    var session = HttpContext.GetSessionUser();
        //    var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

        //    DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    bool hasCheckOut = false;
        //    if (!string.IsNullOrEmpty(checkOut))
        //        hasCheckOut = true;
        //    bool isCheckOut = false;
        //    if (hasCheckOut == true)
        //    {
        //        isCheckOut = bool.Parse(checkOut);
        //    }
        //    var dtnow = DateTime.Now;

        //    var query = from a in _context.VcWorkChecks.AsNoTracking()
        //                                  .Select(x => new { x.Id, x.UserName, x.CareCode, x.CheckinTime, x.CheckoutTime, x.Checkout, x.CreatedBy, x.Checkin, x.Review, x.Idea, x.Address, x.ImagePath })
        //                join b1 in _context.Users.AsNoTracking()
        //                                   .Select(x => new { x.UserName, x.Area, x.GivenName })
        //                                   on a.UserName equals b1.UserName into b2
        //                from b in b2.DefaultIfEmpty()
        //                join c in _context.VcSettingRoutes.Where(x => x.IsDeleted != true).AsNoTracking()
        //                                   .Select(x => new { x.WpCode, x.RouteCode, x.Node })
        //                                   on a.CareCode equals c.RouteCode
        //                join d1 in _context.Customerss.AsNoTracking()
        //                                        //.Select(x => new { x.CusCode, x.Area, x.CusName })
        //                                        on c.Node equals d1.CusCode into d2
        //                from d in d2.DefaultIfEmpty()
        //                where (string.IsNullOrEmpty(FromDate) || (a.CheckinTime.Value.Date == fromDate.Value.Date))
        //                && (string.IsNullOrEmpty(ToDate) || (a.CheckoutTime.Value.Date == toDate.Value.Date))
        //                && (string.IsNullOrEmpty(WpCode) || (c != null && !string.IsNullOrEmpty(c.WpCode) && c.WpCode.ToLower().Contains(WpCode.ToLower())))
        //                && (string.IsNullOrEmpty(UserName) || (b != null && !string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
        //                                                || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
        //                && (string.IsNullOrEmpty(CustomerName) || (d != null && !string.IsNullOrEmpty(d.CusCode) && d.CusCode == CustomerName))
        //                && (!hasCheckOut || ((isCheckOut == false && !a.Checkout.HasValue) || (isCheckOut == true && a.Checkout.HasValue)))

        //                 && (session.UserType == 10 ||
        //                    (session.TypeStaff == 10 && listArea.Any(y => !string.IsNullOrEmpty(y) && b != null && y == b.Area)) ||
        //                    (session.TypeStaff == 0 && a.CreatedBy == session.UserName))
        //                select new VCWorkCheckModel
        //                {
        //                    Id = a.Id,
        //                    CheckinTime = a.CheckinTime,
        //                    Checkin = a.Checkin,
        //                    Checkout = a.Checkout,
        //                    CheckoutTime = a.CheckoutTime,
        //                    CreatedBy = a.CreatedBy,
        //                    Review = a.Review,
        //                    Idea = a.Idea,
        //                    Address = a.Address,
        //                    Name = b != null ? b.GivenName : "",
        //                    CustomerName = d != null ? d.CusName : "",
        //                    WpCode = c != null ? c.WpCode : "",
        //                    TimeNode = (a.CheckinTime != null && a.CheckoutTime != null)
        //                                ? (a.CheckoutTime.Value.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm")
        //                                : (a.CheckinTime != null ? (dtnow.Subtract(a.CheckinTime.Value)).ToString(@"hh\:mm") : ""),
        //                    Image = a.ImagePath
        //                };
        //    return query;
        //}

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string FromDate, string ToDate, string WpCode, string UserName, string CustomerName, string orderBy, string Checkout)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            //Get data View
            var listData = FuncJTable(FromDate, ToDate, WpCode, UserName, CustomerName, Checkout).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
            var listExport = new List<VCWorkCheckExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new VCWorkCheckExportModel();
                itemExport.No = no;
                itemExport.WpCode = item.WpCode;
                itemExport.Name = item.Name;
                itemExport.CustomerName = item.CustomerName;
                itemExport.CheckinTime = item.CheckinTime != null ? item.CheckinTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                itemExport.CheckoutTime = item.CheckoutTime != null ? item.CheckoutTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
                itemExport.Checkout = item.Checkout != null ? "Đã làm xong" : "Đang làm việc";
                itemExport.TimeNode = item.TimeNode;

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
            IWorksheet sheetRequest = workbook.Worksheets.Create("NhanVienCheckinCheckout");
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

            sheetRequest.Range["A1"].Text = "NHÂN VIÊN CHECKIN/CHECKOUT";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "MÃ CÔNG VIỆC";
            sheetRequest["C2"].Text = "NHÂN VIÊN";
            sheetRequest["D2"].Text = "NPP/ĐL/CH";
            sheetRequest["E2"].Text = "THỜI GIAN ĐẾN";
            sheetRequest["F2"].Text = "THỜI GIAN ĐI";
            sheetRequest["G2"].Text = "TÌNH TRẠNG";
            sheetRequest["H2"].Text = "THỜI GIAN THỰC HIỆN";


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
            var fileName = "ExportNhanVienCheckinCheckout" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpGet]
        public JsonResult GetItem(int? id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = _context.VcWorkChecks.FirstOrDefault(x => x.Id == id);
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
               // msg.Title = "Có lỗi khi lấy dữ liệu";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }
        //Lấy list nhân viên
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
        //Lấy list Đại lý/Cửa hàng
        [HttpPost]
        public JsonResult GetListCustomer()
        {
            var session = HttpContext.GetSessionUser();
            var rs = GetListCustomerFunc(session).ToList();
            return Json(rs);
        }
        //[HttpGet]
        //public JsonResult CalculateSalary(string fromDate, string toDate)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    var timeWorking = new TimeSpan(8, 30, 0);
        //    var freeTime = new TimeSpan(1, 30, 0);
        //    var listSalary = new List<SalaryUserModel>();
        //    var timeWork = 0.0;
        //    var from = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var to = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    if (from != null && to != null)
        //    {
        //        var list = _context.StaffTimetableWorkings.Where(x => x.ActionTime >= from && x.ActionTime <= to);
        //        if (list.Any())
        //        {
        //            var listUser = list.GroupBy(x => x.UserId).Select(x => x.Key);
        //            foreach (var user in listUser)
        //            {
        //                var listForUser = list.Where(x => x.UserId == user);

        //                var listGoLateForUser = listForUser.Where(x => x.Action == StaffStauts.CheckIn.DescriptionAttr() && x.Session == 1 && x.ActionTime.TimeOfDay < timeWorking);
        //                var listNoWorking = listForUser.Where(x => x.Action == StaffStauts.NoWork.DescriptionAttr());
        //                var dayNoWork = Convert.ToInt32(listNoWorking.Where(x => x.ActionTo.HasValue).Select(x => x.ActionTo.Value.Subtract(x.ActionTime).Days).First());
        //                var listCheckInCheckOut = listForUser.Where(x => x.Action != StaffStauts.NoWork.DescriptionAttr());
        //                if (listCheckInCheckOut.Any())
        //                {
        //                    var listSession = listCheckInCheckOut.GroupBy(x => x.Session).Select(x => x.Key);
        //                    foreach (var item in listSession)
        //                    {
        //                        var session = listCheckInCheckOut.Where(x => x.Session == item);
        //                        if (session.Any())
        //                        {
        //                            var checkOut = session.FirstOrDefault(x => x.Action == StaffStauts.CheckOut.DescriptionAttr()).ActionTime;
        //                            var checkIn = session.FirstOrDefault(x => x.Action == StaffStauts.CheckIn.DescriptionAttr()).ActionTime;
        //                            timeWork = timeWork + ((checkOut.Subtract(checkIn)).TotalMinutes);
        //                        }
        //                    }
        //                }
        //                var model = new SalaryUserModel
        //                {
        //                    UserName = _context.Users.FirstOrDefault(x => x.Id == listForUser.First().UserId)?.GivenName,
        //                    NumberLate = listGoLateForUser.Count(),
        //                    TotalTimeLate = listGoLateForUser.Select(x => new
        //                    {
        //                        TimeLate = x.ActionTime.Subtract(timeWorking).TimeOfDay.TotalMinutes,
        //                    }).Sum(x => x.TimeLate),
        //                    NumberNoWork = dayNoWork,
        //                    TimeNoWork = (dayNoWork * 7.5),
        //                    NumberMinutesWork = timeWork - freeTime.TotalMinutes,
        //                    NumberHourseWork = Math.Round((timeWork - freeTime.TotalMinutes) / 60, 2),
        //                    NumberDayWork = Math.Round(((timeWork - freeTime.TotalMinutes) / 60) / 7.5, 2),
        //                };
        //                listSalary.Add(model);
        //            }
        //            msg.Object = listSalary;
        //        }
        //    }
        //    return Json(msg);
        //}
    }
}