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
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ImportCustomerController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        public static List<Progress> progress;
        private static List<ExcelCustomerResultError> excelResultError;
        private readonly IStringLocalizer<ImportCustomerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ImportCustomerController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, EIMDBContext swContext, IStringLocalizer<ImportCustomerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbImpCus", AreaName = "Admin", FromAction = "Index", FromController = typeof(CustomerHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["COM_CRUMB_CUSTOMER"];
            ViewData["CrumbImpCus"] = _sharedResources["COM_CRUMB_IMPORT_CUS"];
            return View();
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadPayrollBulk(IFormFile fileUpload)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                //var logger = LogManager.GetLogger(typeof(Program));
                //logger.Info("-------------------Start Import Excel---------------------:" + DateTime.Now);
                List<ReadCustomerExcelImp> listTotal = GetListInExcel(fileUpload);
                List<ReadCustomerExcelImp> listResult = new List<ReadCustomerExcelImp>();
                if (listTotal.Count == 0 || !Chk5RowFirstNotNull(listTotal))
                {
                    msg.Error = true;
                    //msg.Title = "Tệp tin sai định dạng.";
                    msg.Title = _sharedResources["COM_MSG_FILE_FAIL_FORMAT"];
                }
                else
                {
                    SessionUserLogin session = HttpContext.GetSessionUser();
                    var listChkDb = ChkDB4List(listTotal);
                    listResult.AddRange(listChkDb.Where(x => x.Tab == "Error"));
                    var grCusCode = listChkDb.Where(x => x.Tab == "New").GroupBy(x => x.CusCode).ToList();
                    foreach (var CusCode in grCusCode)
                    {
                        var customer = CusCode.Key;
                        var listRecord4User = CusCode.ToList();
                        if (listRecord4User.Count > 1)
                        {
                            var listError = listChkDb.Where(x => x.CusCode == customer).ToList();
                            foreach (var row in listError)
                            {
                                SetMsgError2Cell("CusCode", "Lỗi mã khách hàng trùng nhau", row);
                                if (row.Tab != "Error") row.Tab = "Error";
                                listResult.Add(row);
                            }
                        }
                        else
                        {
                            var item = listChkDb.FirstOrDefault(x => x.CusCode == customer);
                            listResult.Add(item);
                        }
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
        public async Task<JsonResult> SaveItems([FromBody]List<ReadCustomerExcelImp> list)
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

                foreach (var item in list)
                {
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
                        Customers objNew = new Customers();
                        objNew.CusCode = item.CusCode;
                        objNew.CusName = item.CusName;
                        objNew.TaxCode = item.TaxCode;
                        objNew.Address = item.Address;
                        objNew.MobilePhone = item.MobilePhone;
                        objNew.Area = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == item.Area)?.CodeSet;
                        objNew.CusGroup = "CUSTOMER_OTHER";
                        objNew.ActivityStatus = "CUSTOMER_ACTIVE";
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.CreatedTime = DateTime.Now;
                        objNew.CusType = "V.I.P";
                        //objNew.Area = "AREA_HN";

                        var subStringCode = item.CusCode.Substring(0, 2);
                        if (subStringCode == "DL")
                        {
                            objNew.Role = EnumHelper<CustomerRoleEnum>.GetDisplayValue(CustomerRoleEnum.Agency);
                        }
                        else if (subStringCode == "KL")
                        {
                            objNew.Role = EnumHelper<CustomerRoleEnum>.GetDisplayValue(CustomerRoleEnum.Retail);
                        }
                        else
                        {
                            objNew.Role = EnumHelper<CustomerRoleEnum>.GetDisplayValue(CustomerRoleEnum.Other);
                        }

                        _context.Customerss.Add(objNew);
                        await _context.SaveChangesAsync();
                    }
                    //else
                    //{


                    //}
                    count++;
                }

                await _context.SaveChangesAsync();
                msg.Error = false;
                if (list[0].Tab == "New")
                    //msg.Title = "Thêm các khách hàng thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ICUS_LIST_CURD_LBL_CUSTUMER"]);
                else if (list[0].Tab == "Update")
                {
                    //msg.Title = "Chỉnh sửa các khách hàng thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ICUS_LIST_CURD_LBL_CUSTUMER"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                if (list[0].Tab == "New")
                    //msg.Title = "Thêm các khách hàng lỗi";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["ICUS_LIST_CURD_LBL_CUSTUMER"]);
                else if (list[0].Tab == "Update")
                {
                    //msg.Title = "Chỉnh sửa các khách hàng lỗi";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["ICUS_LIST_CURD_LBL_CUSTUMER"]);
                }
            }
            msg.Object = list;
            return Json(msg);
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
            List<ReadCustomerExcelImp> list1 = new List<ReadCustomerExcelImp>();
            foreach (var item in excelResultError)
                if (item.User == user)
                    list1 = item.List;
            List<ExportCustomerError> listExport = new List<ExportCustomerError>();
            foreach (var item in list1)
            {
                ExportCustomerError ex = new ExportCustomerError();
                ex.CusCode = item.CusCode;
                ex.CusName = item.CusName;
                ex.TaxCode = item.TaxCode;
                ex.Address = item.Address;
                ex.MobilePhone = item.MobilePhone;
                ex.Area = item.Area;

                ex.Error += !string.IsNullOrEmpty(item.CusCodeM) ? item.CusCodeM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.CusNameM) ? item.CusNameM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.AddressM) ? item.AddressM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.MobilePhoneM) ? item.MobilePhoneM + ", " : "";
                ex.Error += !string.IsNullOrEmpty(item.AreaM) ? item.AreaM + ", " : "";

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

            sheetRequest.Range["A1"].Text = "DANH SÁCH KHÁCH HÀNG";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "MÃ KHÁCH HÀNG";
            sheetRequest["B2"].Text = "TÊN KHÁCH HÀNG";
            sheetRequest["C2"].Text = "MÃ SỐ THUẾ";
            sheetRequest["D2"].Text = "ĐỊA CHỈ";
            sheetRequest["E2"].Text = "ĐIỆN THOẠI";
            sheetRequest["E2"].Text = "KHU VỰC KHÁCH HÀNG";
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
            var fileName = "ExportCustomerError" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }


        //Read data from excel
        [NonAction]
        private List<ReadCustomerExcelImp> GetListInExcel(IFormFile fileUpload)
        {
            var list = new List<ReadCustomerExcelImp>();
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
                            title[0].DisplayText.Trim() == "MÃ KHÁCH HÀNG" &&
                            title[1].DisplayText.Trim() == "TÊN KHÁCH HÀNG" &&
                            title[2].DisplayText.Trim() == "MÃ SỐ THUẾ" &&
                            title[3].DisplayText.Trim() == "ĐỊA CHỈ" &&
                            title[4].DisplayText.Trim() == "ĐIỆN THOẠI" &&
                            title[5].DisplayText.Trim() == "KHU VỰC KHÁCH HÀNG"
                        )
                        {
                            // Check total column is 5
                            if (title.Length == 6)
                            {
                                var length = worksheet.Rows.Length;
                                var cusCode = "";
                                var cusName = "";
                                var taxCode = "";
                                var address = "";
                                var mobilePhone = "";
                                var area = "";

                                //int j;
                                //bool hasWeekNo = false;
                                for (int i = 3; i <= length; i++)
                                {
                                    cusCode = worksheet.GetValueRowCol(i, 1).ToString().Trim();
                                    cusName = worksheet.GetValueRowCol(i, 2).ToString().Trim();
                                    taxCode = worksheet.GetValueRowCol(i, 3).ToString().Trim();
                                    address = worksheet.GetValueRowCol(i, 4).ToString().Trim();
                                    mobilePhone = worksheet.GetValueRowCol(i, 5).ToString().Trim();
                                    area = worksheet.GetValueRowCol(i, 6).ToString().Trim();

                                    if (!string.IsNullOrEmpty(cusCode) || !string.IsNullOrEmpty(cusName) || !string.IsNullOrEmpty(taxCode) || !string.IsNullOrEmpty(address) || !string.IsNullOrEmpty(mobilePhone))
                                    {
                                        ReadCustomerExcelImp result = new ReadCustomerExcelImp();
                                        //hasWeekNo = int.TryParse(weekNo, out j);
                                        result.CusCode = cusCode;
                                        result.CusName = cusName;
                                        //if (hasWeekNo)
                                        //    result.WeekNo = j;
                                        //else result.WeekNo = 0;
                                        result.TaxCode = taxCode;
                                        result.Address = address;
                                        result.MobilePhone = mobilePhone;
                                        result.Area = area;
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
        public bool Chk5RowFirstNotNull(List<ReadCustomerExcelImp> list)
        {
            bool b = true;
            var minCheck = Math.Min(list.Count, 5);
            for (var item = 0; item < minCheck; ++item)
            {
                if (string.IsNullOrEmpty(list[item].CusCode)
                    && string.IsNullOrEmpty(list[item].CusName)
                    && string.IsNullOrEmpty(list[item].TaxCode)
                    && string.IsNullOrEmpty(list[item].Address)
                    && string.IsNullOrEmpty(list[item].MobilePhone)
                    && string.IsNullOrEmpty(list[item].Area)
                )
                { b = false; break; }
            }
            return b;
        }
        #endregion


        #region Check all in core

        [NonAction]
        private IEnumerable<ReadCustomerExcelImp> ChkDB4List(List<ReadCustomerExcelImp> listRecord)
        {
            string z = "t est ";
            bool v = z.Contains(" ");
            var query1 = listRecord.Where(x => x.CusCode.Contains(" "));
            Regex rgx = new Regex(@"^(0)+([0-9]{9,10})\b$");
            //Check area

            bool CheckArea(string area)
            {
                var data = _context.CommonSettings.FirstOrDefault(x => x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.ValueSet == area);
                if (data == null)
                    return false;
                else
                    return true;
            }


            var query = from a in listRecord
                        join c1 in _context.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area, x.MobilePhone }) on a.CusCode equals c1.CusCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new ReadCustomerExcelImp
                        {
                            CusCode = a.CusCode,
                            CusName = a.CusName,
                            TaxCode = a.TaxCode,
                            Address = a.Address,
                            MobilePhone = a.MobilePhone,
                            Area = a.Area,
                            Tab = (string.IsNullOrEmpty(a.CusCode) || string.IsNullOrEmpty(a.CusName) || string.IsNullOrEmpty(a.Address) || string.IsNullOrEmpty(a.MobilePhone) || string.IsNullOrEmpty(a.Area) || !rgx.Match(a.MobilePhone).Success || c != null || a.CusCode.Contains(" ")
                            //Tab = (string.IsNullOrEmpty(a.CusCode) || string.IsNullOrEmpty(a.CusName) || string.IsNullOrEmpty(a.Address) || string.IsNullOrEmpty(a.MobilePhone)|| !rgx.Match(a.MobilePhone).Success || c != null || a.CusCode.Contains(" ") || !CheckArea(a.Area)
                                                )
                                    ? "Error"
                                    : a.Tab,
                            CusCodeM = !string.IsNullOrEmpty(a.CusCode)
                                            ? (c != null
                                                ? "Mã khách hàng đã tồn tại trên hệ thống"
                                                : (a.CusCode.Contains(" ")
                                                    ? "Mã khách hàng không được có khoảng trắng"
                                                    : ""))
                                            : "Mã khách hàng không được để trống",
                            CusNameM = !string.IsNullOrEmpty(a.CusName)
                                            ? ""
                                            : "Tên khách hàng không được để trống",
                            AddressM = !string.IsNullOrEmpty(a.Address)
                                            ? ""
                                            : "Địa chỉ không được để trống",
                            MobilePhoneM = !string.IsNullOrEmpty(a.MobilePhone)
                                           ? (!rgx.Match(a.MobilePhone).Success ? "Số điện thoại sai định dạng" : "")
                                            : "Số điện thoại không được để trống",
                            //AreaM = CheckArea(a.Area)
                            AreaM = !string.IsNullOrEmpty(a.Area)
                                            ? ""
                                            : "Khu vực khách hàng không được để trống",
                        };


            return query;
        }

        //check khoang trang
        //public bool check(string data) {
        //    bool x = true;
        //    return x;
        //}

        #endregion


        #region Check row data
        //[NonAction]
        //private ReadCustomerExcelImp ChkRowData(ReadCustomerExcelImp row)
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
        //private ReadCustomerExcelImp ChkNullLenTypeCell(string colName, string colValue, int length, string typeChk, ReadCustomerExcelImp row, bool allowNull = false)
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
        private ReadCustomerExcelImp SetMsgError2Cell(string colname, string mesg, ReadCustomerExcelImp row)
        {
            switch (colname)
            {
                case "CusCode":
                    if (string.IsNullOrEmpty(row.CusCodeM))
                        row.CusCodeM += mesg;
                    break;

                default:
                    break;
            }
            return row;
        }
        #endregion

        [NonAction]
        private void CreateError(List<ReadCustomerExcelImp> list)
        {
            bool hasUser = false;
            string user = ESEIM.AppContext.UserName;
            if (excelResultError == null)
                excelResultError = new List<ExcelCustomerResultError>();
            List<ReadCustomerExcelImp> listErr = list.Where(item => item.Tab == "Error").ToList();
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
                ExcelCustomerResultError ex = new ExcelCustomerResultError();
                ex.User = user;
                ex.List = listErr;
                excelResultError.Add(ex);
            }
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

    public class ReadCustomerExcelImp
    {
        public ReadCustomerExcelImp() { Tab = "New"; }
        public string CusCode { get; set; }
        public string CusName { get; set; }
        public string TaxCode { get; set; }
        public string Address { get; set; }
        public string MobilePhone { get; set; }
        public string Area { get; set; }

        //Not exist in excel
        public string Tab { get; set; }

        //Message error
        public string AreaM { get; set; }
        public string CusCodeM { get; set; }
        public string CusNameM { get; set; }
        public string AddressM { get; set; }
        public string MobilePhoneM { get; set; }
    }
    public class ResultCheckItemCustomer
    {
        public bool ChkResult { get; set; }
        public string ValueResult { get; set; }
        public string TypeResult { get; set; } = null;
    }
    public class ResultCheckListCustomer
    {
        public ResultCheckListCustomer()
        {
            IsContinueChk = true;
        }
        public bool IsContinueChk { get; set; } = true;
        public List<ReadCustomerExcelImp> ListResult { get; set; }
    }


    public class ExcelCustomerResultError
    {
        public string User { get; set; }
        public string Time { get; set; }
        public List<ReadCustomerExcelImp> List { get; set; }
    }
    public class ExportCustomerError
    {
        public string CusCode { get; set; }
        public string CusName { get; set; }
        public string TaxCode { get; set; }
        public string Address { get; set; }
        public string MobilePhone { get; set; }
        public string Area { get; set; }
        public string Error { get; set; }
    }
}
