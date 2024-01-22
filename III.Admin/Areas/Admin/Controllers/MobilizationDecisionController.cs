using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Hosting.Internal;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;
using Syncfusion.XlsIO;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MobilizationDecisionController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<HrEmployeeMobilizationController> _stringLocalizer;
        private readonly IStringLocalizer<MobilizationDecisionController> _stringLocalizerMd;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IWorkflowService _workflowService;
        private readonly IStringLocalizer<WorkflowActivityController> _workflowActivityController;

        public MobilizationDecisionController(EIMDBContext context, IUploadService upload,
            IHostingEnvironment hostingEnvironment, IOptions<AppSettings> appSettings,
            IStringLocalizer<HrEmployeeMobilizationController> stringLocalizer,
            IStringLocalizer<MobilizationDecisionController> stringLocalizerMd,
        IStringLocalizer<SharedResources> sharedResources, IWorkflowService workflowService,
            IStringLocalizer<WorkflowActivityController> workflowActivityController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerMd = stringLocalizerMd;
            _sharedResources = sharedResources;
            _workflowService = workflowService;
            _workflowActivityController = workflowActivityController;
        }
        [Breadcrumb("ViewData.CrumbMobilizationDecision", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbMobilizationDecision"] = _sharedResources["COM_DECISION_TO_MOVE"];
            return View();
        }

        #region Jtable
        [HttpPost]
        public object JTable([FromBody] JTableModelMobilizationDecision jTablePara)
        {
            var toDay = DateTime.Now;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.DecisionMovementHeaders.Where(x => !x.IsDeleted)
                             //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                             //from b in b1.DefaultIfEmpty()
                         let listStatus = !string.IsNullOrEmpty(a.Status) ? JsonConvert.DeserializeObject<List<JsonLog>>(a.Status) : new List<JsonLog>()
                         let completeStatus = listStatus.Where(x => !string.IsNullOrEmpty(x.Code) && x.Code.Equals("STATUS_ACTIVITY_APPROVE_END")).OrderByDescending(p => p.CreatedTime).FirstOrDefault()
                         let signer = completeStatus != null ? completeStatus.CreatedBy : ""
                         let signTime = completeStatus != null ? completeStatus.CreatedTime : (DateTime?)null
                         let details = _context.DecisionMovementDetails.Where(x => !x.IsDeleted && x.DecisionNum.Equals(a.DecisionNum))
                         where (string.IsNullOrEmpty(jTablePara.DecisionNum) || a.DecisionNum.ToLower().Contains(jTablePara.DecisionNum.ToLower()) || a.Title.ToLower().Contains(jTablePara.DecisionNum.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.FromDate) || a.CreatedTime >= fromDate)
                         && (string.IsNullOrEmpty(jTablePara.ToDate) || a.CreatedTime <= toDate)
                         && (string.IsNullOrEmpty(jTablePara.CodeEmployee) || (details.Count() > 0 && details.Any(p => p.EmployeesCode.Equals(jTablePara.CodeEmployee))))
                         && (string.IsNullOrEmpty(jTablePara.AprovedBy) || signer.Equals(jTablePara.AprovedBy))
                         && (string.IsNullOrEmpty(jTablePara.Status) || a.Status.Equals(jTablePara.Status))
                         select new
                         {
                             a.Id,
                             a.DecisionNum,
                             a.Title,
                             CreatedTime = a.CreatedTime.HasValue ? a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                             Status = listStatus.Count > 0 ? listStatus[listStatus.Count - 1].Name : "",
                             AprovedBy = signer,
                             AprovedTime = signTime,
                         });
            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "DecisionNum", "Title", "CreatedTime", "Status", "AprovedBy", "AprovedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object JTableMain([FromBody] JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.DecisionMovementDetails.Where(x => x.DecisionNum.Equals(jTablePara.DecisionNum) && !x.IsDeleted)
                         join c in _context.HREmployees.Where(x => x.flag == 1) on a.EmployeesCode equals c.employee_code
                         select new
                         {
                             a.Id,
                             a.EmployeesCode,
                             Fullname = c.fullname,
                             OldCode = c.unit,
                             OldPosion = c.position,
                             OldDepartment = !string.IsNullOrEmpty((_context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(c.unit))).Title) ? (_context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(c.unit))).Title : "",
                             OldRole = !string.IsNullOrEmpty((_context.Roles.FirstOrDefault(x => x.Id.Equals(c.position))).Title) ? (_context.Roles.FirstOrDefault(x => x.Id.Equals(c.position))).Title : "",
                             NewCode = a.NewDepartCode,
                             NewPosion = a.NewRole,
                             NewDepartment = !string.IsNullOrEmpty((_context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(a.NewDepartCode))).Title) ? (_context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.DepartmentCode.Equals(a.NewDepartCode))).Title : "",
                             NewRole = !string.IsNullOrEmpty((_context.Roles.FirstOrDefault(x => x.Id.Equals(a.NewRole))).Title) ? (_context.Roles.FirstOrDefault(x => x.Id.Equals(a.NewRole))).Title : "",
                             a.PayScaleCode,
                             a.PayRanges,
                             FromTime = a.FromTime.HasValue ? a.FromTime.Value.ToString("dd/MM/yyyy") : "",
                             ToTime = a.ToTime.HasValue ? a.ToTime.Value.ToString("dd/MM/yyyy") : "",
                             a.Salary,
                             a.ReasonMovement,
                         });
            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "DecideNum", "FromTime", "ToTime", "OldCode", "OldPosion", "NewCode", "NewPosion", "EmployeesCode", "Fullname", "OldDepartment", "OldRole", "NewDepartment", "NewRole", "PayScaleCode", "PayRanges", "Salary", "ReasonMovement");
            return Json(jdata);
        }
        #endregion

        #region Header
        [HttpPost]
        public object Insert([FromBody]DecisionMovementHeader data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.DecisionMovementHeaders.FirstOrDefault(x => x.DecisionNum == data.DecisionNum && !x.IsDeleted);
                if (model == null)
                {
                    var status = new JsonLog
                    {
                        Code = data.Status,
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.Status)) != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.Status)).ValueSet : "",
                        CreatedTime = DateTime.Now,
                    };

                    data.ListStatus.Add(status);
                    data.Status = JsonConvert.SerializeObject(data.ListStatus);

                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;

                    _context.DecisionMovementHeaders.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Thêm mới thành công"];
                    msg.ID = data.Id;
                }
                else
                {
                    DeleteWorkFlowInstance(data.DecisionNum);

                    msg.Title = _stringLocalizer["Số quyết định đã tồn tại"];
                    msg.Error = true;
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }

        [HttpPost]
        public object GetItemHeader(int id)
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);

            var list = new List<ComboxModel>();
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.DecisionNum) && x.ObjectType.Equals(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement)));
            if (check != null)
            {
                data.WfInstId = check.Id;

                var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                if (!string.IsNullOrEmpty(current))
                {
                    var initial = acts.FirstOrDefault(x => x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                    if (initial != null)
                    {
                        var infoActInitial = new ComboxModel
                        {
                            IntsCode = initial.ActivityInstCode,
                            Code = initial.ActivityCode,
                            Name = initial.Title,
                            Status = initial.Status,
                            UpdateBy = !string.IsNullOrEmpty(initial.UpdatedBy) ? _context.Users.FirstOrDefault(x => x.UserName.Equals(initial.UpdatedBy)).GivenName ?? "" : "",
                            UpdateTime = initial.UpdatedTime.HasValue ? initial.UpdatedTime.ToString() : ""
                        };
                        list.Add(infoActInitial);

                        var runningNext = _context.WorkflowInstanceRunnings.FirstOrDefault(x => x.ActivityInitial.Equals(initial.ActivityInstCode));
                        if (runningNext != null)
                        {
                            var nextActRunning = !string.IsNullOrEmpty(runningNext.ActivityDestination) ? runningNext.ActivityDestination : "";
                            var count = 1;
                            foreach (var item in acts)
                            {
                                var inti = acts.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(nextActRunning));
                                if (inti != null && count < acts.Count())
                                {
                                    var name2 = new ComboxModel
                                    {
                                        IntsCode = inti.ActivityInstCode,
                                        Code = inti.ActivityCode,
                                        Name = inti.Title,
                                        Status = inti.Status,
                                        UpdateBy = !string.IsNullOrEmpty(inti.UpdatedBy) ? _context.Users.FirstOrDefault(x => x.UserName.Equals(inti.UpdatedBy)).GivenName ?? "" : "",
                                        UpdateTime = inti.UpdatedTime.HasValue ? inti.UpdatedTime.ToString() : ""
                                    };
                                    list.Add(name2);
                                    var location2 = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityInstCode));
                                    if (location2 != null)
                                    {
                                        nextActRunning = location2.ActivityDestination;
                                    }
                                }
                                count++;
                            }
                        }
                        else
                        {
                            return data;
                        }
                    }
                    else
                    {
                        return data;
                    }

                    var assign = _context.ExcuterControlRoleInsts.FirstOrDefault(x => !x.IsDeleted && x.ActivityCodeInst.Equals(current) && x.UserId.Equals(ESEIM.AppContext.UserId));
                    var typeAct = "";
                    var nextAct = "";
                    var checkEnd = "";
                    if (acts.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                    {
                        typeAct = "TYPE_ACTIVITY_INITIAL";
                    }
                    else if (acts.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
                    {
                        typeAct = "TYPE_ACTIVITY_REPEAT";
                        nextAct = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(current)).ActivityDestination;
                        checkEnd = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(nextAct)).Type;
                    }
                    else if (acts.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
                    {
                        typeAct = "TYPE_ACTIVITY_END";
                    }

                    if (assign != null || session.IsAllData)
                    {
                        if (typeAct.Equals("TYPE_ACTIVITY_INITIAL"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = true, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && checkEnd != "TYPE_ACTIVITY_END")
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && checkEnd == "TYPE_ACTIVITY_END")
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DecisionEnd)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_END"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = false, list, current };
                        }
                        else { return data; }
                    }
                    else
                    {
                        if (typeAct.Equals("TYPE_ACTIVITY_INITIAL"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && (data.Status.Equals("INITIAL_DONE") || data.Status.Equals("REPEAT_STOP") || data.Status.Equals("REPEAT_REWORK") || data.Status.Equals("REPEAT_REQUIRE_REWORK") || data.Status.Equals("REPEAT_WORKING")))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && (data.Status.Equals("REPEAT_DONE") || data.Status.Equals("END_REQUIRE_REWORK") || data.Status.Equals("END_REWORK") || data.Status.Equals("END_STOP") || data.Status.Equals("END_WORKING")))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DecisionEnd)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_END"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        else { return data; }
                    }
                }
                else
                {
                    return data;
                }
            }
            else
            {
                return data;
            }
        }

        [HttpPost]
        public object GetItemHeaderWithCode(string code)
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.DecisionNum == code && !x.IsDeleted);

            var list = new List<ComboxModel>();
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.DecisionNum) && x.ObjectType.Equals(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement)));
            if (check != null)
            {
                data.WfInstId = check.Id;

                var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
                var current = check.MarkActCurrent;
                if (!string.IsNullOrEmpty(current))
                {
                    var initial = acts.FirstOrDefault(x => x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
                    if (initial != null)
                    {
                        var infoActInitial = new ComboxModel
                        {
                            IntsCode = initial.ActivityInstCode,
                            Code = initial.ActivityCode,
                            Name = initial.Title,
                            Status = initial.Status,
                            UpdateBy = !string.IsNullOrEmpty(initial.UpdatedBy) ? _context.Users.FirstOrDefault(x => x.UserName.Equals(initial.UpdatedBy)).GivenName ?? "" : "",
                            UpdateTime = initial.UpdatedTime.HasValue ? initial.UpdatedTime.ToString() : ""
                        };
                        list.Add(infoActInitial);

                        var runningNext = _context.WorkflowInstanceRunnings.FirstOrDefault(x => x.ActivityInitial.Equals(initial.ActivityInstCode));
                        if (runningNext != null)
                        {
                            var nextActRunning = !string.IsNullOrEmpty(runningNext.ActivityDestination) ? runningNext.ActivityDestination : "";
                            var count = 1;
                            foreach (var item in acts)
                            {
                                var inti = acts.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(nextActRunning));
                                if (inti != null && count < acts.Count())
                                {
                                    var name2 = new ComboxModel
                                    {
                                        IntsCode = inti.ActivityInstCode,
                                        Code = inti.ActivityCode,
                                        Name = inti.Title,
                                        Status = inti.Status,
                                        UpdateBy = !string.IsNullOrEmpty(inti.UpdatedBy) ? _context.Users.FirstOrDefault(x => x.UserName.Equals(inti.UpdatedBy)).GivenName ?? "" : "",
                                        UpdateTime = inti.UpdatedTime.HasValue ? inti.UpdatedTime.ToString() : ""
                                    };
                                    list.Add(name2);
                                    var location2 = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityInstCode));
                                    if (location2 != null)
                                    {
                                        nextActRunning = location2.ActivityDestination;
                                    }
                                }
                                count++;
                            }
                        }
                        else
                        {
                            return data;
                        }
                    }
                    else
                    {
                        return data;
                    }

                    var assign = _context.ExcuterControlRoleInsts.FirstOrDefault(x => !x.IsDeleted && x.ActivityCodeInst.Equals(current) && x.UserId.Equals(ESEIM.AppContext.UserId));
                    var typeAct = "";
                    var nextAct = "";
                    var checkEnd = "";
                    if (acts.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
                    {
                        typeAct = "TYPE_ACTIVITY_INITIAL";
                    }
                    else if (acts.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
                    {
                        typeAct = "TYPE_ACTIVITY_REPEAT";
                        nextAct = _context.WorkflowInstanceRunnings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(current)).ActivityDestination;
                        checkEnd = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(nextAct)).Type;
                    }
                    else if (acts.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
                    {
                        typeAct = "TYPE_ACTIVITY_END";
                    }

                    if (assign != null || session.IsAllData)
                    {
                        if (typeAct.Equals("TYPE_ACTIVITY_INITIAL"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = true, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && checkEnd != "TYPE_ACTIVITY_END")
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && checkEnd == "TYPE_ACTIVITY_END")
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DecisionEnd)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_END"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = true, editdetail = false, list, current };
                        }
                        else { return data; }
                    }
                    else
                    {
                        if (typeAct.Equals("TYPE_ACTIVITY_INITIAL"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && (data.Status.Equals("INITIAL_DONE") || data.Status.Equals("REPEAT_STOP") || data.Status.Equals("REPEAT_REWORK") || data.Status.Equals("REPEAT_REQUIRE_REWORK") || data.Status.Equals("REPEAT_WORKING")))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_REPEAT") && (data.Status.Equals("REPEAT_DONE") || data.Status.Equals("END_REQUIRE_REWORK") || data.Status.Equals("END_REWORK") || data.Status.Equals("END_STOP") || data.Status.Equals("END_WORKING")))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DecisionEnd)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        if (typeAct.Equals("TYPE_ACTIVITY_END"))
                        {
                            var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                            return new { data, com, editrole = false, editdetail = false, list, current };
                        }
                        else { return data; }
                    }
                }
                else
                {
                    return data;
                }
            }
            else
            {
                return data;
            }
        }

        [HttpPost]
        public object GetStepWorkFlow(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var value = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(code));
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
            };
            list.Add(name);
            var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            var next = location.ActivityDestination;
            var count = 1;
            foreach (var item in value)
            {
                var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                if (inti != null && count < value.Count())
                {
                    var name2 = new ComboxModel
                    {
                        Code = inti.ActivityCode,
                        Name = inti.Title,
                        Status = inti.Status,
                    };
                    list.Add(name2);
                    var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                    if (location2 != null)
                    {
                        next = location2.ActivityDestination;
                    }
                }
                count++;
            }
            return new { list };
        }

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.DecisionNum.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.DecisionNum) && x.ObjectType.Equals(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement)));
            var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
            var current = check.MarkActCurrent;
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                IntsCode = initial.ActivityInstCode,
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
            };
            list.Add(name);
            var location = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(initial.ActivityCode));
            var next = location.ActivityDestination;
            var count = 1;
            foreach (var item in value)
            {
                var inti = value.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(next));
                if (inti != null && count < value.Count())
                {
                    var name2 = new ComboxModel
                    {
                        IntsCode = inti.ActivityInstCode,
                        Code = inti.ActivityCode,
                        Name = inti.Title,
                        Status = inti.Status,
                    };
                    list.Add(name2);
                    var location2 = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(inti.ActivityCode));
                    if (location2 != null)
                    {
                        next = location2.ActivityDestination;
                    }
                }
                count++;
            }
            return new { list, current };
        }

        [HttpPost]
        public object Update([FromBody]DecisionMovementHeader obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var updatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName;
                var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.DecisionNum == obj.DecisionNum && !x.IsDeleted);
                if (data != null)
                {
                    if (data.Status == "STATUS_ACTIVITY_APPROVE_END" && obj.Status == "STATUS_ACTIVITY_APPROVE_END")
                    {
                        msg.Error = true;
                        msg.Title = "Quyết định đã được hoàn thành !";
                        return Json(msg);
                    }
                    var countDetail = _context.DecisionMovementDetails.Count(x => !x.IsDeleted && x.DecisionNum.Equals(obj.DecisionNum));
                    if (countDetail == 0)
                    {
                        msg.Error = true;
                        msg.Title = "Vui lòng nhập chi tiết";
                        return msg;
                    }

                    //if (obj.Status != data.Status)
                    //{
                    //    var status = new JsonLog
                    //    {
                    //        Code = obj.Status,
                    //        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                    //        Name = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Status)).ValueSet,
                    //        CreatedTime = DateTime.Now,
                    //    };

                    //    data.ListStatus.Add(status);
                    //    data.Status = obj.Status;
                    //}

                    data.JsonData = CommonUtil.JsonData(data, obj, data.JsonData, updatedBy);

                    data.Title = obj.Title;
                    data.Noted = obj.Noted;
                    data.WorkflowCat = obj.WorkflowCat;
                    data.UpdatedBy = User.Identity.Name;
                    data.UpdatedTime = DateTime.Now;
                    _context.DecisionMovementHeaders.Update(data);
                    _workflowService.UpdateStatusWF(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement), obj.DecisionNum, obj.Status, obj.ActRepeat, HttpContext.GetSessionUser());
                    _context.SaveChanges();

                    //Cập nhật thông tin bên nhân sự
                    FinalDecision(obj);

                    msg.Title = _stringLocalizer["Cập nhật thành công"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Số quyết định đã tồn tại!"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_UPDATE"];

            }
            return msg;
        }

        [HttpPost]
        public object Delete([FromBody]int Id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Quyết định không tồn tại"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.DecisionMovementHeaders.Update(data);

                    var session = HttpContext.GetSessionUser();
                    var data1 = _context.DecisionMovementDetails.Where(x => !x.IsDeleted && x.DecisionNum.Equals(data.DecisionNum));

                    foreach (var item in data1)
                    {
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        item.IsDeleted = true;
                        _context.DecisionMovementDetails.Update(item);
                    }

                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Xóa quyết định thành công"];

                    DeleteWorkFlowInstance(data.DecisionNum);
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

        [NonAction]
        public void DeleteWorkFlowInstance(string objCode)
        {
            var data2 = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(objCode) && x.ObjectType.Equals(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement)));
            if (data2 != null)
            {
                data2.IsDeleted = true;
                data2.DeletedBy = ESEIM.AppContext.UserName;
                data2.DeletedTime = DateTime.Now;
                _context.WorkflowInstances.Update(data2);

                var processing = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.WfInstCode.Equals(data2.WfInstCode));
                foreach (var item in processing)
                {
                    item.IsDeleted = true;
                    item.DeletedBy = ESEIM.AppContext.UserName;
                    item.DeletedTime = DateTime.Now;
                    _context.WfActivityObjectProccessings.Update(item);
                }

                var actInst = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(data2.WfInstCode));
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
                var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.WfInstCode == data2.WfInstCode);
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
            }
        }

        [HttpPost]
        public object GetJsonData(string decisionNum)
        {
            var msg = new JMessage { Title = "", Error = false };

            var header = _context.DecisionMovementHeaders.FirstOrDefault(x => !x.IsDeleted && x.DecisionNum.Equals(decisionNum));
            if (header != null)
            {
                var listLog = new List<object>();
                var logHeader = new
                {
                    Type = "Theo dõi thay đổi phiếu",
                    Data = !string.IsNullOrEmpty(header.JsonData) ? JsonConvert.DeserializeObject<List<object>>(header.JsonData) : new List<object>()
                };

                var logStatus = new
                {
                    Type = "Theo dõi thay đổi trạng thái",
                    Data = !string.IsNullOrEmpty(header.Status) ? JsonConvert.DeserializeObject<List<object>>(header.Status) : new List<object>()
                };

                listLog.Add(logHeader);
                listLog.Add(logStatus);

                msg.Object = JsonConvert.SerializeObject(listLog);
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không lấy được thông tin quyết định";
            }

            return msg;
        }
        #endregion

        #region Header
        [NonAction]
        public void FinalDecision(DecisionMovementHeader obj)
        {
            try
            {
                if (obj.Status.Equals("STATUS_ACTIVITY_APPROVE_END"))
                {
                    var data = from a in _context.DecisionMovementDetails.Where(x => !x.IsDeleted && x.DecisionNum.Equals(obj.DecisionNum))
                               join b in _context.HREmployees.Where(x => x.flag == 1) on a.EmployeesCode equals b.employee_code
                               select new { b, a };
                    foreach (var emp in data)
                    {
                        emp.b.status = "MOBILIZATION";
                        emp.b.payScale = emp.a.PayScaleCode;
                        emp.b.payRange = emp.a.PayRanges.ToString();
                        emp.b.salary = emp.a.Salary;
                        emp.b.position = emp.a.NewRole;
                        _context.HREmployees.Update(emp.b);
                        var logStatus = new JsonLog
                        {
                            Code = emp.b.status,
                            Name = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(emp.b.status))?.ValueSet,
                            ObjectRelative = emp.a.DecisionNum,
                            ObjectType = EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement),
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            CreatedTime = DateTime.Now,
                        };
                        emp.b.ListStatus.Add(logStatus);
                        var logPayScale = new JsonLog
                        {
                            Code = emp.b.payScale,
                            Name = emp.b.payScale,
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            ObjectRelative = emp.a.DecisionNum,
                            ObjectType = EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement),
                            CreatedTime = DateTime.Now,
                        };
                        emp.b.ListPayScale.Add(logPayScale);
                        var logPayRange = new JsonLog
                        {
                            Code = emp.b.payRange,
                            Name = emp.b.payRange,
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            ObjectRelative = emp.a.DecisionNum,
                            ObjectType = EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement),
                            CreatedTime = DateTime.Now,
                        };
                        emp.b.ListPayRange.Add(logPayRange);
                        var employeeStatusTracking = new EmployeeStatusTracking
                        {
                            EmployeeCode = emp.b.employee_code,
                            StatusCode = logStatus.Code,
                            StartTime = emp.a.FromTime,
                            EndTime = emp.a.ToTime,
                            ObjectType = logStatus.ObjectType,
                        };
                        var logDepartment = new JsonLog
                        {
                            Code = emp.a.NewDepartCode,
                            Name = _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode.Equals(emp.a.NewDepartCode)).Title,
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            ObjectRelative = emp.a.DecisionNum,
                            ObjectType = EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement),
                            CreatedTime = DateTime.Now,
                        };
                        emp.b.ListDepartment.Add(logDepartment);
                        var logPosition = new JsonLog
                        {
                            Code = emp.a.NewRole,
                            Name = _context.Roles.FirstOrDefault(x => x.Id.Equals(emp.a.NewRole)).Title,
                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                            ObjectRelative = emp.a.DecisionNum,
                            ObjectType = EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.DecisionMovement),
                            CreatedTime = DateTime.Now,
                        };
                        emp.b.ListPosition.Add(logPosition);
                        _context.EmployeeStatusTrackings.Add(employeeStatusTracking);
                        _context.HREmployees.Update(emp.b);
                    }
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {

                throw;
            }
        }
        #endregion

        #region Detail
        [HttpPost]
        public JMessage InsertDetail([FromBody] ModelDetail obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var fromDate = !string.IsNullOrEmpty(obj.FromTime) ? DateTime.ParseExact(obj.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(obj.ToTime) ? DateTime.ParseExact(obj.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var data = _context.HREmployees.Where(x => x.flag == 1 && x.unit.Equals(obj.Unit));
                decimal salary = 0;
                var newRoleTitle = _context.Roles.FirstOrDefault(x => x.Id == obj.NewRole).Title;
                var careerCode = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.CareerName.Equals(newRoleTitle)).CareerCode;
                if (obj.Salary == 0)
                {
                    salary = (_context.PayScaleDetails.FirstOrDefault(x => !x.IsDeleted && x.CareerCode.Equals(careerCode) && x.Ranges.Equals(obj.PayRanges) && x.ScaleCode.Equals(obj.PayScale))).Salary;
                }
                else
                {
                    salary = obj.Salary;
                }
                if (data.Count() > 0)
                {
                    var header = _context.DecisionMovementHeaders.FirstOrDefault(x => !x.IsDeleted && x.DecisionNum.Equals(obj.DecisionNum));
                    if (header != null)
                    {
                        var listDetail = new List<DecisionMovementDetail>();
                        if (obj.UserinDepart == "")
                        {
                            foreach (var item in data)
                            {
                                var emp = _context.DecisionMovementDetails.FirstOrDefault(x => !x.IsDeleted && x.DecisionNum.Equals(obj.DecisionNum) && x.EmployeesCode.Equals(obj.UserinDepart));
                                if (emp == null)
                                {
                                    var detail = new DecisionMovementDetail
                                    {
                                        DecisionNum = obj.DecisionNum,
                                        EmployeesCode = item.employee_code,
                                        NewDepartCode = obj.NewDepartmentCode,
                                        NewRole = obj.NewRole,
                                        FromTime = fromDate,
                                        ToTime = toDate,
                                        PayScaleCode = obj.PayScale,
                                        PayRanges = obj.PayRanges,
                                        Salary = salary,
                                        ReasonMovement = obj.ReasonMovement,
                                        CreatedBy = ESEIM.AppContext.UserName,
                                        CreatedTime = DateTime.Now,
                                        IsDeleted = false,
                                    };
                                    listDetail.Add(detail);
                                    _context.DecisionMovementDetails.Add(detail);
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title += item.fullname + ", ";
                                }
                                _context.SaveChanges();
                                if (msg.Error == false)
                                {
                                    msg.Title = "Thêm thành công";
                                }
                                else
                                {
                                    msg.Title += "Đã tồn tại trong quyết định điều chuyển";
                                }
                            }
                        }
                        else
                        {
                            var item = _context.DecisionMovementDetails.FirstOrDefault(x => !x.IsDeleted && x.DecisionNum.Equals(obj.DecisionNum) && x.EmployeesCode.Equals(obj.UserinDepart));
                            if (item == null)
                            {
                                var detail = new DecisionMovementDetail
                                {
                                    DecisionNum = obj.DecisionNum,
                                    EmployeesCode = obj.UserinDepart,
                                    NewDepartCode = obj.NewDepartmentCode,
                                    NewRole = obj.NewRole,
                                    PayScaleCode = obj.PayScale,
                                    PayRanges = obj.PayRanges,
                                    Salary = salary,
                                    FromTime = fromDate,
                                    ToTime = toDate,
                                    ReasonMovement = obj.ReasonMovement,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                };
                                listDetail.Add(detail);
                                _context.DecisionMovementDetails.Add(detail);
                                _context.SaveChanges();
                                msg.Title = "Thêm thành công";
                            }
                            else
                            {
                                item.EmployeesCode = obj.UserinDepart;
                                item.NewDepartCode = obj.NewDepartmentCode;
                                item.NewRole = obj.NewRole;
                                item.PayScaleCode = obj.PayScale;
                                item.PayRanges = obj.PayRanges;
                                item.Salary = salary;
                                item.FromTime = fromDate;
                                item.ToTime = toDate;
                                item.ReasonMovement = obj.ReasonMovement;
                                item.UpdatedBy = ESEIM.AppContext.UserName;
                                item.UpdatedTime = DateTime.Now;
                                _context.DecisionMovementDetails.Update(item);
                                _context.SaveChanges();
                                msg.Title = "Cập nhật thành công";
                            }
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không lấy được thông tin quyết định";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Phòng ban không có nhân viên !";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm thất bại!";
            }
            return msg;
        }
        [HttpPost]
        public object DeleteDetail(int Id)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = _context.DecisionMovementDetails.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(Id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Chi tiết không tồn tại"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedTime = DateTime.Now;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    _context.DecisionMovementDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xóa thất bại!";
            }
            return Json(msg);
        }
        #endregion

        #region Combobox
        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.DecisionMovementHeaders.Where(x => !x.IsDeleted && x.DecisionNum.Equals(code)).Select(x => new
            {
                x.Status
            });
            return data;
        }
        [HttpPost]
        public JsonResult GetStatusAct()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                   .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetListPayScale()
        {
            var data = _context.PayScales.Where(x => !x.IsDeleted).DistinctBy(x => x.PayScaleCode)
                        .Select(x => new { Code = x.PayScaleCode });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetListCareer()
        {
            var data = _context.CategoryCareers.Where(x => !x.IsDeleted)
                        .Select(x => new { Code = x.CareerCode, Name = x.CareerName });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetListPayScaleDetail(string newRole, string code)
        {
            var newRoleTitle = _context.Roles.FirstOrDefault(x => x.Id == newRole).Title;
            var career = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.CareerName == newRoleTitle).CareerCode;
            var data = _context.PayScaleDetails.Where(x => !x.IsDeleted && x.CareerCode.Equals(career) && x.ScaleCode.Equals(code))
                        .Select(x => new { Code = x.ScaleCode, Ranges = x.Ranges, Salary = x.Salary });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetListRanges(string code, string ranges)
        {
            var data = _context.PayScaleDetails.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(ranges) || (x.ScaleCode.Equals(code) && x.Ranges.Equals(ranges))))
                        .Select(x => new { Code = x.ScaleCode, Ranges = x.Ranges, x.Salary });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetWorkFlow()
        {
            var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                .Select(x => new { Code = x.WfCode, Name = x.WfName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListDepartment()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.AdDepartments.Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        Code = x.DepartmentCode,
                        Name = x.Title
                    });
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetRole()
        {
            var data = from a in _context.Roles
                       join b in _context.CategoryCareers.Where(x => !x.IsDeleted)
                       on a.Title equals b.CareerName
                       select new
                       {
                           Code = a.Id,
                           Name = a.Title
                       };
            //.Select(x => new { Code = x.Id, Name = x.Title });
            return Json(data);
        }

        [HttpGet]
        public object GetUserDepartment(string code)
        {
            var data = _context.HREmployees.Where(x => x.flag == 1 && (x.unit.Equals(code) || string.IsNullOrEmpty(code)) && x.status != "END_CONTRACT").Select(x => new
            {
                Code = x.employee_code,
                Name = x.fullname,
                OldRole = x.position
            });
            return data;
        }

        [HttpPost]
        public object GetStatusDe()
        {
            var query = (from a in _context.DecisionMovementHeaders
                         join b in _context.CommonSettings on a.Status equals b.CodeSet
                         where a.IsDeleted == false
                         select new { a, b });
            var data = query.Select(x => new
            {
                Code = x.a.Status,
                Name = x.b.ValueSet,

            }).DistinctBy(x => x.Code);
            return data;
        }

        [HttpGet]
        public object GetliSigner()
        {
            var data = _context.DecisionMovementHeaders.Where(x => !x.IsDeleted && x.Status.Equals("STATUS_ACTIVITY_APPROVE_END")).Select(x => new
            {
                signer = x.ListStatus.Count > 0 && x.ListStatus.OrderByDescending(a => a.CreatedTime).FirstOrDefault().Code.Equals("STATUS_ACTIVITY_APPROVE_END") ? x.ListStatus.OrderByDescending(a => a.CreatedTime).FirstOrDefault().CreatedBy : ""
            }).Distinct();
            return data;
        }

        [HttpGet]
        public string GetDepartName(string departcode)
        {
            var title = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(departcode)).Title;
            if (title != null)
            {
                return title;
            }
            else
            {
                return "Không";
            }

        }

        [HttpGet]
        public string GetRoleName(string roleId)
        {
            var title = _context.Roles.FirstOrDefault(x => !x.Status && x.Id.Equals(roleId)).Title;
            if (title != null)
            {
                return title;
            }
            else
            {
                return "Không";
            }

        }

        [HttpGet]
        public object GetListActivityRepeat(string decisionNum)
        {
            var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(decisionNum));
            var lstAct = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(data.WfInstCode) && x.Status.Equals("STATUS_ACTIVITY_APPROVED"))
                        .Select(x => new
                        {
                            IntsCode = x.ActivityInstCode,
                            Code = x.ActivityCode,
                            Name = x.Title
                        });
            return lstAct;
        }
        #endregion

        #region Upload File
        public JsonResult CheckData([FromBody] ListHr data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                foreach (var temp in data.ListEmp)
                {
                    var rec = _context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.employee_code.Equals(temp.EmployeeCode) && x.unit.Equals(temp.DepartmentCode));
                    var checkdetail = _context.DecisionMovementDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeesCode.Equals(temp.EmployeeCode));
                    if (rec != null && checkdetail == null)
                    {

                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Nhân viên mã" + temp.EmployeeCode + " Không tồn tại hoặc không có trong phòng ban!";
                        return Json(msg);
                    }
                }
                msg.Title = "Dữ liệu hợp lệ";


            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }
        public JsonResult LogInfomation([FromBody] MovementDetail data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                data.DepartmentName = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(data.DepartmentCode)).Title;
                data.NewDepartName = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(data.NewDepartCode)).Title;
                data.EmployeeName = _context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.employee_code.Equals(data.EmployeeCode)).fullname;
                data.NewRoleName = _context.Roles.FirstOrDefault(x => x.Id.Equals(data.NewRole)).Title;
                msg.Object = data;
                msg.Title = "Cập nhật thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }
        public JsonResult InsertFromExcel([FromBody] ListHr data)
        {
            var msg = new JMessage() { Error = false, Title = "", Object = "" };
            try
            {
                foreach (var tem in data.ListEmp)
                {
                    var rec = _context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.employee_code.Equals(tem.EmployeeCode));
                    var checkdetail = _context.DecisionMovementDetails.FirstOrDefault(x => !x.IsDeleted && x.EmployeesCode.Equals(tem.EmployeeCode) && x.DecisionNum.Equals(tem.DecisionNum));
                    var fromTime = !string.IsNullOrEmpty(tem.FromTime) ? DateTime.ParseExact(tem.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var toTime = !string.IsNullOrEmpty(tem.ToTime) ? DateTime.ParseExact(tem.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    if (rec != null && checkdetail == null)
                    {
                        var move = new ModelDetail()
                        {
                            DecisionNum = tem.DecisionNum,
                            UserinDepart = tem.EmployeeCode,
                            NewDepartmentCode = tem.NewDepartCode,
                            NewRole = tem.NewRole,
                            PayScale = tem.PayScaleCode,
                            PayRanges = tem.PayRanges,
                            Salary = tem.Salary,
                            FromTime = tem.FromTime,
                            ToTime = tem.ToTime,
                        };
                        msg = InsertDetail(move);
                        if (msg.Error)
                        {
                            return Json(msg);
                        }
                    }
                    else if (rec == null)
                    {
                        msg.Error = true;
                        msg.Title = "Mã nhân viên " + tem.EmployeeCode + " không tồn tại !";
                        return Json(msg);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Mã nhân viên " + tem.EmployeeCode + " đã ở trong quyết định !";
                        return Json(msg);
                    }
                    msg.Title = "Thêm thành công";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }

        public class ValidateObject
        {
            public string EmployeeName { get; set; }
            public string EmployeeCode { get; set; }
            public string DepartmentCode { get; set; }
            public string NewDepartmentCode { get; set; }
            public string NewRoleName { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
            public string PayScaleCode { get; set; }
            public string PayRanges { get; set; }
            public string Salary { get; set; }
        }
        public JsonResult UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                List<MovementDetail> list = new List<MovementDetail>();
                if (fileUpload != null && fileUpload.Length > 0)
                {
                    ExcelEngine excelEngine = new ExcelEngine();
                    IApplication application = excelEngine.Excel;
                    IWorkbook workbook = application.Workbooks.Create();
                    workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                    if (!string.IsNullOrEmpty(ExcelController.docmodel.File_Path))
                    {
                        var pathTo = _hostingEnvironment.WebRootPath + ExcelController.docmodel.File_Path;
                        var fileStream = new FileStream(pathTo, FileMode.Open);
                        workbook = application.Workbooks.Open(fileStream);
                        fileStream.Close();
                    }
                    IWorksheet worksheet = workbook.Worksheets[0];
                    var user = _context.Users.FirstOrDefault(x => x.UserName.Equals(User.Identity.Name));
                    if (worksheet.Rows.Length > 1)
                    {
                        var title = worksheet.Rows[3].Cells;
                        if (
                            title[2].DisplayText.Trim() == "Số thẻ" &&
                            title[1].DisplayText.Trim() == "Họ và tên" &&
                            title[3].DisplayText.Trim() == "Đơn vị cũ" &&
                            title[4].DisplayText.Trim() == "Đơn vị mới" &&
                            title[5].DisplayText.Trim() == "Công việc mới" &&
                            title[6].DisplayText.Trim() == "Từ ngày" &&
                            title[7].DisplayText.Trim() == "Đến ngày" &&
                            title[8].DisplayText.Trim() == "Thang lương" &&
                            title[9].DisplayText.Trim() == "Bậc lương" &&
                            title[10].DisplayText.Trim() == "Mức lương"
                            )
                        {
                            var length = worksheet.Rows.Where(x => !string.IsNullOrEmpty(x.Cells[1].DisplayText)).Count();
                            var id = 0;

                            var decisionNumber = worksheet.GetValueRowCol(2, 7).ToString().Replace("\"", "").Trim();
                            var date = worksheet.GetValueRowCol(3, 5).ToString().Replace("\"", "").Trim();
                            if (date.Length == 1)
                                date = "0" + date;
                            var month = worksheet.GetValueRowCol(3, 7).ToString().Replace("\"", "").Trim();
                            if (month.Length == 1)
                                month = "0" + month;
                            var year = worksheet.GetValueRowCol(3, 9).ToString().Replace("\"", "").Trim();
                            if (string.IsNullOrEmpty(decisionNumber) || string.IsNullOrEmpty(date) || string.IsNullOrEmpty(month) || string.IsNullOrEmpty(year))
                            {
                                msg.Error = true;
                                msg.Title = "Vui lòng nhập đầy đủ số quyết định và ngày, tháng, năm !";
                                return Json(msg);
                            }

                            var header = new
                            {
                                DecisionNumber = decisionNumber,
                                DecisionDate = string.Format("{0}/{1}/{2}", date, month, year)
                            };

                            for (int i = 5; i <= length + 3; i++)
                            {
                                id++;

                                var validateObj = new ValidateObject();
                                validateObj.EmployeeName = worksheet.GetValueRowCol(i, 2).ToString().Replace("\"", "").Trim();
                                validateObj.EmployeeCode = worksheet.GetValueRowCol(i, 3).ToString().Replace("\"", "").Trim();
                                validateObj.DepartmentCode = worksheet.GetValueRowCol(i, 4).ToString().Replace("\"", "").Trim();
                                validateObj.NewDepartmentCode = worksheet.GetValueRowCol(i, 5).ToString().Replace("\"", "").Trim();
                                validateObj.NewRoleName = worksheet.GetValueRowCol(i, 6).ToString().Replace("\"", "").Trim();
                                validateObj.FromTime = worksheet.GetValueRowCol(i, 7).ToString().Replace("\"", "").Replace("'", "").Trim().Split(' ').First();
                                validateObj.ToTime = worksheet.GetValueRowCol(i, 8).ToString().Replace("\"", "").Replace("'", "").Trim().Split(' ').First();
                                validateObj.PayScaleCode = worksheet.GetValueRowCol(i, 9).ToString().Replace("\"", "").Trim();
                                validateObj.PayRanges = worksheet.GetValueRowCol(i, 10).ToString().Replace("\"", "").Replace("'", "").Trim();
                                validateObj.Salary = worksheet.GetValueRowCol(i, 11).ToString().Replace("\"", "").Trim();

                                msg = ValidateData(validateObj);
                                if (msg.Error)
                                {
                                    return Json(msg);
                                }

                                var obj = new MovementDetail();
                                obj.Id = id;
                                obj.DecisionNum = decisionNumber;
                                obj.DepartmentCode = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && (x.DepartmentCode.Equals(worksheet.GetValueRowCol(i, 4).ToString().Replace("\"", "").Trim()) || x.Title.Contains(worksheet.GetValueRowCol(i, 4).ToString().Replace("\"", "").Trim()))).DepartmentCode;
                                obj.DepartmentName = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && (x.DepartmentCode.Equals(worksheet.GetValueRowCol(i, 4).ToString().Replace("\"", "").Trim()) || x.Title.Contains(worksheet.GetValueRowCol(i, 4).ToString().Replace("\"", "").Trim()))).Title;
                                obj.EmployeeCode = worksheet.GetValueRowCol(i, 3).ToString().Replace("\"", "").Trim();
                                obj.EmployeeName = worksheet.GetValueRowCol(i, 2).ToString().Replace("\"", "").Trim();
                                obj.NewDepartCode = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && (x.DepartmentCode.Equals(worksheet.GetValueRowCol(i, 5).ToString().Replace("\"", "").Trim()) || x.Title.Contains(worksheet.GetValueRowCol(i, 5).ToString().Replace("\"", "").Trim()))).DepartmentCode;
                                obj.NewDepartName = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && (x.DepartmentCode.Equals(worksheet.GetValueRowCol(i, 5).ToString().Replace("\"", "").Trim()) || x.Title.Contains(worksheet.GetValueRowCol(i, 5).ToString().Replace("\"", "").Trim()))).Title;
                                obj.NewRole = _context.Roles.FirstOrDefault(x => x.Title.Contains(worksheet.GetValueRowCol(i, 6).ToString().Replace("\"", "").Trim())).Id;
                                obj.NewRoleName = worksheet.GetValueRowCol(i, 6).ToString().Replace("\"", "").Trim();
                                obj.PayScaleCode = worksheet.GetValueRowCol(i, 9).ToString().Replace("\"", "").Trim();
                                obj.PayRanges = validateObj.PayRanges;
                                obj.Salary = Convert.ToDecimal(worksheet.GetValueRowCol(i, 11).ToString().Replace("\"", "").Trim());
                                obj.FromTime = validateObj.FromTime;
                                obj.ToTime = validateObj.ToTime;
                                list.Add(obj);
                            }
                            msg.Object = new
                            {
                                Header = header,
                                Detail = list
                            };
                            msg.Title = "Đọc dữ liệu từ file Excel thành công!!";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "File excel không phù hợp!!!";

                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "File excel không có dữ liệu!!!";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File excel không có dữ liệu!!!";
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lỗi thêm file" + ex.Message;
            }
            return Json(msg);
        }
        public JMessage ValidateData(ValidateObject validateObj)
        {
            var msg = new JMessage() { };

            var checkEmployeeCode = _context.HREmployees.Any(x => x.flag == 1 && x.employee_code.Equals(validateObj.EmployeeCode));
            var checkEmployeeName = true;
            if (checkEmployeeCode)
            {
                checkEmployeeName = (_context.HREmployees.FirstOrDefault(x => x.flag == 1 && x.employee_code.Equals(validateObj.EmployeeCode)).fullname.Equals(validateObj.EmployeeName));
            }
            var checkDepartmentCode = _context.AdDepartments.Any(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(validateObj.DepartmentCode));
            var checkNewDepartmentCode = _context.AdDepartments.Any(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(validateObj.NewDepartmentCode));
            var checkNewRoleName = _context.Roles.Any(x => x.Title.Contains(validateObj.NewRoleName));
            var checkCareerCode = _context.CategoryCareers.Any(x => !x.IsDeleted && x.CareerName.Contains(validateObj.NewRoleName));
            var careerCode = "";
            if (checkCareerCode)
            {
                careerCode = _context.CategoryCareers.FirstOrDefault(x => !x.IsDeleted && x.CareerName.Contains(validateObj.NewRoleName)).CareerCode;
            }
            var checkPayScaleCode = (_context.PayScales.Any(x => !x.IsDeleted && x.PayScaleCode.Equals(validateObj.PayScaleCode) && x.CareerCode.Equals(careerCode)));
            var checkPayRanges = true;
            var checkPaySalary = true;
            if (checkPayScaleCode)
            {
                var listPayScaleDetail = _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(validateObj.PayScaleCode) && x.CareerCode.Equals(careerCode));
                checkPayRanges = listPayScaleDetail.Any(x => x.Ranges.Equals(validateObj.PayRanges));
                if (checkPayRanges)
                {
                    checkPaySalary = listPayScaleDetail.FirstOrDefault(x => x.Ranges.Equals(validateObj.PayRanges)).Salary.ToString().Equals(validateObj.Salary);
                }
            }

            if (!checkEmployeeCode)
            {
                msg.Title = "Mã nhân viên " + validateObj.EmployeeCode + " không tồn tại trong hệ thống";
                msg.Error = true;
                return msg;
            }
            if (!checkEmployeeName)
            {
                msg.Title = "Tên nhân viên " + validateObj.EmployeeName + " không khớp với mã nhân viên " + validateObj.EmployeeCode;
                msg.Error = true;
                return msg;
            }
            if (!checkDepartmentCode)
            {
                msg.Title = "Mã phòng ban " + validateObj.DepartmentCode + " không tồn tại trong hệ thống";
                msg.Error = true;
                return msg;
            }
            if (!checkNewDepartmentCode)
            {
                msg.Title = "Mã phòng ban mới " + validateObj.NewDepartmentCode + " không tồn tại trên hệ thống";
                msg.Error = true;
                return msg;
            }
            if (!checkNewRoleName)
            {
                msg.Title = "Công việc mới " + validateObj.NewRoleName + " không tồn tại trên hệ thống";
                msg.Error = true;
                return msg;
            }
            if (!checkCareerCode)
            {
                msg.Title = "Công việc mới " + validateObj.NewRoleName + " không tồn tại trong danh sách nghề nghiệp";
                msg.Error = true;
                return msg;
            }
            if (!checkPayScaleCode)
            {
                msg.Title = "Thang lương " + validateObj.PayScaleCode + " không khớp với nghề nghiệp " + validateObj.NewRoleName;
                msg.Error = true;
                return msg;
            }
            if (!checkPayRanges)
            {
                msg.Title = "Bậc lương \"" + validateObj.PayRanges + "\" không tồn tại trong thang lương " + validateObj.PayScaleCode;
                msg.Error = true;
                return msg;
            }
            decimal result;
            if (!Decimal.TryParse(validateObj.Salary, out result))
            {
                msg.Title = "Mức lương " + validateObj.Salary + " không hợp lệ";
                msg.Error = true;
                return msg;
            }
            if (!checkPaySalary)
            {
                msg.Title = "Mức lương " + validateObj.Salary + " không khớp với thang lương \"" + validateObj.PayRanges + "\" của bậc lương " + validateObj.PayScaleCode + " và nghề nghiệp " + validateObj.NewRoleName;
                msg.Error = true;
                return msg;
            }
            DateTime fromTime;
            if (!DateTime.TryParseExact(validateObj.FromTime, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out fromTime))
            {
                msg.Title = "Từ ngày " + validateObj.FromTime + " không đúng định dạng";
                msg.Error = true;
                return msg;
            }

            if (!string.IsNullOrEmpty(validateObj.ToTime))
            {
                DateTime toTime;
                if (!DateTime.TryParseExact(validateObj.ToTime, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out toTime))
                {
                    msg.Title = "Đến ngày " + validateObj.ToTime + " không đúng định dạng";
                    msg.Error = true;
                    return msg;
                }
            }

            return msg;
        }
        #endregion

        #region Xuat File
        [HttpGet]
        public ActionResult ExportReport(string code)
        {
            string sourcePath = string.Concat(_hostingEnvironment.WebRootPath, "/files/Template/TCLD/dieudong/download");
            try
            {
                var query = _context.DecisionMovementHeaders.FirstOrDefault(x => !x.IsDeleted && x.DecisionNum.Equals(code));
                var data = from b in _context.DecisionMovementDetails.Where(x => !x.IsDeleted && x.DecisionNum.Equals(code))
                           join c in _context.HREmployees.Where(x => x.flag == 1) on b.EmployeesCode equals c.employee_code
                           select new
                           {
                               Code = c.Id,
                               Name = c.fullname,
                               FromTime = !string.IsNullOrEmpty(b.FromTime.ToString()) ? b.FromTime.Value.ToString("dd/MM/yyyy") : "____________",
                               ToTime = !string.IsNullOrEmpty(b.FromTime.ToString()) ? b.ToTime.Value.ToString("dd/MM/yyyy") : "____________",
                               OldDepart = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(c.unit)).Title,
                               OldRole = _context.Roles.FirstOrDefault(x => x.Status && x.Id.Equals(c.position)).Title,
                               NewDepart = _context.AdDepartments.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.DepartmentCode.Equals(b.NewDepartCode)).Title,
                               NewRole = _context.Roles.FirstOrDefault(x => x.Status && x.Id.Equals(b.NewRole)).Title,
                               PayScaleCode = b.PayScaleCode,
                               PayRanges = b.PayRanges,
                               Salary = b.Salary,
                               b.ReasonMovement,
                           };
                string[] filePaths = Directory.GetFiles(sourcePath);
                foreach (string file in filePaths)
                {
                    System.IO.File.Delete(file);
                }
                string fileName = string.Concat(_hostingEnvironment.WebRootPath, "/files/Template/TCLD/dieudong/nhieunguoi/dieudong-template.docx");
                byte[] byteArray = System.IO.File.ReadAllBytes(fileName);
                using (MemoryStream stream = new MemoryStream())
                {

                    stream.Write(byteArray, 0, byteArray.Length);
                    using (var doc = WordprocessingDocument.Open(stream, true))
                    {
                        string savePath = "";
                        string docText = null;
                        using (StreamReader sr = new StreamReader(doc.MainDocumentPart.GetStream()))
                        {
                            docText = sr.ReadToEnd();
                        }

                        string Flocation = "/files/Template/TCLD/dieudong/download/quyet-dinh-dieu-dong";


                        Regex regexText = new Regex("%soquyetdinh%");
                        docText = regexText.Replace(docText, query.DecisionNum);

                        regexText = new Regex("%ngayquyetdinh%");
                        docText = regexText.Replace(docText, query.UpdatedTime.Value.ToString("dd/MM/yyyy"));



                        using (StreamWriter sw = new StreamWriter(doc.MainDocumentPart.GetStream(FileMode.Create)))
                        {
                            sw.Write(docText);
                        }
                        Table table = doc.MainDocumentPart.Document.Body.Elements<Table>().ElementAt(2);
                        int i = 1;
                        foreach (var ix in data)
                        {

                            TableRow tr = new TableRow();

                            TableCell tc1 = new TableCell();
                            tc1.Append(new Paragraph(new Run(new Text(i.ToString()))));
                            tr.Append(tc1);

                            TableCell tc2 = new TableCell();
                            tc2.Append(new Paragraph(new Run(new Text(ix.Name))));
                            tr.Append(tc2);

                            TableCell tc3 = new TableCell();
                            tc3.Append(new Paragraph(new Run(new Text(ix.Code.ToString()))));
                            tr.Append(tc3);

                            TableCell tc4 = new TableCell();
                            tc4.Append(new Paragraph(new Run(new Text(ix.OldDepart))));
                            tr.Append(tc4);

                            TableCell tc5 = new TableCell();
                            tc5.Append(new Paragraph(new Run(new Text(ix.NewDepart))));
                            tr.Append(tc5);

                            TableCell tc6 = new TableCell();
                            tc6.Append(new Paragraph(new Run(new Text(ix.OldRole))));
                            tr.Append(tc6);

                            TableCell tc7 = new TableCell();
                            tc7.Append(new Paragraph(new Run(new Text(ix.NewRole))));
                            tr.Append(tc7);

                            TableCell tc8 = new TableCell();
                            tc8.Append(new Paragraph(new Run(new Text(ix.PayScaleCode))));
                            tr.Append(tc8);

                            TableCell tc9 = new TableCell();
                            tc9.Append(new Paragraph(new Run(new Text(ix.Salary.ToString("N0")))));
                            tr.Append(tc9);

                            TableCell tc10 = new TableCell();
                            tc9.Append(new Paragraph(new Run(new Text(ix.Salary.ToString("N0")))));
                            tr.Append(tc10);

                            TableCell tc11 = new TableCell();
                            tc11.Append(new Paragraph(new Run(new Text(ix.ReasonMovement))));
                            tr.Append(tc11);

                            table.Append(tr);
                            doc.MainDocumentPart.Document.Save();
                            i++;
                        }
                        Flocation += ".docx";
                        savePath = string.Concat(_hostingEnvironment.WebRootPath, Flocation);
                        stream.Position = 0;
                        doc.Close();
                        System.IO.File.WriteAllBytes(savePath, stream.ToArray());
                    }
                }
                var memory = new MemoryStream();
                using (var stream = new FileStream(sourcePath + "/quyet-dinh-dieu-dong.docx", FileMode.Open))
                {
                    stream.CopyTo(memory);
                }
                memory.Position = 0;
                var ext = System.IO.Path.GetExtension(sourcePath).ToLowerInvariant();
                return File(memory, "application/vnd.ms-excel", System.IO.Path.GetFileName(sourcePath + "/quyet-dinh-dieu-dong.docx"));
            }
            catch (Exception e)
            {
                return null;
            }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerMd.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_workflowActivityController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class JTableModelCustom : JTableModel
        {
            public string DecisionNum { get; set; }
        }
        public class JTableModelMobilizationDecision : JTableModel
        {
            public string DecisionNum { get; set; }
            public string AprovedBy { get; set; }
            public string Status { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CodeEmployee { get; set; }
        }
        public class JTableModelPayDecisionDetail : JTableModel
        {
            public string DecisionNum { get; set; }
            public string EmloyeeCode { get; set; }
            public string Carerr { get; set; }
            public string ChucDanh { get; set; }
            public string PayScaleCode { get; set; }
            public string PayRanges { get; set; }
        }
        public class DMHModel
        {
            public string DecisionNum { get; set; }
            public string Title { get; set; }
            public string WorkflowCat { get; set; }
            public string Noted { get; set; }
            public string Status { get; set; }
            public bool Flag { get; set; }
            public string ActRepeat { get; set; }

        }
        public class JSModel
        {
            public string StatusCode { get; set; }
            public string CreatedBy { get; set; }
            public string StatusName { get; set; }
            public DateTime CreatedTime { get; set; }
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
        public class ModelDetail
        {
            public string DecisionNum { get; set; }
            public string Unit { get; set; }
            public string UserinDepart { get; set; }
            public string NewDepartmentCode { get; set; }
            public string NewRole { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
            public string PayScale { get; set; }
            public string PayRanges { get; set; }
            public decimal Salary { get; set; }
            public string ReasonMovement { get; set; }
        }
        public class ComboxModel
        {
            public string IntsCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string UpdateTime { get; set; }
            public string UpdateBy { get; set; }
        }
        public class HrModel
        {
            public string PlanNumber { get; set; }
            public string EmployeeCode { get; set; }

            public string EmployeeName { get; set; }
            public string sBirthdate { get; set; }
            public int Gender { get; set; }
            public string DepartmentCode { get; set; }
            public string PhoneNumber { get; set; }
            public string IdentityCard { get; set; }
            public string ExpYears { get; set; }

        }
        public class ListHr
        {
            public List<MovementDetail> ListEmp { get; set; }
        }
        public class UltraData
        {
            public string DecisionNum { get; set; }
        }
        public class MovementDetail
        {
            public int Id { get; set; }
            public string DecisionNum { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }
            public string NewDepartCode { get; set; }
            public string NewDepartName { get; set; }
            public string NewRole { get; set; }
            public string NewRoleName { get; set; }
            public string PayScaleCode { get; set; }
            public string PayRanges { get; set; }
            public decimal Salary { get; set; }
            public string ReasonMovement { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
        }
        #endregion
    }
}