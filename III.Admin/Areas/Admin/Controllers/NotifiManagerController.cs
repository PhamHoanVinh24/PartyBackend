using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Data;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class NotifiManagerController : Controller
    {
        public class ProjectManagementJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string DueDate { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<NotifiManagerController> _stringLocalizer;
        private readonly IStringLocalizer<ProjectManagementController> _projectStringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        private readonly IParameterService _iParameterService;
        public NotifiManagerController(EIMDBContext context, IHostingEnvironment hostingEnvironment, 
            IStringLocalizer<NotifiManagerController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController, 
            IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService, 
            IParameterService iParameterService, IStringLocalizer<ProjectManagementController> projectStringLocalizer)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
            _iParameterService = iParameterService;
            _projectStringLocalizer = projectStringLocalizer;
        }

        [Breadcrumb("ViewData.CrumbNotify", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index(string userId)
        {
            ViewBag.userId = userId;
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbNotify"] = _stringLocalizer["NTMC_CRUMB_NOTIFY"];
            return View();
        }

        #region Index
        [HttpPost]
        public object JTable([FromBody]ProjectManagementJtable jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            string[] param = new string[] { "@PageNo", "@PageSize", "@UserId", "@uName", "@Code", "@Name", "@Status",
                "@FromDate", "@ToDate"};
            object[] val = new object[] { jTablePara.CurrentPage, jTablePara.Length, session.UserId, session.UserName,
                jTablePara.Code, jTablePara.Name,!string.IsNullOrEmpty(jTablePara.Status) ? jTablePara.Status : "", fromDate, toDate };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_CARD_NOTIFY", param, val);
            var query = CommonUtil.ConvertDataTable<GridCardJtable>(rs);

            var count = query.Count > 0 ? int.Parse(query.FirstOrDefault().TotalRow) : 0;
            var jdata = JTableHelper.JObjectTable(
                                query,
                                jTablePara.Draw,
                                count,
                                "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "WorkType", "UpdatedTimeTxt", "UpdateTime"
                                );
            return Json(jdata);
        }

        [HttpPost]
        public object GetCountNotify()
        {
            try
            {
                var session = HttpContext.GetSessionUser();
                int countWork = _iParameterService.GetCountNotifiCardJob(session.UserId, session.UserName);
                int countProject = _iParameterService.GetCountNotificationProject(session.UserId, session.IsAllData, session.UserName);
                int countContract = _iParameterService.GetCountNotificationContract(session.UserId, session.IsAllData, session.UserName);
                int countContractPO = _iParameterService.GetCountNotificationContractPO(session.UserId, session.IsAllData, session.UserName);
                int countCms = _iParameterService.GetCountNotificationCMS(session.UserId);
                int countWorkFlow = _iParameterService.GetCountNotificationWorkFlow(session.UserId);
                var all = countWork + countProject + countContract + countContractPO + countCms + countWorkFlow;
                return new
                {
                    CountWork = countWork,
                    CountProject = countProject,
                    CountContract = countContract,
                    CountContractPO = countContractPO,
                    CountCms = countCms,
                    CountWorkFlow = countWorkFlow,
                    All = all
                };
            }
            catch (Exception ex)
            {
                return new { };
            }
        }
        public class GridCardJtable
        {
            public int CardID { get; set; }
            public string CardCode { get; set; }
            public string CardName { get; set; }
            public DateTime Deadline { get; set; }
            public decimal Completed { get; set; }
            public DateTime BeginTime { get; set; }
            public DateTime? EndTime { get; set; }
            public DateTime? UpdateTime { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string UpdatedTimeTxt { get; set; }
            public string Priority { get; set; }
            public string WorkType { get; set; }
            public string TotalRow { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_projectStringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
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