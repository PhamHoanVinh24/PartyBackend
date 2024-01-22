using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public class LmsExamScheduleController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MeetingScheduleController> _stringLocalizer;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizerSTRE;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsTaskManagementController> _stringLocalizerLmsTm;
        private readonly IStringLocalizer<LmsExamScheduleController> _stringLocalizerLmsEXS;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCj;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsPracticeTestController> _stringLocalizerLmsPt;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSm;

        public LmsExamScheduleController(EIMDBContext context, IUploadService upload,
            IStringLocalizer<MeetingScheduleController> stringLocalizer, IStringLocalizer<CardJobController> stringLocalizerCj, IRepositoryService repositoryService,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms, IStringLocalizer<LmsTaskManagementController> stringLocalizerLmsTm,
            IStringLocalizer<LmsExamScheduleController> stringLocalizerLmsEXS, IStringLocalizer<LmsPracticeTestController> stringLocalizerLmsPt,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSm,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<StaffRegistrationController> stringLocalizerSTRE)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerLmsEXS = stringLocalizerLmsEXS;
            _stringLocalizerCj = stringLocalizerCj;
            _stringLocalizerSTRE = stringLocalizerSTRE;
            _stringLocalizerLmsTm = stringLocalizerLmsTm;
            _stringLocalizerLmsPt = stringLocalizerLmsPt;
            _stringLocalizerLmsSm = stringLocalizerLmsSm;
            _repositoryService = repositoryService;
        }

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbLMSExamSchedule"] = _sharedResources["COM_CRUMB_EXAM_SCHEDULE"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody] JtableModelLmsExam jTablePara)
        {
            //var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var dateStart = DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var dateEnd = dateStart.AddDays(1);
            var session = HttpContext.GetSessionUser();

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LmsExamHeaders.Where(x => !x.IsDeleted)
                        join b in _context.LmsSubjectManagements on a.SubjectCode equals b.SubjectCode into b1
                        from b in b1.DefaultIfEmpty()
                            //join b in _context.EduExaminations.Where(x => !x.IsDeleted) on a.ExamInheritance equals b.Code into b1
                            //from b in b1.DefaultIfEmpty()
                        where /*(fromDate == null || (fromDate <= a.CreatedTime))
                        && (toDate == null || (toDate >= a.CreatedTime))*/
                            ((a.StartDate >= dateStart && a.StartDate <= dateEnd) || (a.EndDate >= dateStart && a.EndDate <= dateEnd) || (a.StartDate <= dateStart && dateEnd <= a.EndDate))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.Contains(jTablePara.Title))
                        && (string.IsNullOrEmpty(jTablePara.Subject) || b.SubjectCode.Equals(jTablePara.Subject))
                        && (jTablePara.OnlyAssignment != true || (jTablePara.OnlyAssignment == true && (a.ListUserJoined.Contains("All") || a.ListUserJoined.Contains(session.UserName))
                                || session.UserType == 10 || a.CreatedBy.Equals(session.UserName)))
                        select new
                        {
                            a.Id,
                            a.ExamCode,
                            a.Title,
                            a.StartDate,
                            a.EndDate,
                            //a.ExamInheritance,
                            ExamSubject = b != null ? b.SubjectName : "",
                            a.CreatedBy,
                            a.CreatedTime,
                            a.Description,
                            a.ListUserJoined,
                            IsEditable = (session.UserType == 10 || a.CreatedBy.Equals(session.UserName)),
                            IsAssignment = a.ListUserJoined.Contains("All") || a.ListUserJoined.Contains(session.UserName),
                        };

            var count = query.Count();
            var countAssignment = query.Count(x => x.IsAssignment);
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ExamCode", "Title", "StartDate", "EndDate", "ExamSubject", "CreatedBy", "CreatedTime", "Description", "IsShared", "IsEditable", "IsAssignment", "ListUserJoined");
            jdata.Add("countAssignment", countAssignment);
            return Json(jdata);
        }

        [HttpGet]
        public JsonResult GetAllEvent()
        {
            var today = DateTime.Now.Date;
            var session = HttpContext.GetSessionUser();
            var items = _context.LmsExamHeaders.Where(x => !x.IsDeleted && (x.ListUserJoined.Contains("All") || x.ListUserJoined.Contains(session.UserName)
                    || session.UserType == 10 || x.CreatedBy.Equals(session.UserName)))
                .Select(x => new
                {
                    Id = x.Id,
                    title = x.Title,
                    start = x.StartDate,
                    end = x.EndDate,
                    className = "fc-event-event-custom",
                    color = x.StartDate.Date >= today ? x.BackgroundColor : "#f1f1f1",
                    description = x.Description,
                    examCode = x.ExamCode
                });
            return Json(items);
        }
        #endregion

        #region Function
        [HttpPost]
        public JsonResult Insert([FromBody] ModelExamSchedule data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsExamHeader = _context.LmsExamHeaders.FirstOrDefault(x => x.Title.Equals(data.Title));
                if (lmsExamHeader == null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var obj = new LmsExamHeader
                    {
                        StartDate = startTime,
                        EndDate = endTime,
                        Title = data.Title,
                        ExamCode = data.ExamCode,
                        ListUserJoined = data.ListUserJoined,
                        Level = data.Level,
                        BackgroundColor = data.BackgroundColor,
                        BackgroundImage = data.BackgroundImage,
                        SubjectCode = data.SubjectCode,
                        PracticeTestCode = data.PracticeTestCode,
                        Status = data.Status,
                        Description = data.Description,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now
                    };

                    _context.LmsExamHeaders.Add(obj);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_ADD_CREATE_EXAM_CALENDAR_SUSSESS"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_EXAM_CALENDAR_EXIST"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_EXITS"];
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
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.LmsExamHeaders.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    msg.Object = new
                    {
                        Id = obj.Id,
                        Title = obj.Title,
                        TimeStart = obj.StartDate.ToString("dd/MM/yyyy HH:mm"),
                        TimeEnd = obj.EndDate.ToString("dd/MM/yyyy HH:mm"),
                        ExamCode = obj.ExamCode,
                        ListUserJoined = obj.ListUserJoined,
                        Status = obj.Status,
                        SubjectCode = obj.SubjectCode,
                        Level = obj.Level,
                        PracticeTestCode = obj.PracticeTestCode,
                        BackgroundColor = obj.BackgroundColor,
                        BackgroundImage = obj.BackgroundImage,
                        Description = obj.Description,
                    };
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS__NOT_FIND_CALENDAR_EXAM"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
        public JsonResult Update([FromBody] ModelExamSchedule data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsExamHeader = _context.LmsExamHeaders.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (lmsExamHeader != null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    lmsExamHeader.StartDate = startTime;
                    lmsExamHeader.EndDate = endTime;
                    lmsExamHeader.Title = data.Title;
                    lmsExamHeader.ExamCode = data.ExamCode;
                    lmsExamHeader.ListUserJoined = data.ListUserJoined;
                    lmsExamHeader.Level = data.Level;
                    lmsExamHeader.BackgroundColor = data.BackgroundColor;
                    lmsExamHeader.BackgroundImage = data.BackgroundImage;
                    lmsExamHeader.SubjectCode = data.SubjectCode;
                    lmsExamHeader.PracticeTestCode = data.PracticeTestCode;
                    lmsExamHeader.Status = data.Status;
                    lmsExamHeader.ListUserJoined = data.ListUserJoined;
                    lmsExamHeader.Description = data.Description;
                    lmsExamHeader.UpdatedBy = User.Identity.Name;
                    lmsExamHeader.UpdatedTime = DateTime.Now;

                    _context.LmsExamHeaders.Update(lmsExamHeader);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_UPDATE_EXAM_CALENDAR_SUSSESS"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_NOT_FIND_CALENDAR_EXAM"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
        public JsonResult UpdateOnDrag([FromBody] ModelExamSchedule data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsExamHeader = _context.LmsExamHeaders.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (lmsExamHeader != null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = lmsExamHeader.EndDate.Add(startTime.Date - lmsExamHeader.StartDate.Date);

                    lmsExamHeader.StartDate = startTime;
                    lmsExamHeader.EndDate = endTime;
                    lmsExamHeader.UpdatedBy = User.Identity.Name;
                    lmsExamHeader.UpdatedTime = DateTime.Now;

                    _context.LmsExamHeaders.Update(lmsExamHeader);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_UPDATE_EXAM_CALENDAR_SUSSESS"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_NOT_FIND_CALENDAR_EXAM"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
        public JsonResult Delete(string id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsExamHeader = _context.LmsExamHeaders.FirstOrDefault(x => x.Id.ToString().Equals(id));
                if (lmsExamHeader != null)
                {
                    lmsExamHeader.IsDeleted = true;
                    lmsExamHeader.UpdatedBy = User.Identity.Name;
                    lmsExamHeader.UpdatedTime = DateTime.Now;

                    _context.LmsExamHeaders.Update(lmsExamHeader);
                    _context.SaveChanges();

                    //msg.Title = "Xóa lịch họp thành công";
                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_DELETE_EXAM_CALENDAR_SUSSESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerLmsEXS["LMS_EXS_NOT_FIND_CALENDAR_EXAM"];
                    //msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
        public JsonResult GetUserJoinPracticeTestPermission(int id)
        {
            var data = _context.LmsExamHeaders.FirstOrDefault(x => x.Id.Equals(id));
            var lstUserShare = new List<ModelUserJoin>();
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.ListUserJoined))
                {
                    lstUserShare = JsonConvert.DeserializeObject<List<ModelUserJoin>>(data.ListUserJoined);
                }
            }
            return Json(lstUserShare);
        }

        [HttpPost]
        public object GetListUserJoined(string users)
        {
            var listUser = users.Split(", ");
            return _context.Users.ToList().Where(x => listUser.Any(y => y == x.UserName))
                .Select(x => new {x.UserName, x.GivenName});
        }
        [HttpPost]
        public object UpdatePracticeTestPermission([FromBody] LmsExamHeader data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.LmsExamHeaders.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (model != null)
                {
                    model.ListUserJoined = data.ListUserJoined;
                    _context.LmsExamHeaders.Update(model);
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
        public object GetListDetailQuiz(string examCode, string sessionCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = from a in _context.LmsExamDetails.Where(x => !x.IsDeleted && x.ExamCode.Equals(examCode))
                           join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestCode equals b.Code
                           join c in _context.UserDoExerciseResults.Where(x => x.TypeTraining == "DO_PRACTICE" && x.ObjectCode == examCode && x.SessionCode == sessionCode)
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
                    isAlreadyDone = _context.UserDoExerciseResults.Any(x => x.TypeTraining == "DO_PRACTICE" && x.ObjectCode == examCode && x.SessionCode == sessionCode),
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
        public object GetItemTest(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.LmsExamHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                if (data != null)
                {
                    var obj = _context.LmsPracticeTestHeaders.FirstOrDefault(x => !x.IsDeleted && x.PracticeTestCode.Equals(data.PracticeTestCode));
                    msg.Object = new
                    {
                        LmsTaskCode = "",
                        IsAlreadyDone = false,
                        Model = obj
                    };
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizerLms["LMS_PRACTICE_TEST_MSG_NOT_FOUND"];// "Không tìm thấy bài thi";
            }

            return msg;
        }
        #endregion

        #region Combobox
        [HttpPost]
        public object GetListPractice(int pageNo = 1, int pageSize = 10, string content = "", string subject = "", string createdBy = "")
        {
            var search = !String.IsNullOrEmpty(content) ? content : "";
            var subjectCode = !String.IsNullOrEmpty(subject) ? subject : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content", "@subjectCode", "@createdBy" };
            object[] val = new object[] { pageNo, pageSize, search, subjectCode, createdBy };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_PRACTICE_LMS", param, val);
            var data = CommonUtil.ConvertDataTable<LmsPracticeTestHeader>(rs).Select(x => new { Code = x.PracticeTestCode, Name = x.PracticeTestTitle }).ToList();
            //return query;
            return data;
        }

        [HttpPost]
        public object GetSinglePractice(string practiceCode)
        {
            return _context.LmsPracticeTestHeaders.Select(x => new { Code = x.PracticeTestCode, Name = x.PracticeTestTitle }).FirstOrDefault(x => x.Code == practiceCode);
        }

        #endregion

        #region Detail

        [HttpPost]
        public object GetListDetail(string examCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = from a in _context.LmsExamDetails.Where(x => !x.IsDeleted && x.ExamCode.Equals(examCode))
                          join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestCode equals b.Code
                          orderby a.Order
                          select new
                          {
                              a.Id,
                              a.Order,
                              b.Content,
                              a.Duration,
                              a.Unit,
                              a.Mark
                          };

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["LMS_PRACTICE_TEST_MSG_NOT_FOUND_QT"];// "Không tìm thấy câu hỏi";
            }

            return msg;
        }
        [HttpPost]
        public object InsertQuestion([FromBody] LmsExamDetail data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.LmsExamDetails.FirstOrDefault(x => !x.IsDeleted && x.ExamCode.Equals(data.ExamCode) && x.QuestCode.Equals(data.QuestCode));
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.LmsExamDetails.Add(data);
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
                var data = _context.LmsExamDetails.FirstOrDefault(x => x.Id.Equals(id));
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
                    _context.LmsExamDetails.Update(data);
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
        #region Model
        public class ModelUserJoin
        {
            public string UserName { get; set; }
            public string GivenName { get; set; }
        }

        public class ModelExamSchedule : LmsExamHeader
        {
            public string StartTime { get; set; }
            public string EndTime { get; set; }
        }
        public class JtableModelLmsExam : JTableModel
        {
            public string Title { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Subject { get; set; }
            public string Date { get; set; }
            public bool? OnlyAssignment { get; set; }
            public bool? GroupBySubject { get; set; }
        }
        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCj.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsTm.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsEXS.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsPt.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSTRE.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsSm.GetAllStrings().Select(x => new { x.Name, x.Value }))
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