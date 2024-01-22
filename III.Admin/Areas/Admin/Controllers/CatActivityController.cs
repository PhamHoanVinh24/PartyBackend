using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CatActivityController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CatActivityController> _stringLocalizer;
        private readonly IStringLocalizer<WorkflowActivityController> _stringLocalizerWa;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CatActivityController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<WorkflowActivityController> stringLocalizerWa,
        IStringLocalizer<CatActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizerWa = stringLocalizerWa;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbCatActivity", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["CrumbCatActivity"] = _sharedResources["COM_CRUMB_CAT_ACTIVITY"];
            return View();
        }

        #region Combo box
        [HttpPost]
        public object GetDurationUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DurationUnit))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetGroupAct()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.GroupActivity))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetTypeAct()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeActivity))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetStatusAct()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActivity))
                .OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Color = x.Logo });
            return data;
        }

        [HttpGet]
        public JsonResult GetStatusAssign()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ASSIGN_STATUS")).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListGroupUser()
        {
            var data = _context.AdGroupUsers.Where(x => x.IsEnabled == true).Select(x => new
            {
                Code = x.GroupUserCode,
                Name = x.Title,
                Type = 1,
                Group = "Nhóm"
            });
            return Json(data);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetDepartmentInBranch(string branch)
        {
            var list = new List<AssignObject>();
            var orgs = _context.AdOrganizations.FirstOrDefault(x => x.IsEnabled && x.OrgAddonCode.Equals(branch));
            if (orgs != null)
            {
                if (!string.IsNullOrEmpty(orgs.DepartmentCode))
                {
                    var arrDpm = orgs.DepartmentCode.Split(",", StringSplitOptions.None);
                    list = (from a in arrDpm
                            join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a equals b.DepartmentCode
                            select new AssignObject
                            {
                                Code = b.DepartmentCode,
                                Name = b.Title,
                                Type = 2,
                                Group = "Phòng ban"
                            }).ToList();
                }
            }

            return Json(list);
        }

        [HttpPost]
        public JsonResult GetMemberInGroupUser(string groupUserCode, string branch)
        {
            var query = (from a in _context.AdUserInGroups.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.UserId equals b.Id
                         join c in _context.Roles.Where(x => x.Status) on a.RoleId equals c.Id
                         join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals d.DepartmentCode
                         where a.GroupUserCode == groupUserCode && a.Branch.Equals(branch)
                         select new
                         {
                             UserId = b.Id,
                             UserName = b.UserName,
                             b.GivenName,
                             Type = 1,
                             b.DepartmentId,
                             RoleSys = c.Title,
                             Branch = a.Branch,
                             DepartmentName = d.Title
                         }).DistinctBy(x => x.UserId);
            return Json(query);
        }

        [HttpGet]
        public object GetListUserInDepartment(string departmentCode, string branch)
        {
            var listMember = (from a in _context.AdUserDepartments.Where(x => !x.IsDeleted && x.Branch.Equals(branch)
                                && x.DepartmentCode.Equals(departmentCode))
                              join b in _context.Users on a.UserId equals b.Id
                              join c in _context.Roles.Where(x => x.Status) on a.RoleId equals c.Id
                              join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals d.DepartmentCode
                              select new MemberInDepartment
                              {
                                  UserId = b.Id,
                                  UserName = b.UserName,
                                  GivenName = b.GivenName,
                                  Type = 2,
                                  DepartmentId = b.DepartmentId,
                                  RoleSys = c.Title,
                                  Priority = 0,
                                  DepartmentName = d.Title,
                                  Branch = a.Branch
                              }).GroupBy(x => new { x.UserId, x.DepartmentId });
            var members = listMember.Select(x => new
            {
                x.Key.UserId,
                x.Key.DepartmentId,
                x.First().Type,
                x.First().GivenName,
                x.First().UserName,
                x.First().RoleSys,
                x.First().Priority,
                x.First().DepartmentName,
                x.First().Branch
            });
            return members;
        }

        [HttpPost]
        public object GetListUserOfBranch(string branch)
        {
            var query = from a in _context.AdUserDepartments.Where(x => !x.IsDeleted && x.IsMain)
                        join b in _context.Users on a.UserId equals b.Id
                        join c in _context.Roles.Where(x => x.Status) on a.RoleId equals c.Id
                        join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals d.DepartmentCode
                        select new
                        {
                            UserId = b.Id,
                            b.GivenName,
                            b.UserName,
                            RoleSys = c.Title,
                            Branch = a.Branch,
                            DepartmentName = d.Title
                        };
            return query;
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListRoleAssign()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.RoleActAssign)).OrderBy(x => x.Priority)
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public JsonResult GetMilesStone()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.MilesStone))
               .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListATTRTYPE()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_DATA_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListATTRUNIT()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        public class AssignObject
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public int Type { get; set; }
            public string Group { get; set; }
        }
        public class MemberInDepartment
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public int Type { get; set; }
            public string DepartmentId { get; set; }
            public string RoleSys { get; set; }
            public int? Priority { get; set; }
            public string DepartmentName { get; set; }
            public string Branch { get; set; }
        }
        #endregion

        #region Activity

        [HttpPost]
        public JsonResult JTable([FromBody] ActivityModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = from a in _context.Activitys.Where(x => !x.IsDeleted)
                        where (string.IsNullOrEmpty(jTablepara.ActivityCode) || a.ActivityCode.ToLower().Contains(jTablepara.ActivityCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablepara.Title) || a.Title.ToLower().Contains(jTablepara.Title.ToLower()))
                        && (string.IsNullOrEmpty(jTablepara.Group) || a.Group.Equals(jTablepara.Group))
                        && (string.IsNullOrEmpty(jTablepara.Type) || a.Type.Equals(jTablepara.Type))
                        && (string.IsNullOrEmpty(jTablepara.Status) || a.Status.Equals(jTablepara.Status))
                        select new
                        {
                            a.ID,
                            a.ActivityCode,
                            a.Title,
                            a.Duration,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Unit && !x.IsDeleted) != null ?
                                 _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Unit && !x.IsDeleted).ValueSet : "",
                            a.Located,
                            Group = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Group && !x.IsDeleted) != null ?
                                 _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Group && !x.IsDeleted).ValueSet : "",
                            Type = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Type && !x.IsDeleted) != null ?
                                 _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Type && !x.IsDeleted).ValueSet : "",
                            Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Status && !x.IsDeleted) != null ?
                                 _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.Status && !x.IsDeleted).ValueSet : "",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "ActivityCode", "Title", "Duration", "Unit", "Group", "Type", "Status", "Located");
            return Json(jdata);
        }

        [HttpPost]
        public object CheckActExist(string actCode)
        {
            var check = false;
            var data = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode == actCode);
            if (data != null)
            {
                check = true;
            }
            return check;
        }

        [HttpPost]
        public JsonResult InsertActivity([FromBody] CrudActivity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg = CheckObjectType(obj);
                if (msg.Error)
                {
                    return Json(msg);
                }
                var check = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(obj.ActivityCode));
                if (check == null)
                {
                    var activity = new Activity
                    {
                        ActivityCode = obj.ActivityCode,
                        Title = obj.Title,
                        WorkflowCode = obj.WorkflowCode,
                        Duration = obj.Duration,
                        Unit = obj.Unit,
                        Group = obj.Group,
                        Type = obj.Type,
                        Status = obj.Status,
                        Located = obj.Located,
                        Desc = obj.Desc,
                        Level = obj.Level,
                        ShapeJson = obj.ShapeJson,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    if (!string.IsNullOrEmpty(obj.MileStone))
                    {
                        var mileStone = new WorkflowMilestone
                        {
                            WorkflowCode = obj.WorkflowCode,
                            ActivityCode = obj.ActivityCode,
                            MilestoneCode = obj.MileStone,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.WorkflowMilestones.Add(mileStone);
                    }
                    _context.Activitys.Add(activity);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];

                    //AddCreator(obj.ActivityCode);
                }
                else
                {
                    msg.Title = "Hoạt động đã tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [NonAction]
        public void AddCreator(string actCode)
        {
            var creator = new ExcuterControlRole
            {
                ActivityCode = actCode,
                Branch = "",
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                DepartmentCode = "",
                GroupCode = "",
                Role = "",
                Status = "",
                UserId = EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator)
            };
            _context.ExcuterControlRoles.Add(creator);

            var creatorManager = new ExcuterControlRole
            {
                ActivityCode = actCode,
                Branch = "",
                CreatedBy = ESEIM.AppContext.UserName,
                CreatedTime = DateTime.Now,
                DepartmentCode = "",
                GroupCode = "",
                Role = "",
                Status = "",
                UserId = EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.CreatorManager)
            };
            _context.ExcuterControlRoles.Add(creatorManager);

            _context.SaveChanges();
        }

        [HttpGet]
        public JsonResult GetItemActivity(int id)
        {
            var data = _context.Activitys.FirstOrDefault(x => x.ID == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateActivity([FromBody] CrudActivity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg = CheckObjectType(obj);
                if (msg.Error)
                {
                    return Json(msg);
                }
                var data = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(obj.ActivityCode));
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.Duration = obj.Duration;
                    data.Unit = obj.Unit;
                    data.Group = obj.Group;
                    data.Type = obj.Type;
                    data.Located = obj.Located;
                    data.Status = obj.Status;
                    data.Desc = obj.Desc;
                    data.Level = obj.Level;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    if (!string.IsNullOrEmpty(obj.MileStone))
                    {
                        var miles = _context.WorkflowMilestones.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode == data.ActivityCode && x.WorkflowCode == data.WorkflowCode);
                        miles.MilestoneCode = obj.MileStone;
                        miles.UpdatedBy = ESEIM.AppContext.UserName;
                        miles.UpdatedTime = DateTime.Now;
                        _context.WorkflowMilestones.Update(miles);
                    }
                    _context.Activitys.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["WFAI_MSG_ACT_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        private JMessage CheckObjectType(CrudActivity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            //obj Type check
            if (obj.Type == "TYPE_ACTIVITY_INITIAL") // if type is intial, check there is any intial activity 
            {
                var checkIntial = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL") && x.WorkflowCode == obj.WorkflowCode && x.ActivityCode != obj.ActivityCode);
                if (checkIntial != null) // if there is one, return err
                {
                    msg.Title = _stringLocalizerWa["WFAI_MSG_ACT_INTIAL_EXISTED"];
                    msg.Error = true;
                    return msg;
                }
            }
            if (obj.Type == "TYPE_ACTIVITY_END") // if type is end, check there is any intial activity or end activity
            {
                var checkIntial = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL") && x.WorkflowCode == obj.WorkflowCode && x.ActivityCode != obj.ActivityCode);
                if (checkIntial == null) // if there is no intial act, return err
                {
                    msg.Title = _stringLocalizerWa["WFAI_MSG_ACT_INTIAL_NOT_EXIST"];
                    msg.Error = true;
                    return msg;
                }
                var checkEnd = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_END") && x.WorkflowCode == obj.WorkflowCode && x.ActivityCode != obj.ActivityCode);
                if (checkEnd != null) // if there is already one end activity, return err
                {
                    msg.Title = _stringLocalizerWa["WFAI_MSG_ACT_END_EXISTED"];
                    msg.Error = true;
                    return msg;
                }
            }
            if (obj.Type == "TYPE_ACTIVITY_REPEAT") // if type is repeat, check there is any intial activity or end activity
            {
                var checkIntial = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_INITIAL") && x.WorkflowCode == obj.WorkflowCode && x.ActivityCode != obj.ActivityCode);
                if (checkIntial == null) // if there is no intial act, return err
                {
                    msg.Title = _stringLocalizerWa["WFAI_MSG_ACT_INTIAL_NOT_EXIST"];
                    msg.Error = true;
                    return msg;
                }
                var checkEnd = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.Type.Equals("TYPE_ACTIVITY_END") && x.WorkflowCode == obj.WorkflowCode && x.ActivityCode != obj.ActivityCode);
                if (checkEnd == null) // if there is no end act, return err
                {
                    msg.Title = _stringLocalizerWa["WFAI_MSG_ACT_END_NOT_EXIST"];/*WFAI_MSG_ACT_END_NOT_EXIST*/
                    msg.Error = true;
                    return msg;
                }
            }
            return msg;
        }

        [HttpPost]
        public JsonResult UpdateGroupDataActivity([FromBody] CrudActivityEx obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(obj.ActivityCode));
                if (data != null)
                {
                    data.ListGroupData = obj.ListGroupData;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.Activitys.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Cập nhật không thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteActivity(string actCode)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.Activitys.FirstOrDefault(x => x.ActivityCode == actCode && !x.IsDeleted);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.Activitys.Update(data);

                    var settings = _context.WorkflowSettings.Where(x => !x.IsDeleted && x.ActivityDestination == data.ActivityCode
                    || x.ActivityInitial == data.ActivityCode);
                    if (settings.Any())
                    {
                        foreach (var item in settings)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.WorkflowSettings.Update(item);
                        }
                    }

                    var miles = _context.WorkflowMilestones.Where(x => !x.IsDeleted && x.ActivityCode == data.ActivityCode && x.WorkflowCode == data.WorkflowCode);
                    if (miles.Any())
                    {
                        foreach (var item in miles)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.WorkflowMilestones.Update(item);
                        }
                    }

                    var files = _context.ActivityFiles.Where(x => !x.IsDeleted && x.ActivityCode.Equals(data.ActivityCode));
                    foreach (var file in files)
                    {
                        file.IsDeleted = true;
                        file.DeletedBy = ESEIM.AppContext.UserName;
                        file.DeletedTime = DateTime.Now;
                        _context.ActivityFiles.Update(file);
                    }

                    var assigns = _context.ExcuterControlRoles.Where(x => !x.IsDeleted && x.ActivityCode.Equals(data.ActivityCode));
                    foreach (var assign in assigns)
                    {
                        assign.IsDeleted = true;
                        assign.DeletedBy = ESEIM.AppContext.UserName;
                        assign.DeletedTime = DateTime.Now;
                        _context.ExcuterControlRoles.Update(assign);
                    }

                    var attrSetup = _context.AttrSetups.Where(x => !x.IsDeleted && x.ActCode.Equals(data.ActivityCode));
                    foreach (var attr in attrSetup)
                    {
                        attr.IsDeleted = true;
                        attr.DeletedBy = ESEIM.AppContext.UserName;
                        attr.DeletedTime = DateTime.Now;
                        _context.AttrSetups.Update(attr);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_RECORD"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object CheckTypeInitial(string wfCode)
        {
            var check = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode == wfCode && x.Type == "TYPE_ACTIVITY_INITIAL");
            if (check == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        [HttpPost]
        public object CheckTypeEndAct(string wfCode)
        {
            var check = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.WorkflowCode == wfCode && x.Type == "TYPE_ACTIVITY_END");
            if (check == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        public class CrudActivity
        {
            public string ActivityCode { get; set; }
            public string Title { get; set; }
            public decimal Duration { get; set; }
            public string Unit { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string Located { get; set; }
            public string Desc { get; set; }
            public string MileStone { get; set; }
            public string WorkflowCode { get; set; }
            public string ShapeJson { get; set; }
            public int Level { get; set; }
        }

        public class CrudActivityEx: CrudActivity
        {
            public string ListGroupData { get; set; }
        }

        public class ActivityModel : JTableModel
        {
            public string ActivityCode { get; set; }
            public string Title { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
        }

        #endregion

        #region Transition
        [HttpPost]
        public JsonResult CheckWfSetting(string actSrc, string actDes)
        {
            var msg = new JMessage();
            var actSrcCheck = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode == actSrc);
            var actDesCheck = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode == actDes);
            if (actSrcCheck == null || actDesCheck == null)
            {
                msg.Error = true;
                msg.Title = "Vui lòng tạo hoạt động trước";
            }
            else
            {
                msg.Error = false;
                var setting = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityInitial == actSrc && x.ActivityDestination == actDes);
                if (setting != null)
                {
                    msg.Object = setting;
                }
                else
                {
                    msg.Object = null;
                }
            }
            return Json(msg);
        }

        #endregion

        #region Assign
        [HttpPost]
        public JsonResult Assign([FromBody] ExcuterControlRole obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.ExcuterControlRoles.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && !x.IsDeleted
                    && x.ActivityCode.Equals(obj.ActivityCode));
                if (check == null)
                {
                    var assign = new ExcuterControlRole
                    {
                        ActivityCode = obj.ActivityCode,
                        UserId = obj.UserId,
                        GroupCode = obj.GroupCode,
                        DepartmentCode = obj.DepartmentCode,
                        Branch = obj.Branch,
                        Role = obj.Role,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Approve = false,
                        Status = "ASSIGN_STATUS_WORK"
                    };
                    _context.ExcuterControlRoles.Add(assign);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Nhân viên đã tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemAssign(int id)
        {
            var data = _context.ExcuterControlRoles.FirstOrDefault(x => x.ID == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateAssign([FromBody] ExcuterControlRole obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.UserId.Equals(obj.UserId)
                    && x.ActivityCode.Equals(obj.ActivityCode));
                if (data != null)
                {
                    data.Role = obj.Role;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAssign(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ExcuterControlRoles.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ExcuterControlRoles.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_NOT_FOUND_RECORD"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult JtableActivity([FromBody] AssignModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = from a in _context.ExcuterControlRoles.Where(x => !x.IsDeleted)
                        join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals b.DepartmentCode into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.AdGroupUsers.Where(x => !x.IsEnabled && x.IsEnabled) on a.GroupCode equals c.GroupUserCode into c1
                        from c in c1.DefaultIfEmpty()
                        join d in _context.AdOrganizations.Where(x => x.IsEnabled) on a.Branch equals d.OrgAddonCode into d1
                        from d in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<CardEnum>.GetDisplayValue(CardEnum.Role))) on a.Role equals e.CodeSet into e1
                        from e in e1.DefaultIfEmpty()
                        join f in _context.Users on a.UserId equals f.Id
                        where a.ActivityCode.Equals(jTablepara.ActivityCode)
                        select new
                        {
                            a.ID,
                            a.ActivityCode,
                            Branch = d != null ? d.OrgName : "",
                            Department = b != null ? b.Title : "",
                            Group = c != null ? c.Title : "",
                            f.GivenName,
                            Role = e != null ? e.ValueSet : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "ActivityCode", "Branch", "Department", "Group", "GivenName", "Role");
            return Json(jdata);
        }
        public class AssignModel : JTableModel
        {
            public string ActivityCode { get; set; }
        }
        #endregion

        #region View Activity
        [HttpGet]
        public JsonResult GetActivity(string wfCode)
        {
            var data = from a in _context.WorkFlows.Where(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode))
                       join b in _context.Activitys.Where(x => !x.IsDeleted) on a.WfCode equals b.WorkflowCode
                       join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.DurationUnit))) on b.Unit equals c.CodeSet into c1
                       from c in c1.DefaultIfEmpty()
                       join d in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals(EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.StatusActivity))) on b.Status equals d.CodeSet into d1
                       from d in d1.DefaultIfEmpty()
                       select new
                       {
                           Id = b.ID,
                           ActName = b.Title,
                           Time = b.Duration,
                           UnitTime = c != null ? c.ValueSet : "",
                           Status = d != null ? d.ValueSet : ""
                       };
            return Json(data);
        }

        #endregion

        #region Attribute setup
        [HttpPost]
        public JsonResult JTableAttr([FromBody] JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AttrSetups
                        join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (!a.IsDeleted && a.ActCode.Equals(jTablePara.ActCode))
                        select new
                        {
                            a.AttrCode,
                            a.ID,
                            a.AttrName,
                            AttrUnit = c2.ValueSet,
                            AttrDataType = b2.ValueSet,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "AttrCode", "AttrName", "Note", "AttrDataType", "AttrUnit");
            return Json(jdata);
        }

        [HttpPost]
        public object InsertActAttrSetup([FromBody] AttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {

                var checkexist = _context.Activitys.FirstOrDefault(x => x.ActivityCode.Equals(obj.ActCode) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_FALES"];

                }
                else
                {
                    var check = _context.AttrSetups.FirstOrDefault(x => x.AttrCode.Equals(obj.AttrCode));
                    if (check == null)
                    {
                        var attr = new AttrSetup()
                        {
                            ActCode = obj.ActCode,
                            AttrCode = obj.AttrCode,
                            AttrName = obj.AttrName,
                            AttrUnit = obj.AttrUnit,
                            AttrDataType = obj.AttrDataType,
                            Note = obj.Note,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.AttrSetups.Add(attr);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_SUCCESS"];
                        msg.ID = attr.ID;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_IS"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        //delete
        public object DeleteActAttrSetup(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AttrSetups.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.AttrSetups.Update(data);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_IS_NULL"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class JTableAttrModel : JTableModel
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string ActCode { get; set; }
            public string AttrName { get; set; }

            public string AttrDataType { get; set; }

            public string AttrUnit { get; set; }

            public string AttrGroup { get; set; }

            public string Note { get; set; }
        }

        #endregion

        #region File

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerWa.GetAllStrings().Select(x => new { x.Name, x.Value }))
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