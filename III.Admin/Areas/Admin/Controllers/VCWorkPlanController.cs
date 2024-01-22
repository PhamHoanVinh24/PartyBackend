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
using ESEIM.Controllers;

namespace III.Admin.Controllers
{
    [Area("Admin")]

    public class VCWorkPlanController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;

        public class JTableVCWorkPlanModelCustom : JTableModel
        {
            public string UserName { get; set; }
            public string Name { get; set; }
            public string WpCode { get; set; }
            public string CurrentStatus { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        public VCWorkPlanController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager)
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
        public JsonResult JTable([FromBody]JTableVCWorkPlanModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = FuncJTable(jTablePara.UserName, jTablePara.WpCode, jTablePara.CurrentStatus, jTablePara.FromDate, jTablePara.ToDate);

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "WpCode", "CurrentStatus", "FromDate", "ToDate", "WeekNo", "LeaderIdea");
            return Json(jdata);
        }

        [NonAction]
        public IQueryable<VCWorkPlanModel> FuncJTable(string userName, string wpCode, string currentStatus, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var session = HttpContext.GetSessionUser();
            //var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

            IQueryable<VCWorkPlanModel> query = null;
            //if (session.UserType == 10)
            //{

            //}
            //else
            //{
            //    if (session.TypeStaff == 10)
            //    {

            //    }
            //    else if (session.TypeStaff == 0)
            //    {

            //    }
            //    else
            //    {

            //    }
            //}
            if (session.UserType == 10)
            {
                query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true).AsNoTracking()
                                            .Select(x => new { x.Id, x.UserName, x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate, x.CreatedBy, x.WeekNo, x.LeaderIdea })
                         join b in _context.Users.Where(x => x.Active).AsNoTracking()
                                            .Select(x => new { x.UserName, x.Area, x.GivenName })
                                            on a.UserName equals b.UserName
                         join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true).AsNoTracking()
                                            .Select(x => new { x.CodeSet, x.ValueSet })
                                            on a.CurrentStatus equals e1.CodeSet into e2
                         from e in e2.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(userName) || (!string.IsNullOrEmpty(a.UserName) && a.UserName == userName))

                         && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                         && (string.IsNullOrEmpty(currentStatus) || (e != null && e.CodeSet == currentStatus))
                         && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                         && (string.IsNullOrEmpty(FromDate) || (a.ToDate >= fromDate))

                         select new VCWorkPlanModel
                         {
                             Id = a.Id,
                             WpCode = a.WpCode,
                             Name = b != null ? b.GivenName : "",
                             CurrentStatus = e != null ? e.ValueSet : "",
                             FromDate = a.FromDate,
                             ToDate = a.ToDate,
                             WeekNo = a.WeekNo,
                             LeaderIdea = a.LeaderIdea,
                         });
                return query;
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = GetListAreaFunc(session);

                    query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true).AsNoTracking()
                                                .Select(x => new { x.Id, x.UserName, x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate, x.CreatedBy, x.WeekNo, x.LeaderIdea })
                             join b in _context.Users.Where(x => x.Active).AsNoTracking()
                                                .Select(x => new { x.UserName, x.Area, x.GivenName })
                                                on a.UserName equals b.UserName
                             join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true).AsNoTracking()
                                                .Select(x => new { x.CodeSet, x.ValueSet })
                                                on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                             join c in listArea.Select(x => x.Code) on b.Area equals c
                             where
                             (string.IsNullOrEmpty(userName) || (!string.IsNullOrEmpty(a.UserName) && a.UserName == userName))

                             && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                             && (string.IsNullOrEmpty(currentStatus) || (e != null && e.CodeSet == currentStatus))
                             && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                             && (string.IsNullOrEmpty(FromDate) || (a.ToDate >= fromDate))
                             //&& listArea.Select(x => x.Code).Any(y => !string.IsNullOrEmpty(y) && b != null && y == b.Area)
                             select new VCWorkPlanModel
                             {
                                 Id = a.Id,
                                 WpCode = a.WpCode,
                                 Name = b != null ? b.GivenName : "",
                                 CurrentStatus = e != null ? e.ValueSet : "",
                                 FromDate = a.FromDate,
                                 ToDate = a.ToDate,
                                 WeekNo = a.WeekNo,
                                 LeaderIdea = a.LeaderIdea,
                             });
                    return query;
                }
                else if (session.TypeStaff == 0)
                {
                    query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CreatedBy == session.UserName).AsNoTracking()
                                               .Select(x => new { x.Id, x.UserName, x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate, x.CreatedBy, x.WeekNo, x.LeaderIdea })
                             join b in _context.Users.Where(x => x.Active).AsNoTracking()
                                                .Select(x => new { x.UserName, x.Area, x.GivenName })
                                                on a.UserName equals b.UserName
                             join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true).AsNoTracking()
                                                .Select(x => new { x.CodeSet, x.ValueSet })
                                                on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                             where
                             (string.IsNullOrEmpty(userName) || (!string.IsNullOrEmpty(a.UserName) && a.UserName == userName))
                             && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                             && (string.IsNullOrEmpty(currentStatus) || (e != null && e.CodeSet == currentStatus))
                             && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                             && (string.IsNullOrEmpty(FromDate) || (a.ToDate >= fromDate))

                             select new VCWorkPlanModel
                             {
                                 Id = a.Id,
                                 WpCode = a.WpCode,
                                 Name = b != null ? b.GivenName : "",
                                 CurrentStatus = e != null ? e.ValueSet : "",
                                 FromDate = a.FromDate,
                                 ToDate = a.ToDate,
                                 WeekNo = a.WeekNo,
                                 LeaderIdea = a.LeaderIdea,
                             });
                    return query;
                }
                else
                {
                    return query;
                }
            }
        }

        [HttpPost]
        public object GetListCurrentStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.CodeSet != WpStatus.WpCancel.DescriptionAttr()).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
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
        public ActionResult ExportExcel(string page, string row, string userName, string wpCode, string currentStatus, string fromDate, string toDate, string orderBy)
        {
            int pageInt = int.Parse(page);
            int length = int.Parse(row);
            //Get data View
            var listData = FuncJTable(userName, wpCode, currentStatus, fromDate, toDate).OrderUsingSortExpression(orderBy).AsNoTracking().ToList();
            var listExport = new List<VCWorkPlanExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new VCWorkPlanExportModel();
                itemExport.No = no;
                itemExport.Name = item.Name;
                itemExport.WpCode = item.WpCode;
                itemExport.WeekNo = item.WeekNo;
                itemExport.FromDate = item.FromDate != null ? item.FromDate.ToString("dd/MM/yyyy") : "";
                itemExport.ToDate = item.ToDate != null ? item.ToDate.ToString("dd/MM/yyyy") : "";
                itemExport.CurrentStatus = item.CurrentStatus;
                itemExport.LeaderIdea = item.LeaderIdea == "undefined" ? "Không ý kiến" : item.LeaderIdea;
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
            IWorksheet sheetRequest = workbook.Worksheets.Create("KeHoachCongViec");
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

            sheetRequest.Range["A1"].Text = "DANH MỤC KẾ HOẠCH CÔNG VIỆC";
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
            sheetRequest["E2"].Text = "TỪ NGÀY";
            sheetRequest["F2"].Text = "ĐẾN NGÀY";
            sheetRequest["G2"].Text = "TÌNH TRẠNG";
            sheetRequest["H2"].Text = "Ý KIẾN NGƯỜI DUYỆT";


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
            var fileName = "ExportKeHoachCongViec" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
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
                var query = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted != true && x.CurrentStatus != "ROUTE_CANCEL" && x.WpCode == wpCode).AsNoTracking()
                                 //.Select(x => new { x.Node, x.CreatedBy, x.CurrentStatus, x.Id, x.TimePlan, x.Proportion, x.TotalCanImp, x.Note })
                             join b1 in _context.Users.AsNoTracking()
                                                //.Select(x => new { x.UserName, x.Area, x.GivenName })
                                                on a.CreatedBy equals b1.UserName into b2
                             from b in b2.DefaultIfEmpty()
                             join e1 in _context.CommonSettings.Where(x => x.Group == "ROUTE_CURRENT_STATUS").AsNoTracking()
                                                //.Select(x => new { x.CodeSet, x.ValueSet }) 
                                                on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                             join d in _context.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                               //.Select(x => new { x.CusCode, x.Area, x.CusName })
                                               on a.Node equals d.CusCode
                             join c1 in _context.CommonSettings.Where(x => x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)).AsNoTracking()
                                                //.Select(x => new { x.CodeSet, x.ValueSet })
                                                on d.Area equals c1.CodeSet into c2
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
                             select new VCWorkPlanDetail
                             {
                                 Id = a.Id,
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
        public WorkPlanInsert GetItemDetail(int id)
        {
            WorkPlanInsert rs = new WorkPlanInsert();
            var wp = _context.VcWorkPlans.FirstOrDefault(x => x.IsDeleted != true && x.Id == id);
            rs.Id = id;
            rs.username = wp.UserName;
            rs.WpCode = wp.WpCode;
            rs.WeekNo = wp.WeekNo;
            rs.FromDate = wp.FromDate.ToString("dd-MM-yyyy");
            rs.ToDate = wp.ToDate.ToString("dd-MM-yyyy");
            rs.list_detail = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted != true && x.CurrentStatus != "ROUTE_CANCEL" && x.WpCode == wp.WpCode)
                              join b in _context.Customerss.Where(x => !x.IsDeleted) on a.Node equals b.CusCode
                              select new SettingRouteModel
                              {
                                  sltNode = a.Node,
                                  NameNode = b.CusName,
                                  Address = b.Address
                              }).ToList();
            return rs;
        }

        //Lấy list Đại lý/Cửa hàng
        [HttpGet]
        public JsonResult GetListCustomer(int id)
        {
            var userName = _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.Id == id).Select(x => x.UserName).AsNoTracking().FirstOrDefault();
            var ar = _context.Users.Where(x => x.Active && x.UserName == userName).Select(x => x.Area).AsNoTracking().FirstOrDefault();
            var listArea = !string.IsNullOrEmpty(ar) ? ar.Split(';') : new string[1000];
            var listCustomer = _context.Customerss
                                        .Where(x => !x.IsDeleted && listArea.Any(y => !string.IsNullOrEmpty(y) && y == x.Area))
                                        .Select(x => new { Code = x.CusCode, Name = x.CusName, x.Address })
                                        .AsNoTracking()
                                        .ToList();
            return Json(listCustomer);
        }

        [HttpPost]
        public async Task<JsonResult> Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted != true);
                if (item != null)
                {
                    if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                    {
                        item.CurrentStatus = WpStatus.WpCancel.DescriptionAttr();
                        item.IsDeleted = true;

                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;

                        _context.VcWorkPlans.Update(item);

                        var listSettingRoute = _context.VcSettingRoutes.Where(x => x.WpCode == item.WpCode && x.IsDeleted != true && x.CurrentStatus == RouteStatus.RoutePending.DescriptionAttr()).ToList();
                        foreach (var ite in listSettingRoute)
                        {
                            ite.IsDeleted = true;
                            ite.CurrentStatus = RouteStatus.RouteCancel.DescriptionAttr();
                            ite.DeletedBy = ESEIM.AppContext.UserName;
                            ite.DeletedTime = DateTime.Now;

                            _context.VcSettingRoutes.Update(ite);
                        }

                        _context.SaveChanges();
                        //msg.Title = "Xóa kế hoạch tuần thành công";
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("VCMM_MSG_PLAN"));


                    }
                    else
                    {
                        msg.Error = true;
                       // msg.Title = "Kế hoạch tuần đã duyệt không được xóa.";
                        msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_NOT_DELETE"));
                    }
                }
                else
                {
                    msg.Error = true;
                  //  msg.Title = "Kế hoạch tuần không tồn tại hoặc đã bị xóa.";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_NOT_EXIST"));
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
               // msg.Title = "Có lỗi khi xóa kế hoạch tuần.";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_ERRORED_DELETE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateCustomer(string wpCode, string cusCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var hasItem = await _context.VcSettingRoutes.AnyAsync(x => x.IsDeleted != true && x.WpCode == wpCode && x.Node == cusCode);
                if (!hasItem)
                {
                    var wp = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.IsDeleted != true && x.WpCode == wpCode);
                    wp.UpdatedBy = ESEIM.AppContext.UserName;
                    wp.UpdatedTime = DateTime.Now;
                    wp.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

                    _context.VcWorkPlans.Update(wp);


                    var maxOder = await _context.VcSettingRoutes.Where(x => x.WpCode == wpCode).MaxAsync(x => x.Order);
                    maxOder = maxOder + 1;
                    VcSettingRoute obj = new VcSettingRoute();

                    obj.RouteCode = wpCode + "_" + maxOder;
                    obj.WpCode = wpCode;
                    obj.Node = cusCode;
                    //obj.TimeWork = dTimeWork;
                    //obj.Note = note;
                    obj.Order = maxOder;
                    obj.TimePlan = DateTime.Now;
                    obj.CurrentStatus = RouteStatus.RoutePending.DescriptionAttr();

                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;

                    _context.VcSettingRoutes.Add(obj);

                    await _context.SaveChangesAsync();
                   //msg.Title = "Thêm cửa hàng vào kế hoạch tuần thành công";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_ADD_STORE_SUCCESS"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Cửa hàng đã có trong kế hoạch tuần.";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_HAD_STORE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
               // msg.Title = "Có lỗi khi thêm cửa hàng vào kế hoạch tuần.";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_ERROR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteCustomer(string wpCode, string cusCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var hasItem = await _context.VcSettingRoutes.AnyAsync(x => x.IsDeleted != true && x.WpCode == wpCode && x.Node == cusCode);
                if (hasItem)
                {
                    var wp = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.IsDeleted != true && x.WpCode == wpCode);
                    wp.UpdatedBy = ESEIM.AppContext.UserName;
                    wp.UpdatedTime = DateTime.Now;
                    wp.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

                    _context.VcWorkPlans.Update(wp);

                    var ite = await _context.VcSettingRoutes.FirstOrDefaultAsync(x => x.IsDeleted != true && x.WpCode == wpCode && x.Node == cusCode);
                    ite.IsDeleted = true;
                    ite.CurrentStatus = RouteStatus.RouteCancel.DescriptionAttr();
                    ite.DeletedBy = ESEIM.AppContext.UserName;
                    ite.DeletedTime = DateTime.Now;
                    _context.VcSettingRoutes.Update(ite);

                    await _context.SaveChangesAsync();
                    //msg.Title = "Xóa cửa hàng khỏi kế hoạch tuần thành công";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_DELETE_STORE_SUCCESS"));
                }
                else
                {
                    msg.Error = true;
                   // msg.Title = "Cửa hàng không có trong kế hoạch tuần.";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_NOT_STORE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
               // msg.Title = "Có lỗi khi xóa cửa hàng khỏi kế hoạch tuần.";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_ERROR_DELETE_STORE"));
            }
            return Json(msg);
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
    public class VCWorkPlanModel
    {
        public int Id { get; set; }
        public string WpCode { get; set; }
        public string Name { get; set; }
        public string CurrentStatus { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? WeekNo { get; set; }
        public string LeaderIdea { get; set; }
    }
    public class VCWorkPlanExportModel
    {
        public int No { get; set; }
        public string Name { get; set; }
        public string WpCode { get; set; }
        public int? WeekNo { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string CurrentStatus { get; set; }
        public string LeaderIdea { get; set; }
    }
    public class VCWorkPlanDetail
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
    }
}