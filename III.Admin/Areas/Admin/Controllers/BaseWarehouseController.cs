using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.Internal;

namespace III.Admin.Controllers
{
    [Authorize]
    public class BaseWarehouseController : Controller
    {
        protected AppSettings AppSettings
        {
            get { return HttpContext.RequestServices.GetService<IOptions<AppSettings>>().Value; }
        }
        protected EIMDBContext DbContext
        {
            get { return HttpContext.RequestServices.GetService<EIMDBContext>(); }
        }
        protected IUserLoginService UserLoginService
        {
            get { return HttpContext.RequestServices.GetService<IUserLoginService>(); }
        }
        protected IParameterService ParameterService
        {
            get { return HttpContext.RequestServices.GetService<IParameterService>(); }
        }

        protected IRepositoryService RepositoryService
        {
            get { return HttpContext.RequestServices.GetService<IRepositoryService>(); }
        }

        protected IStringLocalizer<SharedResources> LocalizationService
        {
            get { return HttpContext.RequestServices.GetService<IStringLocalizer<SharedResources>>(); }
        }

        [NonAction]
        protected bool UpdatePermissionUserByGroup(EIMDBContext context, string groupCode, string userId, string roleId, string appCode, string newRoleId = null, string newGroupCode = null, string newAppCode = null)
        {
            IQueryable<AdPermission> listPermissionDefault;
            if (newAppCode == null)
            {
                if (newRoleId == null)
                {
                    if (newGroupCode == null || newGroupCode == groupCode)
                    {
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId == null && x.RoleId == roleId && x.ApplicationCode == appCode);
                    }
                    else
                    {
                        // Remove old permission
                        var listPermissionUser = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId != null && x.UserId == userId && x.RoleId == roleId && x.ApplicationCode == appCode);
                        if (listPermissionUser.Any()) context.RemoveRange(listPermissionUser);

                        // Get new default permission
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == newGroupCode && x.UserId == null && x.RoleId == roleId && x.ApplicationCode == appCode);
                    }
                }
                else
                {
                    // Remove old permission
                    var listPermissionUser = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId != null && x.UserId == userId && x.RoleId == roleId && x.ApplicationCode == appCode);
                    if (listPermissionUser.Any()) context.RemoveRange(listPermissionUser);

                    if (newGroupCode == null || newGroupCode == groupCode)
                    {
                        // Get new default permission
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId == null && x.RoleId == newRoleId && x.ApplicationCode == appCode);
                    }
                    else
                    {
                        // Get new default permission
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == newGroupCode && x.UserId == null && x.RoleId == newRoleId && x.ApplicationCode == appCode);
                    }
                }
            }
            else
            {
                if (newRoleId == null)
                {
                    if (newGroupCode == null || newGroupCode == groupCode)
                    {
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId == null && x.RoleId == roleId && x.ApplicationCode == newAppCode);
                    }
                    else
                    {
                        // Remove old permission
                        var listPermissionUser = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId != null && x.UserId == userId && x.RoleId == roleId && x.ApplicationCode == appCode);
                        if (listPermissionUser.Any()) context.RemoveRange(listPermissionUser);

                        // Get new default permission
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == newGroupCode && x.UserId == null && x.RoleId == roleId && x.ApplicationCode == newAppCode);
                    }
                }
                else
                {
                    // Remove old permission
                    var listPermissionUser = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId != null && x.UserId == userId && x.RoleId == roleId && x.ApplicationCode == appCode);
                    if (listPermissionUser.Any()) context.RemoveRange(listPermissionUser);

                    if (newGroupCode == null || newGroupCode == groupCode)
                    {
                        // Get new default permission
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == groupCode && x.UserId == null && x.RoleId == newRoleId && x.ApplicationCode == newAppCode);
                    }
                    else
                    {
                        // Get new default permission
                        listPermissionDefault = context.AdPermissions.Where(x => x.GroupUserCode == newGroupCode && x.UserId == null && x.RoleId == newRoleId && x.ApplicationCode == newAppCode);
                    }
                }
            }

            // Insert new permission of user
            if (listPermissionDefault.Any())
            {
                foreach (var per in listPermissionDefault)
                {
                    // Add new permission
                    var permission = new AdPermission();
                    permission.ApplicationCode = per.ApplicationCode;
                    permission.FunctionCode = per.FunctionCode;
                    permission.ResourceCode = per.ResourceCode;
                    permission.GroupUserCode = per.GroupUserCode;
                    permission.RoleId = per.RoleId;
                    permission.UserId = userId;
                    context.AdPermissions.Add(permission);
                }
            }

            return true;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            bool isAjaxCall = "XMLHttpRequest" == Request.Headers["x-requested-with"];
            if (User.Identity.IsAuthenticated)
            {
                bool isExpired = false;
                var userId = ESEIM.AppContext.UserId;
                var session = HttpContext.GetSessionUser();
                if (session?.UserId == null)
                {
                    session = UserLoginService.GetSessionUser(userId);
                    if (session != null)
                    {
                        HttpContext.SetSessionUser(session);
                    }
                    else
                    {
                        HttpContext.Session.Clear();
                        context.Result = new RedirectResult(Url.Action("Logout", "Admin/Account"));
                    }
                }
                else
                {
                    isExpired = session.ExpireTimeSpan < DateTime.Now;
                }

                // Get controller - action
                var descriptor = (ControllerActionDescriptor)context.ActionDescriptor;
                var controllerName = descriptor.ControllerName;
                var actionName = descriptor.ActionName;
                var isAllowingAnonymous = descriptor.EndpointMetadata
                    .Any(em => em.GetType() == typeof(AllowAnonymousAttribute));
                var isAuthorizedOnly = descriptor.EndpointMetadata
                    .Any(em => em.GetType() == typeof(AdminAuthorizeAttribute)) || (AppSettings.AutoPermission == true);
                var request = context.HttpContext.Request;
                var route = request.Path.HasValue ? request.Path.Value : "";
                var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                var requestHeader = request.Headers.Aggregate("", (current, header) => current + $"{header.Key}: {header.Value}{Environment.NewLine}");
                request.EnableRewind();

                using (var stream = new StreamReader(request.Body))
                {
                    stream.BaseStream.Position = 0;
                    var requestBody = stream.ReadToEnd();
                    if (!string.IsNullOrEmpty(requestBody) || !controllerName.Equals("DashBoard"))
                    {
                        var opaLog = new OperationLog
                        {
                            Action = actionName,
                            Controller = controllerName,
                            RequestHeader = requestHeader,
                            RequestBody = requestBody,
                            Path = route,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            Table = string.Empty,
                            IP = ip
                        };

                        string[] param = new string[] { "@actionName", "@controller", "@requestHeader", "@requestBody", "@path", "@createdBy", "@tableAction", "@ip" };
                        var val = new object[] { opaLog.Action, opaLog.Controller, opaLog.RequestHeader, opaLog.RequestBody, opaLog.Path, opaLog.CreatedBy, opaLog.Table, opaLog.IP };

                        RepositoryService.CallProc("P_WarehouseLogSystem", param, val);

                        var api = new ModelAPI
                        {
                            CreatedDate = DateTime.Now,
                            Status = true,
                            Scope = false,
                            Path = route,
                            Api = route,
                            ResourceCode = controllerName + "_" + actionName,
                            Title = controllerName + "_" + actionName,
                        };

                        string[] paramApi = new string[] { "@ResourceCode", "@Title", "@Api", "@Path",
                            "@Scope", "@Status", "@CreatedDate" };
                        var valApi = new object[] { api.ResourceCode, api.Title, api.Api, api.Path, api.Scope, api.Status, api.CreatedDate };

                        RepositoryService.CallProc("P_INSERT_API", paramApi, valApi);
                    }
                }

                // Check Expired session
                if (isExpired)
                {
                    if (!controllerName.Equals("Account") || !actionName.Equals("Logout"))
                    {
                        //if (isAjaxCall)
                        //{
                        //HttpContext.Session.Clear();
                        //Task.Run(() => HttpContext.Authentication.SignOutAsync("Cookies"));
                        //Task.Run(() => HttpContext.Authentication.SignOutAsync("oidc"));
                        //}
                        //else
                        //{
                        HttpContext.Session.Clear();
                        context.Result = new RedirectResult(Url.Action("Logout", "Admin/Account"));
                        //}
                        //context.Result = new RedirectResult(Url.Action(actionName, controllerName));
                    }
                }
                else
                {
                    // Set session timeout
                    var timeOut = ParameterService.GetSessionTimeout();
                    if (session != null)
                    {
                        session.ExpireTimeSpan = DateTime.Now.AddMinutes(timeOut);
                        HttpContext.SetSessionUser(session);

                        // Check lock day
                        //if (session?.UserType != 10 && ParameterService.IsLockDay())
                        //{
                        //    if (controllerName != "Home" || actionName != "SystemLocked")
                        //    {
                        //        if (isAjaxCall)
                        //        {
                        //            context.Result = new JsonResult(new { Error = true, Title = "System Locked! You do not have access to this function.", data = "", draw = 1, recordsFiltered = 0, recordsTotal = 0 });
                        //        }
                        //        else
                        //        {
                        //            context.Result = new RedirectResult(Url.Action("SystemLocked", "Home"));
                        //        }
                        //    }
                        //}
                        //else
                        //{
                        // Check permission
                        if (session?.UserType != 10 && !session.HasPermission(controllerName, actionName) &&
                            !isAllowingAnonymous && isAuthorizedOnly)
                        {
                            if (isAjaxCall)
                            {
                                //context.Result = new JsonResult(new { Error = true, Title = "Access Denied! You do not have access to this function.", data = "", draw = 1, recordsFiltered = 0, recordsTotal = 0 });
                                context.Result = new JsonResult(new
                                {
                                    Error = true,
                                    Title = LocalizationService["COM_BASE_CTRL_PERMISSION_DENIED"].Value,
                                    data = "",
                                    draw = 1,
                                    recordsFiltered = 0,
                                    recordsTotal = 0
                                });
                            }
                            else
                            {
                                context.Result = new RedirectResult(Url.Action("AccessDenied", "/Admin/Account"));
                            }
                        }
                    }

                    //}
                }
                //Check xss
                if (context.ModelState.IsValid == false)
                {
                    string messages = string.Join("; ", ModelState.Values
                                        .SelectMany(x => x.Errors)
                                        .Select(x => x.ErrorMessage));

                    context.Result = new ContentResult { StatusCode = 400, Content = messages };

                    // LogError(controllerName, actionName, messages);
                }
            }
            else
            {
                //context.Result = new RedirectResult(Url.Action("Logout", "Home"));
                if (isAjaxCall)
                {
                    HttpContext.Session.Clear();
                    //Task.Run(() => HttpContext.Authentication.SignOutAsync("Cookies"));
                    //Task.Run(() => HttpContext.Authentication.SignOutAsync("oidc"));
                    context.Result = new RedirectResult(Url.Action("Logout", "/Admin/Account"));
                }
            }

            base.OnActionExecuting(context);
        }

        protected bool CheckPermission(string controller, string action, List<PermissionObject> permissions)
        {
            bool isValid = false;
            var urlApi = controller + "_" + action;
            if (urlApi.Equals("Home_Permission") || urlApi.Equals("Home_Logout") || urlApi.Equals("Home_Translation"))
            {
                isValid = true;
            }
            else
            {
                if (permissions.Count > 0 && !string.IsNullOrEmpty(urlApi))
                {
                    isValid = permissions.Any(x => x.ResourceCode != null && x.ResourceCode.ToLower().Equals(urlApi.ToLower()));
                }
            }
            return isValid;
        }

        [NonAction]
        protected object GetCurrencyBase()
        {
            var data = DbContext.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [NonAction]
        public IQueryable<BaseObject> GetListAreaFunc(SessionUserLogin session)
        {
            var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

            IQueryable<BaseObject> query = null;
            if (session.UserType == 10)
            {
                query = from a in DbContext.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)).Select(x => new { x.CodeSet, x.ValueSet })
                        orderby a.ValueSet
                        select new BaseObject
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        };
            }
            else
            {
                query = from a in DbContext.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)).Select(x => new { x.CodeSet, x.ValueSet })
                        where
                        (listArea.Any(y => !string.IsNullOrEmpty(y) && y == a.CodeSet))
                        orderby a.ValueSet
                        select new BaseObject
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        };
            }
            return query;
        }
        [NonAction]
        public List<BaseObject> GetListBrandFunc()
        {
            var query = (from a in DbContext.CommonSettings
                         where a.Group == "VC_BRAND"
                         && a.IsDeleted != true
                         orderby a.ValueSet
                         select new BaseObject
                         {
                             Code = a.CodeSet,
                             Name = a.ValueSet
                         }).AsNoTracking();
            return query.ToList();
        }
        [NonAction]
        public IQueryable<BaseObject> GetListCustomerFunc(SessionUserLogin session)
        {
            IQueryable<BaseObject> query = null;
            if (session.UserType == 10)
            {
                query = from b in DbContext.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Address }).AsNoTracking()
                        orderby b.CusName
                        select new BaseObject
                        {
                            Code = b.CusCode,
                            Name = b.CusName,
                            Address = b.Address
                        };
            }
            else
            {
                var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

                query = from b in DbContext.Customerss.Where(x => !x.IsDeleted).Select(x => new { x.CusCode, x.CusName, x.Area, x.Address }).AsNoTracking()
                        where (b.Area.Contains(";") && session.Area.Contains(b.Area))
                                || (!b.Area.Contains(";") && listArea.Any(y => y == b.Area))
                        orderby b.CusName
                        select new BaseObject
                        {
                            Code = b.CusCode,
                            Name = b.CusName,
                            Address = b.Address
                        };
            }
            return query;
        }
        [NonAction]
        public IQueryable<object> GetListStaffFunc(SessionUserLogin session)
        {
            IQueryable<object> query = null;
            if (session.UserType == 10)
            {
                query = from b in DbContext.Users.Where(x => x.Active && !string.IsNullOrEmpty(x.Area)).Select(x => new { x.UserName, Name = x.GivenName, x.Area }).AsNoTracking()
                        orderby b.Name
                        select new
                        {
                            UserName = b.UserName,
                            Name = b.Name
                        };
            }
            else if (session.TypeStaff == 10)
            {
                var listArea = !string.IsNullOrEmpty(session.Area) ? session.Area.Split(';') : new string[1000];

                query = from b in DbContext.Users.Where(x => x.Active && !string.IsNullOrEmpty(x.Area)).Select(x => new { x.UserName, Name = x.GivenName, x.Area }).AsNoTracking()
                        where (b.Area.Contains(";") && session.Area.Contains(b.Area))
                                || (!b.Area.Contains(";") && listArea.Any(y => y == b.Area))
                        orderby b.Name
                        select new
                        {
                            UserName = b.UserName,
                            Name = b.Name,
                        };
            }
            else
            {
                query = from b in DbContext.Users.Where(x => x.Active && !string.IsNullOrEmpty(x.Area) && x.UserName == session.UserName).Select(x => new { x.UserName, Name = x.GivenName, x.Area }).AsNoTracking()
                        orderby b.Name
                        select new
                        {
                            UserName = b.UserName,
                            Name = b.Name
                        };
            }
            return query;
        }

        [NonAction]
        public async Task<JMessage> FuncInsertSettingRoute(string Username, string WpCode, string Node, string Note, int Order, bool saveChange = false)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //DateTime dTimeWork = DateTime.ParseExact(TimeWork, "HH:mm dd-MM-yyyy", CultureInfo.InvariantCulture);


                var RouteCode = WpCode + "_" + Order;

                var item = await DbContext.VcSettingRoutes.FirstOrDefaultAsync(x => x.RouteCode == RouteCode && x.IsDeleted != true);
                if (item == null)
                {
                    VcSettingRoute obj = new VcSettingRoute();

                    obj.RouteCode = RouteCode;
                    obj.WpCode = WpCode;
                    obj.Node = Node;
                    //obj.TimeWork = dTimeWork;
                    obj.Note = Note;
                    obj.Order = Order;
                    obj.TimePlan = DateTime.Now;
                    obj.CurrentStatus = RouteStatus.RoutePending.DescriptionAttr();

                    //obj.CreatedBy = EIM.AppContext.UserName;
                    obj.CreatedBy = Username;
                    obj.CreatedTime = DateTime.Now;

                    DbContext.VcSettingRoutes.Add(obj);

                    if (saveChange)
                    {
                        DbContext.SaveChanges();
                    }
                    msg.Title = LocalizationService["COM_BASE_CTRL_ADD_RTPL_SUCCESS"].Value;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = LocalizationService["COM_BASE_CTRL_RTPL_EXIST"].Value;
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = LocalizationService["COM_BASE_CTRL_ADD_RTPL_ERROR"].Value;
            }
            return msg;
        }
    }
}
