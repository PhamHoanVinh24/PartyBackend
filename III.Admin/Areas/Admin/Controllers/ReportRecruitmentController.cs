using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
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
    public class ReportRecruitmentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ReportRecruitmentController> _stringLocalizer;
        private readonly IStringLocalizer<StaffRegistrationController> _staffLocalizer;
        private readonly IStringLocalizer<PlanRecruitmentController> _planLocalizer;
        private readonly IStringLocalizer<PlanExcuteRecruitmentController> _excuteLocalizer;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepoLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ReportRecruitmentController(EIMDBContext context, IUploadService upload, IStringLocalizer<ReportRecruitmentController> stringLocalizer,
            IStringLocalizer<StaffRegistrationController> staffLocalizer,
            IStringLocalizer<PlanExcuteRecruitmentController> excuteLocalizer, IStringLocalizer<PlanRecruitmentController> planLocalizer,
            IStringLocalizer<EDMSRepositoryController> edmsRepoLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _staffLocalizer = staffLocalizer;
            _excuteLocalizer = excuteLocalizer;
            _planLocalizer = planLocalizer;
            _edmsRepoLocalizer = edmsRepoLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbReportRecruitment", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbReportRecruitment"] = _stringLocalizer["REP_RECRUIMENT_PROCESS"];
            return View();
        }
        #region Candidate
        [HttpGet]
        public JsonResult GetAllEvent(string memberId, string monthYear, bool morning, bool afternoon, bool evening, bool saturday, bool sunday)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listPlan = from a in _context.PlanRecruitmentHeaders.Where(x => !x.IsDeleted)
                               join b in _context.PlanRecruitmentDetails.Where(x => !x.IsDeleted) on a.PlanNumber equals b.PlanNumber
                               where a.PlanDate.Value.ToString("MM/yyyy").Equals(monthYear) &&
                               ((saturday == false && sunday == false)
                             || (saturday == true && sunday == true && (a.PlanDate.Value.DayOfWeek == DayOfWeek.Saturday || a.PlanDate.Value.DayOfWeek == DayOfWeek.Sunday))
                             || (saturday == true && sunday == false && a.PlanDate.Value.DayOfWeek == DayOfWeek.Saturday)
                             || (saturday == false && sunday == true && a.PlanDate.Value.DayOfWeek == DayOfWeek.Sunday))
                               select new
                               {
                                   a.PlanNumber,
                                   a.PlanDate,
                                   a.Title,
                                   b.Quantity
                               };

                var listExcute = from a in _context.PlanExcuteRecruitmentHeaders.Where(x => !x.IsDeleted)
                                 join b in _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted) on a.RecruitmentCode equals b.RecruitmentCode
                                 where a.StartTime.Value.ToString("MM/yyyy").Equals(monthYear) &&
                               ((saturday == false && sunday == false)
                             || (saturday == true && sunday == true && (a.StartTime.Value.DayOfWeek == DayOfWeek.Saturday || a.StartTime.Value.DayOfWeek == DayOfWeek.Sunday))
                             || (saturday == true && sunday == false && a.StartTime.Value.DayOfWeek == DayOfWeek.Saturday)
                             || (saturday == false && sunday == true && a.StartTime.Value.DayOfWeek == DayOfWeek.Sunday))
                                 select new
                                 {
                                     a.RecruitmentCode,
                                     a.Title,
                                     a.StartTime,
                                     a.EndTime,
                                     b.CandidateCode
                                 };

                var dataPlan = listPlan.GroupBy(x => new { x.PlanNumber, x.PlanDate, x.Title }).Select(p => new
                {
                    p.Key.PlanNumber,
                    p.Key.PlanDate,
                    p.Key.Title,
                    TotalCandidate = p.Sum(i => i.Quantity)
                });

                var dataExcute = listExcute.GroupBy(x => new { x.RecruitmentCode, x.Title }).Select(p => new
                {
                    p.Key.RecruitmentCode,
                    p.Key.Title,
                    TotalCandidate = p.Count(),
                    StartDate = p.First().StartTime.HasValue ? p.First().StartTime.Value.ToString("yyyy-MM-dd") : "",
                    EndDate = p.First().EndTime.HasValue ? p.First().EndTime.Value.ToString("yyyy-MM-dd") : "",
                });

                msg.Object = new
                {
                    All = true,
                    ListTotalPlan = dataPlan,
                    ListTotalExcute = dataExcute,
                };
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);

        }
        #endregion

        #region Chart
        [HttpGet]
        public object ChartReportRecuruitment()
        {
            var listCandidateRegis = _context.CandiateBasic.Select(x => new ReportCruitmentModel
            {
                Month = x.CanJoinDate.HasValue ? x.CanJoinDate.Value.Month : x.CreatedTime.Month,
                Year = x.CanJoinDate.HasValue ? x.CanJoinDate.Value.Year : x.CreatedTime.Year,
                CandidateCode = x.CandidateCode,
                Type = "REGISTER"
            });

            var listCandidateExcute = from a in _context.PlanExcuteRecruitmentHeaders.Where(x => !x.IsDeleted)
                                      join b in _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted) on a.RecruitmentCode equals b.RecruitmentCode
                                      select new ReportCruitmentModel
                                      {
                                          Month = a.StartTime.HasValue ? a.StartTime.Value.Month : a.CreatedTime.Value.Month,
                                          Year = a.StartTime.HasValue ? a.StartTime.Value.Year : a.CreatedTime.Value.Year,
                                          CandidateCode = b.CandidateCode,
                                          Type = "EXCUTE"
                                      };

            var listAll = listCandidateRegis.Union(listCandidateExcute).ToList();
            var data = listAll.Where(x => x.Year.Equals(DateTime.Now.Year)).GroupBy(x => new { x.Month, x.Year }).Select(p => new ReportCruitmentModel
            {
                Month = p.Key.Month,
                Year = p.Key.Year,
                SumRegis = p.Count(x => x.Type.Equals("REGISTER")),
                SumPass = p.Count(x => x.Type.Equals("EXCUTE"))
            }).ToList();

            return data;
        }
        #endregion

        #region Search
        public class JtableSearchModel : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string PlanNumber { get; set; }
        }
        [HttpPost]
        public object JtableSearch([FromBody] JtableSearchModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = string.IsNullOrEmpty(jTablePara.FromDate) ? (DateTime?)null : DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(jTablePara.ToDate) ? (DateTime?)null : DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            var query = from a in _context.PlanExcuteRecruitmentHeaders.Where(x => !x.IsDeleted)
                        join b in _context.PlanRecruitmentHeaders.Where(x => !x.IsDeleted) on a.PlanNumber equals b.PlanNumber
                        where ((fromDate == null) || (a.StartTime >= fromDate)) &&
                        ((toDate == null) || (a.EndTime.Value.Date <= toDate)) &&
                        (string.IsNullOrEmpty(jTablePara.PlanNumber) || a.PlanNumber.Equals(jTablePara.PlanNumber))
                        select new
                        {
                            a.RecruitmentCode,
                            a.Id,
                            a.Title,
                            a.StartTime,
                            a.EndTime,
                            QuantityJoin = _context.PlanExcuteRecruitmentDetails.Count(x => !x.IsDeleted && x.RecruitmentCode.Equals(a.RecruitmentCode)),
                            QuantityDK = _context.PlanRecruitmentDetails.FirstOrDefault(x => !x.IsDeleted && x.PlanNumber.Equals(b.PlanNumber)) != null ? _context.PlanRecruitmentDetails.FirstOrDefault(x => !x.IsDeleted && x.PlanNumber.Equals(b.PlanNumber)).Quantity : 0,
                            Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(a.Status)).ValueSet,
                            QuantityPass = _context.PlanExcuteRecruitmentDetails.Count(x => !x.IsDeleted && x.RecruitmentCode.Equals(a.RecruitmentCode) && x.Status == "STATUS_EXAM_CANDIDATE_002"),
                        };

            var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "StartTime", "RecruitmentCode", "EndTime", "QuantityJoin", "QuantityDK", "Status", "QuantityPass");
            return Json(jdata);
        }
        public class JtableSearchDetailModel : JTableModel
        {
            public string RecruitmentCode { get; set; }
        }
        [HttpPost]
        public object JtableSearchDetail([FromBody] JtableSearchDetailModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

            var query = from a in _context.PlanExcuteRecruitmentHeaders.Where(x => !x.IsDeleted)
                        join b in _context.PlanExcuteRecruitmentDetails.Where(x => !x.IsDeleted) on a.RecruitmentCode equals b.RecruitmentCode
                        join c in _context.CandiateBasic on b.CandidateCode equals c.CandidateCode
                        where (string.IsNullOrEmpty(jTablePara.RecruitmentCode) || a.RecruitmentCode == jTablePara.RecruitmentCode)
                        select new
                        {
                            b.Id,
                            b.CandidateCode,
                            c.Sex,
                            c.Address,
                            c.Phone,
                            c.Birthday,
                            c.Fullname,
                            a.Title,
                            a.StartTime,
                            a.EndTime,
                            Status = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.Status)).ValueSet,
                        };

            var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CandidateCode", "Sex", "Address", "Phone", "Status", "Birthday", "EndTime", "StartTime", "Title", "Fullname");
            return Json(jdata);
        }
        [HttpGet]
        public object GetListPlan()
        {
            var data = _context.PlanRecruitmentHeaders.Where(x => !x.IsDeleted).Select(x => new { Code = x.PlanNumber, Name = x.Title });
            return data;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_staffLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_planLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepoLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_excuteLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class JtableModelRegistration : JTableModel
        {
            public string MemberId { get; set; }
        }
        public class EventModel : JTableModel
        {
            public string MemberId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public bool Morning { get; set; }
            public bool Afternoon { get; set; }
            public bool Evening { get; set; }
            public bool Sunday { get; set; }
            public bool Saturday { get; set; }
        }

        public class ReportCruitmentModel
        {
            public int Month { get; set; }
            public int Year { get; set; }
            public string Type { get; set; }
            public string CandidateCode { get; set; }
            public int SumRegis { get; set; }
            public int SumPass { get; set; }
        }
        #endregion
    }
}