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
    public class PermissionController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<PermissionController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public PermissionController(EIMDBContext context, IActionLogService actionLog, IStringLocalizer<PermissionController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbPermission", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbPermission"] = _stringLocalizer["ADM_PERMISSION_TITLE_PERMISSION"];
            return View();
        }

        [HttpPost]
        public async Task<JsonResult> GetResource([FromBody]ObjGetResourceModel obj)
        {
            List<AdResourcePermission> result = new List<AdResourcePermission>();

            try
            {
                var listPermissionDefault = await _context.AdPermissions.Include(i => i.Function).Where(x => x.UserId == null && x.RoleId.Equals(obj.RoleId) && obj.ListGUserId.Any(y => y == x.GroupUserCode)).ToListAsync();
                var listPrivileges = await _context.AdPrivileges.Include(x => x.Function).Include(x => x.Resource).Where(x => x.Resource.Status && obj.ListFuncId.Any(y => y == x.FunctionCode)).ToListAsync();
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
                                var defaultFunction = new AdResourcePermission();
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
                                            select new AdResourcePermission
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
        public async Task<JsonResult> UpdatePermission([FromBody]PermissionModel model)
        {
            JMessage msg = new JMessage { Error = true, Title = string.Format(_stringLocalizer["MSG_UPDATE_FAIL"], _stringLocalizer["PERMISSION"].Value.ToLower()) };
            try
            {
                model.Resources = model.Resources.Where(x => !x.IsFunction).ToList();

                if (model.GroupCodes.Count > 0)
                {
                    model.GroupUserCode = model.GroupCodes.FirstOrDefault();
                    var listRoleId = model.RoleId.Split(",").ToList();

                    var listFunctionChild = await _context.AdFunctions.Where(x => x.FunctionCode == model.FunctionCode || x.ParentCode == model.FunctionCode || x.Parent.ParentCode == model.FunctionCode).ToListAsync();
                    var listPermissionAll = await _context.AdPermissions.Where(x => listRoleId.Any(p => p.Equals(x.RoleId)) && x.GroupUserCode.Equals(model.GroupUserCode) && (string.IsNullOrEmpty(model.FunctionCode) || listFunctionChild.Any(y => y.FunctionCode == x.FunctionCode))).ToListAsync();
                    var listPermissionDefault = listPermissionAll.Where(x => x.UserId == null).ToList();
                    var listPermissionUser = listPermissionAll.Where(x => x.UserId != null).ToList();

                    //Written by Truong
                    var query = from fu in _context.AdFunctions
                                orderby fu.Title
                                select new FunctionModel
                                {
                                    Id = fu.FunctionId,
                                    Title = fu.Title,
                                    Code = fu.FunctionCode,
                                    ParentCode = fu.ParentCode
                                };

                    var listFunction = query.ToList();
                    var lstFunctionChild = GetFunctionChild(listFunction, model.FunctionCode, 1);
                    var lstPermission = _context.AdPermissions.Where(x => (x.FunctionCode.Equals(model.FunctionCode)
                        || lstFunctionChild.Any(k => k.Code.Equals(x.FunctionCode)))
                        && listRoleId.Any(p => p.Equals(x.RoleId)) && x.GroupUserCode.Equals(model.GroupUserCode));
                    _context.RemoveRange(lstPermission);
                    //End written by Truong

                    if (model.GroupCodes.Count > 0)
                    {
                        foreach (var groupUser in model.GroupCodes)
                        {
                            if (!model.IsMultiple)
                            {
                                // Remove permission default
                                var delPermissionDefault = listPermissionDefault.Where(x => x.GroupUserCode == groupUser && !model.Resources.Any(y => y.HasPermission && !y.IsFunction && y.FunctionCode == x.FunctionCode && y.Code == x.ResourceCode));
                                _context.RemoveRange(delPermissionDefault);

                                //// Remove permission user
                                var delPermissionUser = listPermissionUser.Where(x => x.GroupUserCode == groupUser && !model.Resources.Any(y => y.HasPermission && !y.IsFunction && y.FunctionCode == x.FunctionCode && y.Code == x.ResourceCode));
                                _context.RemoveRange(delPermissionUser);
                            }

                            // Add permission default
                            foreach (var roleId in listRoleId)
                            {
                                var addPermissionDefault = model.Resources.Where(x => x.HasPermission && !x.IsFunction)
                                .Select(x => new AdPermission
                                {
                                    ApplicationCode = "ADMIN",
                                    FunctionCode = x.FunctionCode,
                                    ResourceCode = x.Code,
                                    GroupUserCode = groupUser,
                                    RoleId = roleId,
                                    UserId = null,
                                });
                                _context.AddRange(addPermissionDefault);
                            }
                        }
                    }

                    var result = await _context.SaveChangesAsync();
                }

                msg.Error = false;
                msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["PERMISSION"].Value.ToLower());
            }
            catch (Exception ex)
            {
                msg.Object = ex;
            }
            return Json(msg);
        }

        [NonAction]
        private static List<FunctionModel> GetFunctionChild(IList<FunctionModel> listFunction, string parentCode, int ord = 0)
        {
            ord++;
            var result = new List<FunctionModel>();
            var query = from func in listFunction
                        where func.ParentCode == parentCode
                        select new FunctionModel
                        {
                            Id = func.Id,
                            Title = func.Title,
                            Code = func.Code,
                            ParentCode = func.ParentCode,
                            Ord = ord,
                        };
            var listFunc = query as IList<FunctionModel> ?? query.OrderByDescending(x => x.Title).ToList();
            foreach (var func in listFunc)
            {
                var destination = GetFunctionChild(listFunction, func.Code, ord);
                result.Add(func);
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
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