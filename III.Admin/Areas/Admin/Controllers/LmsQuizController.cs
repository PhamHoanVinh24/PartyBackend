using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using III.Domain.Enums;
using Newtonsoft.Json;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsQuizController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EduQuizController> _stringLocalizer;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsQuizController> _stringLocalizerLmsQuiz;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSm;
        private readonly IStringLocalizer<LmsPracticeTestController> _stringLocalizerLmsPt;

        public LmsQuizController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<EduQuizController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<LmsQuizController> stringLocalizerLmsQuiz,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSm,
            IStringLocalizer<LmsPracticeTestController> stringLocalizerLmsPt,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerLmsQuiz = stringLocalizerLmsQuiz;
            _stringLocalizerLmsSm = stringLocalizerLmsSm;
            _stringLocalizerLmsPt = stringLocalizerLmsPt;
            _sharedResources = sharedResources;
        }
        //[Breadcrumb("ViewData.CrumbCmsItem", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]

        public IActionResult Index()
        {
            //ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            //ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            //ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            //ViewData["CrumbCmsItem"] = _sharedResources["Câu hỏi"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody] QuizJTableModel jTablePara)
        {
            var count = 0;
            var data = new List<ModelQuizMobile>();

            try
            {
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var session = HttpContext.GetSessionUser();
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                if (session != null)
                {
                    if (jTablePara.OnlyAssignment == true)
                    {
                        if (jTablePara.GroupBySubject != true)
                        {
                            var query = (from a in _context.QuizPools.Where(x => !x.IsDeleted)
                                         join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                                         from b in b1.DefaultIfEmpty()
                                         join c in _context.LmsSubjectManagements on a.SubjectCode equals c.SubjectCode into c1
                                         from c in c1.DefaultIfEmpty()
                                         //join d in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted) on a.Code equals d.QuestCode
                                         join e in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.User == session.UserId && x.TrainingType == "DO_EXERCISE")
                                             on a.Code equals e.ItemCode
                                         join f in _context.LmsTasks.Where(x => !x.IsDeleted) on e.LmsTaskCode equals f.LmsTaskCode
                                         where string.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode)
                                         && (fromDate == null || (fromDate.Value.Date <= a.CreatedTime.Value.Date))
                                         && (toDate == null || (toDate.Value.Date >= a.CreatedTime.Value.Date))
                                         && (string.IsNullOrEmpty(jTablePara.LectureCode) || a.LectureCode.Contains(jTablePara.LectureCode))
                                         && (string.IsNullOrEmpty(jTablePara.CreatedBy) || a.CreatedBy.Contains(jTablePara.CreatedBy))
                                         /*&& (session.UserType == 10 || a.CreatedBy.Equals(session.UserName) || (a.Share.Contains("All")) || a.Share.Contains(session.UserName))*/
                                         let g = a.Duration.HasValue ? a.Duration.Value : 0
                                         select new ModelQuizMobile()
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
                                             IdQuiz = a.Id,
                                             IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                                             IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                                             LectureName = b != null ? b.LectName : "",
                                             LectureCode = b != null ? b.LectCode : "",
                                             SubjectName = c != null ? c.SubjectName : "",
                                             IsAssignment = true,
                                             LmsTaskCode = e.LmsTaskCode,
                                             LmsTaskName = f.LmsTaskName
                                         })/*.DistinctBy(x => x.Code)*/.ToList();
                            query = query.DistinctBy(x => new { x.Code, x.LmsTaskCode }).ToList();
                            data = query.OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                            count = query.Count();
                            foreach (var item in data)
                            {
                                var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == item.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
                                item.TryTime = trackDiligence != null ? trackDiligence.ListPracticeResult.Count() : 0;
                                if (trackDiligence != null)
                                {
                                    item.IsAlreadyDone = trackDiligence.ListPracticeResult.Any(x =>
                                        x.QuizType == "QUIZ" && x.TaskCode == item.LmsTaskCode);
                                }
                            }
                        }
                        else
                        {
                            var query = (from a in _context.QuizPools.Where(x => !x.IsDeleted)
                                         join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                                         from b in b1.DefaultIfEmpty()
                                         join c in _context.LmsSubjectManagements on a.SubjectCode equals c.SubjectCode into c1
                                         from c in c1.DefaultIfEmpty()
                                         //join d in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted) on a.Code equals d.QuestCode
                                         join e in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.User == session.UserId && x.TrainingType == "DO_EXERCISE")
                                             on a.Code equals e.ItemCode
                                         join f in _context.LmsTasks.Where(x => !x.IsDeleted) on e.LmsTaskCode equals f.LmsTaskCode
                                         where (string.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode))
                                         && (fromDate == null || (fromDate.Value.Date <= a.CreatedTime.Value.Date))
                                         && (toDate == null || (toDate.Value.Date >= a.CreatedTime.Value.Date))
                                         && (string.IsNullOrEmpty(jTablePara.LectureCode) || a.LectureCode.Contains(jTablePara.LectureCode))
                                         && (string.IsNullOrEmpty(jTablePara.CreatedBy) || a.CreatedBy.Contains(jTablePara.CreatedBy))
                                         /*&& (session.UserType == 10 || a.CreatedBy.Equals(session.UserName) || (a.Share.Contains("All")) || a.Share.Contains(session.UserName))*/
                                         let g = a.Duration.HasValue ? a.Duration.Value : 0
                                         select new ModelQuizMobile()
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
                                             IdQuiz = a.Id,
                                             IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                                             IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                                             LectureName = b != null ? b.LectName : "",
                                             LectureCode = b != null ? b.LectCode : "",
                                             SubjectName = c != null ? c.SubjectName : "",
                                             IsAssignment = true,
                                             LmsTaskCode = e.LmsTaskCode,
                                             LmsTaskName = f.LmsTaskName
                                         })/*.DistinctBy(x => x.Code)*/.ToList();
                            query = query.DistinctBy(x => new { x.Code, x.LmsTaskCode }).ToList();
                            data = query.OrderBy(x => x.SubjectCode).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                            count = query.Count();
                            foreach (var item in data)
                            {
                                var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == item.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
                                item.TryTime = trackDiligence != null ? trackDiligence.ListPracticeResult.Count() : 0;
                                if (trackDiligence != null)
                                {
                                    item.IsAlreadyDone = trackDiligence.ListPracticeResult.Any(x =>
                                        x.QuizType == "QUIZ" && x.TaskCode == item.LmsTaskCode);
                                }
                            }
                        }
                    }
                    else if (jTablePara.IsSharedAndEditable == true)
                    {
                        if (jTablePara.GroupBySubject != true)
                        {
                            data = (from a in _context.QuizPools.Where(x => !x.IsDeleted
                                    && (fromDate == null || (fromDate.Value.Date <= x.CreatedTime.Value.Date))
                                    && (toDate == null || (toDate.Value.Date >= x.CreatedTime.Value.Date))
                                    && (string.IsNullOrEmpty(jTablePara.LectureCode) || x.LectureCode.Contains(jTablePara.LectureCode))
                                    && (string.IsNullOrEmpty(jTablePara.CreatedBy) || x.CreatedBy.Contains(jTablePara.CreatedBy))
                                    && (x.Share.Contains("All") || x.Share.Contains(session.UserName) || session.UserType == 10 || x.CreatedBy.Equals(session.UserName)))
                                    .OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length)
                                    join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                                    from b in b1.DefaultIfEmpty()
                                    join c in _context.LmsSubjectManagements on a.SubjectCode equals c.SubjectCode into c1
                                    from c in c1.DefaultIfEmpty()
                                    where ((String.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode)))
                                    /*&& (session.UserType == 10 || a.CreatedBy.Equals(session.UserName) || (a.Share.Contains("All")) || a.Share.Contains(session.UserName))*/
                                    let g = a.Duration.HasValue ? a.Duration.Value : 0
                                    select new ModelQuizMobile()
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
                                        IdQuiz = a.Id,
                                        IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                                        IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                                        LectureName = b != null ? b.LectName : "",
                                        LectureCode = b != null ? b.LectCode : "",
                                        SubjectName = c != null ? c.SubjectName : "",
                                        IsAssignment = false
                                    }).ToList();
                            data = data.DistinctBy(x => x.Code).ToList();
                            //var listExam = (from a in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted)
                            //                join b in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted) on a.PracticeTestCode equals b.ItemCode
                            //                where b.User == session.UserId
                            //                select a.QuestCode
                            //                ).ToList();
                            foreach (var item in data)
                            {
                                //item.IsAssignment = listExam.Any(x => x == item.Code);
                                var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == item.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
                                item.TryTime = trackDiligence != null ? trackDiligence.ListPracticeResult.Count() : 0;
                            }
                            count = _context.QuizPools
                                .Count(x => !x.IsDeleted
                                            && (fromDate == null || (fromDate.Value.Date <= x.CreatedTime.Value.Date))
                                            && (toDate == null || (toDate.Value.Date >= x.CreatedTime.Value.Date))
                                            && (string.IsNullOrEmpty(jTablePara.LectureCode) || x.LectureCode.Contains(jTablePara.LectureCode))
                                            && (string.IsNullOrEmpty(jTablePara.CreatedBy) || x.CreatedBy.Contains(jTablePara.CreatedBy))
                                            && (x.Share.Contains("All") || x.Share.Contains(session.UserName) || session.UserType == 10 || x.CreatedBy.Equals(session.UserName)));
                        }
                        else
                        {
                            data = (from a in _context.QuizPools.Where(x => !x.IsDeleted
                                    && (fromDate == null || (fromDate.Value.Date <= x.CreatedTime.Value.Date))
                                    && (toDate == null || (toDate.Value.Date >= x.CreatedTime.Value.Date))
                                    && (string.IsNullOrEmpty(jTablePara.LectureCode) || x.LectureCode.Contains(jTablePara.LectureCode))
                                    && (string.IsNullOrEmpty(jTablePara.CreatedBy) || x.CreatedBy.Contains(jTablePara.CreatedBy))
                                    && (x.Share.Contains("All") || x.Share.Contains(session.UserName) || session.UserType == 10 || x.CreatedBy.Equals(session.UserName)))
                                    .OrderBy(x => x.SubjectCode).Skip(intBeginFor).Take(jTablePara.Length)
                                    join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                                    from b in b1.DefaultIfEmpty()
                                    join c in _context.LmsSubjectManagements on a.SubjectCode equals c.SubjectCode into c1
                                    from c in c1.DefaultIfEmpty()
                                    where ((String.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode)))
                                    /*&& (session.UserType == 10 || a.CreatedBy.Equals(session.UserName) || (a.Share.Contains("All")) || a.Share.Contains(session.UserName))*/
                                    let g = a.Duration.HasValue ? a.Duration.Value : 0
                                    select new ModelQuizMobile()
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
                                        IdQuiz = a.Id,
                                        IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                                        IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                                        LectureName = b != null ? b.LectName : "",
                                        LectureCode = b != null ? b.LectCode : "",
                                        SubjectName = c != null ? c.SubjectName : "",
                                        IsAssignment = false
                                    }).ToList();
                            data = data.DistinctBy(x => x.Code).ToList();
                            //var listExam = (from a in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted)
                            //                join b in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted) on a.PracticeTestCode equals b.ItemCode
                            //                where b.User == session.UserId
                            //                select a.QuestCode
                            //                ).ToList();
                            foreach (var item in data)
                            {
                                //item.IsAssignment = listExam.Any(x => x == item.Code);
                                var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == item.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
                                item.TryTime = trackDiligence != null ? trackDiligence.ListPracticeResult.Count() : 0;
                            }
                            count = _context.QuizPools
                                .Count(x => !x.IsDeleted
                                            && (fromDate == null || (fromDate.Value.Date <= x.CreatedTime.Value.Date))
                                            && (toDate == null || (toDate.Value.Date >= x.CreatedTime.Value.Date))
                                            && (string.IsNullOrEmpty(jTablePara.LectureCode) || x.LectureCode.Contains(jTablePara.LectureCode))
                                            && (string.IsNullOrEmpty(jTablePara.CreatedBy) || x.CreatedBy.Contains(jTablePara.CreatedBy))
                                            && (x.Share.Contains("All") || x.Share.Contains(session.UserName) || session.UserType == 10 || x.CreatedBy.Equals(session.UserName)));
                        }
                    }
                    else
                    {
                        if (jTablePara.GroupBySubject != true)
                        {
                            data = (from a in _context.QuizPools.Where(x => !x.IsDeleted
                                    && (fromDate == null || (fromDate.Value.Date <= x.CreatedTime.Value.Date))
                                    && (toDate == null || (toDate.Value.Date >= x.CreatedTime.Value.Date))
                                    && (string.IsNullOrEmpty(jTablePara.LectureCode) || x.LectureCode.Contains(jTablePara.LectureCode))
                                    && (string.IsNullOrEmpty(jTablePara.CreatedBy) || x.CreatedBy.Contains(jTablePara.CreatedBy))).OrderByDescending(x => x.Id).Skip(intBeginFor).Take(jTablePara.Length)
                                    join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                                    from b in b1.DefaultIfEmpty()
                                    join c in _context.LmsSubjectManagements on a.SubjectCode equals c.SubjectCode into c1
                                    from c in c1.DefaultIfEmpty()
                                    where ((String.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode)))
                                    /*&& (session.UserType == 10 || a.CreatedBy.Equals(session.UserName) || (a.Share.Contains("All")) || a.Share.Contains(session.UserName))*/
                                    let g = a.Duration.HasValue ? a.Duration.Value : 0
                                    select new ModelQuizMobile()
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
                                        IdQuiz = a.Id,
                                        IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                                        IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                                        LectureName = b != null ? b.LectName : "",
                                        LectureCode = b != null ? b.LectCode : "",
                                        SubjectName = c != null ? c.SubjectName : "",
                                        IsAssignment = false
                                    }).ToList();
                            //var listExam = (from a in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted)
                            //                join b in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted) on a.PracticeTestCode equals b.ItemCode
                            //                where b.User == session.UserId
                            //                select a.QuestCode
                            //                ).ToList();
                            foreach (var item in data)
                            {
                                //item.IsAssignment = listExam.Any(x => x == item.Code);
                                var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == item.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
                                item.TryTime = trackDiligence != null ? trackDiligence.ListPracticeResult.Count() : 0;
                            }
                            count = _context.QuizPools.Count();
                        }
                        else
                        {
                            data = (from a in _context.QuizPools.Where(x => !x.IsDeleted
                                    && (fromDate == null || (fromDate.Value.Date <= x.CreatedTime.Value.Date))
                                    && (toDate == null || (toDate.Value.Date >= x.CreatedTime.Value.Date))
                                    && (string.IsNullOrEmpty(jTablePara.LectureCode) || x.LectureCode.Contains(jTablePara.LectureCode))
                                    && (string.IsNullOrEmpty(jTablePara.CreatedBy) || x.CreatedBy.Contains(jTablePara.CreatedBy))).OrderBy(x => x.SubjectCode).Skip(intBeginFor).Take(jTablePara.Length)
                                    join b in _context.LmsLectureManagements on a.LectureCode equals b.LectCode into b1
                                    from b in b1.DefaultIfEmpty()
                                    join c in _context.LmsSubjectManagements on a.SubjectCode equals c.SubjectCode into c1
                                    from c in c1.DefaultIfEmpty()
                                    where ((String.IsNullOrEmpty(jTablePara.SubjectCode) || a.SubjectCode.Contains(jTablePara.SubjectCode)))
                                    /*&& (session.UserType == 10 || a.CreatedBy.Equals(session.UserName) || (a.Share.Contains("All")) || a.Share.Contains(session.UserName))*/
                                    let g = a.Duration.HasValue ? a.Duration.Value : 0
                                    select new ModelQuizMobile()
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
                                        IdQuiz = a.Id,
                                        IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                                        IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                                        LectureName = b != null ? b.LectName : "",
                                        LectureCode = b != null ? b.LectCode : "",
                                        SubjectName = c != null ? c.SubjectName : "",
                                        IsAssignment = false
                                    }).ToList();
                            //var listExam = (from a in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted)
                            //                join b in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted) on a.PracticeTestCode equals b.ItemCode
                            //                where b.User == session.UserId
                            //                select a.QuestCode
                            //                ).ToList();
                            foreach (var item in data)
                            {
                                //item.IsAssignment = listExam.Any(x => x == item.Code);
                                var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == item.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
                                item.TryTime = trackDiligence != null ? trackDiligence.ListPracticeResult.Count() : 0;
                            }
                            count = _context.QuizPools.Count();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                var msgErr = ex.Message;
            }
            //var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "Code", "Title", "JsonData", "Duration", "DurationMinute", "Content", "Duration", "DurationMinute", "Mark", "QuestionMedia", "IsShared", "IsEditable", "IsAssignment", "IsAlreadyDone", "TryTime", "LectureName", "SubjectName", "LmsTaskCode", "LmsTaskName", "Type");
            return Json(jdata);
        }
        #endregion

        #region Function
        [HttpPost]
        public object Insert([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code.Equals(data.Code));
                if (model == null)
                {
                    data.Category = data.Section;
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.QuizPools.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_ADD_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ADD_SUCCESS"];
                    msg.ID = data.Id;
                }
                else
                {
                    //msg.Title = "Bài viết đã tồn tại";
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_ADD_SUCCESS"];
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
        public object Update([FromBody] QuizPool data)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code.Equals(data.Code));
                if (model != null)
                {
                    model.Title = data.Title;
                    model.Category = data.Section;
                    model.Content = data.Content;
                    model.JsonData = data.JsonData;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_UPDATE_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_QUESTION_NOT_EXIST"];

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
        public object UpdateAnswer([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code.Equals(data.QuestionCode));
                if (model != null)
                {
                    model.JsonData = data.JsonData;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_UPDATE_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_QUESTION_NOT_EXIST"];

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
        public object GetItemQuiz(int id, string taskCode)
        {
            var data = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(id));
            var session = HttpContext.GetSessionUser();
            var trackDiligence = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectType == "QUIZ" && x.ObjectCode == data.Code && !x.IsDeleted && x.CreatedBy == session.UserName);
            var itemProgress = _context.LmsTaskUserItemProgresses.FirstOrDefault(x =>
                !x.IsDeleted && x.LmsTaskCode == taskCode);
            if (itemProgress != null)
            {
                if (data != null)
                {
                    data.LmsTaskCode = itemProgress.LmsTaskCode;
                    if (trackDiligence != null)
                    {
                        data.IsAlreadyDone = trackDiligence.ListPracticeResult.Any(x =>
                            x.QuizType == "QUIZ" && x.TaskCode == taskCode);
                    }
                }
            }
            return Json(data);
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_QUESTION_NOT_EXIST"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.QuizPools.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_DASH_BOARD_SUCCESS_DELETE"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa";
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                return msg;
            }
        }

        [HttpPost]
        public object UpdateQuizPermission([FromBody] LmsLectureManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (model != null)
                {
                    model.Share = data.Share;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLmsQuiz["LMS_QUIZ_SAVE_PERMISSION_SUCCESSFULLY"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizerLmsQuiz["LMS_QUIZ_QUESTION_NOT_EXIST"];

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
        public object UpdateDoingExerciseProgress([FromBody] LmsTaskUserItemProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var sessionInfo = HttpContext.GetSessionUser();
                var data = _context.LmsTaskUserItemProgresses.FirstOrDefault(x => x.User.Equals(sessionInfo.UserId)
                    && x.TrainingType.Equals("DO_EXERCISE") && !x.IsDeleted && x.ItemCode.Equals(obj.ItemCode) && x.LmsTaskCode == obj.LmsTaskCode);
                if (data != null)
                {
                    var countQuizDone = _context.LmsTrackDiligences
                        .Where(x => !x.IsDeleted && x.ObjectType == "QUIZ").Select(x => new
                        {
                            QuizCode = x.ObjectCode,
                            QuizResult = x.ListPracticeResult.FirstOrDefault(y => y.QuizType == "QUIZ" && y.QuizObjCode == data.ItemCode && y.TaskCode == data.LmsTaskCode)
                        }).Count(x => x.QuizResult != null);
                    var countTotalQuiz = _context.QuizPools
                        .Count(x => !x.IsDeleted && x.LectureCode == data.ItemCode);
                    data.ProgressAuto = ((countQuizDone + 1) / countTotalQuiz) * 100;
                    //data.TeacherApproved = obj.TeacherApproved; // improve in future
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

        #region Combobox

        [HttpPost]
        public JsonResult GetListUserConnected()
        {
            var session = HttpContext.GetSessionUser();
            var query1 = (from a in _context.Users
                          join b in _context.LmsMentorMentees on a.UserName equals b.MenteeCode
                          where b.MentorCode == session.UserName && b.IsDeleted == false && b.Status == 2
                          select new
                          {
                              Id = a.Id,
                              UserName = a.UserName,
                              GivenName = a.GivenName,
                              Picture = a.Picture,
                              MenteeId = b.Id
                          });
            var query2 = (from a in _context.Users
                          join b in _context.LmsMentorMentees on a.UserName equals b.MentorCode
                          where b.MenteeCode == session.UserName && b.IsDeleted == false && b.Status == 2
                          select new
                          {
                              Id = a.Id,
                              UserName = a.UserName,
                              GivenName = a.GivenName,
                              Picture = a.Picture,
                              MenteeId = b.Id
                          });
            return Json(query1.Union(query2));
        }

        [HttpPost]
        public JsonResult GetUserShareQuizPermission(int id)
        {
            var data = _context.QuizPools.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
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
        public JsonResult GetListSubject()
        {
            var data = _context.LmsSubjectManagements.Select(x => new
            {
                Code = x.SubjectCode,
                Name = x.SubjectName,
            });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetListLecture(string subjectCode)
        {
            var data = _context.LmsLectureManagements.Where(x => x.SubjectCode == subjectCode).Select(x => new
            {
                Code = x.LectCode,
                Name = x.LectName,
            });
            return Json(data);
        }
        #endregion

        #region Decrepitated

        [HttpPost]
        public object UpdateLecture([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (model != null)
                {
                    model.LectureRelative = data.LectureRelative;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_UPDATE_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
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
        public object GetLectureDetail(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                msg.Object = _context.EduLectures.Where(x => x.published == true && x.id.Equals(id)).FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["LMS_QUIZ_SELECT_LECTURE_ERR"];
            }

            return msg;
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
            var data = _context.EduLectures.Where(x => x.published == true && x.cat_id.Equals(categoryCode)).Select(x => new EduCategory { Id = x.id, Name = x.title }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListQuestionByLecture(int lectureCode)
        {
            var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Name = x.Title, x.JsonData }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListQuestion()
        {
            var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Name = x.Title, x.JsonData }).ToList();
            return data;
        }

        #endregion

        #region Model
        public class ModelQuizMobile
        {
            public int Id { get; set; }
            public int? Duration { get; set; }
            public int DurationMinute { get; set; }
            public string Unit { get; set; }
            public int Mark { get; set; }
            public string QuestionMedia { get; set; }
            public string Content { get; set; }
            public string Code { get; set; }
            public string Type { get; set; }
            public string JsonData { get; set; }
            public int IdQuiz { get; set; }
            public bool IsShared { get; set; }
            public bool IsAssignment { get; set; }
            public bool IsEditable { get; set; }
            public string LectureCode { get; set; }
            public string LectureName { get; set; }
            public string SubjectCode { get; set; }
            public string SubjectName { get; set; }
            public string LmsTaskCode { get; set; }
            public string LmsTaskName { get; set; }
            public int TryTime { get; set; }
            public bool? IsAlreadyDone { get; set; }
        }
        public class ModelUserShare
        {
            public string UserName { get; set; }
            public string GivenName { get; set; }
        }
        public class QuizJTableModel : JTableModel
        {
            public string Content { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public bool? OnlyAssignment { get; set; }
            public bool? GroupBySubject { get; set; }
            public bool? IsSharedAndEditable { get; set; }
            public string SubjectCode { get; set; }
            public string LectureCode { get; set; }
            public string CreatedBy { get; set; }
        }

        public class LectureRelativeModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsSm.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsQuiz.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsPt.GetAllStrings().Select(x => new { x.Name, x.Value }))
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