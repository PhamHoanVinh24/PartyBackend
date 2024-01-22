using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
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
using EntityFrameworkCore.MemoryJoin;
using System.Data;
using static III.Admin.Controllers.FilePluginController;
using Microsoft.Extensions.Options;
using ESEIM;
using static III.Admin.Controllers.CMSItemController;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CrawlerMenuController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly ICardJobService _cardService;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        private readonly IStringLocalizer<DashBoardController> _stringLocalizerDashBoard;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCm;
        private readonly IRepositoryService _repositoryService;
        private readonly AppSettings _appSettings;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();
        public readonly string module_name = "CARD_JOB";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public CrawlerMenuController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            ICardJobService cardService, IFCMPushNotification notification, IGoogleApiService googleAPI,
            IStringLocalizer<LmsDashBoardController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<DashBoardController> stringLocalizerDashBoard, IStringLocalizer<CrawlerMenuController> stringLocalizerCm,
            IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms, IRepositoryService repositoryService, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _upload = upload;
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
            _cardService = cardService;
            _notification = notification;
            _googleAPI = googleAPI;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerEdms = stringLocalizerEdms;
            _stringLocalizerDashBoard = stringLocalizerDashBoard;
            _stringLocalizerCm = stringLocalizerCm;
            _repositoryService = repositoryService;
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

        [Breadcrumb("ViewData.CrumbLMSDashBoard", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuCenterController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            return View();
        }
        #region Amchart

        [HttpGet]
        public object AmchartDoExercise(string user = null, string type = null)
        {
            var lst = new List<AmChartDoExerciseModel>();
            if (type == null)
            {
                var data = _context.VAmchartDoExercises.Where(x => x.CreatedBy == User.Identity.Name).GroupBy(x => x.LstMonth);
                foreach (var item in data)
                {
                    var obj = new AmChartDoExerciseModel
                    {
                        Month = item.Key,
                        TestTotal = item.Where(x => x.TypeTraining == "LMS_TEST").Sum(x => x.TypeCount),
                        TestRight = item.Where(x => x.TypeTraining == "LMS_TEST" && x.Result == true).FirstOrDefault() != null ?
                        item.Where(x => x.TypeTraining == "LMS_TEST" && x.Result == true).FirstOrDefault().TypeCount : 0,
                        TestWrong = item.Where(x => x.TypeTraining == "LMS_TEST" && x.Result == true).FirstOrDefault() != null ?
                        item.Where(x => x.TypeTraining == "LMS_TEST" && x.Result == false).FirstOrDefault().TypeCount : 0,
                        SubjectTotal = item.Where(x => x.TypeTraining == "LMS_SUBJECT").Sum(x => x.TypeCount),
                        SubjectRight = item.Where(x => x.TypeTraining == "LMS_SUBJECT" && x.Result == true).FirstOrDefault() != null ?
                        item.Where(x => x.TypeTraining == "LMS_SUBJECT" && x.Result == true).FirstOrDefault().TypeCount : 0,
                        SubjectWrong = item.Where(x => x.TypeTraining == "LMS_SUBJECT" && x.Result == false).FirstOrDefault() != null ?
                        item.Where(x => x.TypeTraining == "LMS_SUBJECT" && x.Result == false).FirstOrDefault().TypeCount : 0,
                    };
                    lst.Add(obj);
                }
            }

            return lst;
        }
        [HttpGet]
        public object AmchartLearnSubject(string user = null)
        {
            var data = _context.VAmchartLearnSubjects.Where(x => x.CreatedBy == User.Identity.Name).GroupBy(x => x.LstMonth);
            var lst = new List<AmChartLearnSubjectModel>();
            foreach (var item in data)
            {
                var obj = new AmChartLearnSubjectModel
                {
                    Month = item.Key,
                    Sum = item.Sum(x => x.UserCount),
                };
                lst.Add(obj);
            }

            return lst;
        } 
        #endregion
        #region JTable
        [HttpPost]
        public object JTableSubject([FromBody] JTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //var query = from a in _context.EduCategorys
            //            join b in _context.EduExtraFieldGroups on a.ExtraFieldsGroup equals b.Id into b1
            //            from b in b1.DefaultIfEmpty()
            //            where (string.IsNullOrEmpty(jTablePara.CategoryName) || a.Name.ToLower().Contains(jTablePara.CategoryName.ToLower()))
            //             && ((jTablePara.Published == null) || ((jTablePara.Published != null) && (a.Published.Equals(jTablePara.Published))))
            //             && ((jTablePara.ExtraFieldGroup == null) || ((jTablePara.ExtraFieldGroup != null) && (a.ExtraFieldsGroup.Equals(jTablePara.ExtraFieldGroup))))
            //            select new
            //            {
            //                Id = a.Id,
            //                Name = a.Name,
            //                Alias = a.Alias,
            //                Ordering = a.Ordering,
            //                Published = a.Published,
            //                Group = b != null ? b.Name : ""
            //            };
            //var query = new
            //{
            //    Id = "",
            //    Name = "",
            //};

            //int count = query.Count();
            //var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(new List<Object>(), jTablePara.Draw, 0, "Id", "Name", "Alias", "Ordering", "Published", "Group");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableLecture([FromBody] JTableModelLecture jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LmsLectureManagements
                        where (a.SubjectCode == jTablePara.SubjectCode)
                        select a;

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "LectCode", "LectName", "LectDescription", "Duration", "Unit", "VideoPresent");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableQuiz([FromBody] JTableModelQuiz jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.QuizPools
                        where (a.LectureCode == jTablePara.LectureCode && !String.IsNullOrEmpty(a.LectureCode)) || (String.IsNullOrEmpty(jTablePara.LectureCode) && a.SubjectCode == jTablePara.SubjectCode)
                        && !a.IsDeleted
                        select a;

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "Code", "Content", "CreatedBy", "Duration", "Unit");
            return Json(jdata);
        }
        #endregion
        #region Subject CRUD
        [HttpPost]
        public object InsertSubject([FromBody] LmsSubjectManagement data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsSubjectManagements.FirstOrDefault(x => x.SubjectCode == data.SubjectCode);
                if (model == null)
                {
                    _context.LmsSubjectManagements.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = "Môn học đã tồn tại";
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
        public object UpdateSubject([FromBody] LmsSubjectManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsSubjectManagements.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.SubjectCode = data.SubjectCode;
                    item.SubjectName = data.SubjectName;
                    item.SubjectDescription = data.SubjectDescription;
                    item.Duration = data.Duration;
                    item.Teacher = data.Teacher;
                    item.Author = data.Author;
                    item.Unit = data.Unit;
                    item.ImageCover = data.ImageCover;
                    item.VideoPresent = data.VideoPresent;
                    item.FileBase = data.FileBase;
                    item.Status = data.Status;
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
        public object DeleteSubject(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.LmsSubjectManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Khóa học không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.LmsSubjectManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa";
                //msg.Title = _sharedResources["COM_ERROR_REMOVED"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetItemSubject(int id)
        {
            var data = _context.LmsSubjectManagements.FirstOrDefault(x => x.Id.Equals(id));
            return Json(data);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertObjectFileSubject(FilePluginModel obj, IFormFile fileUpload)
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
                    var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                    var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, luceneCategory.PathServerPhysic);
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
                    msg.Title = "Thêm tệp tin thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Định dạng tệp không cho phép";
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
        #endregion
        #region Lecture CRUD
        [HttpPost]
        public object InsertLecture([FromBody] LmsLectureManagement data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsLectureManagements.FirstOrDefault(x => x.LectCode == data.LectCode && x.SubjectCode == data.SubjectCode);
                if (model == null)
                {
                    _context.LmsLectureManagements.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = "Bài giảng đã tồn tại";
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
        public object UpdateLecture([FromBody] LmsLectureManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsLectureManagements.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.LectCode = data.LectCode;
                    item.LectName = data.LectName;
                    item.LectDescription = data.LectDescription;
                    item.Duration = data.Duration;
                    item.Unit = data.Unit;
                    item.Status = data.Status;
                    item.SubjectCode = data.SubjectCode;
                    item.VideoPresent = data.VideoPresent;
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
        public object DeleteLecture(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.LmsLectureManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Khóa học không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.LmsLectureManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa";
                //msg.Title = _sharedResources["COM_ERROR_REMOVED"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetItemLecture(int id)
        {
            var data = _context.LmsLectureManagements.FirstOrDefault(x => x.Id.Equals(id));
            return Json(data);
        }
        #endregion
        #region Quiz CRUD
        [HttpPost]
        public object InsertQuiz([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code == data.Code && x.LectureCode == data.LectureCode && !x.IsDeleted);
                if (model == null)
                {
                    var obj = new QuizPool()
                    {
                        Code = data.Code,
                        Title = data.Title,
                        Content = data.Content,
                        LectureCode = data.LectureCode,
                        SubjectCode = data.SubjectCode,
                        Type = data.Type,
                        Level = data.Level,
                        Duration = data.Duration,
                        Unit = data.Unit,
                        CreatedTime = DateTime.Now,
                        CreatedBy = User.Identity.Name,
                        IsDeleted = false
                    };
                    _context.QuizPools.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = "Môn học đã tồn tại";
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
        public object UpdateQuiz([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.QuizPools.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.Code = data.Code;
                    item.Title = data.Title;
                    item.Content = data.Content;
                    //item.JsonData = data.JsonData;
                    item.LectureCode = data.LectureCode;
                    item.SubjectCode = data.SubjectCode;
                    item.Type = data.Type;
                    item.Level = data.Level;
                    item.Duration = data.Duration;
                    item.Unit = data.Unit;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = User.Identity.Name;
                    //item.JsonRef = data.JsonRef;
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
        public object UpdateAnswer([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.QuizPools.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.JsonData = data.JsonData;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = User.Identity.Name;
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
        public object UpdateReference([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.QuizPools.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.JsonRef = data.JsonRef;
                    item.UpdatedTime = DateTime.Now;
                    item.UpdatedBy = User.Identity.Name;
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
        public object GetCurrentUserFullName()
        {
            return HttpContext.GetSessionUser().FullName;
        }
        [HttpPost]
        public object DeleteQuiz(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Khóa học không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedTime = DateTime.Now;
                    data.DeletedBy = User.Identity.Name;
                    _context.QuizPools.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa";
                //msg.Title = _sharedResources["COM_ERROR_REMOVED"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetItemQuiz(int id)
        {
            var data = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(id));
            return Json(data);
        }
        [HttpPost]
        public object GetListLecture(string subjectCode)
        {
            var data = _context.LmsLectureManagements.Where(x => x.SubjectCode == subjectCode).Select(x => new
            {
                Code = x.LectCode,
                Name = x.LectName,
            });
            return data;
        }
        #endregion
        #region LmsSession
        public object SetLmsSessionCode(string sessionCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                HttpContext.Session.SetString("LmsSessionCode", sessionCode);
                msg.Title = "Ghi mới session code";
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa";
                //msg.Title = _sharedResources["COM_ERROR_REMOVED"];
                return Json(msg);
            }
        }
        public object GetLmsSessionCode()
        {
            return HttpContext.Session.GetString("LmsSessionCode");
        }
        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerDashBoard.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCm.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        #region Model
        public class AmChartDoExerciseModel
        {
            public int Month { get; set; }
            public int TestRight { get; set; }
            public int TestWrong { get; set; }
            public int TestTotal { get; set; }
            public int SubjectRight { get; set; }
            public int SubjectWrong { get; set; }
            public int SubjectTotal { get; set; }
        }
        public class AmChartLearnSubjectModel
        {
            public int Month { get; set; }
            public int Sum { get; set; }
        }
        public class JTableModelLecture : JTableModel
        {
            public string SubjectCode { get; set; }
        }
        public class JTableModelQuiz : JTableModel
        {
            public string LectureCode { get; set; }
            public string SubjectCode { get; set; }
        }
        #endregion
    }
}
