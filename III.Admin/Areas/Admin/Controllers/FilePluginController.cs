using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Aspose.Pdf.Operators;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FilePluginController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<AssetTypeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _upload;
        private readonly AppSettings _appSettings;
        private readonly IRepositoryService _repositoryService;
        public string module_name = "";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public FilePluginController(EIMDBContext context, IStringLocalizer<AssetTypeController> stringLocalizer, IRepositoryService repositoryService,
            IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment, IUploadService upload, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _appSettings = appSettings.Value;
            _repositoryService = repositoryService;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region ContractFile
        public class JTableModelFile : JTableModel
        {
            public string ObjCode { get; set; }
            public string ObjType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody] JTableModelFile jTablePara)
        {
            try
            {
                if (string.IsNullOrEmpty(jTablePara.ObjCode))
                {
                    return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic",
                        "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "SizeOfFile",
                        "FileID", "ListUserShare");
                }
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                //var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                //                                               .Select(p => new
                //                                               {
                //                                                   p.FileID,
                //                                                   p.ListUserShare,
                //                                                   p.UserShares
                //                                               }).ToList();
                var session = HttpContext.GetSessionUser();

                //var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode.Equals(jTablePara.ObjCode) && x.ObjectType.Equals(jTablePara.ObjType))
                //              join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                //              join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                //              from f in f1.DefaultIfEmpty()
                //              join g in listFileByUser on b.FileCode equals g.FileID into g1
                //              from g in g1.DefaultIfEmpty()
                //              where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) || b.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                //              select new
                //              {
                //                  a.Id,
                //                  b.FileCode,
                //                  b.FileName,
                //                  b.FileTypePhysic,
                //                  b.Desc,
                //                  b.CreatedTime,
                //                  b.CloudFileId,
                //                  TypeFile = "NO_SHARE",
                //                  ReposName = f != null ? f.ReposName : "",
                //                  b.FileID,
                //                  SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                //                  ListUserShare = g.ListUserShare,
                //                  b.CreatedBy,
                //                  Url = f.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server) ? _appSettings.UrlMain + "/uploads/repository" + b.Url : b.Url,
                //              }).Union(
                //      from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                //      join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                //      join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                //      join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                //      from f in f1.DefaultIfEmpty()
                //      let rela = JsonConvert.DeserializeObject<ObjRelativeContract>(a.ObjectRelative)
                //      where rela.ObjectInstance.Equals(jTablePara.ObjCode)
                //        && rela.ObjectType.Equals(jTablePara.ObjType)
                //      select new
                //      {
                //          Id = b.FileID,
                //          b.FileCode,
                //          b.FileName,
                //          b.FileTypePhysic,
                //          Desc = b.Desc != null ? b.Desc : "",
                //          b.CreatedTime,
                //          b.CloudFileId,
                //          TypeFile = "SHARE",
                //          ReposName = f != null ? f.ReposName : "",
                //          b.FileID,
                //          SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                //          ListUserShare = a.ListUserShare,
                //          b.CreatedBy,
                //          Url = f.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server) ? _appSettings.UrlMain + "/uploads/repository" + b.Url : b.Url,
                //      })).AsNoTracking();
            
                string[] param = new string[] { "@ObjectCode", "@ObjectType", "@UserName" };
                object[] val = new object[] { jTablePara.ObjCode, jTablePara.ObjType, session.UserName};
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_FILE_PLUGIN", param, val);
                var query = CommonUtil.ConvertDataTable<CardJobController.FileCardJob>(rs);
                int count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode",
                    "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName",
                    "TypeFile", "SizeOfFile", "FileID", "ListUserShare", "CreatedBy", "Url");
                return jdata;
            }
            catch (Exception ex)
            {
                var data = new List<object>();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, 0, "Id", "FileCode",
                    "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName",
                    "TypeFile", "SizeOfFile", "FileID", "ListUserShare", "CreatedBy", "Url");
                return jdata;
            }
        }

        [HttpPost]
        public object GetCurrentPath(string moduleName, string objectCode, string objectType)
        {
            string reposCode = "";
            string path = "";
            var defaultSetting = (EDMSCatRepoSetting)_upload.GetPathByModule(moduleName).Object;
            var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted && x.ObjectCode.Equals(objectCode) && x.ObjectType.Equals(objectType));
            if (repoDefault != null)
            {
                reposCode = repoDefault.ReposCode;
                path = repoDefault.Path;
            }
            else
            {
                if (defaultSetting.Path == "")
                {
                    host_type = 1;
                    path_upload_file = defaultSetting.FolderId;
                }
                else
                {
                    host_type = 0;
                    path_upload_file = defaultSetting.Path;
                }
                reposCode = defaultSetting.ReposCode;
                path = host_type == 0 ? path_upload_file : "";
            };
            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                return _appSettings.UrlMain + "/uploads/repository" + path;
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                return "https://drive.google.com/file/d/";
            }
            return "";
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertObjectFile(FilePluginModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                string reposCode = "";
                string catCode = "";
                string path = "";
                string folderId = "";
                //Chọn file ngắn gọn
                if (!obj.IsMore)
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
                        if (setting == null)
                        {
                            msg.Error = true;
                            msg.Title = "Đối tượng chưa được set thư mục mặc định, vui lòng chọn thư mục để lưu lại";
                            return Json(msg);
                        }
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
                        var defaultSetting = (EDMSCatRepoSetting)_upload.GetPathByModule(obj.ModuleName).Object;
                        if (defaultSetting == null)
                        {
                            msg.Error = true;
                            msg.Title = "Đối tượng chưa được set thư mục mặc định, vui lòng chọn thư mục để lưu lại";
                            return Json(msg);
                        }
                        reposCode = defaultSetting.ReposCode;
                        catCode = defaultSetting.CatCode;
                        if (defaultSetting.Path == "")
                        {
                            host_type = 1;
                            path_upload_file = defaultSetting.FolderId;
                        }
                        else
                        {
                            host_type = 0;
                            path_upload_file = defaultSetting.Path;
                        }
                        path = host_type == 0 ? path_upload_file : "";
                        folderId = host_type == 1 ? path_upload_file : "";
                        //msg.Error = true;
                        //msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_ADD_CHOOSE_FILE"]);
                        //return Json(msg);
                    }
                }
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => !x.IsDeleted && x.ReposCode == reposCode);
                if (getRepository == null)
                {
                    msg.Error = true;
                    msg.Title = "Đối tượng chưa được set thư mục mặc định, vui lòng chọn thư mục để lưu lại";
                    return Json(msg);
                }
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
                                urlFile = /*_appSettings.UrlMain + "/uploads/repository" +*/ urlFilePreventive;
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
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    fileId = FileExtensions.UploadFileToDrive(json, token, fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId, user);
                    urlFile = "https://drive.google.com/file/d/" + fileId + "/preview";
                }
                var edmsReposCatFile = new EDMSRepoCatFile
                {
                    FileCode = string.Concat(EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract), Guid.NewGuid().ToString()),
                    ReposCode = reposCode,
                    CatCode = catCode,
                    ObjectCode = obj.ObjectCode,
                    ObjectType = obj.ObjectType,
                    Path = path,
                    FolderId = folderId
                };
                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                /// created Index lucene
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
                }
                //var luceneRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == moduleObj.ReposCode);
                //LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(luceneRepo.PathPhysic, moduleObj.Path.Replace("//", "\\")));

                //add File
                var file = new EDMSFile
                {
                    FileCode = edmsReposCatFile.FileCode,
                    FileName = fileUpload.FileName,
                    Desc = obj.Desc != null ? obj.Desc : "",
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
                msg.Object = obj.UUID;
                msg.ID = edmsReposCatFile.Id;
                msg.Title = "Thêm tệp tin thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteObjectFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
                try
                {

                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    if (Directory.Exists(luceneCategory.PathServerPhysic))
                    {
                        LuceneExtension.DeleteIndexFile(file.FileCode, /*_hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex"*/ luceneCategory.PathServerPhysic);
                    }
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
                            var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                            var json = apiTokenService.CredentialsJson;
                            var user = apiTokenService.Email;
                            var token = apiTokenService.RefreshToken;
                            FileExtensions.DeleteFileGoogleServer(json, token, file.CloudFileId, user);
                        }
                    }
                }
                catch (Exception ex)
                {
                    msg.Object = ex;
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
        public JsonResult InsertFileShareObject([FromBody] ShareFilePermission obj)
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

                    var share = new UserShare
                    {
                        Code = obj.Code,
                        Name = obj.Name,
                        DepartmentName = obj.DepartmentName,
                        Permission = obj.Permission
                    };
                    var lstUserShare = new List<UserShare>();
                    if (check == null)
                    {
                        lstUserShare.Add(share);
                        var rela = new
                        {
                            ObjectType = obj.ObjectType,
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
                            ListUserShare = JsonConvert.SerializeObject(lstUserShare)
                        };
                        _context.FilesShareObjectUsers.Add(files);
                        _context.SaveChanges();
                        msg.Title = "Chia sẻ thành công";
                    }
                    else
                    {
                        if (!string.IsNullOrEmpty(check.ListUserShare))
                        {
                            lstUserShare = JsonConvert.DeserializeObject<List<UserShare>>(check.ListUserShare);
                            var isAdded = false;
                            foreach (var item in lstUserShare)
                            {
                                if (item.Code == obj.Code)
                                {
                                    item.Permission = obj.Permission;
                                    isAdded = true;
                                    break;
                                }
                            }
                            if (isAdded)
                            {
                                check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                                check.UpdatedBy = ESEIM.AppContext.UserName;
                                check.UpdatedTime = DateTime.Now;
                                _context.FilesShareObjectUsers.Update(check);
                                _context.SaveChanges();
                                msg.Title = "Cập nhật thành công";
                            }
                            else
                            {
                                lstUserShare.Add(share);
                                check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                                check.UpdatedBy = ESEIM.AppContext.UserName;
                                check.UpdatedTime = DateTime.Now;
                                _context.FilesShareObjectUsers.Update(check);
                                _context.SaveChanges();
                                msg.Title = "Chia sẻ thành công";
                            }
                        }
                        else
                        {
                            lstUserShare.Add(share);
                            check.ListUserShare = JsonConvert.SerializeObject(lstUserShare);
                            check.UpdatedBy = ESEIM.AppContext.UserName;
                            check.UpdatedTime = DateTime.Now;
                            _context.FilesShareObjectUsers.Update(check);
                            _context.SaveChanges();
                            msg.Title = "Chia sẻ thành công";
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

        [HttpPost]
        public void AutoShareFilePermission([FromBody] AutoShareFileModel obj)
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
                        ObjectType = obj.ObjectType,
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
                        ListUserShare = obj.LstShare
                    };
                    _context.FilesShareObjectUsers.Add(files);
                    _context.SaveChanges();
                }
            }
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
                        if (data.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                        {
                            msg.ID = -1;
                            msg.Error = true;
                            msg.Title = string.Format(_stringLocalizer["EDMSR_MSG_FILE_IS_EDITING_BY"], string.Join(",", check));
                        }
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
                    //var byteData = DownloadFileFromServer(data.Id);
                    //var urlUpload = UploadFileToServer(byteData, fileRepo.ReposCode, fileRepo.CatCode, fileNew, edmsFile.MimeType);

                    var fileTempName = "File_temp" + Path.GetExtension(data.FileName);

                    if (data.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
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
                                ExcelController.pathFile = "";
                            }
                            else if (extension.Equals(".pdf"))
                            {
                                PDFController.docmodel = aseanDoc;
                                PDFController.pathFile = "";
                            }
                        }
                    }
                    else
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                        var json = apiTokenService.CredentialsJson;
                        var user = apiTokenService.Email;
                        var token = apiTokenService.RefreshToken;
                        var link = FileExtensions.OpenFileGoogle(json, token, data.FileId, user);
                        msg.Object = new
                        {
                            Type = "DRIVER",
                            Link = link,
                        };
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
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
                //fileStream = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
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
                        msg.Object = urlFile;
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
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    msg.Object = FileExtensions.UploadFileToDrive(json, token, fileName, stream, contentType, data.FolderId, user);
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

        [NonAction]
        public JMessage CopyObjectFile(int idRepoCatFile, string urlFile, string repoCodeTo, string catCodeTo, string contentType)
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

        [HttpPost]
        public JsonResult PasteObjectFile([FromBody] FilePluginPasteFileModel obj)
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
                        var edmsRepoCatFileOld = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode.Equals(edmsFileOld.FileCode));

                        switch (obj.Action)
                        {
                            case "Copy":
                                var pathFileNewCopy = edmsRepoCatFileOld.Path + string.Concat("/", Path.GetFileNameWithoutExtension(edmsFileOld.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8) + Path.GetExtension(edmsFileOld.FileName));
                                //Thực hiện copy bản file cứng
                                msg = CopyObjectFile(edmsRepoCatFileOld.Id, pathFileNewCopy, edmsRepoCatFileOld.ReposCode, edmsRepoCatFileOld.CatCode, edmsFileOld.MimeType);
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
                                        ReposCode = edmsRepoCatFileOld.ReposCode,

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
                                        CatCode = edmsRepoCatFileOld.CatCode,
                                        FileCode = edmsFileCopy.FileCode,
                                        ReposCode = edmsRepoCatFileOld.ReposCode,
                                        FolderId = edmsRepoCatFileOld.FolderId,
                                        ObjectCode = obj.ObjectCode,
                                        ObjectType = edmsRepoCatFileOld.ObjectType,
                                        Path = edmsRepoCatFileOld.Path,
                                    };
                                    _context.EDMSFiles.Add(edmsFileCopy);
                                    _context.EDMSRepoCatFiles.Add(edmsRepoCatFileCopy);
                                    _context.SaveChanges();
                                    msg.ID = edmsFileCopy.FileID;
                                }
                                else
                                {
                                    return Json(msg);
                                }
                                break;

                                //case "Move":
                                //    var pathFileNew = edmsCatRepoSettingNew.Path + string.Concat("/", Path.GetFileNameWithoutExtension(edmsFileOld.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8) + Path.GetExtension(edmsFileOld.FileName));

                                //    //Thực hiện copy bản file cứng
                                //    msg = CopyFile(edmsRepoCatFileOld.Id, pathFileNew, edmsCategoryNew.ReposCode, edmsCategoryNew.CatCode, edmsFileOld.MimeType);
                                //    msg = MoveFile(edmsRepoCatFileOld.Id);

                                //    if (!msg.Error)
                                //    {
                                //        //Nhân bản tệp ở bảng EDMS_FILE , EDMS_REPO_CAT_FILE dựa vào fileCode
                                //        edmsFileOld.Url = pathFileNew;

                                //        edmsRepoCatFileOld.ReposCode = edmsCatRepoSettingNew.ReposCode;
                                //        edmsRepoCatFileOld.CatCode = edmsCatRepoSettingNew.CatCode;
                                //        edmsRepoCatFileOld.Path = edmsCatRepoSettingNew.Path;

                                //        _context.EDMSFiles.Update(edmsFileOld);
                                //        _context.EDMSRepoCatFiles.Update(edmsRepoCatFileOld);
                                //        _context.SaveChanges();
                                //    }

                                //    break;
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
        public class AutoShareFileModel
        {
            public int Id { get; set; }
            public string LstShare { get; set; }
            public string ObjectType { get; set; }
        }
        public class ShareFilePermission
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
            public int Id { get; set; }
            public string ObjectType { get; set; }
        }
        public class UserShare
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
        }
        public class ObjRelativeContract
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }
        public class FilePluginPasteFileModel : EDMSPasteFileModel
        {
            public string ObjectCode { get; set; }
            public string ObjectType { get; set; }
        }
        public class FilePluginModel
        {
            public string FileCode { get; set; }
            public string NumberDocument { get; set; }
            public string Tags { get; set; }
            public string Desc { get; set; }
            public int? CateRepoSettingId { get; set; }
            public string CateRepoSettingCode { get; set; }
            public string Path { get; set; }
            public string FolderId { get; set; }
            public bool IsMore { get; set; }
            public bool IsScan { get; set; }
            public string RackCode { get; set; }
            public string RackPosition { get; set; }
            public string ObjPackCode { get; set; }
            public string MetaDataExt { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectType { get; set; }
            public string ModuleName { get; set; }

            public string UUID { get; set; }
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