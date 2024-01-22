using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.Extensions.Logging;
using III.Admin.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    public class UserInGroupModelCustom
    {
        public string Id { set; get; }
        public string UName { set; get; }
    }
    public class JTableGroupUserModelCustom : JTableModel
    {
        public string GroupCode { set; get; }
        public string GroupName { set; get; }
        public bool? Status { set; get; }
    }
    public class GroupUserModel
    {
        public int? Id { set; get; }
        public string Title { set; get; }
        public string Code { set; get; }
        public string ParentId { set; get; }
        public DateTime? CreatedDate { set; get; }
        public string Description { set; get; }
        public int? Ord { set; get; }
        public bool IsChecked { set; get; }
        public bool IsEnabled { set; get; }
        public int Level { get; set; }
        public bool HasChild { get; set; }
    }
    [Area("Admin")]
    public class GroupUserController : BaseController
    {
        public class JTableModelGroupUser : JTableModel
        {
            public string Id { set; get; }
            public string UserNameInGroup { set; get; }
            public string UserNameOutGroup { set; get; }
        }
        private readonly EIMDBContext _context;

        private readonly ILogger _logger;
        private readonly IStringLocalizer<GroupUserController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public GroupUserController(EIMDBContext context, ILogger<GroupUserController> logger, IStringLocalizer<GroupUserController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _logger = logger;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbGroupUser", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbGroupUser"] = _sharedResources["COM_CRUMB_GROUP_USER"];
            return View();
        }
        //[HttpPost]
        //public object GetAll()
        //{
        //    var a = _c.OrderBy(x => x.Ord).AsNoTracking().ToList();
        //    return Json(a);
        //}
        [HttpPost]
        public object GetGroupUser(string id)
        {
            var a = _context.AdGroupUsers.OrderBy(x => x.Title).AsNoTracking().ToList();
            return Json(a);
        }
        //[HttpGet]
        //public object GetGroupUser(string id)
        //{
        //    var a = _context.VIBGroupUsers.OrderBy(x => x.Title).AsNoTracking().ToList();
        //    return Json(a);
        //}
        //     // View DataTable style
        //     [HttpPost]
        //     public object JTable([FromBody]JTableGroupUserModelCustom jTablePara)
        //     {
        //         ////_logger.LogInformation(LoggingEvents.LogDb, "Get list group user");
        //////_actionLog.InsertActionLog("VIB_GROUP_USER"ontext.AdApplications, "Get list group user", null, null, "JTable");

        //if (String.IsNullOrEmpty(jTablePara.GroupName))
        //         {
        //             var count = _context.VIBGroupUsers.Count();
        //             int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //             var data = _context.VIBGroupUsers.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
        //             var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Code", "Description", "CreatedDate");
        //             return Json(jdata);
        //         }
        //         else
        //         {
        //             var count = _context.VIBGroupUsers.Where(x => x.Title.Contains(jTablePara.GroupName)).ToList().Count();
        //             int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //             var data = _context.VIBGroupUsers.Where(x => x.Title.ToLower().Contains(jTablePara.GroupName.ToLower())).OrderUsingSortExpression(jTablePara.QueryOrderBy).Select(x => new { Id = x.GroupUserId, x.Title, Code = x.GroupUserCode, x.Description, x.CreatedDate }).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
        //             var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Code", "Description", "CreatedDate");
        //             return Json(jdata);
        //         }
        //     }

        // View Tree style

        [HttpPost]
        public object JTable([FromBody]JTableGroupUserModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (string.IsNullOrEmpty(jTablePara.GroupCode) && string.IsNullOrEmpty(jTablePara.GroupName))
            {
                var query = from x in _context.AdGroupUsers.Where( x=> !x.IsDeleted)
                            where ((jTablePara.Status == null || x.IsEnabled == jTablePara.Status) && !x.IsDeleted)
                            select new GroupUserModel
                            {
                                Id = x.GroupUserId,
                                Title = x.Title,
                                Code = x.GroupUserCode,
                                ParentId = x.ParentCode,
                                CreatedDate = x.CreatedDate,
                                Description = x.Description,
                                IsEnabled = x.IsEnabled,
                                Ord = string.IsNullOrEmpty(x.ParentCode) ? 1 : 2,
                            };

                var query2 = query.OrderBy(o => o.Ord).ThenBy(o => o.Code);
                var count = query2.Count();
                var result = new List<GroupUserModel>();
                foreach (var gUser in query2.Where(x => string.IsNullOrEmpty(x.ParentId)).OrderBy(x => x.Id))
                {
                    var listChild = GetGroupUserChild(query2.AsNoTracking().ToList(), gUser.Code, ". . . ");

                    var groupUser = new GroupUserModel();
                    groupUser.Id = gUser.Id;
                    groupUser.Title = (listChild.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + gUser.Title;
                    groupUser.Code = gUser.Code;
                    groupUser.ParentId = gUser.ParentId;
                    groupUser.CreatedDate = gUser.CreatedDate;
                    groupUser.Description = gUser.Description;
                    groupUser.IsEnabled = gUser.IsEnabled;
                    result.Add(groupUser);
                    if (listChild.Count > 0) result = result.Concat(listChild).ToList();
                }
                var listGroupUser = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                var jdata = JTableHelper.JObjectTable(listGroupUser, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "CreatedDate", "Description", "IsEnabled");
                return Json(jdata);
            }
            else
            {
                var query = _context.AdGroupUsers
                    .Where(p => (string.IsNullOrEmpty(jTablePara.GroupCode) || p.GroupUserCode.ToLower().Contains(jTablePara.GroupCode.ToLower()))
                             && (string.IsNullOrEmpty(jTablePara.GroupName) || p.Title.ToLower().Contains(jTablePara.GroupName.ToLower()))
                             && (jTablePara.Status == null || p.IsEnabled == jTablePara.Status) && !p.IsDeleted)
                    .OrderBy(x => x.Title)
                    .Select(x => new { Id = x.GroupUserId, x.Title, Code = x.GroupUserCode, x.ParentCode, x.CreatedDate, x.Description, x.IsEnabled })
                    .AsNoTracking();
                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "CreatedDate", "Description", "IsEnabled");
                return Json(jdata);
            }
        }
        private static List<GroupUserModel> GetGroupUserChild(IList<GroupUserModel> listGroupUser, string parentId, string level)
        {
            var result = new List<GroupUserModel>();
            var query = from gUser in listGroupUser
                        where gUser.ParentId == parentId
                        orderby gUser.Title
                        select new GroupUserModel
                        {
                            Id = gUser.Id,
                            Title = gUser.Title,
                            Code = gUser.Code,
                            ParentId = gUser.ParentId,
                            CreatedDate = gUser.CreatedDate,
                            Description = gUser.Description,
                            IsEnabled = gUser.IsEnabled,
                        };

            var listGUser = query as IList<GroupUserModel> ?? query.ToList();
            foreach (var gUser in listGUser)
            {
                var destination = GetGroupUserChild(listGroupUser, gUser.Code, ". . . " + level);
                gUser.Title = level + (destination.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + gUser.Title;
                result.Add(gUser);
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }

        [HttpPost]
        public List<TreeViewString> GetTreeGroupUser(string id)
        {
            var data = _context.AdGroupUsers.OrderBy(x => x.Title).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewString>(), 0);
            return dataOrder;
        }

        [HttpPost]
        public List<TreeViewString> GetTreeData(string id)
        {
            if (string.IsNullOrEmpty(id) || id == "null")
            {
                var data = _context.AdGroupUsers.OrderBy(x => x.GroupUserId).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewString>(), 0);
                return dataOrder;
            }
            else
            {
                var data = _context.AdGroupUsers.OrderBy(x => x.GroupUserId).Where(x => (x.GroupUserCode != id && x.ParentCode != id)).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewString>(), 0);
                return dataOrder;
            }
        }

        private List<TreeViewString> GetSubTreeData(List<AdGroupUser> data, string parentid, List<TreeViewString> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = String.IsNullOrEmpty(parentid)
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.GroupUserId).ToList()
                : data.Where(x => x.ParentCode == parentid).OrderBy(x => x.GroupUserCode).ToList();
            foreach (var item in contents)
            {
                var category = new TreeViewString
                {
                    Code = item.GroupUserCode,
                    Id = item.GroupUserCode,
                    Title = item.Title,
                    Level = tab,
                    ParentCode = item.ParentCode,
                    HasChild = data.Any(x => x.ParentCode == item.GroupUserCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.GroupUserCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }
        [HttpPost]
        public JsonResult Insert([FromBody]AdGroupUser obj)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Insert group user");
            ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Insert group user", obj, null,false);
            var msg = new JMessage() { Error = false };
            try
            {
                var gu = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == obj.GroupUserCode);
                if (gu == null)
                {
                    obj.CreatedDate = DateTime.Now;
                    _context.AdGroupUsers.Add(obj);
                    var a = _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());
                    ////_logger.LogInformation(LoggingEvents.LogDb, "Insert group user successfully");
                    ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Insert department/PC successfully", null, obj, "Insert");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["GUSR_TITLE"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]AdGroupUserUpdate obj)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Update group user");
            ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Update group user", obj, null,false);
            var msg = new JMessage() { Error = false };
            try
            {
                var objUpdate = _context.AdGroupUsers.SingleOrDefault(x => x.GroupUserId == obj.GroupUserId);
                var objOld = CommonUtil.Clone(objUpdate);
                _context.Entry(objUpdate).State = EntityState.Unchanged;
                if (objUpdate.GroupUserCode != obj.GroupUserCode)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_CODE_CHANGE"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());
                    //msg.Title = String.Format(_stringLocalizer["ERR_CODE_CHANGE"), _stringLocalizer["GROUP_USERS").ToLower());
                    //_logger.LogError(LoggingEvents.LogDb, "Update group user fail");
                    ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Update department/PC fail", null, null, "Update");
                }
                else
                {
                    objUpdate.Title = obj.Title;
                    objUpdate.ParentCode = obj.ParentCode;
                    objUpdate.Description = obj.Description;
                    objUpdate.IsEnabled = obj.IsEnabled;
                    objUpdate.Priority = obj.Priority;
                    objUpdate.UpdatedDate = DateTime.Now;

                    ////xóa người ủy quyền 
                    //var deleteDispatchesUser = _context.DispatchesUsers.Where(x => x.GroupUserCode == obj.GroupUserCode).FirstOrDefault();
                    //if (deleteDispatchesUser != null)
                    //{
                    //    _context.DispatchesUsers.Remove(deleteDispatchesUser);
                    //    _context.SaveChanges();
                    //}
                    ////thêm người ủy quyền mới
                    //if (!string.IsNullOrEmpty(obj.Leader))
                    //{
                    //    var user = new DispatchesUser
                    //    {
                    //        GroupUserCode = obj.GroupUserCode,
                    //        UserId = obj.Leader
                    //    };
                    //    _context.DispatchesUsers.Add(user);
                    //}
                    var a = _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());
                    //msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"), _stringLocalizer["GROUP_USERS").ToLower());
                    ////_logger.LogInformation(LoggingEvents.LogDb, "Update group user successfully");
                    ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Update department/PC successfully", objOld, obj, "Update");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());

                //msg.Title = String.Format(_stringLocalizer["MSG_UPDATE_FAIL"), _stringLocalizer["GROUP_USERS").ToLower());
                //_logger.LogError(LoggingEvents.LogDb, "Update group user fail");
                ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Update department/PC failed: " + ex.Message, null, null, "Update");
            }
            return Json(msg);
        }
        [HttpPost]
        public object Delete(string id)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Delete group user");
            ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete group user", null, null,false);
            try
            {
                AdPermission permission = _context.AdPermissions.SingleOrDefault(x => x.GroupUserCode == id);
                AdUserInGroup userInGroup = _context.AdUserInGroups.SingleOrDefault(x => x.GroupUserCode == id);
                if (permission != null || userInGroup != null)
                {
                    //_logger.LogError(LoggingEvents.LogDb, "Delete group user fail");
                    ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC fail", null, null, "Delete");
                    return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_ERR_OBJ_REF"], _stringLocalizer["GUSR_TITLE"].Value.ToLower()) });
                }
                else
                {
                    var objChild = _context.AdGroupUsers.SingleOrDefault(x => x.ParentCode == id);
                    if (objChild == null)
                    {
                        //AdGroupUser obj = new AdGroupUser();
                        //obj.GroupUserCode = id;
                        //_context.AdGroupUsers.Attach(obj);
                        var obj = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserId == Int32.Parse(id));
                        //_context.AdGroupUsers.Remove(obj);
                        obj.IsDeleted = true;
                        obj.DeletedBy = ESEIM.AppContext.UserName;
                        obj.DeletedTime = DateTime.Now;
                        _context.SaveChanges();
                        ////_logger.LogInformation(LoggingEvents.LogDb, "Delete group user successfully");
                        ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC successfully", obj, null, "Delete");
                        return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]) });
                    }
                    else
                    {
                        //_logger.LogError(LoggingEvents.LogDb, "Delete group user fail");
                        ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC fail", null, null, "Error");

                        return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_CHILD"], _stringLocalizer["GUSR_TITLE"]) });
                    }
                }
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete group user fail");
                ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC failed: " + ex.Message, null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["GUSR_TITLE"].Value.ToLower()) });
            }
        }
        [HttpPost]
        public object DeleteItems([FromBody]List<string> listId)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                ////_logger.LogInformation(LoggingEvents.LogDb, "Delete list group user");
                List<string> listRef = new List<string>();
                List<string> listDel = new List<string>();
                List<string> listDelChild = new List<string>();
                List<string> listDelFinal = new List<string>();
                List<AdGroupUser> listGroupUser = new List<AdGroupUser>();

                foreach (var id in listId)
                {
                    AdGroupUser obj = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == id);
                    if (obj != null)
                    {
                        var pms = _context.AdPermissions.FirstOrDefault(x => x.GroupUserCode == id);
                        var uInGroup = _context.AdUserInGroups.FirstOrDefault(x => x.GroupUserCode == id);
                        if (pms != null || uInGroup != null)
                        {
                            listRef.Add(id);
                        }
                        else
                        {
                            listDel.Add(id);
                        }
                    }
                }
                if (listRef.Count > 0)
                {
                    if (listDel.Count > 0)
                    {
                        // Find list Id haven't child , this list can delete (list A)
                        foreach (var id in listDel)
                        {
                            var idRef = _context.AdGroupUsers.FirstOrDefault(x => x.ParentCode == id);
                            if (idRef == null)
                            {
                                listDelChild.Add(id);
                            }
                        }
                        if (listDelChild.Count == 0)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_ERR_LIST_OBJ_HAS_CHILD_OR_REF"],
                                _stringLocalizer["GUSR_TITLE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete list group user fail");
                            //_actionLog.InsertActionLogDeleteItem("VIB_GROUP_USER", "Delete list department/PC fail", null, null, "Error");
                        }
                        else
                        {
                            // Find final list Id (parent, grandparent,...) begin from (list A), this list can delete.
                            listDelFinal = listDelFinal.Concat(listDelChild).ToList();
                            foreach (var id in listDelChild)
                            {
                                var listAdd = FindParentInList(listDel, id, new List<string>());
                                listDelFinal = listDelFinal.Concat(listAdd).ToList();
                            }
                            // Find list Id in selected list can't delete.
                            foreach (var id in listDel)
                            {
                                if (!listDelFinal.Contains(id))
                                {
                                    listRef.Add(id);
                                }
                            }
                            foreach (var idDel in listDelFinal)
                            {
                                AdGroupUser objDel = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == idDel);
                                listGroupUser.Add(objDel);
                                _context.AdGroupUsers.Attach(objDel);
                                _context.AdGroupUsers.Remove(objDel);
                            }
                            _context.SaveChanges();
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_DEL_SUCCESS_LIST_ITEM_BUT_HAS_CHILD_OR_REF"],
                                _stringLocalizer["GUSR_TITLE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete part of the group user list successfully");

                            //_actionLog.InsertActionLogDeleteItem("VIB_GROUP_USER", "Delete part of the department/PC list successfully", listGroupUser.ToArray(), null, "Delete");

                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_ERR_LIST_OBJ_REF"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());
                        //_logger.LogError(LoggingEvents.LogDb, "Delete list group user fail");
                        //_actionLog.InsertActionLogDeleteItem("VIB_GROUP_USER", msg.Title, null, null, "Delete");
                    }
                }
                else
                {
                    if (listDel.Count > 0)
                    {
                        // Find list Id haven't child , this list can delete (list A)
                        foreach (var id in listDel)
                        {
                            var idRef = _context.AdGroupUsers.FirstOrDefault(x => x.ParentCode == id);
                            if (idRef == null)
                            {
                                listDelChild.Add(id);
                            }
                        }
                        if (listDelChild.Count == 0)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_ERR_LIST_OBJ_HAS_CHILD_OR_REF"], _stringLocalizer["GUSR_TITLE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete list group user fail");
                            //_actionLog.InsertActionLogDeleteItem("VIB_GROUP_USER", "Delete list department/PC fail", null, null, "Error");
                        }
                        else
                        {
                            // Find final list Id (parent, grandparent,...) begin from (list A), this list can delete.
                            listDelFinal = listDelFinal.Concat(listDelChild).ToList();
                            foreach (var id in listDelChild)
                            {
                                var listAdd = FindParentInList(listDel, id, new List<string>());
                                listDelFinal = listDelFinal.Concat(listAdd).ToList();
                            }
                            // Find list Id in selected list can't delete.
                            foreach (var id in listDel)
                            {
                                if (!listDelFinal.Contains(id))
                                {
                                    listRef.Add(id);
                                }
                            }
                            // case exist list can't delete.
                            if (listRef.Count > 0)
                            {
                                foreach (var idDel in listDelFinal)
                                {
                                    AdGroupUser objDel =
                                        _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == idDel);
                                    listGroupUser.Add(objDel);
                                    _context.AdGroupUsers.Attach(objDel);
                                    _context.AdGroupUsers.Remove(objDel);
                                }
                                _context.SaveChanges();
                                msg.Error = true;
                                msg.Title = String.Format(
                                    _sharedResources["COM_DEL_SUCCESS_LIST_ITEM_BUT_HAS_CHILD"], _stringLocalizer["GUSR_TITLE"]);
                                //_logger.LogError(LoggingEvents.LogDb, "Delete part of the group user list successfully");
                                //_actionLog.InsertActionLogDeleteItem("VIB_GROUP_USER", "Delete part of the department/PC list successfully", listGroupUser.ToArray(), null, "Delete");
                            }
                            // case full list parameter can delete.
                            else
                            {
                                foreach (var idDel in listDelFinal)
                                {
                                    AdGroupUser objDel =
                                        _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == idDel);
                                    listGroupUser.Add(objDel);
                                    _context.AdGroupUsers.Attach(objDel);
                                    _context.AdGroupUsers.Remove(objDel);
                                }
                                _context.SaveChanges();
                                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_SUCCESS"], _stringLocalizer["GUSR_TITLE"]);
                                //_logger.LogError(LoggingEvents.LogDb, "Delete list group user successfully");
                                //_actionLog.InsertActionLogDeleteItem("VIBFunction", "Delete list department/PC successfully", listGroupUser.ToArray(), null, "Delete");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_FAIL"], _stringLocalizer["GUSR_TITLE"].Value.ToLower());
                //_logger.LogError(LoggingEvents.LogDb, "Delete list group user fail");
                ////_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete list department/PC failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);



            //try
            //{
            //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete list group user ");

            //    foreach (var id in listId)
            //    {
            //        VIBPermission permission = _context.VIBPermissions.SingleOrDefault(x => x.GroupUserId == id);
            //        if (permission != null)
            //        {
            //            //_logger.LogError(LoggingEvents.LogDb, "Delete group user fail");
            //            return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["ERR_OBJ_REF"), _stringLocalizer["GUSR_TITLE").ToLower()) });
            //        }



            //        VIBGroupUser obj = new VIBGroupUser();
            //        obj.Id = i;
            //        _context.VIBGroupUsers.Attach(obj);
            //        _context.VIBGroupUsers.Remove(obj);
            //        _context.SaveChanges();
            //    }
            //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete list group user successfully");
            //    return Json(new JMessage() { Error = false, Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_SUCCESS"), _stringLocalizer["GUSR_TITLE").ToLower()) });
            //}
            //catch (Exception ex)
            //{
            //    //_logger.LogError(LoggingEvents.LogDb, "Delete list group user fail");
            //    return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"), _stringLocalizer["GUSR_TITLE").ToLower()) });
            //}
        }
        private List<string> FindParentInList(List<string> listId, string id, List<string> listParentId)
        {
            AdGroupUser obj = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == id);
            if (obj != null)
            {
                var parentObj = _context.AdGroupUsers.FirstOrDefault(x => x.GroupUserCode == obj.ParentCode);
                if (parentObj != null && listId.Contains(parentObj.GroupUserCode))
                {
                    listParentId.Add(parentObj.GroupUserCode);
                    FindParentInList(listId, parentObj.GroupUserCode, listParentId);
                }
            }
            return listParentId;
        }
        [HttpPost]
        public async Task<JsonResult> GetItem(int? id)
        {
            var query = await _context.AdGroupUsers
                                        .Where(m => m.GroupUserId == id)
                                        .Select(x => new
                                        {
                                            GroupUserId = x.GroupUserId,
                                            GroupUserCode = x.GroupUserCode,
                                            Title = x.Title,
                                            Description = x.Description,
                                            ParentCode = x.ParentCode,
                                            IsEnabled = x.IsEnabled,
                                            Priority = x.Priority,
                                            ParentName = x.ParentCode == null ? "" : string.Format("{0} - {1}", x.ParentCode, x.Parent.Title),
                                        }).FirstOrDefaultAsync();
            return Json(query);
        }
        [HttpPost]
        public object GetGRole()
        {
            var a = _context.Roles.Where(x => x.Code != "ROOT" && x.Status).OrderBy(x => x.Ord).Select(x => new { x.Id, x.Title });
            return Json(a);
        }
        [HttpPost]
        public object GetUserInGroup([FromBody]UserInGroupModelCustom obj)
        {
            try
            {
                var query = from uig in _context.AdUserInGroups
                            join u in _context.Users on uig.UserId equals u.Id
                            where ((String.IsNullOrEmpty(obj.UName) || u.UserName.ToLower().Contains(obj.UName)) && uig.GroupUserCode == obj.Id)
                            select new
                            {
                                UserId = uig.User.Id,
                                UserName = uig.User.UserName,
                                FullName = uig.User.FamilyName + " " + uig.User.GivenName,
                                Email = uig.User.Email,
                                RoleId = uig.RoleId,
                            };

                return Json(query);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }
        [HttpPost]
        public async Task<object> GetUserOutGroup([FromBody]UserInGroupModelCustom obj)
        {
            try
            {
                var sql = "select * from ASP_NET_USERS where (ID not in (select USER_ID from VIB_USER_IN_GROUP where GROUP_USER_CODE = '" + obj.Id + "') and (UPPER(USER_NAME) LIKE UPPER('%" + obj.UName + "%')))";
                var query = await _context.Users.FromSql(sql).ToListAsync();
                var data = query.Where(x => x.Active).Select(x => new
                {
                    UserId = x.Id,
                    UserName = x.UserName,
                    FullName = x.FamilyName + " " + x.GivenName,
                    Email = x.Email,
                    RoleId = "--- Role ---",
                }).OrderBy(x => x.UserName);

                return Json(data);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        ////Tìm thì không thấy sử dụng đến - comment lại cho đỡ loãng khi tìm kiếm references
        //// Case: 1 User - n (1 Group - 1 Role)
        //[HttpPost]
        //public async Task<IActionResult> UpdateGroupUserAsync([FromBody]UserInGroupModel model)
        //{
        //    JMessage msg = new JMessage { Error = true, Title = _sharedResources["COM_MSG_UPDATE_USER_DEPT_FAIL") };
        //    try
        //    {
        //        if (model.UserInGroups.Count > 0)
        //        {
        //            // Delete Selected User in userInGroup (Xoa nhung user trong Group duoc chuyen sang bang ngoai Group)
        //            var listUserDel = _context.AdUserInGroups.Where(x => x.GroupUserCode == model.GroupUserCode && model.UserInGroups.All(y => y.UserId != x.UserId));
        //            if (listUserDel.Any())
        //            {
        //                // Remove all permission of user in group
        //                var listPermission = _context.AdPermissions.Where(x => x.GroupUserCode == model.GroupUserCode && x.UserId != null && listUserDel.Any(y => y.UserId == x.UserId));
        //                if (listPermission.Any()) _context.RemoveRange(listPermission);
        //                // Remove user in group
        //                _context.AdUserInGroups.RemoveRange(listUserDel);
        //            }

        //            // Add & Update userInGroup
        //            var listUserUpdate = _context.AdUserInGroups.Where(x => x.GroupUserCode == model.GroupUserCode && model.UserInGroups.Any(y => y.UserId == x.UserId));
        //            foreach (var uInGroup in model.UserInGroups)
        //            {
        //                var u = listUserUpdate.FirstOrDefault(x => x.UserId == uInGroup.UserId);
        //                if (u == null)
        //                {
        //                    // Add new userInGroup
        //                    u = new AdUserInGroup();
        //                    u.UserId = uInGroup.UserId;
        //                    u.GroupUserCode = uInGroup.GroupUserCode;
        //                    u.RoleId = uInGroup.RoleId;
        //                    u.GrantAll = true;
        //                    _context.AdUserInGroups.Add(u);
        //                    // Update user permission
        //                    UpdatePermissionUserByGroup(_context, uInGroup.GroupUserCode, uInGroup.UserId, u.RoleId, null);
        //                }
        //                else
        //                {
        //                    if (u.RoleId == uInGroup.RoleId) continue;

        //                    // Update user permission
        //                    UpdatePermissionUserByGroup(_context, uInGroup.GroupUserCode, uInGroup.UserId, u.RoleId, uInGroup.RoleId);
        //                    // Update userInGroup
        //                    u.UserId = uInGroup.UserId;
        //                    u.GroupUserCode = uInGroup.GroupUserCode;
        //                    u.RoleId = uInGroup.RoleId;
        //                    _context.AdUserInGroups.Update(u);
        //                }
        //            }
        //        }
        //        else
        //        {
        //            // Delete All userInGroup
        //            var listUser = await _context.AdUserInGroups.Where(x => x.GroupUserCode == model.GroupUserCode).ToListAsync();
        //            if (listUser.Count > 0)
        //            {
        //                // Remove all permission of user in group
        //                var listPermission = _context.AdPermissions.Where(x => x.GroupUserCode == model.GroupUserCode && x.UserId != null && listUser.Any(y => y.UserId == x.UserId));
        //                if (listPermission.Any()) _context.RemoveRange(listPermission);
        //                // Remove user in group
        //                _context.AdUserInGroups.RemoveRange(listUser);
        //            }
        //        }
        //        await _context.SaveChangesAsync();
        //        ////_actionLog.InsertActionLog("VIB_USER_IN_GROUP", "Update user in department or profit center", null, null, "Update");

        //        msg.Error = false;
        //        msg.Title = _sharedResources["COM_MSG_UPDATE_USER_DEPT_SUCCESS");
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Update GroupUser failed");
        //        msg.Object = ex;
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult GetUserMainInGroup(string deparment)
        //{
        //    var list = (from a in _context.DispatchesUsers
        //                where a.GroupUserCode == deparment
        //                select new
        //                {
        //                    a.UserId
        //                }
        //                ).ToList();
        //    string[] list1 = new string[list.Count];
        //    for (var i = 0; i < list.Count; ++i)
        //    {
        //        list1[i] = list.ElementAt(i).UserId;
        //    }
        //    return Json(list1);
        //}

        [HttpPost]
        public JsonResult GetListUserInGroup(string deparment)
        {
            var list = (from a in _context.AdGroupUsers
                        join b in _context.AdUserInGroups on a.GroupUserCode equals b.GroupUserCode into b2
                        from b1 in b2.DefaultIfEmpty()
                        join c in _context.Users on b1.UserId equals c.Id into c2
                        from c1 in c2.DefaultIfEmpty()
                        where a.GroupUserCode == deparment
                        select new
                        {
                            c1
                        }).ToList();
            List<DispatchesUser1> list1 = new List<DispatchesUser1>();
            foreach (var item in list)
            {
                if (item.c1 != null)
                {
                    DispatchesUser1 dt = new DispatchesUser1();
                    dt.Id = item.c1.Id;
                    dt.GivenName = item.c1.GivenName;
                    list1.Add(dt);
                }
            }
            return Json(list1);
        }

        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        public class AdGroupUserUpdate
        {

            public int GroupUserId { get; set; }


            public string GroupUserCode { get; set; }

            public string ParentCode { get; set; }

            public string Title { get; set; }

            public string Description { get; set; }

            public DateTime? CreatedDate { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? UpdatedDate { get; set; }
            public string UpdatedBy { get; set; }
            public bool IsEnabled { get; set; }
            public string Leader { get; set; }
            public int Priority { get; set; }
        }
    }
    public class DispatchesUser1
    {
        public string Id { get; set; }
        public string GivenName { get; set; }
    }
}