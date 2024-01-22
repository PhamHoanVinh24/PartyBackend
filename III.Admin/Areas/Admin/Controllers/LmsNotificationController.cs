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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsNotificationController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly UserManager<AspNetUser> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<LmsNotificationController> _stringLocalizer;
        private readonly IStringLocalizer<HrEmployeeController> _stringLocalizerHr;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public LmsNotificationController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager,
            UserManager<AspNetUser> roleManager, ILogger<UserController> logger, IHostingEnvironment hostingEnvironment,
            IActionLogService actionLog, IStringLocalizer<LmsNotificationController> stringLocalizer, IStringLocalizer<HrEmployeeController> stringLocalizerHr,
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
            _stringLocalizerHr = stringLocalizerHr;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }

        //[Breadcrumb("ViewData.CrumbUser", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        public IActionResult Index()
        {
            //ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            //ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            //ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            //ViewData["CrumbUser"] = _stringLocalizer["ADM_USER_TITLE_USER"];
            return View();
        }

        //[Breadcrumb("ViewData.CrumbUser", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        public IActionResult Main()
        {
            //ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            //ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            //ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
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

                var count = query.Count > 0 ? query.FirstOrDefault().TotalRow : 0;
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "CardID", "CardName", "BeginTime", "Sender", "Quantity", "Status");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "CardID", "CardName", "BeginTime", "Sender", "Quantity", "Status");
                return Json(jdata);
            }
        }

        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerHr.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
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