using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MobilePermissionController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<PermissionController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MobilePermissionController(EIMDBContext context, IActionLogService actionLog, IStringLocalizer<PermissionController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["Title"] = _stringLocalizer["ADM_PERMISSION_TITLE_PERMISSION"];
            return View();
        }

        [HttpPost]
        public async Task<JsonResult> GetResource([FromBody] ObjGetResourceModel obj)
        {
            List<MobileResourcePermission> result = new List<MobileResourcePermission>();

            try
            {
                var listPermissionDefault = await _context.MobilePermissions.Include(i => i.Function).Where(x => x.UserId == null && x.RoleId == obj.RoleId && obj.ListGUserId.Any(y => y == x.GroupUserCode)).ToListAsync();/* x.ApplicationCode == obj.AppCode &&*/
                var listPrivileges = await _context.MobilePrivileges.Include(x => x.Function).Include(x => x.Resource).Where(x => x.Resource.Status && obj.ListFuncId.Any(y => y == x.FunctionCode)).ToListAsync();
                if (listPrivileges.Count > 0)
                {
                    var groupFunction = listPrivileges.GroupBy(g => g.Function).OrderBy(o => o.Key.ParentCode).ThenBy(t => t.Key.FunctionCode).ToList();
                    if (groupFunction.Count > 0)
                    {
                        foreach (var groupfunc in groupFunction)
                        {
                            var function = groupfunc.Key;
                            // Get all resource of function
                            var listPrivilegeOfFunction = listPrivileges.Where(x => x.FunctionCode == function.FunctionCode).ToList();
                            if (listPrivilegeOfFunction.Count > 0)
                            {
                                var defaultFunction = new MobileResourcePermission();
                                defaultFunction.Id = function.FunctionId;
                                defaultFunction.Code = function.FunctionCode;
                                defaultFunction.Title = function.Title;
                                defaultFunction.Description = function.Description;
                                defaultFunction.Ord = function.Ord;
                                defaultFunction.ParentCode = function.ParentCode;
                                defaultFunction.FunctionCode = function.FunctionCode;
                                defaultFunction.FunctionName = function.Title;
                                defaultFunction.HasPermission = true;
                                defaultFunction.IsFunction = true;
                                result.Add(defaultFunction); // Add first function

                                var query = from pr in listPrivilegeOfFunction
                                            join gfr in groupfunc on pr.ResourceCode equals gfr.ResourceCode into grpFunc
                                            from fr in grpFunc.DefaultIfEmpty()
                                            select new MobileResourcePermission
                                            {
                                                Id = pr.PrivilegeId,
                                                Code = pr.Resource.ResourceCode,
                                                Title = pr.Resource.Title,
                                                Description = pr.Resource.Description,
                                                Api = pr.Resource.Api,
                                                Path = pr.Resource.Path,
                                                Ord = pr.Resource.Ord,
                                                Style = pr.Resource.Style,
                                                Scope = pr.Resource.Scope,
                                                ParentCode = pr.Resource.ParentCode,
                                                FunctionCode = pr.FunctionCode,
                                                FunctionName = pr.Function.Title,
                                                IsFunction = false,
                                                HasPermission = !obj.IsMultiple && listPermissionDefault.Any(x => x.FunctionCode == pr.FunctionCode && x.ResourceCode == pr.ResourceCode)
                                            };
                                result.AddRange(query);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
            }

            return Json(result);
        }

        [HttpPost]
        public async Task<JsonResult> GetResourceJson(string code)
        {
            var result = "";
            try
            {
                var obj = await _context.MobileResources.FirstOrDefaultAsync(x => x.ResourceCode == code);
                if (obj != null)
                {
                    result = obj.Json;
                }
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
            }
            return Json(result);
        }

        [HttpPost]
        public async Task<JsonResult> UpdatePermission([FromBody] PermissionModel model)
        {
            JMessage msg = new JMessage { Error = true, Title = string.Format(_stringLocalizer["MSG_UPDATE_FAIL"], _stringLocalizer["PERMISSION"].Value.ToLower()) };
            try
            {
                model.Resources = model.Resources.Where(x => !x.IsFunction).ToList();
                if (model.GroupCodes.Count > 0)
                {
                    var listFunctionChild = await _context.MobileFunctions.Where(x => x.FunctionCode == model.FunctionCode || x.ParentCode == model.FunctionCode || x.Parent.ParentCode == model.FunctionCode).ToListAsync();
                    var listGroupUser = await _context.AdGroupUsers.Where(x => model.GroupCodes.Any(y => y == x.GroupUserCode)).ToListAsync();
                    var listUserInGroup = await _context.AdUserInGroups.Where(x => model.GroupCodes.Any(y => y == x.GroupUserCode) && x.RoleId == model.RoleId).ToListAsync();
                    var listPermissionAll = await _context.MobilePermissions.Where(x => x.RoleId == model.RoleId && listGroupUser.Any(y => y.GroupUserCode == x.GroupUserCode) && (string.IsNullOrEmpty(model.FunctionCode) || listFunctionChild.Any(y => y.FunctionCode == x.FunctionCode))).ToListAsync(); /*x.ApplicationCode == model.ApplicationCode &&*/
                    var listPermissionDefault = listPermissionAll.Where(x => x.UserId == null).ToList();
                    var listMobileResource = await _context.MobileResources.ToListAsync();
                    //var listPermissionUser = listPermissionAll.Where(x => x.UserId != null).ToList();
                    if (listGroupUser.Count > 0)
                    {
                        foreach (var groupUser in listGroupUser)
                        {
                            if (!model.IsMultiple)
                            {
                                // Remove permission default
                                var delPermissionDefault = listPermissionDefault.Where(x => x.GroupUserCode == groupUser.GroupUserCode && !model.Resources.Any(y => y.HasPermission && !y.IsFunction && y.FunctionCode == x.FunctionCode && y.Code == x.ResourceCode));
                                _context.RemoveRange(delPermissionDefault);

                                //// Remove permission user
                                //var delPermissionUser = listPermissionUser.Where(x => x.GroupUserCode == groupUser.GroupUserCode && !model.Resources.Any(y => y.HasPermission && !y.IsFunction && y.FunctionCode == x.FunctionCode && y.Code == x.ResourceCode));
                                //_context.RemoveRange(delPermissionUser);
                            }

                            // Add permission default
                            var addPermissionDefault = model.Resources.Where(x => x.HasPermission && !x.IsFunction && !listPermissionDefault.Any(y => y.GroupUserCode == groupUser.GroupUserCode && y.FunctionCode == x.FunctionCode && y.ResourceCode == x.Code))
                                .Select(x => new MobilePermission
                                {
                                    //ApplicationCode = model.ApplicationCode,
                                    ApplicationCode = "ADMIN",
                                    FunctionCode = x.FunctionCode,
                                    ResourceCode = x.Code,
                                    GroupUserCode = groupUser.GroupUserCode,
                                    RoleId = model.RoleId,
                                    UserId = null,
                                    Json = string.IsNullOrEmpty(x.Json) ? listMobileResource.FirstOrDefault(y => y.ResourceCode == x.Code).Json : x.Json,
                                }).ToList();
                            _context.AddRange(addPermissionDefault);

                            //// Add permission user
                            //var listUser = listUserInGroup.Where(x => x.GroupUserCode == groupUser.GroupUserCode).ToList();
                            ////var permissionUser = listPermissionUser.Where(x => x.GroupUserCode == groupUser.GroupUserCode).GroupBy(g => g.UserId).ToList();
                            //if (listUser.Count > 0)
                            //{
                            //    foreach (var perUser in listUser)
                            //    {
                            //        var addPermissionUser = model.Resources.Where(x => x.HasPermission && !x.IsFunction && x.Scope == false && !listPermissionUser.Any(y => y.GroupUserCode == groupUser.GroupUserCode && y.FunctionCode == x.FunctionCode && y.ResourceCode == x.Code))
                            //            .Select(x => new MobilePermission
                            //            {
                            //                //ApplicationCode = model.ApplicationCode,
                            //                ApplicationCode = "ADMIN",
                            //                FunctionCode = x.FunctionCode,
                            //                ResourceCode = x.Code,
                            //                GroupUserCode = groupUser.GroupUserCode,
                            //                RoleId = model.RoleId,
                            //                UserId = perUser.UserId,
                            //            });
                            //        _context.AddRange(addPermissionUser);
                            //    }
                            //}
                        }
                    }

                    var result = await _context.SaveChangesAsync();
                }
                _actionLog.InsertActionLog("VIB_PERMISSION", "Update define permission for deparment/profit center success", null, null, "Update");

                msg.Error = false;
                msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["PERMISSION"].Value.ToLower());
            }
            catch (Exception ex)
            {
                _actionLog.InsertActionLog("VIB_PERMISSION", "Update define permission failed: " + ex.Message, null, null, "Error");
                msg.Object = ex;
            }
            return Json(msg);
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
    }
}