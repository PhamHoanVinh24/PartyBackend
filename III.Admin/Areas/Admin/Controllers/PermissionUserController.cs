using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using ESEIM.Controllers;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class PermissionUserController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;

        public PermissionUserController(EIMDBContext context, IActionLogService actionLog)
        {
            _context = context;
            _actionLog = actionLog;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region User Permission

        [HttpPost]
        public async Task<IActionResult> SearchUserPaging([FromBody] AccountSearch search)
        {
            var listUsers = await _context.Users
                                        .Where(x => x.Active == true && x.UserType != 10 && (string.IsNullOrEmpty(search.Name) || x.UserName.ToLower().Contains(search.Name.ToLower()) || x.GivenName.ToLower().Contains(search.Name.ToLower())))
                                        .Select(x => new
                                        {
                                            UserId = x.Id,
                                            UserName = x.UserName,
                                            FullName = x.GivenName,
                                        })
                                        .Skip((search.Page - 1) * search.Row).Take(search.Row)
                                        .AsNoTracking().ToListAsync();

            return Json(listUsers);
        }

        [HttpPost]
        public async Task<IActionResult> GetDepartmentByApp([FromBody] UserPerModel model)
        {
            List<GroupUserAll> listData = new List<GroupUserAll>();
            try
            {
                var listUserInGroup = new List<AdUserInGroup>();

                if (string.IsNullOrEmpty(model.UserId))
                {
                    var listGroup = _context.AdGroupUsers.Where(x => x.IsEnabled).OrderBy(x => x.Title).AsNoTracking().ToList();
                    listData = GetSubTreeGroupUser(listGroup, listUserInGroup, null, new List<GroupUserAll>(), "", false);
                }
                else
                {
                    var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == model.UserId);
                    if (user != null)
                    {
                        listData = _context.AdUserInGroups.Where(x => x.UserId == user.Id) /*&& x.ApplicationCode == model.AppCode*/
                                                            .Select(x => new GroupUserAll
                                                            {
                                                                GroupCode = x.GroupUserCode,
                                                                Title = x.GroupUser.Title,
                                                                RoleId = x.RoleId,
                                                                IsMain = x.IsMain,
                                                                IsChecked = true,
                                                                HasChild = false
                                                            }).AsNoTracking().ToList();
                    }
                }
            }
            catch (Exception e)
            {
            }
            return Json(listData);
        }

        [NonAction]
        private List<GroupUserAll> GetSubTreeGroupUser(List<AdGroupUser> data, List<AdUserInGroup> userInGroups, string parentid, List<GroupUserAll> lstCategories, string tab, bool getCheck = false)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentid)
                ? data.AsParallel().Where(x => x.ParentCode == null).OrderBy(x => x.GroupUserId).ToList()
                : data.AsParallel().Where(x => x.ParentCode == parentid).OrderBy(x => x.GroupUserCode).ToList();
            foreach (var item in contents)
            {
                string iconClass = String.Empty;
                var roleId = userInGroups.FirstOrDefault(x => x.GroupUserCode == item.GroupUserCode);
                var category = new GroupUserAll();
                category.GroupCode = item.GroupUserCode;
                category.HasChild = data.Any(x => x.ParentCode == item.GroupUserCode);
                if (category.HasChild)
                {
                    iconClass = "icon-lg fa fa-folder-open icon-state-warning";
                }
                else
                {
                    iconClass = "fa fa-folder text-info";
                }
                var tagSpan = "<span class='" + iconClass + "'></span> ";
                category.Title = tab + tagSpan + item.Title;
                category.RoleId = roleId?.RoleId;
                category.IsChecked = userInGroups.Any(x => x.GroupUserCode == item.GroupUserCode);
                lstCategories.Add(category);

                if (category.HasChild) GetSubTreeGroupUser(data, userInGroups, item.GroupUserCode, lstCategories, tab + "&nbsp;&nbsp;&nbsp;");
            }
            return lstCategories;
        }

        [HttpPost]
        public async Task<IActionResult> GetResourceOfGroup([FromBody] UserPerModel model)
        {
            List<AdResourcePermission> result = new List<AdResourcePermission>();
            try
            {
                var listPermissionAll = await _context.AdPermissions.Include(i => i.Function).ThenInclude(i => i.Parent).Where(x => x.GroupUserCode == model.GroupCode && x.RoleId == model.RoleId).ToListAsync(); /*x.ApplicationCode == model.AppCode &&*/
                var listPermissionDefault = listPermissionAll.Where(x => x.UserId == null).ToList();
                var listPermissionUser = listPermissionAll.Where(x => x.UserId == model.UserId).ToList();
                var countPermissionUser = listPermissionUser.Count;

                if (listPermissionDefault.Count > 0)
                {
                    var groupFunction = listPermissionDefault.GroupBy(g => g.Function).OrderBy(o => o.Key.ParentCode).ThenBy(t => t.Key.FunctionCode).ToList();
                    var groupFunctionParent = listPermissionDefault.GroupBy(g => g.Function.ParentCode).OrderBy(o => o.Key).ToList();
                    if (groupFunctionParent.Count > 0)
                    {
                        var listFunctionAll = await _context.AdFunctions.Where(x => groupFunctionParent.Any(y => y.Key == x.FunctionCode || y.Key == x.ParentCode)).ToListAsync();
                        var listPrivilege = await _context.AdPrivileges.Include(x => x.Function).Include(x => x.Resource).Where(x => x.Resource.Status && groupFunctionParent.Any(y => y.Key == x.FunctionCode || y.Key == x.Function.ParentCode)).ToListAsync();
                        foreach (var funcParent in groupFunctionParent)
                        {
                            var function = listFunctionAll.First(x => (funcParent.Key == null && funcParent.Any(y => y.FunctionCode == x.FunctionCode)) || x.FunctionCode == funcParent.Key);//funcParent.Key;
                            // Get all resource of function
                            var listPrivilegeOfFunction = listPrivilege.Where(x => x.FunctionCode == function.FunctionCode).ToList();
                            if (listPrivilegeOfFunction.Count > 0)
                            {
                                var defaultFunction = new AdResourcePermission();
                                defaultFunction.Id = function.FunctionId;
                                defaultFunction.Code = function.FunctionCode;
                                defaultFunction.Title = function.Title;
                                defaultFunction.Description = function.Description;
                                defaultFunction.Api = string.Empty;
                                defaultFunction.Path = string.Empty;
                                defaultFunction.Ord = function.Ord;
                                defaultFunction.ParentCode = function.ParentCode;
                                defaultFunction.FunctionCode = function.FunctionCode;
                                defaultFunction.FunctionName = function.Title;
                                defaultFunction.HasPermission = true;
                                defaultFunction.IsFunction = true;
                                result.Add(defaultFunction); // Add first function

                                var query = from pr in listPrivilegeOfFunction
                                            join gfr in funcParent on pr.ResourceCode equals gfr.ResourceCode into grpFunc
                                            from fr in grpFunc.DefaultIfEmpty()
                                            let perUser = listPermissionUser.FirstOrDefault(x => x.FunctionCode == pr.FunctionCode && x.ResourceCode == pr.ResourceCode)
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
                                                ExpiredDate = perUser?.ExpiredDate,
                                                IsFunction = false,
                                                HasPermission = (countPermissionUser == 0 && fr != null) || perUser != null
                                            };
                                result.AddRange(query);
                            }
                            // Get all function child and resource
                            var groupFunctionChild = listFunctionAll.Where(x => x.ParentCode == function.FunctionCode).ToList();
                            if (groupFunctionChild.Count > 0)
                            {
                                foreach (var funcChild in groupFunctionChild)
                                {
                                    function = funcChild;
                                    // Get all resource of function
                                    listPrivilegeOfFunction = listPrivilege.Where(x => x.FunctionCode == function.FunctionCode).ToList();
                                    if (listPrivilegeOfFunction.Count > 0)
                                    {
                                        var defaultFunction = new AdResourcePermission();
                                        defaultFunction.Id = function.FunctionId;
                                        defaultFunction.Code = function.FunctionCode;
                                        defaultFunction.Title = function.Title;
                                        defaultFunction.Description = function.Description;
                                        defaultFunction.Api = string.Empty;
                                        defaultFunction.Path = string.Empty;
                                        defaultFunction.Ord = function.Ord;
                                        defaultFunction.ParentCode = function.ParentCode;
                                        defaultFunction.FunctionCode = function.FunctionCode;
                                        defaultFunction.FunctionName = function.Title;
                                        defaultFunction.HasPermission = true;
                                        defaultFunction.IsFunction = true;
                                        result.Add(defaultFunction); // Add first function

                                        var grpFunctionChild = groupFunction.FirstOrDefault(x => x.Key.FunctionCode == function.FunctionCode);
                                        if (grpFunctionChild == null)
                                        {
                                            var query = from pr in listPrivilegeOfFunction
                                                        let perUser = listPermissionUser.FirstOrDefault(x => x.FunctionCode == pr.FunctionCode && x.ResourceCode == pr.ResourceCode)
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
                                                            ExpiredDate = perUser?.ExpiredDate,
                                                            IsFunction = false,
                                                            HasPermission = perUser != null
                                                        };
                                            result.AddRange(query);
                                        }
                                        else
                                        {
                                            var query = from pr in listPrivilegeOfFunction
                                                        join gfr in grpFunctionChild on pr.ResourceCode equals gfr.ResourceCode into grpFunc
                                                        from fr in grpFunc.DefaultIfEmpty()
                                                        let perUser = listPermissionUser.FirstOrDefault(x => x.FunctionCode == pr.FunctionCode && x.ResourceCode == pr.ResourceCode)
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
                                                            ExpiredDate = perUser?.ExpiredDate,
                                                            IsFunction = false,
                                                            HasPermission = (countPermissionUser == 0 && fr != null) || perUser != null
                                                        };
                                            result.AddRange(query);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        //var groupFunction = listPermissionDefault.GroupBy(g => g.Function).OrderBy(o => o.Key.ParentCode).ThenBy(t => t.Key.FunctionCode).ToList();
                        if (groupFunction.Count > 0)
                        {
                            var listPrivilege = await _context.AdPrivileges.Include(x => x.Function).Include(x => x.Resource).Where(x => x.Resource.Status && groupFunction.Any(y => y.Key.FunctionCode == x.FunctionCode)).ToListAsync();
                            foreach (var groupfunc in groupFunction)
                            {
                                var function = groupfunc.Key;
                                // Get all resource of function
                                var listPrivilegeOfFunction = listPrivilege.Where(x => x.FunctionCode == function.FunctionCode).ToList();
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
                                                let perUser = listPermissionUser.FirstOrDefault(x => x.FunctionCode == pr.FunctionCode && x.ResourceCode == pr.ResourceCode)
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
                                                    ExpiredDate = perUser?.ExpiredDate,
                                                    IsFunction = false,
                                                    HasPermission = (countPermissionUser == 0 && fr != null) || perUser != null
                                                };
                                    result.AddRange(query);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }

            return Json(result);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateUserPermission([FromBody]UserPerModel model)
        {
            JMessage msg = new JMessage { Error = true, Title = string.Format(CommonUtil.ResourceValue("MSG_UPDATE_FAIL"), CommonUtil.ResourceValue("PERMISSION").ToLower()) };
            string userName = string.Empty;
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == model.UserId);
                if (user != null)
                {
                    //var app = await _context.AdApplications.FirstOrDefaultAsync(x => x.ApplicationCode == model.AppCode);
                    //if (app != null)
                    //{
                    // Update user is exceeded permission
                    user.IsExceeded = model.IsExceeded;

                    //// Update Branch Reference
                    //var oldBranchRef = user.OrgReference;
                    //user.OrgReference = model.BranchRefs.Count > 0 ? string.Join(",", model.BranchRefs) : "";
                    user.UpdatedDate = DateTime.Now;
                    user.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.Update(user);
                    ////_actionLog.InsertActionLog("ASP_NET_USERS", "Update success branch reference of user: " + user.UserName, oldBranchRef, user.OrgReference, "Update", false, user.UserName);

                    // Update Group User and Permission
                    var listOldGroup = _context.AdUserInGroups.Where(x => x.UserId == user.Id).ToList();
                    //var listOldGroup = _context.AdUserInGroups.Where(x => x.UserId == user.Id && x.ApplicationCode == app.ApplicationCode).ToList();
                    //var listOldPermissionAll = _context.AdPermissions.Where(x => x.ApplicationCode == app.ApplicationCode && x.UserId == user.Id && listOldGroup.Any(y => y.GroupUserCode == x.GroupUserCode)).ToList();
                    var listOldPermissionAll = _context.AdPermissions.Where(x => x.UserId == user.Id && listOldGroup.Any(y => y.GroupUserCode == x.GroupUserCode)).ToList();

                    if (model.GroupUsers.Count > 0)
                    {
                        var listOldGroupDel = listOldGroup.Where(x => model.GroupUsers.All(y => y.GroupCode != x.GroupUserCode)).ToList();
                        _context.RemoveRange(listOldGroupDel); // Remove all old group not selected
                        var listOldPermissionDel = listOldPermissionAll.Where(x => model.GroupUsers.All(y => y.GroupCode != x.GroupUserCode || (y.GroupCode == x.GroupUserCode && y.RoleId != x.RoleId))).ToList();
                        _context.RemoveRange(listOldPermissionDel); // Remove all old permission

                        var listPermissionAll = _context.AdPermissions.Where(x => model.GroupUsers.Any(y => y.GroupCode == x.GroupUserCode && y.RoleId == x.RoleId)).ToList(); /*x.ApplicationCode == model.AppCode &&*/
                        var listPermissionDefault = listPermissionAll.Where(x => x.UserId == null).ToList();
                        var listPermissionUser = listPermissionAll.Where(x => x.UserId == model.UserId).ToList();

                        foreach (var groupUser in model.GroupUsers)
                        {
                            var oldGroup = listOldGroup.FirstOrDefault(x => x.GroupUserCode == groupUser.GroupCode); /*  && x.ApplicationCode == model.AppCode*/
                            var listPerDefaultGroup = listPermissionDefault.Where(x => x.GroupUserCode == groupUser.GroupCode);  /*&& x.ApplicationCode == model.AppCode*/
                            if (oldGroup != null)
                            {
                                //if (groupUser.RoleId != oldGroup.RoleId)
                                //{
                                // Update user in group
                                oldGroup.BranchReference = model.BranchRefs.Count > 0 ? string.Join(",", model.BranchRefs) : "";
                                if (!oldGroup.IsMain) oldGroup.RoleId = groupUser.RoleId;
                                oldGroup.GrantAll = true;
                                _context.Update(oldGroup); // Update entity
                                                           //}
                            }
                            else
                            {
                                // Add user to group
                                var userInGroup = new AdUserInGroup();
                                userInGroup.UserId = model.UserId;
                                userInGroup.GroupUserCode = groupUser.GroupCode;
                                //userInGroup.ApplicationCode = model.AppCode;
                                userInGroup.ApplicationCode = "ADMIN";
                                userInGroup.RoleId = groupUser.RoleId;
                                userInGroup.GrantAll = true;
                                userInGroup.BranchReference = model.BranchRefs.Count > 0 ? string.Join(",", model.BranchRefs) : "";
                                _context.Add(userInGroup); // Add entity
                            }

                            // Add or Update permission
                            if (groupUser.Resources != null && groupUser.Resources.Count > 0)
                            {
                                groupUser.Resources = groupUser.Resources.Where(x => x.HasPermission && !x.IsFunction).ToList();
                                // Get all permission need remove
                                var permissionDel = listPermissionUser.Where(x => x.GroupUserCode == groupUser.GroupCode && x.RoleId == groupUser.RoleId && !groupUser.Resources.Any(y => y.FunctionCode == x.FunctionCode && y.Code == x.ResourceCode));
                                _context.RemoveRange(permissionDel); // Remove all permission not in selected
                                                                     // Get all permission need update
                                var permissionUpdate = listPermissionUser.Where(x => x.GroupUserCode == groupUser.GroupCode && x.RoleId == groupUser.RoleId && groupUser.Resources.Any(y => y.FunctionCode == x.FunctionCode && y.Code == x.ResourceCode)).ToList();
                                if (permissionUpdate.Count > 0)
                                {
                                    foreach (var perUpdate in permissionUpdate)
                                    {
                                        var resUpdate = groupUser.Resources.FirstOrDefault(y => y.FunctionCode == perUpdate.FunctionCode && y.Code == perUpdate.ResourceCode);
                                        perUpdate.ExpiredDate = resUpdate?.ExpiredDate;
                                    }
                                }
                                // Get all permission need add
                                var permissionAdd = groupUser.Resources.Where(x => !listPermissionUser.Any(y => y.FunctionCode == x.FunctionCode && y.ResourceCode == x.Code && y.GroupUserCode == groupUser.GroupCode && y.RoleId == groupUser.RoleId))
                                    .Select(x => new AdPermission
                                    {
                                        //ApplicationCode = model.AppCode,
                                        ApplicationCode = "ADMIN",
                                        FunctionCode = x.FunctionCode,
                                        ResourceCode = x.Code,
                                        GroupUserCode = groupUser.GroupCode,
                                        UserId = model.UserId,
                                        RoleId = groupUser.RoleId,
                                        ExpiredDate = x.ExpiredDate,
                                    }).ToList();
                                _context.AddRange(permissionAdd); // Add entity
                            }
                            else
                            {
                                //var permissionDel = listPermissionUser.Where(x => x.GroupUserCode == groupUser.GroupCode && x.RoleId == groupUser.RoleId && !listPerDefaultGroup.Any(y => y.FunctionCode == x.FunctionCode && y.ResourceCode == x.ResourceCode));
                                //_context.RemoveRange(permissionDel); // Remove all permission not in selected

                                var permissionAdd = listPerDefaultGroup.Where(x => !listPermissionUser.Any(y => y.FunctionCode == x.FunctionCode && y.ResourceCode == x.ResourceCode && y.GroupUserCode == groupUser.GroupCode && y.RoleId == groupUser.RoleId))
                                    .Select(x => new AdPermission
                                    {
                                        //ApplicationCode = x.ApplicationCode,
                                        ApplicationCode = "ADMIN",
                                        FunctionCode = x.FunctionCode,
                                        ResourceCode = x.ResourceCode,
                                        GroupUserCode = x.GroupUserCode,
                                        UserId = model.UserId,
                                        RoleId = x.RoleId,
                                    }).ToList();
                                _context.AddRange(permissionAdd); // Add entity
                            }
                        }
                    }
                    else
                    {
                        _context.RemoveRange(listOldGroup); // Remove all old group
                        _context.RemoveRange(listOldPermissionAll); // Remove all old permission
                    }
                    ////_actionLog.InsertActionLog("VIB_PERMISSION", "Update success permission for user: " + user.UserName, null, null, "Update", false, user.UserName);

                    var result = await _context.SaveChangesAsync();

                    msg.Error = false;
                    msg.Title = "Update user permission successfully";
                    //}
                    //else
                    //{
                    //    msg.Title = "Application is not exists in system!";
                    //}
                }
                else
                {
                    msg.Title = "User is not exists in system!";
                }
            }
            catch (Exception ex)
            {
                ////_actionLog.InsertActionLog("VIB_PERMISSION", "Update failed permission for user " + userName + " : " + ex.Message, null, null, "Error", true, userName);
                msg.Object = ex;
            }

            return Json(msg);
        }

        #endregion
    }

    public class AccountSearch
    {
        public string Name { get; set; }
        public int Page { get; set; } = 1;
        public int Row { get; set; } = 10;
    }
}