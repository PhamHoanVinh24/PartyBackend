using ESEIM.Models;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using ESEIM;
using III.Domain.Enums;
using System.Linq;
using System.Net;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http.Internal;

namespace III.Admin.Areas.Admin.Controllers
{
    public class MobileUploadController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        public string module_name = "";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public MobileUploadController(
            EIMDBContext context,
            IOptions<AppSettings> appSettings,
            IHostingEnvironment hostingEnvironment,
            IUploadService upload)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _upload = upload;
        }
        // Server configuration for upload a file.
        public IActionResult Save(UploadObject obj, IFormFile chunkFile, IFormFile UploadFiles)
        {
            try
            {
                var httpPostedChunkFile = chunkFile;
                if (httpPostedChunkFile != null)
                {
                    var saveFile = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\tempFile");
                    //var saveFile = HttpContext.Current.Server.MapPath("UploadingFiles");
                    //// Save the chunk file in temporery location with .part extension
                    var SaveFilePath = Path.Combine(saveFile, httpPostedChunkFile.FileName + ".part");
                    var chunkIndex = obj.chunkIndex;
                    if (chunkIndex == "0")
                    {
                        //httpPostedChunkFile.SaveAs(SaveFilePath);
                        using (var stream = new FileStream(SaveFilePath, FileMode.Create))
                        {
                            httpPostedChunkFile.CopyTo(stream);
                        }
                    }
                    else
                    {
                        // Merge the current chunk file with previous uploaded chunk files
                        MemoryStream inputStream = new MemoryStream();
                        httpPostedChunkFile.CopyTo(inputStream);
                        MergeChunkFile(SaveFilePath, inputStream, Convert.ToInt32(chunkIndex));
                        var totalChunk = obj.totalChunk;
                        if (Convert.ToInt32(chunkIndex) == (Convert.ToInt32(totalChunk) - 1) || string.IsNullOrEmpty(chunkIndex))
                        {
                            var savedFile = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\tempFile");
                            var originalFilePath = Path.Combine(savedFile, httpPostedChunkFile.FileName);
                            // After all the chunk files completely uploaded, remove the .part extension and move this file into save location
                            System.IO.File.Move(SaveFilePath, originalFilePath);
                        }
                    }
                    //HttpResponse ChunkResponse = HttpContext.Current.Response;
                    //ChunkResponse.Clear();
                    //ChunkResponse.ContentType = "application/json; charset=utf-8";
                    //ChunkResponse.StatusDescription = "File uploaded succesfully";
                    //ChunkResponse.End();
                    return Ok("File uploaded succesfully");
                }

                var httpPostedFile = UploadFiles;

                if (httpPostedFile != null)
                {
                    var fileSave = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\tempFile");
                    var fileSavePath = Path.Combine(fileSave, httpPostedFile.FileName);
                    if (!System.IO.File.Exists(fileSavePath))
                    {
                        //httpPostedFile.SaveAs(fileSavePath);
                        using (var stream = new FileStream(fileSavePath, FileMode.Create))
                        {
                            httpPostedFile.CopyTo(stream);
                        }
                        //HttpResponse Response = HttpContext.Current.Response;
                        //Response.Clear();
                        //Response.ContentType = "application/json; charset=utf-8";
                        //Response.StatusDescription = "File uploaded succesfully";
                        //Response.End();
                        return Ok("File uploaded succesfully");
                    }
                    else
                    {
                        return BadRequest("File already exists");
                    }
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
                //HttpResponse Response = HttpContext.Current.Response;
                //Response.Clear();
                //Response.ContentType = "application/json; charset=utf-8";
                //Response.StatusCode = 400;
                //Response.Status = "400 No Content";
                //Response.StatusDescription = e.Message;
                //Response.End();
            }
            return Ok("No action");
        }
        // Server configuration for remove a uploaded file
        public IActionResult Remove(UploadObject obj, IFormFile UploadedFiles)
        {
            try
            {
                var fileSave = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\tempFile");
                //if (HttpContext.Current.Request.Form["cancelUploading"] != null)
                //{
                //    fileSave = HttpContext.Current.Server.MapPath("UploadingFiles");
                //}
                //else
                //{
                //    fileSave = HttpContext.Current.Server.MapPath("UploadedFiles");
                //}
                var fileName = UploadedFiles.FileName;
                var fileSavePath = Path.Combine(fileSave, fileName);
                if (System.IO.File.Exists(fileSavePath))
                {
                    System.IO.File.Delete(fileSavePath);
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
                //HttpResponse Response = HttpContext.Current.Response;
                //Response.Clear();
                //Response.Status = "404 File not found";
                //Response.StatusCode = 404;
                //Response.StatusDescription = "File not found";
                //Response.End();
            }
            return Ok("File upload canceled");
        }
        // Merge the current chunk file with previous uploaded chunk files
        public void MergeChunkFile(string fullPath, Stream chunkContent, int chunkIndex)
        {
            try
            {
                using (FileStream stream = new FileStream(fullPath, FileMode.Append, FileAccess.Write, FileShare.ReadWrite))
                {
                    using (chunkContent)
                    {
                        chunkContent.Position = 0;
                        stream.Position = chunkIndex * 102400;
                        chunkContent.CopyTo(stream);
                    }
                }
            }
            catch (IOException ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult InsertFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var saveFile = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\tempFile");
                var fileSavePath = Path.Combine(saveFile, obj.FileName);
                MemoryStream inputStream = new MemoryStream();
                using (FileStream stream = new FileStream(fileSavePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    stream.CopyTo(inputStream);
                }
                var mimeType = obj.MimeType;
                string extension = Path.GetExtension(obj.FileName);
                string urlFile = "";
                string fileId = "";
                var fileSize = obj.FileLength;
                string urlPptx = "";
                //if ((fileSize / 1048576.0) > 20)
                //{
                //    msg.Error = true;
                //    msg.Title = "Dung lượng file lớn hơn 20mb. Vui lòng chia nhỏ để tải lên";
                //    return Json(msg);
                //}

                string reposCode = "";
                string catCode = "";
                string path = "";
                string folderId = "";
                // if (obj.CateRepoSettingId != null) =>
                if (obj.CateRepoSettingId != null)
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
                        msg.Title = "Vui lòng chọn thư mục lưu trữ!";
                        return Json(msg);
                    }
                }
                // else ObjectType, ObjectCode, ModuleName
                else
                {
                    var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                          && x.ObjectCode.Equals(obj.ObjectCode) && x.ObjectType.Equals(obj.ObjectType));
                    if (repoDefault != null)
                    {
                        reposCode = repoDefault.ReposCode;
                        path = repoDefault.Path;
                        folderId = repoDefault.FolderId;
                        catCode = repoDefault.CatCode;
                    }
                    else
                    {
                        var setting = (EDMSCatRepoSetting)_upload.GetPathByModule(obj.ModuleName).Object;
                        reposCode = setting.ReposCode;
                        catCode = setting.CatCode;
                        if (setting.Path == "")
                        {
                            host_type = 1;
                            path_upload_file = setting.FolderId;
                        }
                        else
                        {
                            host_type = 0;
                            path_upload_file = setting.Path;
                        }

                        path = host_type == 0 ? path_upload_file : "";
                        folderId = host_type == 1 ? path_upload_file : "";
                        //msg.Error = true;
                        //msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                        //return Json(msg);
                    }
                }

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    using (var ms = new MemoryStream())
                    {

                        inputStream.Position = 0;
                        inputStream.CopyTo(ms);
                        var fileBytes = ms.ToArray();
                        urlFile = path + Path.Combine("/", obj.FileName);
                        var urlFilePreventive = path + Path.Combine("/",
                            Guid.NewGuid().ToString().Substring(0, 8) + obj.FileName);
                        var urlEnd =
                            System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                        var urlEndPreventive =
                            System.Web.HttpUtility.UrlPathEncode(
                                "ftp://" + getRepository.Server + urlFilePreventive);
                        var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes,
                            getRepository.Account, getRepository.PassWord);
                        if (result.Status == WebExceptionStatus.ConnectFailure ||
                            result.Status == WebExceptionStatus.ProtocolError)
                        {
                            msg.Error = true;
                            msg.Title = "Kết nối server không thành công";
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
                            msg.Title = "Có lỗi xảy ra!";
                            return Json(msg);
                        }

                        msg.Object = new
                        {
                            Type = "SERVER",
                            Url = _appSettings.UrlMain + "/uploads/repository" + urlFile,
                            CloudId = ""
                        };
                    }
                }
                else if (getRepository.Type ==
                         EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    var apiTokenService =
                        _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    fileId = FileExtensions.UploadFileToDrive(json, token, obj.FileName,
                        inputStream, obj.MimeType, folderId, user);

                    msg.Object = new
                    {
                        Type = "DRIVER",
                        Url = "",
                        CloudId = fileId
                    };
                }

                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("REPOSITORY", Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.ObjectCode,
                    ObjectType = obj.ObjectType,
                    Path = path,
                    FolderId = folderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                /// created Index lucene
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 &&
                    (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    if (!extension.ToUpper().Equals(".ZIP") && !extension.ToUpper().Equals(".RAR"))
                    {
                        var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                        var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                        var formFile = GetFormFile(obj.FileName, obj.FileLength ?? 0, inputStream, mimeType);
                        LuceneExtension.IndexFile(edmsReposCatFile.FileCode,
                            formFile, /*string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex")*/
                            luceneCategory.PathServerPhysic);
                    }
                }

                //add File
                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = obj.FileName,
                    Desc = obj.Desc,
                    ReposCode = reposCode,
                    Tags = obj.Tags,
                    FileSize = obj.FileLength,
                    FileTypePhysic = Path.GetExtension(obj.FileName),
                    NumberDocument = obj.NumberDocument,
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = mimeType,
                    CloudFileId = fileId,
                    IsScan = obj.IsScan,
                    MetaDataExt = obj.MetaDataExt,
                };
                _context.EDMSFiles.Add(file);

                if (!string.IsNullOrEmpty(obj.RackCode) && obj.IsScan)
                {
                    var filePackCover = new EDMSFilePackCover
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        ObjPackCode = obj.ObjPackCode,
                        RackCode = obj.RackCode,
                        RackPosition = obj.RackPosition,
                        CreatedBy = obj.CreatedBy,
                        CreatedTime = DateTime.Now
                    };

                    _context.EDMSFilePackCovers.Add(filePackCover);
                }

                _context.SaveChanges();
                msg.Title = "Thêm mới tệp tin thành công";
                msg.ID = edmsReposCatFile.Id;
                inputStream.Close();
                if (System.IO.File.Exists(fileSavePath))
                {
                    System.IO.File.Delete(fileSavePath);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi xảy ra!";
            }

            return Json(msg);
        }

        private IFormFile GetFormFile(string fileName, long fileSize, Stream stream, string contentType)
        {
            var file = new FormFile(stream, 0, fileSize, fileName, fileName);
            file.Headers = new HeaderDictionary { { "Content-Type", contentType } };
            return file;
        }
        public class UploadObject
        {
            public string chunkIndex { get; set; }
            public string totalChunk { get; set; }
            public string cancelUploading { get; set; }
        }
    }
}
