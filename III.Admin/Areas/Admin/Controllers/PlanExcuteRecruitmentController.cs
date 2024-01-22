using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using III.Domain.Enums;
using System.Net;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class PlanExcuteRecruitmentController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _upload;
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<PlanExcuteRecruitmentController> _stringLocalizer;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public readonly string module_name = "RECRUITMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;

        public class JTableModelCustom : JTableModel
        {
            public string RecruitmentCode { get; set; }
            public string Title { get; set; }
        }
        public PlanExcuteRecruitmentController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<PlanExcuteRecruitmentController> stringLocalizer, IStringLocalizer<EDMSRepositoryController> edmsRepositoryController,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _edmsRepositoryController = edmsRepositoryController;
            _sharedResources = sharedResources;
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
        [Breadcrumb("ViewData.PlanExcuteRecruitment", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["PlanExcuteRecruitment"] = _stringLocalizer["PER_RECRUITMENT_EXCUTE"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.PlanExcuteRecruitmentHeaders.Where(x => !x.IsDeleted)
                         join b in _context.LMSSubjects.Where(x => !x.IsDeleted) on a.SubjectCode equals b.LmsSubjectCode
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(jTablePara.RecruitmentCode) || a.RecruitmentCode.Contains(jTablePara.RecruitmentCode)) &&
                               (string.IsNullOrEmpty(jTablePara.Title) || a.Title.Contains(jTablePara.Title))
                         select new
                         {
                             a.Id,
                             a.RecruitmentCode,
                             a.Title,
                             a.StartTime,
                             a.EndTime,
                             a.SubjectCode,
                             SubjectName = b.LmsSubjectName,
                             a.Status,
                             StatusName = c != null ? c.ValueSet : ""
                         });
            var count = query.Count();
            var data = query
               .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "RecruitmentCode", "Title", "StartTime", "EndTime", "SubjectCode", "SubjectName", "Status", "StatusName");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableDetail([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted && x.RecruitmentCode.Equals(jTablePara.RecruitmentCode))
                         join b in _context.CandiateBasic on a.CandidateCode equals b.CandidateCode
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         select new
                         {
                             a.Id,
                             a.RecruitmentCode,
                             a.CandidateCode,
                             CandidateName = b.Fullname,
                             a.Result,
                             a.Note,
                             a.Status,
                             StatusName = c != null ? c.ValueSet : ""
                         });
            var count = query.Count();
            var data = query
               .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "RecruitmentCode", "CandidateCode", "CandidateName", "Result", "Note", "Status", "StatusName");
            return Json(jdata);
        }
        #endregion

        #region Header
        [HttpPost]
        public JsonResult Insert([FromBody]PlanExcuteRecruitmentHeader obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startTime = !string.IsNullOrEmpty(obj.sStartTime) ? DateTime.ParseExact(obj.sStartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.sEndTime) ? DateTime.ParseExact(obj.sEndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

                var checkExist = _context.PlanExcuteRecruitmentHeaders.FirstOrDefault(x => !x.IsDeleted && x.RecruitmentCode.Equals(obj.RecruitmentCode));
                if (checkExist == null)
                {
                    obj.StartTime = startTime;
                    obj.EndTime = endTime;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.PlanExcuteRecruitmentHeaders.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["PER_RECRUITMENT_CODE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["PER_RECRUITMENT_EXCUTE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]PlanExcuteRecruitmentHeader obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var startTime = !string.IsNullOrEmpty(obj.sStartTime) ? DateTime.ParseExact(obj.sStartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                var endTime = !string.IsNullOrEmpty(obj.sEndTime) ? DateTime.ParseExact(obj.sEndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;

                var data = _context.PlanExcuteRecruitmentHeaders.Where(x => !x.IsDeleted && x.RecruitmentCode.Equals(obj.RecruitmentCode)).FirstOrDefault();
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.StartTime = startTime;
                    data.EndTime = endTime;
                    data.Status = obj.Status;
                    data.PlanNumber = obj.PlanNumber;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PlanExcuteRecruitmentHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["PER_RECRUITMENT_EXCUTE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["SVC_MSG_SERVICE_CODE_NO_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.PlanExcuteRecruitmentHeaders.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.PlanExcuteRecruitmentHeaders.Update(data);
                    _context.SaveChanges();

                    var edmsRepoCatFile = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode.Equals(data.RecruitmentCode) && x.ObjectType.Equals(EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcHeader)));
                    foreach (var item in edmsRepoCatFile)
                    {
                        DeleteFile(item.Id);
                    }

                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PER_RECRUITMENT_EXCUTE_NOT_FOUND"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        public object GetItem(int id)
        {
            var data = _context.PlanExcuteRecruitmentHeaders.AsNoTracking().Single(m => m.Id == id);
            data.sStartTime = data.StartTime.HasValue ? data.StartTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
            data.sEndTime = data.EndTime.HasValue ? data.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "";
            return Json(data);
        }
        #endregion

        #region Detail
        [HttpPost]
        public JsonResult InsertDetail([FromBody]PlanExcuteRecruitmentDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.PlanExcuteRecruitmentDetails.FirstOrDefault(x => !x.IsDeleted && x.RecruitmentCode.Equals(obj.RecruitmentCode) && x.CandidateCode.Equals(obj.CandidateCode));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.PlanExcuteRecruitmentDetails.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["PER_DETAIL_CANDIDATE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["PER_DETAIL_CANDIDATE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateDetail([FromBody]PlanExcuteRecruitmentDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted && x.RecruitmentCode.Equals(obj.RecruitmentCode) && x.CandidateCode.Equals(obj.CandidateCode)).FirstOrDefault();
                if (data != null)
                {
                    data.Status = obj.Status;
                    data.Note = obj.Note;
                    data.Status = obj.Status;
                    data.Result = obj.Result;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.PlanExcuteRecruitmentDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["PER_DETAIL_CANDIDATE"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PER_DETAIL_CANDIDATE_NOT_EXIT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object DeleteDetail(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.PlanExcuteRecruitmentDetails.FirstOrDefault(x => x.Id == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.PlanExcuteRecruitmentDetails.Update(data);
                    _context.SaveChanges();

                    var edmsRepoCatFile = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode.Equals(data.RecruitmentCode) && x.ObjectType.Equals(EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcDetail)));
                    foreach (var item in edmsRepoCatFile)
                    {
                        DeleteFile(item.Id);
                    }

                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PER_DETAIL_CANDIDATE_NOT_FOUND"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        public object GetItemDetail(int id)
        {
            var data = _context.PlanExcuteRecruitmentDetails.AsNoTracking().Single(m => m.Id == id);
            return Json(data);
        }
        #endregion

        #region File
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        if (obj.ObjectType.Equals(EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcHeader)))
                        {
                            var suggesstion = GetSuggestionsRecruitmentHeaderFile(obj.ObjectCode);
                            if (suggesstion != null)
                            {
                                reposCode = suggesstion.ReposCode;
                                path = suggesstion.Path;
                                folderId = suggesstion.FolderId;
                                catCode = suggesstion.CatCode;
                            }
                            else
                            {
                                var setting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
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
                                //msg.Title = _stringLocalizer["Vui lòng vào mở rộng để tải tệp trước"];
                                //return Json(msg);
                            }
                        }
                        else
                        {
                            var suggesstion = GetSuggestionsRecruitmentDetailFile(obj.ObjectCode);
                            if (suggesstion != null)
                            {
                                reposCode = suggesstion.ReposCode;
                                path = suggesstion.Path;
                                folderId = suggesstion.FolderId;
                                catCode = suggesstion.CatCode;
                            }
                            else
                            {
                                var setting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
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
                                //msg.Title = _stringLocalizer["Vui lòng vào mở rộng để tải tệp trước"];
                                //return Json(msg);
                            }
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
                            var defaultSetting = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
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
                            //msg.Title = _stringLocalizer["Vui lòng chọn thư mục lưu trữ!"];
                            //return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
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
                                    urlFile = urlFilePreventive;
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
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("RECRUITMENT_", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.ObjectCode,
                        ObjectType = obj.ObjectType,
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, /*string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex")*/ luceneCategory.PathServerPhysic);

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
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
                    msg.Title = _sharedResources["COM_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
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

        [HttpPost]
        public object GetListFileHeader(string objCode)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == objCode && x.ObjectType == EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcHeader))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            b.FileCode,
                            b.FileName,
                            b.FileTypePhysic,
                            b.Desc,
                            b.CreatedTime,
                            b.CloudFileId,
                            TypeFile = "NO_SHARE",
                            ReposName = f != null ? f.ReposName : "",
                            b.FileID,
                            SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                        };

            return Json(query);
        }

        [HttpPost]
        public object GetListFileDetail(string objCode)
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == objCode && x.ObjectType == EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcDetail))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            b.FileCode,
                            b.FileName,
                            b.FileTypePhysic,
                            b.Desc,
                            b.CreatedTime,
                            b.CloudFileId,
                            TypeFile = "NO_SHARE",
                            ReposName = f != null ? f.ReposName : "",
                            b.FileID,
                            SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                        };

            return Json(query);
        }

        [HttpPost]
        public JsonResult DeleteFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                LuceneExtension.DeleteIndexFile(file.FileCode, /*_hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex"*/ luceneCategory.PathServerPhysic);
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
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsRecruitmentHeaderFile(string objCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == objCode && x.ObjectType == EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcHeader)).MaxBy(x => x.Id);
            return query;
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsRecruitmentDetailFile(string objCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == objCode && x.ObjectType == EnumHelper<Recruitment>.GetDisplayValue(Recruitment.RecruitmentExcDetail)).MaxBy(x => x.Id);
            return query;
        }
        #endregion

        #region Combobox
        [HttpPost]
        public object GetListSubject()
        {
            var data = _context.LMSSubjects.Where(x => !x.IsDeleted).Select(p => new { Code = p.LmsSubjectCode, Name = p.LmsSubjectName });
            return Json(data);
        }

        [HttpPost]
        public object GetListCadidate()
        {
            var data = _context.CandiateBasic.Select(p => new { Code = p.CandidateCode, Name = p.Fullname });
            return Json(data);
        }

        [HttpPost]
        public object GetListStatusHeader()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_EXAM")).Select(p => new { Code = p.CodeSet, Name = p.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public object GetListStatusDetail()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_CANDIDATE_EXAM")).Select(p => new { Code = p.CodeSet, Name = p.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public object GetListPlanRecruitment()
        {
            var data = _context.PlanRecruitmentHeaders.Where(x => !x.IsDeleted && x.Status.Equals("FINAL_DONE")).Select(x => new { Code = x.PlanNumber, Name = x.Title });
            return Json(data);
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class FileModel
        {
            public string ObjectCode { get; set; }
            public string ObjectType { get; set; }
        }
        #endregion
    }
}