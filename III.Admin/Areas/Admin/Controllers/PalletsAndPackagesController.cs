using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using System.Globalization;
using System;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Authorization;
using III.Domain.Common;
using Microsoft.AspNetCore.Http.Internal;
using Syncfusion.XlsIO;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using static III.Admin.Controllers.MobileProductController;
using OpenXmlPowerTools;

namespace III.Admin.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class PalletsAndPackagesController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        //private readonly IStringLocalizer<ServiceRegistController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;

        public PalletsAndPackagesController(
            EIMDBContext context,
            IUploadService upload,
            IOptions<AppSettings> appSettings,
            IActionLogService actionLog,
            //IStringLocalizer<ServiceRegistController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IHostingEnvironment hostingEnvironment)
        {

            _context = context;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _sharedResources = sharedResources;
            //_stringLocalizer = stringLocalizer;
            _hostingEnvironment = hostingEnvironment;
        }

        #region Index
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTablePallet([FromBody] JTablePalleteModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = from a in _context.PackageObjects
                            join b in _context.CommonSettings on a.PackType equals b.CodeSet into ab
                            from type in ab.DefaultIfEmpty()
                            join c in _context.PAreaMappingsStore on a.CurrentPos equals c.ObjectCode into ac
                            from pos in ac.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Status equals d.CodeSet into ad
                            from status in ad.DefaultIfEmpty()
                            join e in _context.PackageObjects on a.PackCodeParent equals e.PackCode into ae
                            from parent in ae.DefaultIfEmpty()
                            join f in _context.CommonSettings on a.StatusReady equals f.CodeSet into af
                            from ready in af.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.Keyword)
                            || (!string.IsNullOrEmpty(a.PackName) && a.PackName.Contains(jTablePara.Keyword))
                            || (!string.IsNullOrEmpty(a.PackCode) && a.PackCode.Contains(jTablePara.Keyword)))
                            && (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status)
                            && (string.IsNullOrEmpty(jTablePara.MappingCode) || a.CurrentPos == jTablePara.MappingCode)
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.PackCode,
                                a.PackName,
                                CurrentPos = pos.ObjectCode,
                                Parent = parent.PackName,
                                a.Specs,
                                Status = status.ValueSet,
                                Type = type.ValueSet,
                                a.Noted,
                                a.AttrPack,
                                StatusReady = ready.ValueSet,
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PackCode", "PackName", "CurrentPos", "Parent", "Specs", "Status", "Type", "Noted", "AttrPack", "StatusReady");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "Id", "PackCode", "PackName", "CurrentPos", "Parent", "Specs", "Status", "Type", "Noted", "AttrPack", "StatusReady");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTable([FromBody] JTablePalleteModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var common = _context.CommonSettings.ToList();
                var query = _context.PackageObjects
                    .Where(x =>
                    (string.IsNullOrEmpty(jTablePara.Keyword)
                    || (!string.IsNullOrEmpty(x.PackName) && x.PackName.Contains(jTablePara.Keyword))
                    || (!string.IsNullOrEmpty(x.PackCode) && x.PackCode.Contains(jTablePara.Keyword)))
                    && (string.IsNullOrEmpty(jTablePara.Status) || x.Status == jTablePara.Status)
                    && (string.IsNullOrEmpty(jTablePara.MappingCode) || x.CurrentPos == jTablePara.MappingCode)
                );
                var count = query.Count();
                var package = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
                {
                    x.Id,
                    x.PackCode,
                    x.PackName,
                    x.PackType,
                    PackTypeName = (x.PackType != null) ? common.FirstOrDefault(y => y.CodeSet == x.PackType).ValueSet : "",
                    x.Specs,
                    x.Noted,
                    x.CurrentPos,
                    x.Status,
                    StatusName = (x.Status != null) ? common.FirstOrDefault(y => y.CodeSet == x.Status).ValueSet : "",
                    x.PackCodeParent,
                    PackCodeParentName = (x.PackCodeParent != null) ? _context.PackageObjects.FirstOrDefault(y => y.PackCode == x.PackCodeParent).PackName : "",
                    AttrPack = ValidateAttrPack(x.AttrPack),
                    x.Level,
                    x.NumPosition
                }).ToList();

                var jdata = JTableHelper.JObjectTable(package, jTablePara.Draw, count, "Id", "PackCode", "PackName", "PackType", "PackTypeName", "Specs", "Noted", "CurrentPos", "Status", "StatusName", "PackCodeParent", "PackCodeParentName", "AttrPack", "Level", "NumPosition");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "PackCode", "PackName", "PackType", "PackTypeName", "Specs", "Noted", "CurrentPos", "Status", "StatusName", "PackCodeParent", "PackCodeParentName", "AttrPack", "Level", "NumPosition");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTableQr([FromBody] JTablePalleteModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                //var common = _context.CommonSettings.ToList();
                //var query = _context.PackageObjects
                //    .Where(x =>
                //    (string.IsNullOrEmpty(jTablePara.Keyword)
                //    || (!string.IsNullOrEmpty(x.PackName) && x.PackName.Contains(jTablePara.Keyword))
                //    || (!string.IsNullOrEmpty(x.PackCode) && x.PackCode.Contains(jTablePara.Keyword)))
                //    && (string.IsNullOrEmpty(jTablePara.Status) || x.Status == jTablePara.Status)
                //    && (string.IsNullOrEmpty(jTablePara.MappingCode) || x.CurrentPos == jTablePara.MappingCode)
                //);
                //var count = query.Count();
                //var package = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new ProductQrCodeRes
                //{
                //    Id = x.Id,
                //    Code = x.PackCode,
                //    QrCode = x.PackCode,
                //    PackName = x.PackName,
                //    //unit = d1 != null ? d1.ValueSet : "Không xác định",
                //    //productgroup = b != null ? b.Name : "Không xác định",
                //    //producttype = c != null ? c.Name : "Không xác định",
                //    Count = 0,
                //    //CreatedBy = x.,
                //    //CreatedTime = a.CreatedTime,
                //}).ToList();
                var query = from a in _context.PackageObjects
                            join b in _context.CommonSettings on a.PackType equals b.CodeSet into ab
                            from type in ab.DefaultIfEmpty()
                            join c in _context.PAreaMappingsStore on a.CurrentPos equals c.ObjectCode into ac
                            from pos in ac.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Status equals d.CodeSet into ad
                            from status in ad.DefaultIfEmpty()
                            join e in _context.PackageObjects on a.PackCodeParent equals e.PackCode into ae
                            from parent in ae.DefaultIfEmpty()
                            join f in _context.CommonSettings on a.StatusReady equals f.CodeSet into af
                            from ready in af.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.Keyword)
                            || (!string.IsNullOrEmpty(a.PackName) && a.PackName.Contains(jTablePara.Keyword))
                            || (!string.IsNullOrEmpty(a.PackCode) && a.PackCode.Contains(jTablePara.Keyword)))
                            && (string.IsNullOrEmpty(jTablePara.Status) || a.StatusReady == jTablePara.Status)
                            && (string.IsNullOrEmpty(jTablePara.MappingCode) || a.CurrentPos == jTablePara.MappingCode)
                            orderby a.Id descending
                            select new ProductQrCodeRes
                            {
                                Id = a.Id,
                                Code = a.PackCode,
                                QrCode = a.PackCode,
                                PackName = a.PackName,
                                CurrentPos = pos.ObjectCode,
                                StatusReady = ready.ValueSet,
                            };
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                foreach (var item in data)
                {
                    item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
                }

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "QrCode", "PackName", "CurrentPos", "StatusReady");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "Code", "QrCode", "PackName", "CurrentPos", "StatusReady");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcelQr([FromBody] JTablePalleteModel jTablePara)
        {
            var msg = new JMessage();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listData = (from a in _context.PackageObjects
                            .Where(x =>
                            (string.IsNullOrEmpty(jTablePara.Keyword)
                            || (!string.IsNullOrEmpty(x.PackName) && x.PackName.Contains(jTablePara.Keyword))
                            || (!string.IsNullOrEmpty(x.PackCode) && x.PackCode.Contains(jTablePara.Keyword)))
                            && (string.IsNullOrEmpty(jTablePara.Status) || x.Status == jTablePara.Status)
                            && (string.IsNullOrEmpty(jTablePara.MappingCode) || x.CurrentPos == jTablePara.MappingCode))
                            orderby a.Id descending
                            select new ProductQrCodeRes
                            {
                                Id = a.Id,
                                Code = a.PackCode,
                                QrCode = a.PackCode,
                                PackName = a.PackName,
                                //unit = d1 != null ? d1.ValueSet : "Không xác định",
                                //productgroup = b != null ? b.Name : "Không xác định",
                                //producttype = c != null ? c.Name : "Không xác định",
                                Count = 0,
                            }).ToList();
            var filePath = "/files/Template/temp-pallete.xlsx";

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
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Dotted;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                style.Font.FontName = "Times New Roman";
                var countAdd = listData.Count();
                if (countAdd > 0)
                    sheetRequest.InsertRow(4, countAdd);
                var row = 3;

                var countAddComponent = listData.Count();
                if (countAddComponent > 0)
                    sheetRequest.InsertRow(row, countAddComponent);

                sheetRequest.Range["C1"].Value2 = "Tên Pallete";
                var id = 1;
                for (int j = 0; j < listData.Count(); j++)
                {
                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                    sheetRequest.Range["A" + row].Value2 = id;
                    sheetRequest.Range["B" + row].Value2 = listData[j].Code;
                    sheetRequest.Range["C" + row].Value2 = $"{listData[j].PackName} [ {listData[j].Id} ]";
                    //sheetRequest.Range["D" + row].Value2 = listData[j].Unit;
                    //sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                    //sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                    sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                    row++;
                    id++;
                }
                workbook.SetSeparators('.', '.');

                var fileName = "DanhSachQRPallete-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
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
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetListStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "STATUS_PACKAGE")
                .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Ok(rs);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetListPackage()
        {
            var rs = _context.PackageObjects.OrderBy(x => x.Id).Select(x => new { Code = x.PackCode, Name = x.PackName, StatusReady = x.StatusReady });
            return Ok(rs);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetListTypePacking()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "TYPE_PACKING")
                .OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Ok(rs);
        }

        private List<AttrPackModel> ValidateAttrPack(string data)
        {
            if (data == null)
            {
                return new List<AttrPackModel>();
            }
            else
            {
                List<AttrPackModel> jsonData = JsonConvert.DeserializeObject<List<AttrPackModel>>(data);
                return jsonData;
            }
        }

        public class AttrPackModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Value { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
        }
        public class JTablePalleteModel : JTableModel
        {
            public string Keyword { get; set; }
            public string Status { get; set; }
            public string MappingCode { get; set; }
        }
        #endregion

        #region Package Object
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetTicketCode()
        {
            var count = _context.PackageObjects.Count();
            var maxId = count > 0 ? _context.PackageObjects.Max(x => x.Id) + 1 : 1;
            return Ok($"PACK_CODE_{maxId}");
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Insert([FromBody] PackageObjectModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.PackageObjects.FirstOrDefault(x => x.PackCode == obj.PackCode);
                if (check == null)
                {
                    if ((string.IsNullOrWhiteSpace(obj.PackName) || obj.PackName == "")
                        || (string.IsNullOrWhiteSpace(obj.Status) || obj.Status == "")
                        || (string.IsNullOrWhiteSpace(obj.StatusReady) || obj.StatusReady == "")
                        || (string.IsNullOrWhiteSpace(obj.PackType) || obj.PackType == ""))
                    {
                        msg.Error = true;
                        msg.Title = "Thiếu một số trường dữ liệu quang trọng!!!";
                        return Ok(msg);
                    }
                    _context.PackageObjects.Add(new PackageObject()
                    {
                        PackCode = obj.PackCode,
                        PackName = obj.PackName,
                        PackType = obj.PackType,
                        Specs = obj.Specs,
                        Noted = obj.Noted,
                        CurrentPos = obj.CurrentPos,
                        Status = obj.Status,
                        PackCodeParent = obj.PackCodeParent,
                        AttrPack = obj.AttrPack,
                        Level = obj.Level,
                        NumPosition = obj.NumPosition,
                        StatusReady = obj.StatusReady,
                    });
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], "");
            }
            return Ok(msg);
        }

        [AllowAnonymous]
        [HttpPut]
        public IActionResult Update([FromBody] PackageObjectModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;
                var objUpdate = _context.PackageObjects.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (objUpdate != null)
                {
                    //Update bảng header
                    objUpdate.PackName = obj.PackName;
                    objUpdate.PackType = obj.PackType;
                    objUpdate.Specs = obj.Specs;
                    objUpdate.Noted = obj.Noted;
                    objUpdate.CurrentPos = obj.CurrentPos;
                    objUpdate.Status = obj.Status;
                    objUpdate.PackCodeParent = obj.PackCodeParent;
                    objUpdate.AttrPack = obj.AttrPack;
                    objUpdate.Level = obj.Level;
                    objUpdate.NumPosition = obj.NumPosition;
                    objUpdate.StatusReady = obj.StatusReady;

                    _context.PackageObjects.Update(objUpdate);
                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], "");
            }
            return Ok(msg);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetItem(int id)
        {
            var data1 = _context.CommonSettings
                    .Where(x => x.Group == "UNIT" && x.IsDeleted == false)
                    .OrderBy(x => x.SettingID).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });

            var data2 = _context.PackageObjects.FirstOrDefault(x => x.Id.Equals(id));
            object obj = new
            {
                ListUnit = data1,
                Pallet = data2
            };
            return Ok(obj);
        }

        [AllowAnonymous]
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.PackageObjects.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], "");
                }
                else
                {
                    _context.PackageObjects.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], "");
                msg.Object = ex;
            }
            return Ok(msg);
        }

        public class PackageObjectModel
        {
            public int? Id { get; set; }


            public string PackCode { get; set; }


            public string PackName { get; set; }


            public string PackType { get; set; }


            public string Specs { get; set; }

            public string Noted { get; set; }


            public string CurrentPos { get; set; }


            public string Status { get; set; }


            public string PackCodeParent { get; set; }

            public string AttrPack { get; set; }


            public string Level { get; set; }


            public string NumPosition { get; set; }

            public string StatusReady { get; set; }
        }
        #endregion

        #region Header
        public class JTableHeaderModel : JTableModel
        {
            public string Keyword { get; set; }
            public string Status { get; set; }
            public string Creator { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableHeader([FromBody] JTableHeaderModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query = from a in _context.PackageTicketHds
                            join b in _context.CommonSettings on a.Status equals b.CodeSet into ab
                            from status in ab.DefaultIfEmpty()
                            join c in _context.HREmployees on a.TicketCreator equals c.employee_code into ac
                            from creator in ac.DefaultIfEmpty()
                            join d in _context.HREmployees on a.TicketCreator equals d.employee_code into ad
                            from packager in ad.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.Keyword)
                                    || (!string.IsNullOrEmpty(a.TicketTitle) && a.TicketTitle.Contains(jTablePara.Keyword))
                                    || (!string.IsNullOrEmpty(a.TicketCode) && a.TicketCode.Contains(jTablePara.Keyword)))
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                a.TicketTitle,
                                CreatorName = creator != null ? creator.fullname : "",
                                TicketTimeCreator = a.TicketTimeCreator.HasValue ? a.TicketTimeCreator.Value.ToString("dd/MM/yyyy") : "",
                                PackagerName = packager != null ? packager.fullname : "",
                                PackagerTime = a.PackagerTime.HasValue ? a.PackagerTime.Value.ToString("dd/MM/yyyy") : "",
                                StatusName = status.ValueSet,
                                a.Noted,
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketCode", "TicketTitle", "CreatorName", "TicketTimeCreator", "PackagerName", "PackagerTime", "StatusName", "Noted");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "TicketCode", "TicketTitle", "CreatorName", "TicketTimeCreator", "PackagerName", "PackagerTime", "StatusName", "Noted");
                return Json(jdata);
            }
        }
        [AllowAnonymous]
        [HttpPost]
        public IActionResult InsertHeader([FromBody] PackageTicketModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var check = _context.PackageTicketHds.FirstOrDefault(x => x.PackCode == obj.PackCode);
                var ticketTimeCreator = !string.IsNullOrEmpty(obj.TicketTimeCreator) ?
                    DateTime.ParseExact(obj.TicketTimeCreator, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var packagerTime = !string.IsNullOrEmpty(obj.PackagerTime) ?
                    DateTime.ParseExact(obj.PackagerTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (/*check == null*/true)
                {
                    _context.PackageTicketHds.Add(new PackageTicketHd()
                    {
                        TicketCode = Guid.NewGuid().ToString(),
                        TicketTitle = obj.TicketTitle,
                        TicketCreator = obj.TicketCreator,
                        Packager = obj.Packager,
                        Noted = obj.Noted,
                        TicketTimeCreator = ticketTimeCreator,
                        Status = obj.Status,
                        PackagerTime = packagerTime,
                    });
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "");
                }
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], "");
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], "");
            }
            return Ok(msg);
        }

        [AllowAnonymous]
        [HttpPut]
        public IActionResult UpdateHeader([FromBody] PackageTicketModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var ticketTimeCreator = !string.IsNullOrEmpty(obj.TicketTimeCreator) ?
                    DateTime.ParseExact(obj.TicketTimeCreator, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var packagerTime = !string.IsNullOrEmpty(obj.PackagerTime) ?
                    DateTime.ParseExact(obj.PackagerTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var objUpdate = _context.PackageTicketHds.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (objUpdate != null)
                {
                    //Update bảng header
                    objUpdate.TicketTitle = obj.TicketTitle;
                    objUpdate.Packager = obj.Packager;
                    objUpdate.Status = obj.Status;
                    objUpdate.Noted = obj.Noted;
                    objUpdate.TicketTimeCreator = ticketTimeCreator;
                    objUpdate.PackagerTime = packagerTime;
                    _context.PackageTicketHds.Update(objUpdate);
                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], "");
            }
            return Ok(msg);
        }


        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetItemHeader(int id)
        {
            return Ok(_context.PackageTicketHds.FirstOrDefault(x => x.Id.Equals(id)));
        }

        [AllowAnonymous]
        [HttpDelete]
        public IActionResult DeleteHeader(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.PackageTicketHds.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], "");
                }
                else
                {
                    _context.PackageTicketHds.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], "");
                msg.Object = ex;
            }
            return Ok(msg);
        }

        public class PackageTicketModel
        {
            public int? Id { get; set; }


            public string TicketCode { get; set; }


            public string TicketTitle { get; set; }


            public string TicketCreator { get; set; }

            public string TicketTimeCreator { get; set; }


            public string Packager { get; set; }

            public string PackagerTime { get; set; }


            public string Status { get; set; }

            public string Noted { get; set; }
        }
        #endregion

        #region Detail
        [AllowAnonymous]
        [HttpPost]
        public IActionResult GetListProductInStock()
        {
            var query = from a in _context.ProductInStocks
                     join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode into ab
                     from product in ab.DefaultIfEmpty()
                     where a.IsDeleted == false
                     orderby a.Id descending
                     select new
                     {
                         Code = product.ProductCode,
                         Name = product.ProductName,
                         IdImpProduct = a.IdImpProduct
                     };
            var data = query.ToList();
            return Ok(data);
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult GetListProduct()
        {
            var rs = _context.MaterialProducts.Where(x => x.IsDeleted == false)
                .OrderBy(x => x.Id).Select(x => new { Code = x.ProductCode, Name = x.ProductName });
            return Ok(rs);
        }

        public class JTableDetailModel : JTableModel
        {
            public string TicketCode { get; set; }
            public string PackCode { get; set; }
        }

        [AllowAnonymous]
        [HttpPost]
        public object JTableDetail([FromBody] JTableDetailModel jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query = from a in _context.PackageTicketDts
                            join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode into ab
                            from product in ab.DefaultIfEmpty()
                            join c in _context.CommonSettings on a.StatusProductPallet equals c.CodeSet into ac
                            from status in ac.DefaultIfEmpty()
                            join d in _context.ProductGattrExts on a.GattrCode equals d.GattrCode into ad
                            from properties in ad.DefaultIfEmpty()
                            join e in _context.PackageObjects on a.PackCode equals e.PackCode into ae
                            from pallet in ae.DefaultIfEmpty()
                            where (!string.IsNullOrEmpty(a.TicketCode)
                                    && a.TicketCode.Contains(jTablePara.TicketCode))
                                    && (string.IsNullOrEmpty(jTablePara.PackCode)
                                    || (!string.IsNullOrEmpty(a.PackCode)
                                    && a.PackCode.Contains(jTablePara.PackCode)
                                    && a.StatusProductPallet != "PRODUCT_PALLET_DELETE"))
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.TicketCode,
                                ProductName = product.ProductName,
                                ProductCode = product.ProductCode,
                                PackName = pallet.PackName,
                                a.IdImpProduct,
                                a.ProductNumRange,
                                Status = status.ValueSet,
                                TypeProperties = properties.GattrFlatCode
                            };

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketCode", "ProductName", "ProductCode", "PackName", "IdImpProduct", "ProductNumRange", "Status", "TypeProperties");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "TicketCode", "ProductName", "ProductCode", "PackName", "IdImpProduct", "ProductNumRange", "Status", "TypeProperties");
                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult InsertDetail([FromBody] PackageTicketDetail obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var listProdNo = new List<ProdStrNo>();
                try
                {
                    listProdNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNumRange);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                if (listProdNo.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự không hợp lệ!";
                    return Ok(msg);
                }
                var checkDetails = _context.PackageTicketDts.Where(x => x.ProductCode == obj.ProductCode
                && x.TicketCode == obj.TicketCode).ToList();
                if (checkDetails.Count == 0 || obj.IsInStock)
                {
                    var _updatePallet = UpdatePackgeObject(obj);
                    var _idTicket = CreatePackageTicketDt(obj);

                    _context.ProductInPallets.Add(new ProductInPallet()
                    {
                        ProductCode = obj.ProductCode,
                        IdImpProduct = obj.IdImpProduct,
                        ProductNo = obj.ProductNumRange,
                        GattrCode = obj.GattrCode,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        PackCode = obj.PackCode,
                        Measure = obj.Weight,
                        CreatedBy = ESEIM.AppContext.UserName,
                        IdLoadingTicket = _idTicket,
                    });
                }
                else
                {
                    var checkProductNum = checkDetails.Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                    if (checkProductNum)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự đã được sử dụng!";
                        return Ok(msg);
                    }
                    var detail = checkDetails.FirstOrDefault();
                    detail.ListProdStrNo.AddRange(listProdNo);
                    //var checkProductNum = checkDetails.Any(x => x.Pro);
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], "");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], "");
            }
            return Ok(msg);
        }

        public int CreatePackageTicketDt(PackageTicketDetail obj)
        {
            var _packageTicketDt = new PackageTicketDt()
            {
                TicketCode = obj.TicketCode,
                ProductCode = obj.ProductCode,
                IdImpProduct = obj.IdImpProduct,
                ProductNumRange = obj.ProductNumRange,
                GattrCode = obj.GattrCode,
                PackCode = obj.PackCode,
                StatusProductPallet = "PRODUCT_PALLET_ADD"
            };
            _context.PackageTicketDts.Add(_packageTicketDt);
            _context.SaveChanges();

            return _packageTicketDt.Id;
        }

        public bool UpdatePackgeObject(PackageTicketDetail obj)
        {
            var _packgage = _context.PackageObjects.FirstOrDefault(p => p.PackCode == obj.PackCode);
            _packgage.PackLot = obj.UUID;
            _packgage.StatusReady = obj.StatusReady;
            _context.PackageObjects.Update(_packgage);
            _context.SaveChanges();

            return true;
        }
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetItemDetail(int id)
        {
            var query = _context.PackageTicketDts
                                .Where(a => a.Id == id)
                                .SelectMany(a => _context.ProductInPallets
                                    .Where(b => b.IdLoadingTicket == a.Id)
                                    .DefaultIfEmpty(),
                                    (a, b) => new
                                    {
                                        ProductCode = a.ProductCode,
                                        IdImpProduct= a.IdImpProduct,
                                        ProductNumRange = a.ProductNumRange,
                                        GattrCode = a.GattrCode,
                                        PackCode = a.PackCode,
                                        Measure = b != null ? b.Measure : null
                                    }).FirstOrDefault();

            return Ok(query);
        }

        [AllowAnonymous]
        [HttpPut]
        public IActionResult UpdateDetail([FromBody] PackageTicketDetail obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var listProdNo = new List<ProdStrNo>();
                try
                {
                    listProdNo = ListProdStrNoHelper.GetListProdStrNo(obj.ProductNumRange);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                if (listProdNo.Count == 0)
                {
                    msg.Error = true;
                    msg.Title = "Thứ tự không hợp lệ!";
                    return Ok(msg);
                }
                var checkDetails = _context.PackageTicketDts.Where(x => x.ProductCode == obj.ProductCode
                && x.TicketCode == obj.TicketCode).ToList();
                if (checkDetails.Count == 0 || obj.IsInStock)
                {
                    var _updatePallet = UpdatePackgeObject(obj);
                    var _idTicket = UpdatePackageTicketDt(obj);

                    var _product = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == _idTicket);
                    if (_product != null)
                    {
                        _product.ProductCode = obj.ProductCode;
                        _product.IdImpProduct = obj.IdImpProduct;
                        _product.ProductNo = obj.ProductNumRange;
                        _product.GattrCode = obj.GattrCode;
                        _product.UpdatedTime = DateTime.Now;
                        _product.IsDeleted = false;
                        _product.PackCode = obj.PackCode;
                        _product.Measure = obj.Weight;
                        _product.UpdatedBy = ESEIM.AppContext.UserName;
                        _product.IdLoadingTicket = _idTicket;
                    }
                }
                else
                {
                    var checkProductNum = checkDetails.Any(x => x.ListProdStrNo.IsIntersect(listProdNo));
                    if (checkProductNum)
                    {
                        msg.Error = true;
                        msg.Title = "Thứ tự đã được sử dụng!";
                        return Ok(msg);
                    }
                    var detail = checkDetails.FirstOrDefault();
                    detail.ListProdStrNo.AddRange(listProdNo);
                    //var checkProductNum = checkDetails.Any(x => x.Pro);
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], "");
            }
            return Ok(msg);
        }

        private int UpdatePackageTicketDt(PackageTicketDetail obj)
        {
            var _packageTicketDt = _context.PackageTicketDts.FirstOrDefault(x => x.Id == obj.Id);


            _packageTicketDt.TicketCode = obj.TicketCode;
            _packageTicketDt.ProductCode = obj.ProductCode;
            _packageTicketDt.IdImpProduct = obj.IdImpProduct;
            _packageTicketDt.ProductNumRange = obj.ProductNumRange;
            _packageTicketDt.GattrCode = obj.GattrCode;
            _packageTicketDt.PackCode = obj.PackCode;
            _packageTicketDt.StatusProductPallet = "PRODUCT_PALLET_EDIT";
            _context.PackageTicketDts.Update(_packageTicketDt);
            _context.SaveChanges();

            return _packageTicketDt.Id;
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdatePackageTicketDetail([FromBody] PackageTicketDtModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PackageTicketDts.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.ProductCode == obj.ProductCode && x.PackCode == obj.PackCode);
                var dataPallet = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == data.Id);
                if (data != null)
                {
                    data.ProductCode = obj.ProductCode;
                    data.IdImpProduct = obj.IdImpProduct;
                    data.ProductNumRange = obj.ProductNumRange;
                    data.GattrCode = obj.GattrCode;
                    data.PackCode = obj.PackCode;
                    data.StatusProductPallet = "PRODUCT_PALLET_EDIT";
                    _context.PackageTicketDts.Update(data);

                    dataPallet.ProductCode = obj.ProductCode;
                    dataPallet.ProductNo = obj.ProductNumRange;
                    dataPallet.GattrCode = obj.GattrCode;
                    dataPallet.UpdatedBy = ESEIM.AppContext.UserName; ;
                    dataPallet.Measure = obj.Measure;
                    dataPallet.UpdatedTime = DateTime.Now;
                    _context.ProductInPallets.Update(dataPallet);
                    _context.SaveChanges();
                    msg.Title = "Sửa chi tiết xếp dỡ Pallet/kiện hàng thành công";
                }
                else
                {
                    //var dataAdd = new PackageTicketDt
                    //{
                    //    TicketCode = obj.TicketCode,
                    //    ProductCode = obj.ProductCode,
                    //    IdImpProduct = obj.IdImpProduct,
                    //    ProductNumRange = obj.ProductNumRange,
                    //    GattrCode = obj.GattrCode,
                    //};
                    //_context.PackageTicketDts.Add(dataAdd);
                    //_context.SaveChanges();
                    msg.Title = "Bạn chưa thêm mới sản phẩm trong chi tiết";
                }
            }
            catch (Exception ex)
            {

                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi sửa";
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpDelete]
        public IActionResult DeleteDetail(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var _detail = _context.PackageTicketDts.FirstOrDefault(x => x.Id == id);
                if (_detail == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], "");
                }
                else
                {
                    _detail.StatusProductPallet = "PRODUCT_PALLET_DELETE";
                    var _product = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == id);
                    if(_product != null)
                    {
                        _product.DeletedBy = ESEIM.AppContext.UserName;
                        _product.DeletedTime = DateTime.Now;
                        _product.IsDeleted = true;
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], "");
                msg.Object = ex;
            }
            return Ok(msg);
        }

        [AllowAnonymous]
        [HttpDelete]
        public IActionResult DeleteAllDetail(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var _detail = _context.PackageTicketDts.FirstOrDefault(x => x.Id == id);
                if (_detail == null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], "");
                }
                else
                {
                    _context.PackageTicketDts.Remove(_detail);
                    var _product = _context.ProductInPallets.FirstOrDefault(x => x.IdLoadingTicket == id);
                    if (_product != null)
                    {
                        _product.DeletedBy = ESEIM.AppContext.UserName;
                        _product.DeletedTime = DateTime.Now;
                        _product.IsDeleted = true;
                    }
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], "");
                msg.Object = ex;
            }
            return Ok(msg);
        }

        public class PackageTicketDetail
        {
            public int? Id { get; set; }
            public string TicketCode { get; set; }
            public string ProductCode { get; set; }
            public int IdImpProduct { get; set; }
            public string ProductNumRange { get; set; }
            public string GattrCode { get; set; }
            public string PackCode { get; set; }
            public int Weight { get; set; }
            public bool IsInStock { get; set; }
            public string UUID { get; set; }
            public string StatusReady { get; set; }
        }
        #endregion
    }
}
