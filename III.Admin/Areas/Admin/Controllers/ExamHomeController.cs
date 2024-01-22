using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ExamHomeController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public ExamHomeController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer, IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }
        }

        [Breadcrumb("ViewData.CrumbCusHome", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuCenterController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbCusHome"] = _sharedResources["Khóa học"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTableCategory([FromBody]ExamJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EduCategorys.Where(x => x.Published == true && (x.Parent.Equals(jTablePara.ParentCode) && jTablePara.ParentCode != null))
                        select new
                        {
                            a.Id,
                            a.Name,
                            a.Description,
                            a.Image,
                            Type = ""
                        };

            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Name", "Description", "Image", "Type");
            return Json(jdata);
        }
        #endregion

        #region Function
        [HttpPost]
        public object GetListCourse()
        {
            var data = _context.EduCategorys.Where(x => x.Published == true && x.ExtraFieldsGroup.Equals(1)).ToList();
            return data;
        }
        [HttpPost]
        public object GetListCategoryByParent(int parentCode)
        {
            var data = _context.EduCategorys.Where(x => x.Published == true && x.Parent.Equals(parentCode)).ToList();
            return data;
        }

        [HttpPost]
        public object GetListLectureByCategory(int categoryCode)
        {
            var listSection = _context.EduCategorys.Where(x => x.Published == true && x.Parent.Equals(categoryCode)).ToList();
            var data = _context.EduLectures.Where(x => x.published == true && listSection.Any(p => p.Id.Equals(x.cat_id))).ToList();
            return data;
        }

        [HttpPost]
        public object GetListQuestionByLecture(int categoryCode)
        {
            var listSection = _context.EduCategorys.Where(x => x.Published == true && x.Parent.Equals(categoryCode)).ToList();
            var data = _context.QuizPools.Where(x => !x.IsDeleted && listSection.Any(p => p.Id.Equals(x.Category))).ToList();
            return data;
        }
        #endregion

        #region Comment
        [HttpPost]
        public object InsertComment([FromBody] LectureDiscuss obj)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LectureDiscusss.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (model == null)
                {
                    obj.UserId = ESEIM.AppContext.UserId;
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    _context.LectureDiscusss.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    msg.ID = obj.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bình luận đã tồn tại";
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }


        [HttpPost]
        public object UpdateComment([FromBody] LectureDiscuss obj)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LectureDiscusss.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (model == null)
                {
                    msg.Error = true;
                    msg.Title = "Cập nhật thất bại";
                    msg.ID = obj.Id;
                }
                else
                {
                    model.Comment = obj.Comment;
                    _context.LectureDiscusss.Update(model);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                    msg.ID = obj.Id;
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }

        [HttpPost]
        public object DeleteComment(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.LectureDiscusss.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Bình luận không tồn tại";
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.LectureDiscusss.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                return msg;
            }
        }

        [HttpPost]
        public object GetListComment(int parentId)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var listData = (from a in _context.LectureDiscusss.Where(x => !x.IsDeleted && x.ParentId.Equals(parentId))
                                join d in _context.Users.Where(x => x.Active) on a.UserId equals d.Id
                                let listFile = from b in _context.EDMSRepoCatFiles.Where(x => x.ObjectType.Equals("COMMENT") && x.ObjectCode.Equals(a.Id.ToString()))
                                               join c in _context.EDMSFiles.Where(x => !x.IsDeleted) on b.FileCode equals c.FileCode
                                               select new
                                               {
                                                   b.Id,
                                                   c.FileName,
                                                   c.FileTypePhysic
                                               }
                                select new
                                {
                                    a.Id,
                                    a.ParentId,
                                    a.Comment,
                                    a.UserId,
                                    a.CreatedTime,
                                    a.UpdatedTime,
                                    d.GivenName,
                                    d.Picture,
                                    ListFile = listFile
                                });

                msg.Object = listData;
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
        public object GetFileItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var path = "";
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
                                Token = (b != null ? b.Token : null),
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
                    if (data.Type == "SERVER")
                    {
                        string ftphost = data.Server;
                        string ftpfilepath = data.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                            path = msg1.Object.ToString();
                            path = "/" + path.Replace("\\", "/");
                        }
                    }
                    else
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                        var json = apiTokenService.CredentialsJson;
                        var user = apiTokenService.Email;
                        var token = apiTokenService.RefreshToken;
                        byte[] fileData = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
                        JMessage msg1 = UploadFileByBytes(fileData, data.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        path = msg1.Object.ToString();
                        path = "/" + path.Replace("\\", "/");
                    }
                }

                msg.Object = path;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }

            
            return msg;
        }

        public JMessage UploadFileByBytes(byte[] bytes, string fileName, string root, string pathUpload)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var path = pathUpload;
                pathUpload = Path.Combine(root, pathUpload);
                var filePath = Path.GetTempFileName();
                if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
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

        [HttpPost]
        public object AddFileComment(IFormFile fileUpload, string objCode)
        {
            var msg = new JMessage() { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                var fileSize = fileUpload.Length;
                if ((fileSize / 1048576.0) > 1000)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["EDMSR_MSG_FILE_SIZE_LIMIT_UPLOAD"];
                    return Json(msg);
                }

                string pathFTP = path_upload_file;
                var fileName = fileUpload.FileName;
                var fileId = "";

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repos_code);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    using (var ms = new MemoryStream())
                    {
                        fileUpload.CopyTo(ms);

                        var fileBytes = ms.ToArray();
                        urlFile = pathFTP + Path.Combine("/", fileName);
                        var urlFilePreventive = pathFTP + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileName);
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                        var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                        var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                        if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["WBS_MSG_ERR_CONNECTION"];
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
                        }
                    }
                }
                else
                {
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    fileId = FileExtensions.UploadFileToDrive(json, token, fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, path_upload_file, user);
                }
                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat("COMMENT", Guid.NewGuid().ToString()),
                    ReposCode = repos_code,
                    CatCode = cat_code,
                    ObjectCode = objCode,
                    ObjectType = "COMMENT",
                    Path = host_type == 0 ? path_upload_file : "",
                    FolderId = host_type == 1 ? path_upload_file : ""
                };

                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, new FormFile(fileStream, 0, fileStream.Length), string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = fileName,
                    Desc = "",
                    ReposCode = repos_code,
                    Tags = "",
                    FileSize = fileUpload.Length,
                    FileTypePhysic = extension,
                    NumberDocument = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    Url = urlFile,
                    MimeType = fileUpload.ContentType,
                    CloudFileId = fileId,
                };

                _context.EDMSFiles.Add(file);
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);
                _context.SaveChanges();

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
        public JsonResult DeleteFileComment(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
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
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Xóa file lỗi";
            }
            return Json(msg);
        }
        #endregion

        #region Model
        public class ExamJTableModel : JTableModel
        {
            public int? ParentCode { get; set; }
        }
        #endregion
    }
}
