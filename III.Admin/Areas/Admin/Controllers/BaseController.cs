using System;
using System.Threading.Tasks;
using ESEIM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using ESEIM.Utils;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using III.Domain.Enums;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.Extensions.Localization;
using ESEIM;
using Microsoft.Extensions.Options;

namespace III.Admin.Controllers
{
    [Authorize]
    public class BaseController : Controller
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

                        RepositoryService.CallProc("P_OperationLogSystem", param, val);

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
                        var valApi = new object[] { api.ResourceCode, api.Title, api.Api, api.Path, api.Scope, api.Status, api.CreatedDate};

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
                                    Error = true, Title = LocalizationService["COM_BASE_CTRL_PERMISSION_DENIED"].Value,
                                    data = "", draw = 1, recordsFiltered = 0, recordsTotal = 0
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


        #region Hàm lấy tổng sản lượng tiêu thụ theo tháng
        //hàm lấy ra các thông tin tổng sản lượng tháng tìm kiếm (CỦA TOÀN BỘ CỬA HÀNG)
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetConsumpFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string brandCode, string dateSearch, string areaCode)
        {
            var query1 = GetConsumpOfCusFunc(session, listArea, productCode, brandCode, dateSearch);

            if (!string.IsNullOrEmpty(areaCode))
            {
                var query2 = (from a in query1.Where(x => x.AreaCode == areaCode)
                              select new VCGroupCustomerCareModel
                              {
                                  CusCode = a.CusCode,
                                  CusName = a.CusName,
                                  ConsumpMonthly = a.ConsumpMonthly,
                              });
                return query2;
            }
            else
            {
                var query2 = (from a in query1
                              group new { a } by new { a.AreaCode }
                              into grp
                              select new VCGroupCustomerCareModel
                              {
                                  AreaCode = grp.FirstOrDefault().a.AreaCode,
                                  AreaName = grp.FirstOrDefault().a.AreaName,
                                  ConsumpMonthly = grp.Sum(y => y.a.ConsumpMonthly),
                              });
                return query2;
            }
        }

        //hàm lấy ra các thông tin tổng sản lượng tháng tìm kiếm (CỦA TOÀN BỘ CỬA HÀNG)
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetConsumpOfCusFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string brandCode, string dateSearch)
        {
            //Lấy ra list bản ghi hoàn thành TRONG THÁNG HIỆN TẠI HOẶC NHẬP VÀO của các cửa hàng => Lấy được LIST SettingRouteCode TRONG THÁNG (mỗi khách hàng là 1 LIST)
            //Join với bảng Customer_Care & group theo khách hàng với Branch = 'BUTSON' => GROUP Lấy được tổng SẢN LƯỢNG tất cả các sản phẩm Bút Sơn CỦA TẤT CẢ BẢN GHI TRONG THÁNG của cửa hàng
            var listCustomerCareInMonthFunc = GetCustomerCareInMonthFunc(session, dateSearch);

            //productCode không truyền => Sản lượng là lấy tổng tất cả các chủng loại xi măng của 1 hãng tìm kiếm
            if (string.IsNullOrEmpty(productCode))
            {
                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareInMonthFunc
                                                on d.CusCode equals e.CusCode
                              group new { c, d, e } by new { d.CusCode, e.BrandCode }
                              into grp
                              where grp.Key.BrandCode == brandCode
                              select new VCGroupCustomerCareModel
                              {
                                  AreaName = grp.FirstOrDefault().c.Name,
                                  AreaCode = grp.FirstOrDefault().c.Code,
                                  CusCode = grp.Key.CusCode,
                                  CusName = grp.FirstOrDefault().d.CusName,
                                  ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly),
                              });
                return query1;
            }
            //productCode truyền vào => Sản lượng là lấy của từng chủng loại xi măng của 1 hãng tìm kiếm & giá mua, giá bán
            else
            {
                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareInMonthFunc
                                                on d.CusCode equals e.CusCode
                              group new { c, d, e } by new { d.CusCode, e.BrandCode, e.ProductCode }
                              into grp
                              where grp.Key.BrandCode == brandCode && grp.Key.ProductCode == productCode
                              select new VCGroupCustomerCareModel
                              {
                                  AreaName = grp.FirstOrDefault().c.Name,
                                  AreaCode = grp.FirstOrDefault().c.Code,
                                  CusCode = grp.Key.CusCode,
                                  CusName = grp.FirstOrDefault().d.CusName,
                                  ConsumpMonthly = grp.Sum(y => y.e.ConsumpMonthly),
                              });
                return query1;
            }
        }


        //Dùng cho các báo cáo về sản lượng (là báo cáo phải cộng giá trị sản lượng của các bản ghi nhập vào)
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetCustomerCareInMonthFunc(SessionUserLogin session, string dateSearch)
        {
            //DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            var listSettingRoutes = GetListSettingRoutesInMonthFunc(session, date);

            var query1 = (from a in listSettingRoutes
                          join e in DbContext.VcCustomerCares.Where(x => x.IsDeleted != true)
                                             .AsNoTracking()
                                             .Select(x => new { x.Id, x.RouteCode, x.BrandCode, x.ProductCode, x.ConsumpMonthly })
                          on a.RouteCode equals e.RouteCode
                          select new VCGroupCustomerCareModel
                          {
                              Id = e.Id,
                              BrandCode = e.BrandCode,
                              ProductCode = e.ProductCode,
                              ConsumpMonthly = e.ConsumpMonthly,

                              CreatedBy = a.CreatedBy,
                              //CreatedTime = a.CreatedTime,
                              CusCode = a.Node,
                              //TotalCanImp = a.TotalCanImp,
                              //Note = a.Note,
                              //Proportion = a.Proportion,
                              //TimeWork = a.TimeWork,
                          });
            return query1;
        }


        //Lấy ra list bản ghi hoàn thành TRONG THÁNG HIỆN TẠI HOẶC NHẬP VÀO của các cửa hàng => Lấy được LIST SettingRouteCode TRONG THÁNG (mỗi khách hàng là 1 LIST)
        //Join với bảng Customer_Care & group theo khách hàng với Branch = 'BUTSON' => GROUP Lấy được tổng SẢN LƯỢNG tất cả các sản phẩm Bút Sơn CỦA TẤT CẢ BẢN GHI TRONG THÁNG của cửa hàng
        [NonAction]
        public IQueryable<VCSettingRouteModel> GetListSettingRoutesInMonthFunc(SessionUserLogin session, DateTime date)
        {
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNex = new DateTime(date.Year, date.Month, 1);
            startDateNex = startDateNex.AddMonths(1);

            IQueryable<VCSettingRouteModel> listSettingRoutes = null;

            if (session.UserType != 10 && session.TypeStaff == 0)
            {
                listSettingRoutes = (from n in DbContext.VcSettingRoutes
                                     where n.CreatedBy == session.UserName && n.IsDeleted != true && n.CurrentStatus == "ROUTE_DONE" && n.CreatedTime >= startDateNow && n.CreatedTime < startDateNex
                                     select new VCSettingRouteModel
                                     {
                                         Node = n.Node,
                                         RouteCode = n.RouteCode,
                                         //TotalCanImp = n.TotalCanImp,
                                         //Proportion = n.Proportion,
                                         //TimeWork = n.TimeWork,
                                         //Note = n.Note,
                                         CreatedBy = n.CreatedBy,
                                         //CreatedTime = n.CreatedTime,
                                     }).AsNoTracking();
            }
            else
            {
                listSettingRoutes = (from n in DbContext.VcSettingRoutes
                                     where n.IsDeleted != true && n.CurrentStatus == "ROUTE_DONE" && n.CreatedTime >= startDateNow && n.CreatedTime < startDateNex
                                     select new VCSettingRouteModel
                                     {
                                         Node = n.Node,
                                         RouteCode = n.RouteCode,
                                         //TotalCanImp = n.TotalCanImp,
                                         //Proportion = n.Proportion,
                                         //TimeWork = n.TimeWork,
                                         //Note = n.Note,
                                         CreatedBy = n.CreatedBy,
                                         //CreatedTime = n.CreatedTime,
                                     }).AsNoTracking();
            }
            return listSettingRoutes;
        }
        #endregion


        #region Hàm lấy giá nhập, giá bán mới nhất
        //hàm lấy ra các giá mua mới nhất của các thương hiệu theo Chủng loại/Cửa hàng/Thời điểm
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetBuyCostFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string cusCode, string dateSearch)
        {
            var listCustomerCareOfCusNewest = GetCustomerCareOfCusNewestFunc(session, dateSearch);

            var query1 = (from c in listArea
                          join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                            .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                          join e in listCustomerCareOfCusNewest
                                            on d.CusCode equals e.CusCode
                          where e.CusCode == cusCode && e.ProductCode == productCode
                          select new VCGroupCustomerCareModel
                          {
                              BrandCode = e.BrandCode,
                              BuyCost = e.BuyCost,
                              SaleCost = e.SaleCost,
                          });
            return query1;
        }
        #endregion

        #region Hàm lấy trữ lượng trống mới nhất (không join đến CustomerCare vì bản ghi không có dữ liệu sẽ bị mất)
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetTotalCanImpFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string dateSearch, string areaCode)
        {
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var listSettingRoutesOfCusNewestFunc = GetListSettingRoutesOfCusNewestFunc(session, date);

            var query1 = (from c in listArea
                          join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                            .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                          join e in listSettingRoutesOfCusNewestFunc
                                            on d.CusCode equals e.Node
                          group new { c, d, e } by new { d.CusCode }
                         into grp
                          select new VCGroupCustomerCareModel
                          {
                              AreaName = grp.FirstOrDefault().c.Name,
                              AreaCode = grp.FirstOrDefault().c.Code,
                              CusCode = grp.Key.CusCode,
                              CusName = grp.FirstOrDefault().d.CusName,

                              TotalCanImp = grp.FirstOrDefault().e.TotalCanImp,
                              Proportion = grp.FirstOrDefault().e.Proportion,
                          });

            if (!string.IsNullOrEmpty(areaCode))
            {
                var query2 = (from a in query1.Where(x => x.AreaCode == areaCode)
                              select new VCGroupCustomerCareModel
                              {
                                  CusCode = a.CusCode,
                                  CusName = a.CusName,
                                  TotalCanImp = a.TotalCanImp,
                                  Proportion = a.Proportion,
                              });
                return query2;
            }
            else
            {
                var query2 = (from a in query1
                              group new { a } by new { a.AreaCode }
                              into grp
                              select new VCGroupCustomerCareModel
                              {
                                  AreaCode = grp.FirstOrDefault().a.AreaCode,
                                  AreaName = grp.FirstOrDefault().a.AreaName,
                                  TotalCanImp = grp.Sum(y => y.a.TotalCanImp),
                                  Proportion = grp.Average(y => y.a.Proportion),
                              });
                return query2;
            }
        }



        #endregion

        #region Hàm lấy tồn kho mới nhất
        //hàm lấy ra các thông tin mới nhất (THEO VÙNG) theo thời gian nhập vào: tồn kho, giá mua, giá bán
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetInstockFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string brandCode, string dateSearch, string areaCode)
        {
            var query1 = GetInstockOfCusFunc(session, listArea, productCode, brandCode, dateSearch);

            if (!string.IsNullOrEmpty(areaCode))
            {
                var query2 = (from a in query1.Where(x => x.AreaCode == areaCode)
                              select new VCGroupCustomerCareModel
                              {
                                  CusCode = a.CusCode,
                                  CusName = a.CusName,
                                  TotalCanImp = a.TotalCanImp,
                                  Proportion = a.Proportion,
                                  Instock = a.Instock,
                                  BuyCost = a.BuyCost,
                                  SaleCost = a.SaleCost,
                              });
                return query2;
            }
            else
            {
                var query2 = (from a in query1
                              group new { a } by new { a.AreaCode }
                              into grp
                              select new VCGroupCustomerCareModel
                              {
                                  AreaCode = grp.FirstOrDefault().a.AreaCode,
                                  AreaName = grp.FirstOrDefault().a.AreaName,
                                  TotalCanImp = grp.Sum(y => y.a.TotalCanImp),
                                  Proportion = grp.Average(y => y.a.Proportion),
                                  Instock = grp.Sum(y => y.a.Instock),
                              });
                return query2;
            }
        }

        //hàm lấy ra các thông tin mới nhất (CỦA TOÀN BỘ CỬA HÀNG) theo thời gian nhập vào: tồn kho, giá mua, giá bán
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetInstockOfCusFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string brandCode, string dateSearch)
        {
            var listCustomerCareOfCusNewest = GetCustomerCareOfCusNewestFunc(session, dateSearch);

            //productCode không truyền => Tồn kho là lấy tổng tất cả các chủng loại xi măng của 1 hãng tìm kiếm
            if (string.IsNullOrEmpty(productCode))
            {
                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareOfCusNewest
                                                on d.CusCode equals e.CusCode
                              group new { c, d, e } by new { d.CusCode, e.BrandCode }
                              into grp
                              where grp.Key.BrandCode == brandCode
                              select new VCGroupCustomerCareModel
                              {
                                  AreaName = grp.FirstOrDefault().c.Name,
                                  AreaCode = grp.FirstOrDefault().c.Code,
                                  CusCode = grp.Key.CusCode,
                                  CusName = grp.FirstOrDefault().d.CusName,
                                  TotalCanImp = brandCode == "BUTSON" ? grp.FirstOrDefault().e.TotalCanImp : null,
                                  Proportion = brandCode == "BUTSON" ? grp.FirstOrDefault().e.Proportion : null,
                                  Instock = grp.Sum(y => y.e.Instock),
                              });
                return query1;
            }
            //productCode truyền vào => Tồn kho là lấy của từng chủng loại xi măng của 1 hãng tìm kiếm & giá mua, giá bán theo 1 chủng loại sản phẩm nhập vào
            else
            {
                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareOfCusNewest
                                                on d.CusCode equals e.CusCode
                              where e.BrandCode == brandCode && e.ProductCode == productCode
                              select new VCGroupCustomerCareModel
                              {
                                  AreaName = c.Name,
                                  AreaCode = c.Code,
                                  CusCode = d.CusCode,
                                  CusName = d.CusName,
                                  TotalCanImp = brandCode == "BUTSON" ? e.TotalCanImp : null,
                                  Proportion = brandCode == "BUTSON" ? e.Proportion : null,
                                  Instock = e.Instock,

                                  BuyCost = e.BuyCost,
                                  SaleCost = e.SaleCost,
                              });
                return query1;
            }
        }


        //Dùng cho các báo cáo về trữ lượng trống, tỷ trọng nhập tay, tồn kho, giá mua, giá bán (là báo cáo lấy từ bản ghi mới nhất TRONG HOẶC TRƯỚC tháng báo cáo)
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetCustomerCareOfCusNewestFunc(SessionUserLogin session, string dateSearch)
        {
            //DateTime? fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //DateTime? toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            //Lấy ra list bản ghi hoàn thành MỚI NHẤT (THUỘC THÁNG CÓ DỮ LIỆU GẦN NHẤT) của các cửa hàng => Lấy được trữ lượng trống, tỷ lệ nhập tay mới nhất, SettingRouteCode mới nhất (mỗi khách hàng là 1 BẢN GHI)
            //Join với bảng Customer_Care & group theo khách hàng với Branch = 'BUTSON' => Lấy được tổng tồn kho tất cả các sản phẩm Bút Sơn mới nhất của cửa hàng
            var listSettingRoutes = GetListSettingRoutesOfCusNewestFunc(session, date);

            var query1 = (from a in listSettingRoutes
                          join e in DbContext.VcCustomerCares.Where(x => x.IsDeleted != true)
                                             .AsNoTracking()
                                             .Select(x => new { x.Id, x.RouteCode, x.BrandCode, x.ProductCode, x.BuyCost, x.SaleCost, x.Instock, x.CreatedBy, x.CreatedTime })
                          on a.RouteCode equals e.RouteCode
                          select new VCGroupCustomerCareModel
                          {
                              Id = e.Id,
                              BrandCode = e.BrandCode,
                              ProductCode = e.ProductCode,
                              BuyCost = e.BuyCost,
                              SaleCost = e.SaleCost,
                              Instock = e.Instock,
                              CreatedBy = e.CreatedBy,
                              CreatedTime = e.CreatedTime,
                              CusCode = a.Node,
                              TotalCanImp = a.TotalCanImp,
                              Note = a.Note,
                              Proportion = a.Proportion,
                              TimeWork = a.TimeWork,
                          });
            return query1;
        }

        //Lấy ra list bản ghi hoàn thành MỚI NHẤT (THUỘC THÁNG CÓ DỮ LIỆU GẦN NHẤT) của các cửa hàng => Lấy được trữ lượng trống, tỷ lệ nhập tay mới nhất, SettingRouteCode mới nhất (mỗi khách hàng là 1 BẢN GHI)
        //Join với bảng Customer_Care & group theo khách hàng với Branch = 'BUTSON' => Lấy được tổng tồn kho tất cả các sản phẩm Bút Sơn mới nhất của cửa hàng
        [NonAction]
        public IQueryable<VCSettingRouteModel> GetListSettingRoutesOfCusNewestFunc(SessionUserLogin session, DateTime date)
        {
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNex = new DateTime(date.Year, date.Month, 1);
            startDateNex = startDateNex.AddMonths(1);

            IQueryable<VCSettingRouteModel> listSettingRoutes = null;

            if (session.UserType != 10 && session.TypeStaff == 0)
            {
                listSettingRoutes = (from n in DbContext.VcSettingRoutes
                                     where n.CreatedBy == session.UserName && n.IsDeleted != true && n.CurrentStatus == "ROUTE_DONE" && n.CreatedTime < startDateNex
                                     group n by n.Node into g
                                     let maxTime = g.Max(y1 => y1.CreatedTime)
                                     select new VCSettingRouteModel
                                     {
                                         Node = g.Key,
                                         RouteCode = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).RouteCode,
                                         TotalCanImp = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TotalCanImp,
                                         Proportion = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Proportion,
                                         TimeWork = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TimeWork,
                                         Note = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Note,
                                         CreatedBy = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).CreatedBy,
                                         CreatedTime = maxTime
                                     }).AsNoTracking();
            }
            else
            {
                listSettingRoutes = (from n in DbContext.VcSettingRoutes
                                     where n.IsDeleted != true && n.CurrentStatus == "ROUTE_DONE" && n.CreatedTime < startDateNex
                                     group n by n.Node into g
                                     let maxTime = g.Max(y1 => y1.CreatedTime)
                                     select new VCSettingRouteModel
                                     {
                                         Node = g.Key,
                                         RouteCode = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).RouteCode,
                                         TotalCanImp = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TotalCanImp,
                                         Proportion = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Proportion,
                                         TimeWork = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TimeWork,
                                         Note = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Note,
                                         CreatedBy = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).CreatedBy,
                                         CreatedTime = maxTime
                                     }).AsNoTracking();
            }

            return listSettingRoutes;
        }
        #endregion

        #region Hàm lấy tỷ trọng trong tháng

        //Lấy ra list bản ghi hoàn thành MỚI NHẤT (TRONG THÁNG TÌM KIẾM - THÁNG NÀO CHƯA NHẬP LIỆU THÌ SẼ KHÔNG LẤY RA) của các cửa hàng => Lấy được trữ lượng trống, tỷ lệ nhập tay mới nhất, SettingRouteCode mới nhất (mỗi khách hàng là 1 BẢN GHI)
        [NonAction]
        public IQueryable<VCSettingRouteModel> GetListSettingRoutesOfCusNewestInMonthFunc(SessionUserLogin session, DateTime date)
        {
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            var startDateNex = new DateTime(date.Year, date.Month, 1);
            startDateNex = startDateNex.AddMonths(1);

            IQueryable<VCSettingRouteModel> listSettingRoutes = null;

            if (session.UserType != 10 && session.TypeStaff == 0)
            {
                listSettingRoutes = (from n in DbContext.VcSettingRoutes
                                     where n.CreatedBy == session.UserName && n.IsDeleted != true && n.CurrentStatus == "ROUTE_DONE" && n.CreatedTime >= startDateNow && n.CreatedTime < startDateNex
                                     group n by n.Node into g
                                     let maxTime = g.Max(y1 => y1.CreatedTime)
                                     select new VCSettingRouteModel
                                     {
                                         Node = g.Key,
                                         Id = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Id,
                                         RouteCode = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).RouteCode,
                                         TotalCanImp = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TotalCanImp,
                                         Proportion = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Proportion,
                                         TimeWork = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TimeWork,
                                         Note = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Note,
                                         CreatedBy = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).CreatedBy,
                                         CreatedTime = maxTime
                                     }).AsNoTracking();
            }
            else
            {
                listSettingRoutes = (from n in DbContext.VcSettingRoutes
                                     where n.IsDeleted != true && n.CurrentStatus == "ROUTE_DONE" && n.CreatedTime >= startDateNow && n.CreatedTime < startDateNex
                                     group n by n.Node into g
                                     let maxTime = g.Max(y1 => y1.CreatedTime)
                                     select new VCSettingRouteModel
                                     {
                                         Node = g.Key,
                                         Id = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Id,
                                         RouteCode = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).RouteCode,
                                         TotalCanImp = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TotalCanImp,
                                         Proportion = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Proportion,
                                         TimeWork = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).TimeWork,
                                         Note = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).Note,
                                         CreatedBy = g.FirstOrDefault(x1 => x1.CreatedTime == maxTime).CreatedBy,
                                         CreatedTime = maxTime
                                     }).AsNoTracking();
            }
            return listSettingRoutes;
        }
        #endregion

        #region Hàm lấy tổng lượng nhập theo tháng

        //hàm lấy ra các thông tin tổng lượng nhập trong tháng tìm kiếm (CỦA TOÀN BỘ CỬA HÀNG)
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetImportConsumpFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string brandCode, string dateSearch, string areaCode)
        {
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
            var startDateNow = new DateTime(date.Year, date.Month, 1);
            startDateNow = startDateNow.AddDays(-1);
            var dateStringPreMonth = startDateNow.ToString("dd/MM/yyyy");

            var listConsump = GetConsumpOfCusFunc(session, listArea, productCode, brandCode, dateSearch);
            var listInstock = GetTotalCanImpInstockOfCusInMonthFunc(session, listArea, productCode, brandCode, dateSearch);
            var listInstockPre = GetTotalCanImpInstockOfCusInMonthFunc(session, listArea, productCode, brandCode, dateStringPreMonth);

            var query = from a in listConsump
                        from b in listInstock
                        where a.CusCode == b.CusCode
                        select new
                        {
                            AreaName = a != null && !string.IsNullOrEmpty(a.AreaName) ? a.AreaName : b.AreaName,
                            AreaCode = a != null && !string.IsNullOrEmpty(a.AreaCode) ? a.AreaCode : b.AreaCode,
                            CusCode = a != null && !string.IsNullOrEmpty(a.CusCode) ? a.CusCode : b.CusCode,
                            CusName = a != null && !string.IsNullOrEmpty(a.CusName) ? a.CusName : b.CusName,
                            ConsumpMonthly = a != null && a.ConsumpMonthly != null ? a.ConsumpMonthly : 0,
                            Instock = b != null && b.Instock != null ? b.Instock : 0,
                        };
            var query1 = from a in query
                         join c1 in listInstockPre on a.CusCode equals c1.CusCode into c2
                         from c in c2.DefaultIfEmpty()
                         let instockPre = c != null && c.Instock.HasValue ? c.Instock.Value : 0
                         select new
                         {
                             AreaName = a.AreaName,
                             AreaCode = a.AreaCode,
                             CusCode = a.CusCode,
                             CusName = a.CusName,
                             ImportConsump = a.ConsumpMonthly + a.Instock - instockPre,
                         };

            if (!string.IsNullOrEmpty(areaCode))
            {
                var query2 = (from a in query1.Where(x => x.AreaCode == areaCode)
                              select new VCGroupCustomerCareModel
                              {
                                  CusCode = a.CusCode,
                                  CusName = a.CusName,
                                  ImportConsump = a.ImportConsump,
                              });
                return query2;
            }
            else
            {
                var query2 = (from a in query1
                              group new { a } by new { a.AreaCode }
                              into grp
                              select new VCGroupCustomerCareModel
                              {
                                  AreaCode = grp.FirstOrDefault().a.AreaCode,
                                  AreaName = grp.FirstOrDefault().a.AreaName,
                                  ImportConsump = grp.Sum(y => y.a.ImportConsump),
                              });
                return query2;
            }
        }

        //Lấy ra thông tin của bản ghi của Cửa hàng mới nhất trong tháng tìm kiếm
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetTotalCanImpInstockOfCusInMonthFunc(SessionUserLogin session, IQueryable<BaseObject> listArea, string productCode, string brandCode, string dateSearch)
        {
            var listCustomerCareOfCusNewestInMonthFunc = GetCustomerCareOfCusNewestInMonthFunc(session, dateSearch);

            //productCode không truyền => Tồn kho là lấy tổng tất cả các chủng loại xi măng của 1 hãng tìm kiếm
            if (string.IsNullOrEmpty(productCode))
            {
                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareOfCusNewestInMonthFunc
                                                on d.CusCode equals e.CusCode
                              group new { c, d, e } by new { d.CusCode, e.BrandCode }
                              into grp
                              where grp.Key.BrandCode == brandCode
                              select new VCGroupCustomerCareModel
                              {
                                  AreaName = grp.FirstOrDefault().c.Name,
                                  AreaCode = grp.FirstOrDefault().c.Code,
                                  CusCode = grp.Key.CusCode,
                                  CusName = grp.FirstOrDefault().d.CusName,
                                  //TotalCanImp = brandCode == "BUTSON" ? grp.FirstOrDefault().e.TotalCanImp : null,
                                  //Proportion = brandCode == "BUTSON" ? grp.FirstOrDefault().e.Proportion : null,
                                  Instock = grp.Sum(y => y.e.Instock),
                              });
                return query1;
            }
            //productCode truyền vào => Tồn kho là lấy của từng chủng loại xi măng của 1 hãng tìm kiếm & giá mua, giá bán theo 1 chủng loại sản phẩm nhập vào
            else
            {
                var query1 = (from c in listArea
                              join d in DbContext.Customerss.Where(x => x.IsDeleted == false).AsNoTracking()
                                                .Select(x => new { x.CusCode, x.Area, x.CusName }) on c.Code equals d.Area
                              join e in listCustomerCareOfCusNewestInMonthFunc
                                                on d.CusCode equals e.CusCode
                              where e.BrandCode == brandCode && e.ProductCode == productCode
                              select new VCGroupCustomerCareModel
                              {
                                  AreaName = c.Name,
                                  AreaCode = c.Code,
                                  CusCode = d.CusCode,
                                  CusName = d.CusName,
                                  //TotalCanImp = brandCode == "BUTSON" ? e.TotalCanImp : null,
                                  //Proportion = brandCode == "BUTSON" ? e.Proportion : null,
                                  Instock = e.Instock,

                                  //BuyCost = e.BuyCost,
                                  //SaleCost = e.SaleCost,
                              });
                return query1;
            }
        }

        //Dùng cho báo cáo về tồn kho trong THÁNG BÁO CÁO
        [NonAction]
        public IQueryable<VCGroupCustomerCareModel> GetCustomerCareOfCusNewestInMonthFunc(SessionUserLogin session, string dateSearch)
        {
            DateTime date = !string.IsNullOrEmpty(dateSearch) ? DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            var listSettingRoutesOfCusNewestInMonthFunc = GetListSettingRoutesOfCusNewestInMonthFunc(session, date);

            var query1 = (from a in listSettingRoutesOfCusNewestInMonthFunc
                          join e in DbContext.VcCustomerCares.Where(x => x.IsDeleted != true)
                                             .AsNoTracking()
                                             .Select(x => new { x.Id, x.RouteCode, x.BrandCode, x.ProductCode, x.BuyCost, x.SaleCost, x.Instock, x.CreatedBy, x.CreatedTime })
                          on a.RouteCode equals e.RouteCode
                          select new VCGroupCustomerCareModel
                          {
                              Id = e.Id,
                              BrandCode = e.BrandCode,
                              ProductCode = e.ProductCode,
                              BuyCost = e.BuyCost,
                              SaleCost = e.SaleCost,
                              Instock = e.Instock,
                              CreatedBy = e.CreatedBy,
                              CreatedTime = e.CreatedTime,
                              CusCode = a.Node,
                              TotalCanImp = a.TotalCanImp,
                              Note = a.Note,
                              Proportion = a.Proportion,
                              TimeWork = a.TimeWork,
                          });
            return query1;
        }
        #endregion

    }
    public class VCSettingRouteModel
    {
        public int Id { get; set; }
        public string Node { get; set; }
        public string RouteCode { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Note { get; set; }
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public decimal? Proportion { get; set; }
        public DateTime? TimeWork { get; set; }
    }
    public class VCGroupCustomerCareModel
    {
        public int Id { get; set; }
        public string BrandCode { get; set; }
        public string BrandName { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductGroup { get; set; }
        public string ProductGroupName { get; set; }
        public decimal? BuyCost { get; set; }
        public decimal? SaleCost { get; set; }
        public decimal? Instock { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public decimal? ConsumpMonthly { get; set; }


        public string CusCode { get; set; }
        public string CusName { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Note { get; set; }
        public decimal? Proportion { get; set; }
        public DateTime? TimeWork { get; set; }

        public string AreaCode { get; set; }
        public string AreaName { get; set; }
        public string Staff { get; set; }
        public decimal? ProportionCal { get; set; }
        public decimal? ImportConsump { get; set; }

    }

    public class MapOfRole
    {
        public string RoleCode { get; set; }
        public string RoleName { get; set; }
        public List<MapOfApplication> MapOfApplication { get; set; }
    }

    public class MapOfApplication
    {
        public string ApplicationCode { get; set; }
        public string ApplicationName { get; set; }
        public List<MapOfGroupRole> MapOfGroupRole { get; set; }
    }

    public class MapOfGroupRole
    {
        public string GroupUserCode { get; set; }
        public string GroupUserName { get; set; }

        public string RoleCode { get; set; }
        public string RoleName { get; set; }

        public bool IsMain { get; set; }

        public List<MapOfFunction> MapOfFunction { get; set; }
    }

    public class MapOfFunction
    {
        public string FunctionCode { get; set; }
        public string FunctionName { get; set; }
        public List<MapOfResource> MapOfResource { get; set; }
    }

    public class MapOfResource
    {
        public string ResourceCode { get; set; }
        public string ResourceName { get; set; }
        public string Api { get; set; }
        public bool Scope { get; set; }
        public bool Status { get; set; }
    }
    public class BaseObject
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
    }

    public class OperationLog
    {
        public string Controller { get; set; }
        public string Action { get; set; }
        public string Path { get; set; }
        public string RequestHeader { get; set; }
        public string RequestBody { get; set; }
        public string Table { get; set; }
        public string IP { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
    }
    public class ModelAPI
    {
        public string ResourceCode { get; set; }
        public string Title { get; set; }
        public string Api { get; set; }
        public string Path { get; set; }
        public bool Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool Scope { get; set; }
    }
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AdminAuthorizeAttribute : Attribute
    {

    }
}