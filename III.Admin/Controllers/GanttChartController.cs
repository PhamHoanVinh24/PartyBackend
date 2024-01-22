using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Drawing.Charts;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    public class GanttChartController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IUserLoginService _loginService;
        private readonly IRepositoryService _repositoryService;
        //private readonly IHostingEnvironment _hostingEnvironment;
        //private readonly IStringLocalizer<EduQuizController> _stringLocalizer;
        //private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        //private readonly IStringLocalizer<LmsQuizController> _stringLocalizerLmsQuiz;
        //private readonly IStringLocalizer<SharedResources> _sharedResources;
        //private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSm;
        //private readonly IStringLocalizer<LmsPracticeTestController> _stringLocalizerLmsPt;

        public GanttChartController(EIMDBContext context, IUploadService upload,
            IUserLoginService loginService,
            IRepositoryService repositoryService
            //IHostingEnvironment hostingEnvironment,
            //IStringLocalizer<EduQuizController> stringLocalizer,
            //IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            //IStringLocalizer<LmsQuizController> stringLocalizerLmsQuiz,
            //IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSm,
            //IStringLocalizer<LmsPracticeTestController> stringLocalizerLmsPt,
            //IStringLocalizer<SharedResources> sharedResources
            )
        {
            _context = context;
            _upload = upload;
            _loginService = loginService;
            _repositoryService = repositoryService;
        }
        public IActionResult Index()
        {
            var dataSearch = new AdvanceSearchCj
            {
                Draw = 0,
                Columns = null,
                Order = null,
                Start = 0,
                Length = 20000,
                search = null,
                ListCode = null,
                BoardCode = null,
                CardName = null,
                Member = null,
                FromDate = "01/06/2022",
                ToDate = "30/09/2022",
                Status = null,
                ObjDependency = null,
                ObjCode = null,
                ListObjCode = null,
                TabBoard = 0,
                Page = 0,
                Description = null,
                Comment = null,
                SubItem = null,
                Object = null,
                BranchId = null,
                ObjType = null,
                Project = null,
                Group = null,
                UserId = "0d7d1f0c-eec7-42ec-9296-4bfe97c5bc06",
                UserName = "admin",
                Department = null,
                UserIdSearch = null,
                UserNameSearch = null,
                DepartmentSearch = null,
                Supplier = null,
                Customer = null,
                Contract = null,
                BoardSearch = null,
                CurrentPageList = 1,
                WorkflowInstCode = null,
                TimeType = "[{\"Code\":\"CJ_TIME_TYPE_CREATE\",\"Name\":\"Ngày tạo thẻ\"},{\"Code\":\"CJ_TIME_TYPE_START\",\"Name\":\"Ngày bắt đầu\"}]",
                TimeTypeCreated = false,
                TimeTypeStart = false,
                TimeTypeEnd = false,
                TimeTypeCompleted = false
            };
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == dataSearch.UserName);
            var session = _loginService.GetSessionUser(user.Id);
            var fromDate = string.IsNullOrEmpty(dataSearch.FromDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(dataSearch.ToDate) ? (DateTime?)null : DateTime.ParseExact(dataSearch.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";
            var listUserOfBranch = "";
            var query = new List<CardJobController.GridCardGantt>();
            if (!string.IsNullOrEmpty(dataSearch.TimeType))
            {
                dataSearch.TimeTypeCreated = dataSearch.TimeType.Contains("CJ_TIME_TYPE_CREATE");
                dataSearch.TimeTypeStart = dataSearch.TimeType.Contains("CJ_TIME_TYPE_START");
                dataSearch.TimeTypeEnd = dataSearch.TimeType.Contains("CJ_TIME_TYPE_END");
                dataSearch.TimeTypeCompleted = dataSearch.TimeType.Contains("CJ_TIME_TYPE_COMPLETE");
            }
            else
            {
                dataSearch.TimeTypeCreated = false;
                dataSearch.TimeTypeStart = true;
                dataSearch.TimeTypeEnd = true;
                dataSearch.TimeTypeCompleted = false;
            }
            if (session.IsBranch)
            {
                if (session.ListUserOfBranch.Any())
                {
                    listUserOfBranch = string.Join(",", session.ListUserOfBranch);
                }
            }
            if (string.IsNullOrEmpty(dataSearch.CardName) && string.IsNullOrEmpty(dataSearch.Status) && string.IsNullOrEmpty(dataSearch.BoardSearch)
                && string.IsNullOrEmpty(dataSearch.Contract) && string.IsNullOrEmpty(dataSearch.Project) && string.IsNullOrEmpty(dataSearch.ToDate)
                && string.IsNullOrEmpty(dataSearch.Supplier) && string.IsNullOrEmpty(dataSearch.Customer) && string.IsNullOrEmpty(dataSearch.Department)
                && string.IsNullOrEmpty(dataSearch.ListCode) && string.IsNullOrEmpty(dataSearch.Group) && string.IsNullOrEmpty(dataSearch.UserIdSearch)
                && string.IsNullOrEmpty(dataSearch.FromDate) && string.IsNullOrEmpty(dataSearch.WorkflowInstCode) && string.IsNullOrEmpty(dataSearch.TimeType))
            {
                string[] param = new string[] { "@PageNo", "@PageSize", "@IsAllData", "@IsUser", "@IsBranch", "@DepartmentId", "@UserName",
                        "@ListUserOfBranch", "@UserId", "@Branch", "@WorkflowInstCode" };
                object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length , session.IsAllData, session.IsUser, session.IsBranch,
                    !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "", session.UserName, !string.IsNullOrEmpty(listUserOfBranch) ? listUserOfBranch : "", session.UserId,
                        !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "", ""};
                System.Data.DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_ALL_BOARD_CARD_NO_CONDITION_GANTT", param, val);
                query = CommonUtil.ConvertDataTable<CardJobController.GridCardGantt>(rs);
                //msg.Object = query;
            }
            else
            {
                string[] param = new string[] { "@PageNo", "@PageSize", "@fromDate", "@toDate", "@IsAllData", "@IsUser", "@IsBranch", "@UserName",
                        "@ListUserOfBranch", "@DepartmentId", "@BoardSearch", "@UserId", "@BranchId", "@Status", "@CardName", "@ListCode", "@Group",
                        "@Project", "@Customer", "@Supplier", "@Contract", "@UserIdSearch", "@UserNameSearch", "@DepartmentSearch", "@WorkflowInstCode",
                        "@TimeTypeCreated", "@TimeTypeStart", "@TimeTypeEnd", "@TimeTypeCompleted"};

                object[] val = new object[] { dataSearch.CurrentPage, dataSearch.Length ,fromDatePara, toDatePara, session.IsAllData, session.IsUser,
                        session.IsBranch, session.UserName, !string.IsNullOrEmpty(listUserOfBranch) ? listUserOfBranch : "", !string.IsNullOrEmpty(user.DepartmentId) ? user.DepartmentId : "",
                        !string.IsNullOrEmpty(dataSearch.BoardSearch) ? dataSearch.BoardSearch : "", session.UserId, !string.IsNullOrEmpty(dataSearch.BranchId) ? dataSearch.BranchId : "",
                        !string.IsNullOrEmpty(dataSearch.Status) ? dataSearch.Status : "", !string.IsNullOrEmpty(dataSearch.CardName) ? dataSearch.CardName : "", !string.IsNullOrEmpty(dataSearch.ListCode) ? dataSearch.ListCode : "",
                        !string.IsNullOrEmpty(dataSearch.Group) ? dataSearch.Group : "", !string.IsNullOrEmpty(dataSearch.Project) ? dataSearch.Project : "",
                        !string.IsNullOrEmpty(dataSearch.Customer) ? dataSearch.Customer : "", !string.IsNullOrEmpty(dataSearch.Supplier) ? dataSearch.Supplier: "",
                        !string.IsNullOrEmpty(dataSearch.Contract) ? dataSearch.Contract: "", !string.IsNullOrEmpty(dataSearch.UserIdSearch) ? dataSearch.UserIdSearch : "",
                        !string.IsNullOrEmpty(dataSearch.UserNameSearch) ? dataSearch.UserNameSearch : "", !string.IsNullOrEmpty(dataSearch.DepartmentSearch) ? dataSearch.DepartmentSearch: "",
                        !string.IsNullOrEmpty(dataSearch.WorkflowInstCode) ? dataSearch.WorkflowInstCode : "",
                        dataSearch.TimeTypeCreated, dataSearch.TimeTypeStart, dataSearch.TimeTypeEnd, dataSearch.TimeTypeCompleted };
                System.Data.DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_ALL_BOARD_CARD_WITH_CONDITION_GANTT", param, val);
                query = CommonUtil.ConvertDataTable<CardJobController.GridCardGantt>(rs);
                //msg.Object = query;
            }
            var result = from a in query
                         group a by a.CardID into g1
                         select new
                         {
                             BoardID = g1.FirstOrDefault().BoardID,
                             BoardName = g1.FirstOrDefault().BoardName,
                             StartTime = g1.FirstOrDefault().StartTime.Value.ToString("MM/dd/yyyy"),
                             EndTime = g1.FirstOrDefault().EndTime.Value.ToString("MM/dd/yyyy"),
                             Duration = g1.FirstOrDefault().Duration,
                             //BoardCompleted = g1.FirstOrDefault().BoardID,
                             CardID = g1.FirstOrDefault().CardID,
                             CardCode = g1.FirstOrDefault().CardCode,
                             CardName = g1.FirstOrDefault().CardName,
                             Cycle = g1.FirstOrDefault().Cycle,
                             BeginTime = g1.FirstOrDefault().BeginTime.Value.ToString("MM/dd/yyyy"),
                             Deadline = g1.FirstOrDefault().Deadline.Value.ToString("MM/dd/yyyy"),
                             Completed = g1.Count() > 0 ? g1.Sum(x => x.Completed) / g1.Count() : 0
                         }
                         into f
                         group f by f.BoardID into g2
                         select new
                         {
                             TaskId = g2.Key,
                             TaskName = g2.FirstOrDefault().BoardName,
                             StartDate = g2.FirstOrDefault().StartTime,
                             EndDate = g2.FirstOrDefault().EndTime,
                             Duration = g2.FirstOrDefault().Duration,
                             SubTasks = g2.Select(
                                 x => new
                                 {
                                     TaskId = x.CardID,
                                     //x.CardCode,
                                     TaskName = x.CardName,
                                     StartDate = x.BeginTime,
                                     EndDate = x.Deadline,
                                     Progress = x.Completed
                                 }),
                         };
            ViewBag.dataSource = result;
            return View();
        }

        public class AdvanceSearchCj : JTableModel
        {
            public string ListCode { get; set; }
            public string BoardCode { get; set; }
            public string CardName { get; set; }
            public string Member { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Status { get; set; }
            public string ObjDependency { get; set; }
            public string ObjCode { get; set; }
            public List<Properties> ListObjCode { get; set; }
            public int TabBoard { get; set; }
            public int Page { get; set; }
            public string Description { get; set; }
            public string Comment { get; set; }
            public string SubItem { get; set; }
            public string Object { get; set; }
            public string BranchId { get; set; }
            public string ObjType { get; set; }
            public string Project { get; set; }
            public string Group { get; set; }
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string Department { get; set; }
            public string UserIdSearch { get; set; }
            public string UserNameSearch { get; set; }
            public string DepartmentSearch { get; set; }
            public string Supplier { get; set; }
            public string Customer { get; set; }
            public string Contract { get; set; }
            public string BoardSearch { get; set; }
            public int CurrentPageList { get; set; }
            public string WorkflowInstCode { get; set; }
            public string TimeType { get; set; }
            public bool TimeTypeCreated { get; set; }
            public bool TimeTypeStart { get; set; }
            public bool TimeTypeEnd { get; set; }
            public bool TimeTypeCompleted { get; set; }
        }
        public class GanttDataSource
        {
            public int TaskId { get; set; }
            public string TaskName { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public int? Duration { get; set; }
            public int Progress { get; set; }
            public List<GanttDataSource> SubTasks { get; set; }
        }
    }
}
