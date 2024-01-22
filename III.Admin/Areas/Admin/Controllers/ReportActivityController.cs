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
    public class ReportActivityController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ReportActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ReportActivityController(EIMDBContext context, IStringLocalizer<ReportActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        [Breadcrumb("ViewData.CrumbRptActivity", AreaName = "Admin", FromAction = "Index", FromController = typeof(CardWorkHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCardWorkHome"] = _sharedResources["COM_CRUMB_CARD_WORK_HOME"];
            ViewData["CrumbRptActivity"] = _sharedResources["COM_CRUMB_REPORT_RESULT_ACT"];
            return View();
        }

        #region Get Combobox
        [HttpPost]
        public object GetGroupDataLogger()
        {
            //var data = _context.CommonSettings.Where(x => !x.IsDeleted &&
            //                                               x.AssetCode == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CardDataLogger))
            //                                  .GroupBy(i => i.Group).Select(p => new { Code = p.Key, Name = p.First().GroupNote });
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
        public JsonResult ReportActivity([FromBody]AttrDataSearch jTablePara)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                DateTime? dateUpperBound = null, dateLowerBound = null;
                int? iUpperBound = null, iLowerBound = null;
                DateTime dValue;
                int iValue;
                if (jTablePara.AttrDataType == "ATTR_DATA_TYPE_DATE") // date type
                {
                    dateUpperBound = !string.IsNullOrEmpty(jTablePara.ValueUpperBound) ? DateTime.ParseExact(jTablePara.ValueUpperBound, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    dateLowerBound = !string.IsNullOrEmpty(jTablePara.ValueLowerBound) ? DateTime.ParseExact(jTablePara.ValueLowerBound, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                }

                if (jTablePara.AttrDataType == "ATTR_DATA_TYPE20200826155525") // number type
                {
                    iUpperBound = !string.IsNullOrEmpty(jTablePara.ValueUpperBound) ? int.Parse(jTablePara.ValueUpperBound) : (int?)null;
                    iLowerBound = !string.IsNullOrEmpty(jTablePara.ValueLowerBound) ? int.Parse(jTablePara.ValueLowerBound) : (int?)null;
                }
                
                var listAttrData = from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted)
                                   join b in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals b.AttrCode
                                   where /*(string.IsNullOrEmpty(jTablePara.ValueUpperBound) || (int.TryParse(a.Value, out iValue) && int.Parse(a.Value) <= iUpperBound) || 
                                         (DateTime.TryParse(a.Value, out dValue) && DateTime.Parse(a.Value) <= dateUpperBound)) &&
                                         (string.IsNullOrEmpty(jTablePara.ValueSearch) || a.Value.Contains(jTablePara.ValueSearch)) &&*/
                                         (string.IsNullOrEmpty(jTablePara.ValueSearch) || a.Value.Contains(jTablePara.ValueSearch)) &&
                                         (string.IsNullOrEmpty(jTablePara.AttrDataType) || b.AttrDataType.Equals(jTablePara.AttrDataType)) &&
                                         (string.IsNullOrEmpty(jTablePara.Group) || b.AttrGroup.Equals(jTablePara.Group)) &&
                                         (string.IsNullOrEmpty(jTablePara.UserReport) || a.CreatedBy.Equals(jTablePara.UserReport)) &&
                                         ((fromDate == null || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) 
                                         && (toDate == null || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))) &&
                                         IsNumber(a.Value) // if record value type is number
                                   select new ActivityData
                                   {
                                       AttrCode = a.AttrCode,
                                       ActCode = a.ActCode,
                                       Value = a.Value,
                                       ObjActCode = a.ObjActCode,
                                       ObjCode = a.ObjCode,
                                       WorkFlowCode = a.WorkFlowCode,
                                       Note = a.Note,
                                       SessionId = a.SessionId,
                                       CreatedBy = a.CreatedBy,
                                       CreatedTime = a.CreatedTime,

                                       Group = b.AttrGroup,
                                       Unit = b.AttrUnit,
                                   };

                if (jTablePara.Type.Equals("SUM"))
                {
                    var listData = SumReportActivity(listAttrData);
                    if (listData.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Không có dữ liệu để tính tổng";
                        return Json(msg);
                    }
                    msg.Object = listData;
                    msg.Title = "Tính tổng thành công";
                }
                else if (jTablePara.Type.Equals("SEARCH"))
                {
                    var listData = SearchReportActivity(listAttrData);
                    if (listData.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Không có dữ liệu";
                        return Json(msg);
                    }
                    msg.Object = listData;
                    msg.Title = "Tìm kiếm thành công";
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

        private List<AttrDataExport> SearchReportActivity(IQueryable<ActivityData> listAttrData)
        {
            var commonSetting = _context.CommonSettings.Where(x => !x.IsDeleted);

            var attrDataGroups = listAttrData.GroupBy(x => x.SessionId)
                                                   .Select(p => new GroupLogger
                                                   {
                                                       SessionId = p.Key,
                                                       Color = "",
                                                       Index = 0
                                                   }).ToList();
            var index = 1;
            foreach (var item in attrDataGroups)
            {
                item.Index = index;
                item.Color = index % 2 == 0 ? "aliceblue" : "";
                index++;
            }

            var data = (from a in listAttrData
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        join c in attrDataGroups on a.SessionId equals c.SessionId
                        let attrSetup = _context.AttrSetups.FirstOrDefault(x => x.AttrCode.Equals(a.AttrCode))
                        let comGroup = commonSetting.FirstOrDefault(x => !string.IsNullOrEmpty(x.CodeSet) && x.CodeSet.Equals(a.Group))
                        let comUnit = commonSetting.FirstOrDefault(x => x.CodeSet.Equals(a.Unit))
                        select new AttrDataExport
                        {
                            AttrName = attrSetup != null ? attrSetup.AttrName : "",
                            AttrGroupName = comGroup != null ? comGroup.ValueSet : "",
                            Sum = a.Value,
                            Unit = comUnit != null ? comUnit.ValueSet : "",
                            CreatedBy = b.GivenName,
                            Color = c.Color
                        }).ToList();

            return data;
        }

        private List<AttrDataExport> SumReportActivity(IQueryable<ActivityData> listAttrData)
        {
            var commonSetting = _context.CommonSettings.Where(x => !x.IsDeleted);

            var dataGroup = listAttrData.GroupBy(x => new
            {
                x.Group,
                x.AttrCode,
                x.Unit,
                x.CreatedBy
            }).Select(p => new
            {
                p.Key.Group,
                p.Key.AttrCode,
                p.Key.Unit,
                p.Key.CreatedBy,
                Sum = p.Sum(i => double.Parse(i.Value))
            });

            var attrDataGroups = dataGroup.GroupBy(x => x.Group)
                                           .Select(p => new GroupLogger
                                           {
                                               Group = p.Key,
                                               Color = "",
                                               Index = 0
                                           }).ToList();
            var index = 1;
            foreach (var item in attrDataGroups)
            {
                item.Index = index;
                item.Color = index % 2 == 0 ? "aliceblue" : "";
                index++;
            }

            var data = (from a in dataGroup
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        join c in attrDataGroups on a.Group equals c.Group
                        let attrSetup = _context.AttrSetups.FirstOrDefault(x => x.AttrCode.Equals(a.AttrCode))
                        let comGroup = commonSetting.FirstOrDefault(x => !string.IsNullOrEmpty(x.CodeSet) && x.CodeSet.Equals(a.Group))
                        let comUnit = commonSetting.FirstOrDefault(x => x.CodeSet.Equals(a.Unit))
                        orderby c.Index
                        select new AttrDataExport
                        {
                            AttrName = attrSetup != null ? attrSetup.AttrName : "",
                            AttrGroupName = comGroup != null ? comGroup.ValueSet : "",
                            Sum = a.Sum.ToString(),
                            Unit = comUnit != null ? comUnit.ValueSet : "",
                            CreatedBy = b.GivenName,
                            Color = c.Color
                        }).ToList();

            return data;
        }

        [HttpPost]
        public object ExportExcel([FromBody] AttrDataSearch jTablePara)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/BCKQ_HD.xlsx";

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

                var listAttrData = from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted)
                                   join b in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals b.AttrCode
                                   where (string.IsNullOrEmpty(jTablePara.ValueSearch) || a.Value.Contains(jTablePara.ValueSearch)) &&
                                         (string.IsNullOrEmpty(jTablePara.AttrDataType) || b.AttrDataType.Equals(jTablePara.AttrDataType)) &&
                                         (string.IsNullOrEmpty(jTablePara.Group) || b.AttrGroup.Equals(jTablePara.Group)) &&
                                         (string.IsNullOrEmpty(jTablePara.UserReport) || a.CreatedBy.Equals(jTablePara.UserReport)) &&
                                         ((fromDate == null || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                                         && (toDate == null || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))) &&
                                         IsNumber(a.Value)
                                   select new ActivityData
                                   {
                                       AttrCode = a.AttrCode,
                                       ActCode = a.ActCode,
                                       Value = a.Value,
                                       ObjActCode = a.ObjActCode,
                                       ObjCode = a.ObjCode,
                                       WorkFlowCode = a.WorkFlowCode,
                                       Note = a.Note,
                                       SessionId = a.SessionId,
                                       CreatedBy = a.CreatedBy,
                                       CreatedTime = a.CreatedTime,

                                       Group = b.AttrGroup,
                                       Unit = b.AttrUnit,
                                   };

                var listDataExport = new List<AttrDataExport>();

                if (jTablePara.Type.Equals("SUM"))
                    listDataExport = SumReportActivity(listAttrData);
                else if (jTablePara.Type.Equals("SEARCH"))
                    listDataExport = SearchReportActivity(listAttrData);

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

                var fileName = "Baocaoketqua_hoatdong_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class AttrDataSearch
        {
            public string Type { get; set; }
            public string ValueUpperBound { get; set; }
            public string ValueLowerBound { get; set; }
            public string ValueSearch { get; set; }
            public string AttrDataType { get; set; }
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

        public class AttrDataExport
        {
            public string AttrName { get; set; }
            public string AttrGroupName { get; set; }
            public string Sum { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public string Color { get; set; }
        }

        public class ActivityData : ActivityAttrData
        {
            public string Group { get; set; }
            public string Unit { get; set; }
        }
        #endregion
    }
}