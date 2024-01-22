using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using static Dropbox.Api.Paper.ListPaperDocsSortBy;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductQRCodeManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ProductQRCodeManagerController> _stringLocalizer;
        private readonly IStringLocalizer<EDMSQRCodeManagerController> _stringLocalizerQRCODE;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;

        public ProductQRCodeManagerController(
            EIMDBContext context,
            IStringLocalizer<ProductQRCodeManagerController> stringLocalizer,
            IStringLocalizer<EDMSQRCodeManagerController> stringLocalizerQRCODE,
            IStringLocalizer<SharedResources> sharedResources,
            IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerQRCODE = stringLocalizerQRCODE;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        [Breadcrumb("ViewData.CrumbQrManage", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListWareHouseHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbNormalWHHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbQrManage"] = _sharedResources["COM_CRUMB_PROD_QRCODE"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody] JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = /*from a in _context.ProductQrCodes*/
                        from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.IdImpProduct equals d.Id
                        where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && c != null && (c.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || c.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                            //&& (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                            && (string.IsNullOrEmpty(jTablePara.ImpCode) || d.TicketCode.Equals(jTablePara.ImpCode))
                            && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                        orderby a.Id descending
                        select new ProductQrCodeRes
                        {
                            Id = a.Id,
                            Code = a.ProductQrCode,
                            QrCode = a.ProductQrCode,
                            Count = a.Quantity,
                            ProductNo = a.ProductNo,
                            CreatedBy = (b != null ? b.GivenName : ""),
                            CreatedTime = a.CreatedTime,
                            ProductName = (c != null ? c.ProductName : ""),
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "QrCode", "QR_Code", "Count", "CreatedBy", "CreatedTime", "ProductName");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult GetLotProduct()
        {
            var data = from a in _context.LotProducts
                       where a.IsDeleted == false
                       select new
                       {
                           Code = a.LotProductCode,
                           Name = a.LotProductName
                       };
            return Json(data.ToList());
        }
        [HttpPost]
        public JsonResult GetImp()
        {
            var data = from a in _context.ProductImportHeaders
                       where a.IsDeleted == false
                       orderby a.Id descending
                       select new
                       {
                           Code = a.TicketCode,
                           Name = a.Title
                       };
            return Json(data.ToList());
        }
        [AllowAnonymous]
        [HttpPost]
        public object GetListQrCodeBySearch([FromBody] JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.ProductQrCodes
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product)
                            && (a.ProductCode.ToLower().Contains(jTablePara.Product.ToLower())
                            || (c != null && c.ProductName.ToLower().Contains(jTablePara.Product.ToLower())))))
                            && (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                            && (string.IsNullOrEmpty(jTablePara.ImpCode) || a.ImpCode.Equals(jTablePara.ImpCode))
                            && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                            && a.Enable == true
                        orderby a.Id ascending
                        select new ProductQrCodeRes
                        {
                            Id = a.Id,
                            Code = a.QrCode,
                            QrCode = a.QrCode,
                            Count = a.Count,
                            CreatedBy = (b != null ? b.GivenName : ""),
                            CreatedTime = a.CreatedTime,
                            ProductCode = a.ProductCode,
                            ProductName = (c != null ? c.ProductName : ""),
                            Serial = (c != null ? c.Serial : ""),
                            JsonLog = a.JsonLog
                        };

            var count = query.Count();
            var data = query.AsNoTracking().ToList().OrderBy(x => int.Parse(x.Code));
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            return Json(data);
        }
        [HttpPost]
        public async Task<JMessage> GenerateQrCodes(string groupCode, string productNo, string qrcodeNo)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var listProdNo = new List<ProdStrNo>();
            try
            {
                listProdNo = ListProdStrNoHelper.GetListProdStrNo(productNo);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            var listQrcodeNo = new List<ProdStrNo>();
            try
            {
                listQrcodeNo = ListProdStrNoHelper.GetListProdStrNo(qrcodeNo);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            if (string.IsNullOrEmpty(groupCode))
            {
                msg.Error = true;
                msg.Title = "Mã nhóm vật tư không hợp lệ!";
                return msg;
            }
            if (listProdNo.Count == 0)
            {
                msg.Error = true;
                msg.Title = "Thứ tự sp không hợp lệ!";
                return msg;
            }
            if (listQrcodeNo.Count == 0)
            {
                msg.Error = true;
                msg.Title = "Thứ tự qr không hợp lệ!";
                return msg;
            }
            var listQrcodeFlat = listQrcodeNo.ToFlatInt();
            var listProductFlat = listProdNo.ToFlatInt();
            if (listQrcodeFlat.Count != listProductFlat.Count)
            {
                msg.Error = true;
                msg.Title = "Số lượng sp phải bằng số lượng qr!";
                return msg;
            }
            var listQrCode = _context.ProductQrCodes.ToList();
            var count = listQrCode.Count;
            var listAdd = listProductFlat.Select((x, i) => new
            {
                Value = x.ToString("000000"),
                Code = listQrcodeFlat[i].ToString()
            }).ToList();

            var isExist = listQrCode.Any(x => listAdd.Any(y => y.Code == x.QrCode || groupCode + "." + y.Value == x.ProductCode));
            if (isExist)
            {
                msg.Error = true;
                msg.Title = "Thứ tự đã tồn tại!";
                return msg;
            }
            //_context.ProductQrCodes.AddRange(listAdd
            //    .Select(x => new ProductQrCode
            //    {
            //        QrCode = x.Code,
            //        ProductCode = groupCode + "." + x.Value,
            //        Count = 0,
            //        CreatedBy = ESEIM.AppContext.UserName,
            //        CreatedTime = DateTime.Now,
            //        Enable = true
            //    }).OrderBy(x => x.QrCode));
            //_context.SaveChanges();
            foreach (var item in listAdd
                .Select(x => new ProductQrCode
                {
                    QrCode = x.Code,
                    ProductCode = groupCode + "." + x.Value,
                    Count = 0,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Enable = true
                }).OrderBy(x => x.QrCode))
            {
                _context.ProductQrCodes.Add(item);
                await _context.SaveChangesAsync();
            }
            msg.Title = "Sinh mã QR thành công!";
            return msg;
        }

        [HttpPost]
        public JMessage UpdateQRCode([FromBody] ProductQrCodeUpdate data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var check = _context.ProductQrCodes.FirstOrDefault(x => x.Id == data.Id);
            var checkProduct = _context.MaterialProducts.FirstOrDefault(x => x.ProductCode == data.ProductCode && !x.IsDeleted);
            var checkExist = _context.ProductQrCodes.FirstOrDefault(x => x.ProductCode == data.ProductCode);
            if (checkProduct == null)
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy sản phẩm!";
                return msg;
            }
            if (checkExist != null)
            {
                msg.Error = true;
                msg.Title = "Sản phẩm đã được gán mã!";
                return msg;
            }
            if (check != null)
            {
                check.ProductCode = data.ProductCode;
                msg.Title = "Cập nhật thành công";
                _context.SaveChanges();
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy mã Qr!";
                return msg;
            }
            return msg;
        }

        [HttpPut]
        public IActionResult MarkQrCodes([FromBody] List<int> listId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                foreach (var id in listId)
                {
                    var obj = _context.ProductQrCodes.FirstOrDefault(x => x.Id == id);
                    obj.Count++;
                    obj.ListLog = new List<JsonLog>() { new JsonLog()
                            {
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                            }
                        };
                    //if (obj.ListLog == null)
                    //{
                    //    obj.ListLog = new List<JsonLog>() { new JsonLog()
                    //        {
                    //            CreatedBy = ESEIM.AppContext.UserName,
                    //            CreatedTime = DateTime.Now,
                    //        }
                    //    };
                    //}
                    //else
                    //{
                    //    obj.ListLog.Add(new JsonLog()
                    //    {
                    //        CreatedBy = ESEIM.AppContext.UserName,
                    //        CreatedTime = DateTime.Now,
                    //    });
                    //}
                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Ok(msg);
        }

        [AllowAnonymous]
        [HttpPost]
        public object ExportExcel([FromBody] JTableProductQRCodeModel jTablePara)
        {
            var msg = new JMessage();
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var listData = (from a in _context.ProductQrCodes
                            join b in _context.Users on a.CreatedBy equals b.UserName into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c2
                            from c in c2.DefaultIfEmpty()
                            where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && c != null && (c.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || c.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                                && (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                                && (string.IsNullOrEmpty(jTablePara.ImpCode) || a.ImpCode.Equals(jTablePara.ImpCode))
                                && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                            orderby a.Id ascending
                            select new ProductQrCodeRes
                            {
                                Id = a.Id,
                                Code = a.QrCode,
                                QrCode = a.QrCode,
                                Count = a.Count,
                                CreatedBy = (b != null ? b.GivenName : ""),
                                CreatedTime = a.CreatedTime,
                                ProductCode = a.ProductCode,
                                ProductName = (c != null ? c.ProductName : "")
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
                sheetRequest.Range["C1"].Value2 = "Mã SP";
                for (int j = 0; j < listData.Count; j++)
                {
                    //sheetRequest.Range["A1"].Value2 = string.Format("{0} {1}", "TỔNG HỢP CHẤM DỨT NĂM", string.IsNullOrEmpty(listData.FirstOrDefault().Year) ? DateTime.Now.Year.ToString() : listData.FirstOrDefault().Year);
                    sheetRequest.Range["A" + row].Value2 = id;
                    sheetRequest.Range["B" + row].Value2 = listData[j].Code;
                    sheetRequest.Range["C" + row].Value2 = listData[j].ProductCode;
                    //sheetRequest.Range["D" + row].Value2 = listData[j].Unit;
                    //sheetRequest.Range["E" + row].Value2 = listData[j].Group;
                    //sheetRequest.Range["F" + row].Value2 = listData[j].Type;
                    sheetRequest.Range["A" + row + ":V" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                    sheetRequest.Range["B" + row].CellStyle.HorizontalAlignment = ExcelHAlign.HAlignLeft;
                    row++;
                    id++;
                }
                workbook.SetSeparators('.', '.');

                var fileName = "DanhSachQrSanPham-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
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
        [HttpPost]
        public object ExportExcelInStock([FromBody] JTableProductQRCodeModel jTablePara)
        {
            var msg = new JMessage();
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listData = (from a in _context.ProductInStocks.Where(x => !x.IsDeleted)
                            join b in _context.Users on a.CreatedBy equals b.UserName into b1
                            from b in b1.DefaultIfEmpty()
                            join c in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals c.ProductCode into c2
                            from c in c2.DefaultIfEmpty()
                            join d in _context.ProductImportDetails.Where(x => !x.IsDeleted) on a.IdImpProduct equals d.Id
                            where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && c != null && (c.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || c.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                                //&& (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                                && (string.IsNullOrEmpty(jTablePara.ImpCode) || d.TicketCode.Equals(jTablePara.ImpCode))
                                && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                                && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                            orderby a.Id descending
                            select new ProductQrCodeRes
                            {
                                Id = a.Id,
                                Code = a.ProductQrCode,
                                QrCode = a.ProductQrCode,
                                Count = a.Quantity,
                                ProductNo = a.ProductNo,
                                CreatedBy = (b != null ? b.GivenName : ""),
                                CreatedTime = a.CreatedTime,
                                ProductName = (c != null ? c.ProductName : "")
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

                sheetRequest.Range["C1"].Value2 = "Tên SP - Id tồn kho";
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

                var fileName = "DanhSachQRSanPhamTonKho-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
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
        [HttpPost]
        public async Task<IActionResult> DeleteQrCodes([FromBody] List<int> listId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                foreach (var item in listId)
                {
                    var data = _context.ProductQrCodes.FirstOrDefault(x => x.Id == item);
                    //_context.ProductQrCodes.Remove(data);
                    data.Enable = false;
                    await _context.SaveChangesAsync();
                }
                msg.Title = "Xóa thành công!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }
            return Ok(msg);
        }
        #region Ignored
        [HttpPost]
        public object JTableOld([FromBody] JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductQrCodes
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && c != null && (c.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || c.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                            && (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                            && (string.IsNullOrEmpty(jTablePara.ImpCode) || a.ImpCode.Equals(jTablePara.ImpCode))
                            && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                        orderby a.Id descending
                        select new ProductQrCodeRes
                        {
                            Id = a.Id,
                            Code = a.QrCode,
                            QrCode = a.QrCode,
                            Count = a.Count,
                            CreatedBy = (b != null ? b.GivenName : ""),
                            CreatedTime = a.CreatedTime,
                            ProductName = (c != null ? c.ProductName : "")
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "QrCode", "QR_Code", "Count", "CreatedBy", "CreatedTime", "ProductName");
            return Json(jdata);
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerQRCODE.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
    public class JTableProductQRCodeModel : JTableModel
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Product { get; set; }
        public string LotCode { get; set; }
        public string ImpCode { get; set; }
    }
    public class ProductQrCodeRes
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string QrCode { get; set; }
        public decimal Count { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string ProductName { get; set; }
        public string ProductNo { get; set; }
        public string ProductCode { get; set; }
        public string Serial { get; set; }
        public string JsonLog { get; set; }
        public string PackName { get; set; }
        public string CurrentPos { get; set; }
        public string StatusReady { get; set; }
    }
    public class ProductQrCodeUpdate
    {
        public int Id { get; set; }
        public string ProductCode { get; set; }
        public string Serial { get; set; }
    }
}