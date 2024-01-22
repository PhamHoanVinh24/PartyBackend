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
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ExcelController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ExcelController> _stringLocalizer;
        public static AseanDocument docmodel = new AseanDocument();
        public static string fileCode = string.Empty;
        public static string pathFile = string.Empty;
        public static string cardCode = string.Empty;
        public static string pathFileFTP = string.Empty;
        public ExcelController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ExcelController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            if (pathFile != "")
            {
                ViewBag.DefaultData = new ViewBagObj
                {
                    FileCode = fileCode,
                    FilePath = pathFile
                };
            }
            else
            {
                ViewBag.DefaultData = new ViewBagObj
                {
                    FileCode = fileCode,
                    FilePath = pathFileFTP
                };
            }

            return View(docmodel);
        }
        public object Save(SaveSettings saveSettings)
        {
            var msg = new JMessage { Error = false, Title = "" };
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            try
            {
                var session = HttpContext.GetSessionUser();

                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(docmodel.File_Code));
                // Convert Spreadsheet data as Stream 
                Stream fileStream = Workbook.Save<Stream>(saveSettings);
                IWorkbook workbook = application.Workbooks.Open(fileStream);
                if (edmsFile != null)
                {
                    if (edmsFile.IsFileMaster == false)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_NOT_EDIT_FILE_HISTORY"];
                        msg.ID = edmsFile.FileID;
                        return msg;
                    }

                    if (edmsFile.IsEdit == false && !User.Identity.Name.Equals(edmsFile.EditedFileBy) && !edmsFile.IsDeleted)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_EDITED_PEOPLE_OTHER"];
                        return msg;
                    }
                    else
                    {
                        var filePath = _hostingEnvironment.WebRootPath + pathFileFTP;
                        FileStream outputStream = new FileStream(filePath, FileMode.Create);
                        workbook.SaveAs(outputStream);
                        var pathSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + docmodel.FullPathView;
                        System.IO.File.Copy(filePath, pathSaveToFtp, true);
                        outputStream.Close();
                        workbook.Close();

                        var path = _hostingEnvironment.WebRootPath + "/" + docmodel.File_Path;

                        //Xử lý log file sửa theo từng phiên bản ở đây
                        //Bước 1: Lấy file temp đã sửa copy qua thư mục của nó và đổi tên, thêm 1 bản ghi vào bảng EDMS_FILES, EDMS_REPO_CAT_FILE

                        var edmsRepoCatFile = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode.Equals(docmodel.File_Code));
                        if (edmsFile != null && edmsRepoCatFile != null)
                        {
                            //var url = string.Concat(edmsRepoCatFile.Path, "/", docmodel.File_Path.Split("\\").Last());
                            var url = edmsRepoCatFile.Path + "/" + Path.GetFileName(docmodel.File_Path);

                            var pathEditSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + url;
                            System.IO.File.Copy(path, pathEditSaveToFtp, true);

                            var fileName = FileExtensions.CleanFileName(Path.GetFileName(edmsFile.FileName));
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                                      + "_"
                                      + DateTime.Now.ToString("ddMMyyyy_hhmmss")
                                      + Path.GetExtension(fileName);

                            var check = _context.EDMSFiles.Any(x => x.FileParentId.Equals(edmsFile.FileID) && x.IsFileMaster == false && x.Url.Equals(url));
                            if (!check)
                            {
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
                                    IsEdit = edmsFile.IsEdit,
                                    IsFileMaster = false,
                                    FileParentId = edmsFile.FileID,
                                    EditedFileBy = User.Identity.Name,
                                    EditedFileTime = DateTime.Now,
                                    Url = url
                                };

                                _context.EDMSFiles.Add(emdsFileEdit);

                                var emdsRepoCatFileEdit = new EDMSRepoCatFile
                                {
                                    FileCode = emdsFileEdit.FileCode,
                                    CatCode = edmsRepoCatFile.CatCode,
                                    ObjectCode = edmsRepoCatFile.ObjectCode,
                                    ObjectType = edmsRepoCatFile.ObjectType,
                                    Path = edmsRepoCatFile.Path,
                                    FolderId = edmsRepoCatFile.FolderId,
                                    ReposCode = edmsFile.ReposCode,
                                };

                                _context.EDMSRepoCatFiles.Add(emdsRepoCatFileEdit);

                                var listUserView = JsonConvert.DeserializeObject<List<string>>(edmsFile.ListUserView);
                                var userRemove = listUserView.FirstOrDefault(x => x.Equals(session.FullName));
                                if (userRemove != null)
                                    listUserView.Remove(userRemove);

                                edmsFile.IsEdit = true;
                                edmsFile.EditedFileBy = User.Identity.Name;
                                edmsFile.EditedFileTime = DateTime.Now;
                                edmsFile.ListUserView = JsonConvert.SerializeObject(listUserView);

                                if (listUserView.Count == 0)
                                    edmsFile.ListUserView = string.Empty;

                                _context.EDMSFiles.Update(edmsFile);

                                _context.SaveChanges();
                            }
                        }
                    }
                }
                else
                {
                    var attachment = _context.CardAttachments.FirstOrDefault(x => x.FileCode == docmodel.File_Code && x.CardCode == cardCode);
                    if (attachment != null)
                    {
                        var filePath = _hostingEnvironment.WebRootPath + pathFile;
                        FileStream outputStream = new FileStream(filePath, FileMode.Create);
                        workbook.SaveAs(outputStream);

                        var listUserView = !string.IsNullOrEmpty(attachment.ListUserView) ? JsonConvert.DeserializeObject<List<string>>(attachment.ListUserView) : new List<string>();
                        var userRemove = listUserView.FirstOrDefault(x => x.Equals(session.FullName));
                        if (userRemove != null)
                            listUserView.Remove(userRemove);

                        attachment.ListUserView = JsonConvert.SerializeObject(listUserView);
                        attachment.IsEdit = true;

                        _context.CardAttachments.Update(attachment);
                        _context.SaveChanges();
                        outputStream.Close();
                        workbook.Close();
                    }
                    else
                    {
                        var orderRQFile = _context.OrderRequestRawFiless.FirstOrDefault(x => x.FilePath == pathFile && !x.IsDeleted);
                        if (orderRQFile != null)
                        {
                            var filePath = _hostingEnvironment.WebRootPath + pathFile;
                            FileStream outputStream = new FileStream(filePath, FileMode.Create);
                            workbook.SaveAs(outputStream);
                            //attachment.IsEdit = false;
                            //_context.CardAttachments.Update(attachment);
                            //_context.SaveChanges();
                            outputStream.Close();
                            workbook.Close();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Title = "Có lỗi xảy ra";
                msg.Error = true;
            }
            return Response.WriteAsync("<script>window.close();</script>"); ;
        }

        public IActionResult OpenFromLocal(IFormCollection openRequest)
        {
            OpenRequest open = new OpenRequest();
            open.File = openRequest.Files[0];
            return Content(Workbook.Open(open));
        }
        public IActionResult OpenFromURL()
        {
            string path = docmodel.File_Path;
            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile file = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");
            OpenRequest open = new OpenRequest();
            open.File = file;
            return Content(Workbook.Open(open));
        }
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

        public class ViewBagObj
        {
            public string FileCode { get; set; }
            public string FilePath { get; set; }
        }
        #endregion
    }

}