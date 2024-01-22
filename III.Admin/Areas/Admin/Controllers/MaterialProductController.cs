using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using log4net.Repository.Hierarchy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    public class MaterialJtableModel : JTableModel
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string FromTo { get; set; }
        public string DateTo { get; set; }
    }
    public class MaterialAttributeJtableModel : JTableModel
    {
        public int? ProductId { get; set; }
    }
    public class MaterialFileJtableModel : JTableModel
    {
        public string ProductCode { get; set; }
        public string Name { get; set; }
        public string Fomart { get; set; }
    }
    [Area("Admin")]
    public class MaterialProductController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        public static List<Progress> progress;
        private readonly IStringLocalizer<MaterialProductController> _stringLocalizer;
        private readonly IStringLocalizer<MaterialProductAttributeMainController> _attrMainLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<MaterialProductGroupController> _stringLocalizerGroup;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        public string[] mediaType = new string[] { "video/3gpp", "video/mp4", "video/mpeg", "video/ogg", "video/quicktime", "video/webm", "video/x-m4v", "video/ms-asf", "video/x-ms-wmv", "video/x-msvideo" };
        public class JTableModelCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Group { get; set; }
            public string[] ListGroup { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string Catalogue { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
        }
        public class JMessage2 : JMessage
        {
            public List<ReadProductAttributeExcelImp> list { get; set; }
        }
        public MaterialProductController(EIMDBContext context,
                                         IUploadService upload,
                                         IOptions<AppSettings> appSettings,
                                         IHostingEnvironment hostingEnvironment,
                                         IActionLogService actionLog,
                                         IStringLocalizer<MaterialProductController> stringLocalizer,
                                         IStringLocalizer<FilePluginController> stringLocalizerFp,
                                         IStringLocalizer<SharedResources> sharedResources,
                                         IStringLocalizer<MaterialProductAttributeMainController> attrMainLocalizer,
                                         IStringLocalizer<FileObjectShareController> fileObjectShareLocalizer,
                                         IStringLocalizer<EDMSRepositoryController> edmsRepositoryController,
                                         IStringLocalizer<MaterialProductGroupController> stringLocalizerGroup)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerFp = stringLocalizerFp;
            _attrMainLocalizer = attrMainLocalizer;
            _fileObjectShareLocalizer = fileObjectShareLocalizer;
            _edmsRepositoryController = edmsRepositoryController;
            _stringLocalizerGroup = stringLocalizerGroup;
        }

        #region Index
        [Breadcrumb("ViewData.CrumbMaterialProd", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbMaterialProd"] = _sharedResources["COM_CRUMB_MATERIAL_PROD"];
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody] JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
                // Create a StringBuilder to construct SQL condition
                var sqlStringBuilder = new StringBuilder("SELECT Id FROM MATERIAL_PRODUCT " +
                    "CROSS APPLY (    SELECT TOP 1 *    FROM OPENJSON(JSON_STATUS)    " +
                    "WITH (        " +
                    "ActTime DATETIME2(7) '$.ActTime',        " +
                    "SupCode NVARCHAR(50) '$.SupCode',        " +
                    "CusCode NVARCHAR(50) '$.CusCode'    ) " +
                    "AS JsonData     ORDER BY ActTime DESC) " +
                    "AS LastJsonData WHERE JSON_STATUS IS NOT NULL");

                List<object> parameters = new List<object>();

                // Check and append condition for CusCode
                if (!string.IsNullOrEmpty(jTablePara.CusCode))
                {
                    parameters.Add(jTablePara.CusCode);
                    sqlStringBuilder.Append($" AND LastJsonData.CusCode = {{{parameters.Count - 1}}}");
                }

                // Check and append condition for SupCode
                if (!string.IsNullOrEmpty(jTablePara.SupCode))
                {
                    parameters.Add(jTablePara.SupCode);
                    sqlStringBuilder.Append($" AND LastJsonData.SupCode = {{{parameters.Count - 1}}}");
                }


                // Finalize the SQL query string
                var sqlQuery = sqlStringBuilder.ToString();

                //var directQueryTest = _context.MaterialProducts
                //.FromSql("SELECT * FROM MATERIAL_PRODUCT WHERE JSON_STATUS IS NOT NULL AND JSON_STATUS LIKE '%ABCXYZ%'")
                //.ToList();

                var queryJson = _context.MaterialProducts
                                     .FromSql(sqlQuery, parameters.ToArray())
                                     .Select(mp => mp.Id);

                var query = (from a in _context.MaterialProducts.AsNoTracking()
                             join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                             from b in b1.DefaultIfEmpty()
                             join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                             from c in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                             from d1 in d2.DefaultIfEmpty()
                             join f in _context.ProductLocatedMappings.Where(x => !x.IsDeleted) on a.ProductCode equals f.ProductCode into f1
                             from f in f1.DefaultIfEmpty()
                             where !a.IsDeleted
                                 && (string.IsNullOrEmpty(jTablePara.Code) || (a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()) || a.ProductName.ToLower().Contains(jTablePara.Code.ToLower())))
                                 && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                 && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                 && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                               && (string.IsNullOrEmpty(jTablePara.Group) || (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                               && (jTablePara.ListGroup == null || jTablePara.ListGroup.Length == 0 || (jTablePara.ListGroup.Length != 0 && jTablePara.ListGroup.Any(x => x == a.GroupCode)))
                                 && (string.IsNullOrEmpty(jTablePara.Type) || (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                 && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                 && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                                 && ((string.IsNullOrEmpty(jTablePara.CusCode) && string.IsNullOrEmpty(jTablePara.SupCode)) ||
                                     (!string.IsNullOrEmpty(a.JsonStatus) && queryJson.Contains(a.Id)))
                             select new MaterialProductRes
                             {
                                 //idd=test(),
                                 id = a.Id,
                                 productcode = a.ProductCode,
                                 productname = a.ProductName,
                                 //unit = d1 != null ? d1.ValueSet : "Không xác định",
                                 //productgroup = b != null ? b.Name : "Không xác định",
                                 //producttype = c != null ? c.Name : "Không xác định",
                                 unit = d1 != null ? d1.ValueSet : "",
                                 productgroup = b != null ? b.Name : "",
                                 producttype = c != null ? c.Name : "",
                                 pathimg = a.Image,
                                 material = a.Material,
                                 pattern = a.Pattern,
                                 note = a.Note,
                                 sQrCode = /*a.QrCode*/a.ProductCode,
                                 supplier = a.Supplier,
                                 brand = a.Brand,
                                 sBarCode = a.Barcode,
                                 serial = a.Serial,
                                 jsonStatus = a.JsonStatus,
                                 mpStatus = a.MpStatuses != null ? a.MpStatuses.LastOrDefault() : null,
                                 mappingCode = f != null ? f.MappingCode : ""
                             }).ToList().DistinctBy(x => x.id);
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                foreach (var item in data1)
                {
                    //item.sQrCode = CommonUtil.GenerateQRCode(item.sQrCode);
                    item.sBarCode = CommonUtil.GenerateBarCode(item.sBarCode);
                    item.cusName = item.mpStatus != null ?
                        _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == item.mpStatus.CusCode)?.CusName : "";
                    item.supName = item.mpStatus != null ?
                        _context.Suppliers.FirstOrDefault(x => !x.IsDeleted && x.SupCode == item.mpStatus.SupCode)?.SupName : "";
                }
                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "productcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "supplier", "brand", "sBarCode", "serial", "jsonStatus", "mappingCode", "cusName", "supName");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "id", "productcode", "productname", "unit", "pathimg", "material", "pattern", "note", "productgroup", "producttype", "sQrCode", "supplier", "brand", "sBarCode", "serial", "jsonStatus", "mappingCode", "cusName", "supName");

                return Json(jdata);
            }
        }
        [HttpPost]
        public object JTableQr([FromBody] JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });

                var query = (from a in _context.MaterialProducts.AsNoTracking()
                             join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                             from b in b1.DefaultIfEmpty()
                             join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                             from c in c1.DefaultIfEmpty()
                             join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                             from d1 in d2.DefaultIfEmpty()
                             where !a.IsDeleted
                                 && (string.IsNullOrEmpty(jTablePara.Code) || (a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()) || a.ProductName.ToLower().Contains(jTablePara.Code.ToLower())))
                                 && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                 && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                 && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                               && (string.IsNullOrEmpty(jTablePara.Group) || (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                               && (jTablePara.ListGroup == null || jTablePara.ListGroup.Length == 0 || (jTablePara.ListGroup.Length != 0 && jTablePara.ListGroup.Any(x => x == a.GroupCode)))
                                 && (string.IsNullOrEmpty(jTablePara.Type) || (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                 && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                 && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                             select new ProductQrCodeRes
                             {
                                 //idd=test(),
                                 Id = a.Id,
                                 Code = a.ProductCode,
                                 QrCode = a.ProductCode,
                                 ProductName = a.ProductName,
                                 //unit = d1 != null ? d1.ValueSet : "Không xác định",
                                 //productgroup = b != null ? b.Name : "Không xác định",
                                 //producttype = c != null ? c.Name : "Không xác định",
                                 Count = 0,
                                 CreatedBy = a.CreatedBy,
                                 CreatedTime = a.CreatedTime,
                             }).ToList().DistinctBy(x => x.Id);
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                foreach (var item in data1)
                {
                    item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
                }
                //foreach (var item in data1)
                //{
                //    //item.sQrCode = CommonUtil.GenerateQRCode(item.sQrCode);
                //    item.sBarCode = CommonUtil.GenerateBarCode(item.sBarCode);
                //}
                var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "Code", "QrCode", "QR_Code", "Count", "CreatedBy", "CreatedTime", "ProductName");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "Code", "QrCode", "QR_Code", "Count", "CreatedBy", "CreatedTime", "ProductName");

                return Json(jdata);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcelQr([FromBody] JTableModelCustom jTablePara)
        {
            var msg = new JMessage();
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listData = (from a in _context.MaterialProducts.AsNoTracking()
                            join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                            from c in c1.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                            from d1 in d2.DefaultIfEmpty()
                            where !a.IsDeleted
                                && (string.IsNullOrEmpty(jTablePara.Code) || (a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()) || a.ProductName.ToLower().Contains(jTablePara.Code.ToLower())))
                                && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                              && (string.IsNullOrEmpty(jTablePara.Group) || (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                              && (jTablePara.ListGroup == null || jTablePara.ListGroup.Length == 0 || (jTablePara.ListGroup.Length != 0 && jTablePara.ListGroup.Any(x => x == a.GroupCode)))
                                && (string.IsNullOrEmpty(jTablePara.Type) || (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                            orderby a.Id descending
                            select new ProductQrCodeRes
                            {
                                //idd=test(),
                                Id = a.Id,
                                Code = a.ProductCode,
                                QrCode = a.ProductCode,
                                ProductName = a.ProductName,
                                //unit = d1 != null ? d1.ValueSet : "Không xác định",
                                //productgroup = b != null ? b.Name : "Không xác định",
                                //producttype = c != null ? c.Name : "Không xác định",
                                Count = 0,
                                CreatedBy = a.CreatedBy,
                                CreatedTime = a.CreatedTime,
                            }).ToList();
            var filePath = "/files/Template/temp-material-product.xlsx";

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
                var countAdd = listData.Count;
                if (countAdd > 0)
                    sheetRequest.InsertRow(4, countAdd);
                var row = 3;

                var countAddComponent = listData.Count;
                if (countAddComponent > 0)
                    sheetRequest.InsertRow(row, countAddComponent);

                sheetRequest.Range["C1"].Value2 = "Tên sp";
                var id = 1;
                for (int j = 0; j < listData.Count; j++)
                {
                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                    sheetRequest.Range["A" + row].Value2 = id;
                    sheetRequest.Range["B" + row].Value2 = listData[j].Code;
                    sheetRequest.Range["C" + row].Value2 = $"{listData[j].ProductName} [ {listData[j].Id} ]";
                    //sheetRequest.Range["D" + row].Value2 = listData[j].Unit;
                    //sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                    //sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                    sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                    row++;
                    id++;
                }
                workbook.SetSeparators('.', '.');

                var fileName = "DanhSachQRDanhMucSP-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
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
        //--------------------------------nhân bản---------------------------   
        [HttpPost]
        public async Task<JMessage> CloneMultiple(string productCode, int number = 100)
        {
            var msg = new JMessage();
            try
            {
                var digits = new[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
                var startCode = productCode.TrimEnd(digits);
                var listNumberString = _context.MaterialProducts.Where(x => !x.IsDeleted && x.ProductCode.StartsWith(startCode))
                    .ToList().Select(x => GetNumberInEndOfString(x.ProductCode));
                var listNumber = listNumberString.Select(delegate (string input)
                {
                    if (string.IsNullOrEmpty(input))
                    {
                        return -1;
                    }
                    else
                    {
                        return int.Parse(input);
                    }
                });
                var maxNumber = listNumber.Max() != -1 ? listNumber.Max() : 0;
                var listClone = Enumerable.Range(maxNumber + 1, number);

                var obj = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == productCode);
                var model = new MaterialProduct();
                model.ProductName = obj.ProductName;
                model.GroupCode = obj.GroupCode;
                model.Unit = obj.Unit;
                model.Note = obj.Note;
                model.Image = obj.Image;
                model.Material = obj.Material;
                model.Pattern = obj.Pattern;
                model.Wide = obj.Wide;
                model.High = obj.High;
                model.Long = obj.Long;
                model.Weight = obj.Weight;
                model.UnitWeight = obj.UnitWeight;
                model.Inheritance = obj.Inheritance;
                model.Status = obj.Status;
                model.TypeCode = obj.TypeCode;
                model.Description = obj.Description;
                model.PricePerM = obj.PricePerM;
                model.PricePerM2 = obj.PricePerM2;
                model.ForecastInStock = obj.ForecastInStock;
                model.Label = obj.Label;
                model.ImpType = obj.ImpType;
                model.Packing = obj.Packing;
                model.Json = obj.Json;
                model.Brand = obj.Brand;
                model.Supplier = obj.Supplier;

                foreach (var item in listClone)
                {
                    model.ProductCode = startCode + item.ToString("000000");
                    await Insert(model);
                }
                msg.Title = "Nhân bản thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return msg;
            //data.MaxNumber = maxNumber;
        }

        private string GetNumberInEndOfString(string input)
        {
            return string.Concat(input.ToArray().Reverse().TakeWhile(char.IsNumber).Reverse());
        }

        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public async Task<JMessage> Insert([FromBody] MaterialProduct obj)
        {
            var msg = new JMessage();
            try
            {
                var check = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && !x.IsDeleted);
                if (check == null)
                {
                    DateTime? foreCastTime = !string.IsNullOrEmpty(obj.sForeCastTime) ? DateTime.ParseExact(obj.sForeCastTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    MaterialProduct model = new MaterialProduct();

                    if (!string.IsNullOrEmpty(obj.GroupCode))
                    {
                        switch (obj.GroupCode)
                        {
                            case "REM":
                                model.PriceCostCatelogue = obj.PricePerM;
                                break;
                            case "THAM":
                                model.PriceCostCatelogue = obj.PricePerM2;
                                break;
                            case "SAN":
                                model.PriceCostCatelogue = obj.PricePerM2;
                                break;
                        }
                    }
                    model.QrCode = obj.ProductCode + "_" + obj.ProductName + "_" + obj.GroupCode + "_" + obj.TypeCode;
                    model.Barcode = obj.ProductCode;
                    model.ProductCode = obj.ProductCode;
                    model.ProductName = obj.ProductName;
                    model.GroupCode = obj.GroupCode;
                    model.Unit = obj.Unit;
                    model.Note = obj.Note;
                    model.Image = obj.Image;
                    //model.ProductGroup = null;
                    model.CreatedBy = ESEIM.AppContext.UserName;
                    model.CreatedTime = DateTime.Now.Date;
                    model.IsDeleted = false;

                    model.Material = obj.Material;
                    model.Pattern = obj.Pattern;
                    model.Wide = obj.Wide;
                    model.High = obj.High;
                    model.Long = obj.Long;
                    model.Weight = obj.Weight;
                    model.UnitWeight = obj.UnitWeight;
                    model.Inheritance = obj.Inheritance;
                    model.Status = obj.Status;
                    model.TypeCode = obj.TypeCode;
                    model.Description = obj.Description;
                    model.PricePerM = obj.PricePerM;
                    model.PricePerM2 = obj.PricePerM2;
                    model.InStock = 0;
                    model.ForecastInStock = obj.ForecastInStock;
                    model.ForecastTime = foreCastTime;
                    model.Label = obj.Label;
                    model.ImpType = obj.ImpType;
                    model.Packing = obj.Packing;
                    model.Json = obj.Json;
                    model.Serial = obj.Serial;
                    model.Brand = obj.Brand;
                    model.Supplier = obj.Supplier;
                    model.DeletionToken = "NA";
                    model.MpStatuses = new List<MpStatus>();

                    _context.MaterialProducts.Add(model);

                    //New Unit from pack
                    UnitFromPack(obj.Json);

                    await _context.SaveChangesAsync();

                    msg.Error = false;
                    msg.Object = model;
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["MLP_MSG_PRODUCT"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Sản phẩm đã tồn tại, không thể thêm";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["MLP_CURD_LBL_PRODUCT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return msg;
        }

        [HttpPost]
        public object Update([FromBody] MaterialProduct obj)
        {
            var msg = new JMessage();
            try
            {
                var product = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (product != null)
                {
                    DateTime? foreCastTime = !string.IsNullOrEmpty(obj.sForeCastTime) ? DateTime.ParseExact(obj.sForeCastTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;


                    if (!string.IsNullOrEmpty(obj.GroupCode))
                    {
                        switch (obj.GroupCode)
                        {
                            case "REM":
                                product.PriceCostCatelogue = obj.PricePerM;
                                break;
                            case "THAM":
                                product.PriceCostCatelogue = obj.PricePerM2;
                                break;
                            case "SAN":
                                product.PriceCostCatelogue = obj.PricePerM2;
                                break;
                        }
                    }

                    product.ProductName = obj.ProductName;
                    product.GroupCode = obj.GroupCode;
                    product.Unit = obj.Unit;
                    product.Note = obj.Note;
                    product.Image = obj.Image;
                    product.UpdatedBy = ESEIM.AppContext.UserName;
                    product.UpdatedTime = DateTime.Now;
                    product.QrCode = obj.QrCode;
                    product.Barcode = obj.Barcode;
                    product.Material = obj.Material;
                    product.Pattern = obj.Pattern;
                    product.Wide = obj.Wide;
                    product.High = obj.High;
                    product.Long = obj.Long;
                    product.Weight = obj.Weight;
                    product.UnitWeight = obj.UnitWeight;
                    product.Inheritance = obj.Inheritance;
                    product.TypeCode = obj.TypeCode;
                    product.Status = obj.Status;
                    product.Description = obj.Description;
                    product.PricePerM = obj.PricePerM;
                    product.PricePerM2 = obj.PricePerM2;
                    product.ForecastTime = foreCastTime;
                    product.ForecastInStock = obj.ForecastInStock;
                    product.Label = obj.Label;
                    product.ImpType = obj.ImpType;
                    product.Packing = obj.Packing;
                    product.Json = obj.Json;
                    product.Serial = obj.Serial;

                    product.Brand = obj.Brand;
                    product.Supplier = obj.Supplier;
                    _context.MaterialProducts.Update(product);

                    //New Unit from pack
                    UnitFromPack(obj.Json);

                    var list = _context.SubProducts.Where(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false).ToList();
                    foreach (var item in list)
                    {
                        item.Unit = product.Unit;
                        item.ImpType = product.ImpType;
                    }
                    _context.SubProducts.UpdateRange(list);
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Cập nhật thành công";
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Sản phẩm không tồn tại hoặc đã bị xóa, vui lòng kiểm tra lại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["MLP_CURD_LBL_PRODUCT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["MLP_MSG_PRODUCT"]);
            }

            return msg;
        }

        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.MaterialProducts.FirstOrDefault(x => x.Id == Id && x.IsDeleted != true);
                if (data != null)
                {
                    //Check đối với bản thân sản phẩm - sản phẩm hoàn thiện
                    var chkUsingLotProduct = _context.LotProductDetails.Any(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT" && x.ProductCode == data.ProductCode);
                    if (chkUsingLotProduct)
                    {
                        msg.Error = true;
                        //msg.Title = "Không thể xóa sản phẩm đã được đưa vào lô.";
                        msg.Title = String.Format(_stringLocalizer["MLP_MSG_ERR_DELETE_CATEGORY"]);

                        return Json(msg);
                    }
                    var chkUsingImp = _context.ProdReceivedDetails.Any(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT" && x.ProductCode == data.ProductCode);
                    if (chkUsingImp)
                    {
                        msg.Error = true;
                        //msg.Title = "Không thể xóa sản phẩm đã được nhập kho.";
                        msg.Title = String.Format(_stringLocalizer["MLP_MSG_ERR_DELETE_WAREHOUSE"]);


                        return Json(msg);
                    }

                    //Check đối với sản phẩm con
                    var chkSubProductUsingLotProduct = (from a in _context.SubProducts.Where(x => !x.IsDeleted && x.ProductCode == data.ProductCode)
                                                        join b in _context.LotProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a.AttributeCode equals b.ProductCode
                                                        select b)
                                                       .Any();
                    if (chkSubProductUsingLotProduct)
                    {
                        msg.Error = true;
                        //msg.Title = "Không thể xóa danh mục sản phẩm có sản phẩm con đã được đưa vào lô.";
                        msg.Title = String.Format(_stringLocalizer["MLP_MSG_ERR_DELETE_CATEGORY"]);

                        return Json(msg);
                    }
                    var chkSubProductUsingImp = (from a in _context.SubProducts.Where(x => !x.IsDeleted && x.ProductCode == data.ProductCode)
                                                 join b in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a.AttributeCode equals b.ProductCode
                                                 select b)
                                                       .Any();
                    if (chkSubProductUsingImp)
                    {
                        msg.Error = true;
                        //msg.Title = "Không thể xóa danh mục sản phẩm có sản phẩm con đã được nhập kho.";
                        msg.Title = String.Format(_stringLocalizer["MLP_MSG_ERR_DELETE_WAREHOUSE"]);


                        return Json(msg);
                    }

                    var listSub = _context.SubProducts.Where(x => !x.IsDeleted && x.ProductCode == data.ProductCode).ToList();
                    listSub.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now; });
                    _context.SubProducts.UpdateRange(listSub);

                    //data.IsDeleted = true;
                    //data.DeletedBy = ESEIM.AppContext.UserName;
                    //data.DeletedTime = DateTime.Now;
                    //data.DeletionToken = Guid.NewGuid().ToString();

                    //_context.MaterialProducts.Update(data);
                    _context.MaterialProducts.Remove(data);

                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["MLP_MSG_PRODUCT"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy sản phẩm. Vui lòng làm mới lại trang.";
                    msg.Title = String.Format(_sharedResources["COM_MSG_REFRESH"]);

                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["MLP_MSG_PRODUCT"]);
                return Json(msg);
            }
        }

        public object GetItemDetail(int id)
        {
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            //ProductCat query=new ProductCat();
            var query = from ad in _context.MaterialProducts

                        join b in listCommon on ad.Unit equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in listCommon on ad.GroupCode equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where ad.Id == id
                        select new
                        {
                            ProductCode = ad.ProductCode,
                            ProductName = ad.ProductName,
                            PathImg = ad.Image,
                            Note = ad.Note,
                            Unit = b != null ? b.ValueSet : _sharedResources["COM_MSG_NO _UNKNOWN"],
                            ProductGroup = c != null ? c.ValueSet : _sharedResources["COM_MSG_NO _UNKNOWN"],
                        };
            return Json(query);
        }
        [HttpPost]
        public object GetItem(int id)
        {
            try
            {
                var data = _context.MaterialProducts.AsNoTracking().FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    if (data.ForecastTime.HasValue)
                    {
                        data.sForeCastTime = data.ForecastTime?.ToString("dd/MM/yyyy");
                    }
                    return Json(data);
                }
            }
            catch (Exception exx)
            {
                // ignored
            }

            return null;
        }

        ////Slide cho SOS - nhiều ảnh
        //[HttpPost]
        //public JsonResult getSosInfo(int id)
        //{
        //    JMessage msg = new JMessage();
        //    try
        //    {
        //        var sosInfoHeader = _context.SOSInfos.FirstOrDefault(x => x.Id == id);
        //        if (sosInfoHeader != null)
        //        {
        //            var listImg = _context.SOSMedias.Where(x => x.SosCode == sosInfoHeader.Code).ToList();
        //            msg.Error = false;
        //            var obj = new
        //            {
        //                header = sosInfoHeader,
        //                imgList = listImg
        //            };
        //            msg.Object = obj;
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Không tìm thấy thông tin, vui lòng làm mới trang";
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public object GetListBrand()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PRODUCT_BRAND").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetProductUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetProductImpType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.ProductImpType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        public object GetProductStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.CatStatus))
                .OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpGet]
        public object GetUnitWeight()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "UNIT_WEIGHT_PROD")
                .OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetProductCatelogue()
        {
            //var query = _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode.Equals("SUB_PRODUCT"))
            //                                     .Select(x => new { Code = x.ProductCode, Name = x.ProductName }).ToList();

            //Sửa theo a Hiệp bảo
            var query = _context.MaterialProducts.Where(x => !x.IsDeleted && !x.TypeCode.Equals("SUB_PRODUCT"))
                                                 .Select(x => new { Code = x.ProductCode, Name = x.ProductName }).ToList();
            return query;
        }

        [HttpPost]
        public object GetProductGroup()
        {

            var query = _context.MaterialProductGroups.AsParallel().Select(x => new { x.Code, x.Name });
            return query;
        }

        [HttpPost]
        public object GetInheritances(string productCode)
        {
            var data = (from a in _context.MaterialProducts
                        where a.IsDeleted == false
                        && a.ProductCode != productCode
                        select new
                        {
                            Code = a.ProductCode,
                            Name = a.ProductName
                        }).ToList();
            return data;
        }

        public object GetInheritancesDetail(string productCode)
        {
            var data = (from a in _context.MaterialProducts.Where(x => !x.IsDeleted)
                        join b in _context.ProductAttributes.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.ProductCode == productCode
                        select new
                        {
                            Inheritance = productCode,
                            a.Accessory,
                            a.Description,
                            a.GroupCode,
                            a.Material,
                            a.Pattern,
                            a.Wide,
                            a.High,
                            a.TypeCode,
                            a.Unit,
                            a.Note,
                            ListProductAttribute = b2
                        }).ToList();
            return data;
        }

        [HttpPost]
        public object getProductCategoryTypes()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "PRODUCT_CATEGORY_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetProductTypes()
        {
            var query = _context.MaterialTypes.Where(x => x.IsDeleted == false).AsParallel().Select(x => new { x.Code, x.Name });
            return query;
        }

        [HttpPost]
        public JsonResult InsertProductAttribute([FromBody] SubProduct obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = _context.SubProducts.FirstOrDefault(x => x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
                    if (data != null)
                    {
                        msg.Error = true;
                        //msg.Title = "Đã tồn tại Mã SP con";
                        msg.Title = String.Format(_stringLocalizer["MLP_MSG_EXISTED"]);

                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(obj.Type))
                        {
                            switch (obj.Type)
                            {
                                case "REM":
                                    obj.PriceCostCatelogue = obj.PricePerM;
                                    break;
                                case "THAM":
                                    obj.PriceCostCatelogue = obj.PricePerM2;
                                    break;
                                case "SAN":
                                    obj.PriceCostCatelogue = obj.PricePerM2;
                                    break;
                            }
                        }

                        obj.CreatedTime = DateTime.Now;
                        obj.ProductQrCode = obj.ProductCode + "_" + obj.AttributeCode;
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.IsDeleted = false;
                        obj.Unit = parent.Unit;
                        obj.InStock = 0;
                        _context.SubProducts.Add(obj);
                        _context.SaveChanges();
                        msg.Error = false;
                        //msg.Title = "Thêm thành công";
                        msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
                    }
                }
                else
                {
                    msg.Error = false;
                    //msg.Title = "Danh mục sản phẩm không tồn tại, vui lòng làm mới trang";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _sharedResources["COM_MSG_LIST_PRODUCT"]);

                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm";
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);

            }
            return Json(msg);
        }
        [HttpPost]
        public object JTableExtend([FromBody] JtableExtendModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.SubProducts
                        where a.ProductCode == jTablePara.ProductCode
                        && (string.IsNullOrEmpty(jTablePara.AttributeCode) || (a.AttributeCode.ToLower().Contains(jTablePara.AttributeCode.ToLower()) || a.AttributeName.ToLower().Contains(jTablePara.AttributeCode.ToLower())))
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttributeCode,
                            a.AttributeName,
                            a.Value,
                            a.Note,
                            a.CreatedTime,
                            a.Unit,
                            a.Type,
                            a.PriceCostCatelogue,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "AttributeCode", "AttributeName", "PriceCostCatelogue", "Value", "Note", "CreatedTime", "Unit", "Type");

            return Json(jdata);
        }
        [HttpPost]
        public object DeleteAttribute(int Id)
        {
            JMessage msg = new JMessage();
            var data = _context.SubProducts.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
            if (data != null)
            {
                data.IsDeleted = true;
                _context.SubProducts.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = "Xóa thành công";
                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"]);

            }
            else
            {
                msg.Error = true;
                //msg.Title = "Thuộc tính không tồn tại hoặc đã bị xóa";
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _sharedResources["COM_BTN_PROPERTIES"]);

            }
            return Json(msg);
        }
        [HttpPost]
        public object UpdateAttribute([FromBody] SubProduct obj)
        {
            JMessage msg = new JMessage();
            var data = _context.SubProducts.FirstOrDefault(x => x.Id == obj.Id && x.IsDeleted == false);
            if (data != null)
            {
                DateTime? foreCastTime = !string.IsNullOrEmpty(obj.sForeCastTime) ? DateTime.ParseExact(obj.sForeCastTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (!string.IsNullOrEmpty(obj.Type))
                {
                    switch (obj.Type)
                    {
                        case "REM":
                            data.PriceCostCatelogue = obj.PricePerM;
                            break;
                        case "THAM":
                            data.PriceCostCatelogue = obj.PricePerM2;
                            break;
                        case "SAN":
                            data.PriceCostCatelogue = obj.PricePerM2;
                            break;
                    }
                }
                data.Image = obj.Image;
                data.AttributeName = obj.AttributeName;
                data.Value = obj.Value;
                data.Note = obj.Note;
                data.Group = obj.Group;
                data.Unit = obj.Unit;
                data.ForecastInStock = obj.ForecastInStock;
                data.ForecastTime = foreCastTime;
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.PricePerM = obj.PricePerM;
                data.PricePerM2 = obj.PricePerM2;
                _context.SubProducts.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = "Cập nhật thành công";
                msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);

            }
            else
            {
                msg.Error = true;
                //msg.Title = "Thuộc tính không tồn tại hoặc đã bị xóa";
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _sharedResources["COM_BTN_PROPERTIES"]);

            }
            return Json(msg);
        }
        [HttpPost]
        public object GetAttributeItem(int id)
        {
            JMessage msg = new JMessage();
            var data = _context.SubProducts.FirstOrDefault(x => x.Id == id && x.IsDeleted == false);
            data.sForeCastTime = data.ForecastTime != null ? data.ForecastTime.Value.ToString("dd/MM/yyyy") : null;
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                //msg.Title = "Thuộc tính không tồn tại hoặc đã bị xóa";
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _sharedResources["COM_BTN_PROPERTIES"]);

            }
            return Json(msg);
        }
        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["MLP_MSG_UPLOAD_FILE"]);
            }
            return Json(msg);
        }

        [NonAction]
        public void UnitFromPack(string json)
        {
            try
            {
                var data = JsonConvert.DeserializeObject<JsonPackValue>(json);
                if (data != null)
                {
                    var units = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    if (!string.IsNullOrEmpty(data.A.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.A.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.A.Key);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.B.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.B.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.B.Key);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.C.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.C.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.C.Key);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.D.Key))
                    {
                        var check = units.Any(x => x.Name.ToLower().Equals(data.D.Key.ToLower()));
                        if (!check)
                        {
                            InsertUnit(data.D.Key);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        [NonAction]
        public void InsertUnit(string value)
        {
            var unit = new CommonSetting
            {
                CodeSet = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit) + DateTime.Now.ToString("yyyyMMddHHmmss"),
                ValueSet = value,
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                Group = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)
            };
            _context.CommonSettings.Add(unit);
        }
        private class PackValue
        {
            public string Key { get; set; }
            public string Value { get; set; }
        }
        private class JsonPackValue
        {
            public PackValue A { get; set; }
            public PackValue B { get; set; }
            public PackValue C { get; set; }
            public PackValue D { get; set; }
        }

        #endregion

        #region Import excel
        [HttpPost]
        public JsonResult UploadCatalogue(IFormFile fileUpload, string Catalogue, string groupCode)
        {
            JMessage2 msg = new JMessage2() { Error = false };
            try
            {
                List<ReadProductAttributeExcelImp> listTotal = new List<ReadProductAttributeExcelImp>();
                if (groupCode == "GIAY_DAN_TUONG")
                {
                    msg = GetListFine1000(fileUpload, Catalogue);
                }
                else if (groupCode == "REM")
                {
                    msg = GetListSimpleOrder(fileUpload, Catalogue);
                }
                else if (groupCode == "SAN")
                {
                    msg = GetListSfloor(fileUpload, Catalogue);
                }
                else if (groupCode == "THAM")
                {
                    msg = GetListCarpet(fileUpload, Catalogue);
                }

                msg.Object = listTotal;
            }
            catch (Exception ex)
            {
                msg.Title = ex.ToString();
            }
            return Json(msg);
        }
        public List<ReadProductAttributeExcelImp> CheckUpdateOrInsert(List<ReadProductAttributeExcelImp> list)
        {
            var data = from a in list
                       join b in _context.SubProducts.Where(x => x.IsDeleted == false) on new { a.ProductCode, a.AttributeCode } equals new { b.ProductCode, b.AttributeCode }
                       into b2
                       from b in b2.DefaultIfEmpty()
                       select new ReadProductAttributeExcelImp
                       {
                           Code1 = a.Code1,
                           Code2 = a.Code2,
                           Code3 = a.Code3,
                           Code4 = a.Code4,
                           ProductCode = a.ProductCode,
                           AttributeCode = a.AttributeCode,
                           Page = a.Page,
                           Category = a.Category,
                           Width = a.Width,
                           Length = a.Length,
                           Weight = a.Weight,
                           VerticalStroke = a.VerticalStroke,
                           HorizontalStroke = a.HorizontalStroke,
                           Note = a.Note,
                           ESekou = a.ESekou,
                           Sx2021 = a.Sx2021,
                           AntiMold = a.AntiMold,
                           AntiFouling = a.AntiFouling,
                           AntiBacteria = a.AntiBacteria,
                           Deodorant = a.Deodorant,
                           HumidityControl = a.HumidityControl,
                           HardPaperSurface = a.HardPaperSurface,
                           FireSpread = a.FireSpread,
                           Status = (b == null ? "NEW" : "UPDATE"),

                           Inheritance = a.Inheritance,
                           PricePerM2 = a.PricePerM2,
                           PricePerM = a.PricePerM,
                           Unit = a.Unit,
                           AntiScatter = a.AntiScatter,
                           UVProtection = a.UVProtection,
                           InsectRepellent = a.InsectRepellent,
                           BrigthnessControl = a.BrigthnessControl,
                           HeatReflection = a.HeatReflection,
                           OutsideInstallation = a.OutsideInstallation,
                           StrongCoated = a.StrongCoated,
                           LowReflection = a.LowReflection,
                           Material = a.Material,
                           Origin = a.Origin,

                           Deep = a.Deep,
                           ChemicalResistance = a.ChemicalResistance,
                           Antistatic = a.Antistatic,
                           Wax = a.Wax,
                           OutSide = a.OutSide,
                           AntiShock = a.AntiShock,
                           ObjectMoving = a.ObjectMoving,

                           CountPerBox = a.CountPerBox,
                           M2PerBox = a.M2PerBox,
                           TotalDeep = a.TotalDeep,
                           Structure = a.Structure,
                           TextileType = a.TextileType,
                           Gauge = a.Gauge,
                           GaugeUnit = a.GaugeUnit,
                           Sticth = a.Sticth,
                           SticthUnit = a.SticthUnit,
                           Formaldehyde = a.Formaldehyde,
                           Friendly = a.Friendly,
                           ECO_MARK = a.ECO_MARK,
                           JIS = a.JIS,
                           CRI = a.CRI,
                           TravelDensity = a.TravelDensity
                       };
            var list1 = data.ToList();
            return list1;
        }
        //Read data from excel
        private JMessage2 GetListFine1000(IFormFile fileUpload, string productCode)
        {
            JMessage2 msg = new JMessage2() { Error = false };
            var list = new List<ReadProductAttributeExcelImp>();
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
                                string.IsNullOrEmpty(title[0].DisplayText.Trim()) &&
                                string.IsNullOrEmpty(title[1].DisplayText.Trim()) &&
                                string.IsNullOrEmpty(title[2].DisplayText.Trim()) &&
                                string.IsNullOrEmpty(title[3].DisplayText.Trim()) &&
                                title[4].DisplayText.Trim() == "Trang" &&
                                title[5].DisplayText.Trim() == "Category" &&
                                title[6].DisplayText.Trim() == "Chiều rộng (cm)" &&
                                string.IsNullOrEmpty(title[7].DisplayText.Trim()) &&
                                title[8].DisplayText.Trim().Contains("Chiều dài") &&
                                title[9].DisplayText.Trim() == "Trọng lượng / m (kg)" &&
                                title[10].DisplayText.Trim() == "Vân dọc (cm)" &&
                                title[11].DisplayText.Trim() == "Vân ngang (cm)" &&
                                title[12].DisplayText.Trim() == "Ghi chú" &&
                                title[13].DisplayText.Trim() == "E-Sekou (Giấy có độ dầy cao hơn thông thường)" &&
                                title[14].DisplayText.Trim() == "Tiếp tục sản xuất tới năm 2021" &&
                                title[15].DisplayText.Trim() == "Chống nấm mốc" &&
                                title[16].DisplayText.Trim() == "Chống bám bẩn - dễ lau chùi" &&
                                title[17].DisplayText.Trim() == "Chống vi khuẩn" &&
                                title[18].DisplayText.Trim() == "Khử mùi" &&
                                title[19].DisplayText.Trim() == "Kiểm soát độ ẩm" &&
                                title[20].DisplayText.Trim() == "Bề mặt giấy cứng" &&
                                title[21].DisplayText.Trim() == "Chống cháy lan"
                            )
                        {
                            var length = worksheet.Rows.Length;
                            var Code1 = ""; //Cột B file Excel
                            var Code2 = "";//Cột C file Excel
                            var Code3 = "";//Cột D file Excel
                            var Page = "";//Cột E file Excel
                            var Category = "";//Cột F file Excel
                            var Width = "";//Cột G file Excel
                            var Length = "";//Cột I file Excel
                            var Weight = "";
                            var VerticalStroke = "";//Cột K file Excel
                            var HorizontalStroke = "";//Cột L file Excel
                            var Note = "";//Cột L file Excel
                            var ESekou = "";
                            var Sx2021 = "";
                            var AntiMold = "";
                            var AntiFouling = "";
                            var AntiBacteria = "";
                            var Deodorant = "";
                            var HumidityControl = "";
                            var HardPaperSurface = "";
                            var FireSpread = "";

                            for (int i = 4; i <= length; i++)
                            {
                                var isHide = worksheet.IsRowVisible(i);
                                if (isHide == true)
                                {
                                    Code1 = worksheet.GetValueRowCol(i, 2).ToString().Trim();//Cột B file Excel
                                    Code2 = worksheet.GetValueRowCol(i, 3).ToString().Trim();//Cột C file Excel
                                    Code3 = worksheet.GetValueRowCol(i, 4).ToString().Trim();//Cột D file Excel
                                    Page = worksheet.GetValueRowCol(i, 5).ToString().Trim();//Cột E file Excel
                                    Category = worksheet.GetValueRowCol(i, 6).ToString().Trim();//Cột F file Excel
                                    Width = worksheet.GetValueRowCol(i, 7).ToString().Trim();//Cột G file Excel
                                    Length = worksheet.GetValueRowCol(i, 9).ToString().Trim();//Cột I file Excel
                                    Weight = worksheet.GetValueRowCol(i, 10).ToString().Trim();
                                    VerticalStroke = worksheet.GetValueRowCol(i, 11).ToString().Trim();//Cột K file Excel
                                    HorizontalStroke = worksheet.GetValueRowCol(i, 12).ToString().Trim();//Cột L file Excel
                                    Note = worksheet.GetValueRowCol(i, 13).ToString().Trim();//Cột L file Excel
                                    ESekou = worksheet.GetValueRowCol(i, 14).ToString().Trim();
                                    Sx2021 = worksheet.GetValueRowCol(i, 15).ToString().Trim();
                                    AntiMold = worksheet.GetValueRowCol(i, 16).ToString().Trim();
                                    AntiFouling = worksheet.GetValueRowCol(i, 17).ToString().Trim();
                                    AntiBacteria = worksheet.GetValueRowCol(i, 18).ToString().Trim();
                                    Deodorant = worksheet.GetValueRowCol(i, 19).ToString().Trim();
                                    HumidityControl = worksheet.GetValueRowCol(i, 20).ToString().Trim();
                                    HardPaperSurface = worksheet.GetValueRowCol(i, 21).ToString().Trim();
                                    FireSpread = worksheet.GetValueRowCol(i, 22).ToString().Trim();

                                    ReadProductAttributeExcelImp excelImp = new ReadProductAttributeExcelImp();
                                    excelImp.ProductCode = productCode;
                                    if (string.IsNullOrEmpty(Code3))
                                        excelImp.AttributeCode = Code1 + Code2;
                                    else
                                        excelImp.AttributeCode = Code1 + Code2 + "." + Code3;
                                    excelImp.Code1 = Code1;
                                    excelImp.Code2 = Code2;
                                    excelImp.Code3 = Code3;
                                    excelImp.Page = Page;
                                    excelImp.Category = Category;
                                    excelImp.Width = Width;
                                    excelImp.Length = Length;
                                    excelImp.Weight = Weight;
                                    excelImp.VerticalStroke = VerticalStroke;
                                    excelImp.HorizontalStroke = HorizontalStroke;
                                    excelImp.Note = Note;
                                    excelImp.ESekou = ESekou;
                                    excelImp.Sx2021 = Sx2021;
                                    excelImp.AntiMold = AntiMold;
                                    excelImp.AntiFouling = AntiFouling;
                                    excelImp.AntiBacteria = AntiBacteria;
                                    excelImp.Deodorant = Deodorant;
                                    excelImp.HumidityControl = HumidityControl;
                                    excelImp.HardPaperSurface = HardPaperSurface;
                                    excelImp.FireSpread = FireSpread;
                                    list.Add(excelImp);
                                }
                            }
                            list = updateNull(list);
                        }
                        else
                        {
                            msg.Error = true;
                            //msg.Title = "Sai định dạng tệp excel";
                            msg.Title = String.Format(_sharedResources["COM_MSG_FORMAT_EXCEL"]);

                        }
                    }
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi tải tệp";
                msg.Title = String.Format(_sharedResources["COM_MSG_FILE_FAIL"]);

            }
            if (msg.Error == false)
            {
                list = CheckUpdateOrInsert(list);
                msg.list = list;
            }
            return msg;
        }
        private JMessage2 GetListSimpleOrder(IFormFile fileUpload, string productCode)
        {
            JMessage2 msg = new JMessage2() { Error = false };
            var list = new List<ReadProductAttributeExcelImp>();
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
                        var title = worksheet.Rows[0].Cells;
                        if (
                                title[0].DisplayText.Trim() == "Mã sản phẩm" &&
                                title[2].DisplayText.Trim() == "Trang" &&
                                title[3].DisplayText.Trim() == "MLP" &&
                                title[4].DisplayText.Trim() == "Giá CATALOGUE (JPY/M)" &&
                                title[5].DisplayText.Trim() == "Khổ rộng (mm)" &&
                                title[6].DisplayText.Trim() == "Bước hoa dọc (mm)" &&
                                title[7].DisplayText.Trim() == "Bước hoa ngang   (mm)" &&
                                title[8].DisplayText.Trim() == "Chiều dài cuộn (M)" &&
                                title[9].DisplayText.Trim() == "Trọng lượng (g/M)" &&
                                title[10].DisplayText.Trim() == "Chất liệu" &&
                                title[11].DisplayText.Trim() == "Xuất xứ"
                            )
                        {
                            var length = worksheet.Rows.Length;
                            var Code1 = "";
                            var Code2 = "";
                            var Code3 = "";
                            var Page = "";
                            var Category = "";
                            var PriceM = "";
                            var Width = "";
                            var VerticalStroke = "";
                            var HorizontalStroke = "";
                            var Length = "";
                            var Weight = "";
                            var Material = "";
                            var Origin = "";

                            for (int i = 2; i <= length; i++)
                            {
                                var isHide = worksheet.IsRowVisible(i);
                                if (isHide == true)
                                {
                                    Code1 = worksheet.GetValueRowCol(i, 1).ToString().Trim();
                                    Code2 = worksheet.GetValueRowCol(i, 2).ToString().Trim();
                                    Page = worksheet.GetValueRowCol(i, 3).ToString().Trim();
                                    Category = worksheet.GetValueRowCol(i, 4).ToString().Trim();
                                    PriceM = worksheet.GetValueRowCol(i, 5).ToString().Trim();
                                    Width = worksheet.GetValueRowCol(i, 6).ToString().Trim();
                                    VerticalStroke = worksheet.GetValueRowCol(i, 7).ToString().Trim();
                                    HorizontalStroke = worksheet.GetValueRowCol(i, 8).ToString().Trim();
                                    Length = worksheet.GetValueRowCol(i, 9).ToString().Trim();
                                    Weight = worksheet.GetValueRowCol(i, 10).ToString().Trim();
                                    Material = worksheet.GetValueRowCol(i, 11).ToString().Trim();
                                    Origin = worksheet.GetValueRowCol(i, 12).ToString().Trim();

                                    ReadProductAttributeExcelImp excelImp = new ReadProductAttributeExcelImp();
                                    excelImp.ProductCode = productCode;
                                    if (string.IsNullOrEmpty(Code3))
                                        excelImp.AttributeCode = Code1 + Code2;
                                    else
                                        excelImp.AttributeCode = Code1 + Code2 + "." + Code3;
                                    excelImp.Code1 = Code1;
                                    excelImp.Code2 = Code2;
                                    excelImp.Code3 = Code3;
                                    excelImp.Page = Page;
                                    excelImp.Category = Category;
                                    excelImp.Width = Width;
                                    excelImp.Length = Length;
                                    excelImp.Weight = Weight;
                                    excelImp.VerticalStroke = VerticalStroke;
                                    excelImp.HorizontalStroke = HorizontalStroke;
                                    excelImp.PricePerM = PriceM;
                                    excelImp.Material = Material;
                                    excelImp.Origin = Origin;
                                    list.Add(excelImp);
                                }
                            }
                            list = updateNull(list);
                        }
                        else
                        {
                            msg.Error = true;
                            //msg.Title = "Sai định dạng tệp excel";
                            msg.Title = String.Format(_sharedResources["COM_MSG_FORMAT_EXCEL"]);

                        }
                    }
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi tải tệp";
                msg.Title = String.Format(_sharedResources["COM_MSG_FILE_FAIL"]);

            }
            if (msg.Error == false)
            {
                list = CheckUpdateOrInsert(list);
                msg.list = list;
            }
            return msg;
        }
        private JMessage2 GetListSfloor(IFormFile fileUpload, string productCode)
        {
            JMessage2 msg = new JMessage2() { Error = false };
            var list = new List<ReadProductAttributeExcelImp>();
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
                                title[0].DisplayText.Trim() == "Mã sản phẩm" &&

                                title[5].DisplayText.Trim() == "Category Name" &&
                                title[6].DisplayText.Trim() == "Giá Catalogue (Yên/m2)" &&
                                title[7].DisplayText.Trim().Contains("(Yên / m dài, tấm, thùng, hộp)") &&
                                title[8].DisplayText.Trim() == "Đơn vị" &&
                                title[9].DisplayText.Trim() == "Chiều rộng (cm)" &&
                                title[10].DisplayText.Trim() == "Tổng độ dầy (mm)" &&
                                title[11].DisplayText.Trim().Contains("(kg / m dài, tấm)") &&
                                title[12].DisplayText.Trim() == "Bước hoa dọc (cm)" &&

                                title[13].DisplayText.Trim() == "Bước hoa ngang (cm)" &&
                                title[14].DisplayText.Trim() == "Ghi chú" &&
                                title[15].DisplayText.Trim() == "Kháng khuẩn" &&
                                title[16].DisplayText.Trim() == "Kháng hóa chất" &&
                                title[17].DisplayText.Trim() == "Chống tĩnh điện" &&
                                title[18].DisplayText.Trim() == "Không cần sử dụng sáp đánh bóng" &&
                                title[19].DisplayText.Trim() == "Sử dụng ngoài trời" &&
                                title[20].DisplayText.Trim() == "Dễ dàng lau chùi vệ sinh" &&

                                title[21].DisplayText.Trim() == "Chống nấm mốc" &&
                                title[22].DisplayText.Trim() == "Chống shock khi ngã, va đập" &&
                                title[23].DisplayText.Trim() == "Chịu được các vật nặng di chuyển trên bề mặt" &&
                                title[24].DisplayText.Trim() == "Chống cháy lan"
                            )
                        {
                            var length = worksheet.Rows.Length;
                            var Code1 = "";
                            var Code2 = "";
                            var Code3 = "";
                            var Page = "";
                            var Category = "";
                            var PricePerM2 = "";
                            var PricePerM = "";
                            var Unit = "";
                            var Width = "";
                            var Deep = "";
                            var Weight = "";
                            var VerticalStroke = "";
                            var HorizontalStroke = "";
                            var Note = "";
                            var AntiBacteria = "";
                            var ChemicalResistance = "";
                            var Antistatic = "";
                            var Wax = "";
                            var OutSide = "";
                            var AntiFouling = "";
                            var AntiMold = "";
                            var AntiShock = "";
                            var ObjectMoving = "";
                            var FireSpread = "";


                            for (int i = 4; i <= length; i++)
                            {
                                var isHide = worksheet.IsRowVisible(i);
                                if (isHide == true)
                                {
                                    Code1 = worksheet.GetValueRowCol(i, 1).ToString().Trim();
                                    Code2 = worksheet.GetValueRowCol(i, 2).ToString().Trim();
                                    Code3 = worksheet.GetValueRowCol(i, 3).ToString().Trim();
                                    Page = worksheet.GetValueRowCol(i, 4).ToString().Trim();
                                    Category = worksheet.GetValueRowCol(i, 6).ToString().Trim();
                                    PricePerM2 = worksheet.GetValueRowCol(i, 7).ToString().Trim();
                                    PricePerM = worksheet.GetValueRowCol(i, 8).ToString().Trim();
                                    Unit = worksheet.GetValueRowCol(i, 9).ToString().Trim();
                                    Width = worksheet.GetValueRowCol(i, 10).ToString().Trim();
                                    Deep = worksheet.GetValueRowCol(i, 11).ToString().Trim();
                                    Weight = worksheet.GetValueRowCol(i, 12).ToString().Trim();
                                    VerticalStroke = worksheet.GetValueRowCol(i, 13).ToString().Trim();
                                    HorizontalStroke = worksheet.GetValueRowCol(i, 14).ToString().Trim();
                                    Note = worksheet.GetValueRowCol(i, 15).ToString().Trim();
                                    AntiBacteria = worksheet.GetValueRowCol(i, 16).ToString().Trim();
                                    ChemicalResistance = worksheet.GetValueRowCol(i, 17).ToString().Trim();
                                    Antistatic = worksheet.GetValueRowCol(i, 18).ToString().Trim();
                                    Wax = worksheet.GetValueRowCol(i, 19).ToString().Trim();
                                    OutSide = worksheet.GetValueRowCol(i, 20).ToString().Trim();
                                    AntiFouling = worksheet.GetValueRowCol(i, 21).ToString().Trim();
                                    AntiMold = worksheet.GetValueRowCol(i, 22).ToString().Trim();
                                    AntiShock = worksheet.GetValueRowCol(i, 23).ToString().Trim();
                                    ObjectMoving = worksheet.GetValueRowCol(i, 24).ToString().Trim();
                                    FireSpread = worksheet.GetValueRowCol(i, 25).ToString().Trim();

                                    ReadProductAttributeExcelImp excelImp = new ReadProductAttributeExcelImp();
                                    excelImp.ProductCode = productCode;
                                    if (string.IsNullOrEmpty(Code3))
                                        excelImp.AttributeCode = Code1 + Code2;
                                    else
                                        excelImp.AttributeCode = Code1 + Code2 + "." + Code3;
                                    excelImp.Code1 = Code1;
                                    excelImp.Code2 = Code2;
                                    excelImp.Code3 = Code3;
                                    excelImp.Page = Page;
                                    excelImp.Category = Category;
                                    excelImp.PricePerM2 = PricePerM2;
                                    excelImp.PricePerM = PricePerM;
                                    excelImp.Unit = Unit;

                                    excelImp.Width = Width;
                                    excelImp.Deep = Deep;
                                    excelImp.Weight = Weight;
                                    excelImp.VerticalStroke = VerticalStroke;
                                    excelImp.HorizontalStroke = HorizontalStroke;
                                    excelImp.Note = Note;
                                    excelImp.AntiBacteria = AntiBacteria;
                                    excelImp.ChemicalResistance = ChemicalResistance;
                                    excelImp.Antistatic = Antistatic;
                                    excelImp.Wax = Wax;
                                    excelImp.OutSide = OutSide;
                                    excelImp.AntiFouling = AntiFouling;
                                    excelImp.AntiMold = AntiMold;
                                    excelImp.AntiShock = AntiShock;
                                    excelImp.ObjectMoving = ObjectMoving;
                                    excelImp.FireSpread = FireSpread;


                                    list.Add(excelImp);
                                }
                            }
                            list = updateNull(list);
                        }
                        else
                        {
                            msg.Error = true;
                            //msg.Title = "Sai định dạng tệp excel";
                            msg.Title = String.Format(_sharedResources["COM_MSG_FORMAT_EXCEL"]);

                        }
                    }
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi tải tệp";
                msg.Title = String.Format(_sharedResources["COM_MSG_FILE_FAIL"]);

            }
            if (msg.Error == false)
            {
                list = CheckUpdateOrInsert(list);
                msg.list = list;
            }
            return msg;
        }
        private JMessage2 GetListCarpet(IFormFile fileUpload, string productCode)
        {
            int m = 0;
            JMessage2 msg = new JMessage2() { Error = false };
            var list = new List<ReadProductAttributeExcelImp>();
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
                                title[0].DisplayText.Trim() == "Trang" &&
                                title[1].DisplayText.Trim() == "Mã sản phẩm" &&
                                title[6].DisplayText.Trim() == "Giá Catalogue (Yên/m2)" &&
                                title[7].DisplayText.Trim() == "Giá Catalogue (Yên/m)" &&

                                title[8].DisplayText.Trim() == "Đơn vị" &&
                                title[9].DisplayText.Trim() == "ｃｍ" &&
                                title[10].DisplayText.Trim() == "×" &&
                                title[11].DisplayText.Trim() == "ｃｍ" &&
                                title[12].DisplayText.Trim() == "Số tấm/hộp" &&

                                title[13].DisplayText.Trim() == "Số m2/hộp" &&
                                title[14].DisplayText.Trim() == "Độ dầy tuyết thảm (mm)" &&
                                title[17].DisplayText.Trim().Contains("Tổng độ dầy") &&
                                title[18].DisplayText.Trim() == "Cấu tạo" &&
                                title[19].DisplayText.Trim() == "Kiểu dệt" &&

                                title[20].DisplayText.Trim() == "Gauge" &&
                                title[22].DisplayText.Trim() == "×" &&//22
                                title[23].DisplayText.Trim() == "Sticth" &&//23
                                title[25].DisplayText.Trim() == "Formaldehyde" &&//23
                                title[26].DisplayText.Trim() == "Chống cháy lan" &&
                                title[27].DisplayText.Trim() == "Chống tĩnh điện" &&

                                title[28].DisplayText.Trim() == "Sản phẩm thân thiện với môi trường" &&
                                title[29].DisplayText.Trim() == "Chứng nhận ECO MARK không làm hại môi trường" &&
                                title[30].DisplayText.Trim() == "Chứng nhận theo tiêu chuẩn JIS Nhật Bản" &&
                                title[31].DisplayText.Trim().Contains("Tiêu chuẩn xanh CRI") &&

                                title[32].DisplayText.Trim() == "Kháng khuẩn" &&
                                title[33].DisplayText.Trim().Contains("Phù hợp với mật độ đi lại")
                            )
                        {
                            var length = worksheet.Rows.Length;
                            //var Category = "";
                            var Page = "";
                            var Code1 = "";
                            var Code2 = "";
                            var Code3 = "";
                            var Code4 = "";
                            var Code5 = "";
                            var PricePerM2 = "";
                            var PricePerM = "";
                            var Unit = "";
                            var Width = "";
                            var Length = "";
                            var CountPerBox = "";
                            var M2PerBox = "";
                            var Deep = "";
                            var TotalDeep = "";
                            var Structure = "";
                            var TextileType = "";
                            var Gauge = "";
                            var GaugeUnit = "";
                            var Sticth = "";
                            var SticthUnit = "";
                            var Formaldehyde = "";
                            var FireSpread = "";
                            var Antistatic = "";
                            var Friendly = "";
                            var ECO_MARK = "";
                            var JIS = "";
                            var CRI = "";
                            var AntiBacteria = "";
                            var TravelDensity = "";

                            for (int i = 4; i <= length; i++)
                            {
                                var isHide = worksheet.IsRowVisible(i);
                                if (isHide == true)
                                {
                                    Page = worksheet.GetValueRowCol(i, 1).ToString().Trim();
                                    Code1 = worksheet.GetValueRowCol(i, 2).ToString().Trim();
                                    Code2 = worksheet.GetValueRowCol(i, 3).ToString().Trim();
                                    Code3 = worksheet.GetValueRowCol(i, 4).ToString().Trim();

                                    Code4 = worksheet.GetValueRowCol(i, 5).ToString().Trim();
                                    Code5 = worksheet.GetValueRowCol(i, 6).ToString().Trim();

                                    PricePerM2 = worksheet.GetValueRowCol(i, 7).ToString().Trim();
                                    //PricePerM = worksheet.GetValueRowCol(i, 8).ToString().Trim();
                                    try
                                    {
                                        var data = worksheet.Rows[i - 1].Cells;
                                        if (data != null)
                                            PricePerM = data[7].DisplayText.Trim();
                                    }
                                    catch (Exception ex)
                                    {

                                    }

                                    Unit = worksheet.GetValueRowCol(i, 9).ToString().Trim();
                                    Width = worksheet.GetValueRowCol(i, 10).ToString().Trim();
                                    Length = worksheet.GetValueRowCol(i, 12).ToString().Trim();
                                    CountPerBox = worksheet.GetValueRowCol(i, 13).ToString().Trim();
                                    M2PerBox = worksheet.GetValueRowCol(i, 14).ToString().Trim();
                                    Deep = worksheet.GetValueRowCol(i, 16).ToString().Trim();
                                    TotalDeep = worksheet.GetValueRowCol(i, 18).ToString().Trim();
                                    Structure = worksheet.GetValueRowCol(i, 19).ToString().Trim();
                                    TextileType = worksheet.GetValueRowCol(i, 20).ToString().Trim();
                                    Gauge = worksheet.GetValueRowCol(i, 21).ToString().Trim();
                                    GaugeUnit = worksheet.GetValueRowCol(i, 22).ToString().Trim();
                                    Sticth = worksheet.GetValueRowCol(i, 24).ToString().Trim();
                                    SticthUnit = worksheet.GetValueRowCol(i, 25).ToString().Trim();
                                    Formaldehyde = worksheet.GetValueRowCol(i, 26).ToString().Trim();
                                    FireSpread = worksheet.GetValueRowCol(i, 27).ToString().Trim();
                                    Antistatic = worksheet.GetValueRowCol(i, 28).ToString().Trim();
                                    Friendly = worksheet.GetValueRowCol(i, 29).ToString().Trim();
                                    ECO_MARK = worksheet.GetValueRowCol(i, 30).ToString().Trim();
                                    JIS = worksheet.GetValueRowCol(i, 31).ToString().Trim();
                                    CRI = worksheet.GetValueRowCol(i, 32).ToString().Trim();
                                    AntiBacteria = worksheet.GetValueRowCol(i, 33).ToString().Trim();
                                    TravelDensity = worksheet.GetValueRowCol(i, 34).ToString().Trim();

                                    ReadProductAttributeExcelImp excelImp = new ReadProductAttributeExcelImp();
                                    excelImp.ProductCode = productCode;
                                    excelImp.Code1 = Code1;
                                    excelImp.Code2 = Code2;
                                    excelImp.Code3 = Code3;
                                    excelImp.Code4 = Code4;
                                    if (string.IsNullOrEmpty(Code3))
                                        excelImp.AttributeCode = Code1 + Code2;
                                    else
                                        excelImp.AttributeCode = Code1 + Code2 + "." + Code3;
                                    excelImp.Page = Page;

                                    if (!string.IsNullOrEmpty(Code5))
                                        excelImp.Code4 = Code4 + " " + Code5;
                                    else
                                        excelImp.Code4 = Code4;
                                    excelImp.PricePerM2 = PricePerM2;
                                    excelImp.PricePerM = PricePerM;
                                    excelImp.Unit = Unit;
                                    excelImp.Width = Width;
                                    excelImp.Length = Length;
                                    excelImp.CountPerBox = CountPerBox;
                                    excelImp.M2PerBox = M2PerBox;
                                    excelImp.Deep = Deep;
                                    excelImp.TotalDeep = TotalDeep;
                                    excelImp.Structure = Structure;
                                    excelImp.TextileType = TextileType;
                                    excelImp.Gauge = Gauge;
                                    excelImp.GaugeUnit = GaugeUnit;
                                    excelImp.Sticth = Sticth;
                                    excelImp.SticthUnit = SticthUnit;
                                    excelImp.Formaldehyde = Formaldehyde;
                                    excelImp.FireSpread = FireSpread;
                                    excelImp.Antistatic = Antistatic;
                                    excelImp.Friendly = Friendly;
                                    excelImp.ECO_MARK = ECO_MARK;
                                    excelImp.JIS = JIS;
                                    excelImp.CRI = CRI;
                                    excelImp.AntiBacteria = AntiBacteria;
                                    excelImp.TravelDensity = TravelDensity;
                                    list.Add(excelImp);
                                }

                            }
                            list = updateNull(list);
                        }
                        else
                        {
                            msg.Error = true;
                            //msg.Title = "Sai định dạng tệp excel";
                            msg.Title = String.Format(_sharedResources["COM_MSG_FORMAT_EXCEL"]);

                        }
                    }
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi tải tệp";
                msg.Title = String.Format(_sharedResources["COM_MSG_FILE_FAIL"]);

            }
            if (msg.Error == false)
            {
                list = CheckUpdateOrInsert(list);
                msg.list = list;
            }
            return msg;
        }
        private List<ReadProductAttributeExcelImp> updateNull(List<ReadProductAttributeExcelImp> list)
        {
            for (var i = list.Count() - 1; i >= 0; --i)
            {
                if (string.IsNullOrEmpty(list[i].Code1))
                    list.RemoveAt(i);
            }
            foreach (var item in list)
            {
                if (string.IsNullOrEmpty(item.Weight))
                    item.Weight = "_";
                else
                    item.Weight = item.Weight;
                if (string.IsNullOrEmpty(item.VerticalStroke))
                    item.VerticalStroke = "_";
                if (string.IsNullOrEmpty(item.HorizontalStroke))
                    item.HorizontalStroke = "_";
                //if (string.IsNullOrEmpty(item.Note))
                //    item.Note = "_";
                if (string.IsNullOrEmpty(item.ESekou))
                    item.ESekou = "_";
                else
                    item.ESekou = "Y";

                if (string.IsNullOrEmpty(item.Sx2021))
                    item.Sx2021 = "_";
                else
                    item.Sx2021 = "Y";

                if (string.IsNullOrEmpty(item.AntiMold))
                    item.AntiMold = "_";
                else
                    item.AntiMold = "Y";

                if (string.IsNullOrEmpty(item.AntiFouling))
                    item.AntiFouling = "_";
                else
                    item.AntiFouling = "Y";
                if (string.IsNullOrEmpty(item.AntiBacteria))
                    item.AntiBacteria = "_";
                else
                    item.AntiBacteria = "Y";
                if (string.IsNullOrEmpty(item.Deodorant))
                    item.Deodorant = "_";
                else
                    item.Deodorant = "Y";
                if (string.IsNullOrEmpty(item.HumidityControl))
                    item.HumidityControl = "_";
                else
                    item.HumidityControl = "Y";

                if (string.IsNullOrEmpty(item.HardPaperSurface))
                    item.HardPaperSurface = "_";
                else
                    item.HardPaperSurface = "Y";
                if (string.IsNullOrEmpty(item.FireSpread))
                    item.FireSpread = "_";
                else
                    item.FireSpread = "Y";

                //glasss
                if (string.IsNullOrEmpty(item.AntiScatter))
                    item.AntiScatter = "_";
                else
                    item.AntiScatter = "Y";
                if (string.IsNullOrEmpty(item.UVProtection))
                    item.UVProtection = "_";
                else
                    item.UVProtection = "Y";

                if (string.IsNullOrEmpty(item.InsectRepellent))
                    item.InsectRepellent = "_";
                else
                    item.InsectRepellent = "Y";

                if (string.IsNullOrEmpty(item.BrigthnessControl))
                    item.BrigthnessControl = "_";
                else
                    item.BrigthnessControl = "Y";

                if (string.IsNullOrEmpty(item.HeatReflection))
                    item.HeatReflection = "_";
                else
                    item.HeatReflection = "Y";

                if (string.IsNullOrEmpty(item.OutsideInstallation))
                    item.OutsideInstallation = "_";
                else
                    item.OutsideInstallation = "Y";

                if (string.IsNullOrEmpty(item.StrongCoated))
                    item.StrongCoated = "_";
                else
                    item.StrongCoated = "Y";
                if (string.IsNullOrEmpty(item.LowReflection))
                    item.LowReflection = "_";
                else
                    item.LowReflection = "Y";

                // material
                if (string.IsNullOrEmpty(item.Material))
                    item.Material = "_";
                if (string.IsNullOrEmpty(item.Origin))
                    item.Origin = "_";
                if (string.IsNullOrEmpty(item.Unit))
                    item.Unit = "_";
                if (string.IsNullOrEmpty(item.Inheritance))
                    item.Inheritance = "_";

                if (string.IsNullOrEmpty(item.PricePerM))
                    item.PricePerM = "_";
                if (string.IsNullOrEmpty(item.PricePerM2))
                    item.PricePerM2 = "_";

                if (string.IsNullOrEmpty(item.Deep))
                    item.Deep = "_";
                if (string.IsNullOrEmpty(item.ChemicalResistance))
                    item.ChemicalResistance = "_";
                else
                    item.ChemicalResistance = "Y";
                if (string.IsNullOrEmpty(item.Antistatic))
                    item.Antistatic = "_";
                else
                    item.Antistatic = "Y";
                if (string.IsNullOrEmpty(item.Wax))
                    item.Wax = "_";
                else
                    item.Wax = "Y";
                if (string.IsNullOrEmpty(item.OutSide))
                    item.OutSide = "_";
                else
                    item.OutSide = "Y";
                if (string.IsNullOrEmpty(item.AntiShock))
                    item.AntiShock = "_";
                else
                    item.AntiShock = "Y";
                if (string.IsNullOrEmpty(item.ObjectMoving))
                    item.ObjectMoving = "_";
                else
                    item.ObjectMoving = "Y";
                //carpet
                if (string.IsNullOrEmpty(item.PricePerM2))
                    item.PricePerM2 = "_";


                if (string.IsNullOrEmpty(item.PricePerM))
                    item.PricePerM = "_";


                if (string.IsNullOrEmpty(item.CountPerBox))
                    item.CountPerBox = "_";

                if (string.IsNullOrEmpty(item.M2PerBox))
                    item.M2PerBox = "_";

                if (string.IsNullOrEmpty(item.TotalDeep))
                    item.TotalDeep = "_";

                if (string.IsNullOrEmpty(item.Structure))
                    item.Structure = "_";

                if (string.IsNullOrEmpty(item.TextileType))
                    item.TextileType = "_";

                if (string.IsNullOrEmpty(item.Gauge))
                    item.Gauge = "_";

                if (string.IsNullOrEmpty(item.GaugeUnit))
                    item.GaugeUnit = "_";

                if (string.IsNullOrEmpty(item.Sticth))
                    item.Sticth = "_";

                if (string.IsNullOrEmpty(item.SticthUnit))
                    item.SticthUnit = "_";

                if (string.IsNullOrEmpty(item.Formaldehyde))
                    item.Formaldehyde = "_";

                if (string.IsNullOrEmpty(item.Friendly))
                    item.Friendly = "_";
                else
                    item.Friendly = "Y";
                if (string.IsNullOrEmpty(item.ECO_MARK))
                    item.ECO_MARK = "_";
                else
                    item.ECO_MARK = "Y";
                if (string.IsNullOrEmpty(item.JIS))
                    item.JIS = "_";
                else
                    item.JIS = "Y";
                if (string.IsNullOrEmpty(item.CRI))
                    item.CRI = "_";
                else
                    item.CRI = "Y";
                if (string.IsNullOrEmpty(item.TravelDensity))
                    item.TravelDensity = "_";
            }
            return list;
        }
        private List<ReadProductAttributeExcelImp> GetListGlassFilmPriceInExcel(IWorksheet worksheet, string productCode)
        {
            var list = new List<ReadProductAttributeExcelImp>();
            try
            {
                var length = worksheet.Rows.Length;
                var Code1 = "";
                var Code2 = "";
                var Code3 = "";
                var Page = "";
                var Category = "";
                var Width = "";
                var Length = "";
                var Weight = "";
                var VerticalStroke = "";
                var HorizontalStroke = "";
                var Note = "";

                //
                var Inheritance = "";
                var PricePerM2 = "";
                var PricePerM = "";
                var Unit = "";
                var AntiScatter = "";
                var UVProtection = "";
                var InsectRepellent = "";
                var BrigthnessControl = "";
                var HeatReflection = "";
                var OutsideInstallation = "";
                var StrongCoated = "";
                var LowReflection = "";
                for (int i = 4; i <= length; i++)
                {
                    Code1 = worksheet.GetValueRowCol(i, 2).ToString().Trim();//Cột B file Excel
                    Code2 = worksheet.GetValueRowCol(i, 3).ToString().Trim();//Cột C file Excel
                    Code3 = worksheet.GetValueRowCol(i, 4).ToString().Trim();//Cột D file Excel
                    Inheritance = worksheet.GetValueRowCol(i, 5).ToString().Trim();
                    Page = worksheet.GetValueRowCol(i, 6).ToString().Trim();//Cột E file Excel
                    Category = worksheet.GetValueRowCol(i, 7).ToString().Trim();//Cột F file Excel

                    PricePerM2 = worksheet.GetValueRowCol(i, 9).ToString().Trim();
                    PricePerM = worksheet.GetValueRowCol(i, 10).ToString().Trim();
                    Unit = worksheet.GetValueRowCol(i, 11).ToString().Trim();


                    Width = worksheet.GetValueRowCol(i, 13).ToString().Trim();//Cột G file Excel
                    Length = worksheet.GetValueRowCol(i, 15).ToString().Trim();//Cột I file Excel


                    VerticalStroke = worksheet.GetValueRowCol(i, 16).ToString().Trim();//Cột K file Excel
                    HorizontalStroke = worksheet.GetValueRowCol(i, 17).ToString().Trim();//Cột L file Excel
                    Weight = worksheet.GetValueRowCol(i, 18).ToString().Trim();


                    AntiScatter = worksheet.GetValueRowCol(i, 20).ToString().Trim();
                    UVProtection = worksheet.GetValueRowCol(i, 21).ToString().Trim();
                    InsectRepellent = worksheet.GetValueRowCol(i, 22).ToString().Trim();
                    BrigthnessControl = worksheet.GetValueRowCol(i, 23).ToString().Trim();
                    HeatReflection = worksheet.GetValueRowCol(i, 24).ToString().Trim();
                    OutsideInstallation = worksheet.GetValueRowCol(i, 25).ToString().Trim();
                    StrongCoated = worksheet.GetValueRowCol(i, 26).ToString().Trim();
                    LowReflection = worksheet.GetValueRowCol(i, 27).ToString().Trim();
                    Note = worksheet.GetValueRowCol(i, 28).ToString().Trim();//Cột L file Excel

                    ReadProductAttributeExcelImp excelImp = new ReadProductAttributeExcelImp();
                    excelImp.ProductCode = productCode;
                    if (string.IsNullOrEmpty(Code3))
                        excelImp.AttributeCode = Code1 + Code2;
                    else
                        excelImp.AttributeCode = Code1 + Code2 + "." + Code3;
                    excelImp.Code1 = Code1;
                    excelImp.Code2 = Code2;
                    excelImp.Code3 = Code3;
                    excelImp.Page = Page;
                    excelImp.Category = Category;
                    excelImp.Width = Width;
                    excelImp.Length = Length;
                    excelImp.Weight = Weight;
                    excelImp.VerticalStroke = VerticalStroke;
                    excelImp.HorizontalStroke = HorizontalStroke;
                    excelImp.Note = Note;

                    excelImp.Inheritance = Inheritance;

                    excelImp.PricePerM2 = PricePerM2;
                    excelImp.PricePerM = PricePerM;
                    excelImp.AntiScatter = AntiScatter;
                    excelImp.UVProtection = UVProtection;
                    excelImp.InsectRepellent = InsectRepellent;
                    excelImp.BrigthnessControl = BrigthnessControl;
                    excelImp.HeatReflection = HeatReflection;
                    excelImp.OutsideInstallation = OutsideInstallation;
                    excelImp.StrongCoated = StrongCoated;
                    excelImp.LowReflection = LowReflection;
                    list.Add(excelImp);
                }
            }
            catch (Exception e)
            {
            }
            for (var i = list.Count() - 1; i >= 0; --i)
            {
                if (string.IsNullOrEmpty(list[i].Code1))
                    list.RemoveAt(i);
            }
            foreach (var item in list)
            {
                if (string.IsNullOrEmpty(item.Weight))
                    item.Weight = "_";
                else
                    item.Weight = item.Weight + "(g/m)";
                if (string.IsNullOrEmpty(item.VerticalStroke))
                    item.VerticalStroke = "_";
                if (string.IsNullOrEmpty(item.HorizontalStroke))
                    item.HorizontalStroke = "_";
                if (string.IsNullOrEmpty(item.Note))
                    item.Note = "_";
                if (string.IsNullOrEmpty(item.ESekou))
                    item.ESekou = "_";
                else
                    item.ESekou = "Y";

                if (string.IsNullOrEmpty(item.Sx2021))
                    item.Sx2021 = "_";
                else
                    item.Sx2021 = "Y";

                if (string.IsNullOrEmpty(item.AntiMold))
                    item.AntiMold = "_";
                else
                    item.AntiMold = "Y";

                if (string.IsNullOrEmpty(item.AntiFouling))
                    item.AntiFouling = "_";
                else
                    item.AntiFouling = "Y";
                if (string.IsNullOrEmpty(item.AntiBacteria))
                    item.AntiBacteria = "_";
                else
                    item.AntiBacteria = "Y";
                if (string.IsNullOrEmpty(item.Deodorant))
                    item.Deodorant = "_";
                else
                    item.Deodorant = "Y";
                if (string.IsNullOrEmpty(item.HumidityControl))
                    item.HumidityControl = "_";
                else
                    item.HumidityControl = "Y";

                if (string.IsNullOrEmpty(item.HardPaperSurface))
                    item.HardPaperSurface = "_";
                else
                    item.HardPaperSurface = "Y";
                if (string.IsNullOrEmpty(item.FireSpread))
                    item.FireSpread = "_";
                else
                    item.FireSpread = "Y";

                //glasss
                if (string.IsNullOrEmpty(item.AntiScatter))
                    item.AntiScatter = "_";
                else
                    item.AntiScatter = "Y";
                if (string.IsNullOrEmpty(item.UVProtection))
                    item.UVProtection = "_";
                else
                    item.UVProtection = "Y";

                if (string.IsNullOrEmpty(item.InsectRepellent))
                    item.InsectRepellent = "_";
                else
                    item.InsectRepellent = "Y";

                if (string.IsNullOrEmpty(item.BrigthnessControl))
                    item.BrigthnessControl = "_";
                else
                    item.BrigthnessControl = "Y";

                if (string.IsNullOrEmpty(item.HeatReflection))
                    item.HeatReflection = "_";
                else
                    item.HeatReflection = "Y";

                if (string.IsNullOrEmpty(item.OutsideInstallation))
                    item.OutsideInstallation = "_";
                else
                    item.OutsideInstallation = "Y";

                if (string.IsNullOrEmpty(item.StrongCoated))
                    item.StrongCoated = "_";
                else
                    item.StrongCoated = "Y";
                if (string.IsNullOrEmpty(item.LowReflection))
                    item.LowReflection = "_";
                else
                    item.LowReflection = "Y";

                // material
                if (string.IsNullOrEmpty(item.Material))
                    item.Material = "_";
                if (string.IsNullOrEmpty(item.Origin))
                    item.Origin = "_";
                if (string.IsNullOrEmpty(item.Unit))
                    item.Unit = "_";
                if (string.IsNullOrEmpty(item.Inheritance))
                    item.Inheritance = "_";

                if (string.IsNullOrEmpty(item.PricePerM))
                    item.PricePerM = "_";
                else
                    item.PricePerM = item.PricePerM + "(jpy/m)";
                if (string.IsNullOrEmpty(item.PricePerM2))
                    item.PricePerM2 = "_";
                else
                    item.PricePerM2 = item.PricePerM2 + "(jpy/m2)";
            }
            return list;
        }
        public List<ReadProductAttributeExcelImp> GetListInExcel(IWorksheet worksheet, string productCode)
        {
            var list = new List<ReadProductAttributeExcelImp>();
            try
            {
                var length = worksheet.Rows.Length;
                var Code1 = ""; //Cột B file Excel
                var Code2 = "";//Cột C file Excel
                var Code3 = "";//Cột D file Excel
                var Page = "";//Cột E file Excel
                var Category = "";//Cột F file Excel
                var Width = "";//Cột G file Excel
                var Length = "";//Cột I file Excel
                var Weight = "";
                var VerticalStroke = "";//Cột K file Excel
                var HorizontalStroke = "";//Cột L file Excel
                var PricePerM = "";
                var Unit = "";
                var Material = "";
                var Origin = "";
                for (int i = 4; i <= length; i++)
                {
                    Code1 = worksheet.GetValueRowCol(i, 1).ToString().Trim();//Cột B file Excel
                    Code2 = worksheet.GetValueRowCol(i, 2).ToString().Trim();//Cột C file Excel
                    Category = worksheet.GetValueRowCol(i, 3).ToString().Trim();//Cột D file Excel
                    Page = worksheet.GetValueRowCol(i, 4).ToString().Trim();//Cột E file Excel
                    PricePerM = worksheet.GetValueRowCol(i, 5).ToString().Trim();//Cột F file Excel
                    Width = worksheet.GetValueRowCol(i, 6).ToString().Trim();//Cột G file Excel
                    VerticalStroke = worksheet.GetValueRowCol(i, 7).ToString().Trim();//Cột K file Excel
                    HorizontalStroke = worksheet.GetValueRowCol(i, 8).ToString().Trim();//Cột L file Excel

                    Length = worksheet.GetValueRowCol(i, 9).ToString().Trim();//Cột I file Excel
                    Unit = worksheet.GetValueRowCol(i, 10).ToString().Trim();

                    Weight = worksheet.GetValueRowCol(i, 11).ToString().Trim();
                    Material = worksheet.GetValueRowCol(i, 12).ToString().Trim();//Cột L file Excel
                    Origin = worksheet.GetValueRowCol(i, 13).ToString().Trim();

                    ReadProductAttributeExcelImp excelImp = new ReadProductAttributeExcelImp();
                    excelImp.ProductCode = productCode;
                    if (string.IsNullOrEmpty(Code3))
                        excelImp.AttributeCode = Code1 + Code2;
                    else
                        excelImp.AttributeCode = Code1 + Code2 + "." + Code3;
                    excelImp.Code1 = Code1;
                    excelImp.Code2 = Code2;
                    excelImp.Code3 = Code3;
                    excelImp.Page = Page;
                    excelImp.Category = Category;
                    excelImp.Width = Width;
                    excelImp.Length = Length;
                    excelImp.Weight = Weight;
                    excelImp.VerticalStroke = VerticalStroke;
                    excelImp.HorizontalStroke = HorizontalStroke;

                    excelImp.Unit = Unit;
                    excelImp.Material = Material;
                    excelImp.Origin = Origin;

                    list.Add(excelImp);
                }
                for (var i = list.Count() - 1; i >= 0; --i)
                {
                    if (string.IsNullOrEmpty(list[i].Code1))
                        list.RemoveAt(i);
                }
                foreach (var item in list)
                {
                    if (string.IsNullOrEmpty(item.Weight))
                        item.Weight = "_";
                    else
                        item.Weight = item.Weight + "(g/m)";
                    if (string.IsNullOrEmpty(item.VerticalStroke))
                        item.VerticalStroke = "_";
                    if (string.IsNullOrEmpty(item.HorizontalStroke))
                        item.HorizontalStroke = "_";
                    if (string.IsNullOrEmpty(item.Note))
                        item.Note = "_";
                    if (string.IsNullOrEmpty(item.ESekou))
                        item.ESekou = "_";
                    else
                        item.ESekou = "Y";

                    if (string.IsNullOrEmpty(item.Sx2021))
                        item.Sx2021 = "_";
                    else
                        item.Sx2021 = "Y";

                    if (string.IsNullOrEmpty(item.AntiMold))
                        item.AntiMold = "_";
                    else
                        item.AntiMold = "Y";

                    if (string.IsNullOrEmpty(item.AntiFouling))
                        item.AntiFouling = "_";
                    else
                        item.AntiFouling = "Y";
                    if (string.IsNullOrEmpty(item.AntiBacteria))
                        item.AntiBacteria = "_";
                    else
                        item.AntiBacteria = "Y";
                    if (string.IsNullOrEmpty(item.Deodorant))
                        item.Deodorant = "_";
                    else
                        item.Deodorant = "Y";
                    if (string.IsNullOrEmpty(item.HumidityControl))
                        item.HumidityControl = "_";
                    else
                        item.HumidityControl = "Y";

                    if (string.IsNullOrEmpty(item.HardPaperSurface))
                        item.HardPaperSurface = "_";
                    else
                        item.HardPaperSurface = "Y";
                    if (string.IsNullOrEmpty(item.FireSpread))
                        item.FireSpread = "_";
                    else
                        item.FireSpread = "Y";

                    //glasss
                    if (string.IsNullOrEmpty(item.AntiScatter))
                        item.AntiScatter = "_";
                    else
                        item.AntiScatter = "Y";
                    if (string.IsNullOrEmpty(item.UVProtection))
                        item.UVProtection = "_";
                    else
                        item.UVProtection = "Y";

                    if (string.IsNullOrEmpty(item.InsectRepellent))
                        item.InsectRepellent = "_";
                    else
                        item.InsectRepellent = "Y";

                    if (string.IsNullOrEmpty(item.BrigthnessControl))
                        item.BrigthnessControl = "_";
                    else
                        item.BrigthnessControl = "Y";

                    if (string.IsNullOrEmpty(item.HeatReflection))
                        item.HeatReflection = "_";
                    else
                        item.HeatReflection = "Y";

                    if (string.IsNullOrEmpty(item.OutsideInstallation))
                        item.OutsideInstallation = "_";
                    else
                        item.OutsideInstallation = "Y";

                    if (string.IsNullOrEmpty(item.StrongCoated))
                        item.StrongCoated = "_";
                    else
                        item.StrongCoated = "Y";
                    if (string.IsNullOrEmpty(item.LowReflection))
                        item.LowReflection = "_";
                    else
                        item.LowReflection = "Y";

                    // material
                    if (string.IsNullOrEmpty(item.Material))
                        item.Material = "_";
                    if (string.IsNullOrEmpty(item.Origin))
                        item.Origin = "_";
                    if (string.IsNullOrEmpty(item.Unit))
                        item.Unit = "_";
                    if (string.IsNullOrEmpty(item.Inheritance))
                        item.Inheritance = "_";

                    if (string.IsNullOrEmpty(item.PricePerM))
                        item.PricePerM = "_";
                    else
                        item.PricePerM = item.PricePerM + "(jpy/m)";
                    if (string.IsNullOrEmpty(item.PricePerM2))
                        item.PricePerM2 = "_";

                }
            }
            catch (Exception ex)
            {

            }

            return list;
        }
        [HttpPost]
        public async Task<JsonResult> SaveItems([FromBody] List<ReadProductAttributeExcelImp> list)
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
                int bug = 0;
                var isNew = list[0].Status == "NEW" ? true : false;
                var unit = "";
                var productCatalogue = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == list[0].ProductCode);
                if (productCatalogue != null && !string.IsNullOrEmpty(productCatalogue.Unit))
                    unit = productCatalogue.Unit;
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
                        try
                        {

                            SubProduct prod = new SubProduct();
                            prod.ProductCode = item.ProductCode;
                            prod.AttributeCode = item.AttributeCode;
                            prod.AttributeName = (item.Code1 + " " + item.Code2 + " " + item.Code3).Trim();
                            prod.Value = GetValueFromImpModel(item);
                            prod.Type = item.Type;
                            prod.Note = item.Note;
                            if (!string.IsNullOrEmpty(unit))
                            {
                                prod.Unit = unit;
                            }
                            var image = "";

                            if (item.Type == "GIAY_DAN_TUONG")
                            {
                                image = item.Code1 + item.Code2 + ".jpg";
                                image = "/uploads/imageProduct/Fine1000/" + image;
                            }
                            if (item.Type == "REM")
                            {
                                image = item.Code1 + item.Code2 + " 09.jpg";
                                image = "/uploads/imageProduct/Simple Order/" + image;
                            }
                            if (item.Type == "THAM")
                            {
                                image = item.Code1 + item.Code2 + ".jpg";
                                image = "/uploads/imageProduct/NT/" + image;
                            }
                            if (item.Type == "SAN")
                            {
                                image = item.Code1 + item.Code2 + " 02.jpg";
                                image = "/uploads/imageProduct/SFloor/" + image;
                            }
                            prod.Image = image;
                            prod.ProductQrCode = prod.ProductCode + "_" + prod.AttributeCode;
                            prod.CreatedBy = ESEIM.AppContext.UserName;
                            prod.CreatedTime = DateTime.Now;
                            prod.IsDeleted = false;
                            prod.InStock = 0;
                            if (item.PricePerM != "_")
                                prod.PricePerM = decimal.Parse(item.PricePerM);

                            if (item.PricePerM2 != "_")
                                prod.PricePerM2 = decimal.Parse(item.PricePerM2);
                            _context.SubProducts.Add(prod);
                            await _context.SaveChangesAsync();
                            item.Status = "INSERTED";
                        }
                        catch (Exception ex)
                        {
                            bug = bug + 1;
                            item.Status = "ERROR";
                        }
                    }
                    else
                    {
                        try
                        {
                            var prod = _context.SubProducts.FirstOrDefault(x => x.IsDeleted == false && x.ProductCode == item.ProductCode && x.AttributeCode == item.AttributeCode);
                            if (prod != null)
                            {
                                prod.AttributeName = (item.Code1 + " " + item.Code2 + " " + item.Code3).Trim();
                                prod.Value = GetValueFromImpModel(item);
                                var image = "";

                                if (item.Type == "GIAY_DAN_TUONG")
                                {
                                    image = item.Code1 + item.Code2 + ".jpg";
                                    image = "/uploads/imageProduct/Fine1000/" + image;
                                }
                                if (item.Type == "REM")
                                {
                                    image = item.Code1 + item.Code2 + " 09.jpg";
                                    image = "/uploads/imageProduct/Simple Order/" + image;
                                }
                                if (item.Type == "THAM")
                                {
                                    image = item.Code1 + item.Code2 + ".jpg";
                                    image = "/uploads/imageProduct/NT/" + image;
                                }
                                if (item.Type == "SAN")
                                {
                                    image = item.Code1 + item.Code2 + " 02.jpg";
                                    image = "/uploads/imageProduct/SFloor/" + image;
                                }
                                prod.Image = image;

                                prod.ProductQrCode = prod.ProductCode + "_" + prod.AttributeCode;
                                prod.UpdatedBy = ESEIM.AppContext.UserName;
                                prod.UpdatedTime = DateTime.Now;
                                prod.Type = item.Type;
                                prod.Note = item.Note;
                                if (item.PricePerM != "_")
                                    prod.PricePerM = decimal.Parse(item.PricePerM);

                                if (item.PricePerM2 != "_")
                                    prod.PricePerM2 = decimal.Parse(item.PricePerM2);
                                _context.SubProducts.Update(prod);
                                await _context.SaveChangesAsync();
                                item.Status = "UPDATED";
                            }
                        }
                        catch (Exception ex)
                        {
                            bug = bug + 1;
                            item.Status = "ERROR";
                        }
                    }
                    count++;
                }
                msg.Error = false;
                if (isNew)
                {
                    if (bug == 0)
                        //msg.Title = "Thêm sản phẩm thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["MLP_CURD_LBL_PRODUCT"]);

                    else
                        msg.Title = +(count - bug) + "/" + count +/* " sản phẩm"*/String.Format(_stringLocalizer["MLP_CURD_LBL_PRODUCT"]);
                }
                else
                {
                    if (bug == 0)
                        //msg.Title = "Cập nhật sản phẩm thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["MLP_CURD_LBL_PRODUCT"]);
                    else
                        msg.Title = /*"Cập nhật thành công "*/String.Format(_sharedResources["COM_UPDATE_SUCCESS"]) + (count - bug) + "/" + count + /*" sản phẩm"*/String.Format(_stringLocalizer["MLP_CURD_LBL_PRODUCT"]);
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                if (list[0].Status == "NEW")
                    //msg.Title = "Thêm các khách hàng lỗi";
                    msg.Title = String.Format(_stringLocalizer["MLP_MSG_ADD_CUSTUMER_ERR"]);

                else if (list[0].Status == "UPDATE")
                {
                    //msg.Title = "Chỉnh sửa các khách hàng lỗi";
                    msg.Title = String.Format(_stringLocalizer["MLP_MSG_UPDATE_CUSTUMER_ERR"]);

                }
            }
            msg.Object = list;
            return Json(msg);
        }

        public string GetValueFromImpModel(ReadProductAttributeExcelImp item)
        {
            var value = "";
            if (item.Type == "GIAY_DAN_TUONG")
            {
                value +=
                    item.Page + "*" +
                    item.Category + "*" +
                    item.Width + "*" +
                    item.Length + "*" +
                    item.Weight + "*" +
                    item.VerticalStroke + "*" +
                    item.HorizontalStroke + "*" +
                    item.Note + "*" +
                    item.ESekou + "*" +
                    item.Sx2021 + "*" +
                    item.AntiMold + "*" +
                    item.AntiFouling + "*" +
                    item.AntiBacteria + "*" +
                    item.Deodorant + "*" +
                    item.HumidityControl + "*" +
                    item.HardPaperSurface + "*" +
                    item.FireSpread;
            }
            else if (item.Type == "REM")
            {
                value +=
                    item.Page + "*" +
                    item.Category + "*" +
                    item.PricePerM + "*" +
                    item.Width + "*" +
                    item.VerticalStroke + "*" +
                    item.HorizontalStroke + "*" +
                    item.Length + "*" +
                    item.Weight + "*" +
                    item.Material + "*" +
                    item.Origin;

            }
            else if (item.Type == "THAM")
            {
                value +=
                    item.Page + "*" +
                    item.Code4 + "*" +
                    item.PricePerM2 + "*" +
                    item.PricePerM + "*" +
                    item.Unit + "*" +
                    item.Width + "*" +
                    item.Length + "*" +
                    item.CountPerBox + "*" +
                    item.M2PerBox + "*" +
                    item.Deep + "*" +
                    item.TotalDeep + "*" +
                    item.Structure + "*" +
                    item.TextileType + "*" +
                    item.Gauge + "(" + (string.IsNullOrEmpty(item.GaugeUnit) ? "_" : item.GaugeUnit) + ")" + "*" +
                    item.Sticth + "(" + (string.IsNullOrEmpty(item.SticthUnit) ? "_" : item.SticthUnit) + ")" + "*" +
                    item.Formaldehyde + "*" +
                    item.FireSpread + "*" +
                    item.Antistatic + "*" +
                    item.Friendly + "*" +
                    item.ECO_MARK + "*" +
                    item.JIS + "*" +
                    item.CRI + "*" +
                    item.AntiBacteria + "*" +
                    item.TravelDensity;
            }
            else if (item.Type == "SAN")
            {
                value +=
                    item.Page + "*" +
                    item.Category + "*" +
                    item.PricePerM2 + "*" +
                    item.PricePerM + "*" +
                    item.Unit + "*" +
                    item.Width + "*" +
                    item.Deep + "*" +
                    item.Weight + "*" +
                    item.VerticalStroke + "*" +
                    item.HorizontalStroke + "*" +
                    item.AntiBacteria + "*" +
                    item.ChemicalResistance + "*" +
                    item.Antistatic + "*" +
                    item.Wax + "*" +
                    item.OutSide + "*" +
                    item.AntiFouling + "*" +
                    item.AntiMold + "*" +
                    item.AntiShock + "*" +
                    item.ObjectMoving + "*" +
                    item.FireSpread;
            }
            return value;
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
        #endregion

        #region File
        [HttpPost]
        public object JTableFileNew([FromBody] JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ProductCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.ProductCode && x.ObjectType == EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              TypeFile = "NO_SHARE",
                              ReposName = f != null ? f.ReposName : "",
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.ProductCode && x.ObjectType == EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product))
                  join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      Id = b.FileID,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "SHARE",
                      ReposName = f != null ? f.ReposName : "",
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile");
            return jdata;
        }
        [HttpPost]
        public JsonResult InsertProductFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(mediaType, mimeType) >= 0 || (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0)))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        //var suggesstion = GetSuggestionsProductFile(obj.ProductCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = _stringLocalizer["MLP_MSG_FIND_SUGGESTIONS"];
                        //    return Json(msg);
                        //}
                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                               && x.ObjectCode.Equals(obj.ProductCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Product)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                        if (setting != null)
                        {
                            reposCode = setting.ReposCode;
                            path = setting.Path;
                            folderId = setting.FolderId;
                            catCode = setting.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["MLP_MSG_CHOOSE_FOLDER"];
                            return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("PRODUCT", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.ProductCode,
                        ObjectType = EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_ADD_FILE_SUCCESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_FILE_FORMAT"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_ERR"], _stringLocalizer[""]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateProductFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }
                                else if (result.Status == WebExceptionStatus.Success)
                                {
                                    if (result.IsSaveUrlPreventive)
                                    {
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["MLP_MSG_UPDATE_INFO"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_CHOOSE_FOLDER_STORAGE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_FOLDER_EXISTED_DELETED"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsProductFile(string productCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == productCode && x.ObjectType == EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public JsonResult DeleteProductFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
                if (getRepository != null)
                {
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetProductFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_FILE_NOEXIST"];//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_HAPPENS"];
            }
            return Json(msg);
        }
        #endregion

        #region Tab Atribute
        [HttpPost]
        public object JTableAttributeMore([FromBody] JtableAttributeModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductAttrGalaxys
                        join b in _context.AttrGalaxys on a.AttrCode equals b.Code into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.ProductCode == jTablePara.ProductCode
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            AttrName = b2 != null ? b2.Name : "",
                            a.AttrValue,
                            a.CreatedTime,
                            Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                            Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                            DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                            Parent = b2 != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name : "" : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");

            return Json(jdata);
        }
        [HttpPost]
        public object JTableAttributeMoreStatic([FromBody] JtableAttributeModel jTablePara)
        {
            var intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var session = HttpContext.GetSessionUser();
            var attrGalaxies = _context.AttrGalaxys.Where(x => !x.IsDeleted).ToList();
            if (jTablePara.Uuid != session.ProductCustomUuid)
            {
                var obj = UpdateSessionStatic(jTablePara);
                var query = from a in obj.galaxies
                                .Select((x, i) => new
                                {
                                    Id = i,
                                    x.AttrCode,
                                    x.AttrValue,
                                    x.CreatedTime,
                                    x.ProductCode,
                                    x.IsDeleted
                                })
                            join b in attrGalaxies on a.AttrCode equals b.Code into b1
                            from b2 in b1.DefaultIfEmpty()
                            where a.ProductCode == jTablePara.ProductCode
                            && a.IsDeleted == false
                            //orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.AttrCode,
                                AttrName = b2 != null ? b2.Name : "",
                                a.AttrValue,
                                a.CreatedTime,
                                Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                                Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                                DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                                Parent = b2 != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name : "" : ""
                            };
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jData = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");
                var newSession = HttpContext.GetSessionUser();
                jData.Add("uuid", newSession.ProductCustomUuid);
                return Json(jData);
            }
            else
            {
                var query = from a in session.ProductAttrGalaxys
                                .Select((x, i) => new
                                {
                                    Id = i,
                                    x.AttrCode,
                                    x.AttrValue,
                                    x.CreatedTime,
                                    x.ProductCode,
                                    x.IsDeleted
                                })
                            join b in attrGalaxies on a.AttrCode equals b.Code into b1
                            from b2 in b1.DefaultIfEmpty()
                            where a.ProductCode == jTablePara.ProductCode
                            && a.IsDeleted == false
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.AttrCode,
                                AttrName = b2 != null ? b2.Name : "",
                                a.AttrValue,
                                a.CreatedTime,
                                Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                                Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                                DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                                Parent = b2 != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name : "" : ""
                            };
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jData = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");

                var newSession = HttpContext.GetSessionUser();
                jData.Add("uuid", newSession.ProductCustomUuid);
                return Json(jData);
            }
        }

        [HttpPost]
        public JsonResult InsertInheritanceAttributeMore(string productCode, string inheritance)
        {
            JMessage msg = new JMessage();
            try
            {
                var listProductAttribute = _context.ProductAttributes.Where(x => !x.IsDeleted && x.ProductCode.Equals(productCode)).ToList();
                foreach (var item in listProductAttribute)
                {
                    _context.ProductAttributes.Remove(item);
                    _context.SaveChanges();
                }

                var listProductAttributeAdd = _context.ProductAttributes.Where(x => x.ProductCode.Equals(inheritance) && !x.IsDeleted).ToList();
                if (listProductAttributeAdd.Count > 0)
                {
                    foreach (var item in listProductAttributeAdd)
                    {
                        ProductAttribute objNew = new ProductAttribute();

                        objNew.ProductCode = productCode;
                        objNew.AttributeCode = item.AttributeCode;
                        objNew.AttributeName = item.AttributeName;
                        objNew.AttributeValue = item.AttributeValue;
                        objNew.FieldType = item.FieldType;
                        objNew.Note = item.Note;

                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.ProductAttributes.Add(objNew);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["MLP_MSG_INHERITANCE_PRODUCT"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PRODUCT_NOINHERITANCE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_INHERITANCE"];
            }
            return Json(msg);
        }

        #region OLD
        //[HttpPost]
        //public JsonResult InsertAttributeMore([FromBody]ProductAttribute obj)
        //{
        //    JMessage msg = new JMessage();
        //    try
        //    {
        //        var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
        //        if (parent != null)
        //        {
        //            var data = _context.ProductAttributes.FirstOrDefault(x => !string.IsNullOrEmpty(x.ProductCode) && !string.IsNullOrEmpty(obj.ProductCode) && x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && !string.IsNullOrEmpty(x.AttributeCode) && !string.IsNullOrEmpty(obj.AttributeCode) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
        //            if (data != null)
        //            {
        //                msg.Error = true;
        //                msg.Title = _stringLocalizer["MLP_MSG_EXISTED_NOMORE"];
        //            }
        //            else
        //            {
        //                ProductAttribute objNew = new ProductAttribute();

        //                objNew.ProductCode = obj.ProductCode;
        //                objNew.AttributeCode = obj.AttributeCode;
        //                objNew.AttributeName = obj.AttributeName;
        //                objNew.AttributeValue = obj.AttributeValue;
        //                objNew.FieldType = obj.FieldType;
        //                objNew.Note = obj.Note;

        //                objNew.CreatedTime = DateTime.Now;
        //                objNew.CreatedBy = ESEIM.AppContext.UserName;
        //                objNew.IsDeleted = false;

        //                _context.ProductAttributes.Add(objNew);
        //                _context.SaveChanges();
        //                msg.Error = false;
        //                msg.Title = _sharedResources["COM_ADD_SUCCESS"];
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = false;
        //            msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_ERR_ADD"];
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult UpdateAttributeMore([FromBody]ProductAttribute obj)
        //{
        //    JMessage msg = new JMessage();
        //    try
        //    {
        //        var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
        //        if (parent != null)
        //        {
        //            var objNew = _context.ProductAttributes.FirstOrDefault(x => !string.IsNullOrEmpty(x.ProductCode) && !string.IsNullOrEmpty(obj.ProductCode) && x.ProductCode.ToLower().Equals(obj.ProductCode.ToLower()) && !string.IsNullOrEmpty(x.AttributeCode) && !string.IsNullOrEmpty(obj.AttributeCode) && x.AttributeCode.ToLower().Equals(obj.AttributeCode.ToLower()) && x.IsDeleted == false);
        //            if (objNew == null)
        //            {
        //                msg.Error = true;
        //                msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
        //            }
        //            else
        //            {
        //                objNew.ProductCode = obj.ProductCode;
        //                objNew.AttributeCode = obj.AttributeCode;
        //                objNew.AttributeName = obj.AttributeName;
        //                objNew.AttributeValue = obj.AttributeValue;
        //                objNew.FieldType = obj.FieldType;
        //                objNew.Note = obj.Note;

        //                objNew.UpdatedTime = DateTime.Now;
        //                objNew.UpdatedBy = ESEIM.AppContext.UserName;
        //                objNew.IsDeleted = false;

        //                _context.ProductAttributes.Update(objNew);
        //                _context.SaveChanges();
        //                msg.Error = false;
        //                msg.Title = _stringLocalizer["MLP_MSG_EDIT_SUCCESS"];
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = false;
        //            msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult DeleteAttributeMore(int Id)
        //{
        //    JMessage msg = new JMessage();
        //    try
        //    {
        //        //var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
        //        //if (parent != null)
        //        //{
        //        var objNew = _context.ProductAttributes.FirstOrDefault(x => x.Id == Id);
        //        if (objNew == null)
        //        {
        //            msg.Error = true;
        //            msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
        //        }
        //        else
        //        {
        //            objNew.DeletedTime = DateTime.Now;
        //            objNew.DeletedBy = ESEIM.AppContext.UserName;
        //            objNew.IsDeleted = true;

        //            _context.ProductAttributes.Update(objNew);
        //            _context.SaveChanges();
        //            msg.Error = false;
        //            msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
        //        }
        //        //}
        //        //else
        //        //{
        //        //    msg.Error = false;
        //        //    msg.Title = "Danh mục sản phẩm không tồn tại, vui lòng làm mới trang";
        //        //}

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_ERR_DELETE"];
        //    }
        //    return Json(msg);
        //}
        #endregion

        #region NEW
        [HttpPost]
        public JsonResult InsertAttributeMore([FromBody] ProductAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = _context.ProductAttrGalaxys.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_EXISTED_NOMORE"];
                    }
                    else
                    {
                        ProductAttrGalaxy objNew = new ProductAttrGalaxy();

                        objNew.ProductCode = obj.ProductCode;
                        objNew.AttrCode = obj.AttrCode;
                        objNew.AttrValue = obj.AttrValue;
                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.ProductAttrGalaxys.Add(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateAttributeMore([FromBody] ProductAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var objNew = _context.ProductAttrGalaxys.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (objNew == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                    }
                    else
                    {
                        objNew.ProductCode = obj.ProductCode;
                        objNew.AttrValue = obj.AttrValue;

                        objNew.UpdatedTime = DateTime.Now;
                        objNew.UpdatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.ProductAttrGalaxys.Update(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _stringLocalizer["MLP_MSG_EDIT_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                //var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                //if (parent != null)
                //{
                var objNew = _context.ProductAttrGalaxys.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    objNew.DeletedTime = DateTime.Now;
                    objNew.DeletedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = true;

                    _context.ProductAttrGalaxys.Update(objNew);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                //}
                //else
                //{
                //    msg.Error = false;
                //    msg.Title = "Danh mục sản phẩm không tồn tại, vui lòng làm mới trang";
                //}

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetDetailAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.ProductAttrGalaxys.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        #endregion

        #region NEW_STATIC
        [HttpPost]
        public JsonResult InsertAttributeMoreStatic([FromBody] ProductAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = session.ProductAttrGalaxys.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_EXISTED_NOMORE"];
                    }
                    else
                    {
                        ProductAttrGalaxy objNew = new ProductAttrGalaxy();

                        objNew.ProductCode = obj.ProductCode;
                        objNew.AttrCode = obj.AttrCode;
                        objNew.AttrValue = obj.AttrValue;
                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        //_context.ProductAttrGalaxys.Add(objNew);
                        session.ProductAttrGalaxys.Add(objNew);
                        HttpContext.SetSessionUser(session);
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateAttributeMoreStatic([FromBody] ProductAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var objNew = session.ProductAttrGalaxys.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (objNew == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                    }
                    else
                    {
                        objNew.ProductCode = obj.ProductCode;
                        objNew.AttrValue = obj.AttrValue;

                        objNew.UpdatedTime = DateTime.Now;
                        objNew.UpdatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        //_context.ProductAttrGalaxys.Update(objNew);
                        HttpContext.SetSessionUser(session);
                        msg.Error = false;
                        msg.Title = _stringLocalizer["MLP_MSG_EDIT_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteAttributeMoreStatic([FromBody] ProductAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                //var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                //if (parent != null)
                //{
                var objNew = session.ProductAttrGalaxys.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    objNew.DeletedTime = DateTime.Now;
                    objNew.DeletedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = true;

                    //_context.ProductAttrGalaxys.Update(objNew);
                    HttpContext.SetSessionUser(session);
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                //}
                //else
                //{
                //    msg.Error = false;
                //    msg.Title = "Danh mục sản phẩm không tồn tại, vui lòng làm mới trang";
                //}

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetDetailAttributeMoreStatic([FromBody] ProductAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var objNew = session.ProductAttrGalaxys.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        #endregion


        [HttpPost]
        public JsonResult GetListProductAttributeMain()
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.AttrGalaxys.Where(x => !x.IsDeleted).Select(x => new { x.Code, x.Name });
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListProductAttributeChildren(string ParentCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.MaterialProductAttributeChildrens.Where(x => !x.IsDeleted && x.ParentCode.Equals(ParentCode)).Select(x => new { x.Code, x.Name });
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        #endregion

        #region Component

        [AllowAnonymous]
        [HttpPost]
        public object JTableComponent([FromBody] JtableAttributeModel jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductComponents
                        where a.ProductCode == jTablePara.ProductCode
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.Code,
                            Name = _context.MaterialProducts.FirstOrDefault(x => x.IsDeleted == false && a.Code == x.ProductCode).ProductName,
                            a.Quantity,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : "",
                            a.CreatedTime,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Quantity", "Unit", "CreatedTime");

            return Json(jdata);
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTableComponentStatic([FromBody] JtableAttributeModel jTablePara)
        {

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var session = HttpContext.GetSessionUser();
            if (jTablePara.Uuid != session.ProductCustomUuid)
            {
                var obj = UpdateSessionStatic(jTablePara);
                var query = from a in obj.components.Select((x, i) => new
                {
                    Id = i,
                    x.Code,
                    x.Name,
                    x.Quantity,
                    x.Unit,
                    x.CreatedTime,
                    x.ProductCode,
                    x.IsDeleted
                })
                            where a.ProductCode == jTablePara.ProductCode
                            && a.IsDeleted == false
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.Code,
                                Name = _context.MaterialProducts.FirstOrDefault(x => x.IsDeleted == false && a.Code == x.ProductCode).ProductName,
                                a.Quantity,
                                Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : "",
                                a.CreatedTime,
                            };
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jData = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Quantity", "Unit", "CreatedTime");

                var newSession = HttpContext.GetSessionUser();
                jData.Add("uuid", newSession.ProductCustomUuid);
                return Json(jData);
            }
            else
            {
                var query = from a in session.ProductComponents.Select((x, i) => new
                {
                    Id = i,
                    x.Code,
                    x.Name,
                    x.Quantity,
                    x.Unit,
                    x.CreatedTime,
                    x.ProductCode,
                    x.IsDeleted
                })
                            where a.ProductCode == jTablePara.ProductCode
                          && a.IsDeleted == false
                            orderby a.Id descending
                            select new
                            {
                                a.Id,
                                a.Code,
                                Name = _context.MaterialProducts.FirstOrDefault(x => x.IsDeleted == false && a.Code == x.ProductCode).ProductName,
                                a.Quantity,
                                Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(a.Unit)).ValueSet : "",
                                a.CreatedTime,
                            };
                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jData = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Quantity", "Unit", "CreatedTime");

                var newSession = HttpContext.GetSessionUser();
                jData.Add("uuid", newSession.ProductCustomUuid);
                return Json(jData);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertComponent([FromBody] ProductComponent obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = _context.ProductComponents.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.Code.Equals(obj.Code) && !x.IsDeleted);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["Thành phần đã tồn tại"];
                    }
                    else
                    {
                        ProductComponent objNew = new ProductComponent();

                        objNew.ProductCode = obj.ProductCode;
                        objNew.Code = obj.Code;
                        objNew.Name = obj.Name;
                        objNew.Quantity = obj.Quantity;
                        objNew.Unit = obj.Unit;

                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.ProductComponents.Add(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["Sản phẩm không tồn tại"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult InsertComponentStatic([FromBody] ProductComponent obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = session.ProductComponents.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.Code.Equals(obj.Code) && !x.IsDeleted);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["Thành phần đã tồn tại"];
                    }
                    else
                    {
                        ProductComponent objNew = new ProductComponent();

                        objNew.ProductCode = obj.ProductCode;
                        objNew.Code = obj.Code;
                        objNew.Name = obj.Name;
                        objNew.Quantity = obj.Quantity;
                        objNew.Unit = obj.Unit;

                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        session.ProductComponents.Add(objNew);
                        HttpContext.SetSessionUser(session);
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["Sản phẩm không tồn tại"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetDetailComponent(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.ProductComponents.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetDetailComponentStatic([FromBody] ProductComponent obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var objNew = session.ProductComponents.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.Code.Equals(obj.Code) && !x.IsDeleted);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateComponent([FromBody] ProductComponent obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var objUpdate = _context.ProductComponents.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.Code.Equals(obj.Code) && !x.IsDeleted);
                    if (objUpdate == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                    }
                    else
                    {
                        objUpdate.Name = obj.Name;
                        objUpdate.Quantity = obj.Quantity;
                        objUpdate.Unit = obj.Unit;

                        objUpdate.UpdatedTime = DateTime.Now;
                        objUpdate.UpdatedBy = ESEIM.AppContext.UserName;

                        _context.ProductComponents.Update(objUpdate);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _stringLocalizer["MLP_MSG_EDIT_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult UpdateComponentStatic([FromBody] ProductComponent obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var parent = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == obj.ProductCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var objUpdate = session.ProductComponents.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.Code.Equals(obj.Code) && !x.IsDeleted);
                    if (objUpdate == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                    }
                    else
                    {
                        objUpdate.Name = obj.Name;
                        objUpdate.Quantity = obj.Quantity;
                        objUpdate.Unit = obj.Unit;

                        objUpdate.UpdatedTime = DateTime.Now;
                        objUpdate.UpdatedBy = ESEIM.AppContext.UserName;

                        //_context.ProductComponents.Update(objUpdate);

                        HttpContext.SetSessionUser(session);
                        msg.Error = false;
                        msg.Title = _stringLocalizer["MLP_MSG_EDIT_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["MLP_MSG_CATEGORY_NOEXISTED_REFRESH"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteComponent(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.ProductComponents.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    objNew.DeletedTime = DateTime.Now;
                    objNew.DeletedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = true;

                    _context.ProductComponents.Update(objNew);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult DeleteComponentStatic([FromBody] ProductComponent obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var objNew = _context.ProductComponents.FirstOrDefault(x => x.ProductCode.Equals(obj.ProductCode) && x.Code.Equals(obj.Code) && !x.IsDeleted);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    objNew.DeletedTime = DateTime.Now;
                    objNew.DeletedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = true;

                    //session.ProductComponents.Update(objNew);

                    HttpContext.SetSessionUser(session);
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        #endregion

        #region SessionStatic

        private (List<ProductAttrGalaxy> galaxies, List<ProductComponent> components) UpdateSessionStatic(JtableAttributeModel jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            session.ProductCustomUuid = jTablePara.Uuid;
            session.ProductAttrGalaxys = _context.ProductAttrGalaxys
                .Where(x => x.ProductCode == jTablePara.ProductCode && x.IsDeleted == false).ToList();
            session.ProductComponents = _context.ProductComponents
                .Where(x => x.ProductCode == jTablePara.ProductCode && x.IsDeleted == false).ToList();
            HttpContext.SetSessionUser(session);
            return (session.ProductAttrGalaxys, session.ProductComponents);
        }
        #endregion

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcel([FromBody] JTableModelCustom jTablePara)
        {
            var msg = new JMessage();
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            // Create a StringBuilder to construct SQL condition
            var sqlStringBuilder = new StringBuilder("SELECT Id FROM MATERIAL_PRODUCT " +
                "CROSS APPLY (    SELECT TOP 1 *    FROM OPENJSON(JSON_STATUS)    " +
                "WITH (        " +
                "ActTime DATETIME2(7) '$.ActTime',        " +
                "SupCode NVARCHAR(50) '$.SupCode',        " +
                "CusCode NVARCHAR(50) '$.CusCode'    ) " +
                "AS JsonData     ORDER BY ActTime DESC) " +
                "AS LastJsonData WHERE JSON_STATUS IS NOT NULL");

            List<object> parameters = new List<object>();

            // Check and append condition for CusCode
            if (!string.IsNullOrEmpty(jTablePara.CusCode))
            {
                parameters.Add(jTablePara.CusCode);
                sqlStringBuilder.Append($" AND LastJsonData.CusCode = {{{parameters.Count - 1}}}");
            }

            // Check and append condition for SupCode
            if (!string.IsNullOrEmpty(jTablePara.SupCode))
            {
                parameters.Add(jTablePara.SupCode);
                sqlStringBuilder.Append($" AND LastJsonData.SupCode = {{{parameters.Count - 1}}}");
            }


            // Finalize the SQL query string
            var sqlQuery = sqlStringBuilder.ToString();

            //var directQueryTest = _context.MaterialProducts
            //.FromSql("SELECT * FROM MATERIAL_PRODUCT WHERE JSON_STATUS IS NOT NULL AND JSON_STATUS LIKE '%ABCXYZ%'")
            //.ToList();

            var queryJson = _context.MaterialProducts
                                 .FromSql(sqlQuery, parameters.ToArray())
                                 .Select(mp => mp.Id);
            var listData = (from a in _context.MaterialProducts.AsNoTracking()
                            join b in _context.MaterialProductGroups on a.GroupCode equals b.Code into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.MaterialTypes on a.TypeCode equals c.Code into c1
                            from c in c1.DefaultIfEmpty()
                            join d in _context.CommonSettings on a.Unit equals d.CodeSet into d2
                            from d1 in d2.DefaultIfEmpty()
                            where !a.IsDeleted
                                && (string.IsNullOrEmpty(jTablePara.Code) || (a.ProductCode.ToLower().Contains(jTablePara.Code.ToLower()) || a.ProductName.ToLower().Contains(jTablePara.Code.ToLower())))
                                && (string.IsNullOrEmpty(jTablePara.Name) || a.ProductName.ToLower().Contains(jTablePara.Name.ToLower()))
                                && ((fromDate == null) || (a.CreatedTime.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime.Date <= toDate))
                                && (string.IsNullOrEmpty(jTablePara.Group) || (a.GroupCode != null && a.GroupCode == jTablePara.Group))
                                && (string.IsNullOrEmpty(jTablePara.Type) || (a.TypeCode != null && a.TypeCode == jTablePara.Type))
                                && (string.IsNullOrEmpty(jTablePara.Status) || (a.Status == jTablePara.Status))
                                && (string.IsNullOrEmpty(jTablePara.Catalogue) || (a.ProductCode == jTablePara.Catalogue))
                                && ((string.IsNullOrEmpty(jTablePara.CusCode) && string.IsNullOrEmpty(jTablePara.SupCode)) ||
                                    (!string.IsNullOrEmpty(a.JsonStatus) && queryJson.Contains(a.Id)))
                            //join b in _context.PAreaCategoriesStore.Where(x => x.IsDeleted == false) on a.CategoryCode equals b.PAreaCode
                            orderby a.GroupCode
                            select new ExcelMaterialProductModel
                            {
                                Id = a.Id,
                                ProductCode = a.ProductCode,
                                ProductName = a.ProductName,
                            }).ToList();
            var filePath = "/files/Template/temp-material-product.xlsx";

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
                var countAdd = listData.Count;
                if (countAdd > 0)
                    sheetRequest.InsertRow(4, countAdd);
                var row = 3;

                var countAddComponent = listData.Count;
                if (countAddComponent > 0)
                    sheetRequest.InsertRow(row, countAddComponent);

                var id = 1;
                for (int j = 0; j < listData.Count; j++)
                {
                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                    sheetRequest.Range["A" + row].Value2 = id;
                    sheetRequest.Range["B" + row].Value2 = listData[j].ProductCode;
                    sheetRequest.Range["C" + row].Value2 = listData[j].ProductName;
                    //sheetRequest.Range["D" + row].Value2 = listData[j].Unit;
                    //sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                    //sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                    sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                    row++;
                    id++;
                }
                workbook.SetSeparators('.', '.');

                var fileName = "DanhSachSanPham-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
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

        public class ExcelMaterialProductModel
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_attrMainLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerGroup.GetAllStrings().Select(x => new { x.Name, x.Value }))
                 .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class JtableAttributeModel : JTableModel
        {
            public string ProductCode { get; set; }
            public string Uuid { get; set; }
        }
        public class JtableExtendModel : JTableModel
        {
            public string ProductCode { get; set; }
            public string AttributeCode { get; set; }
        }

        public class JTableProductFile : JTableModel
        {
            public string ProductCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class MaterialProductRes
        {
            public int id { get; set; }
            public string productcode { get; set; }
            public string productname { get; set; }
            public string unit { get; set; }
            public string productgroup { get; set; }
            public string producttype { get; set; }
            public string pathimg { get; set; }
            public string material { get; set; }
            public string pattern { get; set; }
            public string note { get; set; }
            public string sBarCode { get; set; }
            public string sQrCode { get; set; }
            public string supplier { get; set; }
            public string brand { get; set; }
            public string serial { get; set; }
            public string jsonStatus { get; set; }
            public string mappingCode { get; set; }
            public string cusName { get; set; }
            public string supName { get; set; }
            public MpStatus mpStatus { get; set; }
        }
        public class JTableModelFile : JTableModel
        {
            public string ProductCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        public class ReadProductAttributeExcelImp
        {

            public string Code1 { get; set; }
            public string Code2 { get; set; }
            public string Code3 { get; set; }
            public string Code4 { get; set; }
            public string ProductCode { get; set; }
            public string AttributeCode { get; set; }

            public string Page { get; set; }
            public string Category { get; set; }
            public string Width { get; set; }
            public string Length { get; set; }
            public string Weight { get; set; }
            public string VerticalStroke { get; set; }
            public string HorizontalStroke { get; set; }
            public string Note { get; set; }
            public string ESekou { get; set; }
            public string Sx2021 { get; set; }
            public string AntiMold { get; set; }

            public string AntiFouling { get; set; }
            public string AntiBacteria { get; set; }
            public string Deodorant { get; set; }
            public string HumidityControl { get; set; }
            public string HardPaperSurface { get; set; }
            public string FireSpread { get; set; }
            public string Status { get; set; }


            //Glasss 
            public string Inheritance { get; set; }
            public string PricePerM2 { get; set; }
            public string PricePerM { get; set; }
            public string Unit { get; set; }
            public string AntiScatter { get; set; }
            public string UVProtection { get; set; }
            public string InsectRepellent { get; set; }
            public string BrigthnessControl { get; set; }
            public string HeatReflection { get; set; }
            public string OutsideInstallation { get; set; }
            public string StrongCoated { get; set; }
            public string LowReflection { get; set; }
            //
            public string Material { get; set; }
            public string Origin { get; set; }

            //
            public string Deep { get; set; }
            public string ChemicalResistance { get; set; }
            public string Antistatic { get; set; }
            public string Wax { get; set; }
            public string OutSide { get; set; }
            public string AntiShock { get; set; }
            public string ObjectMoving { get; set; }
            public string Type { get; set; }
            //carpet
            public string CountPerBox { get; set; }
            public string M2PerBox { get; set; }
            public string TotalDeep { get; set; }
            public string Structure { get; set; }
            public string TextileType { get; set; }
            public string Gauge { get; set; }
            public string GaugeUnit { get; set; }
            public string Sticth { get; set; }

            public string SticthUnit { get; set; }
            public string Formaldehyde { get; set; }
            public string Friendly { get; set; }
            public string ECO_MARK { get; set; }
            public string JIS { get; set; }
            public string CRI { get; set; }
            public string TravelDensity { get; set; }

        }
    }
}