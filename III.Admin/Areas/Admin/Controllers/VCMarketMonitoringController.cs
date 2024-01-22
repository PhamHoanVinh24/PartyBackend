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
using ESEIM;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class VCMarketMonitoringController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;

        public class JTableVCMarketMonitoringModelCustom : JTableModel
        {
            public string UserName { get; set; }
            public string Name { get; set; }
            public string WpCode { get; set; }
            public string CurrentStatus { get; set; }
            public string fromDateSearch { get; set; }
            public string toDateSearch { get; set; }

        }
        public VCMarketMonitoringController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager)
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
        public JsonResult JTable([FromBody]JTableVCMarketMonitoringModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = FuncJTable(jTablePara.UserName, jTablePara.WpCode, jTablePara.CurrentStatus, jTablePara.fromDateSearch, jTablePara.toDateSearch);

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "WpCode", "CurrentStatus", "Percent", "CountDone", "CountTotal", "FromDate", "ToDate", "WeekNo");
            return Json(jdata);
        }

        [NonAction]
        public IQueryable<VCMarketMonitoringModel> FuncJTable(string UserName, string wpCode, string currentStatus, string fromDateSearch, string toDateSearch)
        {
            var session = HttpContext.GetSessionUser();
            //var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];
            var fromDate = !string.IsNullOrEmpty(fromDateSearch) ? DateTime.ParseExact(fromDateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(toDateSearch) ? DateTime.ParseExact(toDateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            IQueryable<VCMarketMonitoringModel> query1 = null;

            if (session.UserType == 10)
            {
                query1 = from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != "WP_REJECT")
                                          .Select(x => new
                                          {
                                              x.Id,
                                              UserName = x.UserName,
                                              x.CurrentStatus,
                                              x.WpCode,
                                              x.CreatedBy,
                                              x.FromDate,
                                              x.ToDate,
                                              x.WeekNo
                                          })
                         join b1 in _context.Users on a.UserName equals b1.UserName into b2
                         from b in b2.DefaultIfEmpty()
                         join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true) on a.CurrentStatus equals e1.CodeSet into e2
                         from e in e2.DefaultIfEmpty()
                         join c1 in _context.VcSettingRoutes.Where(x => x.IsDeleted != true) on a.WpCode equals c1.WpCode into c2
                         from c in c2.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(UserName) || (!string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
                                                     || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
                         && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                         && (string.IsNullOrEmpty(currentStatus) || e.ValueSet == currentStatus)
                        &&
                        (
                            (fromDate == null && toDate == null)
                            || (fromDate != null && toDate == null && (fromDate <= a.FromDate.Date || fromDate <= a.ToDate.Date))
                            || (fromDate == null && toDate != null && (a.FromDate.Date <= toDate || a.ToDate.Date <= toDate))
                            || (fromDate != null && toDate != null && (fromDate <= a.FromDate.Date && a.FromDate.Date <= a.ToDate.Date && a.ToDate.Date <= toDate))
                        )
                         select new VCMarketMonitoringModel
                         {
                             Id = a.Id,
                             WpCode = a.WpCode,
                             Name = b != null ? b.GivenName : "",
                             CurrentStatus = e != null ? e.ValueSet : "",
                             CurrentStatusCode = c != null ? c.CurrentStatus : "",
                             FromDate = a.FromDate.ToString("dd/MM/yyyy"),
                             ToDate = a.ToDate.ToString("dd/MM/yyyy"),
                             WeekNo = a.WeekNo,
                         };
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = GetListAreaFunc(session);

                    query1 = from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != "WP_REJECT")
                                          .Select(x => new { x.Id, UserName = x.UserName, x.CurrentStatus, x.WpCode, x.CreatedBy, x.FromDate, x.ToDate, x.WeekNo })
                             join b in _context.Users on a.UserName equals b.UserName
                             join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true) on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                             join c1 in _context.VcSettingRoutes.Where(x => x.IsDeleted != true) on a.WpCode equals c1.WpCode into c2
                             from c in c2.DefaultIfEmpty()
                             join d in listArea.Select(x => x.Code) on b.Area equals d
                             where
                             (string.IsNullOrEmpty(UserName) || (!string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
                                                         || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
                             && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                             && (string.IsNullOrEmpty(currentStatus) || e.ValueSet == currentStatus)

                            &&
                            (
                                (fromDate == null && toDate == null)
                                || (fromDate != null && toDate == null && (fromDate <= a.FromDate.Date || fromDate <= a.ToDate.Date))
                                || (fromDate == null && toDate != null && (a.FromDate.Date <= toDate || a.ToDate.Date <= toDate))
                                || (fromDate != null && toDate != null && (fromDate <= a.FromDate.Date && a.FromDate.Date <= a.ToDate.Date && a.ToDate.Date <= toDate))
                            )
                             select new VCMarketMonitoringModel
                             {
                                 Id = a.Id,
                                 WpCode = a.WpCode,
                                 Name = b != null ? b.GivenName : "",
                                 CurrentStatus = e != null ? e.ValueSet : "",
                                 CurrentStatusCode = c != null ? c.CurrentStatus : "",
                                 FromDate = a.FromDate.ToString("dd/MM/yyyy"),
                                 ToDate = a.ToDate.ToString("dd/MM/yyyy"),
                                 WeekNo = a.WeekNo,
                             };
                }
                else if (session.TypeStaff == 0)
                {
                    query1 = from a in _context.VcWorkPlans.Where(x => x.CreatedBy == session.UserName && x.IsDeleted != true && x.CurrentStatus != "WP_REJECT")
                                         .Select(x => new { x.Id, UserName = x.UserName, x.CurrentStatus, x.WpCode, x.CreatedBy, x.FromDate, x.ToDate, x.WeekNo })
                             join b1 in _context.Users on a.UserName equals b1.UserName into b2
                             from b in b2.DefaultIfEmpty()
                             join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true) on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                             join c1 in _context.VcSettingRoutes.Where(x => x.IsDeleted != true) on a.WpCode equals c1.WpCode into c2
                             from c in c2.DefaultIfEmpty()
                             where
                             (string.IsNullOrEmpty(UserName) || (!string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
                                                         || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
                             && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                             && (string.IsNullOrEmpty(currentStatus) || e.ValueSet == currentStatus)

                            &&
                            (
                                (fromDate == null && toDate == null)
                                || (fromDate != null && toDate == null && (fromDate <= a.FromDate.Date || fromDate <= a.ToDate.Date))
                                || (fromDate == null && toDate != null && (a.FromDate.Date <= toDate || a.ToDate.Date <= toDate))
                                || (fromDate != null && toDate != null && (fromDate <= a.FromDate.Date && a.FromDate.Date <= a.ToDate.Date && a.ToDate.Date <= toDate))
                            )
                             select new VCMarketMonitoringModel
                             {
                                 Id = a.Id,
                                 WpCode = a.WpCode,
                                 Name = b != null ? b.GivenName : "",
                                 CurrentStatus = e != null ? e.ValueSet : "",
                                 CurrentStatusCode = c != null ? c.CurrentStatus : "",
                                 FromDate = a.FromDate.ToString("dd/MM/yyyy"),
                                 ToDate = a.ToDate.ToString("dd/MM/yyyy"),
                                 WeekNo = a.WeekNo,
                             };
                }
            }

            var query = query1.GroupBy(p => new
            {
                p.WpCode
            })
                                .Select(g => new VCMarketMonitoringModel
                                {
                                    Id = g.FirstOrDefault().Id,
                                    WpCode = g.Key.WpCode,
                                    Name = g.FirstOrDefault().Name,
                                    CurrentStatus = g.FirstOrDefault().CurrentStatus,
                                    CountTotal = g.Count(),
                                    CountDone = g.Count(x => x.CurrentStatusCode == "ROUTE_DONE"),
                                    Percent = g.Count() == 0 ? 0 : (g.Count(x => x.CurrentStatusCode == "ROUTE_DONE") * 100.0) / g.Count(),
                                    FromDate = g.FirstOrDefault().FromDate,
                                    ToDate = g.FirstOrDefault().ToDate,
                                    WeekNo = g.FirstOrDefault().WeekNo,
                                });
            return query;
        }

        ////Hàm cũ
        //[NonAction]
        //public IQueryable<VCMarketMonitoringModel> FuncJTable(string UserName, string wpCode, string currentStatus, string fromDateSearch, string toDateSearch)
        //{
        //    var session = HttpContext.GetSessionUser();
        //    var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];
        //    var fromDate = !string.IsNullOrEmpty(fromDateSearch) ? DateTime.ParseExact(fromDateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toDate = !string.IsNullOrEmpty(toDateSearch) ? DateTime.ParseExact(toDateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //    var query1 = from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != "WP_REJECT")
        //                                 .Select(x => new { x.Id, UserName = x.UserName, x.CurrentStatus, x.WpCode, x.CreatedBy, x.FromDate, x.ToDate })
        //                 join b1 in _context.Users on a.UserName equals b1.UserName into b2
        //                 from b in b2.DefaultIfEmpty()
        //                 join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true) on a.CurrentStatus equals e1.CodeSet into e2
        //                 from e in e2.DefaultIfEmpty()
        //                 join c1 in _context.VcSettingRoutes.Where(x => x.IsDeleted != true) on a.WpCode equals c1.WpCode into c2
        //                 from c in c2.DefaultIfEmpty()
        //                 where
        //                 (string.IsNullOrEmpty(UserName) || (!string.IsNullOrEmpty(b.UserName) && b.UserName == UserName)
        //                                             || (!string.IsNullOrEmpty(a.UserName) && a.UserName == UserName))
        //                 && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
        //                 && (string.IsNullOrEmpty(currentStatus) || e.ValueSet == currentStatus)

        //                 && (session.UserType == 10 ||
        //                    (session.TypeStaff == 10 && listArea.Any(y => !string.IsNullOrEmpty(y) && b != null && y == b.Area)) ||
        //                    (session.TypeStaff == 0 && a.CreatedBy == session.UserName))
        //                &&
        //                (
        //                    (fromDate == null && toDate == null)
        //                    || (fromDate != null && toDate == null && (fromDate <= a.FromDate.Date || fromDate <= a.ToDate.Date))
        //                    || (fromDate == null && toDate != null && (a.FromDate.Date <= toDate || a.ToDate.Date <= toDate))
        //                    || (fromDate != null && toDate != null && (fromDate <= a.FromDate.Date && a.FromDate.Date <= a.ToDate.Date && a.ToDate.Date <= toDate))
        //                )
        //                 select new VCMarketMonitoringModel
        //                 {
        //                     Id = a.Id,
        //                     WpCode = a.WpCode,
        //                     Name = b != null ? b.GivenName : "",
        //                     CurrentStatus = e != null ? e.ValueSet : "",
        //                     CurrentStatusCode = c != null ? c.CurrentStatus : "",
        //                     FromDate = a.FromDate.ToString("dd/MM/yyyy"),
        //                     ToDate = a.ToDate.ToString("dd/MM/yyyy"),
        //                 };

        //    var query = query1.GroupBy(p => new
        //    {
        //        p.WpCode
        //    })
        //                        .Select(g => new VCMarketMonitoringModel
        //                        {
        //                            Id = g.FirstOrDefault().Id,
        //                            WpCode = g.Key.WpCode,
        //                            Name = g.FirstOrDefault().Name,
        //                            CurrentStatus = g.FirstOrDefault().CurrentStatus,
        //                            CountTotal = g.Count(),
        //                            CountDone = g.Count(x => x.CurrentStatusCode == "ROUTE_DONE"),
        //                            Percent = g.Count() == 0 ? 0 : (g.Count(x => x.CurrentStatusCode == "ROUTE_DONE") * 100.0) / g.Count(),
        //                            FromDate = g.FirstOrDefault().FromDate,
        //                            ToDate = g.FirstOrDefault().ToDate,
        //                        });

        //    return query;
        //}

        [HttpPost]
        public object GetListCurrentStatus()
        {
            //var query = GetIncentProListMax();
            var query = from a in _context.CommonSettings
                        where a.Group == "WP_CURRENT_STATUS"
                        && a.IsDeleted != true
                        && a.CodeSet != "WP_CANCEL"
                        && a.CodeSet != "WP_REJECT"
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        };
            return Json(query);
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

        [HttpGet]
        public ActionResult ExportExcel(string page, string row, string UserName, string wpCode, string currentStatus, string orderBy, string fromDateSearch, string toDateSearch)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            //Get data View
            var listData = FuncJTable(UserName, wpCode, currentStatus, fromDateSearch, toDateSearch).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
            var listExport = new List<VCMarketMonitoringExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new VCMarketMonitoringExportModel();
                itemExport.No = no;
                itemExport.Name = item.Name;
                itemExport.WpCode = item.WpCode;
                itemExport.WeekNo = item.WeekNo.ToString();
                itemExport.FromDate = item.FromDate;
                itemExport.ToDate = item.ToDate;
                itemExport.CurrentStatus = item.CurrentStatus;
                itemExport.Percent = item.Percent.ToString("0.##") + "% - (" + item.CountDone + "/" + item.CountTotal + ")";

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
            IWorksheet sheetRequest = workbook.Worksheets.Create("TinhTrangCongViec");
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

            sheetRequest.Range["A1"].Text = "TÌNH TRẠNG CÔNG VIỆC";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "NHÂN VIÊN";
            sheetRequest["C2"].Text = "MÃ KẾ HOẠCH";
            sheetRequest["D2"].Text = "TUẦN THỨ";
            sheetRequest["E2"].Text = "NGÀY BẮT ĐẦU";
            sheetRequest["F2"].Text = "NGÀY KẾT THÚC";
            sheetRequest["G2"].Text = "TÌNH TRẠNG";
            sheetRequest["H2"].Text = "% HOÀN THÀNH";


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
            var fileName = "ExportTinhTrangCongViec" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }


        [HttpGet]
        public object GetItem(string wpCode)
        {
            try
            {
                var query = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted != true && x.CurrentStatus != "ROUTE_CANCEL" && x.WpCode == wpCode)
                             join e1 in _context.CommonSettings.Where(x => x.Group == "ROUTE_CURRENT_STATUS") on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                             join b1 in _context.Users on a.CreatedBy equals b1.UserName into b2
                             from b in b2.DefaultIfEmpty()
                             join d in _context.Customerss.Where(x => x.IsDeleted == false) on a.Node equals d.CusCode
                             join c1 in _context.CommonSettings.Where(x => x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)) on d.Area equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                                 //where
                                 //a.CurrentStatus != "ROUTE_CANCEL"
                                 //&& (string.IsNullOrEmpty(CustomerName) || (d != null && !string.IsNullOrEmpty(d.Company_Name) && d.Company_Name.ToLower().Contains(CustomerName.ToLower())))
                                 //&& (string.IsNullOrEmpty(Area) || (c != null && !string.IsNullOrEmpty(c.Code) && c.Code == Area))
                                 //&& (string.IsNullOrEmpty(Staff) || (b != null && !string.IsNullOrEmpty(b.Name) && b.Name.ToLower().Contains(Staff.ToLower())))
                                 //&& (string.IsNullOrEmpty(FromDate) || (a.CreatedTime >= fromDate))
                                 //&& (string.IsNullOrEmpty(ToDate) || (a.CreatedTime <= toDate))
                                 //    group new { a, b, c, d } by new { d.Company_Name }
                                 //into grp
                                 //orderby grp.Key.Company_Name
                             select new VCMarketMonitoringDetail
                             {
                                 Id = a.Id,
                                 RouteCode = a.RouteCode,
                                 Staff = b != null ? b.GivenName : "Không xác định",
                                 CustomerName = d != null ? d.CusName : "Không xác định",
                                 CustomerAddress = d != null ? d.Address : "Không xác định",
                                 //TimePlan = a.TimePlan.Value.ToString("dd/MM/yyyy HH:mm"),
                                 CurrentStatus = e != null ? e.ValueSet : "Không xác định",
                                 Area = c != null ? c.ValueSet : "Không xác định",
                                 Proportion = a.Proportion,
                                 TotalCanImp = a.TotalCanImp,
                                 Note = a.Note,
                             });

                return Json(query);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }


        [HttpGet]
        public object GetDetailNode(string RouteCode)
        {
            try
            {
                var query = (from a in _context.VcCustomerCares.Where(x => x.IsDeleted != true && x.RouteCode == RouteCode)
                                 //join d1 in _context.E_Companys.Where(x => x.Flag == 1) on a.Node equals d1.Company_Code into d2
                                 //from d in d2.DefaultIfEmpty()
                                 //join b1 in _context.VcDrivers on a.CreatedBy equals b1.Username into b2
                                 //from b in b2.DefaultIfEmpty()
                             join c1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND") on a.BrandCode equals c1.CodeSet into c2
                             from c in c2.DefaultIfEmpty()
                             join e1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals e1.ProductCode into e2
                             from e in e2.DefaultIfEmpty()

                             select new
                             {
                                 a.Id,
                                 a.BrandCode,
                                 BrandName = c != null ? c.ValueSet : "Không xác định",
                                 a.ProductCode,
                                 ProductName = e != null ? e.ProductName : "Không xác định",
                                 a.BuyCost,
                                 a.SaleCost,
                                 a.ConsumpMonthly,
                                 a.Instock,


                             });

                return Json(query);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }

        //[HttpPost]
        //public JsonResult Update([FromBody]Maintain_material_details obj)
        //{
        //    var company_code = HttpContext.GetSessionUser()?.CompanyCode;
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
        //            obj2.Company_code = company_code;
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
        //    var company_code = HttpContext.GetSessionUser()?.CompanyCode;
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
        //            Company_code = company_code,
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
    public class VCMarketMonitoringModel
    {
        public int Id { get; set; }
        public string WpCode { get; set; }
        public string Name { get; set; }
        public string CurrentStatus { get; set; }
        public string CurrentStatusCode { get; set; }
        public int CountTotal { get; set; }
        public int CountDone { get; set; }
        public double Percent { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public int? WeekNo { get; set; }

    }
    public class VCMarketMonitoringExportModel
    {
        public int No { get; set; }
        public string Name { get; set; }
        public string WpCode { get; set; }
        public string WeekNo { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string CurrentStatus { get; set; }
        public string Percent { get; set; }
    }
    public class VCMarketMonitoringDetail
    {
        public int Id { get; set; }
        public string Staff { get; set; }
        public string CustomerName { get; set; }
        public string CustomerAddress { get; set; }
        //public string TimePlan { get; set; }
        public string CurrentStatus { get; set; }
        public string Area { get; set; }
        public decimal? Proportion { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Note { get; set; }
        public string RouteCode { get; set; }

    }
}