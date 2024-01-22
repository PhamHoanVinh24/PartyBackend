using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using ESEIM.Models;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ESEIM.Utils
{
    public interface IUploadService
    {
        JMessage UploadFile(IFormFile fileUpload, string pathUpload);
        JMessage UploadFileByBytes(byte[] bytes, string fileName, string root, string pathUpload);
        JMessage UploadImage(IFormFile fileUpload);
        JMessage UploadImage(IFormFile fileUpload, string pathUpload);
        JMessage UploadImage(Image fileUpload, string fileName);
        Image Base64ToImage(string base64String);
        JMessage GetPathByModule(string module);
        Stream GetStreamByModule(string fileName, string module);
        JMessage CreateTempFileFromPath(string pathSource, string pathDir, string repoCode, string fileName);
        JMessage DeleteFileTemp(string filePath);
    }

    public class UploadService : IUploadService
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;

        public UploadService(IHostingEnvironment hostingEnvironment, EIMDBContext context)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
        }
        public JMessage GetPathByModule(string module)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var category = _context.EDMSCategorys.FirstOrDefault(x => x.ModuleFileUploadDefault == module);
                var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.CatCode == category.CatCode);
                mess.Object = new EDMSCatRepoSetting
                {
                    Path = setting.Path,
                    FolderId = setting.FolderId,
                    ReposCode = setting.ReposCode,
                    CatCode = setting.CatCode,
                };
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public Stream GetStreamByModule(string fileName, string module)
        {
            var category = _context.EDMSCategorys.FirstOrDefault(x => x.ModuleFileUploadDefault == module);
            var categoryFiles = _context.EDMSRepoCatFiles.Where(x => x.CatCode == category.CatCode);
            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileName == fileName && categoryFiles.Any(y => y.FileCode == x.FileCode) && !x.IsDeleted);
            if (file != null)
            {
                var repository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == file.ReposCode);
                if (repository != null)
                {
                    if (repository.Type == "SERVER")
                    {
                        string ftphost = repository.Server;
                        string ftpfilepath = file.Url;
                        var urlEnd = HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(repository.Account, repository.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            return new MemoryStream(fileData);
                        }
                    }

                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == repository.Token);
                        var fileData = FileExtensions.DownloadFileGoogle(apiTokenService.CredentialsJson, apiTokenService.RefreshToken, file.CloudFileId, apiTokenService.Email);
                        return new MemoryStream(fileData);
                    }
                }

                return null;
            }

            return null;
        }
        public JMessage UploadFile(IFormFile fileUpload, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileUpload.FileName));
                fileName = CommonUtil.ConvertFileName(fileName);
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileUpload.CopyTo(stream);
                }
                mess.Object = fileName;
                //fileUpload.CopyTo(new FileStream(fullPath, FileMode.Create));
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public virtual JMessage UploadImage(IFormFile fileUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileUpload.FileName));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileUpload.CopyTo(stream);
                }
                mess.Object = fileName;
                //fileUpload.CopyTo(new FileStream(fullPath, FileMode.Create));
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public virtual JMessage UploadImage(IFormFile fileUpload, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileUpload.FileName));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileUpload.CopyTo(stream);
                }
                mess.Object = fileName;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public virtual JMessage UploadImage(Image fileUpload, string fileName)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var filePath = Path.GetTempFileName();
                var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                fileUpload.GetThumbnailImage(200, 260, null, IntPtr.Zero);
                fileUpload.Save(pathUpload + "\\" + fileName);
                mess.Object = fileName;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public Image Base64ToImage(string base64String)
        {
            // Convert Base64 String to byte[]
            byte[] imageBytes = Convert.FromBase64String(base64String);
            MemoryStream ms = new MemoryStream(imageBytes, 0, imageBytes.Length);

            // Convert byte[] to Image
            ms.Write(imageBytes, 0, imageBytes.Length);
            Image image = Image.FromStream(ms, true);

            return image;
        }

        public JMessage UploadFileByBytes(byte[] bytes, string fileName1, string root, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var path = pathUpload;
                pathUpload = Path.Combine(root, pathUpload);
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileName1));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                path = Path.Combine(path, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    stream.Write(bytes, 0, bytes.Length);
                    stream.Flush();
                }
                mess.Object = path;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }
        public JMessage UploadFileByStream(Stream fileStream, string fileName1, string root, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var path = pathUpload;
                pathUpload = Path.Combine(root, pathUpload);
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                var fileName = FileExtensions.CleanFileName(Path.GetFileName(fileName1));
                fileName = Path.GetFileNameWithoutExtension(fileName)
                          + "_"
                          + Guid.NewGuid().ToString().Substring(0, 8)
                          + Path.GetExtension(fileName);
                var fullPath = Path.Combine(pathUpload, fileName);
                path = Path.Combine(path, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    fileStream.CopyTo(stream);
                }
                mess.Object = path;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Title = ex.Message;
            }
            return mess;
        }

        public class Res
        {
            public int Id { get; set; }
            public string Server { get; set; }
            public string Token { get; set; }
            public string Type { get; set; }
            public string Url { get; set; }
            public string FileId { get; set; }
            public string FileTypePhysic { get; set; }
            public string FileName { get; set; }
            public string MimeType { get; set; }
            public string Account { get; set; }
            public string PassWord { get; set; }
            public string FileCode { get; set; }
            public bool? IsFileMaster { get; set; }
            public bool? IsFileOrigin { get; set; }
            public int? FileParentId { get; set; }
            public int FileID { get; set; }
        }
        public JMessage CreateTempFileFromPath(string pathSource, string pathDir, string repoCode, string fileName)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var data = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode.Equals(repoCode));

                if (!string.IsNullOrEmpty(data.Server))
                {
                    string ftphost = data.Server;
                    string ftpfilepath = pathSource;
                    var urlEnd = HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        var fileStream = request.OpenRead(urlEnd);
                        JMessage msg1 = UploadFileByStream(fileStream, fileName,
                            _hostingEnvironment.WebRootPath, pathDir);
                        string path = msg1.Object.ToString();
                        var url = path.Replace("\\", "/");
                        msg1.Object = url;
                        return msg1;
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
            }

            return msg;
        }
        
        [HttpPost]
        public JMessage DeleteFileTemp(string filePath)
        {
            var msg = new JMessage { Title = "Xóa file temp thành công!", Error = false };
            try
            {
                var path = _hostingEnvironment.WebRootPath + "/" + filePath;
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
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
                            c.FileTypePhysic,
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
                    var urlEnd = HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
            }

            return fileStream;
        }

        [NonAction]
        public JMessage UploadFileToServer(byte[] fileByteArr, string repoCode, string catCode, string fileName,
            string contentType)
        {
            var msg = new JMessage { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var data = (from a in _context.EDMSCatRepoSettings.Where(x =>
                        x.ReposCode.Equals(repoCode) && x.CatCode.Equals(catCode))
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
                    var urlFileServer = HttpUtility.UrlPathEncode("ftp://" + data.Server + urlFile);
                    var result = FileExtensions.UploadFileToFtpServer(urlFileServer, urlFileServer, fileBytes,
                        data.Account, data.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure ||
                        result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        //msg.Title = "Kết nối thất bại!";

                        return msg;
                    }

                    if (result.Status == WebExceptionStatus.Success)
                    {
                        msg.Object = urlFile;
                        if (result.IsSaveUrlPreventive)
                        {
                            //urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Có lỗi xảy ra!";
                        return msg;
                    }
                }
                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    Stream stream = new MemoryStream(fileByteArr);
                    var apiTokenService =
                        _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    msg.Object = FileExtensions.UploadFileToDrive(json, token, fileName, stream, contentType,
                        data.FolderId, user);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }
        [NonAction]
        public JMessage UploadStreamToServer(Stream fileStream, string repoCode, string catCode, string fileName,
            string contentType)
        {
            var msg = new JMessage { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var data = (from a in _context.EDMSCatRepoSettings.Where(x =>
                        x.ReposCode.Equals(repoCode) && x.CatCode.Equals(catCode))
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
                    //var fileBytes = fileByteArr;
                    var urlFile = string.Concat(data.Path, "/", fileName);
                    var urlFileServer = HttpUtility.UrlPathEncode("ftp://" + data.Server + urlFile);
                    var result = FileExtensions.UploadStreamToFtpServer(urlFileServer, urlFileServer, fileStream,
                        data.Account, data.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure ||
                        result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        //msg.Title = "Kết nối thất bại!";

                        return msg;
                    }

                    if (result.Status == WebExceptionStatus.Success)
                    {
                        msg.Object = urlFile;
                        if (result.IsSaveUrlPreventive)
                        {
                            //urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Có lỗi xảy ra!";
                        return msg;
                    }
                }
                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    var apiTokenService =
                        _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    msg.Object = FileExtensions.UploadFileToDrive(json, token, fileName, fileStream, contentType,
                        data.FolderId, user);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }

    }
    public class JmessageExtension : JMessage
    {
        public string FileName { get; set; }
    }
}
