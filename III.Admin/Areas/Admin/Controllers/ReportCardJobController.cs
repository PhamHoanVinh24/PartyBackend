using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Internal;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReportCardJobController : BaseController
    {
        public class SStaffTimeKeepingJtableModel : JTableModel
        {
            public string UserId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ReportCardJobController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ReportCardJobController(EIMDBContext context, IStringLocalizer<ReportCardJobController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        [Breadcrumb("ViewData.CrumbRptCardjob", AreaName = "Admin", FromAction = "Index", FromController = typeof(CardWorkHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCardWorkHome"] = _sharedResources["COM_CRUMB_CARD_WORK_HOME"];
            ViewData["CrumbRptCardjob"] = _sharedResources["COM_CRUMB_REPORT_CARDJOB"];
            return View();
        }

        #region Get Combobox
        [HttpPost]
        public object GetGroupDataLogger()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CardDataLogger)))
                                              .Select(p => new { Code = p.CodeSet, Name = p.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public object GetListUser()
        {
            var data = _context.Users.Where(x => x.Active).Select(p => new { Code = p.UserName, Name = p.GivenName });
            return Json(data);
        }

        [HttpPost]
        public object GetListCard()
        {
            var data = _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH").Select(p => new { Code = p.CardCode, Name = p.CardName });
            return Json(data);
        }
        #endregion

        #region Function Process
        [HttpPost]
        public JsonResult ReportCardJob([FromBody]DataLoggerSearch jTablePara)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var listDataLogger = _context.JobcardDataLoggers.Where(x => !x.Flag &&
                                                                            (string.IsNullOrEmpty(jTablePara.Group) || x.DtGroup.Equals(jTablePara.Group)) &&
                                                                            (string.IsNullOrEmpty(jTablePara.CardCode) || x.JobcardCode.Equals(jTablePara.CardCode)) &&
                                                                            (string.IsNullOrEmpty(jTablePara.UserReport) || x.CreatedBy.Equals(jTablePara.UserReport)) &&
                                                                            ((fromDate == null || (x.CreatedTime >= fromDate)) && (toDate == null || (x.CreatedTime <= toDate))) &&
                                                                            IsNumber(x.DtValue));

                if (jTablePara.Type.Equals("SUM"))
                {
                    var listData = SumReportCardJob(listDataLogger);
                    if (listData.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Không có dữ liệu để tính tổng";
                        return Json(msg);
                    }

                    msg.Object = listData;
                    msg.Title = _stringLocalizer["RPTCJ_MSG_CAL_SUM_SUCCESS"];
                }
                else if (jTablePara.Type.Equals("SEARCH"))
                {
                    var listData = SearchReportCardJob(listDataLogger);
                    if (listData.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Không có dữ liệu";
                        return Json(msg);
                    }

                    msg.Object = listData;
                    msg.Title = _stringLocalizer["RPTCJ_MSG_SEARCH_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                throw ex;
            }

            return Json(msg);
        }

        private List<DataLoggerExport> SearchReportCardJob(IQueryable<JobcardDataLogger> listDataLogger)
        {
            var commonSetting = _context.CommonSettings.Where(x => !x.IsDeleted);
            var attrSetup = _context.AttrSetups.Where(x => !x.IsDeleted); 

            var dataGroupLogger = listDataLogger.GroupBy(x => x.SessionId)
                                                   .Select(p => new GroupLogger
                                                   {
                                                       SessionId = p.Key,
                                                       Color = "",
                                                       Index = 0
                                                   }).ToList();
            var index = 1;
            foreach (var item in dataGroupLogger)
            {
                item.Index = index;
                item.Color = index % 2 == 0 ? "aliceblue" : "";
                index++;
            }

            var data = (from a in listDataLogger
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        join c in dataGroupLogger on a.SessionId equals c.SessionId
                        join d in attrSetup on a.DtCode equals d.AttrCode
                        let comGroup = commonSetting.FirstOrDefault(x => !string.IsNullOrEmpty(x.CodeSet) && x.CodeSet.Equals(a.DtGroup))
                        let comUnit = commonSetting.FirstOrDefault(x => x.CodeSet.Equals(a.DtUnit))
                        select new DataLoggerExport
                        {
                            AttrName = d.AttrName,
                            AttrGroupName = comGroup != null ? comGroup.ValueSet : "",
                            Sum = a.DtValue,
                            Unit = !string.IsNullOrEmpty(a.DtUnit) ? a.DtUnit : "",
                            CreatedBy = b.GivenName,
                            Color = c.Color
                        }).ToList();

            return data;
        }

        private List<DataLoggerExport> SumReportCardJob(IQueryable<JobcardDataLogger> listDataLogger)
        {
            var commonSetting = _context.CommonSettings.Where(x => !x.IsDeleted);
            var attrSetup = _context.AttrSetups.Where(x => !x.IsDeleted);

            var dataGroup = listDataLogger.GroupBy(x => new
            {
                x.DtGroup,
                x.DtCode,
                x.DtUnit,
                x.CreatedBy
            }).Select(p => new
            {
                p.Key.DtGroup,
                p.Key.DtCode,
                p.Key.DtUnit,
                p.Key.CreatedBy,
                Sum = p.Sum(i => double.Parse(i.DtValue))
            });

            var dataGroupLogger = dataGroup.GroupBy(x => x.DtGroup)
                                           .Select(p => new GroupLogger
                                           {
                                               Group = p.Key,
                                               Color = "",
                                               Index = 0
                                           }).ToList();
            var index = 1;
            foreach (var item in dataGroupLogger)
            {
                item.Index = index;
                item.Color = index % 2 == 0 ? "aliceblue" : "";
                index++;
            }

            var data = (from a in dataGroup
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        join c in dataGroupLogger on a.DtGroup equals c.Group
                        join d in attrSetup on a.DtCode equals d.AttrCode
                        let comGroup = commonSetting.FirstOrDefault(x => !string.IsNullOrEmpty(x.CodeSet) && x.CodeSet.Equals(a.DtGroup))
                        let comUnit = commonSetting.FirstOrDefault(x => x.CodeSet.Equals(a.DtUnit))
                        orderby c.Index
                        select new DataLoggerExport
                        {
                            AttrName = d.AttrName,
                            AttrGroupName = comGroup != null ? comGroup.GroupNote : "",
                            Sum = a.Sum.ToString(),
                            Unit = !string.IsNullOrEmpty(a.DtUnit) ? a.DtUnit : "",
                            CreatedBy = b.GivenName,
                            Color = c.Color
                        }).ToList();

            return data;
        }

        [HttpPost]
        public object ExportExcel([FromBody] DataLoggerSearch jTablePara)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/BCKQ_DHV.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                IWorksheet sheetRequest = workbook.Worksheets[0];
                application.DefaultVersion = ExcelVersion.Excel2013;

                IStyle style = workbook.Styles.Add("NewStyle");
                style.Font.Size = 12;
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                style.VerticalAlignment = ExcelVAlign.VAlignCenter;

                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var listDataLogger = _context.JobcardDataLoggers.Where(x => !x.Flag &&
                                                                            (string.IsNullOrEmpty(jTablePara.Group) || x.DtGroup.Equals(jTablePara.Group)) &&
                                                                            (string.IsNullOrEmpty(jTablePara.CardCode) || x.JobcardCode.Equals(jTablePara.CardCode)) &&
                                                                            (string.IsNullOrEmpty(jTablePara.UserReport) || x.CreatedBy.Equals(jTablePara.UserReport)) &&
                                                                            ((fromDate == null || (x.CreatedTime >= fromDate)) && (toDate == null || (x.CreatedTime <= toDate))) &&
                                                                            IsNumber(x.DtValue));

                var listDataExport = new List<DataLoggerExport>();

                if (jTablePara.Type.Equals("SUM"))
                    listDataExport = SumReportCardJob(listDataLogger);
                else if (jTablePara.Type.Equals("SEARCH"))
                    listDataExport = SearchReportCardJob(listDataLogger);

                var row = 2;
                var stt = 0;
                var endRow = listDataExport.Count + row;
                if (listDataExport.Count > 0)
                {
                    for (int k = 0; k < listDataExport.Count; k++)
                    {
                        row++;
                        stt++;

                        sheetRequest.Range["A" + row].Value2 = stt;
                        sheetRequest.Range["B" + row].Value2 = string.Format("{0} - {1}", listDataExport[k].AttrGroupName.ToString(), listDataExport[k].AttrName.ToString());
                        sheetRequest.Range["C" + row].Value2 = listDataExport[k].Sum.ToString();
                        sheetRequest.Range["D" + row].Value2 = listDataExport[k].Unit.ToString();
                        sheetRequest.Range["E" + row].Value2 = listDataExport[k].CreatedBy.ToString();
                        sheetRequest.Range["A" + row + ":E" + endRow].CellStyle = style;
                    }

                    sheetRequest.Range["A3:" + "A" + endRow].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B3:" + "B" + endRow].CellStyle.WrapText = true;
                    sheetRequest.Range["C3:" + "C" + endRow].CellStyle.Font.Color = ExcelKnownColors.Red;
                    sheetRequest.Range["C3:" + "C" + endRow].CellStyle.Font.Bold = true;
                    sheetRequest.Range["D3:" + "D" + endRow].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["E3:" + "E" + endRow].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;

                    workbook.SetSeparators('.', '.');
                }

                var fileName = "Baocaoketqua_dieuhanhviec_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
                var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
                var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
                FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
                workbook.SaveAs(stream);
                stream.Dispose();

                var obj = new
                {
                    fileName,
                    pathFile = pathFileDownLoad
                };
                //msg.Object = obj;
                return obj;
            }
        }

        #endregion

        #region Other
        public bool IsNumber(string pText)
        {
            Regex regex = new Regex(@"^[-+]?[0-9]*\.?[0-9]+$");
            return regex.IsMatch(pText);
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

        #region Model
        public class DataLoggerSearch
        {
            public string Type { get; set; }
            public string Group { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserReport { get; set; }
            public string CardCode { get; set; }
        }

        public class GroupLogger
        {
            public string Color { get; set; }
            public string SessionId { get; set; }
            public string Group { get; set; }
            public int Index { get; set; }
        }

        public class DataLoggerExport
        {
            public string AttrName { get; set; }
            public string AttrGroupName { get; set; }
            public string Sum { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public string Color { get; set; }
        }

        #endregion
    }
}