using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.Data;
using System.Globalization;
using System.Collections.Generic;
using System.Net;
using DocumentFormat.OpenXml.EMMA;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using ObjectResult = ESEIM.Models.ObjectResult;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsPracticeTestController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<EduExamController> _stringLocalizer;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSm;
        private readonly IStringLocalizer<LmsPracticeTestController> _stringLocalizerLmsPt;
        private readonly IStringLocalizer<StaffLateController> _stringLocalizerStaffLate;
        private readonly IStringLocalizer<LmsQuizController> _stringLocalizerQuiz;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public LmsPracticeTestController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IRepositoryService repositoryService,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms, IStringLocalizer<LmsSubjectManagementController> stringLocalizerSm,
            IStringLocalizer<LmsPracticeTestController> stringLocalizerLmsPt, IStringLocalizer<StaffLateController> stringLocalizerStaffLate,
            IStringLocalizer<LmsQuizController> stringLocalizerQuiz,
            IStringLocalizer<EduExamController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerLmsPt = stringLocalizerLmsPt;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerQuiz = stringLocalizerQuiz;
            _stringLocalizerLmsSm = stringLocalizerSm;
            _stringLocalizerStaffLate = stringLocalizerStaffLate;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        // ViewData.Title // typeof(LmsDashBoardController)
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbLMSExam"] = _sharedResources["COM_CRUMB_LMS_PRACTICE_TEST"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody] JtableModelLmsPracticeTest jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var session = HttpContext.GetSessionUser();

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.LmsPracticeTestHeaders.Where(x => !x.IsDeleted)
                         join b in _context.LmsSubjectManagements on a.SubjectCode equals b.SubjectCode into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.User == session.UserId && x.TrainingType == "DO_PRACTICE")
                             on a.PracticeTestCode equals c.ItemCode into c1
                         from c in c1.DefaultIfEmpty()
                         join d in _context.LmsTasks.Where(x => !x.IsDeleted) on c.LmsTaskCode equals d.LmsTaskCode into d1
                         from d in d1.DefaultIfEmpty()
                             //join b in _context.EduExaminations.Where(x => !x.IsDeleted) on a.ExamInheritance equals b.Code into b1
                             //from b in b1.DefaultIfEmpty()
                         where (fromDate == null || (fromDate <= a.CreatedTime))
                         && (toDate == null || (toDate >= a.CreatedTime))
                         && (string.IsNullOrEmpty(jTablePara.Title) || a.PracticeTestTitle.Contains(jTablePara.Title))
                         && (string.IsNullOrEmpty(jTablePara.SubjectCode) || b.SubjectCode.Equals(jTablePara.SubjectCode))
                         && (jTablePara.OnlyAssignment != true || (jTablePara.OnlyAssignment == true && c != null))
                         && (jTablePara.IsSharedAndEditable != true || (jTablePara.IsSharedAndEditable == true &&
                                                                        (a.Share.Contains("All") || a.Share.Contains(session.UserName) || session.UserType == 10 || a.CreatedBy.Equals(session.UserName))))
                         select new
                         {
                             a.Id,
                             a.PracticeTestCode,
                             a.PracticeTestTitle,
                             a.Duration,
                             a.Unit,
                             //a.ExamInheritance,
                             ExamSubject = b != null ? b.SubjectName : "",
                             a.CreatedBy,
                             a.CreatedTime,
                             a.Description,
                             IsShared = (a.Share.Contains("All") || a.Share.Contains(session.UserName)),
                             IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                             IsAssignment = c != null,
                             LmsTaskCode = c != null ? c.LmsTaskCode : "",
                             LmsTaskName = d != null ? d.LmsTaskName : "",
                             IsAlreadyDone = c.UpdatedBy == session.UserName
                         }).ToList();
            if (jTablePara.IsSharedAndEditable == true)
            {
                query = query.DistinctBy(x => x.PracticeTestCode).ToList();
            }
            else if (jTablePara.OnlyAssignment == true)
            {
                query = query.DistinctBy(x => new { x.PracticeTestCode, x.LmsTaskCode }).ToList();
            }

            var count = query.Count();
            var countAssignment = query.Where(x => x.IsAssignment).Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "PracticeTestCode", "PracticeTestTitle", "Duration", "Unit", "ExamSubject", "CreatedBy", "CreatedTime", "Description", "IsShared", "IsEditable", "IsAssignment", "IsAlreadyDone", "LmsTaskCode", "LmsTaskName");
            jdata.Add("countAssignment", countAssignment);
            return Json(jdata);
        }

        [HttpGet]
        public object GetEvent(string type)
        {
            var user = HttpContext.GetSessionUser();
            var items = from a in _context.LmsTaskUserItemProgresses.Where(x => !x.IsDeleted && x.User == user.UserId && x.TrainingType == "DO_PRACTICE")
                        join b in _context.LmsPracticeTestHeaders on a.ItemCode equals b.PracticeTestCode
                        join d in _context.LmsTasks on a.LmsTaskCode equals d.LmsTaskCode
                        let lmsUser = d.ListUsers.FirstOrDefault(x => x.UserId == a.User)
                        select new
                        {
                            Id = a.Id,
                            title = b.PracticeTestTitle,
                            a.ProgressAuto,
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
        public object Insert([FromBody] LmsPracticeTestHeader data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsPracticeTestHeaders.FirstOrDefault(x => !x.IsDeleted &&
                    x.PracticeTestCode.Equals(data.PracticeTestCode));
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.LmsPracticeTestHeaders.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_ADD_SUCCESS"];// "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_ERR_EXIST"];// "Bài thi đã tồn tại";
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
        public object Update([FromBody] LmsPracticeTestHeader data)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.LmsPracticeTestHeaders.FirstOrDefault(x => x.Id == data.Id);
                if (model != null)
                {
                    model.PracticeTestCode = data.PracticeTestCode;
                    model.PracticeTestTitle = data.PracticeTestTitle;
                    model.Duration = data.Duration;
                    model.Unit = data.Unit;
                    model.Level = data.Level;
                    model.MarkPass = data.MarkPass;
                    model.MarkTotal = data.MarkTotal;
                    model.NumQuiz = data.NumQuiz;
                    model.Status = data.Status;
                    model.ViewResult = data.ViewResult;
                    model.Rework = data.Rework;
                    model.WorkSequence = data.WorkSequence;
                    model.IsPublished = data.IsPublished;
                    model.SubjectCode = data.SubjectCode;
                    model.Description = data.Description;
                    //model.Note = data.Note;
                    //model.ExamInheritance = data.ExamInheritance;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.LmsPracticeTestHeaders.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_UPDATE_SUCCESS"];// "Cập nhật thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_NOT_EXITS"];// "Bài thi không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];

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
        public object GetItem(int id, string taskCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.LmsPracticeTestHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                var session = HttpContext.GetSessionUser();
                var itemProgress = _context.LmsTaskUserItemProgresses.FirstOrDefault(x =>
                    !x.IsDeleted && x.LmsTaskCode == taskCode);
                var lmsTaskCode = "";
                var isAlreadyDone = false;
                if (itemProgress != null)
                {
                    lmsTaskCode = itemProgress.LmsTaskCode;
                    if (itemProgress.UpdatedBy == session.UserName)
                    {
                        isAlreadyDone = true;
                    }
                }
                msg.Object = new
                {
                    LmsTaskCode = lmsTaskCode,
                    IsAlreadyDone = isAlreadyDone,
                    Model = obj
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_NOT_FOUND"];// "Không tìm thấy bài thi";
            }

            return msg;
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.LmsPracticeTestHeaders.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_NOT_EXITS"];// "Bài thi không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    var details = _context.LmsPracticeTestDetails.Where(x => x.PracticeTestCode == data.PracticeTestCode).ToList();
                    foreach (var item in details)
                    {
                        item.IsDeleted = true;
                        data.DeletedBy = User.Identity.Name;
                        data.DeletedTime = DateTime.Now;
                    }
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.LmsPracticeTestHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_DELETE_SUCCESS"];// "Xóa thành công";
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
        public JsonResult GetUserSharePracticeTestPermission(int id)
        {
            var data = _context.LmsPracticeTestHeaders.FirstOrDefault(x => x.Id.Equals(id));
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
        public object UpdatePracticeTestPermission([FromBody] QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.LmsPracticeTestHeaders.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (model != null)
                {
                    model.Share = data.Share;
                    _context.LmsPracticeTestHeaders.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_DASHBOARD_SAVE_PERMISSION_SUCCESSFULLY"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["LMS_PRACTICE_TEST_MSG_NOT_EXITS"];

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
        public object GetListDetailQuiz(string practiceTestCode, string sessionCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = from a in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted && x.PracticeTestCode.Equals(practiceTestCode))
                           join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestCode equals b.Code
                           join c in _context.UserDoExerciseResults.Where(x => x.TypeTraining == "DO_PRACTICE" && x.ObjectCode == practiceTestCode && x.SessionCode == sessionCode)
                               on a.QuestCode equals c.QuizCode into c1
                           from c in c1.DefaultIfEmpty()
                           orderby a.Order
                           select new
                           {
                               a.Id,
                               a.Order,
                               a.Duration,
                               a.Unit,
                               a.Mark,
                               b.Content,
                               b.Code,
                               b.Type,
                               b.JsonData,
                               IdQuiz = b.Id,
                               UserChoose = c != null ? c.UserChoose : null,
                           };
                var obj = new
                {
                    isAlreadyDone = _context.UserDoExerciseResults.Any(x => x.TypeTraining == "DO_PRACTICE" && x.ObjectCode == practiceTestCode && x.SessionCode == sessionCode),
                    details = data,
                };
                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_NOT_FOUND_QT"];// "Không tìm thấy câu hỏi";
            }

            return msg;
        }
        [HttpPost]
        public object LogSession([FromBody] UserDoExerciseResultModel obj)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.UserDoExerciseResults.FirstOrDefault(x => x.SessionCode == obj.SessionCode && x.CreatedBy == User.Identity.Name && x.QuizCode == obj.QuizCode);
                if (model == null)
                {
                    var data = new UserDoExerciseResult()
                    {
                        QuizCode = obj.QuizCode,
                        UserChoose = obj.UserChoose,
                        Result = obj.Result,
                        TypeTraining = obj.TypeTraining,
                        ObjectCode = obj.ObjectCode,
                        SessionCode = obj.SessionCode
                    };
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.UserDoExerciseResults.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_SAVE_SUCCESS"];// "Log thành công"; 
                }
                else
                {
                    model.UserChoose = obj.UserChoose;
                    model.Result = obj.Result;
                    model.TypeTraining = obj.TypeTraining;
                    model.ObjectCode = obj.ObjectCode;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.UserDoExerciseResults.Update(model);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_HW_SUCCESS"];// "Đã làm bài tập";
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
        public object TrackDilligence([FromBody] ModelDilligences modelDilligences)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var listTrackDiligences = JsonConvert.DeserializeObject<List<LmsTrackDiligence>>(modelDilligences.sListDilligence);
                foreach (var obj in listTrackDiligences)
                {
                    var session = HttpContext.GetSessionUser();
                    var model = _context.LmsTrackDiligences.FirstOrDefault(x => x.ObjectCode == obj.ObjectCode && x.CreatedBy == User.Identity.Name && x.ObjectType == obj.ObjectType);
                    if (model == null)
                    {
                        var data = new LmsTrackDiligence()
                        {
                            ObjectType = obj.ObjectType,
                            ObjectCode = obj.ObjectCode,
                            IsDeleted = false,
                            ObjectResult = obj.ObjectResult
                        };
                        data.CreatedBy = User.Identity.Name;
                        data.CreatedTime = DateTime.Now;
                        _context.LmsTrackDiligences.Add(data);
                        _context.SaveChanges();
                        //msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_SAVE_SUCCESS"];// "Log thành công"; 
                    }
                    else
                    {
                        var listResult =
                            JsonConvert.DeserializeObject<List<ObjectResult>>(obj.ObjectResult);
                        var objResult = listResult.FirstOrDefault();
                        if (objResult != null)
                        {
                            objResult.Id = model.ListPracticeResult.Count + 1;
                        }
                        model.ListPracticeResult.AddRange(listResult);
                        model.UpdatedBy = User.Identity.Name;
                        model.UpdatedTime = DateTime.Now;
                        _context.LmsTrackDiligences.Update(model);
                        _context.SaveChanges();
                    }
                }
                msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_HW_SUCCESS"];// "Đã làm bài tập";
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
        public object UpdateDoingPracticeProgress([FromBody] LmsTaskUserItemProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var sessionInfo = HttpContext.GetSessionUser();
                var data = _context.LmsTaskUserItemProgresses.FirstOrDefault(x => x.User.Equals(sessionInfo.UserId)
                && x.TrainingType.Equals("DO_PRACTICE") && !x.IsDeleted && x.ItemCode.Equals(obj.ItemCode) && x.LmsTaskCode == obj.LmsTaskCode);
                if (data != null)
                {
                    data.ProgressAuto = obj.ProgressAuto;
                    data.TeacherApproved = obj.TeacherApproved;
                    data.UpdatedBy = sessionInfo.UserName;
                    data.UpdatedTime = DateTime.Now;
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

        #region Detail

        [HttpPost]
        public object GetListDetail(string practiceTestCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = from a in _context.LmsPracticeTestDetails.Where(x => !x.IsDeleted && x.PracticeTestCode.Equals(practiceTestCode))
                          join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestCode equals b.Code
                          orderby a.Order
                          select new
                          {
                              a.Id,
                              a.Order,
                              b.Content,
                              b.Type,
                              a.Duration,
                              a.Unit,
                              a.Mark
                          };

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_NOT_FOUND_QT"];// "Không tìm thấy câu hỏi";
            }

            return msg;
        }
        [HttpPost]
        public object InsertQuestion([FromBody] LmsPracticeTestDetail data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsPracticeTestDetails.FirstOrDefault(x => !x.IsDeleted && x.PracticeTestCode.Equals(data.PracticeTestCode) && x.QuestCode.Equals(data.QuestCode));
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.LmsPracticeTestDetails.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_ADD_SUCCESS"];// "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_QUESTION_EXIST"];// "Câu hỏi đã tồn tại";
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
        public object DeleteQuestion(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.LmsPracticeTestDetails.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_MSG_QUESTION_NOT_EXIST"];// "Câu hỏi không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.LmsPracticeTestDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerLmsPt["LMS_PRACTICE_TEST_DELETE_SUCCESS"];// "Xóa thành công";
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

        #endregion

        #region Combobox
        [HttpPost]
        public object GetListQuestion(int pageNo = 1, int pageSize = 10, string content = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !String.IsNullOrEmpty(content) ? content : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content" };
            object[] val = new object[] { pageNo, pageSize, search };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_QUIZ_LMS", param, val);
            var data = CommonUtil.ConvertDataTable<QuizPool>(rs).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            //return query;
            return data;
        }
        [HttpPost]
        public object GetListSubject(int pageNo = 1, int pageSize = 10, string content = "")
        {
            var search = !String.IsNullOrEmpty(content) ? content : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content" };
            object[] val = new object[] { pageNo, pageSize, search };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_SUBJECT_LMS", param, val);
            var data = CommonUtil.ConvertDataTable<LmsSubjectManagement>(rs).Select(x => new { Code = x.SubjectCode, Name = x.SubjectName }).ToList();
            //return query;
            return data;
        }

        [HttpPost]
        public object GetSingleSubject(string subjectCode)
        {
            return _context.LmsSubjectManagements.Select(x => new { Code = x.SubjectCode, Name = x.SubjectName }).FirstOrDefault(x => x.Code == subjectCode);
        }

        #endregion

        #region Model

        public class ModelDilligences
        {
            public string sListDilligence { get; set; }
        }
        public class ModelUserShare
        {
            public string UserName { get; set; }
            public string GivenName { get; set; }
        }
        public class JtableModelLmsPracticeTest : JTableModel
        {
            public string Title { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string SubjectCode { get; set; }
            public bool? OnlyAssignment { get; set; }
            public bool? IsSharedAndEditable { get; set; }
            public bool? GroupBySubject { get; set; }
        }
        public class UserDoExerciseResultModel
        {
            public string QuizCode { get; set; }
            public string UserChoose { get; set; }
            public bool? Result { get; set; }
            public string SessionCode { get; set; }
            public string TypeTraining { get; set; }
            public string ObjectCode { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsPt.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerQuiz.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerStaffLate.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsSm.GetAllStrings().Select(x => new { x.Name, x.Value }))
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