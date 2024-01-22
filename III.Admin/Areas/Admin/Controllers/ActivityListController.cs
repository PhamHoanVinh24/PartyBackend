using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Remotion.Linq.Parsing.ExpressionVisitors.Transformation.PredefinedTransformations;
using Syncfusion.DocIO.DLS;
using static III.Admin.Controllers.CardJobController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ActivityListController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<WorkflowActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCard;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        private readonly IStringLocalizer<HrEmployeeController> _stringLocalizerHr;
        private readonly IStringLocalizer<ProjectController> _projectController;
        private readonly IFCMPushNotification _notification;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();
        private readonly IRepositoryService _repositoryService;
        public readonly string module_name = "WORKFLOW";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public ActivityListController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<WorkflowActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<CardJobController> stringLocalizerCard,
            IFCMPushNotification notification, IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms,
            IStringLocalizer<HrEmployeeController> stringLocalizerHr, IRepositoryService repositoryService,
            IStringLocalizer<ProjectController> projectController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerCard = stringLocalizerCard;
            _notification = notification;
            _stringLocalizerEdms = stringLocalizerEdms;
            _stringLocalizerHr = stringLocalizerHr;
            _repositoryService = repositoryService;
            _projectController = projectController;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }

        }
        public IActionResult Index()
        {
            return View();
        }
        public JsonResult GetListAct(string wfInstCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WfInstCode.Equals(wfInstCode));
                if (data != null)
                {
                    var common = _context.CommonSettings.Where(x => !x.IsDeleted);
                    var running = _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted);
                    var instActs = _context.ActivityInstances.Where(x => !x.IsDeleted);
                    var comm = _context.CommonSettings.Where(x => !x.IsDeleted);
                    var messActs = _context.MessageActivitys;
                    var users = _context.Users;
                    var result = new GridWfInst()
                    {
                        Id = data.Id,
                        WfName = data.WfInstName,
                        WfCode = data.WorkflowCode,
                        WfInstCode = data.WfInstCode,
                        ObjectType = data.ObjectType
                    };
                    var lstAct = (from a in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == data.WfInstCode)
                                  select new ActGrid()
                                  {
                                      Id = a.ID,
                                      ActName = a.Title,
                                      ActivityInstCode = a.ActivityInstCode,
                                      ActType = a.Type,
                                      ActStatus = a.Status,
                                      JsonStatusLog = a.JsonStatusLog
                                  }).ToList();
                    if (lstAct.Count() != 0)
                    {
                        var actInitial = lstAct.FirstOrDefault(x => x.ActType.Equals(EnumHelper<TypeActivity>.GetDisplayValue(TypeActivity.Initial)));

                        var assigns = _context.ExcuterControlRoleInsts
                                .Where(x => !x.IsDeleted && lstAct.Any(k => k.ActivityInstCode.Equals(x.ActivityCodeInst)));

                        foreach (var act in lstAct)
                        {
                            if (assigns.Any(x => x.ActivityCodeInst.Equals(act.ActivityInstCode)
                                && x.UserId.Equals(ESEIM.AppContext.UserId)))
                            {
                                act.IsLock = false;
                                var commandFromExtra = from a in messActs.Where(x => x.ActTo.Equals(act.ActivityInstCode))
                                                       join b in instActs on a.ActFrom equals b.ActivityInstCode into b1
                                                       from b in b1.DefaultIfEmpty()
                                                       join c in users on a.User equals c.UserName
                                                       select new
                                                       {
                                                           Id = a.ID,
                                                           Confirm = !string.IsNullOrEmpty(a.Confirm) ? comm.FirstOrDefault(x => x.CodeSet.Equals(a.Confirm)).ValueSet ?? "" : "",
                                                       };

                                foreach (var cmd in commandFromExtra)
                                {
                                    if (string.IsNullOrEmpty(cmd.Confirm))
                                    {
                                        act.IsLock = true;
                                        break;
                                    }
                                }
                                if (!act.IsLock)
                                {
                                    var actFrom = (from a in running.Where(x => x.ActivityDestination.Equals(act.ActivityInstCode))
                                                   join b in instActs on a.ActivityInitial equals b.ActivityInstCode
                                                   let command = JsonConvert.DeserializeObject<List<JsonCommand>>(a.Command)
                                                   select new ModelCommand
                                                   {
                                                       Command = command.LastOrDefault()
                                                   }).ToList();
                                    foreach (var cmd in actFrom)
                                    {
                                        if (cmd.Command.Confirmed == "")
                                        {
                                            act.IsLock = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!string.IsNullOrEmpty(act.ActStatus))
                                act.ActStatus = common.FirstOrDefault(x => x.CodeSet.Equals(act.ActStatus)) != null ? common.FirstOrDefault(x => x.CodeSet.Equals(act.ActStatus)).ValueSet ?? "" : "";
                            act.ActType = common.FirstOrDefault(x => x.CodeSet.Equals(act.ActType)) != null ? common.FirstOrDefault(x => x.CodeSet.Equals(act.ActType)).ValueSet ?? "" : "";

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

                            act.CountCardJob = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted)
                                                join b in _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ObjectType == "CARD_JOB") on a.CardCode equals b.ObjectInst
                                                where b.ActInstCode == act.ActivityInstCode select a).ToList().Count();
                        }
                        var listActInfo = new List<ActInstInfo>();
                        result.ListAct = JsonConvert.SerializeObject(ArrangeAct(lstAct, 1, actInitial, listActInfo));
                    }
                    else
                    {
                        result.ListAct = JsonConvert.SerializeObject(new List<ActGrid>());
                    }
                    msg.Object = result;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_DATA_FAIL"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_DATA_FAIL"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetGridCard([FromBody] JTableModelCustom jtablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
            int count = 0;
            string[] param = new string[] { "@PageNo", "@PageSize", "@IsAllData", "@UserId", "@WorkflowInstCode", "@ActivityInstCode", "@UserName" };
            object[] val = new object[] { jtablePara.CurrentPage, jtablePara.Length , session.IsAllData, session.UserId, jtablePara.WorkflowInstCode, jtablePara.ActivityInstCode, session.UserName};
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_JOB_CARD_WFINSTANCE", param, val);
            var query = CommonUtil.ConvertDataTable<GridCardJtable>(rs);

            if (query.Count() > 0)
            {
                foreach (var item in query)
                {
                    var tuple = GetWfActName(item.CardCode);
                    item.IsShowLabelAssign = CheckShowLabelAssign(item.CardCode);
                    var assign = GetDepartmentGroupAssign(item.CardCode);
                    item.GroupAssign = assign.Item2;
                    item.DepartmentAssign = assign.Item1;
                    item.WfName = tuple.Item1;
                    item.ActName = tuple.Item2;
                    item.CreatedTime = item.CreatedDate.ToString("dd/MM/yyyy");
                    item.IsRead = GetIsReadNotification(item.CardCode, EnumHelper<NotificationType>.GetDisplayValue(NotificationType.CardJob));
                }
                count = int.Parse(query.FirstOrDefault().TotalRow);
                var jdata = JTableHelper.JObjectTable(
                                query,
                                jtablePara.Draw,
                                count,
                                "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "WorkType", "UpdatedTimeTxt", "UpdateTime", "BoardName", "IsShowLabelAssign",
                                "GroupAssign", "DepartmentAssign", "WfName", "ActName", "IsRead", "BoardType"
                                );
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(
                                query,
                                jtablePara.Draw,
                                count,
                                "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "WorkType", "UpdatedTimeTxt", "UpdateTime", "BoardName", "IsShowLabelAssign",
                                "GroupAssign", "DepartmentAssign", "WfName", "ActName", "IsRead", "BoardType"
                                );
                return Json(jdata);
            }
        }

        [NonAction]
        public Tuple<string, string> GetWfActName(string cardCode)
        {
            var wfName = "";
            var actName = "";
            var wfInst = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value
                && x.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard) && x.ObjectInst == cardCode);
            if (wfInst != null)
            {
                var wf = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode == wfInst.WorkflowCode);
                if (wf != null)
                    wfName = wf.WfName;

                var acts = (from a in _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ObjectInst == cardCode
                           && x.ObjectType == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.TypeInstCard))
                            join b in _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == wfInst.WfInstCode) on a.ActInstCode equals b.ActivityInstCode
                            select new
                            {
                                a.ObjectType,
                                a.ObjectInst,
                                b.Title
                            });
                actName = string.Join(",", acts.Select(x => x.Title));
            }
            return new Tuple<string, string>(wfName, actName);
        }

        [HttpGet]
        public bool CheckShowLabelAssign(string cardCode)
        {
            var isShow = false;
            var session = HttpContext.GetSessionUser();
            var data = from a in _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode))
                       join b in _context.Users on a.UserId equals b.Id
                       select new
                       {
                           a.Role,
                           a.UserId,
                           b.DepartmentId,
                           a.Approve
                       };
            var roleSys = _context.UserRoles.FirstOrDefault(x => x.UserId.Equals(ESEIM.AppContext.UserId) && x.RoleId.Equals("49b018ad-68af-4625-91fd-2273bb5cf749"));
            var roleAccept = data.FirstOrDefault(x => x.UserId.Equals(ESEIM.AppContext.UserId) && x.Role.Equals("ROLE_LEADER_ACCEPTED"));

            if (roleAccept != null || roleSys != null)
            {
                foreach (var item in data)
                {
                    if (!string.IsNullOrEmpty(item.DepartmentId) && item.DepartmentId.Equals(session.DepartmentCode) && item.UserId != session.UserId)
                    {
                        if (!item.Approve.HasValue || !item.Approve.Value)
                        {
                            isShow = true;
                            break;
                        }
                    }
                }
            }
            return isShow;
        }

        [NonAction]
        public Tuple<string, string> GetDepartmentGroupAssign(string cardCode)
        {
            var departmentAssign = "";
            var groupAssign = "";
            var data = from a in _context.JobCardAssignees.Where(x => !x.IsDeleted && x.CardCode.Equals(cardCode))
                       join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals b.DepartmentCode into b1
                       from b2 in b1.DefaultIfEmpty()
                       join c in _context.AdGroupUsers.Where(x => !x.IsDeleted && x.IsEnabled) on a.GroupCode equals c.GroupUserCode into c1
                       from c2 in c1.DefaultIfEmpty()
                       select new
                       {
                           Department = b2 != null ? b2.Title : "",
                           Group = c2 != null ? c2.Title : ""
                       };
            if (data.Any())
            {
                departmentAssign = string.Join(",", data.DistinctBy(x => x.Department).Select(x => x.Department));
                groupAssign = string.Join(",", data.DistinctBy(x => x.Group).Select(x => x.Group));
            }
            return new Tuple<string, string>(departmentAssign, groupAssign);
        }

        [NonAction]
        private List<ActGrid> ArrangeAct(List<ActGrid> listInst, int level,
            ActGrid instInitial, List<ActInstInfo> listActInfo)
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
                            if (!listActInfo.Any(x => x.ActInstCode.Equals(actRunning.ActivityInstCode)))
                            {
                                actRunning.Level = instInitial.Level + 1;

                                var info = new ActInstInfo
                                {
                                    ActInstCode = actRunning.ActivityInstCode
                                };

                                listActInfo.Add(info);
                                listInst = ArrangeAct(listInst, actRunning.Level, actRunning, listActInfo);
                            }
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
        public class LogStatus
        {
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public bool Lock { get; set; }
            public DateTime CreatedTime { get; set; }
            public string sCreatedTime { get; set; }
        }
        public class JTableModelCustom : JTableModel
        {
            public string WorkflowInstCode;
            public string ActivityInstCode;
        }
        public class GridWfInst
        {
            public int Id { get; set; }
            public string WfName { get; set; }
            public string WfCode { get; set; }
            public string WfInstCode { get; set; }
            public string Status { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectType { get; set; }
            public DateTime CreatedTime { get; set; }
            public string ListAct { get; set; }
            public string ListCard { get; set; }
            public string ListFile { get; set; }
            public string TotalRow { get; set; }
            public bool IsRead { get; set; }
            public string ObjectName { get; set; }
            public string ObjectTypeName { get; set; }
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
        public class ActGrid
        {
            public string ActName { get; set; }
            public string ActStatus { get; set; }
            public int Id { get; set; }
            public bool IsLock { get; set; }
            public int Level { get; set; }
            public string ActivityInstCode { get; set; }
            public string ActType { get; set; }
            public bool IsInstance { get; set; }
            public string ObjectCode { get; set; }
            public string JsonStatusLog { get; set; }
            public LogStatus Log { get; set; }
            public int CountCardJob { get; set; }
        }
        public class ModelCommand
        {
            public ModelCommand()
            {
                Command = new JsonCommand();
            }
            public string Code { get; set; }
            public string Name { get; set; }
            public decimal Duration { get; set; }
            public DateTime? StartTime { get; set; }
            public JsonCommand Command { get; set; }
            public string Unit { get; set; }
            public string CommandText { get; set; }
            public string CommandStr { get; set; }
            public string WfInstCode { get; set; }
            public bool IsLeader { get; set; }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCard.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerHr.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_projectController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var data in query)
            {
                resourceObject.Add(data.Name, data.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}