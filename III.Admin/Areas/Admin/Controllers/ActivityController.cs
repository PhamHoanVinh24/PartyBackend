using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
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
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ActivityController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ActivityController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        public ActivityController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FilePluginController> stringLocalizerFp,
        IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerEdms = stringLocalizerEdms;
        }

        [Breadcrumb("ViewData.CrumbActivity", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuWfSystemController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuWfSystem"] = _sharedResources["COM_CRUMB_MENU_ACTIVITY"];
            ViewData["CrumbActivity"] = _sharedResources["COM_CRUMB_ACTIVITY"];
            return View();
        }

        #region Workflow Cat
        [HttpPost]
        public JsonResult JTableActivity([FromBody]JTableActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.WorkFlows.Where(x => !x.IsDeleted.Value)
                         join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "WF_GROUP") on a.WfGroup equals b.CodeSet into b1
                         from b in b1.DefaultIfEmpty()
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "WF_TYPE") on a.WfType equals c.CodeSet into c1
                         from c in c1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(jTablePara.WorkFlowCode) || a.WfCode.ToLower().Contains(jTablePara.WorkFlowCode.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Name) || a.WfName.ToLower().Contains(jTablePara.Name.ToLower()))
                         select new
                         {
                             a.Id,
                             a.WfCode,
                             a.WfName,
                             Group = b != null ? b.ValueSet : "",
                             Type = c != null ? c.ValueSet : "",
                             Note = a.WfNote,
                             IsPublic = a.IsPublic,
                             a.CreatedTime
                         }).OrderByDescending(x => x.CreatedTime);
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "WfCode", "WfName", "Group", "Type", "Note", "IsPublic");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult PublicWF(string wfCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var session = HttpContext.GetSessionUser();
            try
            {
                if (!session.IsAllData)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_NO_PERMISSION"];
                    return Json(msg);
                }

                var data = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(wfCode));
                if (data != null)
                {
                    if (data.IsPublic)
                    {
                        data.IsPublic = false;
                        data.PublicBy = ESEIM.AppContext.UserName;
                        data.PublicTime = DateTime.Now;
                    }
                    else
                    {
                        data.IsPublic = true;
                    }
                    _context.WorkFlows.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_NOT_FOUND_RECORD"];
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
        public JsonResult GetItemWf(int id)
        {
            var data = _context.WorkFlows.FirstOrDefault(x => x.Id == id && !x.IsDeleted.Value);
            return Json(data);
        }

        [HttpPost]
        public JsonResult DeleteWF(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var session = HttpContext.GetSessionUser();
            try
            {
                var data = _context.WorkFlows.FirstOrDefault(x => x.Id == id && !x.IsDeleted.Value);
                if (data != null)
                {
                    if (data.IsPublic && !session.IsAllData)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_WF_PUBLIC_NOT_DEL"];
                        return Json(msg);
                    }
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkFlows.Update(data);

                    var activities = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode == data.WfCode);
                    if (activities.Any())
                    {
                        foreach (var item in activities)
                        {
                            item.IsDeleted = true;
                            item.DeletedBy = ESEIM.AppContext.UserName;
                            item.DeletedTime = DateTime.Now;
                            _context.Activitys.Update(item);

                            var files = _context.ActivityFiles.Where(x => !x.IsDeleted && x.ActivityCode.Equals(item.ActivityCode));
                            foreach (var file in files)
                            {
                                file.IsDeleted = true;
                                file.DeletedBy = ESEIM.AppContext.UserName;
                                file.DeletedTime = DateTime.Now;
                                _context.ActivityFiles.Update(file);
                            }

                            var assigns = _context.ExcuterControlRoles.Where(x => !x.IsDeleted && x.ActivityCode.Equals(item.ActivityCode));
                            foreach (var assign in assigns)
                            {
                                assign.IsDeleted = true;
                                assign.DeletedBy = ESEIM.AppContext.UserName;
                                assign.DeletedTime = DateTime.Now;
                                _context.ExcuterControlRoles.Update(assign);
                            }

                            var attrSetup = _context.AttrSetups.Where(x => !x.IsDeleted && x.ActCode.Equals(item.ActivityCode));
                            foreach (var attr in attrSetup)
                            {
                                attr.IsDeleted = true;
                                attr.DeletedBy = ESEIM.AppContext.UserName;
                                attr.DeletedTime = DateTime.Now;
                                _context.AttrSetups.Update(attr);
                            }
                        }
                    }
                    var settings = _context.WorkflowSettings.Where(x => !x.IsDeleted && x.WorkflowCode == data.WfCode);
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
                    var miles = _context.WorkflowMilestones.Where(x => !x.IsDeleted && x.WorkflowCode == data.WfCode);
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

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Title = _stringLocalizer["ACT_MSG_RECORD_NOT_EXISTS"];
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
        public object GetItemDesignOld(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.CatWorkFlows.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemActivity([FromBody]ItemAct obj)
        {
            var data = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode == obj.ActCode);
            return Json(data);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CatWorkFlows.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.CatWorkFlows.Update(data);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_ERR"];
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
        public JsonResult GetTypeWorkFlow()
        {
            var data = _context.JcObjectTypes.Where(x => !x.IsDeleted).Select(x => new { Code = x.ObjTypeCode, Name = x.ObjTypeName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateWfUserList([FromBody] WorkFlow obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(obj.WfCode));
                if (data != null)
                {
                    data.UserList = obj.UserList;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.WorkFlows.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class JTableActivityModel : JTableModel
        {
            public int ID { get; set; }
            public string WorkFlowCode { get; set; }
            public string Note { get; set; }
            public string Name { get; set; }
        }
        public class ItemAct
        {
            public string ActCode { get; set; }
        }
        public JsonResult JTableCatActivity([FromBody]JTableActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CatActivitys
                        join b in _context.CommonSettings on a.ActType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.ActGroup equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where a.IsDeleted == false
                        select new
                        {
                            a.ActCode,
                            a.ID,
                            a.ActName,
                            ActType = b2.ValueSet,
                            ActGroup = c2.ValueSet,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActCode", "ActName", "Note", "ActType", "ActGroup");
            return Json(jdata);
        }
        public class JTableCatActivityModel : JTableModel
        {
            public int ID { get; set; }
            public string ActCode { get; set; }
            public string Note { get; set; }
            public string ActName { get; set; }
            public string ActType { get; set; }
            public string ActGroup { get; set; }
        }
        #endregion

        #region Index
        //combobox
        [HttpPost]        public JsonResult GetListActivityType()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = _stringLocalizer["ACT_MSG_NO_DATA_EXIST"];                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = _sharedResources["COM_MSG_ERR"];
            }            return Json(msg);        }
        [HttpPost]        public JsonResult GetListActivityGroup()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_GROUP").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = _stringLocalizer["ACT_MSG_NO_DATA_EXIST"];                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = _sharedResources["COM_MSG_ERR"];
            }            return Json(msg);        }

        //insert
        [HttpPost]
        public object InsertCatActivity([FromBody] CatActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.CatActivitys.FirstOrDefault(x => x.ActCode.Equals(obj.ActCode));
                if (check == null)
                {
                    var catActivity = new CatActivity()
                    {
                        ActCode = obj.ActCode,
                        ActGroup = obj.ActGroup,
                        ActType = obj.ActType,
                        ActName = obj.ActName,
                        Note = obj.Note,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CatActivitys.Add(catActivity);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_ADD_SUCCESS1"];
                    msg.ID = catActivity.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CODE_IS1"];
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
        [HttpPost]
        public object DeleteCatActivity(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CatActivitys.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.CatActivitys.Update(data);
                    _context.SaveChanges();


                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_ERR1"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //update
        [HttpPost]
        public object UpdateCatActivity([FromBody] CatActivity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkId = _context.CatActivitys.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (checkId != null)
                {
                    var data = _context.CatActivitys.FirstOrDefault(x => x.ActCode.Equals(obj.ActCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        data.ActCode = obj.ActCode;
                        data.ActName = obj.ActName;
                        data.ActGroup = obj.ActGroup;
                        data.ActType = obj.ActType;
                        data.Note = obj.Note;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.CatActivitys.Update(data);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_SUCCESS1"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_ERR1"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_ERR1"];
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
        public object GetItemCatActivity(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.CatActivitys.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult JTableAttr([FromBody]JTableAttrModel jTablePara)
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
            public string WorkFlowCode { get; set; }
        }

        //comobobox
        [HttpPost]        public JsonResult GetListATTRTYPE()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_DATA_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = _stringLocalizer["ACT_MSG_NO_DATA_EXIST"];                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = _sharedResources["COM_MSG_ERR"];
            }            return Json(msg);        }
        [HttpPost]        public JsonResult GetListATTRUNIT()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = _stringLocalizer["ACT_MSG_NO_DATA_EXIST"];                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = _sharedResources["COM_MSG_ERR"];
            }            return Json(msg);        }

        [HttpPost]
        public JsonResult GetGroupAttr()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CARD_DATA_LOGGER")
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).DistinctBy(x => x.Code);
            return Json(data);
        }

        //insetr
        [HttpPost]
        public object InsertActAttrSetup([FromBody] AttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.AttrSetups.FirstOrDefault(x => x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                if (check == null)
                {
                    var attr = new AttrSetup()
                    {
                        ActCode = obj.ActCode,
                        AttrCode = obj.AttrCode,
                        AttrName = obj.AttrName,
                        AttrUnit = obj.AttrUnit,
                        AttrDataType = obj.AttrDataType,
                        AttrGroup = obj.AttrGroup,
                        Note = obj.Note,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.AttrSetups.Add(attr);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CAT_ADD_SUCCESS"];
                    msg.ID = attr.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CAT_CODE_IS"];
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

                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CAT_ADD_ERR"];
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
        public JsonResult SaveDiagram([FromBody] List<Diagram> data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (data.Count > 0)
                {
                    var wfCode = data[0].WfCode;
                    var acts = _context.Activitys.Where(x => !x.IsDeleted && x.WorkflowCode == wfCode);
                    foreach (var item in acts)
                    {
                        foreach (var k in data)
                        {
                            if (item.ActivityCode == k.ActCode)
                            {
                                item.ShapeJson = k.Shape;
                                _context.Activitys.Update(item);
                            }
                        }
                    }
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ACT_MSG_SAVE_DIAGRAM_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng thêm sơ đồ";
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        public class Diagram
        {
            public string ActCode { get; set; }
            public string Shape { get; set; }
            public string WfCode { get; set; }
        }
        #endregion

        #region Creator Manager
        [HttpPost]
        public JsonResult AssignCreatorManager(bool check, string actCode, int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var assign = _context.ExcuterControlRoles.FirstOrDefault(x => x.ID == id);
                if (assign != null)
                {
                    assign.Approve = check;
                    assign.ApproveTime = DateTime.Now;
                    _context.ExcuterControlRoles.Update(assign);
                    _context.SaveChanges();
                    if (check)
                        msg.Title = "Tích chọn thành công";
                    else
                        msg.Title = "Bỏ tích chọn thành công";
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
        public JsonResult GetCreatorManager(string actCode)
        {
            var query = _context.ExcuterControlRoles.Where(x => !x.IsDeleted && x.ActivityCode.Equals(actCode)
                        && string.IsNullOrEmpty(x.UserId) && string.IsNullOrEmpty(x.Role))
                        .Select(x => new
                        {
                            Id = x.ID,
                            UserId = "",
                            GivenName = "Cấp quản lý",
                            Role = "",
                            Department = "",
                            DepartmentName = "",
                            Status = "",
                            RoleSys = "",
                            Check = true
                        }).FirstOrDefault();
            return Json(query);
        }


        #endregion

        #region obj_activity
        [HttpPost]        public object GetActivity()        {            var data = _context.CatActivitys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ActCode, Name = x.ActName }).ToList();            return data;        }

        [HttpPost]        public object GetUnit()        {            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "GROUP_ACTIVITY_PROPERTY").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();            return data;        }

        [HttpPost]        public object GetPriority()        {            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_PRIORITY").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();            return data;        }

        [HttpPost]
        public object InsertObjActivity([FromBody]WorkflowActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {

                var checkexist = _context.CatWorkFlows.FirstOrDefault(x => x.WorkFlowCode.Equals(obj.WorkFlowCode) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CATE_ADD_FALSE"];

                }
                else
                {
                    var checkPriority = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.Priority.Equals(obj.Priority) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                    if (checkPriority == null)
                    {
                        var check = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                        if (check == null)
                        {
                            var attr = new WorkflowActivity()
                            {
                                ActCode = obj.ActCode,
                                WorkFlowCode = obj.WorkFlowCode,
                                UnitTime = obj.UnitTime,
                                LimitTime = obj.LimitTime,
                                Priority = obj.Priority,
                                Note = obj.Note,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.ObjectActivitys.Add(attr);
                            _context.SaveChanges();
                            msg.Title = _stringLocalizer["ACT_MSG_ADD_CATE_FOR_ACTI_SUCCESS"];
                            msg.ID = attr.ID;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["ACT_MSG_ADD_CATE_FOR_ACTI_ERR"];
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_EXIST_FLOW"];
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

        [HttpPost]
        public object UpdatedObjActivity([FromBody]WorkflowActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                if (check != null)
                {
                    check.ActCode = obj.ActCode;
                    check.UnitTime = obj.UnitTime;
                    check.LimitTime = obj.LimitTime;
                    check.Priority = obj.Priority;
                    check.Note = obj.Note;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;

                    _context.ObjectActivitys.Update(check);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Cập nhật thành công"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Không tìm thấy đối tượng!"];
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
        public JsonResult GetMileStoneAct(string actCode)
        {
            var mileCode = "";
            var mile = _context.WorkflowMilestones.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode == actCode);
            if (mile != null)
            {
                mileCode = mile.MilestoneCode;
            }
            return Json(mileCode);
        }

        [HttpPost]
        public JsonResult GetProperties(string ActCode)
        {
            var data = _context.AttrSetups.Where(x => !x.IsDeleted && x.ActCode == ActCode).Select(x => new { Code = x.AttrCode, Name = x.AttrName });
            return Json(data);
        }

        [HttpPost]        public object GetObjActivity(string code)        {            var data = (from a in _context.ObjectActivitys                        where a.IsDeleted == false && a.WorkFlowCode == code                        select new
                        {
                            a.ID,
                            ActCode = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            Priority = a.Priority,
                            a.LimitTime,
                            a.UnitTime,
                            a.Note
                        }).ToList();            return data;        }

        [NonAction]
        public string getBranch(string code1, string code2)
        {
            var data = _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == code1 && x.ActCode == code2)
                .Select(x => new { x.BranchCode }).ToList();
            var str = "";
            foreach (var item in data)
            {
                str += item.BranchCode;
            }
            return str;
        }

        [NonAction]
        public string getDepart(string code1, string code2)
        {
            var data = _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == code1 && x.ActCode == code2)
                .Select(x => new { x.DepartCode }).ToList();
            var str = "";
            foreach (var item in data)
            {
                str += item.DepartCode;
            }
            return str;
        }

        [HttpPost]
        public JsonResult JTableActivityFlow([FromBody]JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ObjectActivitys
                        join b in _context.CatActivitys on a.ActCode equals b.ActCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.UnitTime equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (!a.IsDeleted && a.WorkFlowCode.Equals(jTablePara.WorkFlowCode))
                        select new
                        {
                            a.ID,
                            ActCode = b2 != null ? b2.ActName : "",
                            Priority = a.Priority,
                            a.LimitTime,
                            UnitTime = c2.CodeSet != null ? c2.ValueSet : "",
                            a.Note,
                            Branch = a.Branch,
                            Department = a.Department,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActCode", "Priority", "LimitTime", "UnitTime", "Note", "Branch", "Department");
            return Json(jdata);
        }

        //[HttpPost]
        //public object GetItemActivity(int id)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    var data = _context.ObjectActivitys.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
        //    msg.Object = data;
        //    return Json(msg);
        //}
        [HttpPost]
        public object DeleteActivity(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.ObjectActivitys.FirstOrDefault(x => x.ID == id);
                var checkWorkFlow = _context.WorkflowActivityRoles.Where(x => x.ActCode == check.ActCode && x.WorkFlowCode == check.WorkFlowCode && !x.IsDeleted).Select(x => new { x }).ToList();
                if (checkWorkFlow.Count > 0)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_NOT_NULL"];
                }
                else
                {
                    if (check != null)
                    {
                        check.IsDeleted = true;
                        _context.ObjectActivitys.Update(check);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["ACT_MSG_DEL_CATE_FOR_ACTI_ERR"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_ERR"];
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

        [HttpPost]

        #endregion

        #region extend
        public JsonResult InsertWorkflowActRole([FromBody] WorkflowActivityRole obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkobj = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                if (checkobj == null)
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng kiểm tra lại luồng công việc và hoạt động";
                }
                else
                {
                    var check = _context.WorkflowActivityRoles.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode == obj.WorkFlowCode && x.ActCode == obj.ActCode
                    && x.BranchCode == obj.BranchCode && x.DepartCode == obj.DepartCode && x.Role == obj.Role && x.WorkFlowProperty == obj.WorkFlowProperty);
                    if (check == null)
                    {
                        var workFlowActivityRole = new WorkflowActivityRole
                        {
                            WorkFlowCode = obj.WorkFlowCode,
                            ActCode = obj.ActCode,
                            BranchCode = obj.BranchCode,
                            DepartCode = obj.DepartCode,
                            Role = obj.Role,
                            WorkFlowProperty = obj.WorkFlowProperty,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.WorkflowActivityRoles.Add(workFlowActivityRole);
                        _context.SaveChanges();
                        msg.Title = "Thêm thành công";

                        var checkObj = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                        checkObj.Branch = checkObj.Branch != null ? checkObj.Branch + "," + obj.BranchCode : obj.BranchCode;
                        checkObj.Department = checkObj.Department != null ? checkObj.Department + "," + obj.DepartCode : obj.DepartCode;
                        _context.ObjectActivitys.Update(checkObj);
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Đã tồn tại luồng và hoạt động";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpPost]        public object GetWorkFlow(string code)        {            var data = (from a in _context.WorkflowActivityRoles                        where a.IsDeleted == false && a.WorkFlowCode == code                        select new
                        {
                            a.ID,
                            ActCode = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            Branch = a.BranchCode != null ? _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode == a.BranchCode).OrgName : "",
                            DepartCode = a.DepartCode != null ? _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == a.DepartCode).Title : "",
                            Role = a.Role != null ? _context.Roles.FirstOrDefault(x => x.Id == a.Role).Title : "",
                            Property = a.WorkFlowProperty != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkFlowProperty).ValueSet : "",
                        }).ToList();            return data;        }

        [HttpPost]
        public JsonResult JTableWorkFlow([FromBody]JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == jTablePara.WorkFlowCode && x.ActCode == jTablePara.ActCode)

                        select new
                        {
                            a.ID,
                            ActName = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            BranchName = a.BranchCode != null ? _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode == a.BranchCode).OrgName : "",
                            DepartmentName = a.DepartCode != null ? _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == a.DepartCode).Title : "",
                            Role = a.Role != null ? _context.Roles.FirstOrDefault(x => x.Code == a.Role).Title : "",
                            Property = a.WorkFlowProperty != null ? _context.AttrSetups.FirstOrDefault(x => !x.IsDeleted && x.AttrCode == a.WorkFlowProperty).AttrName : "",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActName", "DepartmentName", "BranchName", "Role", "Property");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult DeleteWorkflowActRole(int id)
        {
            var msg = new JMessage();
            var data = _context.WorkflowActivityRoles.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.WorkflowActivityRoles.Update(data);
                _context.SaveChanges();
                msg.Title = "Xóa thành công";

                var checkObj = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(data.ActCode) && x.WorkFlowCode.Equals(data.WorkFlowCode));
                if (checkObj.Branch != null && checkObj.Branch != "")
                {
                    string[] listBranch = checkObj.Branch.Split(",");
                    List<string> list = new List<string>(listBranch);
                    for (int i = 0; i < listBranch.Length; i++)
                    {
                        if (listBranch[i] == data.BranchCode)
                        {
                            list.Remove(listBranch[i]);
                        }
                    }
                    checkObj.Branch = list.Join(",");
                    _context.ObjectActivitys.Update(checkObj);
                    _context.SaveChanges();
                }

            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy luồng và hoạt động";
            }
            return Json(msg);
        }
        #endregion

        #region File
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
        public JsonResult AddAttachment([FromBody] ActivityFile data)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                string code = "ATTACHMENT_" + data.ActivityCode + (_context.ActivityFiles.Count() > 0 ? _context.ActivityFiles.Last().ID + 1 : 0);
                var file = new ActivityFile
                {
                    FileID = code,
                    ActivityCode = data.ActivityCode,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    FileName = data.FileName,
                    FilePath = data.FilePath,
                    FileSize = data.FileSize,
                    FileType = data.FileType,
                };
                _context.ActivityFiles.Add(file);

                var actInsts = _context.ActivityInstances.Where(x => !x.IsDeleted && x.ActivityCode.Equals(data.ActivityCode));
                foreach (var act in actInsts)
                {
                    var fInst = new ActivityInstFile
                    {
                        FileID = code,
                        ActivityInstCode = act.ActivityInstCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        FileName = data.FileName,
                        FilePath = data.FilePath,
                        FileSize = data.FileSize,
                        FileType = data.FileType,
                        SignatureRequire = true
                    };
                    _context.ActivityInstFiles.Add(fInst);
                }

                _context.SaveChanges();

                msg.Title = _sharedResources["COM_MSG_DOWLOAD_SUCCESS"];
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
        public JsonResult GetAttachment(string actCode)
        {
            var data = ((from a in _context.ActivityFiles.Where(x => x.ActivityCode.Equals(actCode) && !x.IsDeleted)
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
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("ACT_CAT")
                     && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(actCode))
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
                    var data = _context.ActivityFiles.FirstOrDefault(x => x.FileID.Equals(obj.FileCode));
                    if (data != null)
                    {
                        if (data.CreatedBy == currentUser)
                        {
                            data.IsDeleted = true;
                            data.DeletedBy = currentUser;
                            data.DeletedTime = DateTime.Now;
                            _context.ActivityFiles.Update(data);
                            _context.SaveChanges();

                            msg.Error = false;
                            msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["ACT_MSG_U_NOT_CREATOR"];
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_FILE_NOT_FOUND"];
                    }
                }
                else if (obj.Type == 2)
                {
                    var data = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(obj.FileCode)
                    && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectType.Equals("ACT_CAT")
                    && JsonConvert.DeserializeObject<ObjRelative>(x.ObjectRelative).ObjectInstance.Equals(obj.ActCode));
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
                                ObjectType = "ACT_CAT",
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
                                ObjectRelative = JsonConvert.SerializeObject(rela),
                                ListUserShare = string.Empty
                            };
                            _context.FilesShareObjectUsers.Add(files);

                        }
                    }
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ACT_MSG_SELECTED_FILE_SUCCESS"];
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
        public JsonResult ViewFileOnline([FromBody] ViewFileObj obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
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
                    aseanDoc.File_Name = Path.GetFileName(obj.Url);
                    aseanDoc.File_Type = extension;

                    aseanDoc.ObjType = EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.FileVersionActInst);


                    if (extension.ToLower().Equals(".doc") || extension.ToLower().Equals(".docx"))
                    {

                        DocmanController.docmodel = aseanDoc;
                        DocmanController.pathFile = obj.Url;
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

                            if (extension.ToLower().Equals(".doc") || extension.ToLower().Equals(".docx"))
                            {
                                DocmanController.docmodel = aseanDoc;
                                DocmanController.pathFile = pathConvert;
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
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
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
            public string ActCode { get; set; }
        }
        public class ViewFileObj
        {
            public string FileCode { get; set; }
            public string Url { get; set; }
            public string ActInstCode { get; set; }
        }
        #endregion

        #region File activity to edms
        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.ActCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                           .Select(p => new
                                                           {
                                                               p.FileID,
                                                               p.ListUserShare,
                                                               p.UserShares
                                                           }).ToList();
            var session = HttpContext.GetSessionUser();

            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.ActCode && x.ObjectType == EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat))
                          join b in _context.EDMSFiles.Where(x => !x.IsDeleted && (x.IsFileMaster == null || x.IsFileMaster == true)) on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) || b.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              ReposName = f != null ? f.ReposName : "",
                              b.FileID,
                              SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                          })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "FileID", "SizeOfFile");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertActCatFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        //var suggesstion = GetSuggestionsActCatFile(obj.ActCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = _stringLocalizer["Vui lòng nhập thuộc tính mở rộng"];
                        //    return Json(msg);
                        //}

                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                               && x.ObjectCode.Equals(obj.ActCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.ActCat)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                        if (setting != null)
                        {
                            reposCode = setting.ReposCode;
                            path = setting.Path;
                            folderId = setting.FolderId;
                            catCode = setting.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["Vui lòng chọn thư mục lưu trữ"];
                            return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("ActCat_", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.ActCode,
                        ObjectType = EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    msg.Object = edmsReposCatFile.Id;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INVALID_FORMAT"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsActCatFile(string actCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == actCode && x.ObjectType == EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat)).MaxBy(x => x.Id);
            return query;
        }

        [HttpPost]
        public object GetListUserShare(string actCode)
        {
            var data = from a in _context.Users.Select(x => new { Code = x.UserName, Name = x.GivenName, x.DepartmentId, UserId = x.Id })
                       join b in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentId equals b.DepartmentCode into b1
                       from b in b1.DefaultIfEmpty()
                       join c in _context.ExcuterControlRoles.Where(x => !x.IsDeleted && x.ActivityCode.Equals(actCode)) on a.UserId equals c.UserId
                       select new
                       {
                           a.Code,
                           a.Name,
                           DepartmentName = b != null ? b.Title : ""
                       };
            return data;
        }

        [HttpPost]
        public JsonResult InsertFileShareActCat([FromBody] ActCatFileShareModel obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var data = (from a in _context.EDMSRepoCatFiles.Where(x => x.Id == obj.Id)
                            join b in _context.EDMSRepositorys on a.ReposCode equals b.ReposCode into b2
                            from b in b2.DefaultIfEmpty()
                            join c in _context.EDMSFiles on a.FileCode equals c.FileCode into c2
                            from c in c2.DefaultIfEmpty()
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
                                c.FileParentId
                            }).FirstOrDefault();

                if (data != null)
                {
                    var check = _context.FilesShareObjectUsers.FirstOrDefault(x => !x.IsDeleted && x.FileID.Equals(data.FileCode));
                    if (check == null)
                    {
                        var rela = new
                        {
                            ObjectType = EnumHelper<ActivityCat>.GetDisplayValue(ActivityCat.ActivityCat),
                            ObjectInstance = data.Id
                        };
                        var files = new FilesShareObjectUser
                        {
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            FileID = data.FileCode,
                            FileCreated = User.Identity.Name,
                            FileUrl = data.Url,
                            FileName = data.FileName,
                            ObjectRelative = JsonConvert.SerializeObject(rela),
                            ListUserShare = obj.ListUserShare
                        };
                        _context.FilesShareObjectUsers.Add(files);
                    }
                    else
                    {
                        check.ListUserShare = obj.ListUserShare;

                        _context.FilesShareObjectUsers.Update(check);
                    }
                    _context.SaveChanges();
                }

                msg.Title = "Chia sẻ thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateActCatFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }
                                else if (result.Status == WebExceptionStatus.Success)
                                {
                                    if (result.IsSaveUrlPreventive)
                                    {
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["HR_HR_MSG_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["HR_HR_MAN_MSG_SELECT_FORDER"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["HR_HR_MSG_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        public class JTableModelFile : JTableModel
        {
            public string ActCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }
        public class ActCatFileShareModel
        {
            public int? Id { get; set; }
            public string ListUserShare { get; set; }
        }
        #endregion

        #region Nested Workflow Cat
        [HttpPost]
        public JsonResult GetNestedWF(string wfCode)
        {
            var data = _context.WorkFlows.Where(x => !x.IsDeleted.Value && x.WfCode != wfCode)
                        .Select(x => new { Code = x.WfCode, Name = x.WfName, Group = x.WfGroup });
            return Json(data);
        }

        [HttpPost]
        public JsonResult AddNestedWF([FromBody] ModelNestedWF obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var actCat = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(obj.ActCode));
                var wfCat = _context.WorkFlows.FirstOrDefault(x => !x.IsDeleted.Value && x.WfCode.Equals(obj.WfCode));
                if (actCat != null && wfCat != null)
                {
                    var listNestedWF = new List<NestedWF>();
                    if (!string.IsNullOrEmpty(actCat.NestedWF))
                    {
                        listNestedWF = JsonConvert.DeserializeObject<List<NestedWF>>(actCat.NestedWF);
                    }
                    var isWfExist = false;
                    foreach (var item in listNestedWF)
                    {
                        if (item.WfCode.Equals(obj.WfCode))
                        {
                            isWfExist = true;
                            break;
                        }
                    }

                    if (!isWfExist)
                    {
                        var nestedWf = new NestedWF
                        {
                            WfCode = obj.WfCode,
                            WfGroup = wfCat.WfGroup
                        };
                        listNestedWF.Add(nestedWf);
                        actCat.NestedWF = JsonConvert.SerializeObject(listNestedWF);
                        _context.Activitys.Update(actCat);
                        _context.SaveChanges();
                        msg.Title = "Thêm luồng thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Luồng đã tồn tại";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Hoạt động/luồng không tồn tại";
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
        public JsonResult GetNestedActCat(string actCode)
        {
            var listNested = new List<NestedWF>();
            var actCat = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(actCode));
            if (actCat != null)
            {
                if (!string.IsNullOrEmpty(actCat.NestedWF))
                {
                    listNested = JsonConvert.DeserializeObject<List<NestedWF>>(actCat.NestedWF);
                }
            }
            var query = from a in listNested
                        join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WfCode equals b.WfCode
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.WfGroup equals c.CodeSet into c1
                        from c in c1.DefaultIfEmpty()
                        select new
                        {
                            a.WfCode,
                            b.WfName,
                            WfGroup = c != null ? c.ValueSet : ""
                        };
            return Json(query);
        }

        [HttpPost]
        public JsonResult DeleteNestedWf([FromBody] ModelNestedWF obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var actCat = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(obj.ActCode));
                if (actCat != null)
                {
                    var listNestedWF = new List<NestedWF>();
                    if (!string.IsNullOrEmpty(actCat.NestedWF))
                    {
                        listNestedWF = JsonConvert.DeserializeObject<List<NestedWF>>(actCat.NestedWF);
                        foreach (var item in listNestedWF)
                        {
                            if (item.WfCode.Equals(obj.WfCode))
                            {
                                listNestedWF.Remove(item);
                                break;
                            }
                        }
                        actCat.NestedWF = JsonConvert.SerializeObject(listNestedWF);
                        _context.Activitys.Update(actCat);
                        _context.SaveChanges();
                        msg.Title = "Xóa luồng con thành công";
                    }
                    else
                    {
                        msg.Error = false;
                        msg.Title = "Hoạt động chưa có luồng con";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Hoạt động không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        public class ModelNestedWF
        {
            public string ActCode { get; set; }
            public string WfCode { get; set; }
        }

        public class NestedWF
        {
            public string WfCode { get; set; }
            public string WfGroup { get; set; }
        }
        #endregion

        #region Role act default
        [HttpGet]
        public JsonResult GetRoleDefault()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted
                && x.Group.Equals("ROLE_ACT_DEFAULT"))
                .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertRoleDefault(string actCode, string role)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var act = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(actCode));
                if (act != null)
                {
                    var listRole = new List<JsonRoleDefault>();
                    if (!string.IsNullOrEmpty(act.RoleDefault))
                    {
                        listRole = JsonConvert.DeserializeObject<List<JsonRoleDefault>>(act.RoleDefault);
                    }

                    if (listRole.Any(x => x.RoleCode.Equals(role)))
                    {
                        msg.Error = true;
                        msg.Title = "Vai trò đã được thêm vào hoạt động";
                    }
                    else
                    {
                        var roleDefault = new JsonRoleDefault
                        {
                            RoleCode = role,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        listRole.Add(roleDefault);
                        act.RoleDefault = JsonConvert.SerializeObject(listRole);
                        _context.Activitys.Update(act);
                        _context.SaveChanges();
                        msg.Title = "Thêm thành công";
                    }
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

        [HttpGet]
        public JsonResult GetRoleDefaultOfAct(string actCode)
        {
            var act = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(actCode));
            var listData = new List<ViewRoleDefault>();
            if (act != null)
            {
                if (!string.IsNullOrEmpty(act.RoleDefault))
                {
                    var listRole = JsonConvert.DeserializeObject<List<JsonRoleDefault>>(act.RoleDefault);
                    listData = (from a in listRole
                                join b in _context.CommonSettings.Where(x => !x.IsDeleted)
                                     on a.RoleCode equals b.CodeSet into b1
                                from b in b1.DefaultIfEmpty()
                                select new ViewRoleDefault
                                {
                                    RoleCode = a.RoleCode,
                                    RoleName = b != null ? b.ValueSet : "Không xác định"
                                }).ToList();
                }
            }
            return Json(listData);
        }

        [HttpPost]
        public JsonResult DeleteRoleDefault(string actCode, string role)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var act = _context.Activitys.FirstOrDefault(x => !x.IsDeleted && x.ActivityCode.Equals(actCode));
                if (act != null)
                {
                    var listRole = new List<JsonRoleDefault>();
                    if (!string.IsNullOrEmpty(act.RoleDefault))
                    {
                        listRole = JsonConvert.DeserializeObject<List<JsonRoleDefault>>(act.RoleDefault);
                    }

                    foreach (var item in listRole)
                    {
                        if (item.RoleCode.Equals(role))
                        {
                            listRole.Remove(item);
                            break;
                        }
                    }
                    act.RoleDefault = JsonConvert.SerializeObject(listRole);
                    _context.Activitys.Update(act);
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

        public class ViewRoleDefault
        {
            public string RoleCode { get; set; }
            public string RoleName { get; set; }
        }
        public class JsonRoleDefault
        {
            public string RoleCode { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
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