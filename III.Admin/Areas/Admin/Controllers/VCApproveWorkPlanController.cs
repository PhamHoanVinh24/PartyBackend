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

    public class VCApproveWorkPlanController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;

        public class JTableVCApproveWorkPlanModelCustom : JTableModel
        {
            public string UserName { get; set; }
            public string Name { get; set; }
            public string WpCode { get; set; }
            public string CurrentStatus { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        public VCApproveWorkPlanController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager)
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
        public JsonResult JTable([FromBody]JTableVCApproveWorkPlanModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = FuncJTable(jTablePara.UserName, jTablePara.WpCode, jTablePara.CurrentStatus, jTablePara.FromDate, jTablePara.ToDate);

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "WpCode", "CurrentStatus", "FromDate", "ToDate", "WeekNo", "LeaderIdea", "UserName");
            return Json(jdata);
        }

        [NonAction]
        public IQueryable<VCApproveWorkPlanModel> FuncJTable(string userName, string wpCode, string currentStatus, string FromDate, string ToDate)
        {
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var session = HttpContext.GetSessionUser();
            //var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

            IQueryable<VCApproveWorkPlanModel> query = null;
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
                query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != WpStatus.WpDone.DescriptionAttr() && x.CurrentStatus != WpStatus.WpProcessing.DescriptionAttr()).AsNoTracking()
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

                         select new VCApproveWorkPlanModel
                         {
                             Id = a.Id,
                             WpCode = a.WpCode,
                             Name = b != null ? b.GivenName : "",
                             CurrentStatus = e != null ? e.ValueSet : "",
                             FromDate = a.FromDate,
                             ToDate = a.ToDate,
                             WeekNo = a.WeekNo,
                             LeaderIdea = a.LeaderIdea,
                             UserName = a.UserName,
                         });
                return query;
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

                    query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CurrentStatus != WpStatus.WpDone.DescriptionAttr() && x.CurrentStatus != WpStatus.WpProcessing.DescriptionAttr()).AsNoTracking()
                                                .Select(x => new { x.Id, x.UserName, x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate, x.CreatedBy, x.WeekNo, x.LeaderIdea })
                             join b in _context.Users.Where(x => x.Active).AsNoTracking()
                                                .Select(x => new { x.UserName, x.Area, x.GivenName })
                                                on a.UserName equals b.UserName
                             join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true).AsNoTracking()
                                                .Select(x => new { x.CodeSet, x.ValueSet })
                                                on a.CurrentStatus equals e1.CodeSet into e2
                             from e in e2.DefaultIfEmpty()
                                 //join c in listArea.Select(x => x.Code) on b.Area equals c
                             where
                             (string.IsNullOrEmpty(userName) || (!string.IsNullOrEmpty(a.UserName) && a.UserName == userName))

                             && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                             && (string.IsNullOrEmpty(currentStatus) || (e != null && e.CodeSet == currentStatus))
                             && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                             && (string.IsNullOrEmpty(FromDate) || (a.ToDate >= fromDate))
                             && ((b.Area.Contains(";") && session.Area.Contains(b.Area))
                                    || (!b.Area.Contains(";") && listArea.Any(y => y == b.Area)))
                             select new VCApproveWorkPlanModel
                             {
                                 Id = a.Id,
                                 WpCode = a.WpCode,
                                 Name = b != null ? b.GivenName : "",
                                 CurrentStatus = e != null ? e.ValueSet : "",
                                 FromDate = a.FromDate,
                                 ToDate = a.ToDate,
                                 WeekNo = a.WeekNo,
                                 LeaderIdea = a.LeaderIdea,
                                 UserName = a.UserName,
                             });
                    return query;
                }
                else if (session.TypeStaff == 0)
                {
                    //query = (from a in _context.VcWorkPlans.Where(x => x.IsDeleted != true && x.CreatedBy == session.UserName && x.CurrentStatus != WpStatus.WpDone.DescriptionAttr() && x.CurrentStatus != WpStatus.WpProcessing.DescriptionAttr()).AsNoTracking()
                    //                           .Select(x => new { x.Id, x.UserName, x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate, x.CreatedBy, x.WeekNo, x.LeaderIdea })
                    //         join b in _context.Users.Where(x => x.Active).AsNoTracking()
                    //                            .Select(x => new { x.UserName, x.Area, x.GivenName })
                    //                            on a.UserName equals b.UserName
                    //         join e1 in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true).AsNoTracking()
                    //                            .Select(x => new { x.CodeSet, x.ValueSet })
                    //                            on a.CurrentStatus equals e1.CodeSet into e2
                    //         from e in e2.DefaultIfEmpty()
                    //         where
                    //         (string.IsNullOrEmpty(userName) || (!string.IsNullOrEmpty(a.UserName) && a.UserName == userName))
                    //         && (string.IsNullOrEmpty(wpCode) || (!string.IsNullOrEmpty(a.WpCode) && a.WpCode.ToLower().Contains(wpCode.ToLower())))
                    //         && (string.IsNullOrEmpty(currentStatus) || (e != null && e.CodeSet == currentStatus))
                    //         && (string.IsNullOrEmpty(ToDate) || (a.FromDate <= toDate))
                    //         && (string.IsNullOrEmpty(FromDate) || (a.ToDate >= fromDate))

                    //         select new VCApproveWorkPlanModel
                    //         {
                    //             Id = a.Id,
                    //             WpCode = a.WpCode,
                    //             Name = b != null ? b.GivenName : "",
                    //             CurrentStatus = e != null ? e.ValueSet : "",
                    //             FromDate = a.FromDate,
                    //             ToDate = a.ToDate,
                    //             WeekNo = a.WeekNo,
                    //             LeaderIdea = a.LeaderIdea,
                    //         });
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
            var data = _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.CodeSet != WpStatus.WpCancel.DescriptionAttr() && x.CodeSet != WpStatus.WpDone.DescriptionAttr() && x.CodeSet != WpStatus.WpProcessing.DescriptionAttr()).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetListApproveStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.CodeSet != WpStatus.WpCancel.DescriptionAttr() && x.CodeSet != WpStatus.WpPending.DescriptionAttr() && x.CodeSet != WpStatus.WpDone.DescriptionAttr() && x.CodeSet != WpStatus.WpProcessing.DescriptionAttr()).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
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
            var listExport = new List<VCApproveWorkPlanExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new VCApproveWorkPlanExportModel();
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
            IWorksheet sheetRequest = workbook.Worksheets.Create("KeHoachCongViecDuyet");
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

            sheetRequest.Range["A1"].Text = "KẾ HOẠCH CÔNG VIỆC DUYỆT";
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
            var fileName = "ExportKeHoachCongViecDuyệt" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
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
                var chk = _context.VcWorkPlans.Any(x => x.IsDeleted != true && x.CurrentStatus != "WP_CANCEL" && x.CurrentStatus != "WP_DONE" && x.CurrentStatus != "WP_PROCESSING" && x.WpCode == wpCode);
                if (chk)
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
                                 select new VCApproveWorkPlanDetail
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
                                     //UserName = a.CreatedBy,
                                 }).ToList();
                    var query1 = query.Select((x, idx) => new VCApproveWorkPlanDetail
                    {
                        Id = x.Id,
                        Staff = x.Staff,
                        CustomerName = x.CustomerName,
                        CustomerAddress = x.CustomerAddress,
                        CurrentStatus = x.CurrentStatus,
                        Area = x.Area,
                        Proportion = x.Proportion,
                        TotalCanImp = x.TotalCanImp,
                        Note = x.Note,
                        //UserName = x.UserName,
                        No = idx + 1
                    }).OrderBy(x => x.CustomerName).ToList();

                    return Json(query1);
                }
                else
                {
                    return Json(new JMessage() { Error = true, Title = "Kế hoạch đã thực hiện hoặc đã bị xóa" });
                }
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

        [HttpPost]
        public JsonResult GetListNode(string username)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == username && x.Active);
                if (user != null)
                {
                    if (string.IsNullOrEmpty(user.Area))
                    {
                        msg.Error = true;
                       // msg.Title = "Người dùng không quản lý cửa hàng!";
                        msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_NON_STORE_USER_MANAGER"));

                    }
                    else
                    {
                        var listArea = user.Area.Split(';');
                        var data = _context.Customerss.Where(x => listArea.Any(y => y == x.Area) && x.IsDeleted == false)
                                    .Select(x => new { x.CusCode, x.CusName, x.Address }).AsNoTracking().ToList();
                        msg.Object = data;
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Người dùng không tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_USER_EXIST"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
               // msg.Title = "Lỗi khi load danh sách cửa hàng!";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_ERROR_LOAD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> InsertCustomer(string Username, string WpCode, string CusCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var chkExist = _context.VcSettingRoutes.Any(x => !x.IsDeleted && x.WpCode == WpCode && x.Node == CusCode);
                if (chkExist)
                {
                    msg.Error = true;
                   // msg.Title = "Cửa hàng đã có trong kế hoạch.";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_STORE_HAD_IN_PLAN"));
                }
                else
                {
                    var chk = _context.VcWorkPlans.Any(x => x.IsDeleted != true && x.CurrentStatus != "WP_CANCEL" && x.CurrentStatus != "WP_DONE" && x.CurrentStatus != "WP_PROCESSING" && x.WpCode == WpCode);
                    if (chk)
                    {
                        var order = _context.VcSettingRoutes.Any(x => !x.IsDeleted && x.WpCode == WpCode)
                                    ? _context.VcSettingRoutes.Where(x => !x.IsDeleted && x.WpCode == WpCode).Max(x => x.Order)
                                    : 1;
                        await FuncInsertSettingRoute(Username, WpCode, CusCode, "", order + 1, false);
                        await _context.SaveChangesAsync();
                       // msg.Title = "Thêm cửa hàng thành công.";
                        msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_ADD_STORE_SUCCESS"));
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Không sửa được kế hoạch đã thực hiện.";
                        msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_NOT_REPAIR_PLAN"));

                    }
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
              //  msg.Title = "Có lỗi thêm cửa hàng.";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_ERROR_ADD_STORE"));
            }
            return Json(msg);
        }

        //----------------------------------------------Xóa-------------------------------
        [HttpPost]
        public JsonResult DeleteCustomer(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.VcSettingRoutes.FirstOrDefault(x => !x.IsDeleted && x.Id == Id);
                if (data != null)
                {
                    var chk = _context.VcWorkPlans.Any(x => x.IsDeleted != true && x.CurrentStatus != "WP_CANCEL" && x.CurrentStatus != "WP_DONE" && x.CurrentStatus != "WP_PROCESSING" && x.WpCode == data.WpCode);
                    if (chk)
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;

                        _context.VcSettingRoutes.Update(data);

                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue(""));
                    }
                    else
                    {
                        msg.Error = true;
                      //  msg.Title = "Không sửa được kế hoạch đã thực hiện.";
                        msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_NOT_REPAIR_PLAN"));
                    }
                }
                else
                {
                    msg.Error = true;
                   // msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa"));
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_RECORD_NOT_EXIST_OR_DELETED"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
               // msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi xóa dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> ApproveWorkPlan(string WpCode, string CurrentStatus, string LeaderIdea)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (LeaderIdea == "undefined") LeaderIdea = "";

                var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                if (item != null)
                {
                    if (CurrentStatus == WpStatus.WpApproved.DescriptionAttr())
                    {
                        if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                        {
                            item.CurrentStatus = WpStatus.WpApproved.DescriptionAttr();
                            item.LeaderIdea = LeaderIdea;
                            item.ApprovedBy = ESEIM.AppContext.UserName;
                            item.ApprovedTime = DateTime.Now;

                            _context.VcWorkPlans.Update(item);

                            var msgFuncApproveWorkPlan = await FuncApproveWorkPlan(ESEIM.AppContext.UserName, WpCode, CurrentStatus, LeaderIdea);
                            if (msgFuncApproveWorkPlan.Error != true)
                            {
                                _context.SaveChanges();
                               // msg.Title = "Chuyển trạng thái duyệt thành công.";
                                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_CHANGE_STATUS_APPOVE_SUCCESS"));

                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = msgFuncApproveWorkPlan.Title;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                           // msg.Title = "Kế hoạch tuần đã/đang được thực hiện.";
                            msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_IMPLEMENTATION_PLAN"));
                        }
                    }
                    else if (CurrentStatus == WpStatus.WpReject.DescriptionAttr())
                    {
                        if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                        {
                            item.CurrentStatus = WpStatus.WpReject.DescriptionAttr();
                            item.LeaderIdea = LeaderIdea;
                            item.ApprovedBy = ESEIM.AppContext.UserName;
                            item.ApprovedTime = DateTime.Now;

                            _context.VcWorkPlans.Update(item);

                            var msgFuncApproveWorkPlan = await FuncApproveWorkPlan(ESEIM.AppContext.UserName, WpCode, CurrentStatus, LeaderIdea);
                            if (msgFuncApproveWorkPlan.Error != true)
                            {
                                _context.SaveChanges();
                               // msg.Title = "Chuyển trạng thái từ chối duyệt thành công.";
                                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_CHANGE_STATUS_REJECTED_APPROVE_SUCCESS"));
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = msgFuncApproveWorkPlan.Title;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                         //   msg.Title = "Kế hoạch tuần đã/đang được thực hiện.";
                            msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_IMPLEMENTATION_PLAN"));

                        }
                    }
                    else if (CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                    {
                        if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                        {
                            item.CurrentStatus = WpStatus.WpWaiting.DescriptionAttr();
                            item.LeaderIdea = LeaderIdea;
                            item.ApprovedBy = ESEIM.AppContext.UserName;
                            item.ApprovedTime = DateTime.Now;

                            _context.VcWorkPlans.Update(item);

                            var msgFuncApproveWorkPlan = await FuncApproveWorkPlan(ESEIM.AppContext.UserName, WpCode, CurrentStatus, LeaderIdea);
                            if (msgFuncApproveWorkPlan.Error != true)
                            {
                                _context.SaveChanges();
                                //msg.Title = "Chuyển trạng thái chờ duyệt thành công.";
                                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_CHANGE_STATUS_APPOVE_SUCCESS"));
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = msgFuncApproveWorkPlan.Title;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                          //  msg.Title = "Kế hoạch tuần đã/đang được thực hiện.";
                            msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_IMPLEMENTATION_PLAN"));
                        }
                    }
                    else
                    {
                        msg.Error = true;
                     //   msg.Title = "Truyền sai trạng thái yêu cầu.";
                        msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WRONG_STATUS_REQUIRED"));
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Kế hoạch tuần không tồn tại.";
                    msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_NOT_EXIST"));
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
               // msg.Title = "Có lỗi khi duyệt kế hoạch tuần.";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_WEEK_PLAN_ERROR_APPROVE"));
            }
            return Json(msg);
        }
        [NonAction]
        public async Task<JMessage> FuncApproveWorkPlan(string Username, string WpCode, string Status, string LeaderIdea, bool saveChange = false)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (LeaderIdea == "undefined") LeaderIdea = "";

                VcLeaderApprove obj = new VcLeaderApprove();

                obj.WpCode = WpCode;
                obj.Status = Status;
                obj.Note = LeaderIdea;
                obj.CreatedBy = Username;
                obj.CreatedTime = DateTime.Now;

                _context.VcLeaderApproves.Add(obj);

                if (saveChange)
                {
                    await _context.SaveChangesAsync();
                }
               // msg.Title = "Thêm bản ghi thành công";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_ADD_RECORD_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
              //  msg.Title = "Có lỗi khi thêm bản ghi.";
                msg.Title = String.Format(CommonUtil.ResourceValue("VCMM_MSG_ADD_RECORD_ERROR"));
            }
            return msg;
        }


    }
    public class VCApproveWorkPlanModel
    {
        public int Id { get; set; }
        public string WpCode { get; set; }
        public string Name { get; set; }
        public string CurrentStatus { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? WeekNo { get; set; }
        public string LeaderIdea { get; set; }
        public string UserName { get; set; }
    }
    public class VCApproveWorkPlanExportModel
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
    public class VCApproveWorkPlanDetail
    {
        public int No { get; set; }
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
        //public string UserName { get; set; }
    }
}