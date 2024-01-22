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
    public class LmsSubjectManagementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSM;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public LmsSubjectManagementController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSM,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerLmsSM = stringLocalizerLmsSM;
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

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbLMSSubjectManagement"] = _sharedResources["COM_CRUMB_LMS_SUBJECT_MANAGEMENT"];
            return View();
        }

        #region Function
        [HttpPost]
        public object JTableCategory([FromBody] JTableModelSubject jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var session = HttpContext.GetSessionUser();
            var query = (from a in _context.LmsSubjectManagements
                         join b in _context.LmsLectureSubjectCourses on a.SubjectCode equals b.SubjectCode into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.LmsLectureManagements on b.LectureCode equals c.LectCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.User == session.UserId && x.TrainingType == "VIEW_LECTURE")
                             on c.LectCode equals d.ItemCode into d1
                         from d in d1.DefaultIfEmpty()
                         join e in _context.LmsTasks.Where(x => !x.IsDeleted) on d.LmsTaskCode equals e.LmsTaskCode into e1
                         from e in e1.DefaultIfEmpty()
                         where (String.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode))
                         && (String.IsNullOrEmpty(jTablePara.SubjectName) || a.SubjectName.Contains(jTablePara.SubjectName))
                         && (jTablePara.OnlyAssignment != true || (jTablePara.OnlyAssignment == true && d != null))
                         && (jTablePara.IsSharedAndEditable != true || (jTablePara.IsSharedAndEditable == true && (session.UserType == 10 || a.Teacher.Contains(session.UserName) || (c != null && (c.Share.Contains("All") || c.Share.Contains(session.UserName))))))
                         select new
                         {
                             a.Id,
                             a.SubjectName,
                             a.SubjectCode,
                             a.SubjectDescription,
                             a.Teacher,
                             a.Duration,
                             a.Unit,
                             a.ImageCover,
                             a.VideoPresent,
                             a.FileBase,
                             a.Status,
                             LectureCode = c != null ? c.LectCode : "",
                             IsShared = c != null && (c.Share.Contains("All") || c.Share.Contains(session.UserName)),
                             IsEditable = (session.UserType == 10 || a.Teacher.Contains(session.UserName)),
                             IsAssignment = d != null,
                             LmsTaskCode = e != null ? e.LmsTaskCode : "",
                             LmsTaskName = e != null ? e.LmsTaskName : "",
                             IsAlreadyDone = d.UpdatedBy == session.UserName
                         }).ToList();
            if (jTablePara.IsSharedAndEditable == true)
            {
                query = query.DistinctBy(x => x.SubjectCode).ToList();
            }
            else if (jTablePara.OnlyAssignment == true)
            {
                query = query.DistinctBy(x => new { x.SubjectCode, x.LmsTaskCode }).ToList();
            }

            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "SubjectName", "SubjectCode", "SubjectDescription", "Teacher", "Duration", "Unit", "ImageCover", "VideoPresent", "FileBase", "Status", "IsShared", "IsEditable", "IsAssignment", "IsAlreadyDone", "LmsTaskCode", "LmsTaskName");
            return Json(jdata);
        }

        [HttpPost]
        public object DeleteSubject(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var data = _context.LmsSubjectManagements.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var listLecture = _context.LmsLectureManagements.Where(x => x.SubjectCode == data.SubjectCode);
                    var lmsLectureSubjectCourses = _context.LmsLectureSubjectCourses.Where(x => x.SubjectCode == data.SubjectCode);
                    var listQuiz = _context.QuizPools.Where(x => x.SubjectCode == data.SubjectCode && !x.IsDeleted).ToList();
                    foreach (var lecture in listLecture)
                    {
                        var listTaskUserItemProgresses = _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.ItemCode == lecture.LectCode
                            && (x.TrainingType == "DO_EXERCISE" || x.TrainingType == "VIEW_LECTURE"));
                        var listTasks = _context.LmsTasks.Where(x => !x.IsDeleted && x.ListItems != null && x.ListItems.Any(y => y.ItemCode == lecture.LectCode
                            && (y.TrainingType == "DO_EXERCISE" || y.TrainingType == "VIEW_LECTURE")));
                        foreach (var item in listTaskUserItemProgresses)
                        {
                            item.IsDeleted = true;
                            _context.LmsTaskUserItemProgresses.Update(item);
                        }
                        foreach (var task in listTasks)
                        {
                            var listItems = task.ListItems.Where(y => y.ItemCode == lecture.LectCode
                                                                      && (y.TrainingType == "DO_EXERCISE" ||
                                                                          y.TrainingType == "VIEW_LECTURE"));
                            foreach (var item in listItems)
                            {
                                task.ListItems.Remove(item);
                            }
                            _context.LmsTasks.Update(task);
                        }
                        _context.LmsLectureManagements.Remove(lecture);
                    }
                    foreach (var item in lmsLectureSubjectCourses)
                    {
                        _context.LmsLectureSubjectCourses.Remove(item);
                    }
                    foreach (var item in listQuiz)
                    {
                        item.LectureCode = "";
                        item.SubjectCode = "";
                        _context.QuizPools.Update(item);
                    }

                    _context.LmsSubjectManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLmsSM["LMS_DELETE_SUBJECT_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsSM["LMS_SUBJECT_NOT_EXIST"];
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
        public object GetSubject(int id, string lmsTaskCode)
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.LmsSubjectManagements.Select(x => new LmsSubjectData()
            {
                Id = x.Id,
                SubjectName = x.SubjectName,
                SubjectCode = x.SubjectCode,
                SubjectDescription = x.SubjectDescription,
                Teacher = x.Teacher,
                Duration = x.Duration,
                Unit = x.Unit,
                ImageCover = x.ImageCover,
                VideoPresent = x.VideoPresent,
                FileBase = x.FileBase,
                Status = x.Status,
                ListLecture = new List<LmsLectureExtraInfo>(),
                ListQuiz = new List<QuizPool>(),
            }).FirstOrDefault(x => x.Id == id);
            data.ListLecture = (from a in _context.LmsLectureManagements.Where(x => x.SubjectCode == data.SubjectCode)
                                join c in _context.LmsTaskUserItemProgresses.Where(x =>
                                        !x.IsDeleted && x.User == session.UserId && x.TrainingType == "VIEW_LECTURE" && x.LmsTaskCode == lmsTaskCode)
                                    on a.LectCode equals c.ItemCode into c1
                                from c in c1.DefaultIfEmpty()
                                join d in _context.LmsTasks.Where(x => !x.IsDeleted) on c.LmsTaskCode equals d.LmsTaskCode into d1
                                from d in d1.DefaultIfEmpty()
                                select new LmsLectureExtraInfo()
                                {
                                    Id = a.Id,
                                    Duration = a.Duration,
                                    IsAssignment = c != null,
                                    IsAlreadyDone = c != null ? c.UpdatedBy != session.UserName : false,
                                    LectCode = a.LectCode,
                                    LectDescription = a.LectDescription,
                                    LectName = a.LectName,
                                    Status = a.Status,
                                    SubjectCode = a.SubjectCode,
                                    VideosDuration = a.VideosDuration,
                                    VideoPresent = a.VideoPresent,
                                    Share = a.Share,
                                    Unit = a.Unit,
                                    LmsTaskCode = d != null ? d.LmsTaskCode : "",
                                    LmsTaskName = d != null ? d.LmsTaskName : ""
                                }).ToList();
            data.ListQuiz = _context.QuizPools.Where(x => x.SubjectCode == data.SubjectCode && !x.IsDeleted).ToList();
            return data;
        }
        [HttpPost]
        public object GetListDetailQuiz(string subjectCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = from a in _context.QuizPools.Where(x => !x.IsDeleted && x.SubjectCode.Equals(subjectCode))
                           let b = a.Duration.HasValue ? a.Duration.Value : 0
                           select new
                           {
                               a.Id,
                               a.Duration,
                               DurationMinute = a.Unit == "MINUTE" ? b : b * 60,
                               a.Unit,
                               Mark = 10, // Default
                               a.Content,
                               a.Code,
                               a.Type,
                               a.JsonData,
                               IdQuiz = a.Id
                           };
                var obj = new
                {
                    isAlreadyDone = false,
                    totalDuration = data.Sum(x => x.DurationMinute),
                    details = data,
                };
                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_NOT_FOUND_QT"];
            }

            return msg;
        }

        [HttpPost]
        public object UpdateViewingLectureProgress([FromBody] LmsTaskViewLectureProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var data = _context.LmsTaskUserItemProgresses.FirstOrDefault(x => x.User.Equals(session.UserId) && x.LmsTaskCode == obj.LmsTaskCode
                && x.TrainingType.Equals("VIEW_LECTURE") && !x.IsDeleted && x.ItemCode.Equals(obj.ItemCode));
                //var log = _context.UserLearnSubjects.FirstOrDefault(x => x.SessionCode == obj.SessionCode && x.CreatedBy == User.Identity.Name && x.LectureCode == obj.ItemCode);
                //var lecture = _context.LmsLectureManagements.FirstOrDefault(x => x.LectCode == obj.ItemCode);
                if (data != null)
                {
                    data.ProgressAuto = 100;
                    data.UpdatedBy = session.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.LmsTaskUserItemProgresses.Update(data);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["COM_UPDATE_FAIL"];
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
        public object LogSession([FromBody] UserLearnSubject data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.UserLearnSubjects.FirstOrDefault(x => x.SessionCode == data.SessionCode && x.CreatedBy == User.Identity.Name && x.LectureCode == data.LectureCode);
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.UserLearnSubjects.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_SAVE_SUCCESS"];
                }
                else
                {
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    if (data.StartTime != null && model.StartTime == null)
                    {
                        model.StartTime = data.StartTime;
                    }
                    if (data.StopTime != null && model.StopTime == null)
                    {
                        model.StopTime = data.StopTime;
                    }
                    _context.UserLearnSubjects.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["CAPTION.LMS_SM_LEARNED_LECTURE"];
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
        #endregion
        #region Model

        public class LmsLectureExtraInfo : LmsLectureManagement
        {
            public bool? IsAssignment { get; set; }
            public bool? IsAlreadyDone { get; set; }
            public string LmsTaskCode { get; set; }
            public string LmsTaskName { get; set; }
        }
        public class LmsTaskViewLectureProgress : LmsTaskUserItemProgress
        {
            public string SessionCode { get; set; }
        }
        public class JTableModelSubject : JTableModel
        {
            public string SubjectCode { get; set; }
            public string SubjectName { get; set; }
            public bool? OnlyAssignment { get; set; }
            public bool? IsSharedAndEditable { get; set; }
        }
        public class LmsSubjectData : LmsSubjectManagement
        {
            public List<LmsLectureExtraInfo> ListLecture { get; set; }
            public List<QuizPool> ListQuiz { get; set; }
        }

        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            try
            {
                var resourceObject = new JObject();
                var query1 = _stringLocalizerLmsSM.GetAllStrings();
                var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                    .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .Union(_stringLocalizerLmsSM.GetAllStrings().Select(x => new { x.Name, x.Value }))
                    .DistinctBy(x => x.Name);
                foreach (var item in query)
                {
                    resourceObject.Add(item.Name, item.Value);
                }
                return Ok(resourceObject);
            }
            catch (Exception ex)
            {
                var resourceObject = new JObject();
                return Ok(resourceObject);
            }
        }
        #endregion
    }
}
