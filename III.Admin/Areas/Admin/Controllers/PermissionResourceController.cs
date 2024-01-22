using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Data;

namespace III.Admin.Controllers
{
    public class VIBUIGPermissionModel
    {
        public string UserId { set; get; }
        public string UserName { set; get; }
        public string FullName { set; get; }
        public string Email { set; get; }
        public string RoleId { set; get; }
        public string GroupUserCode { set; get; }
    }
    public class ObjGetUserInGroupModel
    {
        public string Account { set; get; }
        public List<string> ListGUserId { set; get; }
    }
    public class ObjGetResourceModel
    {
        public int AppId { set; get; }
        public string AppCode { set; get; }
        public List<string> ListGUserId { set; get; }
        public List<string> ListFuncId { set; get; }
        public string RoleId { set; get; }
        public bool IsMultiple { get; set; }
    }
    [Area("Admin")]
    public class PermissionResourceController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<PermissionResourceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public PermissionResourceController(EIMDBContext context, ILogger<PermissionResourceController> logger, IActionLogService actionLog, IStringLocalizer<PermissionResourceController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService)
        {
            _context = context;
            _logger = logger;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }

        [HttpPost]
        public object GetApplication()
        {
            var a = _context.AdApplications.Select(x => new { Id = x.ApplicationId, x.Title, Code = x.ApplicationCode, });
            return Json(a);
        }

        [HttpPost]
        public IActionResult GetFunction([FromBody]TempSub obj)
        {
            List<FunctionModel> result = new List<FunctionModel>();
            try
            {
                var session = HttpContext.GetSessionUser();

                if (obj.IdS.Length > 0)
                {
                    if (obj.IdS.Length == 3)
                    {
                        var appCode = obj.IdS[0];
                        var groupCode = obj.IdS[1];
                        var roleId = obj.IdS[2];

                        string[] param = new string[] { "@groupUserCode", "@roleId" };
                        object[] val = new object[] { groupCode, roleId };
                        DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_FUNCTION_BY_PERMISSION", param, val);
                        var listFunc = CommonUtil.ConvertDataTable<FunctionModel>(rs);

                        result.AddRange(listFunc);
                    }
                    else
                    {
                        var appCode = obj.IdS[0];
                        var query = from fu in _context.AdFunctions
                                    orderby fu.Title
                                    select new FunctionModel
                                    {
                                        Id = fu.FunctionId,
                                        Title = fu.Title,
                                        Code = fu.FunctionCode,
                                        ParentCode = fu.ParentCode,
                                    };

                        var listFunction = query.ToList();
                        if (obj.IdS.Length == 2)
                        {
                            var funcCode = obj.IdS[1];
                            var listFunctionChild = listFunction.Where(x => x.Code == funcCode).OrderByDescending(x => x.Title);

                            foreach (var func in listFunctionChild)
                            {
                                var listChild = GetFunctionChild(listFunction, func.Code, 1);

                                var function = new FunctionModel();
                                function.Id = func.Id;
                                function.Title = func.Title;
                                function.Code = func.Code;
                                function.ParentCode = func.ParentCode;
                                result.Add(function);
                                if (listChild.Count > 0) result = result.Concat(listChild).ToList();
                            }
                            var res = result.ToList();
                            return Json(res);
                        }
                        else
                        {
                            foreach (var func in listFunction.Where(x => string.IsNullOrEmpty(x.ParentCode)).OrderByDescending(x => x.Title))
                            {
                                var listChild = GetFunctionChild(listFunction, func.Code, 1);

                                var function = new FunctionModel();
                                function.Id = func.Id;
                                function.Title = func.Title;
                                function.Code = func.Code;
                                function.ParentCode = func.ParentCode;
                                function.Ord = 1;
                                function.IsVisible = true;
                                function.HasChild = listChild.Count > 0 ? true : false;
                                result.Add(function);
                                if (listChild.Count > 0) result = result.Concat(listChild).ToList();
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
                func.HasChild = destination.Count > 0 ? true : false;
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }

        //Get Resource with multiple functionId
        [HttpPost]
        public async Task<IActionResult> GetResource([FromBody]ObjGetResourceModel obj)
        {
            try
            {
                List<AdResourcePermission> result = new List<AdResourcePermission>();
                foreach (var funcIdS in obj.ListFuncId)
                {
                    var funcId = funcIdS;
                    List<AdPermission> listPermission = new List<AdPermission>();
                    foreach (var groupId in obj.ListGUserId)
                    {
                        var pms = await _context.AdPermissions.Where(x => x.FunctionCode == funcId && x.GroupUserCode == groupId).ToListAsync(); /*x.ApplicationCode == obj.AppCode &&*/
                        listPermission.AddRange(pms);
                    }
                    var funcRes = await _context.AdPrivileges.Include(x => x.Resource).Where(x => x.FunctionCode == funcId).OrderBy(o => o.Resource.Title).ToListAsync();
                    var query = from fr in funcRes
                                select new AdResourcePermission
                                {
                                    Id = fr.PrivilegeId,
                                    Code = fr.Resource.ResourceCode,
                                    Title = fr.Resource.Title,
                                    Description = fr.Resource.Description,
                                    Api = fr.Resource.Api,
                                    Path = fr.Resource.Path,
                                    Ord = fr.Resource.Ord,
                                    ParentCode = fr.Resource.ParentCode,
                                    FunctionCode = fr.FunctionCode,
                                    HasPermission = listPermission.Any(x => x.ResourceCode == fr.ResourceCode)
                                };
                    result.AddRange(query);
                }
                return Json(result);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        [HttpPost]
        public object GetACtion([FromBody]TempSub obj)
        {
            try
            {
                List<string> liTemp = new List<string>();
                DataDynamic liAllTemp = new DataDynamic(2);
                var temp = _context.AdPrivileges.Where(x => obj.IdS[0] == x.FunctionCode).Select(x => new { x.ResourceCode, x.PrivilegeId });

                foreach (var item in temp)
                {
                    liTemp.Add(item.ResourceCode.ToString());
                    liAllTemp.Data[0].Add(item.PrivilegeId);
                }
                var query = _context.AdResources.Where(x => liTemp.Contains(x.ResourceCode.ToString())).Select(x => new { x.ResourceId, x.ResourceCode, x.Title, x.Description, x.Status });
                var sql = query.ToSql();

                liAllTemp.Data[1].Add(query);
                return Json(liAllTemp);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        [HttpPost]
        public async Task<object> GetGUser([FromBody]GroupUserSearch search)
        {
            List<GroupUserModel> listResult;

            try
            {
                var session = HttpContext.GetSessionUser();
                //if (search.OnlyFunction)
                //{
                //    listResult = await _context.AdPermissions
                //                                .Where(x => x.RoleId.Equals(search.RoleId) && x.UserId == null)
                //                                .GroupBy(g => g.GroupUser)
                //                                .Select(x => new GroupUserModel
                //                                {
                //                                    Id = x.Key.GroupUserId,
                //                                    Code = x.Key.GroupUserCode,
                //                                    Title = x.Key.Title,
                //                                    ParentId = x.Key.ParentCode,
                //                                    //IsChecked = true,
                //                                    //IsEnabled = true,
                //                                    //Ord = x.Key.ParentCode == "D000" ? 3 : x.Key.ParentCode == "P000" ? 5 : x.Key.GroupUserCode == "G000" ? 1 : x.Key.GroupUserCode == "D000" ? 2 : x.Key.GroupUserCode == "P000" ? 4 : 6
                //                                }).AsNoTracking().ToListAsync();
                //}
                //else
                //{

                //}

                var list = await _context.AdGroupUsers.Where(x => !x.IsDeleted && x.IsEnabled && (session.IsAllData || session.ListRoleGroupUser.Where(z => !z.GroupUserCode.Equals("SUB_ADMIN")).Any(p => p.GroupUserCode.Equals(x.GroupUserCode)))).AsNoTracking().ToListAsync();
                listResult = GetSubTreeData(list, null, new List<GroupUserModel>(), 0);
            }
            catch (Exception ex)
            {

                throw;
            }

            return Json(listResult);
        }

        [HttpPost]
        public object GetGRole()
        {
            var data = _context.Roles.Where(x => x.Code != "ROOT" && x.Status).OrderBy(x => x.Ord);

            var session = HttpContext.GetSessionUser();
            if (session.IsSubAdmin)
            {
                var data1 = data.Where(x => (x.CreatedBy.Equals(session.UserName) && !string.IsNullOrEmpty(x.Type) && x.Type.Equals("SUB_ADMIN")) || session.ListRoleGroupUser.Any(p => !p.GroupUserCode.Equals("SUB_ADMIN") && p.RoleId.Equals(x.Id))).Select(x => new { x.Id, x.Title });
                return Json(data1);
            }

            return Json(data);
        }

        [HttpPost]
        public object GetUser([FromBody]Paging obj)
        {
            try
            {
                if (obj.search == null) obj.search = "";
                var count = _context.Users.Count(x => string.IsNullOrEmpty(obj.search) || x.UserName.Contains(obj.search));
                var nextItems = (obj.bigCurrentPage - 1) * obj.itemsPerPage;
                var a = _context.Users.Where(x => string.IsNullOrEmpty(obj.search) || x.UserName.Contains(obj.search)).OrderBy(x => x.UserName).Select(x => new { x.Id, x.UserName }).Skip(nextItems).Take(obj.itemsPerPage).AsNoTracking().ToList();
                Pagination objtemp = new Pagination() { bigTotalItems = count, bigCurrentPage = obj.bigCurrentPage, Data = a };
                return Json(objtemp);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        //Get UserInGroup with multiple GroupUserId
        [HttpPost]
        public IActionResult GetUserInGroup([FromBody]ObjGetUserInGroupModel obj)
        {
            try
            {
                var userId = ESEIM.AppContext.UserId;

                List<VIBUIGPermissionModel> result = new List<VIBUIGPermissionModel>();
                foreach (var id in obj.ListGUserId)
                {
                    var query = from uig in _context.AdUserInGroups
                                where uig.GroupUserCode == id && uig.UserId != userId
                                select new VIBUIGPermissionModel
                                {
                                    UserId = uig.User.Id,
                                    UserName = uig.User.UserName,
                                    FullName = uig.User.FamilyName + " " + uig.User.GivenName,
                                    Email = uig.User.Email,
                                    RoleId = uig.RoleId,
                                    GroupUserCode = uig.GroupUserCode,
                                };
                    result.AddRange(query);
                }
                var query2 = result.Where(p => string.IsNullOrEmpty(obj.Account) || p.UserName.ToLower().Contains(obj.Account.ToLower())).ToList();
                return Json(query2);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetAllBranch([FromBody]SearchBranchModel search)
        {
            if (search.OnlySelected)
            {
                var listRef = new List<string>();
                var userInGroup = await _context.AdUserInGroups.FirstOrDefaultAsync(x => x.UserId == search.UserId); /*x.ApplicationCode == search.AppCode &&*/
                if (!string.IsNullOrEmpty(userInGroup?.BranchReference))
                {
                    listRef = userInGroup.BranchReference.Split(',').ToList();
                }

                return Json(listRef);
            }
            else
            {
                var listRef = new List<string>();
                var user = await _context.Users.Include(i => i.Branch).FirstOrDefaultAsync(x => x.Id == search.UserId);
                if (user != null && !string.IsNullOrEmpty(user.OrgReference))
                {
                    listRef = user.OrgReference.Split(',').ToList();
                }

                var allBranch = new OrganizationModel
                {
                    OrgId = 0,
                    OrgAddonCode = "b_000",
                    OrgCode = "b_000",
                    OrgName = "All Branch",
                    OrgParentCode = null,
                    OrgGroup = 4,
                    Ord = 0,
                    Company = "HO",
                    Division = null,
                    DisabledCheck = false,
                    IsMain = false,
                };

                var query = from x in _context.AdOrganizations
                            join gvd in _context.AdDivisions on x.Division equals gvd.Division into grp1
                            from vd in grp1.DefaultIfEmpty()
                            where (x.OrgGroup.HasValue && x.OrgGroup.Value == 2 && x.IsEnabled)
                            //&& (string.IsNullOrEmpty(jTablePara.Name) || x.OrgName.ToLower().Contains(jTablePara.Name.ToLower()) || x.OrgCode.ToLower().Contains(jTablePara.Name.ToLower()))
                            select new OrganizationModel
                            {
                                OrgId = x.OrgId,
                                OrgAddonCode = x.OrgAddonCode,
                                OrgCode = x.OrgCode,
                                OrgName = string.Format("{0} - {1}", x.OrgCode, x.OrgName),
                                OrgParentCode = x.Division == null ? null : string.Format("d_{0}", x.Division),
                                OrgGroup = x.OrgGroup,
                                Ord = x.Company == "HO" && x.Division == null ? 2 : x.Company == "DIV" ? 3 : x.Company == "BRA" ? 4 : 5,
                                Company = x.Company,
                                Division = vd == null ? "" : vd.DivisionDesc,
                                DisabledCheck = false,
                                IsMain = false,
                            };

                var queryDivision = from vd in _context.AdDivisions
                                    select new OrganizationModel
                                    {
                                        OrgId = 0,
                                        OrgAddonCode = string.Format("d_{0}", vd.Division),
                                        OrgCode = vd.Division,
                                        OrgName = string.Format("{0} - {1}", vd.Division, vd.DivisionDesc),
                                        OrgParentCode = "b_000",
                                        OrgGroup = 2,
                                        Ord = 1,
                                        Company = "DIV",
                                        Division = vd.Division,
                                        DisabledCheck = true,
                                        IsMain = false,
                                    };

                var data = query.Union(queryDivision).OrderBy(x => x.Ord).ThenBy(o => o.OrgAddonCode).AsNoTracking().ToList();
                data.Insert(0, allBranch);

                var result = data.Select(x => new
                {
                    OrgAddonCode = x.OrgAddonCode,
                    OrgCode = x.OrgCode,
                    OrgName = x.OrgName,
                    OrgParentCode = x.OrgParentCode,
                    Ord = x.Ord,
                    DisabledCheck = x.DisabledCheck,
                    IsMain = x.IsMain,
                    IsChecked = listRef.Any(y => y == x.OrgAddonCode) || (listRef.Count > 0 && listRef[0] == "b_000")
                }).ToList();

                return Json(result);
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetBranchReference([FromBody]SearchBranchModel search)
        {
            var user = await _context.Users.Include(i => i.Branch).FirstOrDefaultAsync(x => x.Id == search.UserId);
            if (user != null)
            {
                var listBranchRef = new List<BranchModel>();
                if (!string.IsNullOrEmpty(user.OrgReference))
                {
                    if (user.OrgReference == "b_000")
                    {
                        var allBranch = new BranchModel();
                        allBranch.OrgAddonCode = "b_000";
                        allBranch.OrgCode = "b_000";
                        allBranch.OrgName = "All Branch";
                        listBranchRef.Add(allBranch);
                    }
                    else
                    {
                        var listRef = user.OrgReference.Split(',').ToList();
                        listBranchRef = _context.AdOrganizations.Where(x => x.OrgGroup.HasValue && x.OrgGroup.Value == 2 && listRef.Any(y => y == x.OrgAddonCode))
                            .Select(x => new BranchModel
                            {
                                OrgAddonCode = x.OrgAddonCode,
                                OrgCode = x.OrgCode,
                                OrgName = string.Format("{0} - {1}", x.OrgCode, x.OrgName)
                            }).ToList();
                    }
                }

                var result = new
                {
                    MainBranch = user.Branch != null ? string.Format("{0} - {1}", user.Branch.OrgCode, user.Branch.OrgName) : "",
                    ListBranchRef = listBranchRef,
                };

                return Json(result);
            }
            return Json("[]");
        }

        [HttpPost]
        public async Task<IActionResult> UpdateBranchReference([FromBody] SearchBranchModel search)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == search.UserId);
                if (user != null)
                {
                    var oldBranchRef = user.OrgReference;
                    user.OrgReference = search.ListBranch.Count > 0 ? string.Join(",", search.ListBranch) : "";
                    user.UpdatedDate = DateTime.Now;
                    user.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.Update(user);
                    await _context.SaveChangesAsync();

                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["BRANCH"].Value.ToLower());
                    //_actionLog.InsertActionLog("ASP_NET_USERS", "Update success branch reference of user: " + user.UserName, oldBranchRef, user.OrgReference, "Update");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_stringLocalizer["NOT_EXIST_ITEM"], _stringLocalizer["USER"].Value.ToLower());
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = "An error occurred while update";
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

        [NonAction]
        private List<GroupUserModel> GetSubTreeData(List<AdGroupUser> data, string parentCode, List<GroupUserModel> lstCategories, int tab)
        {
            var contents = parentCode == null
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.GroupUserId).ToList()
                : data.Where(x => x.ParentCode == parentCode).OrderBy(x => x.Title).ToList();
            foreach (var item in contents)
            {
                var category = new GroupUserModel
                {
                    Id = item.GroupUserId,
                    Code = item.GroupUserCode,
                    Title = item.Title,
                    ParentId = item.ParentCode,
                    IsChecked = false,
                    IsEnabled = false,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentCode == item.GroupUserCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.GroupUserCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }
    }

    public class SearchBranchModel
    {
        public string AppCode { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public List<string> ListBranch { get; set; }
        public bool OnlySelected { get; set; }
    }

    public class BranchModel
    {
        public string OrgAddonCode { get; set; }
        public string OrgCode { get; set; }
        public string OrgName { get; set; }
        public string OrgParentCode { get; set; }
        public string BranchName { get; set; }
        public int OrgOrd { get; set; }
    }

    public class GroupUserSearch
    {
        public string RoleId { get; set; }
        public string AppCode { get; set; }
        public string Function { get; set; }
        public bool OnlyFunction { get; set; }
    }
}