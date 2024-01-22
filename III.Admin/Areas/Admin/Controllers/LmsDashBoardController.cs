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
using System.IO.Compression;
using DocumentFormat.OpenXml.EMMA;
using static III.Admin.Controllers.FilePluginController;
using Microsoft.Extensions.Options;
using ESEIM;
using static III.Admin.Controllers.CMSItemController;
using SmartBreadcrumbs.Attributes;
//using Microsoft.WindowsAPICodePack.Shell;
//using Microsoft.WindowsAPICodePack.Shell.PropertySystem;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsDashBoardController : Controller
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
        private readonly IStringLocalizer<LmsQuizController> _stringLocalizerLmsQuiz;
        private readonly IStringLocalizer<AssetTypeController> _stringLocalizerAsset;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IRepositoryService _repositoryService;
        private readonly AppSettings _appSettings;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();
        public readonly string module_name = "CARD_JOB";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public LmsDashBoardController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<AssetTypeController> stringLocalizerAsset,
            ICardJobService cardService, IFCMPushNotification notification, IGoogleApiService googleAPI, IStringLocalizer<LmsQuizController> stringLocalizerLmsQuiz,
            IStringLocalizer<LmsDashBoardController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<DashBoardController> stringLocalizerDashBoard,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
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
            _stringLocalizerLmsQuiz = stringLocalizerLmsQuiz;
            _stringLocalizerAsset = stringLocalizerAsset;
            _stringLocalizerFp = stringLocalizerFp;
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

        [Breadcrumb("ViewData.CrumbLMSDashBoard", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            //ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            return View();
        }

        public IActionResult Main()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            //ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            return View();
        }

        public IActionResult ComposeEdu()
        {
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

        [HttpPost]
        public object GetApiLmsCount()
        {
            var session = HttpContext.GetSessionUser();
            var query = new List<ModelAmchartLms>();
            var obj = new JObject();
            var rs = new DataTable();

            string[] param = new string[] { "@USER_NAME", "@USER_ID", "@IS_ALL_DATA" };
            object[] val = new object[] { session.UserName, session.UserId, session.IsAllData };

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_CLASS_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("ClassTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_EXAM_STUDENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("ExamStudent", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_EXAM_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("ExamTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_FILE_STUDENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("FileStudent", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_FILE_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("FileTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_LECTURE_ASSIGNMENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("LectureAssignment", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_LECTURE_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("LectureTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_LECTURE_VOLUNTARY", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("LectureVoluntary", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_QUIZ_ASSIGMENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("QuizAssignment", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_QUIZ_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("QuizTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_QUIZ_VOLUNTARY", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("QuizVoluntary", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_STUDENT_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("StudentTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_SUBJECT_STUDENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("SubjectStudent", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_SUBJECT_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("SubjectTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TEST_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("TestTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TEST_ASSIGNMENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("TestAssignment", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TEST_VOLUNTARY", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("TestVoluntary", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TUTOR_STUDENT", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("TutorStudent", JsonConvert.SerializeObject(query.FirstOrDefault()));

            rs = _repositoryService.GetDataTableProcedureSql("P_GET_COUNT_LMS_TASK_TEACHER", param, val);
            query = CommonUtil.ConvertDataTable<ModelAmchartLms>(rs);
            obj.Add("TaskTeacher", JsonConvert.SerializeObject(query.FirstOrDefault()));

            return Json(obj);
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
            var query = (from a in _context.LmsLectureManagements
                         where (a.SubjectCode == jTablePara.SubjectCode)
                         select new ModelLectureGrid
                         {
                             Id = a.Id,
                             LectCode = a.LectCode,
                             LectName = a.LectName,
                             LectDescription = a.LectDescription,
                             Duration = a.Duration,
                             VideosDuration = a.VideosDuration,
                             Unit = a.Unit,
                             VideoPresent = a.VideoPresent
                         }).ToList();
            foreach (var item in query)
            {
                var listCourse = (from a in _context.LmsCourses
                                  join b in _context.LmsLectureSubjectCourses.Where(x => x.LectureCode == item.LectCode)
                                  on a.CourseCode equals b.CourseCode
                                  select a.CourseName).DistinctBy(x => x).ToList();
                item.ListCourse = JsonConvert.SerializeObject(listCourse);
            }

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "LectCode", "LectName", "LectDescription", "Duration", "VideosDuration", "Unit", "VideoPresent", "ListCourse");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableQuiz([FromBody] JTableModelQuiz jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.QuizPools
                        join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                        from b in b1.DefaultIfEmpty()
                        where (a.LectureCode == jTablePara.LectureCode && !String.IsNullOrEmpty(a.LectureCode)) || (String.IsNullOrEmpty(jTablePara.LectureCode) && a.SubjectCode == jTablePara.SubjectCode && !String.IsNullOrEmpty(a.SubjectCode))
                        && !a.IsDeleted
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Content,
                            a.CreatedBy,
                            a.Duration,
                            a.Unit,
                            LectureName = b != null ? b.LectName : ""
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "Code", "Content", "CreatedBy", "Duration", "Unit", "LectureName");
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
                    msg.Title = _stringLocalizer["LMS_ADDNEW_SUCCESS"];
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _stringLocalizer["LMS_SUBJECT_EXIST"];
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
                    var model = _context.LmsSubjectManagements.FirstOrDefault(x => x.SubjectCode == data.SubjectCode && x.Id != data.Id);
                    if (model != null)
                    {
                        msg.Title = _stringLocalizer["LMS_SUBJECT_EXIST"];
                        msg.Error = true;
                        return msg;
                    }
                    item.SubjectCode = data.SubjectCode;
                    item.SubjectName = data.SubjectName;
                    item.SubjectDescription = data.SubjectDescription;
                    item.Duration = data.Duration;
                    item.Teacher = data.Teacher;
                    item.Author = data.Author;
                    item.Unit = data.Unit;
                    item.ImageCover = data.ImageCover;
                    item.IconFa = data.IconFa;
                    item.VideoPresent = data.VideoPresent;
                    item.FileBase = data.FileBase;
                    item.Status = data.Status;
                    item.EdmsCatCode = data.EdmsCatCode;
                    item.Parent = data.Parent;
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
                    msg.Title = _stringLocalizer["LMS_SUBJECT_NOT_EXIST"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.LmsSubjectManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_DELETED_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["LMS_DELETED_FAILURE"];
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
        public object GetListUser()
        {
            var query = _context.Users.Where(x => x.Active == true).Select(x => new { UserId = x.Id, x.GivenName, x.Picture, x.UserName, GroupUserCode = x.AdUserInGroups.Select(y => y.GroupUserCode).FirstOrDefault(), x.DepartmentId }).AsNoTracking();
            return query;
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
                /// 
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
                msg.Title = _stringLocalizer["LMS_ADD_FILE_SUCCESS"];
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
        public List<LmsTreeView> GetTreeData(int catId = 0)
        {
            //if (obj.IdI == null && obj.IdS == null)
            //{
            //    return null;
            //}

            var data = _context.LmsSubjectManagements/*.OrderBy(k => k.)*/.AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<LmsTreeView>(), 0, catId);
            return dataOrder;
        }

        private List<LmsTreeView> GetSubTreeData(List<LmsSubjectManagement> data, int? Parent, List<LmsTreeView> lstCategories, int tab, int rootCatId)
        {
            //tab += "- ";
            var contents = Parent == null
                ? data.Where(x => x.Parent == null)/*.OrderBy(k => k.ordering)*/.AsParallel()
                : data.Where(x => x.Parent == Parent)/*.OrderBy(k => k.ordering)*/.AsParallel();
            foreach (var item in contents)
            {
                var category = new LmsTreeView
                {
                    Id = item.Id,
                    Code = item.SubjectCode,
                    Title = item.SubjectName,
                    ParentId = item.Parent,
                    Level = tab,
                    //Order = item.ordering,
                    //Published = item.published,
                    HasChild = data.Any(x => x.Parent == item.Id)
                };
                if ((rootCatId != 0 && category.Id == rootCatId && category.Level == 0) || category.Level != 0 || rootCatId == 0)
                {
                    lstCategories.Add(category);

                    if (category.HasChild) GetSubTreeData(data, item.Id, lstCategories, tab + 1, rootCatId);
                }
            }
            return lstCategories;
        }
        #endregion
        #region Lecture CRUD
        [HttpPost]
        public object InsertLecture([FromBody] LmsLectureManagement data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsLectureManagements.FirstOrDefault(x => x.LectCode == data.LectCode);
                if (model == null)
                {
                    _context.LmsLectureManagements.Add(data);
                    var dataLectureSubject = _context.LmsLectureSubjectCourses.FirstOrDefault(x => x.SubjectCode == data.SubjectCode && x.LectureCode == data.LectCode);
                    if (dataLectureSubject == null)
                    {
                        var lectureSubject = new LmsLectureSubjectCourse
                        {
                            LectureCode = data.LectCode,
                            SubjectCode = data.SubjectCode
                        };
                        _context.LmsLectureSubjectCourses.Add(lectureSubject);
                    }
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_ADDNEW_SUCCESS"];
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _stringLocalizer["LMS_LECTURE_EXIST"];
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
                    var model = _context.LmsLectureManagements.FirstOrDefault(x => x.LectCode == data.LectCode && x.Id != data.Id);
                    if (model != null)
                    {
                        msg.Title = _stringLocalizer["LMS_LECTURE_EXIST"];
                        msg.Error = true;
                        return msg;
                    }
                    item.LectCode = data.LectCode;
                    item.LectName = data.LectName;
                    item.LectDescription = data.LectDescription;
                    item.Duration = data.Duration;
                    item.Unit = data.Unit;
                    item.Status = data.Status;
                    item.SubjectCode = data.SubjectCode;
                    item.VideoPresent = data.VideoPresent;
                    item.IsInteractive = data.IsInteractive;
                    item.InteractiveFilePath = data.InteractiveFilePath;
                    var dataLectureSubject = _context.LmsLectureSubjectCourses.FirstOrDefault(x => x.SubjectCode == data.SubjectCode && x.LectureCode == data.LectCode);
                    if (dataLectureSubject == null)
                    {
                        var lectureSubject = new LmsLectureSubjectCourse
                        {
                            LectureCode = data.LectCode,
                            SubjectCode = data.SubjectCode
                        };
                        _context.LmsLectureSubjectCourses.Add(lectureSubject);
                    }
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
                var session = HttpContext.GetSessionUser();
                var data = _context.LmsLectureManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["LMS_COURSE_NOT_EXIST"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    var listTaskUserItemProgresses = _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.ItemCode == data.LectCode
                        && (x.TrainingType == "DO_EXERCISE" || x.TrainingType == "VIEW_LECTURE"));
                    var listTasks = _context.LmsTasks.Where(x => !x.IsDeleted && x.ListItems != null && x.ListItems.Any(y => y.ItemCode == data.LectCode
                        && (y.TrainingType == "DO_EXERCISE" || y.TrainingType == "VIEW_LECTURE")));
                    var lmsLectureSubjectCourses = _context.LmsLectureSubjectCourses.Where(x => x.LectureCode == data.LectCode);
                    var listQuiz = _context.QuizPools.Where(x => x.LectureCode == data.LectCode && !x.IsDeleted).ToList();
                    foreach (var item in listTaskUserItemProgresses)
                    {
                        item.IsDeleted = true;
                        _context.LmsTaskUserItemProgresses.Update(item);
                    }
                    foreach (var task in listTasks)
                    {
                        var listItems = task.ListItems.Where(y => y.ItemCode == data.LectCode
                                                                  && (y.TrainingType == "DO_EXERCISE" ||
                                                                      y.TrainingType == "VIEW_LECTURE"));
                        foreach (var item in listItems)
                        {
                            task.ListItems.Remove(item);
                        }
                        _context.LmsTasks.Update(task);
                    }
                    foreach (var item in lmsLectureSubjectCourses)
                    {
                        _context.LmsLectureSubjectCourses.Remove(item);
                    }
                    foreach (var item in listQuiz)
                    {
                        item.LectureCode = "";
                        _context.QuizPools.Update(item);
                    }
                    //foreach (var item in listQuiz)
                    //{
                    //    item.IsDeleted = true;
                    //    item.DeletedTime = DateTime.Now;
                    //    if (session != null)
                    //    {
                    //        item.DeletedBy = session.UserName;
                    //    }

                    //    _context.QuizPools.Update(item);
                    //}
                    _context.LmsLectureManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_DELETED_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["LMS_DELETED_FAILURE"];
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
        [HttpPost]
        public object GetSubjectCourse(string subjectCode)
        {
            var data = (from a in _context.LmsCourses
                join b in _context.LmsLectureSubjectCourses.Where(x => x.SubjectCode == subjectCode)
                    on a.CourseCode equals b.CourseCode
                select new
                {
                    Code = a.CourseCode,
                    Name = a.CourseName
                }).AsEnumerable().DistinctBy(x => x.Code);
            return Json(data);
        }
        [HttpPost]
        public object GetListLectureCourse(string lectureCode)
        {
            var data = from a in _context.LmsCourses
                       join b in _context.LmsLectureSubjectCourses.Where(x => x.LectureCode == lectureCode)
                       on a.CourseCode equals b.CourseCode
                       select new
                       {
                           a.CourseCode,
                           a.CourseName,
                           a.CourseNote
                       };
            return Json(data);
        }
        [HttpPost]
        public object InsertLectureCourse([FromBody] LmsLectureSubjectCourse data)
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
        public object DeleteLectureCourse([FromBody] LmsLectureSubjectCourse data)
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
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertObjectFileLecture(FileLectureModel obj, IFormFile fileUpload)
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

                // get File Duration

                var lecture = _context.LmsLectureManagements.FirstOrDefault(x => x.LectCode == obj.ObjectCode);
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    using (var ms = new MemoryStream())
                    {
                        fileUpload.CopyTo(ms);
                        var fileBytes = ms.ToArray();

                        //JMessage msg1 = _upload.UploadFileByBytes(fileBytes, fileUpload.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        //string pathTemp = msg1.Object.ToString();
                        //var duration = new TimeSpan();
                        //using (var shell = ShellObject.FromParsingName(_hostingEnvironment.WebRootPath + pathTemp))
                        //{
                        //    IShellProperty prop = shell.Properties.System.Media.Duration;
                        //    var t = (ulong)prop.ValueAsObject;
                        //    duration = TimeSpan.FromTicks((long)t);
                        //}
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
                    using (var ms = new MemoryStream())
                    {
                        fileUpload.CopyTo(ms);
                        var fileBytes = ms.ToArray();

                        //JMessage msg1 = _upload.UploadFileByBytes(fileBytes, fileUpload.FileName, _hostingEnvironment.WebRootPath, "uploads\\tempFile");
                        //string pathTemp = msg1.Object.ToString();

                        //var duration = new TimeSpan();
                        //using (var shell = ShellObject.FromParsingName(_hostingEnvironment.WebRootPath + "\\" + pathTemp))
                        //{
                        //    IShellProperty prop = shell.Properties.System.Media.Duration;
                        //    var t = (ulong)prop.ValueAsObject;
                        //    duration = TimeSpan.FromTicks((long)t);
                        //}
                        //var duration1 = duration;
                    }
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

                // add Lecture Duration
                if (lecture != null && obj.Duration.HasValue)
                {
                    var videoDuration = new VideoDuration()
                    {
                        VideoFileCode = edmsReposCatFile.FileCode,
                        Duration = obj.Duration.Value
                    };
                    lecture.ListVideoDuration.Add(videoDuration);
                }

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
                msg.Title = _stringLocalizer["LMS_ADDNEW_SUCCESS"];
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
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertInteractFileLecture(FileLectureModel obj, IFormFile fileUpload)
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

                // secret path
                path = "/LMS_INTERACTIVE";
                var watch1 = System.Diagnostics.Stopwatch.StartNew();
                //var lecture = _context.LmsLectureManagements.FirstOrDefault(x => x.LectCode == obj.ObjectCode);
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == "02");
                if (getRepository != null && getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
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

                        if (result.Status == WebExceptionStatus.Success)
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
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    return Json(msg);
                }
                watch1.Stop();
                var elapsedMs1 = watch1.ElapsedMilliseconds;
                _context.SaveChanges();
                var watch2 = System.Diagnostics.Stopwatch.StartNew();
                var msg1 = _upload.CreateTempFileFromPath(urlFile, "uploads\\repository\\LMS_INTERACTIVE", "02", fileUpload.FileName);
                watch2.Stop();
                var elapsedMs2 = watch2.ElapsedMilliseconds;
                if (msg1.Error == false)
                {
                    var watch3 = System.Diagnostics.Stopwatch.StartNew();
                    var extractPath = _hostingEnvironment.WebRootPath + "/uploads/repository/LMS_INTERACTIVE/" + Path.GetFileNameWithoutExtension(fileUpload.FileName);
                    var srcPath = _hostingEnvironment.WebRootPath + "/" + msg1.Object;
                    var msg2 = ExtractZipFile(srcPath, extractPath);
                    watch3.Stop();
                    var elapsedMs3 = watch3.ElapsedMilliseconds;
                    if (msg2.Error == false)
                    {
                        var extractRelativePath = "/uploads/repository/LMS_INTERACTIVE/" +
                                                  Path.GetFileNameWithoutExtension(fileUpload.FileName) + "/";
                        msg.Object = _appSettings.UrlMain + extractRelativePath + Path.GetFileNameWithoutExtension(fileUpload.FileName) + ".json";
                        _upload.DeleteFileTemp(msg1.Object.ToString());
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_ERR"];
                        return Json(msg);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    return Json(msg);
                }

                msg.Title = _stringLocalizer["LMS_ADDNEW_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        private JMessage ExtractZipFile(string path, string extractPath)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                string zipPath = path;

                //Console.WriteLine("Provide path where to extract the zip file:");
                //string extractPath = Console.ReadLine();

                // Normalizes the path.
                extractPath = Path.GetFullPath(extractPath);

                // Ensures that the last character on the extraction path
                // is the directory separator char.
                // Without this, a malicious zip file could try to traverse outside of the expected
                // extraction path.
                if (!extractPath.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal))
                    extractPath += Path.DirectorySeparatorChar;

                using (ZipArchive archive = ZipFile.OpenRead(zipPath))
                {
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        // Gets the full path to ensure that relative segments are removed.
                        string destinationPath = Path.GetFullPath(Path.Combine(extractPath, entry.FullName));
                        if (!Directory.Exists(extractPath)) Directory.CreateDirectory(extractPath);
                        // Ordinal match is safest, case-sensitive volumes can be mounted within volumes that
                        // are case-insensitive.
                        if (destinationPath.StartsWith(extractPath, StringComparison.Ordinal))
                            entry.ExtractToFile(destinationPath, true);
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
        public object UpdateVideoDuration(int id, int duration)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.LmsLectureManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (model != null)
                {
                    var videoDuration = new VideoDuration()
                    {
                        VideoFileCode = "",
                        Duration = duration
                    };
                    model.ListVideoDuration.Add(videoDuration);
                    _context.LmsLectureManagements.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_DASHBOARD_SAVE_PERMISSION_SUCCESSFULLY"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["LMS_DASHBOARD_LECTURE_NOT_EXIST"];

                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật";
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                return msg;
            }
        }

        [HttpPost]
        public object GetVideoDurationById(string id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode
                            join c in _context.EDMSFiles.Where(x => x.CloudFileId == id) on a.FileCode equals c.FileCode
                            select new
                            {
                                a.Id,
                                b.Server,
                                b.Type,
                                b.Token,
                                c.Url,
                                FileId = c.CloudFileId,
                            }).FirstOrDefault();
                if (data != null)
                {
                    if (data.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                        var json = apiTokenService.CredentialsJson;
                        var user = apiTokenService.Email;
                        var token = apiTokenService.RefreshToken;
                        msg.Object = Convert.ToDouble(FileExtensions.GetGoogleVideoDuration(json, token, data.FileId, user)) * 0.001;
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
        [HttpPost]
        public JsonResult GetUserShareLecturePermission(int id)
        {
            var data = _context.LmsLectureManagements.FirstOrDefault(x => x.Id.Equals(id));
            var lstUserShare = new List<ModelUserShare>();
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.Share))
                {
                    lstUserShare = JsonConvert.DeserializeObject<List<ModelUserShare>>(data.Share);
                }
            }
            return Json(lstUserShare);
        }

        [HttpPost]
        public object UpdateLecturePermission([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.LmsLectureManagements.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (model != null)
                {
                    model.Share = data.Share;
                    _context.LmsLectureManagements.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_DASHBOARD_SAVE_PERMISSION_SUCCESSFULLY"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["LMS_DASHBOARD_LECTURE_NOT_EXIST"];

                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật";
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                return msg;
            }
        }

        #endregion
        #region Quiz CRUD
        [HttpPost]
        public object InsertQuiz([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code == data.Code && !x.IsDeleted);
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
                        QuestionMedia = data.QuestionMedia,
                        Share = "",
                        IsDeleted = false
                    };
                    _context.QuizPools.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_ADDNEW_SUCCESS"];
                    msg.ID = obj.Id;
                }
                else
                {
                    msg.Title = _stringLocalizer["LMS_QUIZ_EXIST"];
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
                    var model = _context.QuizPools.FirstOrDefault(x => x.Code == data.Code && x.Id != data.Id && !x.IsDeleted);
                    if (model != null)
                    {
                        msg.Title = _stringLocalizer["LMS_QUIZ_EXIST"];
                        msg.Error = true;
                        return msg;
                    }
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
                    item.QuestionMedia = data.QuestionMedia;
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
        public object GetLmsQuizType()
        {
            return _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "LMS_QUIZ_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
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
                    msg.Title = _stringLocalizer["LMS_COURSE_NOT_EXIST"];
                }
                else
                {
                    var listTaskUserItemProgresses = _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.ItemCode == data.Code
                        && x.TrainingType == "DO_PRACTICE");
                    var listTasks = _context.LmsTasks.Where(x => !x.IsDeleted && x.ListItems != null && x.ListItems.Any(y => y.ItemCode == data.Code
                        && y.TrainingType == "DO_PRACTICE"));
                    var practiceDetails = _context.LmsPracticeTestDetails.Where(x => x.QuestCode == data.Code);
                    foreach (var item in listTaskUserItemProgresses)
                    {
                        item.IsDeleted = true;
                        _context.LmsTaskUserItemProgresses.Update(item);
                    }
                    foreach (var task in listTasks)
                    {
                        var listItems = task.ListItems.Where(y => y.ItemCode == data.Code
                                                                  && y.TrainingType == "DO_PRACTICE");
                        foreach (var item in listItems)
                        {
                            task.ListItems.Remove(item);
                        }
                        _context.LmsTasks.Update(task);
                    }
                    foreach (var item in practiceDetails)
                    {
                        item.IsDeleted = true;
                        item.DeletedBy = User.Identity.Name;
                        item.DeletedTime = DateTime.Now;
                        _context.LmsPracticeTestDetails.Update(item);
                    }
                    data.IsDeleted = true;
                    data.DeletedTime = DateTime.Now;
                    data.DeletedBy = User.Identity.Name;
                    _context.QuizPools.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_DELETED_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["LMS_DELETED_FAILURE"];
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

        [HttpPost]
        public object GetSubjectLectureCourse(string subjectCode, string lectureCode)
        {
            var data = (from a in _context.LmsCourses
                        join b in _context.LmsLectureSubjectCourses.Where(x => x.SubjectCode == subjectCode || x.LectureCode == lectureCode)
                        on a.CourseCode equals b.CourseCode
                        select new
                        {
                            Code = a.CourseCode,
                            Name = a.CourseName
                        }).DistinctBy(x => x.Code);
            return Json(data);
        }
        [HttpPost]
        public object GetListQuizCourse(string quizCode)
        {
            var data = from a in _context.LmsCourses
                       join b in _context.LmsQuizLectureSubjectCourses.Where(x => x.QuizCode == quizCode)
                       on a.CourseCode equals b.CourseCode
                       select new
                       {
                           a.CourseCode,
                           a.CourseName,
                           a.CourseNote
                       };
            return Json(data);
        }
        [HttpPost]
        public object InsertQuizCourse([FromBody] LmsQuizLectureSubjectCourse data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsQuizLectureSubjectCourses.FirstOrDefault(x => x.CourseCode == data.CourseCode && x.SubjectCode == data.SubjectCode
                && x.LectureCode == data.LectureCode && x.QuizCode == data.QuizCode);
                if (model == null)
                {
                    _context.LmsQuizLectureSubjectCourses.Add(data);
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
        public object DeleteQuizCourse([FromBody] LmsQuizLectureSubjectCourse data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.LmsQuizLectureSubjectCourses.FirstOrDefault(x => x.CourseCode == data.CourseCode && x.SubjectCode == data.SubjectCode
                && x.LectureCode == data.LectureCode && x.QuizCode == data.QuizCode);
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
                    _context.LmsQuizLectureSubjectCourses.Remove(obj);
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
        public object InsertQuizRef([FromBody] LmsQuizPoolReference data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                data.CreatedTime = DateTime.Now;
                data.CreatedBy = User.Identity.Name;
                _context.LmsQuizPoolReferences.Add(data);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["LMS_ADDNEW_SUCCESS"];
                msg.ID = data.Id;
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
        public object UpdateQuizRef([FromBody] LmsQuizPoolReference data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.LmsQuizPoolReferences.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.RefContent = data.RefContent;
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
        public object DeleteQuizRef(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.LmsQuizPoolReferences.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (obj == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_ERR_DELETE"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    obj.IsDeleted = true;
                    obj.DeletedBy = User.Identity.Name;
                    _context.LmsQuizPoolReferences.Remove(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["LMS_DELETED_SUCCESS"];
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
        public object GetQuizRef(string quizCode)
        {
            return _context.LmsQuizPoolReferences.Where(x => !x.IsDeleted && x.QuizCode == quizCode).OrderByDescending(x => x.CreatedTime);
        }

        [HttpPost]
        public object GetGameJsonData(string url)
        {
            try
            {
                return (new WebClient()).DownloadString(url);
            }
            catch (Exception)
            {
                return "";
            }
        }
        #endregion
        #region LmsSession
        public object SetLmsSessionCode(string sessionCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                HttpContext.Session.SetString("LmsSessionCode", sessionCode);
                msg.Title = _stringLocalizer["LMS_WRITE_NEW_SESSSION"];
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["LMS_DELETED_FAILURE"];
                //msg.Title = _sharedResources["COM_ERROR_REMOVED"];
                return Json(msg);
            }
        }
        public object GetLmsSessionCode()
        {
            return HttpContext.Session.GetString("LmsSessionCode");
        }
        #endregion
        #region CMS
        [HttpPost]
        public object InsertCmsItem([FromBody] CMSItemsModel data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var session = HttpContext.GetSessionUser();

                var createdTime = !string.IsNullOrEmpty(data.created) ? DateTime.ParseExact(data.created, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var model = _context.cms_items.FirstOrDefault(x => x.title.Equals(data.title) && x.cat_id == data.cat_id);

                if (model == null)
                {
                    var obj = new cms_items
                    {
                        title = data.title,
                        alias = data.alias,
                        cat_id = data.cat_id,
                        intro_text = data.intro_text,
                        created = createdTime,
                        template = data.template,
                        featured_ordering = data.featured_ordering,
                        language = data.language,
                        created_by_alias = ESEIM.AppContext.UserName,
                        date_post = DateTime.Now,
                        full_text = data.full_text,
                        gallery = "",
                        published = data.published.HasValue ? data.published.Value : false,
                    };

                    _context.cms_items.Add(obj);
                    _context.SaveChanges();

                    // msg.Title = "Thêm mới thành công";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ADD_SUCCESS"];
                    msg.ID = obj.id;

                }
                else
                {
                    //msg.Title = "Bài viết đã tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_EXITS"];
                    msg.Error = true;
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }
        [HttpPost]
        public object GetItemCms(string code)
        {
            var data = _context.cms_items.FirstOrDefault(x => x.alias.Equals(code) && x.cat_id == 228);
            return Json(data);
        }
        [HttpPost]
        public object GetListCmsItem()
        {
            return _context.cms_items.Where(x => x.cat_id == 228 && x.published).Select(x => new { Code = x.alias, Name = x.title });
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
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsQuiz.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerAsset.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        #region GetCount
        [HttpPost]
        public object CountQuizAssignAndVoluntary()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                if (session != null)
                {
                    var countVoluntary = _context.QuizPools.Count(x => !x.IsDeleted && (x.Share.Contains("All") || x.Share.Contains(session.UserName) ||
                        session.UserType == 10 || x.CreatedBy.Equals(session.UserName)));
                        //.DistinctBy(x => x.Code).Count();
                    var countAssignment = (from a in _context.QuizPools.Where(x => !x.IsDeleted)
                        join e in _context.LmsTaskUserItemProgresses.Where(x =>
                            !x.IsDeleted && x.User == session.UserId && x.TrainingType == "DO_EXERCISE") on a.Code equals e.ItemCode
                        select new { a.Code, e.LmsTaskCode }).AsEnumerable().DistinctBy(x => new { x.Code, x.LmsTaskCode }).Count();
                    msg.Object = new
                    {
                        countVoluntary = countVoluntary,
                        countAssignment = countAssignment
                    };
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_ERR_ADD"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }

            return msg;
        }
        [HttpPost]
        public object CountPracticeAssignAndVoluntary()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                if (session != null)
                {
                    var countVoluntary = _context.LmsPracticeTestHeaders.Where(x =>
                        !x.IsDeleted && (x.Share.Contains("All") || x.Share.Contains(session.UserName) || session.UserType == 10 || x.CreatedBy.Equals(session.UserName)))
                        .DistinctBy(x => x.PracticeTestCode).Count();
                    var countAssignment = (from a in _context.LmsPracticeTestHeaders.Where(x => !x.IsDeleted)
                                           join e in _context.LmsTaskUserItemProgresses.Where(x =>
                                               !x.IsDeleted && x.User == session.UserId && x.TrainingType == "DO_PRACTICE") on a.PracticeTestCode equals e.ItemCode
                                           select new { a.PracticeTestCode, e.LmsTaskCode }).DistinctBy(x => new { x.PracticeTestCode, x.LmsTaskCode }).Count();
                    msg.Object = new
                    {
                        countVoluntary = countVoluntary,
                        countAssignment = countAssignment
                    };
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_ERR_ADD"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }

            return msg;
        }
        [HttpPost]
        public object CountSubjectAssignAndVoluntary()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                if (session != null)
                {
                    var countVoluntary = (from a in _context.LmsSubjectManagements
                                          join b in _context.LmsLectureSubjectCourses on a.SubjectCode equals b.SubjectCode into b1
                                          from b in b1.DefaultIfEmpty()
                                          join c in _context.LmsLectureManagements on b.LectureCode equals c.LectCode into c1
                                          from c in c1.DefaultIfEmpty()
                                          select new
                                          {
                                              a.SubjectCode,
                                              a.Teacher,
                                              Share = c != null ? c.Share : ""
                                          }).Where(x =>
                                          (x.Share.Contains("All") || x.Share.Contains(session.UserName) || session.UserType == 10 || x.Teacher.Contains(session.UserName)))
                        .DistinctBy(x => x.SubjectCode).Count();
                    var countAssignment = (from a in _context.LmsSubjectManagements
                                           join b in _context.LmsLectureSubjectCourses on a.SubjectCode equals b.SubjectCode into b1
                                           from b in b1.DefaultIfEmpty()
                                           join c in _context.LmsLectureManagements on b.LectureCode equals c.LectCode into c1
                                           from c in c1.DefaultIfEmpty()
                                           join e in _context.LmsTaskUserItemProgresses.Where(x =>
                                               !x.IsDeleted && x.User == session.UserId && x.TrainingType == "VIEW_LECTURE") on c.LectCode equals e.ItemCode
                                           select new
                                           {
                                               a.SubjectCode,
                                               LmsTaskCode = e != null ? e.LmsTaskCode : ""
                                           }).DistinctBy(x => new { x.SubjectCode, x.LmsTaskCode }).Count();
                    msg.Object = new
                    {
                        countVoluntary = countVoluntary,
                        countAssignment = countAssignment
                    };
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_ERR_ADD"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }

            return msg;
        }
        #endregion
        #region NotUsed
        [HttpPost]
        public object DeleteQuizRef(int id, string userName)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.LmsQuizPoolReferences.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (obj == null)
                {
                    msg.Error = true;
                    msg.Title = "Đối tượng không tồn tại";
                    ///msg.Title = _sharedResources["COM_ERR_DELETE"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    obj.IsDeleted = true;
                    obj.DeletedBy = userName;
                    obj.DeletedTime = DateTime.Now;
                    _context.LmsQuizPoolReferences.Remove(obj);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                    //msg.Title = _stringLocalizer["LMS_DELETED_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                //msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetAllReference(string quizCode)
        {
            return _context.LmsQuizPoolReferences.Where(x => x.QuizCode == quizCode && !x.IsDeleted).OrderByDescending(x => x.CreatedTime);
        }
        [HttpPost]
        public object SearchQuizLatex(string content, string latex, string subjectCode)
        {
            string[] param = new string[] { "@Content", "@Latex", "@SubjectCode" };
            object[] val = new object[]
            {
                !String.IsNullOrEmpty(content) ? content : "",
                !String.IsNullOrEmpty(latex) ? latex : "",
                !String.IsNullOrEmpty(subjectCode) ? subjectCode : ""
            };

            var rs = _repositoryService.GetDataTableProcedureSql("P_GET_QUIZ_WITH_LATEX", param, val);
            var query = CommonUtil.ConvertDataTable<QuizPool>(rs);
            var data = from a in query
                       join b in _context.LmsLectureManagements.ToList() on a.LectureCode equals b.LectCode into b1
                       from b in b1.DefaultIfEmpty()
                       join c in _context.LmsSubjectManagements.ToList() on a.SubjectCode equals c.SubjectCode into c1
                       from c in c1.DefaultIfEmpty()
                       let g = a.Duration.HasValue ? a.Duration.Value : 0
                       select new MobileLoginController.ModelQuizMobile()
                       {
                           Id = a.Id,
                           Duration = a.Duration,
                           DurationMinute = a.Unit == "MINUTE" ? g : g * 60,
                           Unit = a.Unit,
                           Mark = 10, // Default
                           QuestionMedia = a.QuestionMedia,
                           Content = a.Content,
                           Code = a.Code,
                           Type = a.Type,
                           JsonData = a.JsonData,
                           Solve = a.Solve,
                           IdQuiz = a.Id,
                           LectureName = b != null ? b.LectName : "",
                           LectureCode = b != null ? b.LectCode : "",
                           SubjectName = c != null ? c.SubjectName : "",
                           IsAssignment = false,
                           CreatedBy = a.CreatedBy,
                           CreatedTime = a.CreatedTime
                       };
            return data;
        }

        [HttpPost]
        public object UpdateWishList(string userName, string listSubject, string updatedBy)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var data = _context.UserWishListSubjects.FirstOrDefault(x => x.UserName == userName);
                if (data != null)
                {
                    data.SubjectList = listSubject;
                    data.UpdatedBy = updatedBy;
                    data.UpdatedTime = DateTime.Now;
                    _context.UserWishListSubjects.Update(data);
                }
                else
                {
                    var obj = new UserWishListSubject
                    {
                        UserName = userName,
                        SubjectList = listSubject,
                        CreatedBy = updatedBy,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false
                    };
                    _context.UserWishListSubjects.Add(obj);
                }

                _context.SaveChanges();
                msg.Title = "Đã cập nhật danh sách"; // "Đã làm bài tập";
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = "Có lỗi xảy ra khi thêm";
                return msg;
            }
        }

        [HttpPost]
        public object GetUserWishList(string userName)
        {
            return _context.UserWishListSubjects.FirstOrDefault(x => x.UserName == userName && !x.IsDeleted);
        }
        #endregion
        #region Model

        public class ModelAmchartLms
        {
            public int? Total { get; set; }
            public int? Done { get; set; }
            public int? Correct { get; set; }
            public int? TotalHour { get; set; } // removed
            public int? TotalSecond { get; set; }
        }
        public class ModelLectureGrid : LmsLectureManagement
        {
            public string ListCourse { get; set; }
        }
        public class LmsTreeView : TreeView
        {
            public string Parent { get; set; }
            //public bool? Published;
        }
        public class ModelUserShare
        {
            public string UserName { get; set; }
            public string GivenName { get; set; }
        }
        public class FileLectureModel : FilePluginModel
        {
            public int? Duration { get; set; }
        }
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
