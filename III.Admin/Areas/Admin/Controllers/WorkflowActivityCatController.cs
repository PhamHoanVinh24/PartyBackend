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

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WorkflowActivityCatController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<ActivityController> _stringLocalizerAct;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCard;
        private static AsyncLocker<string> objLock = new AsyncLocker<string>();
        public WorkflowActivityCatController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<CardJobController> stringLocalizerCard,
            IStringLocalizer<ActivityController> stringLocalizerAct)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerCard = stringLocalizerCard;
            _stringLocalizerAct = stringLocalizerAct;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Combo box
        [HttpGet]
        public JsonResult GetWfGroup()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("WF_GROUP"))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }
        [HttpGet]
        public JsonResult GetWfType()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("WF_TYPE"))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }); ;
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetWorkflow()
        {
            var data = (from a in _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                        join b in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value) on a.WfCode equals b.WorkflowCode
                        select new
                        {
                            Code = b.WfInstCode,
                            Name = a.WfName
                        });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetAttrOfAct(string actCode)
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.ActCode.Equals(actCode))
                .Select(x => new { Code = x.AttrCode, Name = x.AttrName });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetUnitName(string Code)
        {
            var data = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(Code)).ValueSet;
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetUnitAttr()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_UNIT")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        #endregion

        #region Create, update, delete Work flow
        [HttpPost]
        public JsonResult InsertWorkFlow([FromBody] WorkFlow obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(obj.WfCode));
                if (check == null)
                {
                    var wf = new WorkFlow
                    {
                        WfCode = obj.WfCode,
                        WfName = obj.WfName,
                        WfGroup = obj.WfGroup,
                        WfType = obj.WfType,
                        WfNote = obj.WfNote,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false
                    };
                    _context.WorkFlows.Add(wf);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Title = "Mã luồng đã tồn tại";
                    msg.Error = true;
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
        public JsonResult GetItemWf(string wfCode)
        {
            var data = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode));
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateWf([FromBody] WorkFlow obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(obj.WfCode));
                if (data != null)
                {
                    data.WfName = obj.WfName;
                    data.WfGroup = obj.WfGroup;
                    data.WfType = obj.WfType;
                    data.WfNote = obj.WfNote;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.WorkFlows.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
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
        public JsonResult DeleteWf(string wfCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode));
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.WorkFlows.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = "Bản ghi không tồn tại";
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetWflow()
        {
            var data = (from a in _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                        select new
                        {
                            Code = a.WfCode,
                            Name = a.WfName,
                            Time = a.CreatedTime
                        }).OrderByDescending(x => x.Time);
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertActivity([FromBody] Activity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
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
                        ShapeJson = obj.ShapeJson,
                        Located = obj.Located,
                        Desc = obj.Desc,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.Activitys.Add(activity);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
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

        [HttpPost]
        public JsonResult UpdateActivity([FromBody] Activity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(obj.ActivityCode));
                if (check != null)
                {
                    check.Title = obj.Title;
                    check.Duration = obj.Duration;
                    check.Unit = obj.Unit;
                    check.Group = obj.Group;
                    check.Type = obj.Type;
                    check.Status = obj.Status;
                    check.ShapeJson = obj.ShapeJson;
                    check.Located = obj.Located;
                    check.Desc = obj.Desc;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    _context.Activitys.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        #endregion

        #region Workflow setting

        [HttpPost]
        public JsonResult SettingWF([FromBody] WorkflowSetting obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.TransitionCode.Equals(obj.TransitionCode));
                var jsonCommand = new JsonCommand
                {
                    Approved = "",
                    ApprovedBy = "",
                    ApprovedTime = "",
                    CommandSymbol = obj.Command,
                    ConfirmedBy = "",
                    ConfirmedTime = "",
                    Confirmed = "",
                    Id = 0
                };
                if (check == null)
                {
                    var setting = new WorkflowSetting
                    {
                        WorkflowCode = obj.WorkflowCode,
                        TransitionCode = obj.TransitionCode,
                        ActivityInitial = obj.ActivityInitial,
                        ActivityDestination = obj.ActivityDestination,
                        Command = JsonConvert.SerializeObject(jsonCommand),
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WorkflowSettings.Add(setting);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    check.Command = JsonConvert.SerializeObject(jsonCommand);
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    _context.WorkflowSettings.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
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
        public JsonResult UpdateSettingWF([FromBody] WorkflowSetting obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var jsonCommand = new JsonCommand
                {
                    Approved = "",
                    ApprovedBy = "",
                    ApprovedTime = "",
                    CommandSymbol = obj.Command,
                    ConfirmedBy = "",
                    ConfirmedTime = "",
                    Id = 0,
                    Message = "",
                    ActA = obj.ActivityInitial,
                    ActB = obj.ActivityDestination,
                    IsLeader = false
                };
                var lst = new List<JsonCommand>();
                lst.Add(jsonCommand);
                var check = _context.WorkflowSettings.FirstOrDefault(x => !x.IsDeleted && x.ActivityDestination == obj.ActivityDestination
                    && x.ActivityInitial == obj.ActivityInitial);
                if (check != null)
                {
                    check.TransitionCode = obj.TransitionCode;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    check.Command = JsonConvert.SerializeObject(lst);
                    _context.WorkflowSettings.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
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
        public JsonResult DeleteSettingWF(string actSrc, string actDes)
        {
            var msg = new JMessage();
            var data = _context.WorkflowSettings.FirstOrDefault(x => x.ActivityInitial.Equals(actSrc) &&
                x.ActivityDestination == actDes && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.WorkflowSettings.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetTransitionType()
        {
            var data = _context.Transitions.Where(x => !x.IsDeleted).Select(x => new { Code = x.TrsCode, Name = x.TrsTitle });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetAct(string wfCode)
        {
            var data = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode == wfCode)
                .Select(x => new { Code = x.ActivityCode, Name = x.Title });
            return Json(data);
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
        #endregion

        #region Workflow Instance
        [HttpPost]
        public async Task<JsonResult> CreateWfInstance([FromBody] WorkflowInstance obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var wfInstCode = string.Empty;
            try
            {
                using (await objLock.LockAsync(string.Concat(obj.ObjectInst, obj.ObjectType)))
                {
                    var wf = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(obj.WorkflowCode));

                    var check = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WorkflowCode == obj.WorkflowCode
                    && x.ObjectInst == obj.ObjectInst && x.ObjectType == obj.ObjectType);
                    if (check == null)
                    {
                        var count = _context.WorkflowInstances.Count();
                        count++;
                        var wfInstance = new WorkflowInstance
                        {
                            ObjectType = obj.ObjectType,
                            ObjectInst = obj.ObjectInst,
                            WorkflowCode = obj.WorkflowCode,
                            WfInstCode = obj.WorkflowCode + "_" + obj.ObjectInst + "_" + count,
                            WfGroup = wf != null ? wf.WfGroup : obj.WfGroup,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false
                        };
                        _context.WorkflowInstances.Add(wfInstance);
                        _context.SaveChanges();

                        if (!wfInstance.WfInstCode.Equals(wfInstance.Id.ToString()))
                        {
                            wfInstance.WfInstCode = wfInstance.Id.ToString();
                            _context.WorkflowInstances.Update(wfInstance);
                            _context.SaveChanges();
                        }

                        wfInstCode = wfInstance.WfInstCode;

                        //Instance running
                        var settings = _context.WorkflowSettings.Where(x => !x.IsDeleted && x.WorkflowCode == obj.WorkflowCode);
                        if (settings.Any())
                        {
                            foreach (var item in settings)
                            {
                                var running = new WorkflowInstanceRunning
                                {
                                    WorkflowCode = obj.WorkflowCode,
                                    TransitionCode = item.TransitionCode,
                                    ActivityDestination = item.ActivityDestination,
                                    ActivityInitial = item.ActivityInitial,
                                    WfInstCode = wfInstance.WfInstCode,
                                    Command = item.Command,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                    IsDeleted = false
                                };
                                _context.WorkflowInstanceRunnings.Add(running);
                            }
                        }
                        //Instance Activity
                        var activities = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(obj.WorkflowCode));
                        var countAct = _context.Activitys.Count();
                        if (activities.Any())
                        {
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
                                    Status = item.Status,
                                    Title = item.Title,
                                    Type = item.Type,
                                    Unit = item.Unit,
                                    IsDeleted = false
                                };
                                _context.ActivityInstances.Add(actInst);
                            }
                        }
                        _context.SaveChanges();
                        msg.Title = "Thêm mới thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Đối tượng đã được tạo luồng";
                    }
                }
            }
            catch (Exception ex)
            {
                //Rollback wfInstace
                if (!string.IsNullOrEmpty(wfInstCode))
                    DeleteWfInstance(wfInstCode);

                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
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

                    var actInst = _context.ActivityInstances.Where(x => !x.IsDeleted && x.WorkflowCode == wfInstCode);
                    if (actInst.Any())
                    {
                        foreach (var item in actInst)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.ActivityInstances.Update(item);
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
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bạn không có quyền xóa";
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = "Bản ghi không tồn tại";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemWfInst(string wfInsCode)
        {
            var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WfInstCode == wfInsCode);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateWfInst([FromBody] WorkflowInstance obj)
        {
            var msg = new JMessage { Error = false, Title = "'" };
            try
            {
                var data = _context.WorkflowInstances.FirstOrDefault(x => !x.IsDeleted.Value && x.WfInstCode == obj.WfInstCode);
                if (data != null)
                {
                    data.ObjectInst = obj.ObjectInst;
                    data.ObjectType = obj.ObjectType;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.WorkflowInstances.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
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
        public JsonResult GetInstanceAct(string wfCode)
        {
            var data = from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.WfInstCode.Equals(wfCode))
                       join b in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.WfInstCode equals b.WorkflowCode
                       select new
                       {
                           ID = b.ID,
                           Title = b.Title,
                           Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Status) && !x.IsDeleted).ValueSet ?? "",
                           Timer = b.Duration + _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Unit) && !x.IsDeleted).ValueSet ?? "",
                           ObjCode = a.ObjectInst
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetWorkflowInstance(string wfInst)
        {
            var data = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value)
                        join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b.WfCode
                        join c in _context.Users on a.CreatedBy equals c.UserName
                        where string.IsNullOrEmpty(wfInst) || a.WfInstCode.Contains(wfInst) || b.WfName.Contains(wfInst)
                        select new
                        {
                            Code = a.WfInstCode,
                            b.WfName,
                            CreatedBy = c.GivenName,
                            CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                            TimeCreated = a.CreatedTime.Value,
                            IsSuccess = CheckActEnd(a.WfInstCode)
                        }).OrderByDescending(x => x.TimeCreated);
            return Json(data);
        }

        [NonAction]
        public bool CheckActEnd(string wfInstCode)
        {
            var data = _context.ActivityInstances.FirstOrDefault(x => x.Type == "TYPE_ACTIVITY_END");
            var check = false;
            if (data != null)
            {
                if (data.Status == "STATUS_ACTIVITY_END")
                    check = true;
            }
            return check;
        }

        [HttpGet]
        public JsonResult GetItemActInst(int id)
        {
            var data = _context.ActivityInstances.FirstOrDefault(x => x.ID == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateActInst([FromBody] ActivityInstance data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.ActivityInstances.FirstOrDefault(x => !x.IsDeleted && x.ActivityInstCode.Equals(data.ActivityInstCode));
                if (check != null)
                {
                    check.Desc = data.Desc;
                    check.Duration = data.Duration;
                    check.Unit = data.Unit;
                    check.Group = data.Group;
                    check.Type = data.Type;
                    check.ShapeJson = data.ShapeJson;
                    check.Title = data.Title;
                    check.Located = data.Located;
                    check.Status = data.Status;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    _context.ActivityInstances.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
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
        public JsonResult GetAttachmentWfInstance(string wfInstCode)
        {
            var actInst = from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value && x.WfInstCode.Equals(wfInstCode))
                          join b in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.WorkflowCode equals b.WorkflowCode
                          select new
                          {
                              b.ActivityInstCode,
                              b.Title
                          };

            var lstAttachment = new List<LstAttachmentWf>();
            if (actInst.Any())
            {
                foreach (var item in actInst)
                {
                    var data = ((from a in _context.ActivityInstFiles.Where(x => x.ActivityInstCode.Equals(item.ActivityInstCode) && !x.IsDeleted)
                                 select new LstAttachment
                                 {
                                     Id = a.ID,
                                     FileName = a.FileName,
                                     FileUrl = a.FilePath,
                                     MemberId = a.CreatedBy,
                                     FileCode = a.FileID,
                                     CreatedTime = a.CreatedTime.Value,
                                     Type = 1,
                                     Icon = "",
                                     Color = ""
                                 }).Union(
                    from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("ACT_INST")
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(item.ActivityInstCode))
                    select new LstAttachment
                    {
                        Id = a.ID,
                        FileName = a.FileName,
                        FileUrl = a.FileUrl,
                        MemberId = a.CreatedBy,
                        FileCode = a.FileID,
                        CreatedTime = a.CreatedTime,
                        Type = 2,
                        Icon = "",
                        Color = ""
                    })).ToList();

                    foreach (var file in data)
                    {
                        var extension = Path.GetExtension(file.FileUrl);
                        if (extension.Equals(".doc") || extension.Equals(".docx"))
                        {
                            file.Icon = "fa fa-file-word-o";
                            file.Color = "rgb(13,118,206);font-size: 15px;";
                        }
                        else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                        {
                            file.Icon = "fa fa-file-excel-o";
                            file.Color = "rgb(106,170,89);font-size: 15px;";
                        }
                        else if (extension.Equals(".pdf"))
                        {
                            file.Icon = "fa fa-file-pdf-o";
                            file.Color = "rgb(226,165,139);font-size: 15px;";
                        }
                        //'.JPG', '.PNG', '.TIF', '.TIFF'
                        else if (extension.ToUpper().Equals(".JPG") || extension.ToUpper().Equals(".PNG")
                            || extension.ToUpper().Equals(".TIF") || extension.ToUpper().Equals(".TIFF"))
                        {
                            file.Icon = "fa fa-picture-o";
                            file.Color = "rgb(42,42,42);font-size: 15px;";
                        }
                        else
                        {
                            file.Icon = "fa fa-file-o";
                            file.Color = "rgb(42,42,42);font-size: 15px;";
                        }
                    }

                    var attach = new LstAttachmentWf
                    {
                        ActivityInstCode = item.ActivityInstCode,
                        Title = item.Title,
                        LstAttachment = data
                    };

                    lstAttachment.Add(attach);
                }
            }
            return Json(lstAttachment);
        }

        [HttpPost]
        public JsonResult GetResultAttrData(string wfInstCode)
        {
            var query = (from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.WorkFlowCode.Equals(wfInstCode))
                         join b in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals b.AttrCode
                         join c in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.ActCode equals c.ActivityInstCode
                         join d in _context.Users on a.CreatedBy equals d.UserName
                         select new
                         {
                             ActInstCode = a.ActCode,
                             Title = c.Title,
                             Value = a.Value,
                             a.AttrCode,
                             CreatedBy = d.GivenName,
                             CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                             b.AttrName,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.AttrUnit)).ValueSet,
                             AttrTypeData = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.AttrDataType)).ValueSet
                         }).OrderByDescending(x => x.ActInstCode);
            return Json(query);
        }

        public class LstAttachmentWf
        {
            public LstAttachmentWf()
            {
                LstAttachment = new List<LstAttachment>();
            }
            public string ActivityInstCode { get; set; }
            public string Title { get; set; }
            public List<LstAttachment> LstAttachment { get; set; }
        }
        #endregion

        #region Attr data
        [HttpPost]
        public JsonResult GetAttrData([FromBody] AttrDataModel jTablepara)
        {
            var query = (from a in _context.AttrSetups.Where(x => !x.IsDeleted)
                         where a.ActCode.Equals(jTablepara.ActCode)
                         select new
                         {
                             a.ID,
                             a.AttrCode,
                             Value = "",
                             a.AttrName,
                             Unit = a.AttrUnit,
                             AttrTypeData = a.AttrDataType
                         });
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetLstResultAttrData([FromBody] AttrDataModel data)
        {
            var query = (from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.WorkFlowCode.Equals(data.WfCode))
                         join b in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals b.AttrCode
                         join c in _context.Users on a.CreatedBy equals c.UserName
                         where a.ActCode.Equals(data.ActCode)
                         select new
                         {
                             Value = a.Value,
                             a.AttrCode,
                             CreatedBy = c.GivenName,
                             a.CreatedTime,
                             b.AttrName,
                             Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.AttrUnit)).ValueSet,
                             AttrTypeData = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet.Equals(b.AttrDataType)).ValueSet
                         }).GroupBy(x => x.CreatedBy);

            var lstResult = new List<AttrData>();
            var index = 0;
            foreach (var item in query)
            {
                foreach (var i in item)
                {
                    var attrData = new AttrData();
                    attrData.AttrCode = i.AttrCode;
                    attrData.AttrName = i.AttrName;
                    attrData.Value = i.Value;
                    attrData.CreatedBy = i.CreatedBy;
                    attrData.Unit = i.Unit;
                    attrData.CreatedTime = i.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy");
                    attrData.Background = index % 2 == 0 ? "aliceblue" : "white";
                    lstResult.Add(attrData);
                }
                index++;
            }
            return Json(lstResult);
        }

        [HttpPost]
        public object InsertAttrData([FromBody] ActivityAttrDataModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var actAttrData = new ActivityAttrData()
                {
                    AttrCode = obj.AttrCode,
                    ObjCode = obj.ObjCode,
                    WorkFlowCode = obj.WorkFlowCode,
                    ActCode = obj.ActCode,
                    Value = obj.Value,
                    Note = "",
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.ActivityAttrDatas.Add(actAttrData);

                _context.SaveChanges();
                msg.Title = "Lưu kết quả thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class AttrDataModel : JTableModel
        {
            public string ObjectCode { get; set; }
            public string ActCode { get; set; }
            public string WfCode { get; set; }
        }

        public class ActivityAttrDataModel
        {
            public string ObjCode { get; set; }
            public string WorkFlowCode { get; set; }
            public string ActCode { get; set; }
            public string Value { get; set; }
            public string AttrCode { get; set; }
        }
        public class AttrData
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string Value { get; set; }
            public string AttrName { get; set; }
            public string Unit { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public string Background { get; set; }
        }

        #endregion

        #region Object instance
        [HttpPost]
        public JsonResult GetObjTypeJC()
        {
            var data = _context.JcObjectTypes.Where(x => !x.IsDeleted).Select(x => new { Code = x.ObjTypeCode, Name = x.ObjTypeName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertObjectProcess([FromBody] WfActivityObjectProccessing data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WfActivityObjectProccessings.FirstOrDefault(x => !x.IsDeleted && x.ActInstCode == data.ActInstCode
                    && x.ObjectType == data.ObjectType && x.ObjectInst == data.ObjectInst);
                if (check == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;
                    _context.WfActivityObjectProccessings.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đối tượng đã tồn tại";
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
        public JsonResult GetObjectProcess(string actInstCode)
        {
            var data = _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ActInstCode == actInstCode);
            var lst = new List<ObjectProcessModel>();
            if (data.Any())
            {
                foreach (var item in data)
                {
                    switch (item.ObjectType)
                    {
                        case "CONTRACT":
                            var contract = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == item.ObjectInst)
                                            join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                            from b in b1.DefaultIfEmpty()
                                            select new ObjectProcessModel
                                            {
                                                Id = item.ID,
                                                Beshare = item.Beshare,
                                                CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                                Status = b != null ? b.ValueSet : "",
                                                ObjectCode = item.ObjectInst,
                                                ObjectName = a.Title,
                                                CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                                ObjEntry = item.ObjEntry,
                                                ObjType = item.ObjectType
                                            }).FirstOrDefault();
                            lst.Add(contract);
                            break;

                        case "PROJECT":
                            var project = (from a in _context.Projects.Where(x => !x.FlagDeleted && x.ProjectCode == item.ObjectInst)
                                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                           from b in b1.DefaultIfEmpty()
                                           select new ObjectProcessModel
                                           {
                                               Id = item.ID,
                                               Beshare = item.Beshare,
                                               CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                               Status = b != null ? b.ValueSet : "",
                                               ObjectCode = item.ObjectInst,
                                               ObjectName = a.ProjectTitle,
                                               CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                               ObjEntry = item.ObjEntry,
                                               ObjType = item.ObjectType
                                           }).FirstOrDefault();
                            lst.Add(project);
                            break;
                        case "CONTRACT_PO":
                            var po = (from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == item.ObjectInst)
                                      join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                      from b in b1.DefaultIfEmpty()
                                      select new ObjectProcessModel
                                      {
                                          Id = item.ID,
                                          Beshare = item.Beshare,
                                          CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                          Status = b != null ? b.ValueSet : "",
                                          ObjectCode = item.ObjectInst,
                                          ObjectName = a.PoTitle,
                                          CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                          ObjEntry = item.ObjEntry,
                                          ObjType = item.ObjectType
                                      }).FirstOrDefault();
                            lst.Add(po);
                            break;
                        case "SUPPLIER":
                            var supp = (from a in _context.Suppliers.Where(x => !x.IsDeleted && x.SupCode == item.ObjectInst)
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                        from b in b1.DefaultIfEmpty()
                                        select new ObjectProcessModel
                                        {
                                            Id = item.ID,
                                            Beshare = item.Beshare,
                                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                            Status = b != null ? b.ValueSet : "",
                                            ObjectCode = item.ObjectInst,
                                            ObjectName = a.SupName,
                                            CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                            ObjEntry = item.ObjEntry,
                                            ObjType = item.ObjectType
                                        }).FirstOrDefault();
                            lst.Add(supp);
                            break;
                        case "CUSTOMER":
                            var cus = (from a in _context.Customerss.Where(x => !x.IsDeleted && x.CusCode == item.ObjectInst)
                                       join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                       from b in b1.DefaultIfEmpty()
                                       select new ObjectProcessModel
                                       {
                                           Id = item.ID,
                                           Beshare = item.Beshare,
                                           CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                           Status = b != null ? b.ValueSet : "",
                                           ObjectCode = item.ObjectInst,
                                           ObjectName = a.CusName,
                                           CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                           ObjEntry = item.ObjEntry,
                                           ObjType = item.ObjectType
                                       }).FirstOrDefault();
                            lst.Add(cus);
                            break;
                        case "REQUEST_PRICE":
                            var rqPrice = (from a in _context.RequestPriceHeaders.Where(x => !x.IsDeleted && x.ReqCode == item.ObjectInst)
                                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                           from b in b1.DefaultIfEmpty()
                                           select new ObjectProcessModel
                                           {
                                               Id = item.ID,
                                               Beshare = item.Beshare,
                                               CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                               Status = b != null ? b.ValueSet : "",
                                               ObjectCode = item.ObjectInst,
                                               ObjectName = a.Title,
                                               CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                               ObjEntry = item.ObjEntry,
                                               ObjType = item.ObjectType
                                           }).FirstOrDefault();
                            lst.Add(rqPrice);
                            break;
                        case "ORDER_REQUEST":
                            var orderRQ = (from a in _context.OrderRequestRaws.Where(x => x.ReqCode == item.ObjectInst)
                                           join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                           from b in b1.DefaultIfEmpty()
                                           select new ObjectProcessModel
                                           {
                                               Id = item.ID,
                                               Beshare = item.Beshare,
                                               CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                               Status = b != null ? b.ValueSet : "",
                                               ObjectCode = item.ObjectInst,
                                               ObjectName = a.Title,
                                               CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                               ObjEntry = item.ObjEntry,
                                               ObjType = item.ObjectType
                                           }).FirstOrDefault();
                            lst.Add(orderRQ);
                            break;
                        case "SERVICECAT":
                            var serCat = (from a in _context.ServiceCategorys.Where(x => x.ServiceCode == item.ObjectInst && !x.IsDeleted)
                                          select new ObjectProcessModel
                                          {
                                              Id = item.ID,
                                              Beshare = item.Beshare,
                                              CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                              Status = "",
                                              ObjectCode = item.ObjectInst,
                                              ObjectName = a.ServiceName,
                                              CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                              ObjEntry = item.ObjEntry,
                                              ObjType = item.ObjectType
                                          }).FirstOrDefault();
                            lst.Add(serCat);
                            break;
                        case "PRODUCT":
                            var prod = (from a in _context.MaterialProducts.Where(x => x.ProductCode == item.ObjectInst && !x.IsDeleted)
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                        from b in b1.DefaultIfEmpty()
                                        select new ObjectProcessModel
                                        {
                                            Id = item.ID,
                                            Beshare = item.Beshare,
                                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                            Status = b != null ? b.ValueSet : "",
                                            ObjectCode = item.ObjectInst,
                                            ObjectName = a.ProductName,
                                            CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                            ObjEntry = item.ObjEntry,
                                            ObjType = item.ObjectType
                                        }).FirstOrDefault();
                            lst.Add(prod);
                            break;
                        case "CARD_JOB":
                            var card = (from a in _context.WORKOSCards.Where(x => x.CardCode == item.ObjectInst && !x.IsDeleted && x.Status != "TRASH")
                                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                                        from b in b1.DefaultIfEmpty()
                                        select new ObjectProcessModel
                                        {
                                            Id = item.ID,
                                            Beshare = item.Beshare,
                                            CreatedBy = _context.Users.FirstOrDefault(x => x.UserName == item.CreatedBy).GivenName,
                                            Status = b != null ? b.ValueSet : "",
                                            ObjectCode = item.ObjectInst,
                                            ObjectName = a.CardName,
                                            CreatedTime = item.CreatedTime.ToString("HH:mm dd/MM/yyyy"),
                                            ObjEntry = item.ObjEntry,
                                            ObjType = item.ObjectType
                                        }).FirstOrDefault();
                            lst.Add(card);
                            break;
                    }
                }
            }
            return Json(lst);
        }

        [HttpPost]
        public JsonResult GetActInstance()
        {
            var data = _context.ActivityInstances.Where(x => !x.IsDeleted)
                .Select(x => new { Code = x.ActivityInstCode, Name = x.Title });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetActRelaObject(string objType, string objCode)
        {
            var data = from a in _context.WfActivityObjectProccessings.Where(x => !x.IsDeleted && x.ObjectType == objType && x.ObjectInst == objCode && x.Beshare)
                       join b in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.ActInstCode equals b.ActivityInstCode
                       select new
                       {
                           a.ID,
                           b.Title
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeleteObjectProcessingShare(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.WfActivityObjectProccessings.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WfActivityObjectProccessings.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class ObjectProcessModel
        {
            public int Id { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectName { get; set; }
            public bool Beshare { get; set; }
            public string Status { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public bool ObjEntry { get; set; }
            public string ObjType { get; set; }
        }
        #endregion

        #region Assign member

        [HttpGet]
        public JsonResult GetStatusAssign()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ASSIGN_STATUS"))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetMemberAssign([FromBody] AssignModel jTablepara)
        {
            var session = HttpContext.GetSessionUser();
            var query = (from a in _context.ExcuterControlRoles.Where(x => !x.IsDeleted)
                         join b in _context.Users on a.UserId equals b.Id into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on b.DepartmentId equals c.DepartmentCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "WORKFLOW_WORKING_ROLE_TYPE") on a.UserId equals d.CodeSet into d1
                         from d in d1.DefaultIfEmpty()
                         where a.ActivityCode.Equals(jTablepara.ActivityCode)
                         select new
                         {
                             Id = a.ID,
                             UserId = b != null ? b.Id : (d != null ? d.CodeSet : ""),
                             UserName = b != null ? b.UserName : (d != null ? d.CodeSet : ""),
                             GivenName = b != null ? b.GivenName : (d != null ? d.ValueSet : ""),
                             Role = a.Role,
                             Department = b != null && !string.IsNullOrEmpty(b.DepartmentId) ? b.DepartmentId : "",
                             DepartmentName = c2 != null ? c2.Title : "",
                             Status = a.Status,
                             RoleSys = b != null && (from m in _context.UserRoles.Where(x => x.UserId.Equals(b.Id))
                                        join n in _context.Roles on m.RoleId equals n.Id
                                        select n).FirstOrDefault() != null ? (from m in _context.UserRoles.Where(x => x.UserId.Equals(b.Id))
                                                                              join n in _context.Roles on m.RoleId equals n.Id
                                                                              select n).FirstOrDefault().Title : ""
                         }).ToList();
            return Json(query);
        }

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
        public JsonResult UpdateRole(int id, string role)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                if (data != null)
                {
                    data.Role = role;
                    _context.ExcuterControlRoles.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult UpdateStatus(int id, string status)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ExcuterControlRoles.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                if (data != null)
                {
                    data.Status = status;
                    _context.ExcuterControlRoles.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi";
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
        public JsonResult GetCreatorAssign(string actCode)
        {
            //var query = from a in _context.ExcuterControlRoles.Where(x => !x.IsDeleted 
            //            && x.ActivityCode.Equals(actCode) 
            //            && (x.UserId.Equals(EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator))
            //            || x.UserId.Equals(EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.CreatorManager))))
            //            select new
            //            {
            //                GivenName = a.UserId.Equals(EnumHelper<CreatorAssign>.GetDisplayValue(CreatorAssign.Creator)) ?
            //                                "Nhân viên lập yêu cầu" : "Cấp quản lý",
            //                            a.ID,
            //                            a.Approve
            //            };
            var query = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "WORKFLOW_WORKING_ROLE_TYPE")
                        select new
                        {
                            GivenName = a.ValueSet,
                            ID = a.CodeSet
                        };
            return Json(query);
        }

        public class AssignModel
        {
            public string ActivityCode { get; set; }
        }

        #endregion

        #region Share file

        [HttpPost]
        public JsonResult GetObjFileShare()
        {
            var data = new List<ObjFileShare>();
            var contract = new ObjFileShare
            {
                Code = "CONTRACT",
                Name = "Hợp đồng bán"
            };
            data.Add(contract);

            var contractPO = new ObjFileShare
            {
                Code = "CONTRACT_PO",
                Name = "Hợp đồng mua"
            };
            data.Add(contractPO);

            var project = new ObjFileShare
            {
                Code = "PROJECT",
                Name = "Dự án/đấu thầu"
            };
            data.Add(project);

            var customer = new ObjFileShare
            {
                Code = "CUSTOMER",
                Name = "Khách hàng"
            };
            data.Add(customer);

            var supp = new ObjFileShare
            {
                Code = "SUPPLIER",
                Name = "Nhà cung cấp"
            };
            data.Add(supp);

            var product = new ObjFileShare
            {
                Code = "PRODUCT",
                Name = "Hàng hóa và vật tư"
            };
            data.Add(product);

            var jobCard = new ObjFileShare
            {
                Code = "JOBCARD",
                Name = "Thẻ việc"
            };
            data.Add(jobCard);

            var asset = new ObjFileShare
            {
                Code = "ASSET",
                Name = "Tài sản"
            };
            data.Add(asset);

            var fund = new ObjFileShare
            {
                Code = "FUND",
                Name = "Quỹ"
            };
            data.Add(fund);

            var user = new ObjFileShare
            {
                Code = "USER",
                Name = "Tệp tin đã tải lên"
            };
            data.Add(user);

            var cms = new ObjFileShare
            {
                Code = "CMS",
                Name = "Bài viết"
            };
            data.Add(cms);

            return Json(data);
        }

        [HttpPost]
        public JsonResult GetFileByObjShare([FromBody] FileShareModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            IQueryable<GridFileShare> query = null;

            if (string.IsNullOrEmpty(jTablePara.ObjCode))
            {
                var query2 = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                              join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                              join d in _context.EDMSRepositorys on a.ReposCode equals d.ReposCode into d2
                              from d in d2.DefaultIfEmpty()
                              join e in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals e.CatCode into e1
                              from e in e1.DefaultIfEmpty()
                              where (jTablePara.LstObjCode.Count() != 0 && (jTablePara.LstObjCode.Any(x => x == b.CatCode)))
                              select new { a, b, d, e });
                var query3 = query2.AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length);
                var count = (from a in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true))
                             join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                             select a).AsNoTracking().Count();

                query = query3.Select(x => new GridFileShare
                {
                    Id = x.b != null ? x.b.Id : -1,
                    FileCode = x.a.FileCode,
                    FileName = x.a.FileName,
                    FileCreated = x.a.CreatedBy,
                    FileUrl = x.a.Url,
                });
            }
            else
            {
                switch (jTablePara.ObjCode)
                {
                    case "CONTRACT":
                        query = GetFileContract();
                        break;

                    case "CONTRACT_PO":
                        query = GetFileContractPO();
                        break;

                    case "PROJECT":
                        query = GetFileProject();
                        break;

                    case "CUSTOMER":
                        query = GetFileCustomer();
                        break;

                    case "SUPPLIER":
                        query = GetFileSupplier();
                        break;

                    case "PRODUCT":
                        query = GetFileProduct();
                        break;

                    case "JOBCARD":
                        query = GetFileCardJob();
                        break;

                    case "ASSET":
                        query = GetFileAsset();
                        break;

                    case "FUND":
                        query = GetFileFund();
                        break;

                    case "CMS":
                        query = GetFileCms();
                        break;

                    case "USER":
                        query = GetFileUser();
                        break;
                }
            }
            if (query != null && query.Any())
            {
                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileName", "FileCode", "FileUrl", "FileCreated");
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(new List<GridFileShare>(), jTablePara.Draw, 0, "Id", "FileName", "FileCode", "FileUrl", "FileCreated");
                return Json(jdata);
            }
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileContract()
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileContractPO()
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<PoSupplierEnum>.GetDisplayValue(PoSupplierEnum.PoSupplier))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileProject()
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileCustomer()
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileSupplier()
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
                        join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileProduct()
        {
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<WarehouseEnum>.GetDisplayValue(WarehouseEnum.Warehouse))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new GridFileShare
                          {
                              Id = a.Id,
                              FileCode = b.FileCode,
                              FileName = b.FileName,
                              FileUrl = b.Url,
                              FileCreated = b.CreatedBy
                          }).Union(
                          from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<EnumMaterialProduct>.GetDisplayValue(EnumMaterialProduct.Product))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new GridFileShare
                          {
                              Id = a.Id,
                              FileCode = b.FileCode,
                              FileName = b.FileName,
                              FileUrl = b.Url,
                              FileCreated = b.CreatedBy
                          })).AsNoTracking();
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileCardJob()
        {
            var query = from a in _context.CardAttachments.Where(x => !x.Flag)
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = a.FileCode,
                            FileName = a.FileName,
                            FileUrl = a.FileUrl,
                            FileCreated = a.MemberId
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileAsset()
        {
            var query = from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                        join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                        join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                        from f in f1.DefaultIfEmpty()
                        select new GridFileShare
                        {
                            Id = a.Id,
                            FileCode = b.FileCode,
                            FileName = b.FileName,
                            FileUrl = b.Url,
                            FileCreated = b.CreatedBy
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileFund()
        {
            var query = _context.FundFiless.Where(x => !x.IsDeleted).Select(x => new GridFileShare
            {
                Id = x.Id,
                FileCode = x.FileCode,
                FileName = x.FileName,
                FileUrl = x.FilePath,
                FileCreated = x.CreatedBy
            });
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileCms()
        {
            var query = from a in _context.cms_attachments
                        select new GridFileShare
                        {
                            Id = a.id,
                            FileCode = "",
                            FileName = a.file_name,
                            FileUrl = a.file_url,
                            FileCreated = ""
                        };
            return query;
        }

        [NonAction]
        public IQueryable<GridFileShare> GetFileUser()
        {
            var query = (from a in _context.EDMSRepoCatFiles
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.CreatedBy.Equals(ESEIM.AppContext.UserName) && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         select new GridFileShare
                         {
                             Id = a.Id,
                             FileCode = b.FileCode,
                             FileName = b.FileName,
                             FileUrl = b.Url,
                             FileCreated = b.CreatedBy
                         }).Union(
                  from a in _context.FundFiless.Where(x => !x.IsDeleted && x.CreatedBy.Equals(ESEIM.AppContext.UserName))
                  select new GridFileShare
                  {
                      Id = a.Id,
                      FileCode = a.FileCode,
                      FileName = a.FileName,
                      FileUrl = a.FilePath,
                      FileCreated = a.CreatedBy
                  }).Union(
                from a in _context.CardAttachments.Where(x => !x.Flag && x.MemberId.Equals(ESEIM.AppContext.UserName))
                select new GridFileShare
                {
                    Id = a.Id,
                    FileCode = a.FileCode,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    FileCreated = a.MemberId
                }).Union(
                from a in _context.cms_attachments
                select new GridFileShare
                {
                    Id = a.id,
                    FileCode = "",
                    FileName = a.file_name,
                    FileUrl = a.file_url,
                    FileCreated = ""
                });
            return query;
        }

        [HttpPost]
        public JsonResult InsertFileShare([FromBody] List<FilesShareObjectUserModel> obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                if (obj.Any())
                {
                    foreach (var item in obj)
                    {
                        var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(item.FileID)
                            && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(item.ObjectInstance));
                        if (check == null)
                        {
                            var rela = new ObjRelative
                            {
                                ObjectType = "ACT_INST",
                                ObjectInstance = item.ObjectInstance
                            };
                            var files = new FilesShareObjectUser
                            {
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                FileID = item.FileID,
                                FileCreated = item.FileCreated,
                                FileUrl = item.FileUrl,
                                FileName = item.FileName,
                                ObjectRelative = JsonConvert.SerializeObject(rela)
                            };
                            _context.FilesShareObjectUsers.Add(files);

                        }
                    }
                    _context.SaveChanges();
                    msg.Title = "Chọn tệp tin thành công";
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
        public JsonResult GetTemplate()
        {
            var data = _context.ActivityFiles.Where(x => !x.IsDeleted)
                .Select(x => new { Code = x.FileID, Name = x.FileName });
            return Json(data);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                }
                else
                {
                    var mimeType = fileUpload.ContentType;
                    var extension = Path.GetExtension(fileUpload.FileName);
                    msg.Object = upload.Object;
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

        [HttpPost]
        public JsonResult AddAttachment([FromBody] ActivityInstFile data)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                string code = "ATTACHMENT_" + data.ActivityInstCode + (_context.ActivityInstFiles.Count() > 0 ? _context.ActivityInstFiles.Last().ID + 1 : 0);
                data.FileID = code;
                data.CreatedTime = DateTime.Now;
                data.CreatedBy = ESEIM.AppContext.UserName;
                _context.ActivityInstFiles.Add(data);
                _context.SaveChanges();

                msg.Title = "Tải tệp thành công";
                msg.Error = false;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult GetAttachment(string actInstCode)
        {
            var data = ((from a in _context.ActivityInstFiles.Where(x => x.ActivityInstCode.Equals(actInstCode) && !x.IsDeleted)
                         select new LstAttachment
                         {
                             Id = a.ID,
                             FileName = a.FileName,
                             FileUrl = a.FilePath,
                             MemberId = a.CreatedBy,
                             FileCode = a.FileID,
                             CreatedTime = a.CreatedTime.Value,
                             Type = 1,
                             Icon = "",
                             Color = ""
                         }).Union(
                from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("ACT_INST")
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(actInstCode))
                select new LstAttachment
                {
                    Id = a.ID,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    MemberId = a.CreatedBy,
                    FileCode = a.FileID,
                    CreatedTime = a.CreatedTime,
                    Type = 2,
                    Icon = "",
                    Color = ""
                })).ToList();
            foreach (var item in data)
            {
                var extension = Path.GetExtension(item.FileUrl);
                if (extension.Equals(".doc") || extension.Equals(".docx"))
                {
                    item.Icon = "fa fa-file-word-o";
                    item.Color = "rgb(13,118,206);font-size: 15px;";
                }
                else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                {
                    item.Icon = "fa fa-file-excel-o";
                    item.Color = "rgb(106,170,89);font-size: 15px;";
                }
                else if (extension.Equals(".pdf"))
                {
                    item.Icon = "fa fa-file-pdf-o";
                    item.Color = "rgb(226,165,139);font-size: 15px;";
                }
                //'.JPG', '.PNG', '.TIF', '.TIFF'
                else if (extension.ToUpper().Equals(".JPG") || extension.ToUpper().Equals(".PNG")
                    || extension.ToUpper().Equals(".TIF") || extension.ToUpper().Equals(".TIFF"))
                {
                    item.Icon = "fa fa-picture-o";
                    item.Color = "rgb(42,42,42);font-size: 15px;";
                }
                else
                {
                    item.Icon = "fa fa-file-o";
                    item.Color = "rgb(42,42,42);font-size: 15px;";
                }
            }
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeleteAttachment([FromBody] DelAttachment obj)
        {
            var msg = new JMessage() { Error = true };
            var currentUser = ESEIM.AppContext.UserName;
            try
            {
                if (obj.Type == 1)
                {
                    var data = _context.ActivityInstFiles.FirstOrDefault(x => x.FileID.Equals(obj.FileCode));
                    if (data != null)
                    {
                        if (data.CreatedBy == currentUser)
                        {
                            data.IsDeleted = true;
                            data.DeletedBy = currentUser;
                            data.DeletedTime = DateTime.Now;
                            _context.ActivityInstFiles.Update(data);
                            _context.SaveChanges();

                            msg.Error = false;
                            msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Bạn không phải người tạo";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không tìm thấy tệp tin";
                    }
                }
                else if (obj.Type == 2)
                {
                    var data = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(obj.FileCode)
                    && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("ACT_INST")
                    && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(obj.ActInstCode));
                    if (data != null)
                    {
                        if (data.CreatedBy == ESEIM.AppContext.UserName)
                        {
                            data.IsDeleted = true;
                            data.DeletedBy = ESEIM.AppContext.UserName;
                            data.DeletedTime = DateTime.Now;
                            _context.FilesShareObjectUsers.Update(data);
                            _context.SaveChanges();
                            msg.Error = false;
                            msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["CJ_MSG_CANNOT_DELETE"];
                        }
                    }
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }

        [HttpGet]
        public object IsFileEdms(string fileCode, string url)
        {
            var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(fileCode))
                        join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                        from c in c2.DefaultIfEmpty()
                        where c.Url.Equals(url)
                        select new
                        {
                            a.Id,
                            Server = (b != null ? b.Server : null),
                            Type = (b != null ? b.Type : null),
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
                            c.FileParentId,
                            c.FileID,
                            c.ListUserView
                        }).FirstOrDefault();
            if (data != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        [HttpGet]
        public IActionResult Download(string fileCode, string url)
        {
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(fileCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            where c.Url.Equals(url)
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
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
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();
                if (data != null)
                {
                    if (data.Type == "SERVER")
                    {
                        if (!string.IsNullOrEmpty(data.Server))
                        {
                            string ftphost = data.Server;
                            string ftpfilepath = data.Url;
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                            using (WebClient request = new WebClient())
                            {
                                request.Credentials = new NetworkCredential(data.Account, data.PassWord);
                                byte[] fileData = request.DownloadData(urlEnd);
                                return File(fileData, data.MimeType, string.Concat(data.FileName, data.FileTypePhysic));
                            }
                        }
                    }
                    else
                    {
                        var fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", data.FileId);
                        return File(fileData, data.MimeType, string.Concat(data.FileName, data.FileTypePhysic));
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        [HttpPost]
        public void ViewFileOnline([FromBody] ViewFileObj obj)
        {
            try
            {
                DocmanController.pathFile = string.Empty;
                DocmanController.pathFileFTP = string.Empty;

                ExcelController.pathFile = string.Empty;
                ExcelController.pathFileFTP = string.Empty;

                PDFController.pathFile = string.Empty;
                PDFController.pathFileFTP = string.Empty;

                var aseanDoc = new AseanDocument();
                var edms = (from a in _context.EDMSRepoCatFiles.Where(x => x.FileCode.Equals(obj.FileCode))
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
                            where c.Url.Equals(obj.Url)
                            select new
                            {
                                a.Id,
                                Server = (b != null ? b.Server : null),
                                Type = (b != null ? b.Type : null),
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
                                c.FileParentId,
                                c.FileID,
                                c.ListUserView
                            }).FirstOrDefault();
                if (edms == null)
                {
                    var extension = Path.GetExtension(obj.Url);
                    aseanDoc.File_Code = obj.FileCode;
                    aseanDoc.Mode = 2;
                    aseanDoc.FirstPage = "/Admin/CardJob";

                    if (extension.Equals(".doc") || extension.Equals(".docx"))
                    {
                        DocmanController.docmodel = aseanDoc;
                        DocmanController.pathFile = obj.Url;
                        DocmanController.cardCode = obj.ActInstCode;
                    }
                    else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                    {
                        ExcelController.pathFileFTP = "";
                        ExcelController.docmodel = aseanDoc;
                        ExcelController.fileCode = obj.FileCode;
                        ExcelController.pathFile = obj.Url;
                        ExcelController.cardCode = obj.ActInstCode;
                    }
                    else if (extension.Equals(".pdf"))
                    {
                        PDFController.docmodel = aseanDoc;
                        PDFController.pathFile = obj.Url;
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(edms.Server))
                    {
                        string ftphost = edms.Server;
                        string ftpfilepath = edms.Url;
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                        var fileTempName = edms.FileName + Path.GetExtension(edms.FileName);
                        using (WebClient request = new WebClient())
                        {
                            request.Credentials = new NetworkCredential(edms.Account, edms.PassWord);
                            byte[] fileData = request.DownloadData(urlEnd);
                            JMessage msg1 = _upload.UploadFileByBytes(fileData, fileTempName, _hostingEnvironment.WebRootPath, "uploads\\files");
                            string path = msg1.Object.ToString();
                            string pathConvert = "/" + path.Replace("\\", "/");

                            var extension = Path.GetExtension(path);
                            aseanDoc.Mode = 2;
                            aseanDoc.FirstPage = "/Admin/CardJob";

                            if (extension.Equals(".doc") || extension.Equals(".docx"))
                            {
                                DocmanController.docmodel = aseanDoc;
                                DocmanController.pathFile = pathConvert;
                                DocmanController.cardCode = obj.ActInstCode;
                            }
                            else if (extension.Equals(".xls") || extension.Equals(".xlsx"))
                            {
                                ExcelController.pathFileFTP = "";
                                ExcelController.docmodel = aseanDoc;
                                ExcelController.fileCode = obj.FileCode;
                                ExcelController.pathFile = pathConvert;
                                ExcelController.cardCode = obj.ActInstCode;
                            }
                            else if (extension.Equals(".pdf"))
                            {
                                PDFController.docmodel = aseanDoc;
                                PDFController.pathFile = pathConvert;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public class ObjFileShare
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public class FileShareModel : JTableModel
        {
            public string ObjCode { get; set; }
            public List<string> LstObjCode { get; set; }
        }
        public class GridFileShare
        {
            public int Id { get; set; }
            public string FileCode { get; set; }
            public string FileName { get; set; }
            public string FileUrl { get; set; }
            public string FileCreated { get; set; }
        }
        public class FilesShareObjectUserModel
        {
            public string FileID { get; set; }
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
            public string FileCreated { get; set; }
            public string FileUrl { get; set; }
            public string FileName { get; set; }
        }
        public class ObjRelative
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }
        public class LstAttachment
        {
            public int Id { get; set; }
            public string FileName { get; set; }
            public string FileUrl { get; set; }
            public string MemberId { get; set; }
            public string FileCode { get; set; }
            public string Icon { get; set; }
            public string Color { get; set; }
            public DateTime CreatedTime { get; set; }
            public int Type { get; set; }
        }
        public class DelAttachment
        {
            public int Type { get; set; }
            public string FileCode { get; set; }
            public string ActInstCode { get; set; }
        }
        public class ViewFileObj
        {
            public string FileCode { get; set; }
            public string Url { get; set; }
            public string ActInstCode { get; set; }
        }
        #endregion

        #region Command
        [HttpPost]
        public JsonResult GetConfirm()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CONFIRM_COMMAND")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetApprove()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "APPROVE_COMMAND")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetStatusCommand()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("STATUS_COMMAND"))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetDesActivity(string actInstCode)
        {
            var data = from a in _context.WorkflowInstanceRunnings.Where(x => !x.IsDeleted && x.ActivityInitial == actInstCode)
                       join b in _context.ActivityInstances.Where(x => !x.IsDeleted) on a.ActivityDestination equals b.ActivityInstCode
                       select new
                       {
                           Code = a.ActivityDestination,
                           Name = b.Title
                       };
            return Json(data);
        }

        public class ModelCommand
        {
            public string WfInstCode { get; set; }
            public string Command { get; set; }
            public string Status { get; set; }
            public string ActInstCode { get; set; }
        }
        public class ViewTableCommand
        {
            public string ID { get; set; }
            public string Sender { get; set; }
            public string Receiver { get; set; }
            public string MsgDescribe { get; set; }
            public string Status { get; set; }
            public string CreatedTime { get; set; }
            public string ActFrom { get; set; }
            public string ActTo { get; set; }
        }

        #endregion

        #region Mile stone
        [HttpGet]
        public JsonResult CountMilestone(string wfCode)
        {
            var data = (from a in _context.WorkFlows.Where(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode))
                        join b in _context.Activitys.Where(x => !x.IsDeleted) on a.WfCode equals b.WorkflowCode
                        join c in _context.WorkflowMilestones.Where(x => !x.IsDeleted) on b.WorkflowCode equals c.WorkflowCode
                        select new
                        {
                            c.MilestoneCode,
                            MileStone = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted).ValueSet ?? ""
                        }).GroupBy(x => x.MilestoneCode);
            var lstMile = new List<MileStoneModel>();
            foreach (var item in data)
            {
                var miles = new MileStoneModel
                {
                    CountMileStone = data.Count(),
                    MileStoneName = item.First().MileStone,
                    MileStoneCode = item.First().MilestoneCode
                };
                lstMile.Add(miles);
            }
            return Json(lstMile);
        }

        [HttpGet]
        public JsonResult GetActivity(string wfCode)
        {
            var data = (from a in _context.WorkFlows.Where(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode))
                        join b in _context.Activitys.Where(x => !x.IsDeleted) on a.WfCode equals b.WorkflowCode
                        join c in _context.WorkflowMilestones.Where(x => !x.IsDeleted) on b.ActivityCode equals c.ActivityCode


                        select new
                        {
                            ID = b.ID,
                            Title = b.Title,
                            Status = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Status) && !x.IsDeleted).ValueSet ?? "",
                            Timer = b.Duration,
                            Unit = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b.Unit) && !x.IsDeleted).ValueSet ?? "",
                            shapJson = b.ShapeJson,
                            wf = a.WfCode,
                            MilestoneCode = c.MilestoneCode,
                            MileStone = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(c.MilestoneCode) && !x.IsDeleted).ValueSet ?? "",


                        });
            return Json(data);
        }

        [HttpGet]
        public JsonResult GetTransition(string WfCode)
        {
            var data = (from c in _context.WorkflowSettings.Where(x => !x.IsDeleted && x.WorkflowCode.Equals(WfCode))
                        join d in _context.Transitions.Where(x => !x.IsDeleted) on c.TransitionCode equals d.TrsCode
                        select new
                        {
                            ID = c.Id,
                            actintial = c.ActivityInitial,
                            actdes = c.ActivityDestination,
                            tranShapJson = d.TrsAttrGraph
                        });
            return Json(data);
        }

        public class MileStoneModel
        {
            public int CountMileStone { get; set; }
            public string MileStoneName { get; set; }
            public string MileStoneCode { get; set; }
        }

        #endregion

        #region Library

        [HttpGet]
        public JsonResult GetSharpLibraryImage()
        {
            var data = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "SHARP_LIBRARY")
                       select new
                       {
                           TypeName = a.ValueSet,
                           ListSharpLib = from b in _context.WFSharpLibrarys.Where(x => !x.IsDeleted && x.SharpType == a.CodeSet)
                                          select new
                                          {
                                              SharpCode = b.SharpCode,
                                              SharpName = b.SharpName,
                                              SharpData = b.SharpData,
                                              SharpType = b.SharpType,
                                              SharpPath = b.SharpPath,
                                          }
                       };

            //var data = (from a in _context.WFSharpLibrarys.Where(x => !x.IsDeleted)
            //            select new
            //            {
            //                SharpCode = a.SharpCode,
            //                SharpName = a.SharpName,
            //                SharpData = a.SharpData,
            //                SharpType = a.SharpType,
            //                SharpPath = a.SharpPath,
            //                TypeText = _context.CommonSettings.FirstOrDefault(x => x.CodeSet == a.SharpType).ValueSet ?? ""
            //            }).GroupBy(x => x.SharpType);
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertSharpLibrary([FromBody] WFSharpLibrary obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WFSharpLibrarys.FirstOrDefault(x => !x.IsDeleted && x.SharpCode.Equals(obj.SharpCode));
                if (check == null)
                {
                    var library = new WFSharpLibrary
                    {
                        SharpCode = obj.SharpCode,
                        SharpName = obj.SharpName,
                        SharpData = obj.SharpData,
                        SharpType = obj.SharpType,
                        SharpDesc = obj.SharpDesc,
                        SharpPath = obj.SharpPath,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WFSharpLibrarys.Add(library);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpGet]
        public JsonResult GetSharpLibraryItem(String SharpCode)
        {
            var id = Guid.NewGuid().ToString();
            var data = _context.WFSharpLibrarys.FirstOrDefault(x => !x.IsDeleted && x.SharpCode.Equals(SharpCode));
            var json = JsonConvert.DeserializeObject<ObjectActivity>(data.SharpData);
            json.id = id;
            data.SharpData = JsonConvert.SerializeObject(json);
            return Json(data);
        }

        public class Label
        {
            public string type { get; set; }
            public string id { get; set; }
            public string x { get; set; }
            public string y { get; set; }
            public string width { get; set; }
            public string height { get; set; }
            public string alpha { get; set; }
            public bool selectable { get; set; }
            public bool draggable { get; set; }
            public int angle { get; set; }
            public string cssClass { get; set; }
            public object userData { get; set; }
            public List<Port> ports { get; set; }
            public string bgColor { get; set; }
            public string color { get; set; }
            public string stroke { get; set; }
            public string radius { get; set; }
            public string dasharray { get; set; }
            public string text { get; set; }
            public string outlineStroke { get; set; }
            public string outlineColor { get; set; }
            public int fontSize { get; set; }
            public string fontColor { get; set; }
            public string fontFamily { get; set; }
            public string locator { get; set; }
            public string path { get; set; }
        }

        public class Port
        {
            public string type { get; set; }
            public string id { get; set; }
            public string width { get; set; }
            public string height { get; set; }
            public string alpha { get; set; }
            public bool selectable { get; set; }
            public bool draggable { get; set; }
            public int angle { get; set; }
            public object userData { get; set; }
            public string cssClass { get; set; }
            public string bgColor { get; set; }
            public string color { get; set; }
            public string stroke { get; set; }
            public string dasharray { get; set; }
            public decimal maxFanOut { get; set; }
            public string name { get; set; }
            public string semanticGroup { get; set; }
            public string port { get; set; }
            public string locator { get; set; }
            public object locatorAttr { get; set; }
        }

        public class ObjectActivity
        {
            public string type { get; set; }
            public string id { get; set; }
            public string x { get; set; }
            public string y { get; set; }
            public string width { get; set; }
            public string height { get; set; }
            public string alpha { get; set; }
            public bool selectable { get; set; }
            public bool draggable { get; set; }
            public string angle { get; set; }
            public object userData { get; set; }
            public string cssClass { get; set; }
            public List<Port> ports { get; set; }
            public string bgColor { get; set; }
            public string color { get; set; }
            public string stroke { get; set; }
            public string radius { get; set; }
            public string dasharray { get; set; }
            public string dirStrategy { get; set; }
            public List<Label> labels { get; set; }
        }

        #endregion

        #region FormBiulder
        public JsonResult GetTypeLibrary()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("SHARP_LIBRARY"))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertFormCat([FromBody] FormBiulderCat obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.FormBiulderCats.FirstOrDefault(x => !x.IsDeleted && x.FormCode.Equals(obj.FormCode));
                if (check == null)
                {
                    var form = new FormBiulderCat
                    {
                        FormCode = obj.FormCode,
                        FormName = obj.FormName,
                        FormGroup = obj.FormGroup,
                        FormType = obj.FormType,
                        FormNote = obj.FormNote,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.FormBiulderCats.Add(form);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Title = "Mã Form đã tồn tại";
                    msg.Error = true;
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
        public JsonResult GetItemFormCat(string FormCode)
        {
            var data = _context.FormBiulderCats.FirstOrDefault(x => !x.IsDeleted && x.FormCode.Equals(FormCode));
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateFormCat([FromBody] FormBiulderCat obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.FormBiulderCats.FirstOrDefault(x => !x.IsDeleted && x.FormCode.Equals(obj.FormCode));
                if (data != null)
                {
                    data.FormName = obj.FormName;
                    data.FormGroup = obj.FormGroup;
                    data.FormType = obj.FormType;
                    data.FormNote = obj.FormNote;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.FormBiulderCats.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
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
        public JsonResult DeleteFormCat(string FormCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.FormBiulderCats.FirstOrDefault(x => !x.IsDeleted && x.FormCode.Equals(FormCode));
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.FormBiulderCats.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                msg.Title = "Bản ghi không tồn tại";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertFormControl([FromBody] FormControl obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.FormControls.FirstOrDefault(x => !x.IsDeleted && x.FcCode.Equals(obj.FcCode));
                if (check == null)
                {
                    var formcontrol = new FormControl
                    {
                        FcCode = obj.FcCode,
                        FcName = obj.FcName,
                        FcParent = obj.FcParent,
                        FcAttribute = obj.FcAttribute,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.FormControls.Add(formcontrol);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Title = "Cập nhật thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetFormBuilder(string FormCode)
        {
            var data = (from a in _context.FormBiulderCats.Where(x => !x.IsDeleted && x.FormCode.Equals(FormCode))
                        join b in _context.FormControls.Where(x => !x.IsDeleted) on a.FormCode equals b.FcParent
                        select new
                        {
                            ID = b.Id,
                            Name = b.FcName,
                            shapJson = b.FcAttribute,
                            FormCode = a.FormCode
                        });
            return Json(data);
        }




        #endregion

        #region Draw Instance

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCard.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerAct.GetAllStrings().Select(x => new { x.Name, x.Value }))
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