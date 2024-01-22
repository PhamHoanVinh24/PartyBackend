using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.Data;
using System.Globalization;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsAssignmentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<EduExamController> _stringLocalizer;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsAssignmentController> _stringLocalizerAss;
        private readonly IStringLocalizer<StaffLateController> _stringLocalizerStaffLate;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public LmsAssignmentController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IRepositoryService repositoryService,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms, IStringLocalizer<StaffLateController> stringLocalizerStaffLate,
            IStringLocalizer<EduExamController> stringLocalizer, IStringLocalizer<LmsAssignmentController> stringLocalizerAss, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerAss = stringLocalizerAss;
            _stringLocalizerStaffLate = stringLocalizerStaffLate;
            _sharedResources = sharedResources;
            _stringLocalizerLms = stringLocalizerLms;
        }
        //[Breadcrumb("ViewData.CrumbLmsAssignment", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]

        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            //ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbLmsDashBoard"] = /*_sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"]*/_sharedResources["LMS_ASSIGNMENT_SYSTEM_LEARN_ONLINE"];
            ViewData["CrumbLmsAssignment"] = /*_sharedResources["Bài thi"]*/_sharedResources["LMS_ASSIGNMENT_EXERCISE"];
            ViewData["CrumbLmsAssignment"] = /*_sharedResources["Bài thi"]*/_sharedResources["LMS_ASSIGNMENT_EXERCISE"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody] JTableLmsAssignmentModel jTablePara)
        {
            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var user = HttpContext.GetSessionUser();
                var doExcersiseLog = _context.UserDoExerciseResults.Where(x => x.TypeTraining == "DO_EXERCISE").ToList();
                var quizPool = _context.QuizPools.ToList().Where(x => !x.IsDeleted).ToList();
                int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query = from a in _context.LmsTaskUserItemProgresses.ToList().Where(x => !x.IsDeleted && (x.User == user.UserId || user.IsAllData) && x.TrainingType == "DO_EXERCISE")
                            join b in _context.LmsLectureManagements.ToList() on a.ItemCode equals b.LectCode
                            join c in _context.LmsSubjectManagements.ToList() on b.SubjectCode equals c.SubjectCode
                            join d in _context.LmsTasks.ToList() on a.LmsTaskCode equals d.LmsTaskCode
                            let lmsUser = d.ListUsers.FirstOrDefault(x => x.UserId == a.User)
                            where (fromDate == null || (lmsUser != null && fromDate <= lmsUser.BeginDate))
                            && (toDate == null || (lmsUser != null && toDate >= lmsUser.EndDate))
                            && (string.IsNullOrEmpty(jTablePara.Keyword) || b.LectName.Contains(jTablePara.Keyword) || c.SubjectName.Contains(jTablePara.Keyword) || d.LmsTaskName.Contains(jTablePara.Keyword))
                            && (string.IsNullOrEmpty(jTablePara.Teacher) || c.Teacher.Contains(jTablePara.Teacher))
                            && (string.IsNullOrEmpty(jTablePara.Author) || c.Author.Contains(jTablePara.Author))
                            select new
                            {
                                a.Id,
                                a.ProgressAuto,
                                b.LectCode,
                                b.LectName,
                                c.SubjectName,
                                c.Teacher,
                                c.Author,
                                d.LmsTaskName,
                                BeginTime = lmsUser != null ? lmsUser.BeginTime : "",
                                EndTime = lmsUser != null ? lmsUser.EndTime : "",
                                QuizCount = quizPool.Where(x => x.LectureCode == b.LectCode).Count(),
                                DoCount = doExcersiseLog.Where(x => x.ObjectCode == b.LectCode).DistinctBy(x => x.SessionCode).Count()
                            };

                var count = query.Count();
                var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProgressAuto", "LectCode", "LectName", "SubjectName", "Teacher", "Author", "LmsTaskName", "BeginTime", "EndTime", "QuizCount", "DoCount");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "ProgressAuto", "LectCode", "LectName", "SubjectName", "Teacher", "Author", "LmsTaskName", "BeginTime", "EndTime", "QuizCount", "DoCount");
                return Json(jdata);
            }
        }
        [HttpGet]
        public object GetEvent(string type)
        {
            var user = HttpContext.GetSessionUser();
            var items = from a in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && (x.User == user.UserId || user.IsAllData) && x.TrainingType == "DO_EXERCISE")
                        join b in _context.LmsLectureManagements on a.ItemCode equals b.LectCode
                        join c in _context.LmsSubjectManagements on b.SubjectCode equals c.SubjectCode
                        join d in _context.LmsTasks on a.LmsTaskCode equals d.LmsTaskCode
                        let lmsUser = d.ListUsers.FirstOrDefault(x => x.UserId == a.User)
                        select new
                        {
                            Id = a.Id,
                            title = b.LectName,
                            a.ProgressAuto,
                            c.SubjectName,
                            c.Teacher,
                            c.Author,
                            d.LmsTaskName,
                            start = lmsUser != null ? (DateTime?)lmsUser.BeginDate : null,
                            end = lmsUser != null ? (DateTime?)lmsUser.EndDate : null,
                            sStartTime = lmsUser != null ? lmsUser.BeginTime : "",
                            sEndTime = lmsUser != null ? lmsUser.EndTime : "",
                            className = "fc-event-event-custom",
                        };
            return Json(items);
        }
        #endregion

        #region Function
        [HttpPost]
        public object GetListDetailQuiz(string lectureCode, string sessionCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = from a in _context.QuizPools.Where(x => !x.IsDeleted && x.LectureCode.Equals(lectureCode))
                           join c in _context.UserDoExerciseResults.Where(x => x.TypeTraining == "DO_EXERCISE" && x.ObjectCode == lectureCode && x.SessionCode == sessionCode)
                           on a.QuestionCode equals c.QuizCode into c1
                           let b = a.Duration.HasValue ? a.Duration.Value : 0
                           from c in c1.DefaultIfEmpty()
                           select new
                           {
                               a.Id,
                               a.Duration,
                               a.Unit,
                               DurationMinute = a.Unit == "MINUTE" ? b : b * 60,
                               Mark = 10, // Default
                               a.Content,
                               a.Code,
                               a.Type,
                               a.JsonData,
                               IdQuiz = a.Id,
                               UserChoose = c != null ? c.UserChoose : null,
                           };
                var obj = new
                {
                    isAlreadyDone = _context.UserDoExerciseResults.Any(x => x.TypeTraining == "DO_EXERCISE" && x.ObjectCode == lectureCode && x.SessionCode == sessionCode),
                    totalDuration = data.Sum(x => x.DurationMinute),
                    details = data,
                };
                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["LMS_ASSIGNMENT_NO_QUESTIONS_FOUND"];
            }

            return msg;
        }
        [HttpPost]
        public object UpdateDoingExerciseProgress(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.LmsTaskUserItemProgresses.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (data != null)
                {
                    data.ProgressAuto = 100;
                    _context.LmsTaskUserItemProgresses.Update(data);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
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
        #endregion

        #region Model
        public class JTableLmsAssignmentModel : JTableModel
        {
            public string Keyword { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Teacher { get; set; }
            public string Author { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerStaffLate.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerAss.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}