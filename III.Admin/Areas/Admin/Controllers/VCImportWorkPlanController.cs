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
using Microsoft.AspNetCore.Http;
using III.Domain.Enums;
using ESEIM.Controllers;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class VCImportWorkPlanController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        public static List<Progress> progress;
        private static List<ExcelPayrollBulkResultError> excelResultError;

        public VCImportWorkPlanController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext)
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
        public JsonResult UploadPayrollBulk(IFormFile fileUpload)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                //var logger = LogManager.GetLogger(typeof(Program));
                //logger.Info("-------------------Start Import Excel---------------------:" + DateTime.Now);
                List<ReadWorkPlanExcelImp> listTotal = GetListInExcel(fileUpload);
                List<ReadWorkPlanExcelImp> listResult = new List<ReadWorkPlanExcelImp>();
                if (listTotal.Count == 0 || !Chk5RowFirstNotNull(listTotal))
                {
                    msg.Error = true;
                    msg.Title = "Tệp tin sai định dạng.";
                }
                else
                {
                    var idx = 1;
                    SessionUserLogin session = HttpContext.GetSessionUser();
                    var listChkDb = ChkDB4List(listTotal);
                    listResult.AddRange(listChkDb.Where(x => x.Tab == "Error"));

                    var grUserName = listChkDb.Where(x => x.Tab == "New").GroupBy(x => x.UserName).ToList();
                    foreach (var userName in grUserName)
                    {
                        var user = userName.Key;
                        var listRecord4User = userName.ToList();
                        var listAfterChk4UserName = ChkList4UserName(user, listRecord4User);
                        if (listAfterChk4UserName.IsContinueChk == false)
                        {
                            listResult.AddRange(listAfterChk4UserName.ListResult);
                        }
                        else
                        {
                            //ChkRowData(listAfterChk4UserName.ListResult[0]);
                            listResult.AddRange(listAfterChk4UserName.ListResult);
                        }
                        idx = idx + 1;
                    }
                }
                CreateError(listResult);
                msg.Object = listResult;
            }
            catch (Exception ex)
            {
                msg.Title = ex.ToString();
            }
            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> SaveItems([FromBody]List<ReadWorkPlanExcelImp> list)
        {
            var session = HttpContext.GetSessionUser();
            var length = list.Count();
            var has = false;
            if (progress == null)
                progress = new List<Progress>();
            foreach (var item1 in progress)
            {
                if (item1.user == ESEIM.AppContext.UserName)
                {
                    item1.percent = "Processing...";
                }
            }
            JMessage msg = new JMessage();
            try
            {
                int count = 1;
                var isNew = list[0].Tab == "New" ? true : false;


                var grUserName = list.GroupBy(x => x.UserName).ToList();
                foreach (var recordWp in grUserName)
                {
                    var userName = recordWp.Key;
                    var listRecord4User = recordWp.ToList();

                    foreach (var item1 in progress)
                    {
                        if (item1.user == ESEIM.AppContext.UserName)
                        {
                            has = true;
                            if (count != length)
                                item1.percent = "Processing: " + count + "/" + length;
                            else
                                item1.percent = "Done";
                            break;
                        }
                    }
                    if (!has)
                    {
                        Progress ex = new Progress();
                        ex.user = ESEIM.AppContext.UserName;
                        if (count != length)
                            ex.percent = "Processing: " + count + "/" + length;
                        else
                            ex.percent = "Done";
                        progress.Add(ex);
                    }

                    if (isNew)
                    {
                        JMessage msgWorkPlan = await FuncInsertWorkPlan(listRecord4User[0].UserName, "", listRecord4User[0].WeekNo, "", false);
                        var objWp = (WorkPlanRes)msgWorkPlan.Object;
                        await _context.SaveChangesAsync();
                        var maxOrder = 1;
                        foreach (var item in listRecord4User)
                        {
                            await FuncInsertSettingRoute(item.UserName, objWp.WpCode, item.CusCode, item.Note, maxOrder, false);
                            maxOrder = maxOrder + 1;
                            await _context.SaveChangesAsync();
                        }
                    }
                    //else
                    //{


                    //}
                    count++;
                }

                await _context.SaveChangesAsync();
                msg.Error = false;
                if (list[0].Tab == "New")
                    msg.Title = "Thêm lô kế hoạch tuần thành công";
                else if (list[0].Tab == "Update")
                {
                    msg.Title = "Chỉnh sửa lô kế hoạch tuần thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                if (list[0].Tab == "New")
                    msg.Title = "Thêm lô kế hoạch tuần lỗi";
                else if (list[0].Tab == "Update")
                {
                    msg.Title = "Chỉnh sửa lô kế hoạch tuần lỗi";
                }
            }
            msg.Object = list;
            return Json(msg);
        }


        [NonAction]
        public async Task<JMessage> FuncInsertWorkPlan(string username, string WpCode, string WeekNo, string Description, bool saveChange = false)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //DateTime? dFromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                //DateTime? dToDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                //var fromDate = dFromDate?.ToString("yyyyMMdd");
                //var toDate = dToDate?.ToString("yyyyMMdd");

                int nWeekNo = int.Parse(WeekNo);
                //int.TryParse(WeekNo, out nWeekNo);
                var dtNow = DateTime.Now;
                var dtYear = dtNow.Year;
                var maxFromDate = dtNow.AddDays(7);

                DateTime dFromDate = CommonUtil.FirstDateOfWeekISO8601(dtYear, nWeekNo);

                DateTime dToDate = dFromDate.AddDays(6);
                if (dFromDate < maxFromDate)
                {
                    //Nếu WpCode = null thì là insert mới
                    if (string.IsNullOrEmpty(WpCode))
                    {
                        WpCode = username + "_" + dFromDate.Year + "_" + WeekNo;

                        var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                        if (item == null)
                        {
                            var checkTime = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.UserName == username && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);
                            if (checkTime != null)
                            {
                                msg.Error = true;
                                msg.Title = "Kế hoạch cho tuần này đã được lập.";
                            }
                            else
                            {
                                var checkDoing = await _context.VcWorkPlans.Where(x => x.UserName == username && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true).OrderByDescending(x => x.ToDate).FirstOrDefaultAsync();
                                if (checkDoing != null)
                                {
                                    if (checkDoing.CurrentStatus == WpStatus.WpPending.DescriptionAttr())
                                    {
                                        msg.Error = true;
                                        msg.Title = "Tồn tại kế hoạch mới lập chưa thực hiện.";
                                        return msg;
                                    }
                                }

                                VcWorkPlan obj = new VcWorkPlan();

                                obj.WpCode = WpCode;
                                obj.UserName = username;
                                obj.FromDate = dFromDate;
                                obj.ToDate = dToDate;
                                obj.WeekNo = nWeekNo;
                                obj.Description = Description;
                                obj.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

                                //obj.CreatedBy = ESEIM.AppContext.UserName;
                                obj.CreatedBy = username;
                                obj.CreatedTime = DateTime.Now;


                                _context.VcWorkPlans.Add(obj);

                                if (saveChange)
                                {
                                    _context.SaveChanges();
                                }
                                msg.Title = "Thêm kế hoạch tuần thành công";
                                object rs = new WorkPlanRes
                                {
                                    WpCode = WpCode,
                                    Username = username,
                                };
                                msg.Object = rs;



                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Không thêm mới được mã kế hoạch tuần tồn tại.";
                        }
                    }
                    //Nếu WpCode != null thì là update
                    else
                    {
                        var obj = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                        if (obj != null)
                        {
                            var checkTime = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.UserName == username && x.WpCode != WpCode && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);
                            if (checkTime != null)
                            {
                                msg.Error = true;
                                msg.Title = "Kế hoạch cho tuần này đã được lập.";
                            }
                            else
                            {
                                obj.FromDate = dFromDate;
                                obj.ToDate = dToDate;
                                obj.WeekNo = nWeekNo;
                                obj.Description = Description;
                                obj.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

                                obj.CreatedTime = DateTime.Now;
                                //obj.UpdatedBy = username;
                                obj.UpdatedBy = ESEIM.AppContext.UserName;
                                obj.UpdatedTime = DateTime.Now;


                                _context.VcWorkPlans.Update(obj);

                                if (saveChange)
                                {
                                    _context.SaveChanges();
                                }
                                msg.Title = "Chỉnh sửa kế hoạch tuần thành công";
                                object rs = new WorkPlanRes
                                {
                                    WpCode = WpCode,
                                    Username = username,
                                };
                                msg.Object = rs;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Không chỉnh sửa được mã kế hoạch tuần không tồn tại.";
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bạn không được lập trước kế hoạch cách 2 tuần.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm/chỉnh sửa thông tin kế hoạch tuần.";
            }
            return msg;
        }

        [HttpPost]
        public string GetPercent()
        {
            if (progress == null)
            {
                progress = new List<Progress>();
                return "Processing...";
            }
            else
            {
                foreach (var item in progress)
                {
                    if (item.user == ESEIM.AppContext.UserName)
                        return item.percent;
                }
            }
            return "Processing...";
        }

        [HttpGet]
        public ActionResult ExportError()
        {
            string user = ESEIM.AppContext.UserName;
            List<ReadWorkPlanExcelImp> list1 = new List<ReadWorkPlanExcelImp>();
            foreach (var item in excelResultError)
                if (item.User == user)
                    list1 = item.List;
            List<ExportWorkPlanError> listExport = new List<ExportWorkPlanError>();
            foreach (var item in list1)
            {
                ExportWorkPlanError ex = new ExportWorkPlanError();
                ex.No = item.No;
                ex.UserName = item.UserName;
                ex.WeekNo = item.WeekNo;
                ex.CusCode = item.CusCode;
                ex.Note = item.Note;

                ex.Error += !string.IsNullOrEmpty(item.UserNameM) ? item.UserNameM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.WeekNoM) ? item.WeekNoM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.CusCodeM) ? item.CusCodeM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.NoteM) ? item.NoteM + ", " : "";

                listExport.Add(ex);
            }
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("ExportError");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 6;
            sheetRequest.Range["B1"].ColumnWidth = 25;
            sheetRequest.Range["C1"].ColumnWidth = 25;
            sheetRequest.Range["D1"].ColumnWidth = 30;
            sheetRequest.Range["E1"].ColumnWidth = 25;
            sheetRequest.Range["F1"].ColumnWidth = 30;
            sheetRequest.Range["A1:F1"].Merge(true);

            sheetRequest.Range["A1"].Text = "TẢI LÔ KẾ HOẠCH TUẦN";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "MÃ NHÂN VIÊN (*)";
            sheetRequest["C2"].Text = "TUẦN (*)";
            sheetRequest["D2"].Text = "MÃ CỬA HÀNG (*)";
            sheetRequest["E2"].Text = "GHI CHÚ";
            sheetRequest["F2"].Text = "LỖI";

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
            //sheetRequest.UsedRange.AutofitColumns();
            sheetRequest.Range["B2:F2"].AutofitColumns();
            sheetRequest.Range["A3:A" + (list1.Count + 3)].WrapText = true;
            sheetRequest.Range["A3:A" + (list1.Count + 3)].AutofitRows();
            sheetRequest.Range["A2:A2"].CellStyle.Color = Color.Red;

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportWorkPlanError" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }


        //Read data from excel
        [NonAction]
        private List<ReadWorkPlanExcelImp> GetListInExcel(IFormFile fileUpload)
        {
            var list = new List<ReadWorkPlanExcelImp>();
            try
            {
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    // Read content from file
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    IWorksheet worksheet = workbook.Worksheets[0];

                    if (worksheet.Rows.Length > 1)
                    {
                        var title = worksheet.Rows[1].Cells;
                        if (
                            title[0].DisplayText.Trim() == "TT" &&
                            title[1].DisplayText.Trim() == "MÃ NHÂN VIÊN (*)" &&
                            title[2].DisplayText.Trim() == "TUẦN (*)" &&
                            title[3].DisplayText.Trim() == "MÃ CỬA HÀNG (*)" &&
                            title[4].DisplayText.Trim() == "GHI CHÚ"
                        )
                        {
                            // Check total column is 5
                            if (title.Length == 5)
                            {
                                var length = worksheet.Rows.Length;
                                var no = "";
                                var userName = "";
                                var weekNo = "";
                                var cusCode = "";
                                var note = "";

                                //int j;
                                //bool hasWeekNo = false;
                                for (int i = 3; i <= length; i++)
                                {
                                    no = worksheet.GetValueRowCol(i, 1).ToString().Trim();
                                    userName = worksheet.GetValueRowCol(i, 2).ToString().Trim();
                                    weekNo = worksheet.GetValueRowCol(i, 3).ToString().Trim();
                                    cusCode = worksheet.GetValueRowCol(i, 4).ToString().Trim();
                                    note = worksheet.GetValueRowCol(i, 5).ToString().Trim();

                                    if (!string.IsNullOrEmpty(no) || !string.IsNullOrEmpty(userName) || !string.IsNullOrEmpty(weekNo) || !string.IsNullOrEmpty(cusCode) || !string.IsNullOrEmpty(note))
                                    {
                                        ReadWorkPlanExcelImp result = new ReadWorkPlanExcelImp();
                                        //hasWeekNo = int.TryParse(weekNo, out j);
                                        result.No = no;
                                        result.UserName = userName;
                                        //if (hasWeekNo)
                                        //    result.WeekNo = j;
                                        //else result.WeekNo = 0;
                                        result.WeekNo = weekNo;
                                        result.CusCode = cusCode;
                                        result.Note = note;

                                        list.Add(result);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }
            return list;
        }

        #region Check for list total
        [NonAction]
        public bool Chk5RowFirstNotNull(List<ReadWorkPlanExcelImp> list)
        {
            bool b = true;
            var minCheck = Math.Min(list.Count, 5);
            for (var item = 0; item < minCheck; ++item)
            {
                if (string.IsNullOrEmpty(list[item].UserName)
                    && string.IsNullOrEmpty(list[item].No)
                    && string.IsNullOrEmpty(list[item].WeekNo)
                    && string.IsNullOrEmpty(list[item].CusCode)
                    && string.IsNullOrEmpty(list[item].Note)
                )
                { b = false; break; }
            }
            return b;
        }
        #endregion

        #region Check for list record of 1 client => if error then return list error
        //Function total check for list record of 1 client
        [NonAction]
        private ResultCheckList ChkList4UserName(string userName, List<ReadWorkPlanExcelImp> list4UserName)
        {
            ResultCheckList result = new ResultCheckList();
            var chk1WeekNo = Chk1WeekNo(userName, list4UserName);

            var is1WeekNo = chk1WeekNo.ChkResult;

            if (!is1WeekNo)
            {
                result.IsContinueChk = false;
                foreach (var row in list4UserName)
                {
                    SetMsgError2Cell("WeekNo", "Lỗi nhiều hơn 1 tuần cho 1 kế hoạch", row);
                    if (row.Tab != "Error") row.Tab = "Error";
                }
            }
            else
            {
                var weekNo = chk1WeekNo.ValueResult;
                if (string.IsNullOrEmpty(weekNo))
                {
                    result.IsContinueChk = false;
                    foreach (var row in list4UserName)
                    {
                        SetMsgError2Cell("WeekNo", "WeekNo không được trống", row);
                        if (row.Tab != "Error") row.Tab = "Error";
                    }
                }
                else
                {
                    var chkFormatWeekNo = ChkFormatWeekNo(weekNo);
                    var isChkFormatWeekNo = chkFormatWeekNo.ChkResult;
                    if (!isChkFormatWeekNo)
                    {
                        result.IsContinueChk = false;
                        foreach (var row in list4UserName)
                        {
                            SetMsgError2Cell("WeekNo", "WeekNo sai định dạng", row);
                            if (row.Tab != "Error") row.Tab = "Error";
                        }
                    }
                    else
                    {
                        var chkExistWorkPlan = ChkExistWorkPlan(userName, weekNo);
                        var isChkExistWorkPlan = chkExistWorkPlan.ChkResult;
                        if (isChkExistWorkPlan)
                        {
                            result.IsContinueChk = false;
                            foreach (var row in list4UserName)
                            {
                                SetMsgError2Cell("WeekNo", "Kế hoạch tuần đã tồn tại", row);
                                if (row.Tab != "Error") row.Tab = "Error";
                            }
                        }
                        else
                        {
                            var listCusCode = list4UserName.GroupBy(x => x.CusCode).ToList();
                            foreach (var cusCode in listCusCode)
                            {
                                var list4Cus = cusCode.ToList();
                                var countList4Cus = cusCode.Count();
                                if (countList4Cus > 1)
                                {
                                    for (var i = 1; i < countList4Cus; i++)
                                    {
                                        list4Cus[i].Tab = "Error";
                                        SetMsgError2Cell("CusCode", "Cửa hàng bị trùng lặp", list4Cus[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            result.ListResult = list4UserName;
            return result;
        }

        #region Check for list record of 1 client - Check in list excel
        [NonAction]
        private ResultCheckItem Chk1WeekNo(string userName, List<ReadWorkPlanExcelImp> list4UserName)
        {
            var result = new ResultCheckItem { ChkResult = true, ValueResult = null };
            if (list4UserName.Count == 1)
            {
                result.ValueResult = list4UserName[0].WeekNo;
            }
            else
            {
                var listWeekNo = list4UserName.GroupBy(x => x.WeekNo).ToList();
                if (listWeekNo.Count == 1)
                {
                    result.ValueResult = listWeekNo[0].Key;
                }
                else
                {
                    result.ChkResult = false;
                }
            }
            return result;
        }

        [NonAction]
        private ResultCheckItem ChkFormatWeekNo(string weekNo)
        {
            var result = new ResultCheckItem { ChkResult = true, ValueResult = null };
            int num;
            result.ChkResult = int.TryParse(weekNo, out num);
            return result;
        }

        #endregion


        #endregion

        #region Check all in core
        //[NonAction]
        //private IEnumerable<ReadWorkPlanExcelImp> ChkDB4List(List<ReadWorkPlanExcelImp> listRecord)
        //{
        //    var query = from a in listRecord
        //                join b1 in _context.Users.Where(x => x.Active && x.TypeStaff == 0).Select(x => new { x.UserName, x.GivenName, x.Area }) on a.UserName equals b1.UserName into b2
        //                from b in b2.DefaultIfEmpty()
        //                join c1 in _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area }) on a.CusCode equals c1.CusCode into c2
        //                from c in c2.DefaultIfEmpty()

        //                select new ReadWorkPlanExcelImp
        //                {
        //                    No = a.No,
        //                    UserName = a.UserName,
        //                    WeekNo = a.WeekNo,
        //                    CusCode = a.CusCode,
        //                    Note = a.Note,
        //                    Tab = (b == null || c == null || string.IsNullOrEmpty(a.UserName) || string.IsNullOrEmpty(a.CusCode))
        //                            ? "Error"
        //                            : ((string.IsNullOrEmpty(b.Area) || string.IsNullOrEmpty(c.Area))
        //                                ? "Error"
        //                                : (b.Area.Split(";").Any(x => x == c.Area)
        //                                    ? a.Tab
        //                                    : "Error")),
        //                    StaffName = b == null ? "" : b.GivenName,
        //                    CusName = c == null ? "" : c.CusName,
        //                    //NoM = 
        //                    UserNameM = !string.IsNullOrEmpty(a.UserName) 
        //                                    ? (b == null
        //                                        ? "Người dùng không phải là nhân viên thị trường hoặc không tồn tại"
        //                                        : (string.IsNullOrEmpty(b.Area)
        //                                            ? "Nhân viên chưa được khai báo khu vực quản lý"
        //                                            : ""))
        //                                    : "Nhân viên không được để trống",
        //                    //FromDateM = 
        //                    CusCodeM = !string.IsNullOrEmpty(a.CusCode) 
        //                                    ? (c == null
        //                                        ? "Cửa hàng không tồn tại"
        //                                        : (string.IsNullOrEmpty(c.Area)
        //                                            ? "Chưa khai báo khu vực cho cửa hàng"
        //                                            : (b != null && !string.IsNullOrEmpty(b.Area)
        //                                                ? (b.Area.Split(";").Any(x => x == c.Area)
        //                                                    ? ""
        //                                                    : "Cửa hàng không thuộc khu vực quản lý của nhân viên")
        //                                                : "")))
        //                                     : "Cửa hàng không được để trống",
        //                    //TimeWorkM = 
        //                    //NoteM = 
        //                };

        //    return query;
        //}

        [NonAction]
        private IEnumerable<ReadWorkPlanExcelImp> ChkDB4List(List<ReadWorkPlanExcelImp> listRecord)
        {
            var session = HttpContext.GetSessionUser();
            int nWeekNo;
            //int.TryParse(WeekNo, out nWeekNo);
            var dtNow = DateTime.Now;
            var weekNoNow = CommonUtil.GetWeekOfYear(dtNow);

            if (session.UserType == 10)
            {
                var query = from a in listRecord
                            join b1 in _context.Users.Where(x => x.Active && x.TypeStaff == 0).Select(x => new { x.UserName, x.GivenName, x.Area }) on a.UserName equals b1.UserName into b2
                            from b in b2.DefaultIfEmpty()
                            join c1 in _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area }) on a.CusCode equals c1.CusCode into c2
                            from c in c2.DefaultIfEmpty()

                            select new ReadWorkPlanExcelImp
                            {
                                No = a.No,
                                UserName = a.UserName,
                                WeekNo = a.WeekNo,
                                CusCode = a.CusCode,
                                Note = a.Note,
                                Tab = (b == null || c == null || string.IsNullOrEmpty(a.UserName) || string.IsNullOrEmpty(a.CusCode) || string.IsNullOrEmpty(a.WeekNo)
                                                    || (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpDone.DescriptionAttr())
                                                    || (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault().CurrentStatus == WpStatus.WpPending.DescriptionAttr())
                                                        )
                                        ? "Error"
                                        : ((string.IsNullOrEmpty(b.Area) || string.IsNullOrEmpty(c.Area) || !int.TryParse(a.WeekNo, out nWeekNo) || nWeekNo > weekNoNow + 1)
                                            ? "Error"
                                            : (b.Area.Split(";").Any(x => x == c.Area)
                                                ? a.Tab
                                                : "Error")),
                                StaffName = b == null ? "" : b.GivenName,
                                CusName = c == null ? "" : c.CusName,
                                //NoM = 
                                UserNameM = !string.IsNullOrEmpty(a.UserName)
                                                ? (b == null
                                                    ? "Người dùng không phải là nhân viên thị trường hoặc không tồn tại"
                                                    : (string.IsNullOrEmpty(b.Area)
                                                        ? "Nhân viên chưa được khai báo khu vực quản lý"
                                                        : ""))
                                                : "Nhân viên không được để trống",
                                //FromDateM = 
                                CusCodeM = !string.IsNullOrEmpty(a.CusCode)
                                                ? (c == null
                                                    ? "Cửa hàng không tồn tại"
                                                    : (string.IsNullOrEmpty(c.Area)
                                                        ? "Chưa khai báo khu vực cho cửa hàng"
                                                        : (b != null && !string.IsNullOrEmpty(b.Area)
                                                            ? (b.Area.Split(";").Any(x => x == c.Area)
                                                                ? ""
                                                                : "Cửa hàng không thuộc khu vực quản lý của nhân viên")
                                                            : "")))
                                                 : "Cửa hàng không được để trống",
                                WeekNoM = !string.IsNullOrEmpty(a.WeekNo)
                                            ? (int.TryParse(a.WeekNo, out nWeekNo)
                                                ? (nWeekNo <= weekNoNow + 1
                                                    ? (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpDone.DescriptionAttr()
                                                            //&& _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpPending.DescriptionAttr()
                                                            ? "Chỉ được tạo thêm 1 mã kế hoạch khi kế hoạch cũ chưa thực hiện xong"
                                                            : (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault() != null
                                                                && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault().CurrentStatus == WpStatus.WpPending.DescriptionAttr()
                                                                    ? "Tồn tại kế hoạch mới lập chưa thực hiện"
                                                                    : "")
                                                            )
                                                    : "Không được lập trước kế hoạch cách 2 tuần")
                                                : "Tuần kế hoạch sai định dạng")
                                            : "Tuần kế hoạch không được để trống"
                                //NoteM = 
                            };

                return query;
            }
            else
            {
                if (session.TypeStaff == 10)
                {
                    var listArea = GetListAreaFunc(session);

                    var query = from a in listRecord
                                join b1 in _context.Users.Where(x => x.Active && x.TypeStaff == 0).Select(x => new { x.UserName, x.GivenName, x.Area }) on a.UserName equals b1.UserName into b2
                                from b in b2.DefaultIfEmpty()
                                join c1 in _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area }) on a.CusCode equals c1.CusCode into c2
                                from c in c2.DefaultIfEmpty()

                                select new ReadWorkPlanExcelImp
                                {
                                    No = a.No,
                                    UserName = a.UserName,
                                    WeekNo = a.WeekNo,
                                    CusCode = a.CusCode,
                                    Note = a.Note,
                                    Tab = (b == null || c == null || string.IsNullOrEmpty(a.UserName) || string.IsNullOrEmpty(a.CusCode) || string.IsNullOrEmpty(a.WeekNo)
                                                    || (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpDone.DescriptionAttr())
                                                    || (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault().CurrentStatus == WpStatus.WpPending.DescriptionAttr())
                                                        )
                                            ? "Error"
                                            : ((string.IsNullOrEmpty(b.Area) || string.IsNullOrEmpty(c.Area) || !int.TryParse(a.WeekNo, out nWeekNo) || nWeekNo > weekNoNow + 1)
                                                ? "Error"
                                                : (b.Area.Split(";").Any(x => x == c.Area)
                                                    ? (listArea.Any(x => x.Code == c.Area)
                                                        ? a.Tab
                                                        : "Error")
                                                    : "Error")),
                                    StaffName = b == null ? "" : b.GivenName,
                                    CusName = c == null ? "" : c.CusName,
                                    //NoM = 
                                    UserNameM = !string.IsNullOrEmpty(a.UserName)
                                                    ? (b == null
                                                        ? "Người dùng không phải là nhân viên thị trường hoặc không tồn tại"
                                                        : (string.IsNullOrEmpty(b.Area)
                                                            ? "Nhân viên chưa được khai báo khu vực quản lý"
                                                            : ""))
                                                    : "Nhân viên không được để trống",
                                    //FromDateM = 
                                    CusCodeM = !string.IsNullOrEmpty(a.CusCode)
                                                    ? (c == null
                                                        ? "Cửa hàng không tồn tại"
                                                        : (string.IsNullOrEmpty(c.Area)
                                                            ? "Chưa khai báo khu vực cho cửa hàng"
                                                            : (b != null && !string.IsNullOrEmpty(b.Area)
                                                                ? (b.Area.Split(";").Any(x => x == c.Area)
                                                                    ? (listArea.Any(x => x.Code == c.Area)
                                                                        ? ""
                                                                        : "Cửa hàng không thuộc khu vực quản lý của nhân viên tải dữ liệu")
                                                                    : "Cửa hàng không thuộc khu vực quản lý của nhân viên")
                                                                : "")))
                                                     : "Cửa hàng không được để trống",
                                    WeekNoM = !string.IsNullOrEmpty(a.WeekNo)
                                            ? (int.TryParse(a.WeekNo, out nWeekNo)
                                                ? (nWeekNo <= weekNoNow + 1
                                                    ? (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpDone.DescriptionAttr()
                                                            ? "Chỉ được tạo thêm 1 mã kế hoạch khi kế hoạch cũ chưa thực hiện xong"
                                                            : (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault() != null
                                                                && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault().CurrentStatus == WpStatus.WpPending.DescriptionAttr()
                                                                    ? "Tồn tại kế hoạch mới lập chưa thực hiện"
                                                                    : "")
                                                            )
                                                    : "Không được lập trước kế hoạch cách 2 tuần")
                                                : "Tuần kế hoạch sai định dạng")
                                            : "Tuần kế hoạch không được để trống"
                                    //NoteM = 
                                };

                    return query;
                }
                else if (session.TypeStaff == 0)
                {
                    var query = from a in listRecord
                                join b1 in _context.Users.Where(x => x.Active && x.TypeStaff == 0).Select(x => new { x.UserName, x.GivenName, x.Area }) on a.UserName equals b1.UserName into b2
                                from b in b2.DefaultIfEmpty()
                                join c1 in _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area }) on a.CusCode equals c1.CusCode into c2
                                from c in c2.DefaultIfEmpty()

                                select new ReadWorkPlanExcelImp
                                {
                                    No = a.No,
                                    UserName = a.UserName,
                                    WeekNo = a.WeekNo,
                                    CusCode = a.CusCode,
                                    Note = a.Note,
                                    Tab = (b == null || c == null || string.IsNullOrEmpty(a.UserName) || string.IsNullOrEmpty(a.CusCode) || string.IsNullOrEmpty(a.WeekNo) || a.UserName != session.UserName
                                                    || (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpDone.DescriptionAttr())
                                                    || (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault().CurrentStatus == WpStatus.WpPending.DescriptionAttr())
                                                        )
                                            ? "Error"
                                            : ((string.IsNullOrEmpty(b.Area) || string.IsNullOrEmpty(c.Area) || !int.TryParse(a.WeekNo, out nWeekNo) || nWeekNo > weekNoNow + 1)
                                                ? "Error"
                                                : (b.Area.Split(";").Any(x => x == c.Area)
                                                    ? a.Tab
                                                    : "Error")),
                                    StaffName = b == null ? "" : b.GivenName,
                                    CusName = c == null ? "" : c.CusName,
                                    //NoM = 
                                    UserNameM = !string.IsNullOrEmpty(a.UserName)
                                                    ? (b == null
                                                        ? "Người dùng không phải là nhân viên thị trường hoặc không tồn tại"
                                                        : (string.IsNullOrEmpty(b.Area)
                                                            ? "Nhân viên chưa được khai báo khu vực quản lý"
                                                            : (a.UserName != session.UserName
                                                                ? "Bạn không có quyền tải kế hoạch của người khác"
                                                                : "")))
                                                    : "Nhân viên không được để trống",
                                    //FromDateM = 
                                    CusCodeM = !string.IsNullOrEmpty(a.CusCode)
                                                    ? (c == null
                                                        ? "Cửa hàng không tồn tại"
                                                        : (string.IsNullOrEmpty(c.Area)
                                                            ? "Chưa khai báo khu vực cho cửa hàng"
                                                            : (b != null && !string.IsNullOrEmpty(b.Area)
                                                                ? (b.Area.Split(";").Any(x => x == c.Area)
                                                                    ? ""
                                                                    : "Cửa hàng không thuộc khu vực quản lý của nhân viên")
                                                                : "")))
                                                     : "Cửa hàng không được để trống",
                                    WeekNoM = !string.IsNullOrEmpty(a.WeekNo)
                                            ? (int.TryParse(a.WeekNo, out nWeekNo)
                                                ? (nWeekNo <= weekNoNow + 1
                                                    ? (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault() != null
                                                        && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault().CurrentStatus != WpStatus.WpDone.DescriptionAttr()
                                                            ? "Chỉ được tạo thêm 1 mã kế hoạch khi kế hoạch cũ chưa thực hiện xong"
                                                            : (_context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault() != null
                                                                && _context.VcWorkPlans.Where(x => x.UserName == a.UserName && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(0).Take(1).FirstOrDefault().CurrentStatus == WpStatus.WpPending.DescriptionAttr()
                                                                    ? "Tồn tại kế hoạch mới lập chưa thực hiện"
                                                                    : "")
                                                            )
                                                    : "Không được lập trước kế hoạch cách 2 tuần")
                                                : "Tuần kế hoạch sai định dạng")
                                            : "Tuần kế hoạch không được để trống"
                                    //NoteM = 
                                };

                    return query;
                }
                else
                {
                    var query = from a in listRecord
                                    //join b1 in _context.Users.Where(x => x.Active && x.TypeStaff == 0).Select(x => new { x.UserName, x.GivenName, x.Area }) on a.UserName equals b1.UserName into b2
                                    //from b in b2.DefaultIfEmpty()
                                    //join c1 in _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area }) on a.CusCode equals c1.CusCode into c2
                                    //from c in c2.DefaultIfEmpty()

                                select new ReadWorkPlanExcelImp
                                {
                                    No = a.No,
                                    UserName = a.UserName,
                                    WeekNo = a.WeekNo,
                                    CusCode = a.CusCode,
                                    Note = a.Note,
                                    Tab = "Error",
                                    //StaffName = b == null ? "" : b.GivenName,
                                    //CusName = c == null ? "" : c.CusName,
                                    //NoM = 
                                    UserNameM = "Bạn chưa được khai báo quyền thực hiện tải lô",
                                    //FromDateM = 
                                    //CusCodeM = !string.IsNullOrEmpty(a.CusCode)
                                    //                ? (c == null
                                    //                    ? "Cửa hàng không tồn tại"
                                    //                    : (string.IsNullOrEmpty(c.Area)
                                    //                        ? "Chưa khai báo khu vực cho cửa hàng"
                                    //                        : (b != null && !string.IsNullOrEmpty(b.Area)
                                    //                            ? (b.Area.Split(";").Any(x => x == c.Area)
                                    //                                ? ""
                                    //                                : "Cửa hàng không thuộc khu vực quản lý của nhân viên")
                                    //                            : "")))
                                    //                 : "Cửa hàng không được để trống",
                                    //TimeWorkM = 
                                    //NoteM = 
                                };

                    return query;
                }
            }
        }

        [NonAction]
        private ResultCheckItem ChkExistWorkPlan(string userName, string weekNo)
        {
            var result = new ResultCheckItem { ChkResult = false, ValueResult = null };
            int nWeekNo = 0;
            int.TryParse(weekNo, out nWeekNo);
            var dtYear = DateTime.Now.Year;

            DateTime dFromDate = CommonUtil.FirstDateOfWeekISO8601(dtYear, nWeekNo);
            var checkTime = _context.VcWorkPlans.Any(x => x.UserName == userName && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);

            if (checkTime)
            {
                result.ChkResult = true;
            }
            return result;
        }

        ////Không còn ngày kế hoạch qua từng cửa hàng
        //[NonAction]
        //private List<ReadWorkPlanExcelImp> ChkDateWorkInWorkPlan(string fromDate, List<ReadWorkPlanExcelImp> listRecord)
        //{
        //    List<ReadWorkPlanExcelImp> result = new List<ReadWorkPlanExcelImp>();
        //    DateTime dFromDate = DateTime.ParseExact(fromDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);

        //    //var WeekNo = CommonUtil.GetWeekOfYear(dFromDate);
        //    DateTime dToDate = dFromDate.AddDays(-(int)dFromDate.DayOfWeek + 7);

        //    foreach (var row in listRecord.Where(x => x.Tab == "New"))
        //    {
        //        //ChkRowData(row);
        //        if (row.Tab != "Error")
        //        {
        //            DateTime dateWork = DateTime.ParseExact(row.DateWork, "dd-MM-yyyy", CultureInfo.InvariantCulture);
        //            if (dateWork < dFromDate || dFromDate > dToDate)
        //            {
        //                SetMsgError2Cell("DateWork", "Ngày đến cửa hàng không nằm trong kế hoạch", row);
        //                if (row.Tab != "Error") row.Tab = "Error";
        //            }
        //        }
        //    }
        //    result = listRecord;
        //    return result;
        //}



        #endregion


        #region Check row data
        //[NonAction]
        //private ReadWorkPlanExcelImp ChkRowData(ReadWorkPlanExcelImp row)
        //{
        //    ChkNullLenTypeCell("UserName", row.UserName, 50, "", row, false);
        //    //Đã check ở trên
        //    //ChkNullLenTypeCell("FromDate", row.FromDate, 50, "FromDate", row, false);
        //    ChkNullLenTypeCell("CusCode", row.CusCode, 50, "", row, false);
        //    return row;
        //}
        /// <summary>
        /// chkNullLenTypeCell
        /// </summary>
        /// <param name="colName"></param>
        /// <param name="colValue"></param>
        /// <param name="allowNull">"true - Cell can't check null"</param>
        /// <param name="length">"0 - Cell can't check length"</param>
        /// <param name="typeChk">"null - Cell can't check type"</param>
        /// <param name="row"></param>
        /// <returns></returns>
        //[NonAction]
        //private ReadWorkPlanExcelImp ChkNullLenTypeCell(string colName, string colValue, int length, string typeChk, ReadWorkPlanExcelImp row, bool allowNull = false)
        //{
        //    if (string.IsNullOrEmpty(colValue))
        //    {
        //        if (!allowNull)
        //        {
        //            row = SetMsgError2Cell(colName, colName + " không được trống", row);
        //            row.Tab = "Error";
        //        }
        //    }
        //    else
        //    {
        //        Regex rgx;
        //        Match mat;
        //        switch (typeChk)
        //        {
        //            case "DateTime":
        //                rgx = new Regex(@"(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})");
        //                mat = rgx.Match(colValue);
        //                if (!mat.Success || colValue.Length != 10)
        //                {
        //                    row = SetMsgError2Cell(colName, colName + " sai định dạng", row);
        //                    row.Tab = "Error";
        //                }
        //                //mat.Dump();
        //                break;

        //            //case "FromDate":
        //            //    rgx = new Regex(@"(?:(?:31(\-)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\-)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\-)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\-)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})");
        //            //    mat = rgx.Match(colValue);
        //            //    if (!mat.Success || colValue.Length != 10)
        //            //    {
        //            //        row = SetMsgError2Cell(colName, colName + " sai định dạng", row);
        //            //        row.Tab = "Error";
        //            //    }
        //            //    //mat.Dump();
        //            //    break;

        //            //case "DateWork":
        //            //    rgx = new Regex(@"(?:(?:31(\-)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\-)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\-)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\-)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})");
        //            //    mat = rgx.Match(colValue);
        //            //    if (!mat.Success || colValue.Length != 10)
        //            //    {
        //            //        row = SetMsgError2Cell(colName, colName + " sai định dạng", row);
        //            //        row.Tab = "Error";
        //            //    }
        //            //    //mat.Dump();
        //            //    break;

        //            //case "HourWork":
        //            //    rgx = new Regex(@"^([0-5]?[0-9]):([0-5]?[0-9]))$|^(([0-9]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$");
        //            //    mat = rgx.Match(colValue);
        //            //    if (!mat.Success || colValue.Length != 10)
        //            //    {
        //            //        row = SetMsgError2Cell(colName, colName + " sai định dạng", row);
        //            //        row.Tab = "Error";
        //            //    }
        //            //    //mat.Dump();
        //            //    break;

        //            case "Integer":
        //                //Regex regex = new Regex(@"^\d*$");
        //                rgx = new Regex(@"^(\s)*[+]?[0-9]{1,3}(?:\,?[0-9]{3})*(\s)*$");
        //                mat = rgx.Match(colValue);
        //                if (!mat.Success)
        //                {
        //                    row = SetMsgError2Cell(colName, colName + " sai định dạng", row);
        //                    row.Tab = "Error";
        //                }
        //                //mat.Dump();
        //                //_col_value.Dump();
        //                break;

        //            case "Float":
        //                //Regex rgx = new Regex(@"^(\d)+(?:\.\d*)?$");
        //                rgx = new Regex(@"^(\s)*[-]?[+]?[0-9]{1,3}(?:\,?[0-9]{3})*(?:\.[0-9]{1,5})?(\s)*$");
        //                mat = rgx.Match(colValue);
        //                if (!mat.Success)
        //                {
        //                    row = SetMsgError2Cell(colName, colName + " sai định dạng", row);
        //                    row.Tab = "Error";
        //                }
        //                break;

        //            case "StatusActive":
        //                if (colValue != "Active" && colValue != "Inactive")
        //                {
        //                    row = SetMsgError2Cell(colName, colName + " must is Active or Inactive", row);
        //                    row.Tab = "Error";
        //                }
        //                break;

        //            default:
        //                if (length > 0 && colValue.Length > length)
        //                {
        //                    row = SetMsgError2Cell(colName, colName + " cần có độ dài nhỏ hơn " + length, row);
        //                    row.Tab = "Error";
        //                }
        //                break;
        //        }
        //    }
        //    return row;
        //}
        #endregion

        #region Set message to cell
        [NonAction]
        private ReadWorkPlanExcelImp SetMsgError2Cell(string colname, string mesg, ReadWorkPlanExcelImp row)
        {
            switch (colname)
            {
                case "UserName":
                    if (string.IsNullOrEmpty(row.UserNameM))
                        row.UserNameM += mesg;
                    break;

                case "WeekNo":

                    if (string.IsNullOrEmpty(row.WeekNoM))
                        row.WeekNoM += mesg;
                    break;

                case "CusCode":
                    if (string.IsNullOrEmpty(row.CusCodeM))
                        row.CusCodeM += mesg;
                    break;

                case "No":
                    if (string.IsNullOrEmpty(row.NoM))
                        row.NoM += mesg;
                    break;

                case "Note":
                    if (string.IsNullOrEmpty(row.NoteM))
                        row.NoteM += mesg;
                    break;

                default:
                    break;
            }
            return row;
        }
        #endregion

        [NonAction]
        private void CreateError(List<ReadWorkPlanExcelImp> list)
        {
            bool hasUser = false;
            string user = ESEIM.AppContext.UserName;
            if (excelResultError == null)
                excelResultError = new List<ExcelPayrollBulkResultError>();
            List<ReadWorkPlanExcelImp> listErr = list.Where(item => item.Tab == "Error").ToList();
            foreach (var item in excelResultError)
            {
                if (item.User == user)
                {
                    hasUser = true;
                    item.List = listErr;
                }
            }
            if (!hasUser)
            {
                ExcelPayrollBulkResultError ex = new ExcelPayrollBulkResultError();
                ex.User = user;
                ex.List = listErr;
                excelResultError.Add(ex);
            }
        }
    }

    public class ReadWorkPlanExcelImp
    {
        public ReadWorkPlanExcelImp() { Tab = "New"; }
        public string No { get; set; }
        public string UserName { get; set; }
        public string WeekNo { get; set; }
        public string CusCode { get; set; }
        public string Note { get; set; }

        //Not exist in excel
        public string Tab { get; set; }
        public string StaffName { get; set; }
        public string CusName { get; set; }
        public string FromDate { get; set; }
        //public string HourWork { get; set; }
        //public string DateWork { get; set; }

        //Message error
        public string NoM { get; set; }
        public string UserNameM { get; set; }
        public string WeekNoM { get; set; }
        public string CusCodeM { get; set; }
        //public string HourWorkM { get; set; }
        //public string DateWorkM { get; set; }
        public string NoteM { get; set; }
    }
    public class ResultCheckItem
    {
        public bool ChkResult { get; set; }
        public string ValueResult { get; set; }
        public string TypeResult { get; set; } = null;
    }
    public class ResultCheckList
    {
        public ResultCheckList()
        {
            IsContinueChk = true;
        }
        public bool IsContinueChk { get; set; } = true;
        public List<ReadWorkPlanExcelImp> ListResult { get; set; }
    }


    public class ExcelPayrollBulkResultError
    {
        public string User { get; set; }
        public string Time { get; set; }
        public List<ReadWorkPlanExcelImp> List { get; set; }
    }
    public class ExportWorkPlanError
    {
        public string No { get; set; }
        public string UserName { get; set; }
        public string WeekNo { get; set; }
        public string CusCode { get; set; }
        public string Note { get; set; }
        public string Error { get; set; }
    }



    public class Progress
    {
        public string user { get; set; }
        public string percent { get; set; }
    }
}
