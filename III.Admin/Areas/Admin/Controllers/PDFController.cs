using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.Pdf.Parsing;
using Syncfusion.Pdf;
using Syncfusion.EJ2.PdfViewer;
using Microsoft.Extensions.Caching.Memory;
using Syncfusion.Presentation;
using Syncfusion.PresentationToPdfConverter;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class PDFController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<PDFController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private IMemoryCache _cache;
     
        public PDFController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,IStringLocalizer<PDFController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IMemoryCache memoryCache)
        {
             _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _cache = memoryCache;
        }
     
        public IActionResult Index()
        {
            return View();
        }

        #region Editfile
        public static AseanDocument docmodel = new AseanDocument();
        public static string pathFile = new string("");
        public static string pathFileFTP = new string("");
        public ActionResult Default()
        {
            List<object> exportItems = new List<object>();
            exportItems.Add(new { text = "Microsoft Word (.docx)", id = "word" });
            exportItems.Add(new { text = "Syncfusion Document Text (.sfdt)", id = "sfdt" });
            ViewBag.ExportItems = exportItems;
            return View();
        }

        //load file động
        [Route("PDF/Load")]
        public IActionResult Loadtest([FromBody] Dictionary<string, string> jsonObject)
        {
            if(docmodel!= null)
            {
                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(docmodel.File_Code));
                var edmsRepoCatFile = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode.Equals(docmodel.File_Code));
                if (edmsFile != null && edmsRepoCatFile != null)
                {
                    var url = string.Concat(edmsRepoCatFile.Path, "/", docmodel.File_Path.Split("\\").Last());
                    var fileName = FileExtensions.CleanFileName(Path.GetFileName(edmsFile.FileName));
                    fileName = Path.GetFileNameWithoutExtension(fileName)
                              + "_"
                              + DateTime.Now.ToString("ddMMyyyy_HHmmss")
                              + Path.GetExtension(fileName);
                    var emdsFileEdit = new EDMSFile
                    {
                        FileCode = string.Concat("FILE_EDIT", Guid.NewGuid().ToString()),
                        FileName = fileName,
                        FileSize = edmsFile.FileSize,
                        FileTypePhysic = edmsFile.FileTypePhysic,
                        ReposCode = edmsFile.ReposCode,
                        CreatedBy = edmsFile.CreatedBy,
                        CreatedTime = edmsFile.CreatedTime,
                        UpdatedBy = edmsFile.UpdatedBy,
                        UpdatedTime = edmsFile.UpdatedTime,
                        NumberDocument = edmsFile.NumberDocument,
                        MimeType = edmsFile.MimeType,
                        IsEdit = true,
                        IsFileMaster = false,
                        FileParentId = edmsFile.FileID,
                        EditedFileBy = User.Identity.Name,
                        EditedFileTime = DateTime.Now,
                        Url = url
                    };
                    _context.EDMSFiles.Add(emdsFileEdit);
                    _context.SaveChanges();
                }
            }
            if (pathFile == "")
            {
                pathFile = "\\" +docmodel.File_Path;
            }
            var extension = Path.GetExtension(pathFile);
            if(extension.Equals(".pptx") || extension.Equals(".ppt"))
            {
                using (FileStream fileStreamInput = new FileStream(@"Template.pptx", FileMode.Open, FileAccess.Read))
                {
                    //Open the existing PowerPoint presentation with loaded stream.
                    using (IPresentation pptxDoc = Presentation.Open(fileStreamInput))
                    {
                        //Create the MemoryStream to save the converted PDF.
                        using (MemoryStream pdfStream = new MemoryStream())
                        {
                            //Convert the PowerPoint document to PDF document.
                            using (PdfDocument pdfDocument = PresentationToPdfConverter.Convert(pptxDoc))
                            {
                                //Save the converted PDF document to MemoryStream.
                                pdfDocument.Save(pdfStream);
                                pdfStream.Position = 0;
                            }
                            //Create the output PDF file stream
                            //using (FileStream fileStreamOutput = File.Create("Output.pdf"))
                            //{
                            //    //Copy the converted PDF stream into created output PDF stream
                            //    pdfStream.CopyTo(fileStreamOutput);
                            //}
                        }
                    }
                }
            }
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            MemoryStream stream = new MemoryStream();
            object jsonResult = new object();
            var path = _hostingEnvironment.WebRootPath + pathFile;
            FileStream fileStreamPath = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            PdfLoadedDocument doc = new PdfLoadedDocument(fileStreamPath);
            jsonResult = pdfviewer.Load(fileStreamPath, jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        //load file local
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/Load1")]
        public IActionResult Load([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            MemoryStream stream = new MemoryStream();
            object jsonResult = new object();
            if (jsonObject != null && jsonObject.ContainsKey("document"))
            {
                if (bool.Parse(jsonObject["isFileName"]))
                {
                    string documentPath = GetDocumentPath(jsonObject["document"]);
                    if (!string.IsNullOrEmpty(documentPath))
                    {
                        byte[] bytes = System.IO.File.ReadAllBytes(documentPath);
                        stream = new MemoryStream(bytes);
                    }
                    else
                    {
                        return this.Content(jsonObject["document"] + " is not found");
                    }
                }
                else
                {
                    byte[] bytes = Convert.FromBase64String(jsonObject["document"]);
                    stream = new MemoryStream(bytes);
                }
            }
            jsonResult = pdfviewer.Load(stream, jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/RenderPdfPages")]
        public IActionResult RenderPdfPages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetPage(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/RenderAnnotationComments")]
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetAnnotationComments(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/Unload")]
        public IActionResult Unload([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            pdfviewer.ClearCache(jsonObject);
            return this.Content("Document cache is cleared");
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/RenderThumbnailImages")]
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object result = pdfviewer.GetThumbnailImages(jsonObject);
            return Content(JsonConvert.SerializeObject(result));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/Bookmarks")]
        public IActionResult Bookmarks([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetBookmarks(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/Download")]
        public IActionResult Download([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
            string base64String = documentBase.Split(new string[] { "data:application/pdf;base64," }, StringSplitOptions.None)[1];
            if (base64String != null || base64String != string.Empty)
            {
                byte[] byteArray = Convert.FromBase64String(base64String);
                System.IO.File.WriteAllBytes(_hostingEnvironment.WebRootPath + pathFile, byteArray);//"\\output.pdf"
            }
            return Content(string.Empty);
        }

        //save file chưa xong
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/Download1")]
        public IActionResult savetest([FromBody] Dictionary<string, string> jsonObject)
        {

            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
            
            //
            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "save");
            byte[] bytes = Convert.FromBase64String(documentBase);
            PdfLoadedDocument pdfdoc = new PdfLoadedDocument(bytes);
             var fullPath = Path.Combine(pathUpload, docmodel.File_Name);
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                pdfdoc.Save(stream);
            }
            return Content(documentBase);
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/PrintImages")]
        public IActionResult PrintImages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object pageImage = pdfviewer.GetPrintImage(jsonObject);
            return Content(JsonConvert.SerializeObject(pageImage));
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/ExportAnnotations")]
        public IActionResult ExportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = pdfviewer.GetAnnotations(jsonObject);
            return Content(jsonResult);
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PDF/ImportAnnotations")]
        public IActionResult ImportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = string.Empty;
            if (jsonObject != null && jsonObject.ContainsKey("fileName"))
            {
                string documentPath = GetDocumentPath(jsonObject["fileName"]);
                if (!string.IsNullOrEmpty(documentPath))
                {
                    jsonResult = System.IO.File.ReadAllText(documentPath);
                }
                else
                {
                    return Content(jsonObject["document"] + " is not found");
                }
            }
            return Content(jsonResult);
        }

        private string GetDocumentPath(string document)
        {
            string documentPath = string.Empty;
            if (!System.IO.File.Exists(document))
            {
                string basePath = _hostingEnvironment.WebRootPath;
                string dataPath = string.Empty;
                dataPath = basePath + @"/PdfViewer/";
                if (System.IO.File.Exists(dataPath + document))
                    documentPath = dataPath + document;
            }
            else
            {
                documentPath = document;
            }
            return documentPath;
        }


        public byte[] GetDocument(string documentID)
        {
            //Provide the database connection string
            string constr = "Data Source=(LocalDB)\\MSSQLLocalDB;AttachDbFilename=C:\\Users\\XYZ\\Documents\\PdfList.mdf;Integrated Security=True;Connect Timeout=30";
            System.Data.SqlClient.SqlConnection con = new System.Data.SqlClient.SqlConnection(constr);
            //Query to get the PDF document from database using the document name
            var query = "select PdfDocData from DocList where PdfDocName = '" + documentID + "'";
            System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand(query);
            cmd.Connection = con;
            con.Open();
            System.Data.SqlClient.SqlDataReader read = cmd.ExecuteReader();
            read.Read();
            //Retrieve the document data as base64 string
            string base64 = (string)read["PdfDocData"];
            //Convert base64 string to byte array
            byte[] byteArray = Convert.FromBase64String(base64);
            return byteArray;

        }


        [HttpPost]
        public IActionResult Save([FromBody] Dictionary<string, string> jsonObject)
        {
            //Load the PDF document
            FileStream docStream = new FileStream("Input.pdf", FileMode.Open, FileAccess.Read);
            PdfLoadedDocument loadedDocument = new PdfLoadedDocument(docStream);
            //To-Do some manipulation
            //To-Do some manipulation
            //Save the document into stream
            MemoryStream stream = new MemoryStream();
            loadedDocument.Save(stream);
            //If the position is not set to '0' then the PDF will be empty.
            stream.Position = 0;
            //Close the document.
            loadedDocument.Close(true);
            //Defining the ContentType for pdf file.
            string contentType = "application/pdf";
            //Define the file name.
            string fileName = "Output.pdf";
            //Creates a FileContentResult object by using the file contents, content type, and file name.
            return File(stream, contentType, fileName);
        }

        public JsonResult compare()
        {
            var pathUploadupload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads/files/");
            var pathUploadsave = Path.Combine(_hostingEnvironment.WebRootPath, "save/");

            var expected = System.IO.File.ReadAllBytes(pathUploadupload + "Mau-tt1_d063e5d6.docx");
            var actual = System.IO.File.ReadAllBytes(pathUploadsave + "Mau-tt1_d063e5d6.docx");
            var expectedresult = new WmlDocument("Mau-tt1_d063e5d6.docx", expected);
            var actualDocument = new WmlDocument("Mau-tt1_d063e5d6.docx", actual);
            var comparisonSettings = new WmlComparerSettings();

            var comparisonResults = WmlComparer.Compare(expectedresult, actualDocument, comparisonSettings);
            var revisions = WmlComparer.GetRevisions(comparisonResults, comparisonSettings);


            string rev = Newtonsoft.Json.JsonConvert.SerializeObject(revisions);
            string[] revision = rev.Split(",");

            var msg = new JMessage { Title = "", Error = false };
            try
            {


                var dt = new LogChangeDocument();

                // dt.FileName = expectedresult;
                dt.CreatedBy = ESEIM.AppContext.UserName;
                dt.CreatedTime = DateTime.Now;
                dt.LogContent = rev;
                _context.LogChangeDocuments.Add(dt);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["So sánh thành công"];/*, CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD")*/
                msg.ID = dt.ID;



            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED")/*, CommonUtil.ResourceValue("DCD_MSG_TITLE_DCD")*/);
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #endregion

        
    }

}