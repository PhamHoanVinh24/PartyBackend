using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using III.Admin.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    public class FunctionModel
    {
        public int Id { set; get; }
        public string Title { set; get; }
        public string TitleJoin { set; get; }
        public string Code { set; get; }
        public string ParentCode { set; get; }
        public int? Ord { set; get; }
        public string Description { set; get; }
        public bool IsChecked { set; get; }
        public int Level { get; set; }
        public bool HasChild { get; set; }
        public bool IsVisible { get; set; }
        public bool IsExpand { get; set; }
    }
    public class JTableModelFunctionCustom : JTableModel
    {
        public string AppCode { set; get; }
        public string Code { set; get; }
        public string Name { set; get; }
        public int? Id { set; get; }
    }
    [Area("Admin")]
    public class FunctionController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<FunctionController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public FunctionController(EIMDBContext context, ILogger<FunctionController> logger, IActionLogService actionLog, IStringLocalizer<FunctionController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _logger = logger;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbFunction", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbFunction"] = _sharedResources["COM_CRUMB_FUNCTION"];
            return View();
        }

        [HttpGet]
        public object GetAll()
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Get list function");
            ////_actionLog.InsertActionLog("VIB_FUNCTION", "Get list function", null, null, "GetAll");

            var rs = _context.AdFunctions.OrderBy(x => x.Title).Select(x => new { x.FunctionId, x.Title, x.FunctionCode, x.ParentCode, x.Ord, x.Description }).AsNoTracking().ToList();
            return Json(rs);
        }
      
        private List<int> GetlistTreeId(List<int> listTreeId)
        {
            List<int> noDupes = listTreeId.Distinct().ToList();
            return noDupes;
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelFunctionCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (string.IsNullOrEmpty(jTablePara.Name) && string.IsNullOrEmpty(jTablePara.AppCode))
            {
                var query = from x in _context.AdFunctions
                            select new FunctionModel
                            {
                                Id = x.FunctionId,
                                Title = x.Title,
                                Code = x.FunctionCode,
                                ParentCode = x.ParentCode,
                                Ord = x.Ord,
                                Description = x.Description
                            };
                var data = query.OrderBy(x => x.Title).AsNoTracking();
                var listFunction = data as IList<FunctionModel> ?? data.ToList();

                var result = new List<FunctionModel>();
                foreach (var func in listFunction.Where(x => string.IsNullOrEmpty(x.ParentCode)).OrderBy(x => x.Title))
                {
                    var listChild = GetFunctionChild(listFunction, func.Code, ". . . ");

                    var function = new FunctionModel();
                    function.Id = func.Id;
                    function.Title = (listChild.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + func.Title;
                    function.Code = func.Code;
                    function.ParentCode = func.ParentCode;
                    function.Ord = func.Ord;
                    function.Description = func.Description;
                    //function.TotalRow = listFunction.Count;
                    result.Add(function);
                    if (listChild.Count > 0) result = result.Concat(listChild).ToList();
                }
                var count = result.Count();
                var res = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "Title", "Code", "ParentCode", "Ord", "Description");
                return Json(jdata);
            }
            else
            {
                var query = _context.AdFunctions
                    .Where(p => (string.IsNullOrEmpty(jTablePara.Name) || p.Title.ToLower().Contains(jTablePara.Name.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.AppCode) || p.FunctionCode.ToLower().Contains(jTablePara.AppCode.ToLower())))
                    .OrderBy(x => x.Title)
                    .Select(x => new { Id = x.FunctionId, x.Title, Code = x.FunctionCode, x.ParentCode, x.Ord, x.Description })
                    .AsNoTracking();
                var count = query.Count();

                var data = query
                    .Skip(intBeginFor)
                    .Take(jTablePara.Length).AsNoTracking()
                    .ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Code", "ParentCode", "Ord", "Description");
                return Json(jdata);
            }
        }

        private static List<FunctionModel> GetFunctionChild(IList<FunctionModel> listFunction, string parentCode, string level)
        {
            var result = new List<FunctionModel>();
            //var totalRow = listFunction.Count;
            var query = from func in listFunction
                        where func.ParentCode == parentCode
                        orderby func.Title
                        select new FunctionModel
                        {
                            Id = func.Id,
                            Title = func.Title,
                            Code = func.Code,
                            ParentCode = func.ParentCode,
                            Ord = func.Ord,
                            Description = func.Description,
                            //TotalRow = totalRow,
                        };

            var listFunc = query as IList<FunctionModel> ?? query.ToList();
            foreach (var func in listFunc)
            {
                var destination = GetFunctionChild(listFunction, func.Code, ". . . " + level);
                func.Title = level + (destination.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + func.Title;
                result.Add(func);
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }

        [HttpPost]
        public object JTableResourceByFunctionId([FromBody]JTableModelFunctionCustom jTablePara)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Get list Resource of Function");
            ////_actionLog.InsertActionLog("VIB_FUNCTION", "Get list Resource of Function", null, null, "JTable");

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from x in _context.AdResources
                            //join g in _context.VIBGroupResources on x.GroupResourceId equals g.Id
                        join p in _context.AdPrivileges on x.ResourceCode equals p.ResourceCode
                        where p.FunctionCode == jTablePara.Code && x.Status == true
                        select new AdResource
                        {
                            ResourceId = x.ResourceId,
                            Title = x.Title,
                            ResourceCode = x.ResourceCode,
                            ParentCode = x.ParentCode,
                            Ord = x.Ord,
                            Description = x.Description,
                            //GroupResourceId = x.GroupResourceId,
                            //GroupResourceTitle = g.Title,
                            Path = x.Path,
                            Api = x.Api,
                            Status = x.Status
                        };
            var data = query.AsNoTracking();//.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking();
            var count = data.Count();
            var res = jTablePara.Length > 0 ? data.Skip(intBeginFor).Take(jTablePara.Length).ToList() : data.ToList();
            var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "Title", "ResourceCode", "ParentCode", "Ord", "Description", /*"GroupResourceId", "GroupResourceTitle", */"Path", "Api", "Status");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]AdFunction obj)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Insert function");
            var msg = new JMessage() { Error = false };
            try
            {
                var func = _context.AdFunctions.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                if (func == null)
                {
                    func = new AdFunction();
                    func.FunctionCode = obj.FunctionCode;
                    func.Title = obj.Title;
                    func.Description = obj.Description;
                    func.ParentCode = obj.ParentCode;
                    func.CreatedDate = DateTime.Now;
                    _context.AdFunctions.Add(func);
                    var a = _context.SaveChanges();
                    //msg.Title = "Thêm khoản mục thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                    //_logger.LogInformation(LoggingEvents.LogDb, "Insert function successfully");
                    //_actionLog.InsertActionLog("VIB_FUNCTION", "Insert function successfully", null, obj, "Insert");

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["FUNC_CODE"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Insert application fail");
                    //_actionLog.InsertActionLog("VIB_FUNCTION", "Insert function failed: Function code is exists", null, null, "Error");

                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //try
                //{
                //    if (ex.InnerException.Data["HelpLink.EvtID"].ToString() == "2627")
                //    {
                //        //msg.Title = "Mã đã tồn tại trong hệ thống";
                //        msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"), _stringLocalizer["ADM_FUNC_TITLE_FUNC"));
                //        //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
                //        //_actionLog.InsertActionLog("VIB_FUNCTION", "Insert function fail", null, null, "Error");


                //        return Json(msg);
                //    }
                //}
                //catch (Exception)
                //{
                //}

                msg.Object = ex;
                //msg.Title = "Có lỗi khi thêm khoản mục";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
                //_actionLog.InsertActionLog("VIB_FUNCTION", "Insert function failed: " + ex.Message, null, null, "Error");

                return Json(msg);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]AdFunction obj)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Update function");
            var msg = new JMessage() { Error = false };
            try
            {
                var objUpdate = _context.AdFunctions.SingleOrDefault(x => x.FunctionId == obj.FunctionId);
                var objOld = CommonUtil.Clone(objUpdate);
                if (objUpdate.FunctionCode != obj.FunctionCode)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ERR_CODE_CHANGE"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Update function fail");
                    //_actionLog.InsertActionLog("VIB_FUNCTION", "Update function failed: Function code can't change", null, null, "Error");

                }
                else
                {
                    objUpdate.Title = obj.Title;
                    objUpdate.ParentCode = obj.ParentCode;
                    objUpdate.Ord = obj.Ord;
                    objUpdate.Description = obj.Description;
                    objUpdate.UpdatedDate = DateTime.Now;
                    var a = _context.SaveChanges();
                    //msg.Title = "Sửa khoản mục thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                    //_logger.LogInformation(LoggingEvents.LogDb, "Update function successfully");
                    //_actionLog.InsertActionLog("VIB_FUNCTION", "Update function successfully", objOld, obj, "Update");

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //try
                //{
                //    if (ex.InnerException.Data["HelpLink.EvtID"].ToString() == "2627")
                //    {
                //        //msg.Title = "Mã đã tồn tại trong hệ thống";
                //        msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"), _stringLocalizer["ADM_FUNC_TITLE_FUNC"));
                //        //_logger.LogError(LoggingEvents.LogDb, "Update function fail");
                //        //_actionLog.InsertActionLog("VIB_FUNCTION", "Update function fail", null, null, "Error");

                //        return Json(msg);
                //    }
                //}
                //catch (Exception)
                //{
                //}

                msg.Error = true;
                //msg.Title = "Có lỗi khi sửa khoản mục";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //_logger.LogError(LoggingEvents.LogDb, "Update function fail");
                //_actionLog.InsertActionLog("VIB_FUNCTION", "Update function failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete([FromBody]int id)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Delete function");
            try
            {
                AdFunction obj = _context.AdFunctions.SingleOrDefault(x => x.FunctionId == id);
                if (obj != null)
                {
                    var objChild = _context.AdFunctions.FirstOrDefault(x => x.ParentCode == obj.FunctionCode);
                    if (objChild == null)
                    {
                        var appFunc = _context.AdAppFunctions.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                        var priv = _context.AdPrivileges.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                        var pms = _context.AdPermissions.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                        if (appFunc != null || priv != null || pms != null)
                        {
                            //_actionLog.InsertActionLog("VIB_FUNCTION", "Delete function fail", null, null, "Error");
                            return Json(new JMessage() { Error = true, Title = _stringLocalizer["ADM_DELETE_FAILED"] });
                        }
                        else
                        {
                            _context.Remove(obj);
                            _context.SaveChanges();
                            //_logger.LogInformation(LoggingEvents.LogDb, "Delete function successfully");
                            //_actionLog.InsertActionLog("VIB_FUNCTION", "Delete function successfully", obj, null, "Delete");

                            //return Json(new JMessage() { Error = false, Title = "Xóa khoản mục thành công." });
                            return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]) });
                        }
                    }
                    else
                    {
                        //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                        //_actionLog.InsertActionLog("VIB_FUNCTION", "Delete function fail", null, null, "Error");

                        return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_CHILD"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]) });
                    }
                }
                else
                {
                    //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                    //_actionLog.InsertActionLog("VIB_FUNCTION", "Delete function fail", null, null, "Error");

                    return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]) });
                }
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                //_actionLog.InsertActionLog("VIB_FUNCTION", "Delete function failed: " + ex.Message, null, null, "Error");

                //return Json(new JMessage() { Error = true, Title = "Có lỗi khi xóa khoản mục.", Object = ex.Message });
                return Json(new JMessage() { Error = true, Title = _sharedResources["COM_MSG_ERR"] });
            }
        }

        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete list Function");
                List<int> listId = new List<int>();
                List<int> listRef = new List<int>();
                List<int> listDel = new List<int>();
                List<int> listDelFinal = new List<int>();
                List<AdFunction> listFunction = new List<AdFunction>();
                foreach (var id in listIdI)
                {
                    AdFunction obj = _context.AdFunctions.FirstOrDefault(x => x.FunctionId == id);
                    if (obj != null)
                    {
                        var appFunc = _context.AdAppFunctions.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                        var priv = _context.AdPrivileges.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                        var pms = _context.AdPermissions.FirstOrDefault(x => x.FunctionCode == obj.FunctionCode);
                        if (appFunc == null && priv == null && pms == null)
                        {
                            listId.Add(id);
                        }
                    }
                }
                if (listId.Any())
                {
                    // Find list Id haven't child , this list can delete (list A)
                    foreach (var id in listId)
                    {
                        AdFunction obj = _context.AdFunctions.FirstOrDefault(x => x.FunctionId == id);
                        if (obj != null)
                        {
                            var idRef = _context.AdFunctions.FirstOrDefault(x => x.ParentCode == obj.FunctionCode);
                            if (idRef == null)
                            {
                                listDel.Add(id);
                            }
                        }
                    }
                    if (listDel.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["ERR_LIST_OBJ_HAS_CHILD"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Delete list Function fail");
                        //_actionLog.InsertActionLogDeleteItem("VIB_FUNCTION", "Delete list Function fail", null, null, "Error");
                    }
                    else
                    {
                        // Find final list Id (parent, grandparent,...) begin from (list A), this list can delete.
                        listDelFinal = listDelFinal.Concat(listDel).ToList();
                        foreach (var id in listDel)
                        {
                            var listAdd = FindParentInList(listId, id, new List<int>());
                            listDelFinal = listDelFinal.Concat(listAdd).ToList();
                        }
                        // Find list Id in selected list can't delete.
                        foreach (var id in listId)
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
                                AdFunction objDel = _context.AdFunctions.FirstOrDefault(x => x.FunctionId == idDel);
                                listFunction.Add(objDel);
                                _context.AdFunctions.Attach(objDel);
                                _context.AdFunctions.Remove(objDel);
                            }
                            _context.SaveChanges();
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["DEL_SUCCESS_LIST_ITEM_BUT_HAS_CHILD"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete part of the Function list successfully");
                            //_actionLog.InsertActionLogDeleteItem("VIB_FUNCTION", "Delete part of the Function list successfully", listFunction.ToArray(), null, "Delete");

                        }
                        // case full list parameter can delete.
                        else
                        {
                            foreach (var idDel in listDelFinal)
                            {
                                AdFunction objDel = _context.AdFunctions.FirstOrDefault(x => x.FunctionId == idDel);
                                listFunction.Add(objDel);
                                _context.AdFunctions.Attach(objDel);
                                _context.AdFunctions.Remove(objDel);
                            }
                            _context.SaveChanges();
                            msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_SUCCESS"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete list Function successfully");
                            //_actionLog.InsertActionLogDeleteItem("VIB_FUNCTION", "Delete list Function successfully", listFunction.ToArray(), null, "Delete");
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ERR_LIST_OBJ_REF"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Delete list Function fail");
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_FAIL"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Function fail");
            }
            return Json(msg);
        }

        private List<int> FindParentInList(List<int> listId, int id, List<int> listParentId)
        {
            AdFunction obj = _context.AdFunctions.FirstOrDefault(x => x.FunctionId == id);
            if (obj != null)
            {
                var parentObj = _context.AdFunctions.FirstOrDefault(x => x.FunctionCode == obj.ParentCode);
                if (parentObj != null && listId.Contains(parentObj.FunctionId))
                {
                    listParentId.Add(parentObj.FunctionId);
                    FindParentInList(listId, parentObj.FunctionId, listParentId);
                }
            }
            return listParentId;
        }

        [HttpPost]
        public JsonResult GetItem([FromBody]int? id)
        {
            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.AdFunctions.AsNoTracking().First(m => m.FunctionId == id);
            return Json(a);
        }

        [HttpPost]
        public object Resort([FromBody]List<AdFunction> model)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var item in model)
                {
                    _context.AdFunctions.Attach(item);
                    _context.Entry(item).Property(x => x.Ord).IsModified = true;
                    _context.SaveChanges();
                }
                msg.Title = String.Format(_sharedResources["COM_MSG_SORT_SUCCESS"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]); //"Sắp xếp các khoản mục thành công.";
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_sharedResources["COM_MSG_SORT_FAIL"], _stringLocalizer["ADM_FUNC_TITLE_FUNC"]); //"Có lỗi khi sắp xếp khoản mục";
            }
            return Json(msg);
        }

        [HttpPost]
        public List<TreeView> GetTreeData([FromBody]TempSub obj)
        {
            //if (obj.IdI == null && obj.IdS == null)
            //{
            //    return null;
            //}
            if (obj.IdI == null)
            {
                var data = _context.AdFunctions.OrderBy(x => x.Title).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
                return dataOrder;
            }
            else
            {
                string functionCode = _context.AdFunctions.Where(x => x.FunctionId == obj.IdI[0]).Select(x => x.FunctionCode).FirstOrDefault();

                var data = _context.AdFunctions.OrderBy(x => x.Title).Where(x => (x.FunctionCode != functionCode && x.ParentCode != functionCode)).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
                return dataOrder;
            }
        }

        private List<TreeView> GetSubTreeData(List<AdFunction> data, string parentCode, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = parentCode == null
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.Title).ToList()
                : data.Where(x => x.ParentCode == parentCode).OrderBy(x => x.Title).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.FunctionId,
                    Code = item.FunctionCode,
                    Title = item.Title,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentCode == item.FunctionCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.FunctionCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }
        [HttpPost]
        public object GetByParent([FromBody]TempSub obj)
        {
            if (obj.IdS[0] == null || obj.IdS[0] == "")
            {
                var temp = Convert.ToInt32(obj.IdI[0]);
                return Json(_context.AdFunctions.Where(x => (x.ParentCode == obj.IdS[0]) || (temp == 0 && x.ParentCode == null)).OrderBy(x => x.Ord).AsNoTracking().ToList());
            }
            else
            {
                var temp = Convert.ToInt32(obj.IdI[0]);
                return Json(_context.AdFunctions.Where(x => ((x.ParentCode == obj.IdS[0]) || (temp == 0 && x.ParentCode == null))).OrderBy(x => x.Ord).AsNoTracking().ToList());
            }
        }

        [HttpPost]
        public JsonResult GetResourceByFunctionId(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return Json("");
            }
            var query = from a in _context.AdResources
                        join b in _context.AdPrivileges on a.ResourceCode equals b.ResourceCode
                        where b.FunctionCode == id
                        select new
                        {
                            Id = a.ResourceId,
                            Code = a.ResourceCode,
                            a.Description,
                            //a.GroupResourceId,
                            a.ParentCode,
                            a.Path,
                            a.Api,
                            a.Title,
                            a.Ord,
                            b.ResourceCode,
                        };
            var rs = query.AsNoTracking().ToList();
            return Json(rs);
        }
        [HttpPost]
        public List<TreeViewResource> GetTreeResourceData(int? id)
        {
            var data = _context.AdResources.Where(x => x.Status == true).OrderBy(x => x.Title).AsNoTracking();
            var dataOrder = GetSubTreeResourceData(data.ToList(), null, new List<TreeViewResource>(), "");
            //if (id == null || id < 0)
            //{
            //    return null;
            //}
            //var query = from a in _context.VIBFunctions
            //            where !_context.VIBPrivileges.Any(es => (es.ResourceId == a.Id ))
            //            select a;
            //List<VIBFunction> rs = query.ToList<VIBFunction>();
            //var dataOrder = GetSubTreeData(rs, 0, new List<TreeView>(), "");
            return dataOrder;




            //var query = from a in _context.VIBResources
            //            join b in _context.VIBPrivileges on a.Id equals b.ResourceId
            //            where b.FunctionId == id
            //            select new
            //            {
            //                b.ResourceId
            //            };
            //var data1 = query.AsNoTracking().ToList();
            //var data = _context.VIBResources.OrderBy(x => x.Ord).AsNoTracking().ToList();
            //var data2 = data;
            //foreach (var item in data1)
            //{
            //    for (var i = 0; i < data2.Count; i++)
            //    {
            //        if (item.ResourceId == data2[i].Id && data2[i].ParentId != null)
            //        {
            //            data.RemoveAt(i);
            //        }
            //    }
            //}
            //var dataOrder = GetSubTreeResourceData(data, 0, new List<TreeView>(), "");
            //return dataOrder;
        }

        private List<TreeViewResource> GetSubTreeResourceData(List<AdResource> data, string parentCode, List<TreeViewResource> lstCategories, string tab)
        {
            //tab += "- ";
            var contents = parentCode == null
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.Title).ToList()
                : data.Where(x => x.ParentCode == parentCode).OrderBy(x => x.Title).ToList();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.ResourceId,
                    Code = item.ResourceCode,
                    Title = item.Title,
                    TitleJoin = tab + item.Title + " (Api: " + item.Api + ")",
                    ParentCode = item.ParentCode,
                    Path = item.Path,
                    Api = item.Api,
                    Description = item.Description,
                    Status = item.Status,
                    HasChild = data.Any(x => x.ParentCode == item.ResourceCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeResourceData(data, item.ResourceCode, lstCategories, tab + "- ");
            }
            return lstCategories;
        }

        //Insert parentResource first
        [HttpPost]
        public async Task<JsonResult> AddResource([FromBody]FuncResourceModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var func = _context.AdFunctions.Where(p => p.FunctionCode == obj.FunctionCode).AsNoTracking().SingleOrDefault();
                if (func != null)
                {
                    // Add resource
                    if (obj.ResourceAdd != null && obj.ResourceAdd.Count > 0)
                    {
                        foreach (var resCode in obj.ResourceAdd)
                        {
                            var resource = await _context.AdResources.FirstOrDefaultAsync(x => x.ResourceCode == resCode);
                            if (resource != null)
                            {
                                var privilege = await _context.AdPrivileges.FirstOrDefaultAsync(x => x.FunctionCode == func.FunctionCode && x.ResourceCode == resCode);
                                if (privilege == null)
                                {
                                    privilege = new AdPrivilege();
                                    privilege.FunctionCode = func.FunctionCode;
                                    privilege.ResourceCode = resource.ResourceCode;
                                    _context.Add(privilege);
                                }
                            }
                        }
                    }
                    // Remove function
                    if (obj.ResourceDel != null && obj.ResourceDel.Count > 0)
                    {
                        foreach (var resCode in obj.ResourceDel)
                        {
                            var resource = await _context.AdResources.FirstOrDefaultAsync(x => x.ResourceCode == resCode);
                            if (resource != null)
                            {
                                var privilege = await _context.AdPrivileges.FirstOrDefaultAsync(x => x.FunctionCode == func.FunctionCode && x.ResourceCode == resCode);
                                if (privilege != null)
                                {
                                    _context.Remove(privilege);
                                }
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                    //msg.Title = "Cập nhập tài nguyên cho chức năng thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_FUNC_RESOURCE"]);

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Chức năng đã tồn tại!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ADM_FUNC_RESOURCE"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
                }
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //_logger.LogError(LoggingEvents.LogDb, "Insert Resource fail");
                ////_actionLog.InsertActionLog("VIBPrivilege", "An error occurred while Insert Resource", null, null, "Error");

            }
            return Json(msg);
        }

        [HttpPost]
        public object DeletePrivilege([FromBody]AdPrivilege obj)
        {
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete Resource of Function");
                var dataResource = _context.AdResources
                    .Where(p => p.ParentCode == obj.ResourceCode).AsNoTracking().ToList();
                if (dataResource.Count > 0)
                {
                    foreach (var items in dataResource)
                    {
                        var privilege = _context.AdPrivileges
                            .Where(p => p.ResourceCode == items.ResourceCode && p.FunctionCode == obj.FunctionCode)
                            .AsNoTracking().SingleOrDefault();
                        if (privilege != null)
                        {
                            //_logger.LogError(LoggingEvents.LogDb, "Delete Resource fail");
                            return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_CHILD"], _stringLocalizer["RESOURCE"]) });
                        }
                    }
                }
                var privilegeDel = _context.AdPrivileges
                    .Where(p => p.ResourceCode == obj.ResourceCode && p.FunctionCode == obj.FunctionCode)
                    .AsNoTracking().SingleOrDefault();
                _context.AdPrivileges.Attach(privilegeDel);
                _context.AdPrivileges.Remove(privilegeDel);

                _context.SaveChanges();
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete Resource successfully");
                //_actionLog.InsertActionLog("VIBPrivilege", "Delete Resource successfully", obj, null, "Delete");

                return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["RESOURCE"]) });
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete Resource fail");
                //_actionLog.InsertActionLog("VIBPrivilege", "An error occurred while Delete Resource", null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["RESOURCE"]) });
            }
        }

        #region Language
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
        #endregion

        public class FuncResourceModel
        {
            public string FunctionCode { get; set; }
            public List<string> ResourceAdd { get; set; }
            public List<string> ResourceDel { get; set; }
        }
    }
}