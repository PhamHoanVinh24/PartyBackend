using System;
using System.Collections.Generic;
using System.IO;
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
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using ESEIM.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    public class JTableModelApplicationCustom : JTableModel
    {
        public int? Id { set; get; }
        public string Code { set; get; }
    }
    public class JTableModelApplicationSearch : JTableModel
    {
        public string AppCode { set; get; }
        public string Name { set; get; }
    }
    [Area("Admin")]
    public class ApplicationController : BaseController
    {
        private readonly EIMDBContext _context;

        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<ApplicationController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ApplicationController(EIMDBContext context, ILogger<ApplicationController> logger, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<ApplicationController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;

        }
        [Breadcrumb("ViewData.CrumbApplication", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbApplication"] = _sharedResources["COM_CRUMB_APPLICATION"];
            return View();
        }
        [HttpPost]
        public object GetAll()
        {
            var a = _context.AdApplications.OrderBy(x => x.Ord).AsNoTracking().ToList();
            return Json(a);
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelApplicationSearch jTablePara)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Get list application");
            //_actionLog.InsertActionLog("VIB_APPLICATION", "Get list application", null, null, "JTable");

            var count = _context.AdApplications
                            .Where(p => (string.IsNullOrEmpty(jTablePara.AppCode) || (!string.IsNullOrEmpty(p.ApplicationCode) && p.ApplicationCode.ToLower().Contains(jTablePara.AppCode.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.Name) || (!string.IsNullOrEmpty(p.Title) && p.Title.ToLower().Contains(jTablePara.Name.ToLower())))
                            && p.Status.Equals(1))
                            .Count();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var data = _context.AdApplications
                .Where(p => (string.IsNullOrEmpty(jTablePara.AppCode) || (!string.IsNullOrEmpty(p.ApplicationCode) && p.ApplicationCode.ToLower().Contains(jTablePara.AppCode.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.Name) || (!string.IsNullOrEmpty(p.Title) && p.Title.ToLower().Contains(jTablePara.Name.ToLower())))
                            && p.Status.Equals(1))
                .OrderUsingSortExpression(jTablePara.QueryOrderBy)
                .Select(x => new { Id = x.ApplicationId, x.Title, x.ApplicationCode, x.Status, x.Description, x.Ord, x.Icon, x.AppUrl })
                .Skip(intBeginFor).Take(jTablePara.Length)
                .AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "ApplicationCode", "Status", "Description", "Ord", "Icon", "AppUrl");
            return Json(jdata);
        }
        [HttpPost]
        public object Resort([FromBody]List<AdApplication> model)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var item in model)
                {
                    _context.AdApplications.Attach(item);
                    _context.Entry(item).Property(x => x.Ord).IsModified = true;
                    _context.SaveChanges();
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SORT_SUCCESS"), CommonUtil.ResourceValue("ADM_APP_LBL_APP")); //"Sắp xếp các khoản mục thành công.";
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SORT_FAIL"), CommonUtil.ResourceValue("ADM_APP_LBL_APP")); //"Có lỗi khi sắp xếp khoản mục";
            }
            return Json(msg);
        }
        //FromBody
        [HttpPost]
        public async Task<JsonResult> Insert(AdApplication obj, IFormFile uploadIcon)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Insert application");
            var msg = new JMessage() { Error = false };
            try
            {
                var app = _context.AdApplications.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                if (app == null)
                {
                    var iconUrl = string.Empty;
                    if (uploadIcon != null && uploadIcon.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "images\\appIcon");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = obj.ApplicationCode + "-" + uploadIcon.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await uploadIcon.CopyToAsync(stream);
                        }
                        iconUrl = "/images/appIcon/" + fileName;
                        obj.Icon = iconUrl;
                    }
                    obj.Status = 1;
                    _context.AdApplications.Add(obj);
                    var a = _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("ADM_APP_LBL_APP")); //"Thêm khoản mục thành công";
                                                                                                                                     //_logger.LogInformation(LoggingEvents.LogDb, "Insert application successfully");
                    _actionLog.InsertActionLog("VIB_APPLICATION", "Insert application successfully", null, obj, "Insert");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_EXIST"), CommonUtil.ResourceValue("APP_CODE"));
                    //_logger.LogError(LoggingEvents.LogDb, "Insert application fail");
                    _actionLog.InsertActionLog("VIB_APPLICATION", "Insert application fail: Application code is exists", null, null, "Error");

                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAIL"), CommonUtil.ResourceValue("ADM_APP_LBL_APP")); //"Có lỗi khi thêm khoản mục";
                                                                                                                              //_logger.LogError(LoggingEvents.LogDb, "Insert application fail");
                _actionLog.InsertActionLog("VIB_APPLICATION", "Insert application failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> Update(AdApplication obj, IFormFile uploadIcon)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Update application");
            var msg = new JMessage() { Error = false };
            try
            {
                var objUpdate = _context.AdApplications.SingleOrDefault(x => x.ApplicationId == obj.ApplicationId);
                var objOld = CommonUtil.Clone(objUpdate);
                if (objUpdate.ApplicationCode != obj.ApplicationCode)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_CODE_CHANGE"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"));
                    //_logger.LogError(LoggingEvents.LogDb, "Update group user fail");
                    _actionLog.InsertActionLog("VIB_APPLICATION", "Update application failed: Application code can't change", null, null, "Error");
                }
                else
                {
                    var iconUrl = objUpdate.Icon;
                    if (uploadIcon != null && uploadIcon.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "images\\appIcon");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);

                        var fileName = obj.ApplicationCode + "-" + uploadIcon.FileName;
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await uploadIcon.CopyToAsync(stream);
                        }
                        iconUrl = "/images/appIcon/" + fileName;
                    }

                    objUpdate.Title = obj.Title;
                    objUpdate.AppUrl = obj.AppUrl;
                    objUpdate.Ord = obj.Ord;
                    objUpdate.Icon = iconUrl;
                    objUpdate.UpdatedDate = DateTime.Now;
                    var a = _context.SaveChanges();
                    msg.Title = _stringLocalizer["COM_UPDATE_SUCCESS"];
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("ADM_APP_LBL_APP")); //"Sửa khoản mục thành công";
                    _actionLog.InsertActionLog("VIB_APPLICATION", "Update application successfully", objOld, objUpdate, "Update");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                                                                                                                                 //_logger.LogError(LoggingEvents.LogDb, "Update application fail");
                _actionLog.InsertActionLog("VIB_APPLICATION", "Update application failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }
        //[HttpPost]
        //public object Delete(int id)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete application");
        //    try
        //    {
        //        VIBApplication obj = new VIBApplication();
        //        obj.Id = id;
        //        _context.VIBApplications.Attach(obj);
        //        _context.VIBApplications.Remove(obj);
        //        _context.SaveChanges();
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete application successfully");
        //        return Json(new JMessage() { Error = false, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("APPLICATION"))/*"Xóa khoản mục thành công."*/ });
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete application fail");
        //        return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_FAIL"), CommonUtil.ResourceValue("APPLICATION"))/*"Có lỗi khi xóa khoản mục."*/ });
        //    }
        //}
        [HttpPost]
        public object CheckUsing(int id)
        {
            var msg = new JMessage() { Error = false };
            AdApplication obj = _context.AdApplications.FirstOrDefault(x => x.ApplicationId == id);
            if (obj != null)
            {
                var appFunc = _context.AdAppFunctions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                var pms = _context.AdPermissions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                if (appFunc != null || pms != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_OBJ_REF"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"));
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_NOT_CHECKED"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"));
            }
            return Json(msg);
        }
        //[HttpPost]
        //public object CheckListUsing(List<int> listId)
        //{
        //    var msg = new JMessage() { Error = false };
        //    List<int> listRef = new List<int>();
        //    List<int> listDel = new List<int>();
        //    foreach (var id in listId)
        //    {
        //        VIBApplication obj = _context.VIBApplications.FirstOrDefault(x => x.ApplicationId == id);
        //        if (obj != null)
        //        {
        //            var appFunc = _context.VIBAppFunctions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
        //            var pms = _context.VIBPermissions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
        //            if (appFunc != null || pms != null)
        //            {
        //                listRef.Add(id);
        //            }
        //            else
        //            {
        //                listDel.Add(id);
        //            }
        //        }
        //    }
        //    if (listRef.Count == listId.Count)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("ERR_LIST_OBJ_REF"), CommonUtil.ResourceValue("APPLICATION"));
        //        return Json(msg);
        //    }
        //    else
        //    {
        //        return listDel;
        //    }
        //}
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete application");
                AdApplication obj = _context.AdApplications.FirstOrDefault(x => x.ApplicationId == id);
                if (obj != null)
                {
                    var appFunc = _context.AdAppFunctions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                    var pms = _context.AdPermissions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                    if (appFunc != null || pms != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_OBJ_REF"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"));
                        //_logger.LogError(LoggingEvents.LogDb, "Delete application fail");
                        _actionLog.InsertActionLog("VIB_APPLICATION", "Delete application: Unable to delete application is being used elsewhere", null, null, "Delete");
                    }
                    else
                    {
                        //_context.VIBApplications.Attach(obj);
                        _context.AdApplications.Remove(obj);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("ADM_APP_LBL_APP")); /*"Xóa khoản mục thành công."*/
                                                                                                                                            //_logger.LogInformation(LoggingEvents.LogDb, "Delete application successfully");
                        _actionLog.InsertActionLog("VIB_APPLICATION", "Delete application successfully", obj, null, "Delete");
                    }
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete application fail");
                _actionLog.InsertActionLog("VIB_APPLICATION", "Delete application failed: " + ex.Message, null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_FAIL"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"))/*"Có lỗi khi xóa khoản mục."*/ });
            }
        }
        [HttpPost]
        public object DeleteItems([FromBody]List<int> listId)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete list application");
                List<int> listRef = new List<int>();
                List<int> listDel = new List<int>();
                List<AdApplication> listApplication = new List<AdApplication>();
                foreach (var id in listId)
                {
                    AdApplication obj = _context.AdApplications.FirstOrDefault(x => x.ApplicationId == id);
                    if (obj != null)
                    {
                        var pms = _context.AdPermissions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                        var appFunc = _context.AdAppFunctions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode);
                        if (appFunc != null || pms != null)
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
                        foreach (var id in listDel)
                        {
                            AdApplication obj = _context.AdApplications.FirstOrDefault(x => x.ApplicationId == id);
                            listApplication.Add(obj);
                            _context.Remove(obj);
                        }
                        _context.SaveChanges();
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_DEL_SUCCESS_LIST_ITEM_BUT_REF"), CommonUtil.ResourceValue("ADM_APP_LBL_APP").ToLower());
                        //_logger.LogError(LoggingEvents.LogDb, "Delete part of the application list successfully");
                        _actionLog.InsertActionLogDeleteItem("VIB_APPLICATION", "Delete part of the application list successfully", listApplication.ToArray(), null, "Delete");

                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_LIST_OBJ_REF"), CommonUtil.ResourceValue("ADM_APP_LBL_APP").ToLower());
                        //_logger.LogError(LoggingEvents.LogDb, "Delete list application fail");
                        _actionLog.InsertActionLogDeleteItem("VIB_APPLICATION", "Delete list application fail", null, null, "Error");

                    }
                }
                else
                {
                    if (listDel.Count > 0)
                    {
                        foreach (var id in listDel)
                        {
                            AdApplication obj = _context.AdApplications.FirstOrDefault(x => x.ApplicationId == id);
                            listApplication.Add(obj);

                            _context.AdApplications.Attach(obj);
                            _context.AdApplications.Remove(obj);
                        }
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_LIST_SUCCESS"),
                            CommonUtil.ResourceValue("ADM_APP_LBL_APP").ToLower());
                        //_logger.LogError(LoggingEvents.LogDb, "Delete part of the application list successfully");
                        _actionLog.InsertActionLogDeleteItem("VIB_APPLICATION", "Delete application list successfully", listApplication.ToArray(), null, "Delete");

                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("ADM_APP_LBL_APP").ToLower());
                //_logger.LogError(LoggingEvents.LogDb, "Delete list application fail");
                _actionLog.InsertActionLogDeleteItem("VIB_APPLICATION", "Delete list application failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }
        //[HttpPost]
        //public object DeleteItems([FromBody]List<int> id)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete list application");
        //    try
        //    {
        //        for (int i = 0; i < id.Count; i++)
        //        {
        //            VIBApplication obj = new VIBApplication();
        //            obj.Id = id[i];
        //            _context.VIBApplications.Attach(obj);
        //            _context.VIBApplications.Remove(obj);
        //            _context.SaveChanges();
        //        }
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete list application successfully");
        //        return Json(new JMessage() { Error = false, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_SUCCESS"), CommonUtil.ResourceValue("APPLICATION"))/*"Xóa các khoản mục thành công."*/ });
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete list application fail");
        //        return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("APPLICATION"))/*"Có lỗi khi xóa các khoản mục."*/ });
        //    }
        //}
        [HttpPost]
        public JsonResult GetItem(int? id)
        {

            if (id == null || id < 0)
            {
                return Json("");
            }
            var a = _context.AdApplications.AsNoTracking().Single(m => m.ApplicationId == id);
            return Json(a);
        }

        //Insert parentFunction first
        [HttpPost]
        public async Task<JsonResult> InsertFunction([FromBody]AppFuncModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var app = _context.AdApplications.Where(p => p.ApplicationCode == obj.ApplicationCode).AsNoTracking().SingleOrDefault();
                if (app != null)
                {
                    // Add function
                    if (obj.FunctionAdd != null && obj.FunctionAdd.Count > 0)
                    {
                        foreach (var funcCode in obj.FunctionAdd)
                        {
                            var function = await _context.AdFunctions.FirstOrDefaultAsync(x => x.FunctionCode == funcCode);
                            if (function != null)
                            {
                                var appFunc = await _context.AdAppFunctions.FirstOrDefaultAsync(x => x.ApplicationCode == app.ApplicationCode && x.FunctionCode == funcCode);
                                if (appFunc == null)
                                {
                                    appFunc = new AdAppFunction();
                                    appFunc.ApplicationCode = app.ApplicationCode;
                                    appFunc.FunctionCode = function.FunctionCode;
                                    _context.Add(appFunc);
                                }
                            }
                        }
                    }
                    // Remove function
                    if (obj.FunctionDel != null && obj.FunctionDel.Count > 0)
                    {
                        foreach (var funcCode in obj.FunctionDel)
                        {
                            var function = await _context.AdFunctions.FirstOrDefaultAsync(x => x.FunctionCode == funcCode);
                            if (function != null)
                            {
                                var appFunc = await _context.AdAppFunctions.FirstOrDefaultAsync(x => x.ApplicationCode == app.ApplicationCode && x.FunctionCode == funcCode);
                                if (appFunc != null)
                                {
                                    _context.Remove(appFunc);
                                }
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                    //msg.Title = "Cập nhập chức năng cho ứng dụng thành công";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"));
                    _actionLog.InsertActionLog("VIB_APP_FUNCTION", "Update function to application successfully", null, null, "Update");
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Ứng dụng đã tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_EXIST"), CommonUtil.ResourceValue("ADM_APP_LBL_APP"));
                    //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAIL"), CommonUtil.ResourceValue("FUNCTION")); //"Có lỗi khi thêm chức năng";
                                                                                                                           //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
                _actionLog.InsertActionLog("VIB_APP_FUNCTION", "Update function to application failed: " + ex.Message, null, null, "Error");
            }
            return Json(msg);
        }
        ////Insert Function include parentFunction
        //[HttpPost]
        //public JsonResult InsertFunction([FromBody]VIBAppFunction obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Insert function");
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var dataFunction = _context.VIBFunctions.Where(p => p.Id == obj.FunctionId).AsNoTracking().Single();
        //        var queryAppFuntion = from function in _context.VIBFunctions
        //                              join appfunction in _context.VIBAppFunctions on function.Id equals appfunction.FunctionId
        //                              where appfunction.ApplicationId == obj.ApplicationId
        //                              select new
        //                              {
        //                                  appfunction.FunctionId,
        //                                  function.ParentId,
        //                              };
        //        var dataAppfunction = queryAppFuntion.AsNoTracking().ToList();
        //        var existsFunction = 0;
        //        foreach (var items in dataAppfunction)
        //        {
        //            if(items.FunctionId == obj.FunctionId)
        //            {

        //                msg.Error = true;
        //                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_EXIST"), CommonUtil.ResourceValue("FUNCTION"));// "Chức năng đã có vui lòng chọn chức năng khác";
        //                //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //                return Json(msg);
        //            }
        //            if(dataFunction.ParentId == items.FunctionId)
        //            {
        //                existsFunction = 1;
        //            }
        //        }
        //        if (dataFunction.ParentId != null && existsFunction == 0 )
        //        {
        //            VIBAppFunction vIBAppFunction = new VIBAppFunction();
        //            vIBAppFunction.FunctionId = (int)dataFunction.ParentId;
        //            vIBAppFunction.ApplicationId = obj.ApplicationId;
        //            _context.VIBAppFunctions.Add(vIBAppFunction);

        //        }
        //        _context.VIBAppFunctions.Add(obj);
        //        var a = _context.SaveChanges();
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("FUNCTION")); //"Thêm chức năng thành công";
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Insert function successfully");
        //    }
        //    catch (Exception)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("MSG_ADD_FAIL"), CommonUtil.ResourceValue("FUNCTION")); //"Có lỗi khi thêm chức năng";
        //        //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public object DeleteFunction([FromBody]VIBAppFunction obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete function");
        //    try
        //    {
        //        var dataFunction = _context.VIBFunctions
        //                    .Where(p => p.ParentId == obj.FunctionId).AsNoTracking().ToList();
        //        if(dataFunction.Count > 0)
        //        {
        //          foreach(var items in dataFunction)
        //            {
        //                var dataAppFunction = _context.VIBAppFunctions
        //                    .Where(p => p.FunctionId == items.Id && p.ApplicationId == obj.ApplicationId)
        //                    .AsNoTracking().SingleOrDefault();
        //                if (dataAppFunction != null) {
        //                _context.VIBAppFunctions.Attach(dataAppFunction);
        //                _context.VIBAppFunctions.Remove(dataAppFunction);
        //                }
        //            }
        //        }

        //            _context.VIBAppFunctions.Attach(obj);
        //            _context.VIBAppFunctions.Remove(obj);

        //        _context.SaveChanges();
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete function successfully");
        //        return Json(new JMessage() { Error = false, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("FUNCTION"))/*"Xóa khoản mục thành công."*/ });
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
        //        return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_FAIL"), CommonUtil.ResourceValue("FUNCTION"))/*"Có lỗi khi xóa khoản mục."*/ });
        //    }
        //}

        [HttpPost]
        public object DeleteFunction([FromBody]AdAppFunction obj)
        {
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete Function of Application");
                var dataAppFunction = _context.AdAppFunctions.Where(p => p.Function.ParentCode == obj.FunctionCode && p.ApplicationCode == obj.ApplicationCode);
                if (dataAppFunction.Any())
                {
                    //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                    _actionLog.InsertActionLog("VIB_APP_FUNCTION", "Delete function fail", null, null, "Error");

                    return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_CHILD"), CommonUtil.ResourceValue("FUNCTION")) });
                }

                var vibAppFunc = _context.AdAppFunctions.FirstOrDefault(x => x.ApplicationCode == obj.ApplicationCode && x.FunctionCode == obj.FunctionCode);
                if (vibAppFunc != null) _context.Remove(vibAppFunc);
                _context.SaveChanges();
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete function successfully");
                _actionLog.InsertActionLog("VIB_APP_FUNCTION", "Delete function successfully", null, null, "Delete");

                return Json(new JMessage() { Error = false, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("FUNCTION")) });
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                _actionLog.InsertActionLog("VIB_APP_FUNCTION", "Delete function failed: " + ex.Message, null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_FAIL"), CommonUtil.ResourceValue("FUNCTION")) });
            }
        }

        [HttpPost]
        public object JTableFunctionByApplicationId([FromBody]JTableModelApplicationCustom jTablePara)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Get list function of Application");
            //_actionLog.InsertActionLog("VIBFunction", "Get list function of Application", null, null, "JTable");

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from vaf in _context.AdAppFunctions
                        join vf in _context.AdFunctions on vaf.FunctionCode equals vf.FunctionCode
                        where vaf.ApplicationCode == jTablePara.Code
                        select new FunctionModel
                        {
                            Id = vaf.AppFunctionId,
                            Title = vf.Title,
                            Code = vaf.FunctionCode,
                            ParentCode = vf.ParentCode,
                            Ord = vf.Ord,
                            Description = vf.Description
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
                result.Add(function);
                if (listChild.Count > 0) result = result.Concat(listChild).ToList();
            }
            var count = result.Count();
            var res = jTablePara.Length > 0 ? result.Skip(intBeginFor).Take(jTablePara.Length).ToList() : result.ToList();
            var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "Title", "Code", "ParentCode", "Ord", "Description");
            return Json(jdata);
        }

        //[HttpPost]
        //public object GetFunctionById(int id)
        //{

        //    var rs = _context.VIBFunctions;
        //    var query = from function in rs
        //                join appfunciton in _context.VIBAppFunctions on function.Id equals appfunciton.FunctionId
        //                where appfunciton.ApplicationId == id
        //                select new
        //                {
        //                    function.Id,
        //                    function.Title,
        //                    function.Code,
        //                    function.ParentId,
        //                    function.Ord,
        //                    function.Description
        //                };
        //    var data = query
        //   .OrderBy(x => x.Ord)
        //   .AsNoTracking().ToList();
        //    return Json(data);
        //}

        //[HttpPost]
        //public List<TreeView> GetTreeData(int? id)
        //{
        //    var queryAppFuntion = from a in _context.VIBFunctions
        //        join b in _context.VIBAppFunctions on a.Id equals b.FunctionId
        //        where id == null || b.ApplicationId == id
        //        select new
        //        {
        //            b.FunctionId
        //        };
        //    var dataAppfunction = queryAppFuntion.AsNoTracking().ToList();
        //    var data = _context.VIBFunctions.OrderBy(x => x.Ord).AsNoTracking().ToList();
        //    var data2 = data;
        //    foreach (var itemappfunction in dataAppfunction)
        //    {
        //        for (var i = 0; i < data2.Count; i++)
        //        {
        //            if (itemappfunction.FunctionId == data2[i].Id && data2[i].ParentId != null)
        //            {
        //                data.RemoveAt(i);
        //            }
        //        }
        //    }
        //    var dataOrder = GetSubTreeData(data, 0, new List<TreeView>(), "");
        //    return dataOrder;
        //}
        [HttpPost]
        public object GetTreeFunction()
        {
            var query = from x in _context.AdFunctions
                            //where x.Title.ToLower().Contains(name.ToLower())
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
            foreach (var func in listFunction.Where(x => string.IsNullOrEmpty(x.ParentCode)))
            {
                var function = new FunctionModel();
                function.Id = func.Id;
                function.Title = func.Title;
                function.Code = func.Code;
                function.ParentCode = func.ParentCode;
                function.Ord = func.Ord;
                function.Description = func.Description;
                function.Level = 0;
                var child = GetTreeFunctionChild(listFunction, func.Code, 1);
                if (child.Count() > 0)
                {
                    function.HasChild = true;
                }
                else
                {
                    function.HasChild = false;
                }
                result.Add(function);
                result = result.Concat(child).ToList();
            }
            var res = result.ToList();
            return Json(res);
        }

        private static List<FunctionModel> GetTreeFunctionChild(IList<FunctionModel> listFunction, string parentCode, int tab)
        {
            var result = new List<FunctionModel>();
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
                            Level = tab,
                            Description = func.Description,
                        };

            var listFunc = query as IList<FunctionModel> ?? query.ToList();
            foreach (var func in listFunc)
            {
                result.Add(func);
                var destination = GetTreeFunctionChild(listFunction, func.Code, tab + 1);
                result = result.Concat(destination).ToList();
            }
            return result;
        }

        //[HttpPost]
        //public List<TreeView> GetTreeData(int? id)
        //{
        //    var data = _context.VIBFunctions.OrderBy(x => x.Title).AsNoTracking().ToList();
        //    var dataOrder = GetSubTreeData(data, 0, new List<TreeView>(), "");
        //    return dataOrder;
        //}

        //private List<TreeView> GetSubTreeData(List<VIBFunction> data, int parentid, List<TreeView> lstCategories, string tab)
        //{
        //    //tab += "- ";
        //    var contents = parentid == 0
        //        ? data.Where(x => x.ParentId == null).ToList()
        //        : data.Where(x => x.ParentId == parentid).ToList();
        //    foreach (var item in contents)
        //    {
        //        var category = new TreeView
        //        {
        //            Id = item.Id,
        //            Title = tab + item.Title,
        //            HasChild = data.Any(x => x.ParentId == item.Id)
        //        };
        //        lstCategories.Add(category);
        //        if (category.HasChild) GetSubTreeData(data, item.Id, lstCategories, tab + "- ");
        //    }
        //    return lstCategories;
        //}
        private static List<FunctionModel> GetFunctionChild(IList<FunctionModel> listFunction, string parentCode, string level)
        {
            var result = new List<FunctionModel>();
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
    }

    public class AppFuncModel
    {
        public string ApplicationCode { get; set; }
        public List<string> FunctionAdd { get; set; }
        public List<string> FunctionDel { get; set; }
    }
}