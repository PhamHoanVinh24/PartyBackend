using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using ESEIM.Models;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.Drawing;
using System.Drawing.Imaging;
using III.Domain.Enums;
using System.Net;
using System.ComponentModel.DataAnnotations;
using Syncfusion.DocIO;
using Aspose.Pdf;
using Aspose.Pdf.Text;
using Aspose.Pdf.Annotations;
using Syncfusion.XlsIO;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ManageCVController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizer;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<CommonSettingController> _stringLocalizerCommon;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        string[] word = { ".DOC", ".DOCX" };
        string[] pdf = { ".PDF" };
        string[] excel = { ".XLSX", ".XLS" };
        public ManageCVController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<EDMSRepositoryController> stringLocalizer, IStringLocalizer<ContractController> contractController,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CommonSettingController> stringLocalizerCommon)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _contractController = contractController;
            _sharedResources = sharedResources;
            _stringLocalizerCommon = stringLocalizerCommon;

        }
        [Breadcrumb("ViewData.CrumbManageCV", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbManageCV"] = _sharedResources["COM_APPROVE_MANAGER_CV"];
            return View();
        }

       

        #region File
        [HttpPost]
        public object GetContract()
        {
            var contract = _context.PoSaleHeaders.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Code = x.ContractCode, Name = x.Title });
            return contract;
        }

        [HttpGet]
        public JsonResult GetFileImage(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileID == id);
            if (file != null)
            {
                using (System.Drawing.Image image = System.Drawing.Image.FromFile(_hostingEnvironment.WebRootPath + file.Url))
                {
                    using (MemoryStream m = new MemoryStream())
                    {
                        image.Save(m, ImageFormat.Png);
                        byte[] imageBytes = m.ToArray();
                        // Convert byte[] to Base64 String
                        string base64String = System.Convert.ToBase64String(imageBytes);
                        msg.Object = base64String;
                    }
                }
            }
            return Json(msg);
        }
        public class JtableFileModelCV : JtableFileModel
        {
            public string Candidate { get; set; }
        }
        [HttpPost]

        public object JTableFile([FromBody] JtableFileModelCV jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listType = new string[] { };
            if (jTablePara.FileType == 1)
            {
                listType = new string[] { ".jpg", ".png", ".tif", ".tiff" };
            }
            else if (jTablePara.FileType == 2)
            {
                listType = new string[] { ".docx", ".doc" };
            }
            else if (jTablePara.FileType == 3)
            {
                listType = new string[] { ".xlsm", ".xlsx", ".xlsb", ".xltx", ".xltm", ".xls", ".xlt", ".xls", ".xml", ".xml", ".xlam", ".xla", ".xlw", ".xlr" };
            }
            else if (jTablePara.FileType == 4)
            {
                listType = new string[] { ".pps", "ppt", ".pptx" };
            }
            else if (jTablePara.FileType == 5)
            {
                listType = new string[] { ".pdf" };
            }
            else if (jTablePara.FileType == 6)
            {
                listType = new string[] { ".txt" };
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (!string.IsNullOrEmpty(jTablePara.Content))
            {
                var queryLucene = SearchLuceneFile(jTablePara.Content, intBeginFor, jTablePara.Length);
                var queryDataLucene =
                    (from a in queryLucene.listLucene
                     join c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals c.FileCode
                     join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                     join d in _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted) on b.ObjectCode equals d.Code
                     join e in _context.CandiateBasic on d.CandidateCode equals e.CandidateCode
                     where (b.ObjectType == "RECRUITMENT_EXC_DETAIL" || b.ObjectType == "RECRUITMENT_EXC_HEADER")
                     where ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate)) &&
                           ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate)) 
                           && (string.IsNullOrEmpty(jTablePara.Candidate) || e.CandidateCode.ToLower().Contains(jTablePara.Candidate.ToLower()))
                     select new
                     {
                         Id = b.Id,
                         FileID = c.FileID,
                         FileName = c.FileName,
                         FullName = e.Fullname,
                         CreatedBy = c.CreatedBy,
                         CreatedTime = c.CreatedTime.Value.ToString("dd/MM/yyyy"),
                         Tags = c.Tags,
                         Content = a.Content,
                         FileTypePhysic = c.FileTypePhysic,
                         Url = c.Url,
                         FileSize = c.FileSize.HasValue ? c.FileSize.Value : 0,
                         SizeOfFile = c.FileSize.HasValue ? c.FileSize.Value : 0,
                     });
                var capacity = queryDataLucene.Sum(x => x.FileSize);
                var paggingLucene = queryDataLucene.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var countLucene = queryDataLucene.Count();
                var jdata = JTableHelper.JObjectTable(paggingLucene, jTablePara.Draw, countLucene, "FileID", "Id","FileName",
                    "CreatedBy", "CreatedTime", "FullName", "Url", "Content", "FileTypePhysic", "FileSize", "SizeOfFile");
                return Json(jdata);
            }
            else
            {
                var queryDataLucene =
                    (from c in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                     join b in _context.EDMSRepoCatFiles on c.FileCode equals b.FileCode
                     join d in _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted) on b.ObjectCode equals d.Code
                     join e in _context.CandiateBasic on d.CandidateCode equals e.CandidateCode
                     where (b.ObjectType == "RECRUITMENT_EXC_DETAIL" || b.ObjectType == "RECRUITMENT_EXC_HEADER")
                     where ((fromDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date >= fromDate)) &&
                           ((toDate == null) || (c.CreatedTime.HasValue && c.CreatedTime.Value.Date <= toDate)) 
                           && (string.IsNullOrEmpty(jTablePara.Candidate) || e.CandidateCode.ToLower().Contains(jTablePara.Candidate.ToLower()))
                     select new
                     {
                         Id = b.Id,
                         FileID = c.FileID,
                         FileName = c.FileName,
                         FullName = e.Fullname,
                         CreatedBy = c.CreatedBy,
                         CreatedTime = c.CreatedTime.Value.ToString("dd/MM/yyyy"),
                         FileTypePhysic = c.FileTypePhysic,
                         Tags = c.Tags,
                         Url = c.Url,
                         FileSize = c.FileSize.HasValue ? c.FileSize.Value : 0,
                         SizeOfFile = c.FileSize.HasValue ? c.FileSize.Value : 0,
                     });
                var capacity = queryDataLucene.Sum(x => x.FileSize);
                var paggingLucene = queryDataLucene.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var countLucene = queryDataLucene.Count();
                var jdata = JTableHelper.JObjectTable(paggingLucene, jTablePara.Draw, countLucene, "Id","FileID", "FileName",
                    "CreatedBy", "CreatedTime", "FullName", "Url", "FileTypePhysic",  "FileSize", "SizeOfFile");
                return Json(jdata);

            }
        }
        [NonAction]
        public string GetFullPathCategory(string catCode, string path, List<string> list, bool check, string realPath)
        {
            var category = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.CatCode == catCode);
            if (category != null)
            {
                list.Add(category.CatCode);
                if (!string.IsNullOrEmpty(category.CatParent) && category.CatParent != "#")
                {
                    foreach (var item in list)
                    {
                        if (item == category.CatParent)
                            check = true;
                    }

                    if (!check)
                    {
                        GetFullPathCategory(category.CatParent, path, list, check, "");
                        foreach (var item in list)
                        {
                            var cat = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.CatCode == item);
                            realPath = cat.CatName + "/" + realPath;
                        }
                    }
                }
                else
                {
                    foreach (var item in list)
                    {
                        var cat = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.CatCode == item);
                        realPath = cat.CatName + "/" + realPath;
                    }
                }
            }
            return realPath;
        }

        
       
        
       
        [HttpGet]
        public IActionResult DownloadFile(string fileCode)
        {
            var obj = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == fileCode);
            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == fileCode && !x.IsDeleted);
            if (obj != null)
            {
                var repository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == obj.ReposCode);
                if (repository != null)
                {
                    if (repository.Type == "SERVER")
                    {
                        string ftphost = repository.Server;
                        string ftpfilepath = file.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(repository.Account, repository.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            return File(fileData, file.MimeType, string.Concat(file.FileName, file.FileTypePhysic));
                        }
                    }
                    else
                    {
                        var fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                        return File(fileData, file.MimeType, string.Concat(file.FileName, file.FileTypePhysic));
                    }
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }

        [HttpPost]
        public JsonResult CreateTempFile(int Id, bool isSearch, string content)
        {
            JMessage msg = new JMessage() { Error = false };
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode
                        }
                        ).FirstOrDefault();
            if (data != null)
            {
                var fileTempName = "File_temp" + Path.GetExtension(data.FileName);

                if (!string.IsNullOrEmpty(data.Server))
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        byte[] fileData = request.DownloadData(urlEnd);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        //if (Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0 || Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                        //    path = ConvertToPdf(path, data.FileTypePhysic);
                        if (isSearch)
                        {
                            List<string> arr = new List<string>();
                            arr.Add(content);
                            if (Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                            {
                                UpdateFileWord(path, arr, data.FileTypePhysic);
                            }
                            else if (Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0)
                            {
                                UpdateFileExcel(path, arr, data.FileTypePhysic.ToUpper());
                            }
                            else if (Array.IndexOf(pdf, data.FileTypePhysic.ToUpper()) >= 0)
                            {
                                UpdateFilePdf(path, arr, data.FileTypePhysic.ToUpper());
                            }
                        }

                        msg1.Object = path.Replace("\\", "/");
                        return Json(msg1);
                    }
                }
                else
                {
                    byte[] fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                    JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                    string path = msg1.Object.ToString();
                    if (isSearch)
                    {
                        List<string> arr = new List<string>();
                        arr.Add(content);
                        if (Array.IndexOf(word, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFileWord(path, arr, data.FileTypePhysic);
                        }
                        else if (Array.IndexOf(excel, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFileExcel(path, arr, data.FileTypePhysic.ToUpper());
                        }
                        else if (Array.IndexOf(pdf, data.FileTypePhysic.ToUpper()) >= 0)
                        {
                            UpdateFilePdf(path, arr, data.FileTypePhysic.ToUpper());
                        }
                    }

                    msg1.Object = path.Replace("\\", "/");
                    return Json(msg1);
                }
            }
            return Json(msg);
        }

        [NonAction]
        private string ConvertToPdf(string pathFile, string type)
        {
            if (Array.IndexOf(excel, type.ToUpper()) >= 0)
                return ConvertExcelToPdf(pathFile);
            else if (Array.IndexOf(word, type.ToUpper()) >= 0)
                return ConvertWordToPdf(pathFile);
            return null;
        }

        [NonAction]
        private string ConvertExcelToPdf(string pathFile)
        {
            var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
            //using (ExcelEngine excelEngine = new ExcelEngine())
            //{
            //    IApplication application = excelEngine.Excel;
            //    FileStream excelStream = new FileStream(path, FileMode.Open, FileAccess.Read);
            //    IWorkbook workbook = application.Workbooks.Open(excelStream);
            //    //Initialize XlsIO renderer.
            //    XlsIORenderer renderer = new XlsIORenderer();
            //    //Convert Excel document into PDF document 
            //    PdfDocument pdfDocument = renderer.ConvertToPDF(workbook);
            //    Stream stream = new FileStream(path + ".pdf", FileMode.Create, FileAccess.ReadWrite);
            //    pdfDocument.Save(stream);
            //    excelStream.Dispose();
            //    stream.Dispose();
            //}
            return pathFile + ".pdf";
        }

        [NonAction]
        private string ConvertWordToPdf(string pathFile)
        {
            try
            {
                //var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
                //FileStream docStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                //WordDocument wordDocument = new WordDocument(docStream, Syncfusion.DocIO.FormatType.Automatic);
                //DocIORenderer render = new DocIORenderer();
                //render.Settings.ChartRenderingOptions.ImageFormat = Syncfusion.OfficeChart.ExportImageFormat.Jpeg;
                //PdfDocument pdfDocument = render.ConvertToPDF(wordDocument);
                //render.Dispose();
                //wordDocument.Dispose();
                ////Saves the PDF file
                //FileStream pdfStream = new FileStream(path + ".pdf", FileMode.Create, FileAccess.Write);
                ////MemoryStream outputStream = new MemoryStream();
                //pdfDocument.Save(pdfStream);
                //pdfStream.Close();
                //docStream.Close();
                //pdfDocument.Close();
                return pathFile + ".pdf";
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        private void UpdateFileWord(string pathFile, List<string> words, string type)
        {
            FileStream fileStream = null;
            Syncfusion.DocIO.DLS.WordDocument document = null;
            try
            {
                var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
                fileStream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite);
                document = new Syncfusion.DocIO.DLS.WordDocument(fileStream, Syncfusion.DocIO.FormatType.Automatic);
                foreach (var item in words)
                {
                    Syncfusion.DocIO.DLS.TextSelection[] textSelections = document.FindAll(item, false, true);
                    foreach (Syncfusion.DocIO.DLS.TextSelection textSelection in textSelections)
                    {
                        Syncfusion.DocIO.DLS.WTextRange textRange = textSelection.GetAsOneRange();
                        textRange.CharacterFormat.HighlightColor = Syncfusion.Drawing.Color.Yellow;
                    }
                }
                if (type.ToLower().Contains(".docx"))
                    document.Save(fileStream, FormatType.Docx);
                else
                    document.Save(fileStream, FormatType.Doc);
                fileStream.Flush();
                fileStream.Close();
                document.Close();
            }
            catch (Exception ex)
            {
                if (fileStream != null)
                    fileStream.Close();
                if (document != null)
                {
                    document.Close();
                }
            }
        }

        [NonAction]
        private void UpdateFilePdf1(string pathFile, List<string> words, string type)
        {

        }

        [NonAction]
        private void UpdateFilePdf(string pathFile, List<string> words, string type)
        {

            var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
            var document = new Document(path);
            var pages = document.Pages;
            for (var i = 1; i <= pages.Count(); ++i)
            {
                try
                {
                    var item = pages[i];
                    var tfa = new TextFragmentAbsorber(words[0], new Aspose.Pdf.Text.TextSearchOptions(false));
                    tfa.Visit(item);

                    foreach (var textFragment in tfa.TextFragments)
                    {

                        var highlightAnnotation = HighLightTextFragment(item, textFragment);
                        item.Annotations.Add(highlightAnnotation);

                    }
                }
                catch (Exception ex)
                {

                }

            }
            //foreach (var item in pages)
            //{
            //    try
            //    {
            //        var tfa = new TextFragmentAbsorber(words[0], new Aspose.Pdf.Text.TextSearchOptions(false));
            //        tfa.Visit(item);

            //        foreach (var textFragment in tfa.TextFragments)
            //        {

            //            var highlightAnnotation = HighLightTextFragment(item, textFragment);
            //            item.Annotations.Add(highlightAnnotation);

            //        }
            //    }
            //    catch (Exception ex)
            //    {

            //    }
            //}
            document.Save(path);
        }

        [NonAction]
        private void UpdateFileExcel(string pathFile, List<string> words, string type)
        {
            var path = Path.Combine(_hostingEnvironment.WebRootPath, pathFile);
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite);
                IWorkbook workbook = application.Workbooks.Open(fileStream);
                Syncfusion.XlsIO.IStyle tableHeader = workbook.Styles.Add("" + DateTime.Now.Ticks);
                tableHeader.Font.Color = ExcelKnownColors.Black;
                tableHeader.Font.Bold = true;
                //tableHeader.Font.Size = 11;
                //tableHeader.Font.FontName = "Calibri";
                //tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                //tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
                tableHeader.Color = Syncfusion.Drawing.Color.Yellow;
                //tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
                //tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;

                try
                {
                    foreach (var worksheet in workbook.Worksheets)
                    {
                        IRange[] result1 = worksheet.FindAll(words[0], ExcelFindType.Text);
                        if (result1 != null && result1.Length > 0)
                            foreach (var item in result1)
                            {
                                try
                                {
                                    if (item.DisplayText.ToLower() == words[0].ToLower())
                                    {
                                        Syncfusion.XlsIO.IStyle style = item.CellStyle;
                                        if (style == null)
                                        {
                                            style = tableHeader;
                                        }
                                        else
                                        {
                                            style.Font.Color = ExcelKnownColors.Black;
                                            style.Color = Syncfusion.Drawing.Color.Yellow;
                                        }
                                        worksheet.Range[item.AddressLocal].CellStyle = style;
                                    }
                                }
                                catch (Exception exex)
                                {
                                    var bug = "";
                                }
                            }
                    }
                    fileStream.Close();
                    fileStream = null;
                    fileStream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite);
                    workbook.SaveAs(fileStream);
                    fileStream.Dispose();
                    workbook.Close();
                }
                catch (Exception ex)
                {
                    fileStream.Close();
                    workbook.Close();
                    throw ex;
                }
            }
        }

        [NonAction]
        private HighlightAnnotation HighLightTextFragment(Page page, TextFragment textFragment)
        {
            if (textFragment.Segments.Count == 1)
                return new HighlightAnnotation(page, textFragment.Segments[1].Rectangle);

            var offset = 0;
            var quadPoints = new Aspose.Pdf.Point[textFragment.Segments.Count * 4];
            foreach (var segment in textFragment.Segments)
            {
                quadPoints[offset + 0] = new Aspose.Pdf.Point(segment.Rectangle.LLX, segment.Rectangle.URY);
                quadPoints[offset + 1] = new Aspose.Pdf.Point(segment.Rectangle.URX, segment.Rectangle.URY);
                quadPoints[offset + 2] = new Aspose.Pdf.Point(segment.Rectangle.LLX, segment.Rectangle.LLY);
                quadPoints[offset + 3] = new Aspose.Pdf.Point(segment.Rectangle.URX, segment.Rectangle.LLY);
                offset += 4;
            }

            var llx = quadPoints.Min(pt => pt.X);
            var lly = quadPoints.Min(pt => pt.Y);
            var urx = quadPoints.Max(pt => pt.X);
            var ury = quadPoints.Max(pt => pt.Y);
            return new HighlightAnnotation(page, new Aspose.Pdf.Rectangle(llx, lly, urx, ury))
            {
                Modified = DateTime.Now,
                QuadPoints = quadPoints
            };
        }

        [HttpPost]
        public JsonResult GetSupportCategory(string CatCode)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == null && x.ObjectType == null && x.CatCode == CatCode).MaxBy(x => x.Id);
                if (data != null)
                {
                    var dt = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Path == data.Path && x.ReposCode == data.ReposCode && x.CatCode == CatCode);
                    msg.Object = dt;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetItem(int Id)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var aseanDoc = new AseanDocument();
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.Server))
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        byte[] fileData = request.DownloadData(urlEnd);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        string pathConvert = "/" + path.Replace("\\", "/");
                        var extension = Path.GetExtension(path);
                        aseanDoc.File_Code = data.FileCode;
                        aseanDoc.File_Name = data.FileName;
                        aseanDoc.File_Type = data.FileTypePhysic;
                        aseanDoc.File_Path = path;
                        aseanDoc.FullPathView = ftpfilepath;
                        aseanDoc.IsEdit = data.IsEdit;
                        aseanDoc.IsFileMaster = data.IsFileMaster;
                        aseanDoc.FileParentId = data.FileParentId;

                        if (extension.Equals(".doc") || extension.Equals(".docx"))
                        {
                            DocmanController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                        {
                            ExcelController.pathFileFTP = pathConvert;
                            ExcelController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".pdf"))
                        {
                            PDFController.docmodel = aseanDoc;
                        }
                    }
                }
                else
                {
                    byte[] fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                    JMessage msg1 = _upload.UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                    string path = msg1.Object.ToString();
                    aseanDoc.File_Code = data.FileCode;
                    aseanDoc.File_Name = data.FileName;
                    aseanDoc.File_Type = data.FileTypePhysic;
                    aseanDoc.File_Path = path;
                    aseanDoc.IsEdit = data.IsEdit;
                    aseanDoc.IsFileMaster = data.IsFileMaster;
                    aseanDoc.FileParentId = data.FileParentId;
                    //DocmanController.docmodel = aseanDoc;
                    //ExcelController.docmodel = aseanDoc;
                    //PDFController.docmodel = aseanDoc;
                    var extension = Path.GetExtension(path);
                    if (extension.Equals(".doc") || extension.Equals(".docx"))
                    {
                        DocmanController.docmodel = aseanDoc;
                    }
                    else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                    {
                        ExcelController.docmodel = aseanDoc;
                    }
                    else if (extension.Equals(".pdf"))
                    {
                        PDFController.docmodel = aseanDoc;
                    }
                }
            }
            return aseanDoc;
        }

        [HttpGet]
        public object GetItemFile(int Id, bool? IsEdit, int mode)
        {
            //Kiểm tra trạng thái của file đang mở
            //TH1: Nếu đang ở trạng thái bị lock(IsEdit=false) thì thông báo cho người dùng là không được phép sửa file
            //TH2: Nếu trạng thái không bị lock(IsEdit=null hoặc IsEdit=true) thì cập nhật IsEdit=false và EditedFileTime, EditedFileBy
            var msg = new JMessage() { Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();

                var aseanDoc = new AseanDocument();
                if (data != null)
                {
                    var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileID.Equals(data.FileID));
                    var session = HttpContext.GetSessionUser();
                    var listUserEdit = new List<string>();
                    if (string.IsNullOrEmpty(data.ListUserView) && (data.IsFileMaster == true || data.IsFileMaster == null))
                    {
                        listUserEdit.Add(session.FullName);
                        edmsFile.ListUserView = JsonConvert.SerializeObject(listUserEdit);
                        edmsFile.EditedFileBy = User.Identity.Name;
                        edmsFile.EditedFileTime = DateTime.Now;
                        _context.EDMSFiles.Update(edmsFile);
                        _context.SaveChanges();
                    }
                    else if (!string.IsNullOrEmpty(data.ListUserView) && (data.IsFileMaster == true || data.IsFileMaster == null))
                    {
                        var check = JsonConvert.DeserializeObject<List<string>>(data.ListUserView);
                        msg.ID = -1;
                        msg.Error = true;
                        msg.Title = string.Format(_stringLocalizer["EDMSR_MSG_FILE_IS_EDITING_BY"], string.Join(",", check));
                        if (!check.Any(x => x.Equals(session.FullName)))
                        {
                            check.Add(session.FullName);
                            edmsFile.ListUserView = JsonConvert.SerializeObject(check);
                            edmsFile.EditedFileBy = User.Identity.Name;
                            edmsFile.EditedFileTime = DateTime.Now;
                            _context.EDMSFiles.Update(edmsFile);
                            _context.SaveChanges();
                        }
                    }

                    var fileTempName = "File_temp" + Path.GetExtension(data.FileName);

                    if (!string.IsNullOrEmpty(data.Server))
                    {
                        string ftphost = data.Server;
                        string ftpfilepath = data.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                            string path = msg1.Object.ToString();
                            string pathConvert = "/" + path.Replace("\\", "/");
                            var extension = Path.GetExtension(path);
                            aseanDoc.File_Code = data.FileCode;
                            aseanDoc.File_Name = data.FileName;
                            aseanDoc.File_Type = data.FileTypePhysic;
                            aseanDoc.File_Path = pathConvert;
                            aseanDoc.FullPathView = ftpfilepath;
                            aseanDoc.IsEdit = data.IsEdit;
                            aseanDoc.IsFileMaster = data.IsFileMaster;
                            aseanDoc.FileParentId = data.FileParentId;
                            aseanDoc.Mode = mode;
                            aseanDoc.FirstPage = "/Admin/EDMSRepository";

                            if (extension.Equals(".doc") || extension.Equals(".docx"))
                            {
                                DocmanController.docmodel = aseanDoc;
                                DocmanController.pathFile = "";
                            }
                            else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                            {
                                ExcelController.pathFileFTP = pathConvert;
                                ExcelController.docmodel = aseanDoc;
                                ExcelController.fileCode = data.FileCode;
                                DocmanController.pathFile = "";
                            }
                            else if (extension.Equals(".pdf"))
                            {
                                PDFController.docmodel = aseanDoc;
                                DocmanController.pathFile = "";
                            }
                        }
                    }
                    else
                    {
                        byte[] fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                        JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        string path = msg1.Object.ToString();
                        aseanDoc.File_Code = data.FileCode;
                        aseanDoc.File_Name = data.FileName;
                        aseanDoc.File_Type = data.FileTypePhysic;
                        aseanDoc.File_Path = path;
                        aseanDoc.IsEdit = data.IsEdit;
                        aseanDoc.IsFileMaster = data.IsFileMaster;
                        aseanDoc.FileParentId = data.FileParentId;
                        aseanDoc.Mode = mode;
                        var extension = Path.GetExtension(path);

                        if (extension.Equals(".doc") || extension.Equals(".docx"))
                        {
                            DocmanController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                        {
                            ExcelController.docmodel = aseanDoc;
                        }
                        else if (extension.Equals(".pdf"))
                        {
                            PDFController.docmodel = aseanDoc;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["EDMSR_MSG_FILE_NOT_EXIST"];
                return Json(msg);
            }

            return Json(msg);
        }

        [NonAction]
        private (IEnumerable<EDMSJtableFileModel> listLucene, int total) SearchLuceneFile(string content, int page, int length)
        {
            try
            {
                return LuceneExtension.SearchHighligh(content, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex", page, length, "Content");
            }
            catch (Exception ex)
            {
                return (new List<EDMSJtableFileModel>(), 0);
            }
        }

        [HttpGet]
        public object GetListObject(string objectType)
        {
            return (from a in _context.VAllObjects
                    where (string.IsNullOrEmpty(objectType) || (objectType == EnumHelper<All>.GetDisplayValue(All.All)) || a.ObjectType == objectType)
                    select a).AsNoTracking();
        }

        [HttpPost]
        public JsonResult PasteFile([FromBody] EDMSPasteFileModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "Dán thành công" };
            try
            {
                if (obj.Action == "Copy" || obj.Action == "Move")
                {
                    //Lấy thông tin file cũ dựa vào fileId
                    var edmsFileOld = _context.EDMSFiles.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(obj.FileIdFrom));
                    if (edmsFileOld != null)
                    {
                        //Lấy danh mục và đường dẫn của thư mục mới
                        var edmsCategoryNew = (from a in _context.EDMSCategorys.Where(x => !x.IsDeleted && x.Id.Equals(obj.CatIdTo))
                                               join b in _context.EDMSCatRepoSettings on a.CatCode equals b.CatCode
                                               select new { a.CatCode, b.ReposCode }).FirstOrDefault();

                        if (edmsCategoryNew != null)
                        {
                            var edmsCatRepoSettingNew = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode.Equals(edmsCategoryNew.CatCode) && x.ReposCode.Equals(edmsCategoryNew.ReposCode));

                            //Lấy bản ghi của file cũ
                            var edmsRepoCatFileOld = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode.Equals(edmsFileOld.FileCode));

                            switch (obj.Action)
                            {
                                case "Copy":
                                    var pathFileNewCopy = edmsCatRepoSettingNew.Path + string.Concat("/", Path.GetFileNameWithoutExtension(edmsFileOld.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8) + Path.GetExtension(edmsFileOld.FileName));
                                    //Thực hiện copy bản file cứng
                                    msg = CopyFile(edmsRepoCatFileOld.Id, pathFileNewCopy, edmsCategoryNew.ReposCode, edmsCategoryNew.CatCode, edmsFileOld.MimeType);
                                    if (!msg.Error)
                                    {
                                        var fileCodeOld = edmsFileOld.FileCode;
                                        //Nhân bản tệp ở bảng EDMS_FILE , EDMS_REPO_CAT_FILE dựa vào fileCode
                                        var edmsFileCopy = new EDMSFile
                                        {
                                            FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                                            Url = msg.Object == null ? pathFileNewCopy : null,
                                            CreatedBy = User.Identity.Name,
                                            CreatedTime = DateTime.Now,
                                            CloudFileId = msg.Object != null ? msg.Object.ToString() : null,
                                            ReposCode = edmsCatRepoSettingNew.ReposCode,

                                            DeletedBy = edmsFileOld.DeletedBy,
                                            DeletedTime = edmsFileOld.DeletedTime,
                                            Desc = edmsFileOld.Desc,
                                            EditedFileBy = edmsFileOld.EditedFileBy,
                                            EditedFileTime = edmsFileOld.EditedFileTime,
                                            FileName = edmsFileOld.FileName,
                                            FileParentId = edmsFileOld.FileParentId,
                                            FileSize = edmsFileOld.FileSize,
                                            FileTypePhysic = edmsFileOld.FileTypePhysic,
                                            FileTypeWork = edmsFileOld.FileTypeWork,
                                            IsDeleted = edmsFileOld.IsDeleted,
                                            IsEdit = edmsFileOld.IsEdit,
                                            IsFileMaster = edmsFileOld.IsFileMaster,
                                            IsScan = edmsFileOld.IsScan,
                                            ListUserView = edmsFileOld.ListUserView,
                                            MetaDataExt = edmsFileOld.MetaDataExt,
                                            MimeType = edmsFileOld.MimeType,
                                            NumberDocument = edmsFileOld.NumberDocument,
                                            Tags = edmsFileOld.Tags,
                                            UpdatedBy = edmsFileOld.UpdatedBy,
                                            UpdatedTime = edmsFileOld.UpdatedTime,
                                        };

                                        var edmsRepoCatFileCopy = new EDMSRepoCatFile
                                        {
                                            CatCode = edmsCatRepoSettingNew.CatCode,
                                            FileCode = edmsFileCopy.FileCode,
                                            ReposCode = edmsCatRepoSettingNew.ReposCode,
                                            FolderId = edmsCatRepoSettingNew.FolderId,
                                            ObjectCode = null,
                                            ObjectType = null,
                                            Path = edmsCatRepoSettingNew.Path,
                                        };

                                        _context.EDMSFiles.Add(edmsFileCopy);
                                        _context.EDMSRepoCatFiles.Add(edmsRepoCatFileCopy);
                                        _context.SaveChanges();
                                    }
                                    else
                                    {
                                        return Json(msg);
                                    }
                                    break;

                                case "Move":
                                    var pathFileNew = edmsCatRepoSettingNew.Path + string.Concat("/", Path.GetFileNameWithoutExtension(edmsFileOld.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8) + Path.GetExtension(edmsFileOld.FileName));

                                    //Thực hiện copy bản file cứng
                                    msg = CopyFile(edmsRepoCatFileOld.Id, pathFileNew, edmsCategoryNew.ReposCode, edmsCategoryNew.CatCode, edmsFileOld.MimeType);
                                    msg = MoveFile(edmsRepoCatFileOld.Id);

                                    if (!msg.Error)
                                    {
                                        //Nhân bản tệp ở bảng EDMS_FILE , EDMS_REPO_CAT_FILE dựa vào fileCode
                                        edmsFileOld.Url = pathFileNew;

                                        edmsRepoCatFileOld.ReposCode = edmsCatRepoSettingNew.ReposCode;
                                        edmsRepoCatFileOld.CatCode = edmsCatRepoSettingNew.CatCode;
                                        edmsRepoCatFileOld.Path = edmsCatRepoSettingNew.Path;

                                        _context.EDMSFiles.Update(edmsFileOld);
                                        _context.EDMSRepoCatFiles.Update(edmsRepoCatFileOld);
                                        _context.SaveChanges();
                                    }

                                    break;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Không tìm thấy thư mục";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public JMessage CopyFile(int idRepoCatFile, string urlFile, string repoCodeTo, string catCodeTo, string contentType)
        {
            var msg = new JMessage() { Error = false, Title = "Sao chép thành công" };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                ReposCode = (b != null ? b.ReposCode : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId,
                            }).FirstOrDefault();

                if (data != null)
                {
                    var fileNameUpload = Path.GetFileName(urlFile);
                    var fileBytes = DownloadFileFromServer(idRepoCatFile);
                    msg = UploadFileToServer(fileBytes, repoCodeTo, catCodeTo, fileNameUpload, contentType);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return msg;
            }

            return msg;
        }

        [NonAction]
        public JMessage MoveFile(int idRepoCatFile)
        {
            var msg = new JMessage() { Error = false, Title = "Di chuyển thành công" };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == idRepoCatFile);
                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);

                //LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
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
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return msg;
            }

            return msg;
        }

        [NonAction]
        public byte[] DownloadFileFromServer(int idRepoCatFile)
        {
            byte[] fileStream = new byte[0];

            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            ReposCode = (b != null ? b.ReposCode : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                fileStream = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
            }

            return fileStream;
        }

        [NonAction]
        public JMessage UploadFileToServer(byte[] fileByteArr, string repoCode, string catCode, string fileName, string contentType)
        {
            var msg = new JMessage() { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var data = (from a in _context.EDMSCatRepoSettings.Where(x => x.ReposCode.Equals(repoCode) && x.CatCode.Equals(catCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                a.Path,
                                a.FolderId,
                                b.Account,
                                b.PassWord,
                            }).FirstOrDefault();

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repoCode);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    var fileBytes = fileByteArr;
                    var urlFile = string.Concat(data.Path, "/", fileName);
                    var urlFileServer = System.Web.HttpUtility.UrlPathEncode("ftp://" + data.Server + urlFile);
                    var result = FileExtensions.UploadFileToFtpServer(urlFileServer, urlFileServer, fileBytes, data.Account, data.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                        return msg;
                    }
                    else if (result.Status == WebExceptionStatus.Success)
                    {
                        if (result.IsSaveUrlPreventive)
                        {
                            //urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_ERR"];
                        return msg;
                    }
                }
                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    Stream stream = new MemoryStream(fileByteArr);
                    msg.Object = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileName, stream, contentType, data.FolderId);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return msg;
        }

        [HttpPost]
        public object GetListUser()
        {
            var data = from a in _context.PlanExcuteRecruitmentDetails.Where(x=>!x.IsDeleted)
                       join b in _context.CandiateBasic on a.CandidateCode equals b.CandidateCode
                       select new
                        { Code = b.CandidateCode, Name = b.Fullname};
            return data;
        }

        [HttpPost]
        public JsonResult InsertFileShare([FromBody] FileShareModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                Url = (c != null ? c.Url : null),
                                FileId = (c != null ? c.CloudFileId : null),
                                FileTypePhysic = c.FileTypePhysic,
                                c.FileName,
                                c.MimeType,
                                b.Account,
                                b.PassWord,
                                c.FileCode,
                                c.IsEdit,
                                c.IsFileMaster,
                                c.FileParentId
                            }).FirstOrDefault();

                if (data != null)
                {
                    var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                    if (check == null)
                    {
                        var rela = new
                        {
                            ObjectType = "REPOSITORY",
                            ObjectInstance = data.Id
                        };
                        var files = new FilesShareObjectUser
                        {
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileID = data.FileCode,
                            FileCreated = User.Identity.Name,
                            FileUrl = data.Url,
                            FileName = data.FileName,
                            ObjectRelative = JsonConvert.SerializeObject(rela),
                            ListUserShare = obj.ListUserShare
                        };
                        _context.FilesShareObjectUsers.Add(files);
                    }
                    else
                    {
                        check.ListUserShare = obj.ListUserShare;

                        _context.FilesShareObjectUsers.Update(check);
                    }
                    _context.SaveChanges();
                }

                msg.Title = "Chia sẻ thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetFileShare(int id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var file = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id.Equals(id));
                if (file != null)
                {
                    var filesShare = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(file.FileCode));

                    msg.Object = filesShare;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
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
    }
}
