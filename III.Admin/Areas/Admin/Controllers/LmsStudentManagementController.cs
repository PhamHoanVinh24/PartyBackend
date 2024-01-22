using System.Data;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using ESEIM;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using FTU.Utils.HelperNet;
using System;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsStudentManagementController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly UserManager<AspNetUser> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<LmsStudentManagementController> _stringLocalizerLmsSm;
        private readonly IStringLocalizer<UserController> _stringLocalizer;
        private readonly IStringLocalizer<HrEmployeeController> _stringLocalizerHr;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;

        public LmsStudentManagementController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager,
            UserManager<AspNetUser> roleManager, ILogger<UserController> logger, IHostingEnvironment hostingEnvironment,
            IActionLogService actionLog, IStringLocalizer<UserController> stringLocalizer, IStringLocalizer<LmsStudentManagementController> stringLocalizerLmsSm,
            IStringLocalizer<HrEmployeeController> stringLocalizerHr,  IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
        IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLmsSm = stringLocalizerLmsSm;
            _stringLocalizerHr = stringLocalizerHr;
            _sharedResources = sharedResources;
            _stringLocalizerLms = stringLocalizerLms;
            _repositoryService = repositoryService;
        }

        [Breadcrumb("ViewData.CrumbUser", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuCenterController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCentert"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbLmsStudent"] = _sharedResources["COM_CRUMB_LMS_STUDENT"];
            //ViewData["CrumbUser"] = _stringLocalizer["ADM_USER_TITLE_USER"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody] JTableModelLmsStudent jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            var query = new List<StudentModelProceduce>();

            try
            {

                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                string[] param = new string[] { "@pageNo", "@pageSize", "@UserName", "@GivenName", "@Email", "@CourseCode", "@SubjectCode", "@Teacher", "@IsSubAdmin", "@IsAllData", "@CurrentUserName" };
                object[] val = new object[] { jTablePara.CurrentPage, jTablePara.Length, jTablePara.UserName,
                    jTablePara.GivenName, jTablePara.Email, string.IsNullOrEmpty(jTablePara.CourseCode) ? "" : jTablePara.CourseCode,
                    jTablePara.SubjectCode, jTablePara.Teacher, session.IsSubAdmin, session.IsAllData, session.UserName };
                DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_LMS_STUDENT", param, val);
                query = CommonUtil.ConvertDataTable<StudentModelProceduce>(rs);

                //foreach (var item in query)
                //{
                //    var listRoleGroup = listRoleUser.Where(x => x.UserId.Equals(item.Id));
                //    item.ListRoleGroup = listRoleGroup.Count() > 0 ? JsonConvert.SerializeObject(listRoleGroup) : "";
                //}

                var count = query.FirstOrDefault().TotalRow;
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "UserName", "Email", "FullName", "EmployeeCode", "CreatedDate", "Picture", "Gender", "Phone", "Progress", "TaskNumber");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "Id", "UserName", "Email", "FullName", "EmployeeCode", "CreatedDate", "Picture", "Gender", "Phone", "Progress", "TaskNumber");
                return Json(jdata);
            }
        }

        [HttpPost]
        public object GetItemSubject(string subjectCode)
        {
            var data = _context.LmsSubjectManagements.FirstOrDefault(x => x.SubjectCode.Equals(subjectCode));
            return Json(data);
        }
        [HttpPost]
        public object GetListCourse()
        {
            var data = _context.LmsCourses.Where(x => x.IsDeleted == false).Select(x => new { Code = x.CourseCode, Name = x.CourseName }).ToList();
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetLmsUserProgressGroupByTask(string userId)
        {
            var data = (from a in _context.LmsTaskUserItemProgresses.Where(x => x.User.Equals(userId) && !x.IsDeleted)
                        join b in _context.LmsTasks.Where(x => !x.IsDeleted) on a.LmsTaskCode equals b.LmsTaskCode
                        select new
                        {
                            a.ItemCode,
                            a.TrainingType,
                            a.ItemTitle,
                            a.ProgressAuto,
                            a.TeacherApproved,
                            a.LmsTaskCode,
                            b.LmsTaskName,
                            BeginTime = b.BeginTime.ToString("dd/MM/yyyy HH:mm"),
                            EndTime = b.EndTime.HasValue ? b.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                        }
                ).GroupBy(x => x.LmsTaskCode).Select(
                g => new
                {
                    g.Key,
                    TaskName = g.FirstOrDefault().LmsTaskName,
                    BeginTime = g.FirstOrDefault().BeginTime,
                    EndTime = g.FirstOrDefault().EndTime,
                    AvgProgress = g.Count() > 0 ? g.Average(y => y.ProgressAuto) : 0,
                    ListItems = g.ToList()
                });
            return Json(data);
        }

        [HttpPost]
        public object JTableMentee([FromBody] JTableModel jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            var query = new List<StudentModelProceduce>();

            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query1 = (from a in _context.Users
                         join b in _context.LmsMentorMentees on a.UserName equals b.MenteeCode
                         where b.MentorCode == session.UserName && b.IsDeleted == false
                         select new
                         {
                             Id = a.Id,
                             UserName = a.UserName,
                             FullName = a.GivenName,
                             Picture = a.Picture,
                             MenteeId = b.Id
                         });
                int count = query1.Count();
                var data = query1.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FullName", "UserName", "Picture", "MenteeId");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "Id", "FullName", "UserName", "Picture", "MenteeId");
                return Json(jdata);
            }
        }
        [HttpPost]
        public JsonResult InsertStudent(string keyword)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                if (!_context.Users.Any(x => x.Email.Contains(keyword) || x.UserName.Contains(keyword)))
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ADM_USER_LBL_USER"]);
                    return Json(msg);
                }
                var menteeList = _context.LmsMentorMentees.Where(x => x.IsDeleted == false && x.MentorCode == session.UserName);
                var user = _context.Users.FirstOrDefault(x => !menteeList.Any(y => y.MenteeCode == x.UserName)
                && (x.Email.Contains(keyword) || x.UserName.Contains(keyword)));
                if (user != null)
                {
                    var data = new LmsMentorMentee()
                    {
                        MentorCode = session.UserName,
                        MenteeCode = user.UserName,
                        CreatedBy = session.UserName,
                        CreatedDate = DateTime.Now,
                        IsDeleted = false
                    };
                    _context.LmsMentorMentees.Add(data);
                    var messageContent = new
                    {
                        MsgTitle = string.Format("{0} " + _stringLocalizerLmsSm["LMS_ADD_STUDENT"], session.FullName)
                    };
                    var message = new LmsMessageNotification()
                    {
                        MsgContent = JsonConvert.SerializeObject(messageContent),
                        MsgType = "MSG_REQUEST_CONNECT",
                        CreatedBy = session.UserName,
                        CreatedDate = DateTime.Now,
                        IsDeleted = false
                    };
                    _context.LmsMessageNotifications.Add(message);
                    _context.SaveChanges();
                    var notification = new LmsUserMessage()
                    {
                        MsgId = message.Id,
                        UsrSend = session.UserName,
                        UsrReceiver = user.UserName,
                        Confirm = false,
                        CreatedBy = session.UserName,
                        CreatedDate = DateTime.Now,
                        IsDeleted = false
                    };
                    _context.LmsUserMessages.Add(notification);
                    _context.SaveChanges(); 
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ADM_USER_LBL_USER"]);
                    return Json(msg);
                }
                msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_ERR_ADD"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteStudent(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.LmsMentorMentees.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsSm.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerHr.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }

        #region Model
        public class JTableModelLmsStudent : JTableModel
        {
            public string UserName { set; get; }
            public string GivenName { set; get; }
            public string Email { set; get; }
            public string EmployeeCode { set; get; }
            public string CourseCode { set; get; }
            public string SubjectCode { set; get; }
            public string LectCode { set; get; }
            public string Teacher { set; get; }
            public int Page { set; get; }
            public int Row { set; get; }
            public int ExportType { set; get; }
        }
        public class StudentModelProceduce
        {
            public string Id { get; set; }
            public string UserName { get; set; }
            public string Email { get; set; }
            public string EmployeeCode { get; set; }
            public DateTime? CreatedDate { get; set; }
            public int? Gender { get; set; }
            public string Picture { get; set; }
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Color { get; set; }
            public decimal? Progress { get; set; }
            public int? TaskNumber { get; set; }
            public Int64 RowNumber { get; set; }
            public int TotalRow { get; set; }
        }
        #endregion
    }
}