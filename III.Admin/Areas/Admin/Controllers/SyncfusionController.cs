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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SyncfusionController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SyncfusionController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public SyncfusionController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<SyncfusionController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;

            //this.filepath = FilePathEdit;
        }

        public static AseanDocument docmodel = new AseanDocument();
        public static string pathFile = new string("");
        public static string cardCode = new string("");
        public static string pathFileFTP = new string("");
        public IActionResult Index()
        {
            return View(docmodel);
        }
        #region Editfile
        public ActionResult Default()
        {
            List<object> exportItems = new List<object>();
            exportItems.Add(new { text = "Microsoft Word (.docx)", id = "word" });
            exportItems.Add(new { text = "Syncfusion Document Text (.sfdt)", id = "sfdt" });
            ViewBag.ExportItems = exportItems;
            return View();
        }

        [AcceptVerbs("Post")]
        public string Import(IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            Stream stream = new MemoryStream();
            IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;

            Syncfusion.EJ2.DocumentEditor.WordDocument document = Syncfusion.EJ2.DocumentEditor.WordDocument.Load(stream, GetFormatType(type.ToLower()));
            string sfdt = Newtonsoft.Json.JsonConvert.SerializeObject(document);
            document.Dispose();

            return sfdt;
        }
        [HttpPost]
        //đã truyền dữ liệu
        public JsonResult Open(IFormFile fileUpload, AseanDocument obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                if (obj.IsEdited == true && obj.IsDeleted == false)//check is_edit
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["File không tồn tại hoặc đang được sửa chữa"];
                    return Json(msg);
                }
                else
                {
                    if (pathFile != "")
                    {
                        var path = _hostingEnvironment.WebRootPath + pathFile;
                        FileStream fileStreamPath = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                        Syncfusion.EJ2.DocumentEditor.WordDocument document1 = Syncfusion.EJ2.DocumentEditor.WordDocument.Load(fileStreamPath, GetFormatType(".doc"));
                        string s = Newtonsoft.Json.JsonConvert.SerializeObject(document1);
                        document1.Dispose();
                        return Json(s);
                    }
                    else
                    {
                        var path = _hostingEnvironment.WebRootPath + "/" + docmodel.File_Path;
                        FileStream fileStreamPath = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                        Syncfusion.EJ2.DocumentEditor.WordDocument document1 = Syncfusion.EJ2.DocumentEditor.WordDocument.Load(fileStreamPath, GetFormatType(".doc"));
                        string s = Newtonsoft.Json.JsonConvert.SerializeObject(document1);
                        document1.Dispose();
                        return Json(s);
                    }

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
            };

            return Json(msg);
        }

        internal static Syncfusion.EJ2.DocumentEditor.FormatType GetFormatType(string format)
        {
            if (string.IsNullOrEmpty(format))
                throw new NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            switch (format.ToLower())
            {
                case ".dotx":
                case ".docx":
                case ".docm":
                case ".dotm":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Docx;
                case ".dot":
                case ".doc":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Doc;
                case ".rtf":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Rtf;
                case ".txt":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.Txt;
                case ".xml":
                    return Syncfusion.EJ2.DocumentEditor.FormatType.WordML;
                default:
                    throw new NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            }
        }

        [HttpPost]
        public JsonResult Save(IFormFile fileUpload)
        {
            var msg = new JMessage { Title = _sharedResources["COM_MSG_SUCCES_SAVE"], Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();

                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(docmodel.File_Code));
                var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "save");
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                FileStream fileStreamPath0 = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                Syncfusion.EJ2.DocumentEditor.WordDocument document0 = Syncfusion.EJ2.DocumentEditor.WordDocument.Load(fileStreamPath0, GetFormatType(".doc"));
                if (edmsFile != null)
                {
                    if (edmsFile.IsFileMaster == false)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_NOT_EDIT_FILE_HISTORY"];
                        msg.ID = edmsFile.FileID;
                        return Json(msg);
                    }
                    if (edmsFile.IsEdit == false && !User.Identity.Name.Equals(edmsFile.EditedFileBy) && !edmsFile.IsDeleted)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_EDITED_PEOPLE_OTHER"];
                        return Json(msg);
                    }
                    else
                    {
                        var pathTempFile = "/" + docmodel.File_Path;
                        var fullPath = Path.Combine(pathUpload, Path.GetFileName(pathTempFile));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            fileUpload.CopyTo(stream);
                            stream.Close();
                        }

                        var path = _hostingEnvironment.WebRootPath + "/" + docmodel.File_Path;
                        var filePathsaved = Path.GetTempFileName();
                        using (var stream1 = new FileStream(path, FileMode.Create))
                        {
                            fileUpload.CopyTo(stream1);
                            stream1.Close();
                        }


                        var pathSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + docmodel.FullPathView;
                        System.IO.File.Copy(path, pathSaveToFtp, true);

                        //Xử lý log file sửa theo từng phiên bản ở đây
                        //Bước 1: Lấy file temp đã sửa copy qua thư mục của nó và đổi tên, thêm 1 bản ghi vào bảng EDMS_FILES, EDMS_REPO_CAT_FILE

                        var edmsRepoCatFile = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode.Equals(docmodel.File_Code));
                        if (edmsFile != null && edmsRepoCatFile != null)
                        {
                            var url = string.Concat(edmsRepoCatFile.Path, "/", docmodel.File_Path.Split("\\").Last());
                            var pathEditSaveToFtp = _hostingEnvironment.WebRootPath + "/uploads/repository/" + url;
                            System.IO.File.Copy(path, pathEditSaveToFtp, true);

                            var fileName = FileExtensions.CleanFileName(Path.GetFileName(edmsFile.FileName));
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                                      + "_"
                                      + DateTime.Now.ToString("ddMMyyyy_HHmmss")
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
                                    IsEdit = false,
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
                        var fullPath = Path.Combine(pathUpload, Path.GetFileName(pathFile));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            fileUpload.CopyTo(stream);
                            stream.Close();
                        }
                        var path = _hostingEnvironment.WebRootPath + pathFile;
                        var filePathsaved = Path.GetTempFileName();
                        using (var stream1 = new FileStream(path, FileMode.Create))
                        {
                            fileUpload.CopyTo(stream1);
                            stream1.Close();
                        }

                        var listUserView = !string.IsNullOrEmpty(attachment.ListUserView) ? JsonConvert.DeserializeObject<List<string>>(attachment.ListUserView) : new List<string>();
                        var userRemove = listUserView.FirstOrDefault(x => x.Equals(session.FullName));
                        if (userRemove != null)
                            listUserView.Remove(userRemove);

                        attachment.ListUserView = JsonConvert.SerializeObject(listUserView);
                        attachment.IsEdit = true;

                        _context.CardAttachments.Update(attachment);
                        _context.SaveChanges();
                    }
                    else
                    {
                        var orderRQFile = _context.OrderRequestRawFiless.FirstOrDefault(x => x.FilePath == pathFile && !x.IsDeleted);
                        var fullPath = Path.Combine(pathUpload, Path.GetFileName(pathFile));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            fileUpload.CopyTo(stream);
                            stream.Close();
                        }
                        var path = _hostingEnvironment.WebRootPath + pathFile;
                        var filePathsaved = Path.GetTempFileName();
                        using (var stream1 = new FileStream(path, FileMode.Create))
                        {
                            fileUpload.CopyTo(stream1);
                            stream1.Close();
                        }
                        //attachment.IsEdit = false;
                        //_context.CardAttachments.Update(attachment);
                        //_context.SaveChanges();
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

        [HttpPost]
        public object Getlogcontent(string code)
        {

            var data = _context.LogChangeDocuments.Where(x => x.FileCode == code).FirstOrDefault();
            var jsonArr = JArray.Parse(data.LogContent);
            var textChange = jsonArr.AsEnumerable()
                .Select(x => new
                {
                    Text = x["Text"]
                }).ToList();
            return textChange;
        }

        [HttpPost]
        public object UnlockFile()
        {
            var msg = new JMessage { Title = "Mở khóa tệp thành công", Error = false };
            try
            {
                var timeNow = DateTime.Now;
                var timeMax = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals("TIME_UNLOCK_FILE")) != null ? int.Parse(_context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals("TIME_UNLOCK_FILE")).ValueSet) : 30;

                var fileLocks = _context.EDMSFiles.Where(x => !x.IsDeleted && x.EditedFileBy.Equals(User.Identity.Name) && x.IsFileMaster == true && x.IsEdit == false && x.EditedFileTime.HasValue && ((timeNow - x.EditedFileTime).Value.TotalMinutes) > timeMax).ToList();
                if (fileLocks.Count > 0)
                {
                    fileLocks.ForEach(x => { x.IsEdit = true; x.ListUserView = string.Empty; });
                    _context.EDMSFiles.UpdateRange(fileLocks);
                    _context.SaveChanges();
                }
                var fileCardLocks = _context.CardAttachments.Where(x => !x.Flag && x.IsEdit == true && x.UpdatedTime.HasValue && ((timeNow - x.UpdatedTime).Value.TotalMinutes > timeMax)).ToList();
                if (fileCardLocks.Count > 0)
                {
                    fileCardLocks.ForEach(x => { x.IsEdit = true; x.ListUserView = string.Empty; });
                    _context.CardAttachments.UpdateRange(fileCardLocks);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {

                throw;
            }

            return Json(msg);
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