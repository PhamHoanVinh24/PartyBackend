using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.IO;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Newtonsoft.Json;
using System.Net;
using Dropbox.Api.TeamCommon;
using Microsoft.AspNetCore.Hosting;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using Xfinium.Pdf.Forms;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffLateController : BaseController
    {
        public class StaffTimeKeepingJtableModel : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserId { get; set; }
            public string Status { get; set; }
            public string ViewMode { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IGoogleApiService _googleAPI;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffLateController> _stringLocalizer;
        private readonly IStringLocalizer<WorkflowActivityController> _stringLocalizerWF;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IFCMPushNotification _notification;
        private readonly IWorkflowService _workflowService;

        public StaffLateController(EIMDBContext context, IGoogleApiService googleAPI, IUploadService upload, IFCMPushNotification notification,
            IStringLocalizer<StaffLateController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IWorkflowService workflowService,
            IHostingEnvironment hostingEnvironment, IStringLocalizer<WorkflowActivityController> stringLocalizerWF)
        {
            _context = context;
            _googleAPI = googleAPI;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizerWF = stringLocalizerWF;
            _notification = notification;
            _workflowService = workflowService;
        }
        [Breadcrumb("ViewData.CrumbStaffLate", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbStaffLate"] = _sharedResources["COM_CRUMB_STAFF_LATE"];
            return View();
        }

        #region Index

        [HttpPost]
        public object JTable([FromBody] StaffTimeKeepingJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var session = HttpContext.GetSessionUser();
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            if (jTablePara.Status != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork))
            {
                return JTableAllType(jTablePara, intBeginFor, session, today, fromDate, toDate);
            }
            else
            {
                return JTableNotWork(jTablePara, intBeginFor, session, today, fromDate, toDate);
            }
        }

        public object JTableAllType(StaffTimeKeepingJtableModel jTablePara, int intBeginFor, SessionUserLogin session,
            DateTime today, DateTime? fromDate, DateTime? toDate)
        {
            if (jTablePara.ViewMode == "ACTION_TIME")
            {
                if (fromDate == null && toDate == null)
                { // default without enter from and to date
                    // first query with workflow instance, activity instance, excuter control role joined, result is multiple same report with status
                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 join d in _context.WorkflowInstances.Where(x => x.IsDeleted == false)
                                     on new { ObjectInst = a.Id.ToString(), ObjectType = a.Action } equals new { d.ObjectInst, d.ObjectType } into d1
                                 from d in d1.DefaultIfEmpty()
                                 join e in _context.ActivityInstances.Where(x => x.IsDeleted == false) on d.WfInstCode equals e.WorkflowCode into e1
                                 from e in e1.DefaultIfEmpty()
                                 join f in _context.ExcuterControlRoleInsts.Where(x => x.IsDeleted == false) on e.ActivityInstCode equals f.ActivityCodeInst into f1
                                 from f in f1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(jTablePara.Status) || a.Action.Equals(jTablePara.Status))
                                 /*&& ((fromDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            ))
                                   && ((toDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date <= toDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date <= toDate.Value.Date))))*/
                                 && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId)) && (session.IsAllData || a.CreatedBy == session.UserName || f.UserId == session.UserId)
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     Picture = string.IsNullOrEmpty(a.Picture) ? b.Picture : a.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                     WfInstStatus = d != null ? d.Status : "",
                                     SLastLog = JsonConvert.SerializeObject(a.ListStatus.LastOrDefault())
                                 }).Distinct();
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.WfInstStatus == "STATUS_WF_SUCCESS").ThenByDescending(x => x.ActionTime).ThenBy(x => x.UserId != session.UserId).ToList(); // priority time then session user first

                    var data = dataOrder.Select(x => new
                    {
                        x.Id,
                        x.UserId,
                        x.FullName,
                        x.Picture,
                        Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                        ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                        x.LocationText,
                        x.Note,
                        x.Approve,
                        x.Approver,
                        x.ApproveTime,
                        x.NotWorkType,
                        x.NotWorkTypeName,
                        x.WorkHoliday,
                        x.CreatedBy,
                        x.WfInstStatus,
                        x.SLastLog,
                    }).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                        "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "SLastLog", "WorkHoliday", "CreatedBy", "WfInstStatus");
                    jdata.Add("totalUserRecord", countUser);
                    return Json(jdata);
                }
                else
                {

                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(jTablePara.Status) || a.Action.Equals(jTablePara.Status))
                                 && ((fromDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            ))
                                   && ((toDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date <= toDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date <= toDate.Value.Date))))
                                 && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     Picture = string.IsNullOrEmpty(a.Picture) ? b.Picture : a.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                     SLastLog = JsonConvert.SerializeObject(a.ListStatus.LastOrDefault())
                                 });
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                    var data = dataOrder.Select(x => new
                    {
                        x.Id,
                        x.UserId,
                        x.FullName,
                        x.Picture,
                        Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                        ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                        x.LocationText,
                        x.Note,
                        x.Approve,
                        x.Approver,
                        x.ApproveTime,
                        x.NotWorkType,
                        x.NotWorkTypeName,
                        x.WorkHoliday,
                        x.CreatedBy,
                        x.SLastLog,
                    }).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                        "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "SLastLog", "WorkHoliday", "CreatedBy");
                    jdata.Add("totalUserRecord", countUser);
                    return Json(jdata);
                }
            }
            else
            {
                if (fromDate == null && toDate == null)
                {
                    fromDate = today;
                    toDate = today;
                }
                var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                             join b in _context.Users on a.UserId equals b.Id
                             join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                             from c2 in c1.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(jTablePara.Status) || a.Action.Equals(jTablePara.Status))
                             && ((fromDate == null) || (a.CreatedTime.Date >= fromDate.Value.Date))
                               && ((toDate == null) || (a.CreatedTime.Date <= toDate.Value.Date))
                             && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                             select new
                             {
                                 a.Id,
                                 a.UserId,
                                 FullName = b.GivenName,
                                 Picture = string.IsNullOrEmpty(a.Picture) ? b.Picture : a.Picture,
                                 a.Action,
                                 a.ActionTime,
                                 a.ActionTo,
                                 a.Note,
                                 a.LocationText,
                                 a.Approve,
                                 Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                 ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 a.NotWorkType,
                                 NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                 a.WorkHoliday,
                                 a.CreatedBy,
                                 SLastLog = JsonConvert.SerializeObject(a.ListStatus.LastOrDefault())
                             });
                var count = query.Count();
                var countUser = query.Count(x => x.UserId == session.UserId);
                var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                var data = dataOrder.Select(x => new
                {
                    x.Id,
                    x.UserId,
                    x.FullName,
                    x.Picture,
                    Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                    ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                    x.LocationText,
                    x.Note,
                    x.Approve,
                    x.Approver,
                    x.ApproveTime,
                    x.NotWorkType,
                    x.NotWorkTypeName,
                    x.WorkHoliday,
                    x.CreatedBy,
                    x.SLastLog,
                }).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                    "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "SLastLog", "WorkHoliday", "CreatedBy");
                jdata.Add("totalUserRecord", countUser);
                return Json(jdata);
            }
        }


        public object JTableGoLate(StaffTimeKeepingJtableModel jTablePara, int intBeginFor, SessionUserLogin session,
            DateTime today, DateTime? fromDate, DateTime? toDate)
        {
            if (jTablePara.ViewMode == "ACTION_TIME")
            {
                if (fromDate == null && toDate == null)
                { // default without enter from and to date
                    // first query with workflow instance, activity instance, excuter control role joined, result is multiple same report with status
                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals(jTablePara.Status))
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 join d in _context.WorkflowInstances.Where(x => x.IsDeleted == false)
                                     on new { ObjectInst = a.Id.ToString(), ObjectType = a.Action } equals new { d.ObjectInst, d.ObjectType } into d1
                                 from d in d1.DefaultIfEmpty()
                                 join e in _context.ActivityInstances.Where(x => x.IsDeleted == false) on d.WfInstCode equals e.WorkflowCode into e1
                                 from e in e1.DefaultIfEmpty()
                                 join f in _context.ExcuterControlRoleInsts.Where(x => x.IsDeleted == false) on e.ActivityInstCode equals f.ActivityCodeInst into f1
                                 from f in f1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(jTablePara.UserId) || a.UserId == jTablePara.UserId) && (session.IsAllData || a.CreatedBy == session.UserName || f.UserId == session.UserId)
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     Picture = string.IsNullOrEmpty(a.Picture) ? b.Picture : a.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                     WfInstStatus = d != null ? d.Status : "",
                                     SLastLog = JsonConvert.SerializeObject(a.ListStatus.LastOrDefault())
                                 }).Distinct();
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.WfInstStatus == "STATUS_WF_SUCCESS").ThenByDescending(x => x.ActionTime).ThenBy(x => x.UserId != session.UserId).ToList(); // priority time then session user first

                    var data = dataOrder.Select(x => new
                    {
                        x.Id,
                        x.UserId,
                        x.FullName,
                        x.Picture,
                        Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                        ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                        x.LocationText,
                        x.Note,
                        x.Approve,
                        x.Approver,
                        x.ApproveTime,
                        x.NotWorkType,
                        x.NotWorkTypeName,
                        x.WorkHoliday,
                        x.CreatedBy,
                        x.WfInstStatus,
                        x.SLastLog,
                    }).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                        "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "SLastLog", "WorkHoliday", "CreatedBy", "WfInstStatus");
                    jdata.Add("totalUserRecord", countUser);
                    return Json(jdata);
                }
                else
                {

                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals(jTablePara.Status))
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 where ((fromDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            ))
                                   && ((toDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date <= toDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date <= toDate.Value.Date))))
                                 && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     Picture = string.IsNullOrEmpty(a.Picture) ? b.Picture : a.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                     SLastLog = JsonConvert.SerializeObject(a.ListStatus.LastOrDefault())
                                 });
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                    var data = dataOrder.Select(x => new
                    {
                        x.Id,
                        x.UserId,
                        x.FullName,
                        x.Picture,
                        Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                        ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                        x.LocationText,
                        x.Note,
                        x.Approve,
                        x.Approver,
                        x.ApproveTime,
                        x.NotWorkType,
                        x.NotWorkTypeName,
                        x.WorkHoliday,
                        x.CreatedBy,
                        x.SLastLog,
                    }).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                        "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "SLastLog", "WorkHoliday", "CreatedBy");
                    jdata.Add("totalUserRecord", countUser);
                    return Json(jdata);
                }
            }
            else
            {
                if (fromDate == null && toDate == null)
                {
                    fromDate = today;
                    toDate = today;
                }
                var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals(jTablePara.Status))
                             join b in _context.Users on a.UserId equals b.Id
                             join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                             from c2 in c1.DefaultIfEmpty()
                             where ((fromDate == null) || (a.CreatedTime.Date >= fromDate.Value.Date))
                               && ((toDate == null) || (a.CreatedTime.Date <= toDate.Value.Date))
                             && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                             select new
                             {
                                 a.Id,
                                 a.UserId,
                                 FullName = b.GivenName,
                                 Picture = string.IsNullOrEmpty(a.Picture) ? b.Picture : a.Picture,
                                 a.Action,
                                 a.ActionTime,
                                 a.ActionTo,
                                 a.Note,
                                 a.LocationText,
                                 a.Approve,
                                 Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                 ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 a.NotWorkType,
                                 NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                 a.WorkHoliday,
                                 a.CreatedBy,
                                 SLastLog = JsonConvert.SerializeObject(a.ListStatus.LastOrDefault())
                             });
                var count = query.Count();
                var countUser = query.Count(x => x.UserId == session.UserId);
                var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                var data = dataOrder.Select(x => new
                {
                    x.Id,
                    x.UserId,
                    x.FullName,
                    x.Picture,
                    Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                    ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                    x.LocationText,
                    x.Note,
                    x.Approve,
                    x.Approver,
                    x.ApproveTime,
                    x.NotWorkType,
                    x.NotWorkTypeName,
                    x.WorkHoliday,
                    x.CreatedBy,
                    x.SLastLog,
                }).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                    "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "SLastLog", "WorkHoliday", "CreatedBy");
                jdata.Add("totalUserRecord", countUser);
                return Json(jdata);
            }
        }

        [NonAction]
        public ActGrid GetLastActivity(string objInst, string objType, string userId)
        {
            var wfInstance = _context.WorkflowInstances.FirstOrDefault(x =>
                !x.IsDeleted.Value && x.ObjectInst == objInst && x.ObjectType == objType);
            var user = _context.Users.FirstOrDefault(x => x.Id == userId);
            var wfInstCode = "";
            if (wfInstance != null)
            {
                wfInstCode = wfInstance.WfInstCode;
            }

            var activities =
                (from a in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfInstCode))
                 join c in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals c
                     .WfInstCode
                 join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                 from b in b1.DefaultIfEmpty()
                 select new ActGrid
                 {
                     ActivityInstCode = a.ActivityInstCode,
                     ActName = a.Title,
                     ActStatus = b != null ? b.ValueSet : "",
                     StatusCode = a.Status,
                     ActType = a.Type,
                     Id = a.ID,
                     //IsLock = a.IsLock,
                     Level = 0,
                     IsInstance = true,
                     ObjectCode = c.ObjectInst,
                     JsonStatusLog = a.JsonStatusLog,
                     Log = new LogStatus()
                 }).ToList();
            var actInit = activities.FirstOrDefault(x =>
                x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));

            foreach (var act in activities)
            {
                var lstStatus = new List<LogStatus>();
                if (!string.IsNullOrEmpty(act.JsonStatusLog))
                {
                    lstStatus = JsonConvert.DeserializeObject<List<LogStatus>>(act.JsonStatusLog);
                }

                act.Log = (from a in lstStatus
                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                           join c in _context.Users on a.CreatedBy equals c.UserName
                           where a.Status == "STATUS_ACTIVITY_END"
                           select new LogStatus()
                           {
                               Status = b.ValueSet,
                               CreatedBy = c.UserName,
                               CreatedTime = a.CreatedTime,
                               sCreatedTime = a.CreatedTime.ToString("HH:mm dd/MM/yyyy")
                           }).OrderByDescending(x => x.CreatedTime).FirstOrDefault();
            }

            activities.Remove(actInit);
            var lastApprovedAct = activities.Where(x => x.Log != null).Count() > 0
                ? activities.Where(x => x.Log != null).OrderByDescending(x => x.Log.CreatedTime).FirstOrDefault()
                : (activities.Any(x => x.StatusCode == "STATUS_ACTIVITY_DOING")
                    ? activities.FirstOrDefault(x => x.StatusCode == "STATUS_ACTIVITY_DOING")
                    : actInit);

            //if (user != null && lastApprovedAct != null)
            //{
            //    lastApprovedAct.IsApprovable =
            //        GetPermission(lastApprovedAct.ActivityInstCode, user.UserName).PermisstionApprove;
            //}

            return lastApprovedAct;
            //var actArranged = ArrangeActInst(activities, 1, actInit);

            //return actArranged;
        }


        private int GetUserTotalNotWorkDays(string userId, DateTime today)
        {
            var reportNotWorkInYear = _context.WorkShiftCheckInOuts.Where(x =>
                !x.IsDeleted && x.UserId == userId
                && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) &&
                x.ActionTime.Year == today.Year).Select(x => Convert.ToInt32((x.ActionTo.Value - x.ActionTime)
                .TotalDays) + 1);
            return reportNotWorkInYear.Sum();
        }

        public object JTableNotWork(StaffTimeKeepingJtableModel jTablePara, int intBeginFor, SessionUserLogin session,
            DateTime today, DateTime? fromDate, DateTime? toDate)
        {
            if (jTablePara.ViewMode == "ACTION_TIME")
            {
                if (fromDate == null && toDate == null)
                { // default without enter from and to date
                    // first query with workflow instance, activity instance, excuter control role joined, result is multiple same report with status
                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals(jTablePara.Status))
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 join d in _context.WorkflowInstances.Where(x => x.IsDeleted == false)
                                     on new { ObjectInst = a.Id.ToString(), ObjectType = a.Action } equals new { d.ObjectInst, d.ObjectType } into d1
                                 from d in d1.DefaultIfEmpty()
                                 join e in _context.ActivityInstances.Where(x => x.IsDeleted == false) on d.WfInstCode equals e.WorkflowCode into e1
                                 from e in e1.DefaultIfEmpty()
                                 join f in _context.ExcuterControlRoleInsts.Where(x => x.IsDeleted == false) on e.ActivityInstCode equals f.ActivityCodeInst into f1
                                 from f in f1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(jTablePara.UserId) || a.UserId == jTablePara.UserId) && (session.IsAllData || a.CreatedBy == session.UserName || f.UserId == session.UserId)
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     b.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                     WfInstStatus = d != null ? d.Status : ""
                                 }).Distinct();
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.WfInstStatus == "STATUS_WF_SUCCESS").ThenByDescending(x => x.ActionTime).ThenBy(x => x.UserId != session.UserId).ToList(); // priority time then session user first

                    var dataGroup = dataOrder.GroupBy(x => x.UserId).Select(g => new
                    {
                        UserId = g.Key,
                        CountAll = GetUserTotalNotWorkDays(g.Key, today),
                        ListChild = g.ToList()
                    });
                    var countCompany = dataGroup.Sum(x => x.CountAll);
                    var data = dataGroup.SelectMany(g => g.ListChild.Select(x => new
                    {
                        x.Id,
                        x.UserId,
                        x.FullName,
                        x.Picture,
                        Status = StaffStatus.NoWork.DescriptionAttr(),
                        x.Action,
                        ActionTime = string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")),
                        x.LocationText,
                        x.Note,
                        x.Approve,
                        x.Approver,
                        x.ApproveTime,
                        x.NotWorkType,
                        x.NotWorkTypeName,
                        x.WorkHoliday,
                        x.CreatedBy,
                        LastAct = JsonConvert.SerializeObject(GetLastActivity(x.Id.ToString(), x.Action, session.UserId)),
                        //ListAct = JsonConvert.SerializeObject(GetActInstArranged(x.Id, x.Action)),
                        CountAll = g.CountAll
                    })).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                        "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "LastAct", "WorkHoliday", "CreatedBy", "WfInstStatus", "CountAll", "Action");
                    jdata.Add("totalUserRecord", countUser);
                    jdata.Add("totalCompanyRecord", countCompany);
                    return Json(jdata);
                }
                else
                {

                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals(jTablePara.Status))
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 where ((fromDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            ))
                                   && ((toDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date <= toDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date <= toDate.Value.Date))))
                                 && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     b.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                 });
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                    var dataGroup = dataOrder.GroupBy(x => x.UserId).Select(g => new
                    {
                        UserId = g.Key,
                        CountAll = GetUserTotalNotWorkDays(g.Key, today),
                        ListChild = g.ToList()
                    });
                    var countCompany = dataGroup.Sum(x => x.CountAll);
                    var data = dataGroup.SelectMany(g => g.ListChild.Select(x => new
                    {
                        x.Id,
                        x.UserId,
                        x.FullName,
                        x.Picture,
                        Status = StaffStatus.NoWork.DescriptionAttr(),
                        x.Action,
                        ActionTime = string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")),
                        x.LocationText,
                        x.Note,
                        x.Approve,
                        x.Approver,
                        x.ApproveTime,
                        x.NotWorkType,
                        x.NotWorkTypeName,
                        x.WorkHoliday,
                        x.CreatedBy,
                        LastAct = JsonConvert.SerializeObject(GetLastActivity(x.Id.ToString(), x.Action, session.UserId)),
                        //ListAct = JsonConvert.SerializeObject(GetActInstArranged(x.Id, x.Action)),
                        CountAll = g.CountAll
                    })).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                        "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "LastAct", "WorkHoliday", "CreatedBy", "CountAll", "Action");
                    jdata.Add("totalUserRecord", countUser);
                    jdata.Add("totalCompanyRecord", countCompany);
                    return Json(jdata);
                }
            }
            else
            {
                if (fromDate == null && toDate == null)
                {
                    fromDate = today;
                    toDate = today;
                }
                var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && x.Action.Equals(jTablePara.Status))
                             join b in _context.Users on a.UserId equals b.Id
                             join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                             from c2 in c1.DefaultIfEmpty()
                             where ((fromDate == null) || (a.CreatedTime.Date >= fromDate.Value.Date))
                               && ((toDate == null) || (a.CreatedTime.Date <= toDate.Value.Date))
                             && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                             select new
                             {
                                 a.Id,
                                 a.UserId,
                                 FullName = b.GivenName,
                                 b.Picture,
                                 a.Action,
                                 a.ActionTime,
                                 a.ActionTo,
                                 a.Note,
                                 a.LocationText,
                                 a.Approve,
                                 Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                 ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 a.NotWorkType,
                                 NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                 a.WorkHoliday,
                                 a.CreatedBy,
                             });
                var count = query.Count();
                var countUser = query.Count(x => x.UserId == session.UserId);
                var dataOrder = jTablePara.QueryOrderBy != "Id DESC" ? query.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList() : query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                var dataGroup = dataOrder.GroupBy(x => x.UserId).Select(g => new
                {
                    UserId = g.Key,
                    CountAll = GetUserTotalNotWorkDays(g.Key, today),
                    ListChild = g.ToList()
                });
                var countCompany = dataGroup.Sum(x => x.CountAll);
                var data = dataGroup.SelectMany(g => g.ListChild.Select(x => new
                {
                    x.Id,
                    x.UserId,
                    x.FullName,
                    x.Picture,
                    Status = StaffStatus.NoWork.DescriptionAttr(),
                    x.Action,
                    ActionTime = string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")),
                    x.LocationText,
                    x.Note,
                    x.Approve,
                    x.Approver,
                    x.ApproveTime,
                    x.NotWorkType,
                    x.NotWorkTypeName,
                    x.WorkHoliday,
                    x.CreatedBy,
                    LastAct = JsonConvert.SerializeObject(GetLastActivity(x.Id.ToString(), x.Action, session.UserId)),
                    //ListAct = JsonConvert.SerializeObject(GetActInstArranged(x.Id, x.Action)),
                    CountAll = g.CountAll
                })).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText",
                    "Note", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "LastAct", "WorkHoliday", "CreatedBy", "CountAll", "Action");
                jdata.Add("totalUserRecord", countUser);
                jdata.Add("totalCompanyRecord", countCompany);
                return Json(jdata);
            }
        }

        [HttpGet]
        public JsonResult GetAllTotal(string memberId, int month, int year, string from, string to, string viewMode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var user = _context.Users.FirstOrDefault(x => x.Active && x.Id == memberId);
            try
            {
                var listTotal = new List<StatisticalTotal>();
                var fromDate = !string.IsNullOrEmpty(from) ? DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(to) ? DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var listDateInMonth = DateTimeExtensions.GetDates(year, month)/*.Where(x => x.Date <= DateTime.Today)*/;
                //Select all
                if (string.IsNullOrEmpty(memberId))
                {
                    if (fromDate == null && toDate == null)
                    {
                        foreach (var item in listDateInMonth)
                        {
                            var totalLate = GetCountUserLate(item, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate), viewMode);
                            var totalNotWork = GetCountUserLate(item, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork), viewMode);
                            var totalQuitWork = GetCountUserLate(item, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork), viewMode);
                            var totalPlanSchedule = GetCountUserLate(item, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule), viewMode);
                            var totalOvertime = GetCountUserLate(item, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime), viewMode);
                            var statistical = new StatisticalTotal
                            {
                                Date = item,
                                CountLate = totalLate,
                                CountNotWork = totalNotWork,
                                CountOvertime = totalOvertime,
                                CountPlanSchedule = totalPlanSchedule,
                                CountQuitWork = totalQuitWork,
                            };
                            if (item.Date < DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-gray";
                            }
                            else if (item.Date == DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-orange";
                            }
                            else
                            {
                                statistical.Class = "fc-event-event-trans-green";
                            }
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = true,
                            ListTotal = listTotal,
                        };
                    }
                    else
                    {
                        for (DateTime date = fromDate.Value; date <= toDate; date = date.AddDays(1))
                        {
                            var totalLate = GetCountUserLate(date, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate), viewMode);
                            var totalNotWork = GetCountUserLate(date, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork), viewMode);
                            var totalQuitWork = GetCountUserLate(date, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork), viewMode);
                            var totalPlanSchedule = GetCountUserLate(date, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule), viewMode);
                            var totalOvertime = GetCountUserLate(date, "", EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime), viewMode);
                            var statistical = new StatisticalTotal
                            {
                                Date = date,
                                CountLate = totalLate,
                                CountNotWork = totalNotWork,
                                CountOvertime = totalOvertime,
                                CountPlanSchedule = totalPlanSchedule,
                                CountQuitWork = totalQuitWork,
                            };
                            if (date.Date < DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-gray";
                            }
                            else if (date.Date == DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-orange";
                            }
                            else
                            {
                                statistical.Class = "fc-event-event-trans-green";
                            }
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = true,
                            ListTotal = listTotal,
                        };
                    }
                }
                //select memeberId
                else
                {
                    if (fromDate == null && toDate == null)
                    {
                        foreach (var item in listDateInMonth)
                        {
                            var totalLate = GetCountUserLate(item, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate), viewMode);
                            var totalNotWork = GetCountUserLate(item, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork), viewMode);
                            var totalQuitWork = GetCountUserLate(item, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork), viewMode);
                            var totalPlanSchedule = GetCountUserLate(item, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule), viewMode);
                            var totalOvertime = GetCountUserLate(item, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime), viewMode);
                            var statistical = new StatisticalTotal
                            {
                                Date = item,
                                CountLate = totalLate,
                                CountNotWork = totalNotWork,
                                CountOvertime = totalOvertime,
                                CountPlanSchedule = totalPlanSchedule,
                                CountQuitWork = totalQuitWork,
                            };
                            if (item.Date < DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-gray";
                            }
                            else if (item.Date == DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-orange";
                            }
                            else
                            {
                                statistical.Class = "fc-event-event-trans-green";
                            }
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = false,
                            ListTotal = listTotal,
                        };
                    }
                    else
                    {
                        for (DateTime date = fromDate.Value; date <= toDate; date = date.AddDays(1))
                        {
                            var totalLate = GetCountUserLate(date, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate), viewMode);
                            var totalNotWork = GetCountUserLate(date, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork), viewMode);
                            var totalQuitWork = GetCountUserLate(date, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork), viewMode);
                            var totalPlanSchedule = GetCountUserLate(date, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule), viewMode);
                            var totalOvertime = GetCountUserLate(date, memberId, EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime), viewMode);
                            //var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date && x.CreatedBy == user.UserName).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = date,
                                CountLate = totalLate,
                                CountNotWork = totalNotWork,
                                CountOvertime = totalOvertime,
                                CountPlanSchedule = totalPlanSchedule,
                                CountQuitWork = totalQuitWork,
                            };
                            if (date.Date < DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-gray";
                            }
                            else if (date.Date == DateTime.Today)
                            {
                                statistical.Class = "fc-event-event-trans-orange";
                            }
                            else
                            {
                                statistical.Class = "fc-event-event-trans-green";
                            }
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = false,
                            ListTotal = listTotal,
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult EventCalendar(string dateSearch, string memberId, string viewMode)
        {
            var date = DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            if (viewMode == "ACTION_TIME")
            {
                var userLate = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                                join b in _context.Users on a.UserId equals b.Id
                                where (a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) && a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckOut)
                                && ((date == null) || ((a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTo >= date.Date))
                                || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)) && (a.ActionTime.Date >= date.Date))))
                                && ((date == null) || ((a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (date.Date >= a.ActionTime.Date))
                                || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)) && (a.ActionTime.Date <= date.Date)))) && (string.IsNullOrEmpty(memberId) || a.UserId == memberId))
                                select new
                                {
                                    a.Id,
                                    a.UserId,
                                    b.GivenName,
                                    b.Picture,
                                    a.Action,
                                    a.ActionTime,
                                    a.ActionTo,
                                    a.Note,
                                    a.LocationText
                                });
                var dataUserLate = userLate.Select(x => new
                {
                    FullName = x.GivenName,
                    Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                    ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                    Order = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? 2 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? 3 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? 4 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? 0 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? 1 : 5),
                    ActTime = x.ActionTime,
                    LocationText = x.LocationText,
                    UserId = x.UserId,
                    Phone = _context.Users.FirstOrDefault(k => k.Id == x.UserId).PhoneNumber
                }).OrderBy(x => x.Order).ThenByDescending(x => x.ActTime);
                return Json(dataUserLate);
            }
            else
            {
                var userLate = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                                join b in _context.Users on a.UserId equals b.Id
                                where (((date == null) || a.CreatedTime.Date == date.Date) && (string.IsNullOrEmpty(memberId) || a.UserId == memberId))
                                select new
                                {
                                    a.Id,
                                    a.UserId,
                                    b.GivenName,
                                    b.Picture,
                                    a.Action,
                                    a.ActionTime,
                                    a.ActionTo,
                                    a.Note,
                                    a.LocationText
                                });
                var dataUserLate = userLate.Select(x => new
                {
                    FullName = x.GivenName,
                    Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                    ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                    Order = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? 2 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? 3 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? 4 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? 0 :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? 1 : 5),
                    ActTime = x.ActionTime,
                    LocationText = x.LocationText,
                    UserId = x.UserId,
                    Phone = _context.Users.FirstOrDefault(k => k.Id == x.UserId).PhoneNumber
                }).OrderBy(x => x.Order).ThenByDescending(x => x.ActTime);
                return Json(dataUserLate);
            }
        }

        [NonAction]
        public int GetCountUserLate(DateTime date, string memberId, string action, string viewMode)
        {
            if (viewMode == "ACTION_TIME")
            {
                var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                             join b in _context.Users on a.UserId equals b.Id
                             where (a.Action == action && ((date == null) ||
                             ((a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTo >= date.Date))
                             || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)) && (a.ActionTime.Date >= date.Date))))
                             && ((date == null) || ((a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && a.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (date.Date >= a.ActionTime.Date))
                             || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)) && (a.ActionTime.Date <= date.Date)))) && (string.IsNullOrEmpty(memberId) || a.UserId == memberId))
                             select new
                             {
                                 a.Id,
                                 a.UserId,
                                 FullName = b.GivenName,
                                 b.Picture,
                                 a.Action,
                                 a.ActionTime,
                                 a.ActionTo,
                                 a.Note,
                                 a.LocationText
                             });
                return query.Count();
            }
            else
            {
                var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                             join b in _context.Users on a.UserId equals b.Id
                             where (a.Action == action && ((date == null) || a.CreatedTime.Date == date.Date) && (string.IsNullOrEmpty(memberId) || a.UserId == memberId))
                             select new
                             {
                                 a.Id,
                                 a.UserId,
                                 FullName = b.GivenName,
                                 b.Picture,
                                 a.Action,
                                 a.ActionTime,
                                 a.ActionTo,
                                 a.Note,
                                 a.LocationText
                             });
                return query.Count();
            }
        }

        [HttpPost]
        public object GetJtableUserLate([FromBody] StaffTimeKeepingJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            if (string.IsNullOrEmpty(jTablePara.UserId))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "Status", "ActionTime", "LocationText", "Note");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.UserId equals b.Id
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                         from c2 in c1.DefaultIfEmpty()
                         where (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)
                         || a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime))
                         && a.UserId == jTablePara.UserId
                         select new
                         {
                             a.Id,
                             a.Picture,
                             a.Action,
                             a.ActionTime,
                             a.ActionTo,
                             a.Note,
                             a.LocationText,
                             a.Ip,
                             FullName = b.GivenName,
                             a.Approve,
                             Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                             ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                             a.NotWorkType,
                             NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                             a.WorkHoliday,
                             a.WorkflowCode
                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.Action,
                x.Picture,
                Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                x.ActionTime,
                x.ActionTo,
                Time = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :
                              x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                              x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                              x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                              x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                x.LocationText,
                x.Ip,
                x.Note,
                x.FullName,
                x.Approve,
                x.Approver,
                x.ApproveTime,
                x.NotWorkType,
                x.NotWorkTypeName,
                x.WorkflowCode,
                x.WorkHoliday,
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Action", "Picture", "Status", "ActionTime", "ActionTo", "Time",
                "LocationText", "Ip", "Note", "FullName", "Approve", "Approver", "ApproveTime", "NotWorkType", "NotWorkTypeName", "WorkHoliday", "WorkflowCode");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                var listAct = GetActInstArranged(data.Id, data.Action);
                var isApproved = listAct.Any(x => x.ActStatus == "Đã xử lý");
                var model = new WorkShiftCheckInOut()
                {
                    Id = id,
                    UserId = data.UserId,
                    Action = data.Action,
                    ActionTime = data.ActionTime,
                    ActionTo = data.ActionTo,
                    Picture = data.Picture,
                    Note = data.Note,
                    NotWorkType = data.NotWorkType,
                    WorkHoliday = data.WorkHoliday,
                    WorkflowCode = data.WorkflowCode,
                    Approve = isApproved
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListStatus()
        {
            var list = new List<Properties>();
            var GoLate = new Properties
            {
                Code = EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate),
                Name = StaffStatus.GoLate.DescriptionAttr()
            };
            list.Add(GoLate);

            var NoWork = new Properties
            {
                Code = EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork),
                Name = StaffStatus.NoWork.DescriptionAttr()
            };
            list.Add(NoWork);

            var QuitWork = new Properties
            {
                Code = EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork),
                Name = StaffStatus.QuitWork.DescriptionAttr()
            };
            list.Add(QuitWork);

            var planSchedule = new Properties
            {
                Code = EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule),
                Name = StaffStatus.PlanSchedule.DescriptionAttr()
            };
            list.Add(planSchedule);

            var overtime = new Properties
            {
                Code = EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime),
                Name = StaffStatus.Overtime.DescriptionAttr()
            };
            list.Add(overtime);

            return Json(list);
        }

        [HttpGet]
        public object GetStaffLateOfUser(string userId)
        {
            return _context.WorkShiftCheckInOuts.Where(x => x.UserId == userId && !x.IsDeleted);
        }

        [HttpGet]
        public async Task<string> GetAddressForCoordinates(double latitude, double longitude)
        {
            return await _googleAPI.GetAddressForCoordinates(latitude, longitude);
        }

        [HttpPost]
        public async Task<JsonResult> Add(StaffTimeKeepingModel obj, IFormFile picture)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (ModelState.IsValid)
                {
                    var date = DateTime.Now;
                    var url = "";
                    if (picture != null)
                    {
                        var upload = _upload.UploadImage(picture);
                        if (!upload.Error)
                        {
                            url = Path.Combine("/uploads/images/", upload.Object.ToString());
                        }
                    }
                    if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        if (actionTime > actionTo)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["STL_MSG_FROM_DAY_TO_DAY"];
                            return Json(msg);
                        }
                        if (obj.IsException != true)
                        {
                            msg = CheckTimeNotWork(obj);
                        }
                        if (!msg.Error)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Title = obj.Title,
                                Action = obj.Action,
                                ActionTime = actionTime,
                                ActionTo = actionTo,
                                Note = obj.Note,
                                Device = "Laptop/Destop",
                                Picture = url,
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                                NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "",
                                WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null,
                                WorkflowCode = obj.WorkflowCode,
                                ListStatus = new List<JsonLog>(),
                                CreatedTime = DateTime.Now,
                                CreatedBy = HttpContext.GetSessionUser().UserName
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            await _context.SaveChangesAsync();

                            var nextActInstCode = await CreateWfInstance(obj.WorkflowCode, model.Id.ToString(), "NOT_WORK", obj.UserId, "Báo nghỉ");
                            var user = _context.Users.FirstOrDefault(x => x.Id == obj.UserId);
                            var roleObject = (from a in _context.UserRoles.Where(x => x.UserId == obj.UserId) // if user is on directive board or is a manager or sub-manager, he will approved himself instantly
                                              join b in _context.Roles on a.RoleId equals b.Id
                                              select b).FirstOrDefault();
                            var roleCode = "";
                            var isSuperior = false;
                            if (roleObject != null)
                            {
                                roleCode = roleObject.Code;
                                if (roleCode == "TRUONGPHONG" || user.DepartmentId == "BGD")
                                {
                                    isSuperior = true;
                                }
                            }
                            msg.Object = new { model.Id, IsSuperior = isSuperior, NextActInstCode = nextActInstCode };
                        }
                        else
                        {
                            return Json(msg);
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        if (actionTime > actionTo)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["STL_MSG_FROM_DAY_TO_DAY"];
                            return Json(msg);
                        }

                        if (obj.IsException != true)
                        {
                            msg = CheckTimePlanSchedule(obj);
                        }
                        if (!msg.Error)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Title = obj.Title,
                                Action = obj.Action,
                                ActionTime = actionTime,
                                ActionTo = actionTo,
                                Note = obj.Note,
                                Device = "Laptop/Destop",
                                Picture = url,
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                                Approve = false,
                                NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "",
                                WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null,
                                WorkflowCode = obj.WorkflowCode,
                                ListStatus = new List<JsonLog>(),
                                CreatedTime = DateTime.Now,
                                CreatedBy = HttpContext.GetSessionUser().UserName
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            await _context.SaveChangesAsync();

                            var nextActInstCode = await CreateWfInstance(obj.WorkflowCode, model.Id.ToString(), "PLAN_SCHEDULE", obj.UserId, "Lịch công tác");
                            var user = _context.Users.FirstOrDefault(x => x.Id == obj.UserId);
                            var roleObject = (from a in _context.UserRoles.Where(x => x.UserId == obj.UserId) // if user is on directive board or is a manager or sub-manager, he will approved himself instantly
                                              join b in _context.Roles on a.RoleId equals b.Id
                                              select b).FirstOrDefault();
                            var roleCode = "";
                            var isSuperior = false;
                            if (roleObject != null)
                            {
                                roleCode = roleObject.Code;
                                if (roleCode == "TRUONGPHONG" || user.DepartmentId == "BGD")
                                {
                                    isSuperior = true;
                                }
                            }
                            msg.Object = new { model.Id, IsSuperior = isSuperior, NextActInstCode = nextActInstCode };
                        }
                        else
                        {
                            return Json(msg);
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                        var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                        if (actionTime >= actionTo)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["STL_MSG_START_TIME_END_TIME"];
                            return Json(msg);
                        }

                        if (obj.IsException != true)
                        {
                            msg = CheckTimeOverTime(obj);
                        }
                        if (!msg.Error)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Title = obj.Title,
                                Action = obj.Action,
                                ActionTime = actionTime,
                                ActionTo = actionTo,
                                Note = obj.Note,
                                Device = "Laptop/Destop",
                                Picture = url,
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                                NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "",
                                WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null,
                                WorkflowCode = obj.WorkflowCode,
                                ListStatus = new List<JsonLog>(),
                                CreatedTime = DateTime.Now,
                                CreatedBy = HttpContext.GetSessionUser().UserName
                            };
                            _context.WorkShiftCheckInOuts.Add(model);

                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            await _context.SaveChangesAsync();

                            var nextActInstCode = await CreateWfInstance(obj.WorkflowCode, model.Id.ToString(), "OVERTIME", obj.UserId, "Báo làm thêm giờ");
                            var user = _context.Users.FirstOrDefault(x => x.Id == obj.UserId);
                            var roleObject = (from a in _context.UserRoles.Where(x => x.UserId == obj.UserId) // if user is on directive board or is a manager or sub-manager, he will approved himself instantly
                                              join b in _context.Roles on a.RoleId equals b.Id
                                              select b).FirstOrDefault();
                            var roleCode = "";
                            var isSuperior = false;
                            if (roleObject != null)
                            {
                                roleCode = roleObject.Code;
                                if (roleCode == "TRUONGPHONG" || user.DepartmentId == "BGD")
                                {
                                    isSuperior = true;
                                }
                            }
                            msg.Object = new { model.Id, IsSuperior = isSuperior, NextActInstCode = nextActInstCode };
                        }
                        else
                        {
                            return Json(msg);
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                        if (obj.IsException != true)
                        {
                            msg = CheckTimeGoLate(obj);
                        }
                        if (!msg.Error)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Title = obj.Title,
                                Action = obj.Action,
                                Device = "Laptop/Destop",
                                ActionTime = actionTime,
                                Note = obj.Note,
                                Picture = url,
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                                NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "",
                                WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null,
                                WorkflowCode = obj.WorkflowCode,
                                ListStatus = new List<JsonLog>(),
                                CreatedTime = DateTime.Now,
                                CreatedBy = HttpContext.GetSessionUser().UserName
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_ADD_SUCCES"));
                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            await _context.SaveChangesAsync();

                            var nextActInstCode = await CreateWfInstance(obj.WorkflowCode, model.Id.ToString(), "GOLATE", obj.UserId, "Đến muộn");
                            var user = _context.Users.FirstOrDefault(x => x.Id == obj.UserId);
                            var roleObject = (from a in _context.UserRoles.Where(x => x.UserId == obj.UserId) // if user is on directive board or is a manager or sub-manager, he will approved himself instantly
                                              join b in _context.Roles on a.RoleId equals b.Id
                                              select b).FirstOrDefault();
                            var roleCode = "";
                            var isSuperior = false;
                            if (roleObject != null)
                            {
                                roleCode = roleObject.Code;
                                if (roleCode == "TRUONGPHONG" || user.DepartmentId == "BGD")
                                {
                                    isSuperior = true;
                                }
                            }
                            msg.Object = new { model.Id, IsSuperior = isSuperior, NextActInstCode = nextActInstCode };
                        }
                        else
                        {
                            return Json(msg);
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                        if (obj.IsException != true)
                        {
                            msg = CheckTimeQuitWork(obj);
                        }
                        if (!msg.Error)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Title = obj.Title,
                                Action = obj.Action,
                                ActionTime = actionTime,
                                Note = obj.Note,
                                Picture = url,
                                Device = "Laptop/Destop",
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                                NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "",
                                WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null,
                                WorkflowCode = obj.WorkflowCode,
                                ListStatus = new List<JsonLog>(),
                                CreatedTime = DateTime.Now,
                                CreatedBy = HttpContext.GetSessionUser().UserName
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_ADD_SUCCES"));
                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            await _context.SaveChangesAsync();

                            var nextActInstCode = await CreateWfInstance(obj.WorkflowCode, model.Id.ToString(), "QUITWORK", obj.UserId, "Xin thôi việc");
                            var user = _context.Users.FirstOrDefault(x => x.Id == obj.UserId);
                            var roleObject = (from a in _context.UserRoles.Where(x => x.UserId == obj.UserId) // if user is on directive board or is a manager or sub-manager, he will approved himself instantly
                                              join b in _context.Roles on a.RoleId equals b.Id
                                              select b).FirstOrDefault();
                            var roleCode = "";
                            var isSuperior = false;
                            if (roleObject != null)
                            {
                                roleCode = roleObject.Code;
                                if (roleCode == "TRUONGPHONG" || user.DepartmentId == "BGD")
                                {
                                    isSuperior = true;
                                }
                            }
                            msg.Object = new { model.Id, IsSuperior = isSuperior, NextActInstCode = nextActInstCode };
                        }
                        else
                        {
                            return Json(msg);
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INFOMATION"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public string GetWarningMessageExist(WorkShiftCheckInOut obj, bool isDateOnly)
        {
            var actionExist = "";
            switch (obj.Action)
            {
                case "NOT_WORK":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_NOT_WORK_LOWER_CASE"];
                    break;
                case "GOLATE":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_GOLATE_LOWER_CASE"];
                    break;
                case "PLAN_SCHEDULE":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_PLAN_SCHEDULE_LOWER_CASE"];
                    break;
                case "OVERTIME":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_OVERTIME_LOWER_CASE"];
                    break;
                case "QUITWORK":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"];
                    break;
            }
            if (isDateOnly)
            {
                return string.Format(_stringLocalizer["STL_MSG_QUIT_IN_DATE"], actionExist);
            }
            else
            {
                return string.Format(_stringLocalizer["STL_MSG_QUIT_IN_TIME"], actionExist);
            }
        }

        [NonAction]
        public string GetActionExist(WorkShiftCheckInOut obj)
        {
            var actionExist = "";
            switch (obj.Action)
            {
                case "NOT_WORK":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_NOT_WORK_LOWER_CASE"];
                    break;
                case "GOLATE":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_GOLATE_LOWER_CASE"];
                    break;
                case "PLAN_SCHEDULE":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_PLAN_SCHEDULE_LOWER_CASE"];
                    break;
                case "OVERTIME":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_OVERTIME_LOWER_CASE"];
                    break;
                case "QUITWORK":
                    actionExist = _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"];
                    break;
            }
            return actionExist;
        }

        [NonAction]
        public byte[] DownloadFileFromServer(int idRepoCatFile)
        {
            byte[] fileStream = new byte[0];

            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == idRepoCatFile)
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
                            Token = (b != null ? b.Token : null),
                            ReposCode = (b != null ? b.ReposCode : null),
                            Url = (c != null ? c.Url : null),
                            FileId = (c != null ? c.CloudFileId : null),
                            FileTypePhysic = c.FileTypePhysic,
                            c.FileName,
                            c.MimeType,
                            b.Account,
                            b.PassWord,
                            c.FileCode,
                            c.IsEdit,
                            c.IsFileMaster,
                            c.FileParentId
                        }).FirstOrDefault();

            var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
            if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
            {
                using (var ms = new MemoryStream())
                {
                    string ftphost = data.Server;
                    string ftpfilepath = data.Url;
                    var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                    using (WebClient request = new WebClient())
                    {
                        request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                        fileStream = request.DownloadData(urlEnd);
                    }
                }
            }
            else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
            {
                var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == data.Token);
                var json = apiTokenService.CredentialsJson;
                var user = apiTokenService.Email;
                var token = apiTokenService.RefreshToken;
                fileStream = FileExtensions.DownloadFileGoogle(json, token, data.FileId, user);
            }

            return fileStream;
        }

        [NonAction]
        public JMessage UploadFileToServer(byte[] fileByteArr, string repoCode, string catCode, string fileName, string contentType)
        {
            var msg = new JMessage() { Error = false, Title = "Tải tệp thành công" };
            try
            {
                var data = (from a in _context.EDMSCatRepoSettings.Where(x => x.ReposCode.Equals(repoCode) && x.CatCode.Equals(catCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
                                a.Path,
                                a.FolderId,
                                b.Account,
                                b.PassWord,
                            }).FirstOrDefault();

                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == repoCode);
                if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                {
                    var fileBytes = fileByteArr;
                    var urlFile = string.Concat(data.Path, "/", fileName);
                    var urlFileServer = System.Web.HttpUtility.UrlPathEncode("ftp://" + data.Server + urlFile);
                    var result = FileExtensions.UploadFileToFtpServer(urlFileServer, urlFileServer, fileBytes, data.Account, data.PassWord);
                    if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_CONNECT_FAILURE"];

                        return msg;
                    }
                    else if (result.Status == WebExceptionStatus.Success)
                    {
                        msg.Object = urlFile;
                        if (result.IsSaveUrlPreventive)
                        {
                            //urlFile = urlFilePreventive;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_MSG_ERR"];
                        return msg;
                    }
                }
                else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                {
                    Stream stream = new MemoryStream(fileByteArr);
                    var apiTokenService = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == getRepository.Token);
                    var json = apiTokenService.CredentialsJson;
                    var user = apiTokenService.Email;
                    var token = apiTokenService.RefreshToken;
                    msg.Object = FileExtensions.UploadFileToDrive(json, token, fileName, stream, contentType, data.FolderId, user);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return msg;
        }

        [NonAction]
        private void AllowanceParam(DateTime fromDate, DateTime toDate, string empId, bool isAdd)
        {
            //FromDate and ToDate is same date
            if (fromDate.Date == toDate.Date)
            {
                var paramCode = GetParamCode(fromDate);
                var timeWork = toDate - fromDate;
                var hours = Math.Round(timeWork.TotalHours, 2);
                if (isAdd)
                {
                    InsertAllowanceParam(fromDate, empId, hours, paramCode);
                }
                else
                {
                    UpdateAllowanceParam(fromDate, empId, hours, paramCode);
                }
            }
            else
            {
                var date = fromDate.Date.AddDays(1);
                while (date < toDate.Date)
                {
                    var paramCode = GetParamCode(date);
                    var hours = 24;
                    if (isAdd)
                        InsertAllowanceParam(date, empId, hours, paramCode);
                    else
                        UpdateAllowanceParam(date, empId, hours, paramCode);
                    date = date.AddDays(1);
                }

                var paramFromDate = GetParamCode(fromDate);
                double hoursFromDate = fromDate.Hour;
                var minutesFromDate = Convert.ToDouble(fromDate.Minute);
                hoursFromDate += Math.Round(minutesFromDate / 60, 2);
                hoursFromDate = 24 - hoursFromDate;
                if (isAdd)
                    InsertAllowanceParam(fromDate, empId, hoursFromDate, paramFromDate);
                else
                    UpdateAllowanceParam(fromDate, empId, hoursFromDate, paramFromDate);

                var paramToDate = GetParamCode(toDate);
                double hoursToDate = toDate.Hour;
                var minutesToDate = Convert.ToDouble(toDate.Minute);
                hoursToDate += Math.Round(minutesToDate / 60, 2);
                if (isAdd)
                    InsertAllowanceParam(toDate, empId, hoursToDate, paramToDate);
                else
                    UpdateAllowanceParam(toDate, empId, hoursToDate, paramToDate);
            }
        }

        [NonAction]
        private string GetParamCode(DateTime date)
        {
            var listHoliday = _context.CommonSettings.Where(x => !x.IsDeleted
            && x.Group.Equals(EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeHoliday)));
            var paramCode = "";
            if ((date.DayOfWeek == DayOfWeek.Sunday || date.DayOfWeek == DayOfWeek.Saturday)
                && !listHoliday.Any(x => x.ValueSet.Equals(date.ToString("dd/MM"))))
            {
                paramCode = "P08";
            }
            else if (listHoliday.Any(x => x.ValueSet.Equals(date.ToString("dd/MM"))))
            {
                paramCode = "P09";
            }
            else
            {
                paramCode = "P07";
            }
            return paramCode;
        }

        [NonAction]
        private void InsertAllowanceParam(DateTime date, string empId, double hours, string paramCode)
        {
            _context.AllowanceEmployeeParams.Load();
            var check = _context.AllowanceEmployeeParams.Local.FirstOrDefault(x => !x.IsDeleted && x.ParamCode.Equals(paramCode)
                && x.EmployeeId.Equals(empId) && x.Month.Month.Equals(date.Month) && x.Month.Year.Equals(date.Year));
            if (check == null)
            {
                var empParam = new AllowanceEmployeeParam
                {
                    ParamCode = paramCode,
                    Month = date,
                    EmployeeId = empId,
                    Value = hours.ToString(),
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.AllowanceEmployeeParams.Add(empParam);
                _context.AllowanceEmployeeParams.Load();
            }
            else
            {
                var value = Convert.ToDouble(check.Value);
                value += hours;
                check.Value = value.ToString();

            }
        }

        [NonAction]
        private void UpdateAllowanceParam(DateTime date, string empId, double hours, string paramCode)
        {
            _context.AllowanceEmployeeParams.Load();
            var check = _context.AllowanceEmployeeParams.Local.FirstOrDefault(x => !x.IsDeleted && x.ParamCode.Equals(paramCode)
                && x.EmployeeId.Equals(empId) && x.Month.Month.Equals(date.Month) && x.Month.Year.Equals(date.Year));
            if (check != null)
            {
                var value = Convert.ToDouble(check.Value);
                value = value - hours;
                if (value == 0)
                {
                    check.IsDeleted = true;
                    check.DeletedBy = ESEIM.AppContext.UserName;
                    check.DeletedTime = DateTime.Now;
                }
                else
                {
                    check.Value = value.ToString();
                }
            }
        }

        [HttpPost]
        public JsonResult Update(StaffTimeKeepingModel obj, IFormFile picture)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (ModelState.IsValid)
                {
                    var url = "";
                    if (picture != null)
                    {
                        var upload = _upload.UploadImage(picture);
                        if (!upload.Error)
                        {
                            url = Path.Combine("/uploads/images/", upload.Object.ToString());
                        }
                    }
                    var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == obj.Id);
                    if (data.Approve)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["STL_MSG_APPROVED_NOT_EDIT"];
                        return Json(msg);
                    }
                    var date = DateTime.Now;
                    if (obj.Action != data.Action)
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["Không được phép thay đổi kiểu phiếu"]; //STL_MSG_ACTION_CHANGED
                        return Json(msg);
                    }
                    if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            if (actionTime > actionTo)
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["STL_MSG_FROM_DAY_TO_DAY"];
                                return Json(msg);
                            }

                            if (obj.IsException != true)
                            {
                                msg = CheckTimeNotWork(obj);
                            }
                            if (!msg.Error)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.ActionTo = !string.IsNullOrEmpty(obj.ActionTo) ? DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                                data.Note = obj.Note;
                                data.NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "";
                                data.WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null;
                                data.UpdatedBy = HttpContext.GetSessionUser().UserName;
                                data.UpdatedTime = DateTime.Now;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_UPDATE_SUCCES"));
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                return Json(msg);
                            }
                        }
                    }
                    if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            if (actionTime > actionTo)
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["STL_MSG_FROM_DAY_TO_DAY"];
                                return Json(msg);
                            }

                            if (obj.IsException != true)
                            {
                                msg = CheckTimePlanSchedule(obj);
                            }
                            if (!msg.Error)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.ActionTo = !string.IsNullOrEmpty(obj.ActionTo) ? DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                                data.Note = obj.Note;
                                data.NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "";
                                data.WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null;
                                data.UpdatedBy = HttpContext.GetSessionUser().UserName;
                                data.UpdatedTime = DateTime.Now;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                return Json(msg);
                            }
                        }
                    }
                    if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                            if (actionTime >= actionTo)
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["STL_MSG_START_TIME_END_TIME"];
                                return Json(msg);
                            }

                            if (obj.IsException != true)
                            {
                                msg = CheckTimeOverTime(obj);
                            }
                            if (!msg.Error)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.ActionTo = !string.IsNullOrEmpty(obj.ActionTo) ? DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : (DateTime?)null;
                                data.Note = obj.Note;
                                data.NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "";
                                data.WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null;
                                data.UpdatedBy = HttpContext.GetSessionUser().UserName;
                                data.UpdatedTime = DateTime.Now;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);

                                _context.SaveChanges();
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                return Json(msg);
                            }
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                            if (obj.IsException != true)
                            {
                                msg = CheckTimeGoLate(obj);
                            }
                            if (!msg.Error)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.Note = obj.Note;
                                data.NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "";
                                data.WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null;
                                data.UpdatedBy = HttpContext.GetSessionUser().UserName;
                                data.UpdatedTime = DateTime.Now;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_UPDATE_SUCCES"));
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                return Json(msg);
                            }
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                            if (obj.IsException != true)
                            {
                                msg = CheckTimeQuitWork(obj);
                            }
                            if (!msg.Error)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.Note = obj.Note;
                                data.NotWorkType = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)) ? obj.NotWorkType : "";
                                data.WorkHoliday = obj.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) ? obj.WorkHoliday : null;
                                data.UpdatedBy = HttpContext.GetSessionUser().UserName;
                                data.UpdatedTime = DateTime.Now;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_UPDATE_SUCCES"));
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                return Json(msg);
                            }
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INFOMATION"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public JMessage CheckTimeQuitWork(StaffTimeKeepingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var recentRecords = _context.WorkShiftCheckInOuts.Where(x => x.IsDeleted == false && (DateTime.Now.Date - x.CreatedTime.Date).TotalDays < 30).ToList();

            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            // 5.2 if there is any report in time later than current report, return error
            var checkExistInFuture = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
                            && x.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) && x.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckOut)
                            && x.ActionTime >= actionTime);
            if (checkExistInFuture != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_EXIST_IN_FUTURE"], GetActionExist(checkExistInFuture));
                return msg;
            }
            // 5.3 if there is a quit work report already made, return error
            var checkExistQuitWork = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork));
            if (checkExistQuitWork != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_QUIT_IN_TIME"], _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"]);
                return msg;
            }
            return msg;
        }

        public class ShiftSpan
        {
            public DateTime BeginTime { get; set; }
            public DateTime EndTime { get; set; }
        }
        public JMessage CheckTimeGoLate(StaffTimeKeepingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var recentRecords = _context.WorkShiftCheckInOuts.Where(x => x.IsDeleted == false && (DateTime.Now.Date - x.CreatedTime.Date).TotalDays < 30);

            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

            // 1.2 if there is any report in time later than current report, return error
            var checkExistInFuture = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
                            && (((x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) || x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime)
                            ) && x.ActionTime >= actionTime)
                            || ((x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) || x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)
                            || x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) && x.ActionTime >= actionTime.Date)));
            if (checkExistInFuture != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_EXIST_IN_FUTURE"], GetActionExist(checkExistInFuture));
                return msg;
            }
            // 1.3 if there is a quit work report already made, return error
            var checkAlreadyQuit = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork));
            if (checkAlreadyQuit != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_QUIT_IN_TIME"], _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"]);
                return msg;
            }
            // 1.4 if there is more than two go late reports in same day, return error
            var countGoLate = recentRecords.Where(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && x.ActionTime.Date == actionTime.Date).Count();

            if (countGoLate >= 2)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STL_MSG_GO_LATE_OVER_TWICE"];
                return msg;
            }
            // 1.5 if there is a go late report in a same day and that hour difference between two report is small than four hour, return error
            var checkExistGoLate = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && x.ActionTime.Date == actionTime.Date);

            if (checkExistGoLate != null && (actionTime - checkExistGoLate.ActionTime).TotalHours <= 4)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STL_MSG_GO_LATE_IN_SAME_SHIFT"];
                return msg;
            }

            // get shift time info and shift time late permit
            var shiftSettings = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "SHIFT").Select(x => x.ValueSet);
            var workingLatePermitTime = new double();
            double.TryParse(_context.CommonSettings
                    .FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "WORKING_LATE_PERMIT")?.ValueSet,
                out workingLatePermitTime);
            var shifts = new List<string[]>();
            foreach (var item in shiftSettings)
            {
                var shift = item.Split('-');
                shifts.Add(shift);
            }

            var shiftSpans = new List<ShiftSpan>();
            try
            {
                shiftSpans = shifts.Where(x => x.Length >= 2).Select(x => new ShiftSpan()
                {
                    BeginTime = DateTime.ParseExact(x[0].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                    EndTime = DateTime.ParseExact(x[1].Trim(), "HH:mm", CultureInfo.InvariantCulture)
                }).ToList();
            }
            catch (Exception ex)
            {
                shiftSpans = new List<ShiftSpan>();
            }
            // 1.6 if there is no shift spans that contain action time, return error
            if (!shiftSpans.Any(item =>
                    actionTime.TimeOfDay >= item.BeginTime.TimeOfDay && actionTime.TimeOfDay <= item.EndTime.TimeOfDay))
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STL_MSG_GO_LATE_NOT_IN_SHIFT"];
                return msg;
            }
            // 1.7 if there is no shift spans that permit that report, return error
            if (!shiftSpans.Any(item =>
                    actionTime.TimeOfDay >= item.BeginTime.TimeOfDay && actionTime.TimeOfDay <= item.BeginTime.AddHours(workingLatePermitTime).TimeOfDay))
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_GO_LATE_NOT_PERMIT_IN_SHIFT"], workingLatePermitTime);
                return msg;
            }

            // 1.8 if there is a no-work report that have end time overlap with current report , return error
            var checkExistNoWork = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && x.ActionTo >= actionTime.Date);

            if (checkExistNoWork != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_NOT_WORK_LOWER_CASE"]);
                return msg;
            }
            // 1.9 if there is a plan schedule report that have end time overlap with current report , return error
            var checkExistPlanSchedule = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && x.ActionTo >= actionTime.Date);

            if (checkExistPlanSchedule != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_PLAN_SCHEDULE_LOWER_CASE"]);
                return msg;
            }
            return msg;
        }

        public JMessage CheckTimeNotWork(StaffTimeKeepingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var recentRecords = _context.WorkShiftCheckInOuts.Where(x => x.IsDeleted == false && (DateTime.Now.Date - x.CreatedTime.Date).TotalDays < 30);

            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            // 2.2 if there is any report in time later than current report, return error
            var checkExistInFuture = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
                            && x.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) && x.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckOut)
                            && x.ActionTime >= actionTime);
            if (checkExistInFuture != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_EXIST_IN_FUTURE"], GetActionExist(checkExistInFuture));
                return msg;
            }
            // 2.3 if there is a quit work report already made, return error
            var checkAlreadyQuit = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork));
            if (checkAlreadyQuit != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_QUIT_IN_TIME"], _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"]);
                return msg;
            }
            // 2.4 if there is a no-work report that have end time overlap with current report , return error
            var checkExistNoWork = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && x.ActionTo >= actionTime);

            if (checkExistNoWork != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_NOT_WORK_LOWER_CASE"]);
                return msg;
            }
            // 2.5 if user is an employee, if total not working day exceed approved not working day in year, report error
            var user = _context.Users.FirstOrDefault(x => x.Id == obj.UserId);
            var employee =
                _context.HREmployees.FirstOrDefault(x =>
                    x.Id.ToString().Equals(user.EmployeeCode) && x.flag.Value == 1);
            if (employee != null)
            {
                var checkTotalNotWorkDay = GetTotalNotWorkDays(obj.UserId, actionTime, actionTo, obj.Id) > GetApprovedNotWorkDays(employee.notWorkDay, actionTime);
                if (checkTotalNotWorkDay)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["STL_MSG_ACTION_TOTAL_NOT_WORK_IN_YEAR"];
                    return msg;
                }
            }
            // 2.6 if there is a no-work report that have end time overlap with current report , return error
            var checkExistPlanSchedule = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && x.ActionTo >= actionTime);

            if (checkExistPlanSchedule != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_PLAN_SCHEDULE_LOWER_CASE"]);
                return msg;
            }
            // 2.7 if there is a overtime report that have end time overlap with current report , return error
            var checkExistOvertime = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && x.ActionTo >= actionTime);

            if (checkExistOvertime != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_OVERTIME_LOWER_CASE"]);
                return msg;
            }
            return msg;
        }

        private int GetTotalNotWorkDays(string userId, DateTime actionTime, DateTime actionTo, int? reportId)
        {
            var reportNotWorkInYear = _context.WorkShiftCheckInOuts.Where(x =>
                !x.IsDeleted && x.UserId == userId && x.Id != reportId
                && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) &&
                x.ActionTime.Year == actionTime.Year).Select(x => Convert.ToInt32((x.ActionTo.Value - x.ActionTime)
                .TotalDays) + 1);
            return reportNotWorkInYear.Sum() + Convert.ToInt32((actionTo - actionTime).TotalDays) + 1;
        }

        public class NotWorkDay
        {
            public string Code { get; set; }
            public int NumNotWorkAllow { get; set; }
            public int Year { get; set; }
        }
        private int GetApprovedNotWorkDays(string notWorkDays, DateTime actionTime)
        {
            try
            {
                var listNotWorkDay = JsonConvert.DeserializeObject<List<NotWorkDay>>(notWorkDays);
                var numNotWorkAllow = listNotWorkDay.FirstOrDefault(x => x.Year == actionTime.Year)?.NumNotWorkAllow;
                return numNotWorkAllow.HasValue ? numNotWorkAllow.Value : 0;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        public JMessage CheckTimePlanSchedule(StaffTimeKeepingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var recentRecords = _context.WorkShiftCheckInOuts.Where(x => x.IsDeleted == false && (DateTime.Now.Date - x.CreatedTime.Date).TotalDays < 30);

            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);

            // 3.2 if there is any report in time later than current report, return error
            var checkExistInFuture = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
                            && x.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn) && x.Action != EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckOut)
                            && x.ActionTime >= actionTime);
            if (checkExistInFuture != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_EXIST_IN_FUTURE"], GetActionExist(checkExistInFuture));
                return msg;
            }
            // 3.3 if there is a quit work report already made, return error
            var checkAlreadyQuit = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork));
            if (checkAlreadyQuit != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_QUIT_IN_TIME"], _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"]);
                return msg;
            }
            // 3.4 if there is a no-work report that have end time overlap with current report , return error
            var checkExistNoWork = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && x.ActionTo >= actionTime);

            if (checkExistNoWork != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_NOT_WORK_LOWER_CASE"]);
                return msg;
            }
            // 3.5 if there is a no-work report that have end time overlap with current report , return error
            var checkExistPlanSchedule = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && x.ActionTo >= actionTime);

            if (checkExistPlanSchedule != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_PLAN_SCHEDULE_LOWER_CASE"]);
                return msg;
            }
            // 3.6 if there is a overtime report that have end time overlap with current report , return error
            var checkExistOvertime = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && x.ActionTo >= actionTime);

            if (checkExistOvertime != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_OVERTIME_LOWER_CASE"]);
                return msg;
            }
            return msg;
        }

        public JMessage CheckTimeOverTime(StaffTimeKeepingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var recentRecords = _context.WorkShiftCheckInOuts.Where(x => x.IsDeleted == false && (DateTime.Now.Date - x.CreatedTime.Date).TotalDays < 30);

            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

            // 4.2 if there is any report in time later than current report, return error
            var checkExistInFuture = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
                            && (((x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) || x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime)
                            ) && x.ActionTime >= actionTime)
                            || ((x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) || x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork)
                            || x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule)) && x.ActionTime >= actionTime.Date)));
            if (checkExistInFuture != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_EXIST_IN_FUTURE"], GetActionExist(checkExistInFuture));
                return msg;
            }
            // 4.3 if there is a quit work report already made, return error
            var checkAlreadyQuit = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork));
            if (checkAlreadyQuit != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_QUIT_IN_TIME"], _stringLocalizer["STL_MSG_ACTION_QUITWORK_LOWER_CASE"]);
                return msg;
            }
            // 4.4 if there is a no-work report that have end time overlap with current report , return error
            var checkExistNoWork = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && x.ActionTo >= actionTime.Date);

            if (checkExistNoWork != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_NOT_WORK_LOWER_CASE"]);
                return msg;
            }
            // 4.5 if there is a no-work report that have end time overlap with current report , return error
            var checkExistPlanSchedule = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && x.ActionTo >= actionTime.Date);

            if (checkExistPlanSchedule != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_PLAN_SCHEDULE_LOWER_CASE"]);
                return msg;
            }
            // 4.6 if there is a overtime report that have end time overlap with current report , return error
            var checkExistOvertime = recentRecords.FirstOrDefault(x => !x.IsDeleted && x.UserId == obj.UserId && x.Id != obj.Id
        && x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && x.ActionTo >= actionTime);

            if (checkExistOvertime != null)
            {
                msg.Error = true;
                msg.Title = string.Format(_stringLocalizer["STL_MSG_OVERLAP_OTHER"], _stringLocalizer["STL_MSG_ACTION_OVERTIME_LOWER_CASE"]);
                return msg;
            }
            return msg;
        }

        [HttpPost]
        public JsonResult Delete([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var session = HttpContext.GetSessionUser();
                    var instance = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectType.Equals(data.Action)
                        && x.ObjectInst.Equals(data.Id.ToString()));
                    var listAct = instance != null ?
                        _context.ActivityInstances.Where(x =>
                            !x.IsDeleted && x.WorkflowCode == instance.WfInstCode).ToList() : new List<ActivityInstance>();
                    var isApproved = listAct.Any(x => x.Status == "STATUS_ACTIVITY_END");
                    if (!(!isApproved && session.UserName == instance?.CreatedBy) && !session.IsAllData)
                    {
                        msg.Error = true;
                        msg.Title = isApproved ? _stringLocalizer["STL_MSG_NO_PERMISSION_DELETE_APPROVED_REPORT"] : _sharedResources["COM_MSG_NO_PERMISSION"];
                        return Json(msg);
                    }
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    if (instance != null)
                    {
                        DeleteWfInstance(instance.WfInstCode);
                    }
                    //if (data.Action == "OVERTIME" && data.Approve)
                    //{
                    //    var user = _context.Users.FirstOrDefault(x => x.Id.Equals(data.UserId));
                    //    if (user != null)
                    //    {
                    //        if (!string.IsNullOrEmpty(user.EmployeeCode))
                    //            AllowanceParam(data.ActionTime, data.ActionTo.Value, user.EmployeeCode, false);
                    //    }

                    //}

                    _context.WorkShiftCheckInOuts.Update(data);
                }
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_DELETE_FAIL"];
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult ApproveStaffLate(int id) // Not used anymore
        {
            var msg = new JMessage { Title = "", Error = false };
            var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            var user = _context.Users.FirstOrDefault(x => x.Id.Equals(data.UserId));
            if (data != null)
            {
                data.Approve = true;
                data.Approver = ESEIM.AppContext.UserName;
                data.ApproveTime = DateTime.Now;
                _context.WorkShiftCheckInOuts.Update(data);
                if (data.Action == "OVERTIME")
                {
                    if (user != null)
                    {
                        if (!string.IsNullOrEmpty(user.EmployeeCode))
                            AllowanceParam(data.ActionTime, data.ActionTo.Value, user.EmployeeCode, true);
                    }
                    //var employee = _context.HREmployees.FirstOrDefault(x => x.Id.ToString().Equals(user.EmployeeCode) && x.flag.Value == 1);
                    //if (employee != null)
                    //{
                    //    var lstStatus = new List<JsonStatusEmployee>();
                    //    //Log status
                    //    if (!string.IsNullOrEmpty(employee.status))
                    //    {
                    //        lstStatus = JsonConvert.DeserializeObject<List<JsonStatusEmployee>>(employee.status);
                    //    }
                    //    var log = new JsonStatusEmployee
                    //    {
                    //        StatusCode = data.NotWorkType,
                    //        StatusValue = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.NotWorkType)).ValueSet ?? "",
                    //        UpdatedBy = ESEIM.AppContext.UserName,
                    //        UpdatedTime = DateTime.Now
                    //    };
                    //    lstStatus.Add(log);
                    //    employee.status = JsonConvert.SerializeObject(lstStatus);
                    //    employee.updated_by = ESEIM.AppContext.UserName;
                    //    employee.updatetime = DateTime.Now;
                    //    _context.HREmployees.Update(employee);
                    //}
                }
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_NOT_FOUND_DATA"];
            }
            return Json(msg);
        }


        //Admin/StaffLate/ExportExcel
        //Salary
        public ActionResult ExportExcel(string UserId, string FromDate, string ToDate, string Status, string ViewMode)
        {
            var session = HttpContext.GetSessionUser();
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var data = new List<StaffTimeKeepingDataModel>();
            if (ViewMode == "ACTION_TIME")
            {
                if (fromDate == null && toDate == null)
                { // default without enter from and to date
                    // first query with workflow instance, activity instance, excuter control role joined, result is multiple same report with status
                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 join d in _context.WorkflowInstances.Where(x => x.IsDeleted == false) on new { ObjectInst = a.Id.ToString(), ObjectType = a.Action } equals new { d.ObjectInst, d.ObjectType }
                                 join e in _context.ActivityInstances.Where(x => x.IsDeleted == false) on d.WfInstCode equals e.WorkflowCode into e1
                                 from e in e1.DefaultIfEmpty()
                                 join f in _context.ExcuterControlRoleInsts.Where(x => x.IsDeleted == false) on e.ActivityInstCode equals f.ActivityCodeInst into f1
                                 from f in f1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(Status) || a.Action.Equals(Status))
                                 && (string.IsNullOrEmpty(Status) || a.Action == Status)
                                 /*&& ((fromDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            ))
                                   && ((toDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date <= toDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date <= toDate.Value.Date))))*/
                                 && ((string.IsNullOrEmpty(UserId)) || (a.UserId == UserId)) && (session.IsAllData || a.CreatedBy == session.UserName || f.UserId == session.UserId)
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     b.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                     WfInstStatus = d != null ? d.Status : ""
                                 }).Distinct();
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = query.OrderBy(x => x.WfInstStatus == "STATUS_WF_SUCCESS").ThenByDescending(x => x.ActionTime).ThenBy(x => x.UserId != session.UserId).ToList(); // priority time then session user first

                    data = dataOrder.Select(x => new StaffTimeKeepingDataModel
                    {
                        Id = x.Id,
                        FullName = x.FullName,
                        Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                        ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                        Approve = x.Approve,
                    }).ToList();
                }
                else
                {

                    var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                                 join b in _context.Users on a.UserId equals b.Id
                                 join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                                 from c2 in c1.DefaultIfEmpty()
                                 where (string.IsNullOrEmpty(Status) || a.Action.Equals(Status))
                                 && (string.IsNullOrEmpty(Status) || a.Action == Status)
                                 && ((fromDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                            ))
                                   && ((toDate == null) || ((a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) && (a.ActionTime.Date <= toDate.Value.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                            || (a.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) && (a.ActionTime.Date <= toDate.Value.Date))))
                                 && ((string.IsNullOrEmpty(UserId)) || (a.UserId == UserId))
                                 select new
                                 {
                                     a.Id,
                                     a.UserId,
                                     FullName = b.GivenName,
                                     b.Picture,
                                     a.Action,
                                     a.ActionTime,
                                     a.ActionTo,
                                     a.Note,
                                     a.LocationText,
                                     a.Approve,
                                     Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                     ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                     a.NotWorkType,
                                     NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                     a.WorkHoliday,
                                     a.CreatedBy,
                                 });
                    var count = query.Count();
                    var countUser = query.Count(x => x.UserId == session.UserId);
                    var dataOrder = query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                    data = dataOrder.Select(x => new StaffTimeKeepingDataModel
                    {
                        Id = x.Id,
                        FullName = x.FullName,
                        Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                                 x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                        ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                      x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                        Approve = x.Approve,
                    }).ToList();
                }
            }
            else
            {
                if (fromDate == null && toDate == null)
                {
                    fromDate = today;
                    toDate = today;
                }
                var query = (from a in _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted)
                             join b in _context.Users on a.UserId equals b.Id
                             join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.NotWorkType equals c.CodeSet into c1
                             from c2 in c1.DefaultIfEmpty()
                             where (string.IsNullOrEmpty(Status) || a.Action.Equals(Status))
                             && (string.IsNullOrEmpty(Status) || a.Action == Status)
                             && ((fromDate == null) || (a.CreatedTime.Date >= fromDate.Value.Date))
                               && ((toDate == null) || (a.CreatedTime.Date <= toDate.Value.Date))
                             && ((string.IsNullOrEmpty(UserId)) || (a.UserId == UserId))
                             select new
                             {
                                 a.Id,
                                 a.UserId,
                                 FullName = b.GivenName,
                                 b.Picture,
                                 a.Action,
                                 a.ActionTime,
                                 a.ActionTo,
                                 a.Note,
                                 a.LocationText,
                                 a.Approve,
                                 Approver = string.IsNullOrEmpty(a.Approver) ? "" : a.Approver,
                                 ApproveTime = a.ApproveTime.HasValue ? a.ApproveTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                                 a.NotWorkType,
                                 NotWorkTypeName = c2 != null ? c2.ValueSet : "",
                                 a.WorkHoliday,
                                 a.CreatedBy,
                             });
                var count = query.Count();
                var countUser = query.Count(x => x.UserId == session.UserId);
                var dataOrder = query.OrderBy(x => x.UserId != session.UserId).ToList(); // priority session user first

                data = dataOrder.Select(x => new StaffTimeKeepingDataModel
                {
                    Id = x.Id,
                    FullName = x.FullName,
                    Status = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? StaffStatus.GoLate.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? StaffStatus.NoWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? StaffStatus.QuitWork.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? StaffStatus.PlanSchedule.DescriptionAttr() :
                             x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? StaffStatus.Overtime.DescriptionAttr() : ""),
                    ActionTime = (x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.Overtime) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy HH:mm"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy HH:mm")) :
                                  x.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                    Approve = x.Approve,
                }).ToList();
            }
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2016;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel2010;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Danh sách báo phép");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;

            sheetRequest.Range["A1:E1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Danh sách báo phép";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;

            sheetRequest.Range["A1:E1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["A2:E2"].Merge(true);
            if (fromDate == toDate)
            {
                if (fromDate != null)
                {
                    sheetRequest.Range["A2"].Text = "Trong ngày " + FromDate; //Trong ngày 15/1/2022 
                }
                else
                {
                    sheetRequest.Range["A2"].Text = "Đến ngày " + DateTime.Now.ToString("dd/MM/yyyy"); //Trong ngày 15/1/2022 
                }
            }
            else
            {
                sheetRequest.Range["A2"].Text = "Từ ngày " + FromDate + " đến ngày " + ToDate; //Từ ngày 15/1/2022 đến ngày 16/1/2022
            }
            sheetRequest.Range["A2"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A2"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A2"].CellStyle.Font.Size = 14;
            sheetRequest.Range["A2"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.Range["A3"].Merge(true);
            sheetRequest.Range["A3"].Text = "STT";

            sheetRequest.Range["B3"].Merge(true);
            sheetRequest.Range["B3"].Text = "Họ tên";
            sheetRequest.Range["B3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["B3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["C3"].Merge(true);
            sheetRequest.Range["C3"].Text = "Loại phép";
            sheetRequest.Range["C3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["C3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["D3"].Merge(true);
            sheetRequest.Range["D3"].Text = "Thời gian";
            sheetRequest.Range["D3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["D3"].CellStyle.Font.Bold = true;

            sheetRequest.Range["E3"].Merge(true);
            sheetRequest.Range["E3"].Text = "Trạng thái duyệt";
            sheetRequest.Range["E3"].HorizontalAlignment = ExcelHAlign.HAlignCenter;
            sheetRequest.Range["E3"].CellStyle.Font.Bold = true;
            var exportData = new List<StaffTimeKeepingExportModel>();
            var no = 1;
            foreach (var item in data)
            {
                var obj = new StaffTimeKeepingExportModel();
                obj.No = no;
                obj.FullName = item.FullName;
                obj.Status = item.Status;
                obj.ActionTime = item.ActionTime;
                obj.ApprovedStatus = item.Approve == true ? "Đã duyệt" : "Chưa duyệt";
                no = no + 1;
                exportData.Add(obj);
            }

            sheetRequest.ImportData(exportData, 4, 1, false);

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            //tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 165, 215, 213);
            //sheetRequest.Range["A3: Y5"].CellStyle.Color = Color.FromArgb(0, 166, 247, 204);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
            sheetRequest.UsedRange.AutofitColumns();
            sheetRequest["A3:E3"].CellStyle = tableHeader;

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "Danh sách báo phép" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpPost]
        public object GetGroupNotWork()
        {
            return _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeGroupNotWork)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking();
        }

        [HttpPost]
        public JsonResult GetListNotWorkType()
        {
            var listGroupStatus = _context.CommonSettings.Where(x => !x.IsDeleted &&
                x.Group == EnumHelper<EmployeeEnum>.GetDisplayValue(EmployeeEnum.EmployeeGroupNotWork))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();

            var data = _context.CommonSettings.Where(x => !x.IsDeleted && listGroupStatus.Any(p => p.Code.Equals(x.Group)))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetWorkflowNotWork()
        {
            var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                        .Select(x => new { Code = x.WfCode, Name = x.WfName });
            return Json(data);
        }

        public class DayOffMonth
        {
            public int Month { get; set; }
            public int DayOff { get; set; }
            public string DayText { get; set; }
        }

        public class CreatorManager
        {
            public string UserId { get; set; }
            public string BranchId { get; set; }
            public string DepartmentId { get; set; }
        }
        public class SettingWf
        {
            public string ActSrc { get; set; }
            public string ActDes { get; set; }
            public string Command { get; set; }
            public string TransCode { get; set; }
        }

        public class JsonCommand
        {
            public int Id { get; set; }
            public string CommandSymbol { get; set; }
            public string ConfirmedBy { get; set; }
            public string Confirmed { get; set; }
            public string ConfirmedTime { get; set; }
            public string Approved { get; set; }
            public string ApprovedBy { get; set; }
            public string ApprovedTime { get; set; }
            public string Message { get; set; }
            public string ActA { get; set; }
            public string ActB { get; set; }
            public bool IsLeader { get; set; }
        }

        public class JsonStatusEmployee
        {
            public string StatusCode { get; set; }
            public string StatusValue { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime UpdatedTime { get; set; }
        }

        public class StatisticalTotal
        {
            public DateTime? Date { get; set; }
            public int CountLate { get; set; }
            public int CountNotWork { get; set; }
            public int CountQuitWork { get; set; }
            public int CountPlanSchedule { get; set; }
            public int CountOvertime { get; set; }
            public string Class { get; set; }
        }

        public class StaffTimeKeepingInputModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserId { get; set; }
            public string Status { get; set; }
            public string ViewMode { get; set; }
        }
        public class StaffTimeKeepingDataModel
        {
            public int Id { get; set; }
            public string FullName { get; set; }
            public string Status { get; set; }
            public string ActionTime { get; set; }
            public bool Approve { get; set; }
        }
        public class StaffTimeKeepingExportModel
        {
            public int No { get; set; }
            public string FullName { get; set; }
            public string Status { get; set; }
            public string ActionTime { get; set; }
            public string ApprovedStatus { get; set; }
        }
        #endregion

        #region Workflow
        [HttpPost]
        public JsonResult GetActivityArranged(string wfCode)
        {
            var activities = (_context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfCode))
                .Select(x => new ActGrid
                {
                    ActivityInstCode = x.ActivityCode,
                    ActName = x.Title,
                    ActStatus = x.Status,
                    ActType = x.Type,
                    Id = x.ID,
                    IsLock = false,
                    Level = 0,
                    IsInstance = false
                })).ToList();

            var actInit = activities.FirstOrDefault(x => x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));

            var actArranged = ArrangeActCat(activities, 1, actInit).GroupBy(x => x.Level);

            return Json(actArranged);
        }

        [NonAction]
        public List<ActGrid> GetActInstArranged(int id, string objType)
        {
            var wfInstance = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst == id.ToString() && x.ObjectType == objType);
            var wfInstCode = "";
            if (wfInstance != null)
            {
                wfInstCode = wfInstance.WfInstCode;
            }
            var activities = (from a in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfInstCode))
                              join c in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals c.WfInstCode
                              join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                              from b in b1.DefaultIfEmpty()
                              select new ActGrid
                              {
                                  ActivityInstCode = a.ActivityInstCode,
                                  ActName = a.Title,
                                  ActStatus = b != null ? b.ValueSet : "",
                                  ActType = a.Type,
                                  Id = a.ID,
                                  //IsLock = a.IsLock,
                                  Level = 0,
                                  IsInstance = true,
                                  ObjectCode = c.ObjectInst,
                                  JsonStatusLog = a.JsonStatusLog,
                                  Log = new LogStatus()
                              }).ToList();

            foreach (var act in activities)
            {
                var lstStatus = new List<LogStatus>();
                if (!string.IsNullOrEmpty(act.JsonStatusLog))
                {
                    lstStatus = JsonConvert.DeserializeObject<List<LogStatus>>(act.JsonStatusLog);
                }
                act.Log = (from a in lstStatus
                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                           join c in _context.Users on a.CreatedBy equals c.UserName
                           select new LogStatus()
                           {
                               Status = b.ValueSet,
                               CreatedBy = c.UserName,
                               CreatedTime = a.CreatedTime,
                               sCreatedTime = a.CreatedTime.ToString("HH:mm dd/MM/yyyy")
                           }).OrderByDescending(x => x.CreatedTime).FirstOrDefault();


                act.IsApprovable = GetPermission(act.ActivityInstCode).PermisstionApprove;
            }

            var actInit = activities.FirstOrDefault(x => x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));
            activities.Remove(actInit);

            var actArranged = ArrangeActInst(activities, 1, actInit);

            return actArranged;
        }

        [NonAction]
        private List<ActGrid> ArrangeActCat(List<ActGrid> listInst, int level, ActGrid instInitial)
        {
            try
            {
                if (instInitial != null)
                {
                    instInitial.Level = level;
                    var runnings = _context.WorkflowSettings.Where(x => !x.IsDeleted && x.ActivityInitial.Equals(instInitial.ActivityInstCode));
                    foreach (var item in runnings)
                    {
                        var actRunning = listInst.FirstOrDefault(x => x.ActivityInstCode.Equals(item.ActivityDestination));
                        if (actRunning != null)
                        {
                            actRunning.Level = instInitial.Level + 1;
                            listInst = ArrangeActCat(listInst, actRunning.Level, actRunning);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return listInst.OrderBy(x => x.Level).ToList();
        }

        [NonAction]
        private List<ActGrid> ArrangeActInst(List<ActGrid> listInst, int level, ActGrid instInitial)
        {
            try
            {
                if (instInitial != null)
                {
                    instInitial.Level = level;
                    var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial.Equals(instInitial.ActivityInstCode));
                    foreach (var item in runnings)
                    {
                        var actRunning = listInst.FirstOrDefault(x => x.ActivityInstCode.Equals(item.ActivityDestination));
                        if (actRunning != null)
                        {
                            actRunning.Level = instInitial.Level + 1;
                            listInst = ArrangeActInst(listInst, actRunning.Level, actRunning);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return listInst.OrderBy(x => x.Level).ToList();
        }

        [NonAction]
        public async Task<string> CreateWfInstance(string wfCode, string objInst, string objType, string userId, string wfInstName)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var wfInstCode = string.Empty;
            try
            {
                var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst == objInst && x.ObjectType == objType);

                var processing = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ObjectType.Equals(objType)
                                    && x.ObjectInst.Equals(objInst));
                var user = _context.Users.FirstOrDefault(x => x.Id.Equals(userId));

                if (check == null && !processing.Any())
                {
                    var wf = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode));

                    var activities = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(wfCode));
                    var count = _context.WorkflowInstances.Count();
                    count++;
                    var dataAttrs = GetAttrSetup(activities);
                    var wfInstance = new WorkflowInstance
                    {
                        ObjectType = objType,
                        ObjectInst = objInst,
                        WorkflowCode = wfCode,
                        WfInstName = (user != null ? user.GivenName : "") + " - " + wfInstName,
                        WfInstCode = "" + (_context.WorkflowInstances.Count() > 0 ? _context.WorkflowInstances.Max(x => x.Id) + 1 : 1),
                        WfGroup = wf != null ? wf.WfGroup : "",
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                        StartTime = DateTime.Now,
                        Status = "STATUS_WF_PENDING",
                        DataAttr = JsonConvert.SerializeObject(dataAttrs),
                    };
                    _context.WorkflowInstances.Add(wfInstance);
                    await _context.SaveChangesAsync();

                    if (!wfInstance.WfInstCode.Equals(wfInstance.Id.ToString()))
                    {
                        wfInstance.WfInstCode = wfInstance.Id.ToString();
                        _context.WorkflowInstances.Update(wfInstance);
                        _context.SaveChanges();
                    }

                    wfInstCode = wfInstance.WfInstCode;

                    //Instance Activity
                    var countAct = _context.ActivityInstances.Count();

                    if (activities.Any())
                    {
                        var listUserNotify = new List<UserNotify>();
                        foreach (var item in activities)
                        {
                            countAct++;
                            var actInst = new ActivityInstance
                            {
                                WorkflowCode = wfInstance.WfInstCode,
                                ActivityCode = item.ActivityCode,
                                ActivityInstCode = item.ActivityCode + "_A_" + countAct,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                Desc = item.Desc,
                                Duration = item.Duration,
                                Group = item.Group,
                                Located = item.Located,
                                ShapeJson = item.ShapeJson,
                                Status = item.Type == "TYPE_ACTIVITY_INITIAL"
                                                    ? "STATUS_ACTIVITY_ACTIVE" : "STATUS_ACTIVITY_NOT_DOING",
                                Title = item.Title,
                                Type = item.Type,
                                Unit = item.Unit,
                                IsDeleted = false,
                                //IsLock = item.Type == "TYPE_ACTIVITY_INITIAL" ? false : true,
                                StartTime = DateTime.Now
                            };
                            _context.ActivityInstances.Add(actInst);

                            if (item.Type == "TYPE_ACTIVITY_INITIAL")
                            {
                                //Object processing
                                var process = new WfActivityObjectProccessing
                                {
                                    ObjectType = objInst,
                                    ObjectInst = objType,
                                    ObjEntry = true,
                                    WfInstCode = wfInstance.WfInstCode,
                                    ActInstCode = actInst.ActivityInstCode,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now
                                };
                                _context.WfActivityObjectProccessings.Add(process);
                                wfInstance.MarkActCurrent = actInst.ActivityInstCode;

                                var common = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(item.Status));
                                //var log = new JsonLog
                                //{
                                //    Code = item.Status,
                                //    CreatedBy = ESEIM.AppContext.UserName,
                                //    CreatedTime = DateTime.Now,
                                //    Name = common != null ? common.ValueSet : "",
                                //    ObjectRelative = item.Title
                                //};
                                //AddLogStatus(objInst, log);
                            }

                            var assigns = _context.ExcuterControlRoles.Where(x => !x.IsDeleted && x.ActivityCode == item.ActivityCode);
                            var listManager = new List<CreatorManager>(); //AddCreatorManager(userId);
                            var listManagerUserName = !String.IsNullOrEmpty(user.LeadersOfUser) ? user.LeadersOfUser.Split(",", StringSplitOptions.None).ToList() : new List<string>();
                            foreach (var managerUserName in listManagerUserName)
                            {
                                var manager = _context.Users.FirstOrDefault(x => x.UserName == managerUserName);
                                if (manager != null)
                                {
                                    var creatorManager = new CreatorManager()
                                    {
                                        BranchId = manager.BranchId,
                                        DepartmentId = manager.DepartmentId,
                                        UserId = manager.Id
                                    };
                                    listManager.Add(creatorManager);
                                }
                            }

                            var listShareCreator = new List<ShareFileDefault>();
                            if (assigns.Any())
                            {
                                if (!assigns.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId))
                                    && !listManager.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId))
                                    && item.Type.Equals("TYPE_ACTIVITY_INITIAL"))
                                {
                                    var leader = _context.Users.FirstOrDefault(x => x.Id.Equals(ESEIM.AppContext.UserId));
                                    var assignInst = new ExcuterControlRoleInst
                                    {
                                        UserId = ESEIM.AppContext.UserId,
                                        ActivityCodeInst = actInst.ActivityInstCode,
                                        Approve = false,
                                        ApproveTime = (DateTime?)null,
                                        Branch = leader != null ? leader.BranchId : "",
                                        DepartmentCode = leader != null ? leader.DepartmentId : "",
                                        GroupCode = "",
                                        CreatedTime = DateTime.Now,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        Status = "ASSIGN_STATUS_WORK",
                                        Role = "ROLE_ACT_STAFF"
                                    };
                                    _context.ExcuterControlRoleInsts.Add(assignInst);
                                }
                                foreach (var assign in assigns)
                                {
                                    if ((assign.UserId.Equals(EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator))
                                        || assign.UserId.Equals(EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.CreatorManager))))
                                    {
                                        if (assign.UserId.Equals(EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.CreatorManager)))
                                        {
                                            foreach (var manager in listManager)
                                            {
                                                if (!assigns.Any(x => x.UserId.Equals(manager.UserId)))
                                                {
                                                    var assignInst = new ExcuterControlRoleInst
                                                    {
                                                        UserId = manager.UserId,
                                                        ActivityCodeInst = actInst.ActivityInstCode,
                                                        Approve = false,
                                                        ApproveTime = (DateTime?)null,
                                                        Branch = manager.BranchId,
                                                        DepartmentCode = "",
                                                        GroupCode = "",
                                                        CreatedTime = DateTime.Now,
                                                        CreatedBy = ESEIM.AppContext.UserName,
                                                        Status = "ASSIGN_STATUS_WORK",
                                                        Role = assign.Role
                                                    };
                                                    _context.ExcuterControlRoleInsts.Add(assignInst);
                                                    var userNotify = new UserNotify
                                                    {
                                                        UserId = assignInst.UserId
                                                    };

                                                    if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(ESEIM.AppContext.UserId))
                                                        listUserNotify.Add(userNotify);
                                                }
                                            }
                                        }
                                        else
                                        {
                                            if (!assigns.Any(x => x.UserId.Equals(userId)))
                                            {
                                                var assignInst = new ExcuterControlRoleInst
                                                {
                                                    UserId = userId,
                                                    ActivityCodeInst = actInst.ActivityInstCode,
                                                    Approve = false,
                                                    ApproveTime = (DateTime?)null,
                                                    Branch = "",
                                                    DepartmentCode = "",
                                                    GroupCode = "",
                                                    CreatedTime = DateTime.Now,
                                                    CreatedBy = ESEIM.AppContext.UserName,
                                                    Status = "ASSIGN_STATUS_WORK",
                                                    Role = assign.Role
                                                };
                                                _context.ExcuterControlRoleInsts.Add(assignInst);
                                                var userNotify = new UserNotify
                                                {
                                                    UserId = assignInst.UserId
                                                };

                                                if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(ESEIM.AppContext.UserId))
                                                    listUserNotify.Add(userNotify);

                                                var share = new ShareFileDefault
                                                {
                                                    Code = user != null ? user.UserName : "",
                                                    Name = user != null ? user.GivenName : "",
                                                    DepartmentName = "",
                                                    Permission = new PermissionFile()
                                                };
                                                listShareCreator.Add(share);
                                            }
                                        }
                                    }
                                    else
                                    {
                                        var assignInst = new ExcuterControlRoleInst
                                        {
                                            UserId = assign.UserId,
                                            ActivityCodeInst = actInst.ActivityInstCode,
                                            Approve = assign.Approve,
                                            ApproveTime = assign.ApproveTime,
                                            Branch = assign.Branch,
                                            DepartmentCode = assign.DepartmentCode,
                                            GroupCode = assign.GroupCode,
                                            CreatedTime = DateTime.Now,
                                            CreatedBy = ESEIM.AppContext.UserName,
                                            Status = assign.Status,
                                            Role = assign.Role
                                        };
                                        _context.ExcuterControlRoleInsts.Add(assignInst);
                                        var userNotify = new UserNotify
                                        {
                                            UserId = assign.UserId
                                        };

                                        if (!listUserNotify.Any(p => p.UserId.Equals(userNotify.UserId)) && !userNotify.UserId.Equals(ESEIM.AppContext.UserId))
                                            listUserNotify.Add(userNotify);
                                    }
                                }
                            }

                            //Add attachment
                            var fileRepos = _context.EDMSRepoCatFiles.Where(x => x.ObjectType.Equals(EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat))
                                            && x.ObjectCode.Equals(item.ActivityCode));
                            foreach (var fileRepo in fileRepos)
                            {
                                var edmsReposCatFile = new EDMSRepoCatFile
                                {
                                    FileCode = string.Concat("ActInst_", Guid.NewGuid().ToString()),
                                    ReposCode = fileRepo.ReposCode,
                                    CatCode = fileRepo.CatCode,
                                    ObjectCode = actInst.ActivityInstCode,
                                    ObjectType = EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                    Path = fileRepo.Path,
                                    FolderId = fileRepo.FolderId
                                };
                                _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => !x.IsDeleted && x.FileCode.Equals(fileRepo.FileCode) && (x.IsFileMaster == true || x.IsFileMaster == null));
                                if (edmsFile != null)
                                {
                                    var fileNew = string.Concat(Path.GetFileNameWithoutExtension(edmsFile.FileName), "_", Guid.NewGuid().ToString().Substring(0, 8), Path.GetExtension(edmsFile.FileName));
                                    //var byteData = DownloadFileFromServer(fileRepo.Id);
                                    //var urlUpload = UploadFileToServer(byteData, fileRepo.ReposCode, fileRepo.CatCode, fileNew, edmsFile.MimeType);

                                    var edms = new EDMSFile
                                    {
                                        FileCode = edmsReposCatFile.FileCode,
                                        FileName = edmsFile.FileName,
                                        Desc = edmsFile.Desc,
                                        ReposCode = fileRepo.ReposCode,
                                        Tags = edmsFile.Tags,
                                        FileSize = edmsFile.FileSize,
                                        FileTypePhysic = edmsFile.FileTypePhysic,
                                        NumberDocument = edmsFile.NumberDocument,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        Url = edmsFile.Url,
                                        MimeType = edmsFile.MimeType,
                                        CloudFileId = edmsFile.CloudFileId,
                                        IsFileOrigin = false,
                                        FileParentId = edmsFile.FileID,
                                    };
                                    _context.EDMSFiles.Add(edms);

                                    var actInstFile = new ActivityInstFile
                                    {
                                        FileID = edmsReposCatFile.FileCode,
                                        ActivityInstCode = actInst.ActivityInstCode,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        IsSign = false,
                                        SignatureRequire = false,
                                    };
                                    _context.ActivityInstFiles.Add(actInstFile);

                                    //File share by default
                                    var permission = new PermissionFile();
                                    var listUserShare = (from a in assigns
                                                         join b in _context.Users on a.UserId equals b.Id
                                                         join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals c.DepartmentCode into c1
                                                         from c in c1.DefaultIfEmpty()
                                                         select new ShareFileDefault
                                                         {
                                                             Code = b.UserName,
                                                             Name = b.GivenName,
                                                             DepartmentName = c != null ? c.Title : "",
                                                             Permission = permission
                                                         }).ToList();
                                    var listUserShareManager = (from a in listManager
                                                                join b in _context.Users on a.UserId equals b.Id
                                                                join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals c.DepartmentCode into c1
                                                                from c in c1.DefaultIfEmpty()
                                                                select new ShareFileDefault
                                                                {
                                                                    Code = b.UserName,
                                                                    Name = b.GivenName,
                                                                    DepartmentName = c != null ? c.Title : "",
                                                                    Permission = permission
                                                                }).ToList();

                                    listUserShare.AddRange(listShareCreator);

                                    var rela = new
                                    {
                                        ObjectType = EnumHelper<ActivityInst>.GetDisplayValue(ActivityInst.ActivityInst),
                                        ObjectInstance = actInst.ActivityInstCode
                                    };
                                    var files = new FilesShareObjectUser
                                    {
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        FileID = edms.FileCode,
                                        FileCreated = User.Identity.Name,
                                        FileUrl = edms.Url,
                                        FileName = edmsFile.FileName,
                                        ObjectRelative = JsonConvert.SerializeObject(rela),
                                        ListUserShare = JsonConvert.SerializeObject(listUserShare.Union(listUserShareManager))
                                    };
                                    _context.FilesShareObjectUsers.Add(files);
                                }
                            }
                        }

                        var session = HttpContext.GetSessionUser();
                        if (listUserNotify.Count > 0)
                        {
                            var notification = new NotificationManager
                            {
                                ListUser = listUserNotify,
                                Title = string.Format("{0} đã tạo 1 luồng việc mới: {1}", session.FullName, wfInstance.WfInstName),
                                ObjCode = wfInstance.WfInstCode,
                                ObjType = EnumHelper<NotificationType>.GetDisplayValue(NotificationType.WorkFlow),
                            };

                            await InsertNotification(notification);
                        }

                        var userList = listUserNotify.Select(x => x.UserId);
                        wfInstance.UserList = JsonConvert.SerializeObject(userList);
                        _context.WorkflowInstances.Update(wfInstance);
                    }
                    msg.Object = wfInstance;
                    await _context.SaveChangesAsync();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    var nextActInstCode = await InsertInstRunning(wfInstance.WfInstCode, wfCode, userId);
                    return nextActInstCode;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["WFAI_MSG_OBJECT_HAD_WF"];
                    return "";
                }
            }
            catch (Exception ex)
            {
                //Rollback wfInstace
                if (!string.IsNullOrEmpty(wfInstCode))
                    DeleteWfInstance(wfInstCode);

                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return "";
            }
        }

        [NonAction]
        private List<DataAtt> GetAttrSetup(IQueryable<Activity> activities)
        {
            var listData = new List<DataAtt>();

            foreach (var item in activities)
            {
                if (!string.IsNullOrEmpty(item.ListGroupData))
                {
                    var listGroupData = item.ListGroupData.Split(',');

                    var data = (from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CARD_DATA_LOGGER")
                                join b in _context.AttrSetups.Where(x => !x.IsDeleted && listGroupData.Any(p => p.Equals(x.AttrGroup)))
                                    on a.CodeSet equals b.AttrGroup
                                select new DataAttrWf
                                {
                                    AttrCode = b != null ? b.AttrCode : "",
                                    AttrName = b != null ? b.AttrName : "",
                                    AttrGroup = a.CodeSet,
                                    AttrDataType = b != null ? b.AttrDataType : "",
                                    AttrNote = b != null ? b.Note : "",
                                    AttrUnit = b != null ? b.AttrUnit : "",
                                    SessionId = "",
                                    Value = "",
                                    ActCode = item.ActivityCode
                                }).GroupBy(x => new { x.AttrGroup, x.ActCode }).ToList();

                    var rs = data.Select(x => new DataAtt
                    {
                        AttrGroup = x.Key.AttrGroup,
                        ActCode = x.Key.ActCode,
                        DataAttrWf = x.ToList()
                    }).ToList();

                    if (rs.Count > 0)
                        listData.AddRange(rs);
                }
            }

            return listData;
        }

        [HttpPost]
        public async Task<JsonResult> RunningOneCommand([FromBody] RunningOneCommandModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var lstAssign = new List<CardMemberCustom>();
                var running = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial == obj.ActInst
                && x.ActivityDestination == obj.ActTo);
                if (running != null)
                {
                    var lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(running.Command);
                    var command = new JsonCommand
                    {
                        Approved = obj.Approve,
                        ApprovedBy = ESEIM.AppContext.UserName,
                        ApprovedTime = DateTime.Now.ToString("HH:mm dd/MM/yyyy"),
                        CommandSymbol = obj.Command,
                        Id = lstCommand.Count == 0 ? 1 : (lstCommand.LastOrDefault().Id + 1),
                        Confirmed = "",
                        ConfirmedBy = "",
                        ConfirmedTime = "",
                        IsLeader = false,
                        ActA = running.ActivityInitial,
                        ActB = running.ActivityDestination,
                        Message = ""
                    };
                    lstCommand.Add(command);
                    running.Command = JsonConvert.SerializeObject(lstCommand);
                    _context.WorkflowInstanceRunnings.Update(running);

                    //Unlock next activity
                    var actNext = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted
                                    && x.ActivityInstCode.Equals(obj.ActTo));
                    if (actNext != null)
                    {
                        if (actNext.Status.Equals("STATUS_ACTIVITY_NOT_DOING"))
                        {
                            actNext.StartTime = DateTime.Now;
                            actNext.Status = "STATUS_ACTIVITY_DOING";
                            _context.ActivityInstances.Update(actNext);

                            var wfInfo =
                                (from a in _context.WorkflowInstances.Where(x =>
                                        !x.IsDeleted.Value && x.WfInstCode == actNext.WorkflowCode)
                                    join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b
                                        .WfCode
                                    select new
                                    {
                                        a.ObjectInst,
                                        b.WfName,
                                        a.ObjectType,
                                    }).FirstOrDefault();
                            // Log Object Status
                            if (wfInfo != null)
                                await _workflowService.AddLogStatusAllAsync(wfInfo.ObjectType, wfInfo.ObjectInst,
                                    "STATUS_ACTIVITY_DOING", actNext.Title, actNext.Type, ESEIM.AppContext.UserName);
                        }
                    }

                    //Real-time
                    UpdateChangeActInst(obj.ActInst);

                    //Log action user
                    var common = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Command));
                    if (common != null)
                    {
                        var action = new ActInstanceUserActivity
                        {
                            CreatedTime = DateTime.Now,
                            UserId = ESEIM.AppContext.UserId,
                            ActInstCode = obj.ActInst,
                            Action = "Đã thêm lệnh",
                            FromDevice = "Desktop/Laptop",
                            IdObject = "Command",
                            ChangeDetails = "[" + common.ValueSet + "]"
                        };
                        _context.ActInstanceUserActivitys.Add(action);
                    }
                    //End

                    await _context.SaveChangesAsync();
                    msg.Title = _stringLocalizerWF["WFAI_MSG_RUN_COMMAND_SUCCES"];

                    var assign = _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst == running.ActivityDestination)
                        .Select(x => new CardMemberCustom
                        {
                            CreatedTime = "",
                            Id = x.ID,
                            Responsibility = "",
                            UserId = x.UserId
                        }).ToList();
                    lstAssign.AddRange(assign);

                    await SendNotifyCommand(lstAssign, obj.ActInst, " đã được chạy lệnh bởi ");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public async Task SendNotifyCommand(List<CardMemberCustom> lstUser, string actInstCode, string commandMsg)
        {
            var actInst = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode == actInstCode);
            if (actInst != null)
            {
                var assignInst = (_context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst == actInst.ActivityInstCode)
                    .Select(x => new CardMemberCustom
                    {
                        Id = x.ID,
                        UserId = x.UserId,
                        Responsibility = x.Role,
                        CreatedTime = x.CreatedTime.ToString("HH:mm dd/MM/yyyy")
                    })).ToList();
                lstUser.AddRange(assignInst);

                var timer = (DateTime?)null;
                if (actInst.Unit == "DURATION_UNIT20200904094128")
                {
                    timer = actInst.StartTime.HasValue ? actInst.StartTime.Value.AddDays(Convert.ToDouble(actInst.Duration)) : (DateTime?)null;
                }
                if (actInst.Unit == "DURATION_UNIT20200904094132")
                {
                    timer = actInst.StartTime.HasValue ? actInst.StartTime.Value.AddHours(Convert.ToDouble(actInst.Duration)) : (DateTime?)null;
                }
                if (actInst.Unit == "DURATION_UNIT20200904094135")
                {
                    timer = actInst.StartTime.HasValue ? actInst.StartTime.Value.AddMinutes(Convert.ToDouble(actInst.Duration)) : (DateTime?)null;
                }
                if (actInst.Unit == "DURATION_UNIT20200904094139")
                {
                    timer = actInst.StartTime.HasValue ? actInst.StartTime.Value.AddSeconds(Convert.ToDouble(actInst.Duration)) : (DateTime?)null;
                }

                var wfInfo = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.WfInstCode == actInst.WorkflowCode)
                              join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b.WfCode
                              select new
                              {
                                  a.ObjectInst,
                                  b.WfName
                              }).FirstOrDefault();

                var session = HttpContext.GetSessionUser();
                var message = "Hoạt động " + actInst.Title + " thuộc luồng " + wfInfo.WfName + commandMsg + session.FullName;
                await SendPushNotification(lstUser, message,
                    new
                    {
                        ActivityCode = actInst.ActivityCode,
                        ActivityInstCode = actInst.ActivityInstCode,
                        Desc = actInst.Desc,
                        Duration = actInst.Duration,
                        Group = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == actInst.Group).ValueSet ?? "",
                        ID = actInst.ID,
                        Located = actInst.Located,
                        ObjCode = wfInfo != null ? wfInfo.ObjectInst : "",
                        StatusCode = actInst.Status,
                        Timer = timer,
                        Title = actInst.Title,
                        Type = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == actInst.Type).ValueSet ?? "",
                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == actInst.Unit).ValueSet ?? "",
                        WorkflowCode = actInst.WorkflowCode,
                        WfName = wfInfo != null ? wfInfo.WfName : ""
                    },
                    EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromActInst));
            }

        }

        [NonAction]
        public async Task<int> SendPushNotification(List<CardMemberCustom> listUserId, string message, object data, string fromSrc)
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                             join b in _context.FcmTokens on a.UserId equals b.UserId
                             join c in _context.Users on a.UserId equals c.Id
                             where c.Active && b.AppCode == "SMARTWORK"
                             select new DeviceFcm
                             {
                                 Token = b.Token,
                                 Device = b.Device,
                                 UserId = a.UserId
                             }).Select(y => new DeviceFcm { Token = y.Token, Device = y.Device, UserId = y.UserId });
                if (query.Any())
                {
                    var countToken = query.Count();
                    if (countToken > 100000)
                    {
                        int countPush = (query.Count() / 100000) + 1;
                        for (int i = 0; i < countPush; i++)
                        {
                            List<DeviceFcm> listDevices = query.Skip(i * 1000).Take(100000).ToList();

                            var sendNotication = await _notification.SendNotification("Thông báo", message, listDevices, data, fromSrc, ESEIM.AppContext.UserName);
                        }
                    }
                    else
                    {
                        var sendNotication = await _notification.SendNotification("Thông báo", message, query.ToList(), data, fromSrc, ESEIM.AppContext.UserName);
                    }
                }
            }
            return 1;
        }

        [NonAction]
        private void UpdateChangeActInst(string actCode)
        {
            var actInst = _context.ActivityInstances.FirstOrDefault(x => x.ActivityInstCode.Equals(actCode) && !x.IsDeleted);
            if (actInst != null)
            {
                var lstSession = new List<ActSessionUser>();
                if (!string.IsNullOrEmpty(actInst.LockShare))
                {
                    lstSession = JsonConvert.DeserializeObject<List<ActSessionUser>>(actInst.LockShare);
                    var isExist = false;
                    foreach (var item in lstSession)
                    {
                        if (item.User == ESEIM.AppContext.UserName)
                        {
                            item.NewDataUpdate = false;
                            isExist = true;
                        }
                        else
                        {
                            item.NewDataUpdate = true;
                        }
                    }
                    if (!isExist)
                    {
                        var cardSession = new ActSessionUser
                        {
                            User = ESEIM.AppContext.UserName,
                            TimeStamp = DateTime.Now,
                            NewDataUpdate = false
                        };
                        lstSession.Add(cardSession);
                    }
                }
                else
                {
                    var cardSession = new ActSessionUser
                    {
                        User = ESEIM.AppContext.UserName,
                        TimeStamp = DateTime.Now,
                        NewDataUpdate = false
                    };
                    lstSession.Add(cardSession);
                }
                actInst.LockShare = JsonConvert.SerializeObject(lstSession);
                _context.ActivityInstances.Update(actInst);
            }
        }
        //[NonAction]
        //private void AddLogStatus(string objInst, JsonLog log)
        //{
        //    var notWork = _context.WorkShiftCheckInOuts.FirstOrDefault(x => !x.IsDeleted && x.Id.ToString().Equals(objInst));
        //    if (notWork != null)
        //    {
        //        var listJson = new List<JsonLog>();
        //        var listStatus = string.IsNullOrEmpty(notWork.Status) ? new List<JsonLog>() : JsonConvert.DeserializeObject<List<JsonLog>>(notWork.Status);
        //        listStatus.Add(log);
        //        notWork.Status = JsonConvert.SerializeObject(listStatus);
        //        _context.WorkShiftCheckInOuts.Update(notWork);
        //    }
        //}

        public class RunningOneCommandModel
        {
            public string ActInst { get; set; }
            public string ActTo { get; set; }
            public string Command { get; set; }
            public string Approve { get; set; }
        }

        public class ActSessionUser
        {
            public string User { get; set; }
            public bool NewDataUpdate { get; set; }
            public DateTime TimeStamp { get; set; }
        }
        public class ShareFileDefault
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string DepartmentName { get; set; }
            public PermissionFile Permission { get; set; }
        }

        [NonAction]
        private List<CreatorManager> AddCreatorManager(string userId)
        {
            var user = _context.Users.FirstOrDefault(x => x.Id.Equals(userId));
            var lstUser = new List<CreatorManager>();
            if (user != null)
            {
                if (!string.IsNullOrEmpty(user.DepartmentId))
                {
                    lstUser = (from a in _context.AdUserDepartments.Where(x => !x.IsDeleted && x.DepartmentCode.Equals(user.DepartmentId))
                               where a.RoleId.Equals("49b018ad-68af-4625-91fd-2273bb5cf749") || a.RoleId.Equals("4fdd7913-cb36-4621-bf4b-c9359138881c")
                               select new CreatorManager
                               {
                                   UserId = a.UserId,
                                   BranchId = user.BranchId,
                                   DepartmentId = user.DepartmentId
                               }).DistinctBy(x => x.UserId).ToList();
                }
            }
            return lstUser;
        }

        [NonAction]
        private async Task<string> InsertInstRunning(string wfInstCode, string wfCode, string userId)
        {
            var nextActInstCode = "";
            var setting = (_context.WorkflowSettings.Where(x => !x.IsDeleted && x.WorkflowCode == wfCode)
                .Select(x => new SettingWf
                {
                    ActSrc = x.ActivityInitial,
                    ActDes = x.ActivityDestination,
                    Command = x.Command,
                    TransCode = x.TransitionCode,
                })).ToList();

            var actInst = (from a in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == wfInstCode)
                           join b in _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode == wfCode) on a.ActivityCode equals b.ActivityCode
                           select new
                           {
                               ActInstCode = a.ActivityInstCode,
                               ActCode = b.ActivityCode,
                               Type = b.Type
                           }).ToList();

            var lstSetting = new List<SettingWf>();

            foreach (var item in setting)
            {
                var obj = new SettingWf();
                obj.TransCode = item.TransCode;

                var lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                foreach (var command in lstCommand)
                {
                    command.Approved = "APPROVE_COMMAND_Y";
                }

                item.Command = JsonConvert.SerializeObject(lstCommand);
                obj.Command = item.Command;

                foreach (var k in actInst)
                {
                    if (item.ActSrc == k.ActCode)
                    {
                        obj.ActSrc = k.ActInstCode;
                        break;
                    }
                }
                foreach (var k in actInst)
                {
                    if (item.ActDes == k.ActCode)
                    {
                        obj.ActDes = k.ActInstCode;
                        break;
                    }
                }
                lstSetting.Add(obj);
            }
            foreach (var item in lstSetting)
            {
                var running = new WorkflowInstanceRunning
                {
                    ActivityInitial = item.ActSrc,
                    ActivityDestination = item.ActDes,
                    Command = item.Command,
                    TransitionCode = item.TransCode,
                    WfInstCode = wfInstCode,
                    WorkflowCode = wfCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.WorkflowInstanceRunnings.Add(running);
            }
            await _context.SaveChangesAsync();
            foreach (var item in lstSetting)
            {
                foreach (var act in actInst)
                {
                    if (act.Type == "TYPE_ACTIVITY_INITIAL" && item.ActSrc == act.ActInstCode)
                    {
                        var obj = new RunningOneCommandModel()
                        {
                            ActInst = item.ActSrc,
                            ActTo = item.ActDes,
                            Approve = "APPROVE_COMMAND_Y",
                            Command = "COMMAND_WF_INSTANCE_DO"
                        };
                        nextActInstCode = item.ActDes;
                        await RunningOneCommand(obj);
                    }
                }
            }
            return nextActInstCode;
        }

        [HttpGet]
        public JsonResult DeleteWfInstance(string wfInstCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var session = HttpContext.GetSessionUser();
            var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WfInstCode == wfInstCode);
            if (data != null)
            {
                if (data.CreatedBy == session.UserName || session.IsAllData)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkflowInstances.Update(data);

                    var processing = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.WfInstCode.Equals(data.WfInstCode));
                    foreach (var item in processing)
                    {
                        item.IsDeleted = true;
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        _context.WfActivityObjectProccessings.Update(item);
                    }

                    var actInst = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == wfInstCode);
                    if (actInst.Any())
                    {
                        foreach (var item in actInst)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.ActivityInstances.Update(item);

                            var assigns = _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst.Equals(item.ActivityInstCode));
                            foreach (var assign in assigns)
                            {
                                assign.IsDeleted = true;
                                assign.DeletedBy = ESEIM.AppContext.UserName;
                                assign.DeletedTime = DateTime.Now;
                                _context.ExcuterControlRoleInsts.Update(assign);
                            }

                            var files = _context.ActivityInstFiles.Where(x => !x.IsDeleted && x.ActivityInstCode.Equals(item.ActivityInstCode));
                            foreach (var file in files)
                            {
                                file.IsDeleted = true;
                                file.DeletedBy = ESEIM.AppContext.UserName;
                                file.DeletedTime = DateTime.Now;
                                _context.ActivityInstFiles.Update(file);
                            }

                            var attrData = _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.ActCode.Equals(item.ActivityInstCode));
                            foreach (var attr in attrData)
                            {
                                attr.IsDeleted = true;
                                attr.DeletedBy = ESEIM.AppContext.UserName;
                                attr.DeletedTime = DateTime.Now;
                                _context.ActivityAttrDatas.Update(attr);
                            }
                        }
                    }
                    var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.WfInstCode == wfInstCode);
                    if (runnings.Any())
                    {
                        foreach (var item in runnings)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.WorkflowInstanceRunnings.Update(item);
                        }
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];

                    RemoveUserInNotify(wfInstCode, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.WorkFlow), true);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["WFAI_MSG_U_NOT_PERMISSION_DELETE"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["WFAI_MSG_RECORD_NO_EXIST"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetLogStatus(int id)
        {
            var notWork = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
            return Json(notWork);
        }

        [NonAction]
        public LogStatus GetLatestLogStatusInst(string actCode)
        {
            var lstStatus = new List<LogStatus>();
            var inst = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted
                    && x.ActivityInstCode.Equals(actCode));
            if (inst != null)
            {
                if (!string.IsNullOrEmpty(inst.JsonStatusLog))
                {
                    lstStatus = JsonConvert.DeserializeObject<List<LogStatus>>(inst.JsonStatusLog);
                }
            }
            var data = (from a in lstStatus
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                        join c in _context.Users on a.CreatedBy equals c.UserName
                        select new LogStatus()
                        {
                            Status = b.ValueSet,
                            CreatedBy = c.GivenName,
                            CreatedTime = a.CreatedTime,
                            sCreatedTime = a.CreatedTime.ToString("HH:mm dd/MM/yyyy")
                        }).OrderByDescending(x => x.CreatedTime).FirstOrDefault();
            return data;
        }

        [HttpGet]
        public PermissionModel GetPermission(string actInstCode)
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.ExcuterControlRoleInsts.Where(x => x.ActivityCodeInst.Equals(actInstCode) && !x.IsDeleted);
            var act = _context.ActivityInstances.FirstOrDefault(x => x.ActivityInstCode.Equals(actInstCode) && !x.IsDeleted);
            var permissionApprove = false;
            var perUpdateRoleAssign = false;
            if (data.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId)))
            {
                var assigned = data.FirstOrDefault(x => x.UserId.Equals(ESEIM.AppContext.UserId));
                if (assigned.Role.Equals("ROLE_ACT_REPOSITIVE"))
                {
                    permissionApprove = true;
                    perUpdateRoleAssign = true;
                }
                if (assigned.Role.Equals("ROLE_ACT_LEADER") || session.IsAllData || (act != null && act.CreatedBy.Equals(session.UserName)))
                {
                    perUpdateRoleAssign = true;
                }
            }
            else
            {
                if (session.IsAllData || (act != null && act.CreatedBy.Equals(session.UserName)))
                {
                    perUpdateRoleAssign = true;
                }
            }
            return new PermissionModel()
            {
                PermisstionApprove = permissionApprove,
                PermissionChangeRole = perUpdateRoleAssign
            };
        }
        public class LogStatus
        {
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public bool Lock { get; set; }
            public DateTime CreatedTime { get; set; }
            public string sCreatedTime { get; set; }
        }

        public class PermissionModel
        {
            public bool PermisstionApprove { get; set; }
            public bool PermissionChangeRole { get; set; }
        }
        public class DataAtt
        {
            public string ActCode { get; set; }
            public string AttrGroup { get; set; }
            public List<DataAttrWf> DataAttrWf { get; set; }
        }
        public class DataAttrWf
        {
            public string ActCode { get; set; }
            public string AttrCode { get; set; }
            public string AttrName { get; set; }
            public string AttrGroup { get; set; }
            public string AttrNote { get; set; }
            public string AttrDataType { get; set; }
            public string AttrUnit { get; set; }
            public string SessionId { get; set; }
            public string Value { get; set; }
        }
        public class ActGrid
        {
            public string ActName { get; set; }
            public string ActStatus { get; set; }
            public int Id { get; set; }
            public bool IsLock { get; set; }
            public bool IsApprovable { get; set; }
            public int Level { get; set; }
            public string ActivityInstCode { get; set; }
            public string ActType { get; set; }
            public bool IsInstance { get; set; }
            public string ObjectCode { get; set; }
            public string JsonStatusLog { get; set; }
            public LogStatus Log { get; set; }
            public string StatusCode { get; set; }
        }
        #endregion

        #region Check notice date
        [HttpGet]
        public object CheckDate(string fromDate, string toDate)
        {
            var isNotice = false;
            var noticeDate = "";
            try
            {
                var common = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals("TIME_NOTICE"));
                if (common != null)
                {
                    noticeDate = common.ValueSet;
                    var timeNotice = int.Parse(common.ValueSet);
                    var FromDate = DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var ToDate = DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    if ((ToDate.Date - FromDate.Date).TotalDays >= 2
                        && (FromDate.Date - DateTime.Now.Date).TotalDays <= timeNotice)
                    {
                        isNotice = true;
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return new
            {
                NoticeDate = noticeDate,
                IsNotice = isNotice
            };
        }
        #endregion

        #region Count not work relative
        [HttpPost]
        public JsonResult GetCountNotWork()
        {
            var session = HttpContext.GetSessionUser();
            //Get not work today
            var totalSheets = _context.WorkShiftCheckInOuts
                        .Where(x => !x.IsDeleted && x.Action != "CHECKIN" && x.Action != "CHECKOUT")
                        //&& x.ActionTime.Date <= DateTime.Now.Date
                        //&& x.ActionTo.Value.Date >= DateTime.Now.Date)
                        .Select(x => x.Id);
            var yourSheets = _context.WorkShiftCheckInOuts
                        .Where(x => !x.IsDeleted && x.Action != "CHECKIN" && x.Action != "CHECKOUT" && x.UserId == session.UserId)
                        //&& x.ActionTime.Date <= DateTime.Now.Date
                        //&& x.ActionTo.Value.Date >= DateTime.Now.Date)
                        .Select(x => x.Id);
            //var instWfs = (from a in _context.WorkflowInstances
            //                .Where(x => !x.IsDeleted.Value && x.ObjectType.Equals("NOT_WORK")
            //                    && notWorks.Any(k => k.ToString().Equals(x.ObjectInst))
            //                    && x.Status.Equals("STATUS_WF_PENDING"))
            //               join b in _context.ActivityInstances.Where(x => !x.IsDeleted)
            //                   on a.WfInstCode equals b.WorkflowCode
            //               join c in _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted
            //                   && (x.UserId.Equals(ESEIM.AppContext.UserId) || session.IsAllData)) on b.ActivityInstCode equals c.ActivityCodeInst
            //               select new
            //               {
            //                   a.WfInstCode
            //               }).DistinctBy(x => x.WfInstCode);
            //return Json(instWfs.Count());
            var data = new
            {
                CountYourSheets = yourSheets.Count(),
                CountTotalSheets = totalSheets.Count()
            };
            return Json(data);
        }
        #endregion

        #region Suggest WF
        [HttpPost]
        public string SuggestWF()
        {
            var wfInst = (from a in _context.WorkflowInstances
                            .Where(x => !x.IsDeleted.Value && x.ObjectType.Equals("NOT_WORK"))
                          join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b.WfCode
                          select new
                          {
                              a.Id,
                              b.WfCode
                          }).OrderByDescending(x => x.Id).FirstOrDefault();
            return wfInst != null ? wfInst.WfCode : "";
        }

        #endregion

        #region Manager notification
        [NonAction]
        public async Task<JsonResult> InsertNotification([FromBody] NotificationManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.NotificationManagers.Any(x => !x.IsDeleted && x.ObjCode.Equals(obj.ObjCode) && x.ObjType.Equals(obj.ObjType));
                if (!check)
                {
                    obj.NotifyCode = string.Format("NOTIFI_{0}", DateTime.Now.ToString("ddMMyyyyHHmmss"));
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    _context.NotificationManagers.Add(obj);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Thông báo đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public JsonResult UpdateNotification([FromBody] NotificationManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var notifiManager = _context.NotificationManagers.FirstOrDefault(x => !x.IsDeleted && x.ObjCode.Equals(obj.ObjCode) && x.ObjType.Equals(obj.ObjType));
                if (notifiManager != null)
                {
                    var listDelete = notifiManager.ListUser.Where(x => !obj.ListUser.Any(p => p.UserId.Equals(x.UserId))).ToList();
                    var listInsert = obj.ListUser.Where(x => !notifiManager.ListUser.Any(p => p.UserId.Equals(x.UserId))).ToList();
                    if (listInsert.Count > 0)
                        notifiManager.ListUser.AddRange(listInsert);

                    foreach (var item in listDelete)
                    {
                        notifiManager.ListUser.Remove(item);
                    }

                    notifiManager.UpdatedBy = User.Identity.Name;
                    notifiManager.UpdatedTime = DateTime.Now;
                    _context.NotificationManagers.Update(notifiManager);
                    _context.SaveChanges();
                }
                else
                {
                    InsertNotification(obj);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public JsonResult RemoveUserInNotify(string objCode, string objType, bool delete)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var notifiManager = _context.NotificationManagers.FirstOrDefault(x => !x.IsDeleted && x.ObjCode.Equals(objCode) && x.ObjType.Equals(objType));
                if (notifiManager != null)
                {
                    var listDelete = notifiManager.ListUser.Where(x => x.UserId.Equals(ESEIM.AppContext.UserId)).ToList();
                    foreach (var item in listDelete)
                    {
                        notifiManager.ListUser.Remove(item);
                    }

                    if (notifiManager.ListUser.Count == 0 || delete)
                    {
                        notifiManager.IsDeleted = true;
                        notifiManager.DeletedBy = User.Identity.Name;
                        notifiManager.DeletedTime = DateTime.Now;
                    }

                    notifiManager.UpdatedBy = User.Identity.Name;
                    notifiManager.UpdatedTime = DateTime.Now;
                    _context.NotificationManagers.Update(notifiManager);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public bool GetIsReadNotification(string objCode, string objType)
        {
            var isRead = true;
            try
            {
                var notifiManager = _context.NotificationManagers.FirstOrDefault(x => !x.IsDeleted && x.ObjCode.Equals(objCode) && x.ObjType.Equals(objType));
                if (notifiManager != null)
                {
                    if (notifiManager.ListUser.Any(p => p.UserId.Equals(ESEIM.AppContext.UserId)))
                        isRead = false;
                }
            }
            catch (Exception ex)
            {
            }
            return isRead;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerWF.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}