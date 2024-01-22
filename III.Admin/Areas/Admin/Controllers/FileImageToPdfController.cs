using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System.Collections.Generic;
using System.Net;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Syncfusion.Pdf.Graphics;
using Syncfusion.Pdf;
using Syncfusion.Drawing;
using Syncfusion.OCRProcessor;
using Syncfusion.Pdf.Parsing;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using System.Text;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIO;
using System.Drawing;
using SizeF = Syncfusion.Drawing.SizeF;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FileImageToPdfController : BaseController
    {
        public class AssetAtivitysJtableModel
        {
            public int ActivityId { get; set; }
            public string ActCode { get; set; }
            public string ActTitle { get; set; }
            public string ActType { get; set; }
            public string ActNote { get; set; }
            public string ActMember { get; set; }
        }

        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        public FileImageToPdfController(EIMDBContext context, IStringLocalizer<EDMSRepositoryController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }
        [Breadcrumb("ViewData.CrumbAssetAct", AreaName = "Admin", FromAction = "Index", FromController = typeof(NomalListAssetHomeController))]

        #region Index
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbNormalAssetHome"] = _sharedResources["COM_BREAD_CRUMB_COMMON_CATE"];
            ViewData["CrumbAssetAct"] = "Chuyển đổi ảnh";
            return View();
        }
        [HttpPost]
        public object JTableFile([FromBody]JtableFileModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listType = new string[] { };
            listType = new string[] { ".jpg", ".png", ".tif", ".tiff", ".pdf" };
            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                               .Select(p => new
                                                               {
                                                                   p.FileID,
                                                                   p.ListUserShare,
                                                                   p.UserShares
                                                               }).ToList();
            var session = HttpContext.GetSessionUser();
            var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                          join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                          join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                          from d in d2.DefaultIfEmpty()
                          join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                          from e in e1.DefaultIfEmpty()
                          where listType.Any(x => x.Equals(a.FileTypePhysic.ToLower())) &&
                          (listFileByUser.Any(x => x.FileID.Equals(a.FileCode)) || a.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                          select new { a, b, d, e });
            var capacity = query2.Sum(x => x.a.FileSize.Value);
            var query = query2.OrderByDescending(x => x.a.FileID).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                         join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                         where listType.Any(x => x.Equals(a.FileTypePhysic.ToLower())) &&
                         (listFileByUser.Any(x => x.FileID.Equals(a.FileCode)) || a.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                         select a).AsNoTracking().Count();
            var list = query.Select(x => new
            {
                Id = x.b != null ? x.b.Id : -1,
                x.a.FileID,
                x.a.FileName,
                x.a.FileTypePhysic,
                x.a.CreatedBy,
                x.a.CreatedTime,
                x.a.Tags,
                x.a.Url,
                x.a.MimeType,
                ReposName = x.d != null ? x.d.ReposName : "",
                x.a.CloudFileId,
                ServerAddress = x.d != null ? x.d.Server : "",
                Category = x.b != null ? x.b.CatCode : "",
                FileSize = capacity,
                SizeOfFile = x.a.FileSize.HasValue ? x.a.FileSize.Value : 0,
                CatName = GetFullPathCategory(x.b.CatCode, "", new List<string>(), false, ""),
                UpdateTime = x.a.EditedFileTime.HasValue ? x.a.EditedFileTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                MetaDataExt = x.a.MetaDataExt,
                Count = count
            }).ToList();
            var jdata = JTableHelper.JObjectTable(list, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy",
                "CreatedTime", "Tags", "Url", "MimeType", "Id", "ReposName", "CloudFileId", "ServerAddress", "Category", "FolderName",
                "FileSize", "SizeOfFile", "CatName", "UpdateTime", "MetaDataExt", "Count");
            return Json(jdata);
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

        [HttpPost]
        public JsonResult ConvertImageToPdf(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == id)
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
                                a.ReposCode,
                                a.Path,
                                a.CatCode
                            }).FirstOrDefault();
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
                            msg1.Object = Path.Combine(_hostingEnvironment.WebRootPath, path);
                            var pathFilePdf = ConvertToPdf(msg1.Object.ToString(), data.FileName);
                            UploadFileConvertToServer(pathFilePdf, data.Server, data.Account, data.PassWord, data.ReposCode,
                                data.CatCode, data.Path);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        private string ConvertToPdf(string path, string fileName)
        {
            PdfDocument document = new PdfDocument();
            Stream fileStreamPath = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            PdfImage image = PdfImage.FromStream(fileStreamPath);

            PdfSection section = document.Sections.Add();
            section.PageSettings.Width = image.PhysicalDimension.Width;
            section.PageSettings.Height = image.PhysicalDimension.Height;

            PdfPage page = section.Pages.Add();
            page.Graphics.DrawImage(image, new Syncfusion.Drawing.PointF(0, 0), new SizeF(page.Size.Width, page.Size.Height));

            //Saving the PDF to the MemoryStream
            MemoryStream stream = new MemoryStream();
            //Set the position as '0'.
            stream.Position = 0;
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + Path.GetFileNameWithoutExtension(fileName) + ".pdf";
            FileStream streamFileNew = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            document.Save(streamFileNew);
            stream.Close();
            fileStreamPath.Close();
            streamFileNew.Close();
            return pathFile;
        }

        [NonAction]
        private ModelFilePdfConvert UploadFileConvertToServer(string path, string server, string account, string pass,
            string reposCode, string catCode, string pathSetting)
        {
            var urlFile = "";
            Stream fileStreamPath = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using (var ms = new MemoryStream())
            {
                fileStreamPath.CopyTo(ms);
                var fileBytes = ms.ToArray();
                urlFile = pathSetting + Path.Combine("/", Path.GetFileName(path));
                var urlFilePreventive = pathSetting + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + Path.GetFileName(path));
                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + server + urlFile);
                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + server + urlFilePreventive);
                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, account, pass);
                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                {
                    //msg.Error = true;
                    //msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                    //return Json(msg);
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
                    //msg.Error = true;
                    //msg.Title = _sharedResources["COM_MSG_ERR"];
                    //return Json(msg);
                }
            }

            var edmsReposCatFile = new EDMSRepoCatFile
            {
                FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                ReposCode = reposCode,
                CatCode = catCode,
                ObjectCode = "",
                ObjectType = "",
                Path = pathSetting,
                FolderId = ""
            };
            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

            //add File
            var file = new EDMSFile
            {
                FileCode = edmsReposCatFile.FileCode,
                FileName = Path.GetFileName(path),
                Desc = "",
                ReposCode = reposCode,
                Tags = "",
                FileSize = fileStreamPath.Length,
                FileTypePhysic = Path.GetExtension(path),
                NumberDocument = "",
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                Url = urlFile,
                MimeType = "application/pdf",
                CloudFileId = "",
                IsScan = false,
                MetaDataExt = "",
            };
            _context.EDMSFiles.Add(file);
            _context.SaveChanges();
            fileStreamPath.Close();
            return new ModelFilePdfConvert
            {
                UrlFile = urlFile,
                FileCode = edmsReposCatFile.FileCode
            };
        }
        public class ModelFilePdfConvert
        {
            public string UrlFile { get; set; }
            public string FileCode { get; set; }
        }

        [HttpPost]
        public JsonResult PerformOCR(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Get file
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == id)
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
                                a.ReposCode,
                                a.Path,
                                a.CatCode
                            }).FirstOrDefault();
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
                            msg1.Object = Path.Combine(_hostingEnvironment.WebRootPath, path);
                            OCRPdf(msg1.Object.ToString(), data.Url, data.FileCode, data.Path, data.ReposCode, data.CatCode);
                            msg.Title = "OCR thành công";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        private void OCRPdf(string pathTemp, string url, string fileCode, string pathFtp, string repoCode, string catCode)
        {
            string binaries = Path.Combine(_hostingEnvironment.ContentRootPath, "OCR/TesseractBinaries", "Windows");

            //Initialize OCR processor with tesseract binaries.
            OCRProcessor processor = new OCRProcessor(binaries);

            //Set language to the OCR processor.
            processor.Settings.Language = "vie";
            string path = Path.Combine(_hostingEnvironment.ContentRootPath, "OCR/Data", "times-new-roman.ttf");
            FileStream fontStream = new FileStream(path, FileMode.Open);

            //Create a true type font to support unicode characters in PDF.
            processor.UnicodeFont = new PdfTrueTypeFont(fontStream, 8);

            //Set temporary folder to save intermediate files.
            processor.Settings.TempFolder = Path.Combine(_hostingEnvironment.ContentRootPath, "OCR/Data");

            //Load a PDF document.
            FileStream inputDocument = new FileStream(Path.Combine(_hostingEnvironment.ContentRootPath, "OCR/Data", pathTemp), FileMode.Open);
            PdfLoadedDocument loadedDocument = new PdfLoadedDocument(inputDocument);

            //Create a new compression option.
            PdfCompressionOptions options = new PdfCompressionOptions();

            //Enable the optimize font option
            options.OptimizeFont = true;

            //Enable the optimize page contents.
            options.OptimizePageContents = true;

            //Enable the compress image.
            options.CompressImages = true;

            //Set the image quality.
            options.ImageQuality = 100;

            //Assign the compression option to the document
            loadedDocument.Compress(options);

            //Perform OCR with language data.
            OCRLayoutResult result;

            string tessdataPath = Path.Combine(_hostingEnvironment.ContentRootPath, "OCR/tessdata");
            processor.PerformOCR(loadedDocument, tessdataPath, out result);

            var lines = new List<ModelLine>();
            foreach (var page in result.Pages)
            {
                foreach (var line in page.Lines)
                {
                    var words = line.Words;
                    var str = string.Join(" ", words.Select(x => x.Text));
                    var modelLine = new ModelLine
                    {
                        Text = str,
                        Rectangle = line.Rectangle
                    };
                    lines.Add(modelLine);

                    var tempSearch = new TempKeyWordSearch
                    {
                        Code = Guid.NewGuid().ToString(),
                        Value = str,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        DocumentId = fileCode,
                    };
                    _context.TempKeyWordSearchs.Add(tempSearch);
                }
            }

            //Creates a new Word document 
            WordDocument document = new WordDocument();

            //Adds new section to the document
            IWSection section = document.AddSection();

            //Adds new paragraph to the section
            IWParagraph paragraph = section.AddParagraph();

            foreach (var item in lines)
            {
                paragraph.AppendText(" " + item.Text);
                paragraph = section.AddParagraph();
            }
            MemoryStream stream = new MemoryStream();
            //Set the position as '0'.
            stream.Position = 0;
            var filePathWord = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + Path.GetFileNameWithoutExtension(pathTemp) + ".docx";
            FileStream streamFileWord = new FileStream(filePathWord, FileMode.Create, FileAccess.ReadWrite);
            document.Save(streamFileWord, FormatType.Docx);

            var edmsReposCatFile = new EDMSRepoCatFile
            {
                FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                ReposCode = repoCode,
                CatCode = catCode,
                ObjectCode = "",
                ObjectType = "",
                Path = pathFtp,
                FolderId = ""
            };
            _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

            //add File
            var urlFile = pathFtp + Path.Combine("/", Path.GetFileNameWithoutExtension(pathTemp) + ".doc");
            var file = new EDMSFile
            {
                FileCode = edmsReposCatFile.FileCode,
                FileName = Path.GetFileNameWithoutExtension(pathTemp) + "_OCRed.doc",
                Desc = "",
                ReposCode = repoCode,
                Tags = "",
                FileSize = streamFileWord.Length,
                FileTypePhysic = ".doc",
                NumberDocument = "",
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                Url = urlFile,
                MimeType = "application/msword",
                CloudFileId = "",
                IsScan = false,
                MetaDataExt = "",
            };
            _context.EDMSFiles.Add(file);

            //Index file
            var iFormFileWord = new FormFile(streamFileWord, 0, streamFileWord.Length, "", Path.GetFileName(pathTemp))
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/msword"
            };
            LuceneExtension.IndexFile(edmsReposCatFile.FileCode, iFormFileWord, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

            //Save file word
            var pathWordSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + urlFile;
            System.IO.File.Copy(filePathWord, pathWordSaveToFtp, true);
            streamFileWord.Close();
            stream.Close();

            //Save the PDF document.
            MemoryStream outputDocument = new MemoryStream();
            //loadedDocument.Save(outputDocument);
            outputDocument.Position = 0;

            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + Path.GetFileNameWithoutExtension(pathTemp) + "001.pdf";
            FileStream streamFileNew = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            loadedDocument.Save(streamFileNew);
            //Index file
            var iFormFile = new FormFile(streamFileNew, 0, streamFileNew.Length, "", Path.GetFileName(pathTemp))
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };
            LuceneExtension.IndexFile(fileCode, iFormFile, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

            //Save
            var pathSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + url;
            //var pathSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + Path.GetFileNameWithoutExtension(pathTemp) + "OCRed.pdf";
            System.IO.File.Copy(pathFile, pathSaveToFtp, true);

            //Dispose OCR processor and PDF document.
            processor.Dispose();
            fontStream.Close();
            inputDocument.Close();
            loadedDocument.Close(true);
        }

        [HttpPost]
        public JsonResult PerformOcrEdms([FromBody] List<int> ids)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listImgType = new string[] { ".jpg", ".png", ".tif", ".tiff" };
                var data = (from a in _context.EDMSRepoCatFiles
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            where ids.Any(x => x == a.Id)
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
                                a.ReposCode,
                                a.Path,
                                a.CatCode,
                                c.FileSize
                            }).DistinctBy(x => x.FileCode);

                foreach (var item in data)
                {
                    var fileTempName = "File_temp" + Path.GetExtension(item.FileName);
                    if (!string.IsNullOrEmpty(item.Server))
                    {
                        string ftphost = item.Server;
                        string ftpfilepath = item.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(item.Account, item.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                            string path = msg1.Object.ToString();
                            if (item.FileTypePhysic.ToLower().Equals(".pdf"))
                            {
                                msg1.Object = Path.Combine(_hostingEnvironment.WebRootPath, path);
                                OCRPdf(msg1.Object.ToString(), item.Url, item.FileCode, item.Path, item.ReposCode, item.CatCode);
                            }
                            else if (listImgType.Any(x => x.Equals(item.FileTypePhysic.ToLower())))
                            {
                                msg1.Object = Path.Combine(_hostingEnvironment.WebRootPath, path);
                                var pathFilePdf = ConvertToPdf(msg1.Object.ToString(), item.FileName);

                                var edmsReposCatFile = new EDMSRepoCatFile
                                {
                                    FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                                    ReposCode = item.ReposCode,
                                    CatCode = item.CatCode,
                                    ObjectCode = "",
                                    ObjectType = "",
                                    Path = item.Path,
                                    FolderId = ""
                                };
                                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                                //add File
                                var urlFile = item.Path + Path.Combine("/", Path.GetFileNameWithoutExtension(path) + ".pdf");
                                var file = new EDMSFile
                                {
                                    FileCode = edmsReposCatFile.FileCode,
                                    FileName = Path.GetFileNameWithoutExtension(item.FileName) + "_OCRed.pdf",
                                    Desc = "",
                                    ReposCode = item.ReposCode,
                                    Tags = "",
                                    FileSize = item.FileSize,
                                    FileTypePhysic = Path.GetExtension(pathFilePdf),
                                    NumberDocument = "",
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                    Url = urlFile,
                                    MimeType = "application/pdf",
                                    CloudFileId = "",
                                    IsScan = false,
                                    MetaDataExt = "",
                                };
                                _context.EDMSFiles.Add(file);
                                OCRPdf(pathFilePdf, file.Url, file.FileCode, item.Path, item.ReposCode, item.CatCode);
                            }
                        }
                    }
                }
                _context.SaveChanges();
                msg.Title = "Perform OCR success!";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class ModelLine
        {
            public string Text { get; set; }
            public System.Drawing.Rectangle Rectangle { get; set; }
        }
        #endregion

        #region Processing Image
        public Bitmap Resize(Bitmap bmp, int newWidth, int newHeight)
        {
            Bitmap temp = (Bitmap)bmp;

            Bitmap bmap = new Bitmap(newWidth, newHeight, temp.PixelFormat);

            double nWidthFactor = (double)temp.Width / (double)newWidth;
            double nHeightFactor = (double)temp.Height / (double)newHeight;

            double fx, fy, nx, ny;
            int cx, cy, fr_x, fr_y;
            System.Drawing.Color color1 = new System.Drawing.Color();
            System.Drawing.Color color2 = new System.Drawing.Color();
            System.Drawing.Color color3 = new System.Drawing.Color();
            System.Drawing.Color color4 = new System.Drawing.Color();
            byte nRed, nGreen, nBlue;
            byte bp1, bp2;
            for (int x = 0; x < bmap.Width; ++x)
            {
                for (int y = 0; y < bmap.Height; ++y)
                {

                    fr_x = (int)Math.Floor(x * nWidthFactor);
                    fr_y = (int)Math.Floor(y * nHeightFactor);
                    cx = fr_x + 1;
                    if (cx >= temp.Width) cx = fr_x;
                    cy = fr_y + 1;
                    if (cy >= temp.Height) cy = fr_y;
                    fx = x * nWidthFactor - fr_x;
                    fy = y * nHeightFactor - fr_y;
                    nx = 1.0 - fx;
                    ny = 1.0 - fy;

                    color1 = temp.GetPixel(fr_x, fr_y);
                    color2 = temp.GetPixel(cx, fr_y);
                    color3 = temp.GetPixel(fr_x, cy);
                    color4 = temp.GetPixel(cx, cy);

                    // Blue
                    bp1 = (byte)(nx * color1.B + fx * color2.B);

                    bp2 = (byte)(nx * color3.B + fx * color4.B);

                    nBlue = (byte)(ny * (double)(bp1) + fy * (double)(bp2));

                    // Green
                    bp1 = (byte)(nx * color1.G + fx * color2.G);

                    bp2 = (byte)(nx * color3.G + fx * color4.G);

                    nGreen = (byte)(ny * (double)(bp1) + fy * (double)(bp2));

                    // Red
                    bp1 = (byte)(nx * color1.R + fx * color2.R);

                    bp2 = (byte)(nx * color3.R + fx * color4.R);

                    nRed = (byte)(ny * (double)(bp1) + fy * (double)(bp2));

                    bmap.SetPixel(x, y, System.Drawing.Color.FromArgb
            (255, nRed, nGreen, nBlue));
                }
            }
            bmap = SetGrayscale(bmap);
            bmap = RemoveNoise(bmap);
            return bmap;
        }

        //SetGrayscale
        public Bitmap SetGrayscale(Bitmap img)
        {
            Bitmap temp = (Bitmap)img;
            Bitmap bmap = (Bitmap)temp.Clone();
            System.Drawing.Color c;
            for (int i = 0; i < bmap.Width; i++)
            {
                for (int j = 0; j < bmap.Height; j++)
                {
                    c = bmap.GetPixel(i, j);
                    byte gray = (byte)(.299 * c.R + .587 * c.G + .114 * c.B);

                    bmap.SetPixel(i, j, System.Drawing.Color.FromArgb(gray, gray, gray));
                }
            }
            return (Bitmap)bmap.Clone();

        }
        //RemoveNoise
        public Bitmap RemoveNoise(Bitmap bmap)
        {
            for (var x = 0; x < bmap.Width; x++)
            {
                for (var y = 0; y < bmap.Height; y++)
                {
                    var pixel = bmap.GetPixel(x, y);
                    if (pixel.R < 162 && pixel.G < 162 && pixel.B < 162)
                        bmap.SetPixel(x, y, System.Drawing.Color.Black);
                    else if (pixel.R > 162 && pixel.G > 162 && pixel.B > 162)
                        bmap.SetPixel(x, y, System.Drawing.Color.White);
                }
            }

            return bmap;
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
    }
}