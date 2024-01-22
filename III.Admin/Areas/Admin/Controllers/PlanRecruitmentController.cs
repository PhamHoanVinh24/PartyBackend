using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
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
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Internal;
using static III.Admin.Controllers.MaterialProductController;
using System.Text.RegularExpressions;
using System.IO.Compression;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Color = Syncfusion.Drawing.Color;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class PlanRecruitmentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<PlanRecruitmentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public PlanRecruitmentController(EIMDBContext context, IStringLocalizer<PlanRecruitmentController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment, IGoogleApiService googleAPI, IParameterService parameterService,
            IUploadService upload)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
        }
        [Breadcrumb("ViewData.PlanRecruitment", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["PlanRecruitment"] = _stringLocalizer["PR_PLAN_RECRUITMENT"];

            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody]PlanRecruitmentModel jTablePara)
        {
            var fromdate = !string.IsNullOrEmpty(jTablePara.FromDate) ? (DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)) : (DateTime?)null;
            var todate = !string.IsNullOrEmpty(jTablePara.ToDate) ? (DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture)) : (DateTime?)null;
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PlanRecruitmentHeaders
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals c.DepartmentCode into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.PlanType equals e.CodeSet into e1
                        from e in e1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.PlanNumber) || (a.PlanNumber.ToLower().Contains(jTablePara.PlanNumber.ToLower()) || a.Title.ToLower().Contains(jTablePara.PlanNumber.ToLower()))) &&
                              (string.IsNullOrEmpty(jTablePara.PlanType) || a.PlanType.Equals(jTablePara.PlanType)) &&
                              (string.IsNullOrEmpty(jTablePara.DepartmentCode) || a.DepartmentCode.Equals(jTablePara.DepartmentCode)) &&
                              (fromdate == null || (a.CreatedTime.HasValue && fromdate <= a.CreatedTime.Value.Date)) &&
                              (todate == null || (a.CreatedTime.HasValue && todate >= a.CreatedTime.Value.Date)) &&
                              (!a.IsDeleted && !string.IsNullOrEmpty(a.PlanNumber))
                        select new
                        {
                            a.Id,
                            a.PlanNumber,
                            a.Title,
                            a.WorkflowCat,
                            a.DepartmentCode,
                            DepartmentName = c != null ? c.Title : "",
                            Status = d != null ? d.ValueSet : "",
                            PlanType = e != null ? e.ValueSet : "",
                            a.Note,
                            a.UserCreated,
                            PlanDate = a.PlanDate.HasValue ? a.PlanDate.Value.ToString("dd/MM/yyyy") : ""
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "PlanNumber", "Title", "WorkflowCat", "DepartmentCode", "DepartmentName", "Status", "PlanType", "Note", "UserCreated", "PlanDate");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableDetail([FromBody]DetailJtable jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PlanRecruitmentDetails
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Specialize equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Level equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        where (a.PlanNumber == jTablePara.PlanNumber && !a.IsDeleted)
                        select new
                        {
                            a.Id,
                            a.PlanNumber,
                            SpecializeName = b != null ? b.ValueSet : "",
                            LevelName = c != null ? c.ValueSet : "",
                            a.Specialize,
                            a.Tier,
                            a.Level,
                            a.Position,
                            a.Age,
                            a.Gender,
                            a.YearOfExperience,
                            a.Local,
                            a.Quantity
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "PlanNumber", "Position", "Age", "Gender", "Level", "LevelName", "Specialize", "SpecializeName", "YearOfExperience", "Tier", "Local", "Quantity");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableAttributeMore([FromBody]DetailJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CriteriaRecruimentAttrDatas
                        join b in _context.CriteriaRecruitmentCats on a.AttrCode equals b.Code into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.PlanNumber == jTablePara.PlanNumber
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            AttrName = b2 != null ? b2.Name : "",
                            a.AttrValue,
                            a.CreatedTime,
                            Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                            Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                            DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                            Parent = b2 != null ? _context.CriteriaRecruitmentCats.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.CriteriaRecruitmentCats.FirstOrDefault(x => x.Code.Equals(b2.Parent)).Name : "" : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");

            return Json(jdata);
        }
        #endregion

        #region Header
        [HttpPost]
        public object Insert([FromBody]PlanRecruitmentHeader data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.PlanNumber == data.PlanNumber && !x.IsDeleted);
                if (model == null)
                {
                    var planDate = !string.IsNullOrEmpty(data.sPlanDate) ? DateTime.ParseExact(data.sPlanDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var status = new JsonStatus
                    {
                        StatusCode = data.Status,
                        CreatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName,
                        StatusName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(data.Status)).ValueSet,
                        CreatedTime = DateTime.Now,
                    };

                    data.ListStatus.Add(status);

                    var logData = new LogData
                    {
                        Header = JsonConvert.SerializeObject(data)
                    };

                    //data.ListLogData.Add(logData);

                    data.PlanDate = planDate;
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;

                    _context.PlanRecruitmentHeaders.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    msg.ID = data.Id;
                }
                else
                {
                    DeleteWorkFlowInstance(data.PlanNumber);
                    msg.Title = _stringLocalizer["PR_MSG_PLAN_NUMBER_EXIT"];
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
            var data = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            data.sPlanDate = data.PlanDate.HasValue ? data.PlanDate.Value.ToString("dd/MM/yyyy") : "";

            var list = new List<ComboxModel>();
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.PlanNumber) && x.ObjectType.Equals(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.PlanRecruitment)));
            if (check != null)
            {
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
        public object GetItemHeaderWithCode(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.PlanNumber.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.PlanNumber));
            var value = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode));
            var current = check.MarkActCurrent;
            var initial = value.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL"));
            var name = new ComboxModel
            {
                IntsCode = initial.ActivityInstCode,
                Code = initial.ActivityCode,
                Name = initial.Title,
                Status = initial.Status,
                UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy != null ?
                           _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedBy)).GivenName : null,
                UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(initial.ActivityInstCode)).UpdatedTime.ToString()
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
                        UpdateBy = _context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy != null ?
                                        _context.Users.FirstOrDefault(x => x.UserName.Equals(_context.ActivityInstances.FirstOrDefault(a => !a.IsDeleted && a.WorkflowCode.Equals(check.WfInstCode) && a.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedBy)).GivenName : null,
                        UpdateTime = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode.Equals(check.WfInstCode) && x.ActivityInstCode.Equals(inti.ActivityInstCode)).UpdatedTime.ToString()
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
            var role = value.FirstOrDefault(x => x.ActivityInstCode.Equals(check.MarkActCurrent)).ActivityCode;
            var user = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(role) && x.UserId.Equals(ESEIM.AppContext.UserId));
            var hh = "";
            if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_INITIAL")) != null)
            {
                hh = "TYPE_ACTIVITY_INITIAL";
            }
            else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_REPEAT")) != null)
            {
                hh = "TYPE_ACTIVITY_REPEAT";
            }
            else if (value.FirstOrDefault(x => !x.Status.Equals("STATUS_ACTIVITY_APPROVED") && x.Type.Equals("TYPE_ACTIVITY_END")) != null)
            {
                hh = "TYPE_ACTIVITY_END";
            }
            if (user != null)
            {
                if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                {
                    var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                       .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    return new { data, com, editrole = true, list, current };

                }
                if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                {
                    var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                       .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    return new { data, com, editrole = true, list, current };
                }
                if (hh.Equals("TYPE_ACTIVITY_END"))
                {
                    var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                       .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    return new { data, com, editrole = true, list, current };
                }
                else { return data; }
            }
            else
            {
                if (hh.Equals("TYPE_ACTIVITY_INITIAL"))
                {
                    var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                       .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    return new { data, com, editrole = false, list, current };
                }
                if (hh.Equals("TYPE_ACTIVITY_REPEAT"))
                {
                    var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFREPEAT)))
                       .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    return new { data, com, editrole = false, list, current };
                }
                if (hh.Equals("TYPE_ACTIVITY_END"))
                {
                    var com = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWFFINAL)))
                       .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    return new { data, com, editrole = false, list, current };
                }
                else { return data; }
            }
        }

        [HttpPost]
        public object GetListRepeat(string code)
        {
            List<ComboxModel> list = new List<ComboxModel>();
            var data = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.PlanNumber.Equals(code) && !x.IsDeleted);
            var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(data.PlanNumber));
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
        public object Update([FromBody]PlanRecruitmentHeader obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.PlanNumber == obj.PlanNumber && !x.IsDeleted);
                if (data != null)
                {
                    var countDetail = _context.PlanRecruitmentDetails.Count(x => !x.IsDeleted && x.PlanNumber.Equals(obj.PlanNumber));
                    if (countDetail == 0)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PR_MSG_PLEASE_INPUT_DETAIL"];
                        return msg;
                    }

                    var planDate = !string.IsNullOrEmpty(obj.sPlanDate) ? DateTime.ParseExact(obj.sPlanDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var updatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName;

                    if (obj.Status != data.Status)
                    {
                        var status = new JsonStatus
                        {
                            StatusCode = obj.Status,
                            CreatedBy = updatedBy,
                            StatusName = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(obj.Status)).ValueSet,
                            CreatedTime = DateTime.Now,
                        };

                        data.ListStatus.Add(status);
                        data.Status = obj.Status;
                    }

                    data.JsonData = CommonUtil.JsonData(data, obj, data.JsonData, updatedBy);
                    data.PlanNumber = obj.PlanNumber;
                    data.PlanType = obj.PlanType;
                    data.Title = obj.Title;
                    data.Note = obj.Note;
                    data.WorkflowCat = obj.WorkflowCat;
                    data.DepartmentCode = obj.DepartmentCode;
                    data.UserCreated = obj.UserCreated;
                    data.PlanDate = planDate;
                    data.UpdatedBy = User.Identity.Name;
                    data.UpdatedTime = DateTime.Now;
                    _context.PlanRecruitmentHeaders.Update(data);
                    _context.SaveChanges();

                    if (obj.Status.Equals("INITIAL_DONE") || obj.Status.Equals("INITIAL_WORKING"))
                    {
                        var secsion = HttpContext.GetSessionUser();
                        var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(obj.PlanNumber));
                        var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                        var current_act = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));
                        var check = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(current_act.ActivityCode));
                        var next = acts.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(check.ActivityDestination)).ActivityInstCode;

                        var assigns = _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                        if (assigns.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId)) || secsion.IsAllData || current_act.CreatedBy.Equals(secsion.UserName))
                        {
                            if (obj.Status.Equals("INITIAL_DONE"))
                            {
                                if (current_act.Type.Equals("TYPE_ACTIVITY_INITIAL"))
                                {
                                    current_act.Status = "STATUS_ACTIVITY_APPROVED";
                                    current_act.UpdatedBy = User.Identity.Name;
                                    current_act.UpdatedTime = DateTime.Now;
                                    des.MarkActCurrent = next;
                                    var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial == current_act.ActivityInstCode);
                                    var lstActInst = new List<ActivityInstance>();
                                    if (runnings.Any())
                                    {
                                        var files = _context.ActivityInstFiles.Where(x => !x.IsDeleted && x.ActivityInstCode == current_act.ActivityInstCode);
                                        foreach (var item in runnings)
                                        {
                                            var lstCommand = new List<JsonCommand>();
                                            if (!string.IsNullOrEmpty(item.Command))
                                            {
                                                lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                            }
                                            lstCommand[lstCommand.Count - 1].Approved = "APPROVE_COMMAND_Y";
                                            lstCommand[lstCommand.Count - 1].ApprovedBy = ESEIM.AppContext.UserName;
                                            lstCommand[lstCommand.Count - 1].ApprovedTime = DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                            item.Command = JsonConvert.SerializeObject(lstCommand);
                                            _context.WorkflowInstanceRunnings.Update(item);

                                            var actDes = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode == item.ActivityDestination);
                                            if (actDes != null)
                                            {
                                                //actDes.IsLock = false;
                                                actDes.Status = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DoActInst);
                                                actDes.StartTime = DateTime.Now;
                                                _context.ActivityInstances.Update(actDes);
                                                lstActInst.Add(actDes);
                                            }
                                        }
                                        var confirms = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityDestination == current_act.ActivityInstCode);
                                        if (confirms.Any())
                                        {
                                            foreach (var item in confirms)
                                            {
                                                var lstCommand = new List<JsonCommand>();

                                                lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                                lstCommand[lstCommand.Count - 1].Confirmed = "CONFIRM_COMMAND_Y";
                                                lstCommand[lstCommand.Count - 1].ConfirmedBy = ESEIM.AppContext.UserName;
                                                lstCommand[lstCommand.Count - 1].ConfirmedTime = DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                                item.Command = JsonConvert.SerializeObject(lstCommand);
                                                _context.WorkflowInstanceRunnings.Update(item);
                                            }
                                        }
                                    }
                                }
                            }
                            else if (obj.Status.Equals("INITIAL_WORKING"))
                            {
                                current_act.Status = "STATUS_ACTIVITY_DO";
                            }
                            _context.ActivityInstances.Update(current_act);
                        }
                    }
                    if (obj.Status.Equals("REPEAT_DONE") || obj.Status.Equals("REPEAT_WORKING"))
                    {
                        var secsion = HttpContext.GetSessionUser();
                        var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(obj.PlanNumber));
                        var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                        var current_act = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));
                        var check = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial.Equals(current_act.ActivityCode));
                        var next = acts.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(check.ActivityDestination)).ActivityInstCode;
                        var assigns = _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                        if (assigns.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId)) || secsion.IsAllData || current_act.CreatedBy.Equals(secsion.UserName))
                        {
                            if (obj.Status.Equals("REPEAT_DONE"))
                            {
                                if (current_act.Type.Equals("TYPE_ACTIVITY_REPEAT"))
                                {
                                    current_act.Status = "STATUS_ACTIVITY_APPROVED";
                                    current_act.UpdatedBy = User.Identity.Name;
                                    current_act.UpdatedTime = DateTime.Now;
                                    des.MarkActCurrent = next;
                                    var runnings = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial == current_act.ActivityInstCode);
                                    var lstActInst = new List<ActivityInstance>();
                                    if (runnings.Any())
                                    {
                                        var files = _context.ActivityInstFiles.Where(x => !x.IsDeleted && x.ActivityInstCode == current_act.ActivityInstCode);
                                        foreach (var item in runnings)
                                        {
                                            var lstCommand = new List<JsonCommand>();
                                            if (!string.IsNullOrEmpty(item.Command))
                                            {
                                                lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                            }
                                            lstCommand[lstCommand.Count - 1].Approved = "APPROVE_COMMAND_Y";
                                            lstCommand[lstCommand.Count - 1].ApprovedBy = ESEIM.AppContext.UserName;
                                            lstCommand[lstCommand.Count - 1].ApprovedTime = DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                            item.Command = JsonConvert.SerializeObject(lstCommand);
                                            _context.WorkflowInstanceRunnings.Update(item);

                                            var actDes = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode == item.ActivityDestination);
                                            if (actDes != null)
                                            {
                                                //actDes.IsLock = false;
                                                actDes.Status = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DoActInst);
                                                actDes.StartTime = DateTime.Now;
                                                _context.ActivityInstances.Update(actDes);
                                                lstActInst.Add(actDes);
                                            }
                                        }
                                        var confirms = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityDestination == current_act.ActivityInstCode);
                                        if (confirms.Any())
                                        {
                                            foreach (var item in confirms)
                                            {
                                                var lstCommand = new List<JsonCommand>();

                                                lstCommand = JsonConvert.DeserializeObject<List<JsonCommand>>(item.Command);
                                                lstCommand[lstCommand.Count - 1].Confirmed = "CONFIRM_COMMAND_Y";
                                                lstCommand[lstCommand.Count - 1].ConfirmedBy = ESEIM.AppContext.UserName;
                                                lstCommand[lstCommand.Count - 1].ConfirmedTime = DateTime.Now.ToString("HH:mm dd/MM/yyyy");

                                                item.Command = JsonConvert.SerializeObject(lstCommand);
                                                _context.WorkflowInstanceRunnings.Update(item);
                                            }
                                        }
                                    }
                                    else
                                    {

                                    }
                                }

                            }
                            else if (obj.Status.Equals("REPEAT_WORKING"))
                            {
                                current_act.Status = "STATUS_ACTIVITY_DO";
                            }
                            _context.ActivityInstances.Update(current_act);
                        }

                    }
                    if (obj.Status.Equals("FINAL_DONE") || obj.Status.Equals("FINAL_WORKING"))
                    {
                        var secsion = HttpContext.GetSessionUser();
                        var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(obj.PlanNumber));
                        var acts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(des.WfInstCode));
                        var current_act = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(des.MarkActCurrent));

                        var assigns = _context.ExcuterControlRoleInsts.Where(x => !x.IsDeleted && x.ActivityCodeInst.Equals(current_act.ActivityInstCode));
                        if (assigns.Any(x => x.UserId.Equals(ESEIM.AppContext.UserId)) || secsion.IsAllData || current_act.CreatedBy.Equals(secsion.UserName))
                        {
                            if (obj.Status.Equals("FINAL_DONE"))
                            {
                                if (current_act.Type.Equals("TYPE_ACTIVITY_END"))
                                {
                                    current_act.Status = "STATUS_ACTIVITY_APPROVE_END";
                                    current_act.UpdatedBy = User.Identity.Name;
                                    current_act.UpdatedTime = DateTime.Now;
                                    var wf = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WfInstCode.Equals(current_act.WorkflowCode));
                                    if (wf != null)
                                    {
                                        wf.EndTime = DateTime.Now;
                                        wf.Status = "Hoàn thành";
                                        _context.WorkflowInstances.Update(wf);
                                    }
                                }
                            }
                            else if (obj.Status.Equals("FINAL_WORKING"))
                            {
                                current_act.Status = "STATUS_ACTIVITY_DO";
                            }
                            _context.ActivityInstances.Update(current_act);
                        }

                    }
                    if (obj.Status.Equals("REPEAT_REQUIRE_REWORK") || obj.Status.Equals("FINAL_REQUIRE_REWORK"))
                    {
                        var secsion = HttpContext.GetSessionUser();
                        var des = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(obj.PlanNumber));

                        var repeat = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(obj.ActRepeat));
                        repeat.Status = "STATUS_ACTIVITY_DO";
                        des.MarkActCurrent = repeat.ActivityInstCode;
                        _context.ActivityInstances.Update(repeat);
                        _context.WorkflowInstances.Update(des);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PR_MSG_PLAN_NUMBER_EXIT"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];

            }
            return msg;
        }

        [HttpPost]
        public object Delete([FromBody]int Id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.Id == Id && x.IsDeleted == false);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PR_MSG_PLAN_NUMBER_NOT_EXIT"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.PlanRecruitmentHeaders.Update(data);

                    var data1 = _context.PlanRecruitmentDetails.Where(x => !x.IsDeleted && x.PlanNumber.Equals(data.PlanNumber));

                    foreach (var item in data1)
                    {
                        item.DeletedBy = ESEIM.AppContext.UserName;
                        item.DeletedTime = DateTime.Now;
                        item.IsDeleted = true;
                        _context.PlanRecruitmentDetails.Update(item);
                    }

                    DeleteWorkFlowInstance(data.PlanNumber);

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                return msg;
            }
        }

        [NonAction]
        public void DeleteWorkFlowInstance(string objCode)
        {
            var data2 = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(objCode) && x.ObjectType.Equals(EnumHelper<WfObjectType>.GetDisplayValue(WfObjectType.PlanRecruitment)));
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
        public object GetJsonData(string code)
        {
            var msg = new JMessage { Title = "", Error = false };
            var header = _context.PlanRecruitmentHeaders.FirstOrDefault(x => !x.IsDeleted && x.PlanNumber.Equals(code));
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
                    Data = !string.IsNullOrEmpty(header.StatusLog) ? JsonConvert.DeserializeObject<List<object>>(header.StatusLog) : new List<object>()
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

        #region Detail
        [HttpPost]
        public object InsertDetail([FromBody]PlanRecruitmentDetail data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var detail = _context.PlanRecruitmentDetails.FirstOrDefault(x => x.PlanNumber == data.PlanNumber && x.Position.Equals(data.Position) && !x.IsDeleted);
                var header = _context.PlanRecruitmentHeaders.FirstOrDefault(x => !x.IsDeleted && x.PlanNumber.Equals(data.PlanNumber));
                if (header != null)
                {
                    if (detail == null)
                    {
                        data.CreatedBy = User.Identity.Name;
                        data.CreatedTime = DateTime.Now;

                        _context.PlanRecruitmentDetails.Add(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                        msg.ID = data.Id;
                    }
                    else
                    {
                        var updatedBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(ESEIM.AppContext.UserName)).GivenName;
                        header.JsonData = CommonUtil.JsonData(detail, data, header.JsonData, updatedBy);

                        detail.Position = data.Position;
                        detail.Age = data.Age;
                        detail.Gender = data.Gender;
                        detail.Level = data.Level;
                        detail.Specialize = data.Specialize;
                        detail.YearOfExperience = data.YearOfExperience;
                        detail.Tier = data.Tier;
                        detail.Local = data.Local;
                        detail.Quantity = data.Quantity;
                        detail.UpdatedBy = User.Identity.Name;
                        detail.UpdatedTime = DateTime.Now;
                        _context.PlanRecruitmentDetails.Update(detail);
                        _context.PlanRecruitmentHeaders.Update(header);
                        _context.SaveChanges();

                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }

                    _context.PlanRecruitmentHeaders.Update(header);
                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PR_MSG_HEDER_NOT_FOUND"];
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
        public object DeleteDetail(int Id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PlanRecruitmentDetails.FirstOrDefault(x => x.Id == Id && !x.IsDeleted);
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PR_MSG_DETAIL_NOT_EXIT"];
                }
                else
                {
                    var header = _context.PlanRecruitmentHeaders.FirstOrDefault(x => !x.IsDeleted && x.PlanNumber.Equals(data.PlanNumber));
                    if (header != null)
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = User.Identity.Name;
                        data.DeletedTime = DateTime.Now;

                        var logData = new LogData
                        {
                            Header = JsonConvert.SerializeObject(header),
                            Details = JsonConvert.SerializeObject(data)
                        };

                        //header.ListLogData.Add(logData);

                        _context.PlanRecruitmentHeaders.Update(header);
                        _context.PlanRecruitmentDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PR_MSG_HEDER_NOT_FOUND"];
                    }
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

        #region Detail Extend
        [HttpPost]
        public JsonResult GetListProductAttributeMain()
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.CriteriaRecruitmentCats.Where(x => !x.IsDeleted).Select(x => new { x.Code, x.Name });
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListProductAttributeChildren(string ParentCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.MaterialProductAttributeChildrens.Where(x => !x.IsDeleted && x.ParentCode.Equals(ParentCode)).Select(x => new { x.Code, x.Name });
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDetailAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.CriteriaRecruimentAttrDatas.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["MLP_MSG_PROPERTIES_NOEXIST_REFRESH"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertAttributeMore([FromBody]CriteriaRecruimentAttrData obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.PlanNumber == obj.PlanNumber && !x.IsDeleted);
                if (parent != null)
                {
                    var data = _context.CriteriaRecruimentAttrDatas.FirstOrDefault(x => x.PlanNumber.Equals(obj.PlanNumber) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PR_MSG_DETAIL_EXTEND_CODE_EXIT"];
                    }
                    else
                    {
                        CriteriaRecruimentAttrData objNew = new CriteriaRecruimentAttrData();

                        objNew.PlanNumber = obj.PlanNumber;
                        objNew.AttrCode = obj.AttrCode;
                        objNew.AttrValue = obj.AttrValue;
                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.CriteriaRecruimentAttrDatas.Add(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["PR_MSG_HEDER_NOT_FOUND"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAttributeMore([FromBody]CriteriaRecruimentAttrData obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.PlanRecruitmentHeaders.FirstOrDefault(x => x.PlanNumber == obj.PlanNumber && !x.IsDeleted);
                if (parent != null)
                {
                    var objNew = _context.CriteriaRecruimentAttrDatas.FirstOrDefault(x => x.PlanNumber.Equals(obj.PlanNumber) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (objNew == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["PR_MSG_DETAIL_EXTEND_CODE_NOT_EXIT"];
                    }
                    else
                    {
                        objNew.PlanNumber = obj.PlanNumber;
                        objNew.AttrValue = obj.AttrValue;

                        objNew.UpdatedTime = DateTime.Now;
                        objNew.UpdatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.CriteriaRecruimentAttrDatas.Update(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["PR_MSG_HEDER_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.CriteriaRecruimentAttrDatas.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["PR_MSG_DETAIL_EXTEND_CODE_NOT_EXIT"];
                }
                else
                {
                    objNew.DeletedTime = DateTime.Now;
                    objNew.DeletedBy = ESEIM.AppContext.UserName;
                    objNew.IsDeleted = true;

                    _context.CriteriaRecruimentAttrDatas.Update(objNew);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }
        #endregion

        #region Combobox
        [HttpPost]
        public JsonResult GetWorkFlow()
        {
            var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                .Select(x => new { Code = x.WfCode, Name = x.WfName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetStatusAct()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActWF)))
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpGet]
        public object GetActionStatus(string code)
        {
            var data = _context.PlanRecruitmentHeaders.Where(x => !x.IsDeleted && x.PlanNumber.Equals(code)).Select(x => new
            {
                x.StatusLog
            });
            return data;
        }

        [HttpGet]
        public object GetListActivityRepeat(string planNumber)
        {
            var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.ObjectInst.Equals(planNumber));
            var lstAct = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(data.WfInstCode) && x.Status.Equals("STATUS_ACTIVITY_APPROVED"))
                        .Select(x => new
                        {
                            IntsCode = x.ActivityInstCode,
                            Code = x.ActivityCode,
                            Name = x.Title
                        });
            return lstAct;
        }

        [HttpPost]
        public JsonResult GetListPayMajor()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayMajor))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListPayCertificate()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.PayCertificate))
                                              .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }
        #endregion

        #region Export File
        [HttpPost]
        public object ExportExcel(string planNumber)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/CDVT/KH/ke-hoach-sua-chua-px.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");

            // Read content from file
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
                IWorksheet sheetRequest = workbook.Worksheets[0];
                application.DefaultVersion = ExcelVersion.Excel2013;

                var listData = GetDetail(planNumber);

                IStyle style = workbook.Styles.Add("NewStyle");
                //style.Color = Color.Yellow;
                //style.Font.Bold = true;
                //style.Font.Size = 12;
                style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Dotted;
                style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

                var row = 7;
                var stt = 0;

                var countAdd = listData.Count;
                if (countAdd > 0)
                    sheetRequest.InsertRow(7, countAdd);

                var listProductGroup = listData.GroupBy(x => x.ProductCode).Select(p => new
                {
                    p.First().ProductCode,
                    p.First().ProductName,
                    p.First().TscdCode,
                    p.First().PositionSetup,
                }).ToList();

                for (int j = 0; j < listProductGroup.Count; j++)
                {
                    stt++;
                    sheetRequest.Range["A" + row].Value2 = stt;
                    sheetRequest.Range["B" + row].Value2 = listProductGroup[j].ProductCode;
                    sheetRequest.Range["C" + row].Value2 = listProductGroup[j].ProductName;
                    sheetRequest.Range["D" + row].Value2 = listProductGroup[j].TscdCode;
                    sheetRequest.Range["E" + row].Value2 = listProductGroup[j].PositionSetup;

                    var listDataProduct = listData.Where(x => x.ProductCode.Equals(listProductGroup[j].ProductCode)).ToList();
                    for (int i = 0; i < listDataProduct.Count; i++)
                    {
                        sheetRequest.Range["F" + row].Value2 = listDataProduct[i].ProductAttachedCode;
                        sheetRequest.Range["G" + row].Value2 = listDataProduct[i].ProductAttachedName;
                        sheetRequest.Range["H" + row].Value2 = listDataProduct[i].Unit;
                        sheetRequest.Range["I" + row].Value2 = listDataProduct[i].GenerateNorms;
                        sheetRequest.Range["J" + row].Value2 = listDataProduct[i].Quantity != null ? listDataProduct[i].Quantity.ToString() : "";
                        sheetRequest.Range["K" + row].Value2 = listDataProduct[i].QuantityApproved != null ? listDataProduct[i].QuantityApproved.ToString() : "";

                        sheetRequest.Range["A" + row + ":K" + (row + 1)].CellStyle = style;
                        row++;
                    }
                }

                var listComponent = listData.Where(x => !string.IsNullOrEmpty(x.ProductAttachedCode)).ToList();

                var rowComponent = 20 + listComponent.Count;
                var sttComponent = 0;
                var countAddComponent = listComponent.Count;
                if (countAddComponent > 0)
                    sheetRequest.InsertRow(rowComponent, countAddComponent);

                for (int i = 0; i < listComponent.Count; i++)
                {
                    sttComponent++;
                    sheetRequest.Range["A" + rowComponent].Value2 = sttComponent;
                    sheetRequest.Range["B" + rowComponent].Value2 = listComponent[i].ProductAttachedCode;
                    sheetRequest.Range["C" + rowComponent].Value2 = listComponent[i].ProductAttachedName;
                    sheetRequest.Range["D" + rowComponent].Value2 = listComponent[i].Unit;
                    sheetRequest.Range["E" + rowComponent].Value2 = listComponent[i].Quantity != null ? listData[i].Quantity.ToString() : "";

                    sheetRequest.Range["A" + rowComponent + ":F" + (rowComponent + 1)].CellStyle = style;

                    rowComponent++;
                }

                workbook.SetSeparators('.', '.');

                var fileName = "ke-hoach-sua-chua-px-" + DateTime.Now.ToString("ddMMyyy-hhmm") + ".xlsx";
                var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
                var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
                FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
                workbook.SaveAs(stream);
                stream.Dispose();

                var obj = new
                {
                    fileName,
                    pathFile = pathFileDownLoad
                };

                return obj;
            }
        }

        [HttpPost]
        public List<ExcelExportPlanRecruitmentModel> GetDetail(string planNumber)
        {
            var query = (from a in _context.PlanRecruitmentDetails
                         where (a.PlanNumber == planNumber && !a.IsDeleted)
                         select new ExcelExportPlanRecruitmentModel
                         {
                             PlanNumber = a.PlanNumber,
                             //Quantity = a.Quantity,
                             //QuantityApproved = a.QuantityApproved,
                             //GenerateNorms = a.GenerateNorms,
                             //ProductCode = a.ProductCode,
                             //ProductName = b.ProductName,
                             //ProductAttachedCode = c != null ? c.Code : "",
                             //ProductAttachedName = c != null ? c.Name : "",
                             //TscdCode = b.TscdCode,
                             //PositionSetup = b.PositionSetup,
                             //Unit = d != null ? d.ValueSet : "",
                         }).ToList();

            return query;
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                 .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class PlanRecruitmentModel : JTableModel
        {
            public string PlanNumber { get; set; }
            public string PlanType { get; set; }
            public string DepartmentCode { get; set; }
            public string CreatedName { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class DetailJtable : JTableModel
        {
            public string PlanNumber { get; set; }
            public string ProductCode { get; set; }
            public string ProductAttachedCode { get; set; }
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

        public class ComboxModel
        {
            public string IntsCode { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string UpdateTime { get; set; }
            public string UpdateBy { get; set; }
        }

        public class ExcelExportPlanRecruitmentModel
        {
            public int? No { get; set; }
            public string PlanNumber { get; set; }
            public decimal? Quantity { get; set; }
            public decimal? QuantityApproved { get; set; }
            public string GenerateNorms { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductAttachedCode { get; set; }
            public string ProductAttachedName { get; set; }
            public string TscdCode { get; set; }
            public string PositionSetup { get; set; }
            public string Unit { get; set; }
        }
        #endregion
    }
}