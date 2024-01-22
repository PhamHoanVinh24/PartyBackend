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
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsCourseController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsCourseController> _stringLocalizerLmsCourse;
        private readonly IStringLocalizer<LmsPracticeTestController> _stringLocalizerLmsExam;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public LmsCourseController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer,
            IStringLocalizer<LmsCourseController> stringLocalizerLmsCourse,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms, IOptions<AppSettings> appSettings,
            IStringLocalizer<LmsPracticeTestController> stringLocalizerLmsExam,
             IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLmsCourse = stringLocalizerLmsCourse;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerLmsExam = stringLocalizerLmsExam;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _appSettings = appSettings.Value;
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

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbLMSCourse"] = _sharedResources["COM_CRUMB_LMS_COURSE"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTableCategory([FromBody] LmsCourseJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LmsCourses.Where(x => x.IsDeleted == false
                        && (String.IsNullOrEmpty(jTablePara.CourseCode) || x.CourseCode.Contains(jTablePara.CourseCode))
                        && (String.IsNullOrEmpty(jTablePara.CourseName) || x.CourseName.Contains(jTablePara.CourseName)))
                        select new
                        {
                            a.Id,
                            a.CourseCode,
                            a.CourseName,
                            a.CourseNote,
                            a.ImgCover,
                            a.Duration,
                            a.Unit,
                            a.Status,
                            a.Flag,
                            a.VideoPresent,
                            a.FileBase,
                            a.Rating,
                        };

            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CourseCode", "CourseName", "CourseNote", "ImgCover", "Duration", "Unit", "Status", "Flag", "VideoPresent", "FileBase", "Rating");
            return Json(jdata);
        }
        #endregion

        #region Function
        [HttpPost]
        public object Insert([FromBody] LmsCourse data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsCourses.FirstOrDefault(x => x.CourseCode == data.CourseCode);
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    data.IsDeleted = false;
                    _context.LmsCourses.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_ADD_SUCCESS"];
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _sharedResources["LMS_COURSE_LBL_COURSE_EXIST"];
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object UpdateAll([FromBody] LmsCourse data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsCourses.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;
                    item.CourseCode = data.CourseCode;
                    item.CourseName = data.CourseName;
                    item.CourseNote = data.CourseNote;
                    item.ImgCover = data.ImgCover;
                    item.Duration = data.Duration;
                    item.Unit = data.Unit;
                    item.Flag = data.Flag;
                    item.Status = data.Status;
                    item.VideoPresent = data.VideoPresent;
                    item.FileBase = data.FileBase;
                    item.Rating = data.Rating;
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object InsertCourseSubject([FromBody] LmsLectureSubjectCourse data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsLectureSubjectCourses.FirstOrDefault(x => x.CourseCode == data.CourseCode && x.SubjectCode == data.SubjectCode && x.LectureCode == data.LectureCode);
                if (model == null)
                {
                    _context.LmsLectureSubjectCourses.Add(data);
                    _context.SaveChanges();
                    //msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_ADD_SUCCESS"];
                    //msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object DeleteCourseSubject([FromBody] LmsLectureSubjectCourse data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.LmsLectureSubjectCourses.FirstOrDefault(x => x.CourseCode == data.CourseCode && x.SubjectCode == data.SubjectCode && x.LectureCode == data.LectureCode);
                if (obj == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_ERR_DELETE"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.LmsLectureSubjectCourses.Remove(obj);
                    _context.SaveChanges();
                    //msg.Title = _sharedResources["COM_ERR_DELETE"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object UpdateListSubject([FromBody] LmsCourse data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsCourses.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.ListSubject = data.ListSubject;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = User.Identity.Name;
                    _context.SaveChanges();
                    msg.Object = item.CourseCode;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.LmsCourses.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["LMS_COURSE_LBL_COURSE_NOT_EXIST"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    _context.LmsCourses.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_MSG_DELETE_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetItemCourse(int id)
        {
            var data = _context.LmsCourses.FirstOrDefault(x => x.Id.Equals(id));
            return Json(data);
        }
        [HttpPost]
        public object GetItemSubject(string subjectCode)
        {
            var data = _context.LmsSubjectManagements.FirstOrDefault(x => x.SubjectCode.Equals(subjectCode));
            return Json(data);
        }
        [HttpPost]
        public object GetListSubject()
        {
            var data = _context.LmsSubjectManagements.Select(x => new { Code = x.SubjectCode, Name = x.SubjectName }).ToList();
            return data;
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertObjectFileCourse(FilePluginModel obj, IFormFile fileUpload)
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
                msg.Object = _appSettings.UrlMain + "/uploads/repository" + urlFile;
                msg.Title = _stringLocalizerLms["LMS_ADD_FILE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Model
        public class ExamJTableModel : JTableModel
        {
            public int? ParentCode { get; set; }
        }
        public class LmsCourseJTableModel : JTableModel
        {
            public string CourseCode { get; set; }
            public string CourseName { get; set; }
            //public string CourseNote { get; set; }
            //public string ImgCover { get; set; }
            //public int? Duration { get; set; }
            //public string Unit { get; set; }
            //public int? Status { get; set; }
            //public int? Flag { get; set; }
            //public string VideoPresent { get; set; }
            //public string FileBase { get; set; }
            //public int? Rating { get; set; }
            //public string CreatedBy { get; set; }
            //public DateTime? CreatedTime { get; set; }
            //public string UpdatedBy { get; set; }
            //public DateTime? UpdatedTime { get; set; }
            //public bool? IsDeleted { get; set; }
            //public string DeletedBy { get; set; }
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
                .Union(_stringLocalizerLmsCourse.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsExam.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
