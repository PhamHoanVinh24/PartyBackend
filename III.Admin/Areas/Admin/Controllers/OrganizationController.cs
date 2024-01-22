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
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    public class OrganizationModel
    {
        public int OrgId { set; get; }
        public string OrgAddonCode { set; get; }
        public string OrgCode { set; get; }
        public string OrgName { set; get; }
        public int? OrgGroup { set; get; }
        public int? Ord { set; get; }
        public string OrgParentCode { set; get; }
        public string Company { get; set; }
        public string Division { get; set; }
        public string HierarchyCode { get; set; }
        public bool DisabledCheck { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsMain { get; set; }
    }
    public class JTableModelOrganizationCustom : JTableModel
    {
        public string Name { set; get; }
        public int? TypeOrganizationId { set; get; }

    }
    [Area("Admin")]
    public class OrganizationController : BaseController
    {
        private readonly EIMDBContext _context;

        private readonly ILogger _logger;

        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<OrganizationController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public OrganizationController(EIMDBContext context, ILogger<OrganizationController> logger, IActionLogService actionLog, IStringLocalizer<OrganizationController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _logger = logger;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbOrganization", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbOrganization"] = _sharedResources["COM_CRUMB_ORGANIZATION"];
            return View();
        }

        [HttpPost]
        public object GetAll([FromBody]AdOrganization obj)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Get list Organization");
            if (string.IsNullOrEmpty(obj.OrgParentCode))
            {
                var rs = _context.AdOrganizations.OrderBy(x => x.OrgOrd).Select(x => new { x.OrgId, x.OrgAddonCode, x.OrgCode, x.OrgName, x.OrgParentCode }).AsNoTracking().ToList();
                return Json(rs);
            }
            else
            {
                var rs = _context.AdOrganizations.Where(x => x.OrgParentCode == obj.OrgParentCode).OrderBy(x => x.OrgOrd).Select(x => new { x.OrgId, x.OrgAddonCode, x.OrgCode, x.OrgName, x.OrgParentCode }).AsNoTracking().ToList();
                return Json(rs);
            }
        }

        [HttpGet]
        public JsonResult LoadOrganizationType()
        {
            var objGroup = new object[]
            {
                new {Id = 1, Name = "Department"},
                new {Id = 2, Name = "Branch"},
                new {Id = 3, Name = "Profit Center"},
                new {Id = 4, Name = "Account Executive"},
            };

            return Json(objGroup);
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelOrganizationCustom jTablePara)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Get list Organization");
            //_actionLog.InsertActionLog("VIB_ORGANIZATION", "Get list Organization", null, null, "JTable");
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from x in _context.AdOrganizations
                        join gvd in _context.AdDivisions on x.Division equals gvd.Division into grp1
                        from vd in grp1.DefaultIfEmpty()
                        where (jTablePara.TypeOrganizationId == null || x.OrgGroup == jTablePara.TypeOrganizationId)
                            && (string.IsNullOrEmpty(jTablePara.Name) || x.OrgName.ToLower().Contains(jTablePara.Name.ToLower()) || x.OrgCode.ToLower().Contains(jTablePara.Name.ToLower()))
                        select new OrganizationModel
                        {
                            OrgId = x.OrgId,
                            OrgAddonCode = x.OrgAddonCode,
                            OrgCode = x.OrgCode,
                            OrgName = x.OrgName,
                            OrgParentCode = x.Division == null ? null : string.Format("d_{0}", x.Division),
                            OrgGroup = x.OrgGroup,
                            Ord = x.Company == "HO" ? 2 : x.Company == "DIV" ? 3 : x.Company == "BRA" ? 4 : 5,
                            Company = x.Company,
                            Division = vd == null ? "" : vd.DivisionDesc,
                            DisabledCheck = false,
                        };

            var queryDivision = from vd in _context.AdDivisions
                                select new OrganizationModel
                                {
                                    OrgId = 0,
                                    OrgAddonCode = string.Format("d_{0}", vd.Division),
                                    OrgCode = vd.Division,
                                    OrgName = vd.DivisionDesc,
                                    OrgParentCode = null,
                                    OrgGroup = 2,
                                    Ord = 1,
                                    Company = "DIV",
                                    Division = vd.Division,
                                    DisabledCheck = true,
                                };

            var data = query.Union(queryDivision).OrderBy(x => x.Ord).AsNoTracking();
            var listOrganization = data as IList<OrganizationModel> ?? data.ToList();

            var result = new List<OrganizationModel>();
            foreach (var ognzt in listOrganization.Where(x => x.OrgParentCode == null))
            {
                var listChild = GetOrganizationChild(listOrganization, ognzt.OrgAddonCode, ". . . ");

                var organization = new OrganizationModel();
                organization.OrgId = ognzt.OrgId;
                organization.OrgAddonCode = ognzt.OrgAddonCode;
                organization.OrgCode = ognzt.OrgCode;
                organization.OrgName = (listChild.Count > 0 ? "<i class='fa fa-folder-open font-green-sharp'></i> " : "<i class='fa fa-folder text-info'></i> ") + ognzt.OrgName;
                organization.OrgGroup = ognzt.OrgGroup;
                organization.Ord = ognzt.Ord;
                organization.OrgParentCode = ognzt.OrgParentCode;
                organization.Company = ognzt.Company;
                organization.Division = ognzt.Division;
                organization.DisabledCheck = ognzt.DisabledCheck;
                result.Add(organization);

                if (listChild.Count > 0) result = result.Concat(listChild).ToList();
            }
            var count = result.Count();
            var res = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "OrgId", "OrgAddonCode", "OrgCode", "OrgName", "OrgParentCode", "Ord", "Company", "Division");
            return Json(jdata);
        }

        [HttpPost]
        public IActionResult GetTreeBranch([FromBody]SearchUserOrg search)
        {
            var query = from x in _context.AdOrganizations
                        join gvd in _context.AdDivisions on x.Division equals gvd.Division into grp1
                        from vd in grp1.DefaultIfEmpty()
                        where (x.OrgGroup.HasValue && x.OrgGroup.Value == 2)
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
                            HierarchyCode = x.HierarchyCode,
                            Company = x.Company,
                            Division = vd == null ? "" : vd.DivisionDesc,
                            DisabledCheck = false,
                            IsEnabled = x.IsEnabled,
                        };

            var queryDivision = from vd in _context.AdDivisions
                                select new OrganizationModel
                                {
                                    OrgId = 0,
                                    OrgAddonCode = string.Format("d_{0}", vd.Division),
                                    OrgCode = vd.Division,
                                    OrgName = string.Format("{0} - {1}", vd.Division, vd.DivisionDesc),
                                    OrgParentCode = null,
                                    OrgGroup = 2,
                                    Ord = 1,
                                    HierarchyCode = "00",
                                    Company = "DIV",
                                    Division = vd.Division,
                                    DisabledCheck = true,
                                    IsEnabled = true,
                                };

            //var data = query.OrderBy(x => x.Ord).ThenByDescending(o => o.OrgAddonCode).AsNoTracking();
            var data = query.Union(queryDivision).OrderBy(x => x.Ord).ThenByDescending(o => o.OrgAddonCode).AsNoTracking();

            return Json(data);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]AdOrganization obj)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Insert Organization");
            var msg = new JMessage() { Error = false };
            try
            {
                var org = _context.AdOrganizations.Where(x => x.OrgCode.Equals(obj.OrgCode)).FirstOrDefault();
                //var org = _context.AdOrganizations.Where(x => int.Parse(x.OrgCode).Equals(int.Parse(obj.OrgCode))).FirstOrDefault();
                if (org == null)
                {
                    var adOrganizations = new AdOrganization
                    {
                        Division = int.Parse(obj.Division) > 0 ? obj.Division : string.Concat("0", obj.Division),
                        OrgCode = obj.OrgCode,
                        OrgName = obj.OrgName,
                        OrgAddonCode = "b_" + obj.OrgCode,
                        OrgGroup = 2,
                        OrgUpdateTime = DateTime.Now.ToString(),
                        Company = "BRA",
                        Country = "VN",
                        State = "01",
                        HierarchyCode = "11",
                        IsEnabled = true,
                        OrgId = _context.AdOrganizations.Any() ? _context.AdOrganizations.Max(x => x.OrgId) + 1 : 1,
                        DepartmentCode = obj.DepartmentCode
                    };

                    //msg.Title = "Thêm Chi nhánh thành công !";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ADM_BRANCH_LBL_BRANCH"].Value.ToLower());
                    _context.AdOrganizations.Add(adOrganizations);
                    _context.SaveChanges();
                    //_logger.LogInformation(LoggingEvents.LogDb, "Insert Organization Success");
                    _actionLog.InsertActionLog("AdOrganization", "Insert Organization Success", null, obj, "Insert");
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Chi nhánh đã tồn tại!";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ADM_BRANCH_LBL_BRANCH"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Thêm Chi nhánh thất bại !";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["ADM_BRANCH_LBL_BRANCH"]);
                //_logger.LogError(LoggingEvents.LogDb, "Insert Organization Fail");
                _actionLog.InsertActionLog("AdOrganization", "Insert Organization Fail", null, null, "Error");
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]AdOrganization obj)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Update Organization");
            var msg = new JMessage() { Error = false };
            try
            {
                //obj.Division = int.Parse(obj.Division) > 10 ? obj.Division : string.Concat("0", obj.Division);
                //msg.Title = "Sửa Chi nhánh thành công !";
                msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], _stringLocalizer["ADM_BRANCH_LBL_BRANCH"]);
                _context.AdOrganizations.Update(obj);
                _context.SaveChanges();
                //_logger.LogInformation(LoggingEvents.LogDb, "Update Organization Success");
                _actionLog.InsertActionLog("AdOrganization", "Update Organization Success", null, obj, "Update");
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Sửa Chi nhánh thất bại !";
                msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], _stringLocalizer["ADM_BRANCH_LBL_BRANCH"]);

                //_logger.LogError(LoggingEvents.LogDb, "Update Organization Fail");
                _actionLog.InsertActionLog("AdOrganization", "Update Organization Fail", null, null, "Error");

            }
            return Json(msg);
        }
        [HttpGet]
        public object Delete(string id)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Delete Organization");
            try
            {
                var obj = _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode == id);
                _context.AdOrganizations.Remove(obj);
                _context.SaveChanges();
                ////_logger.LogInformation(LoggingEvents.LogDb, "Delete Organization succesfully");
                _actionLog.InsertActionLog("VIB_ORGANIZATION", "Delete Organization succesfully", obj, null, "Delete");

                return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], _stringLocalizer["ORGANIZATIONS"].Value.ToLower()) });
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete Organization fail");
                _actionLog.InsertActionLog("VIB_ORGANIZATION", "Delete Organization fail", null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], _stringLocalizer["ORGANIZATIONS"].Value.ToLower()), Object = ex.Message });
            }
        }

        [HttpGet]
        public JsonResult GetItem(string OrgAddonCode)
        {

            var a = _context.AdOrganizations.Single(m => m.OrgAddonCode == OrgAddonCode);
            return Json(a);
        }

        [HttpPost]
        public JsonResult GetDepartment()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title });
            return Json(data);
        }
        [HttpPost]
        public object Resort([FromBody]List<AdOrganization> model)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var item in model)
                {
                    _context.AdOrganizations.Attach(item);
                    _context.Entry(item).Property(x => x.OrgOrd).IsModified = true;
                    _context.SaveChanges();
                }
                msg.Title = String.Format(_stringLocalizer["MSG_SORT_SUCCESS"], _stringLocalizer["ORGANIZATIONS"].Value.ToLower());
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["MSG_SORT_FAIL"], _stringLocalizer["ORGANIZATIONS"].Value.ToLower());
            }
            return Json(msg);
        }

        [HttpPost]
        public IActionResult GetTreeData(int? id)
        {
            var temp = Convert.ToInt32(id);
            var data = _context.AdOrganizations.Where(x => x.OrgGroup == null).OrderBy(x => x.OrgOrd).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), 0, new List<TreeView>(), "");
            return Json(dataOrder);
        }

        private List<TreeView> GetSubTreeData(List<AdOrganization> data, int parentid, List<TreeView> lstCategories, string tab)
        {
            tab += "- ";
            var contents = parentid == 0
                ? data.Where(x => x.OrgGroup == null).ToList()
                : data.Where(x => x.OrgGroup == parentid).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.OrgId,
                    Code = item.OrgCode,
                    Title = tab + item.OrgName,
                    HasChild = data.Any(x => x.OrgParentCode == item.OrgAddonCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.OrgId, lstCategories, tab);
            }
            return lstCategories;
        }

        [HttpPost]
        public object GetByParent(int? id)
        {
            var temp = Convert.ToInt32(id);
            return Json(_context.AdOrganizations.AsNoTracking().Where(x => (x.OrgGroup == id) || (temp == 0 && x.OrgGroup == null)).OrderBy(x => x.OrgOrd).ToList());
        }

        [HttpPost]
        public IActionResult GetTreeDataDivision(int? id)
        {
            var temp = Convert.ToInt32(id);
            var data = _context.AdDivisions.OrderBy(x => x.Division).AsNoTracking().ToList();
            var dataOrder = GetSubTreeDataDivision(data, new List<TreeView>(), "");
            return Json(dataOrder);
        }

        private List<TreeView> GetSubTreeDataDivision(List<AdDivision> data, List<TreeView> lstCategories, string tab)
        {
            tab += "- ";
            lstCategories = new List<TreeView>();
            foreach (var item in data)
            {
                var category = new TreeView
                {
                    Id = Int32.Parse(item.Division.ToString()),
                    Code = item.Division,
                    Title = tab + item.DivisionDesc,
                    //HasChild = data.Any(x => x.Division == item.Division)
                };
                lstCategories.Add(category);
                //if (category.HasChild) GetSubTreeDataDivision(data, lstCategories, tab);
            }
            return lstCategories;
        }
        private static List<OrganizationModel> GetOrganizationChild(IList<OrganizationModel> listOrganization, string parentCode, string level)
        {
            var result = new List<OrganizationModel>();
            var query = from ognzt in listOrganization
                        where ognzt.OrgParentCode == parentCode
                        orderby ognzt.OrgName
                        select new OrganizationModel
                        {
                            OrgId = ognzt.OrgId,
                            OrgName = ognzt.OrgName,
                            OrgCode = ognzt.OrgCode,
                            OrgParentCode = ognzt.OrgParentCode,
                            Ord = ognzt.Ord,
                            OrgAddonCode = ognzt.OrgAddonCode,
                            OrgGroup = ognzt.OrgGroup,
                            Company = ognzt.Company,
                            Division = ognzt.Division,
                            DisabledCheck = ognzt.DisabledCheck,
                        };

            var listOgnzt = query as IList<OrganizationModel> ?? query.ToList();
            foreach (var ognzt in listOgnzt)
            {
                var destination = GetOrganizationChild(listOrganization, ognzt.OrgAddonCode, ". . . " + level);
                ognzt.OrgName = level + (destination.Count > 0 ? "<i class='fa fa-folder-open font-green-sharp'></i> " : "<i class='fa fa-folder text-info'></i> ") + ognzt.OrgName;
                result.Add(ognzt);

                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }

        [HttpPost]
        public async Task<IActionResult> GetUserOutOrg([FromBody]SearchUserOrg search)
        {
            var listUserInGroup = _context.AdUserInGroups.Where(x => x.GroupUserCode == search.GroupUser).ToList();

            var query = await _context.Users
                                .Where(x => (search.Group == 2 && (x.BranchId == null || x.BranchId != search.Code)
                                            //|| search.Group == 1 && (x.DepartmentId == null || x.DepartmentId != search.Code)
                                            //|| search.Group == 3 && (x.ProfitCenterId == null || x.ProfitCenterId != search.Code)
                                            //|| search.Group == 4 && (x.AccountExecutiveId == null || x.AccountExecutiveId != search.Code)
                                            )
                                            && (string.IsNullOrEmpty(search.Name) || x.UserName.ToLower().Contains(search.Name.ToLower()) || x.GivenName.ToLower().Contains(search.Name.ToLower()))
                                            && (string.IsNullOrEmpty(search.GroupUser) || (listUserInGroup.Count > 0 && listUserInGroup.Any(y => y.UserId == x.Id)))
                                            && x.UserType != 10 && x.Active)
                                .Select(x => new
                                {
                                    UserId = x.Id,
                                    UserName = x.UserName,
                                    FullName = x.GivenName,
                                    Email = x.Email,
                                })
                                .Skip((search.Page - 1) * search.Row).Take(search.Row)
                                .AsNoTracking().ToListAsync();

            return Json(query);
        }

        [HttpPost]
        public IActionResult GetUserInOrg([FromBody]SearchUserOrg search)
        {
            var query = _context.Users
                                .Where(x => ((search.Group == 2 && x.BranchId != null && x.BranchId == search.Code)
                                            //|| (search.Group == 1 && x.DepartmentId != null && x.DepartmentId == search.Code)
                                            //|| (search.Group == 3 && x.ProfitCenterId != null && x.ProfitCenterId == search.Code)
                                            || (search.Group == 4 && x.AccountExecutiveId != null && x.AccountExecutiveId == search.Code))
                                            && (string.IsNullOrEmpty(search.Name) || x.UserName.ToLower().Contains(search.Name.ToLower()) || x.GivenName.ToLower().Contains(search.Name.ToLower())))
                                .Select(x => new
                                {
                                    UserId = x.Id,
                                    UserName = x.UserName,
                                    FullName = x.GivenName,
                                    Email = x.Email,
                                });

            return Json(query);
        }

        [HttpPost]
        public IActionResult GetOrgByGroup([FromBody]SearchUserOrg search)
        {
            var query = _context.AdOrganizations
                                .Where(x => x.OrgGroup == search.Group)
                                .OrderBy(o => o.OrgName)
                                .Select(x => new
                                {
                                    x.OrgId,
                                    x.OrgAddonCode,
                                    x.OrgCode,
                                    OrgName = string.Format("{0} - {1}", x.OrgCode, x.OrgName)
                                });

            return Json(query);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateUserInOrg([FromBody]OrgUserModel model)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                if (string.IsNullOrEmpty(model.OrgAddonCode))
                {
                    msg.Error = true;
                    msg.Title = string.Format(_stringLocalizer["ERR_REQUIRED"], _stringLocalizer["BRANCH"].Value.ToLower());
                }
                else
                {
                    var org = await _context.AdOrganizations.FirstOrDefaultAsync(x => x.OrgAddonCode == model.OrgAddonCode);
                    if (org == null)
                    {
                        msg.Error = true;
                        msg.Title = model.OrgAddonCode.StartsWith("d_") ? "This is Division, please select branch level!" : "Branch is not exists!";
                    }
                    else
                    {
                        if (model.ListUser.Count > 0)
                        {
                            // Add user to branch
                            var listAdd = _context.Users.Where(x => model.ListUser.Any(y => y == x.Id) && x.BranchId != model.OrgAddonCode);
                            if (listAdd.Any())
                            {
                                foreach (var user in listAdd)
                                {
                                    if (user.BranchId == model.OrgAddonCode) continue;
                                    var oldBranch = user.BranchId;
                                    user.BranchId = model.OrgAddonCode;
                                    user.UpdatedDate = DateTime.Now;
                                    user.UpdatedBy = ESEIM.AppContext.UserName;
                                    _context.Update(user);

                                    //_actionLog.InsertActionLog("ASP_NET_USERS", "Update branch of user: " + user.UserName, oldBranch, model.OrgAddonCode, "Update", false, user.UserName);
                                }
                            }
                            // Remove user out branch
                            var listDel = _context.Users.Where(x => model.ListUser.All(y => y != x.Id) && x.BranchId == model.OrgAddonCode);
                            if (listDel.Any())
                            {
                                foreach (var user in listDel)
                                {
                                    var oldBranch = user.BranchId;
                                    user.BranchId = null;
                                    user.UpdatedDate = DateTime.Now;
                                    user.UpdatedBy = ESEIM.AppContext.UserName;
                                    _context.Update(user);

                                    //_actionLog.InsertActionLog("ASP_NET_USERS", "Update branch of user: " + user.UserName, oldBranch, null, "Update", false, user.UserName);
                                }
                            }
                        }
                        else
                        {
                            var listUser = _context.Users.Where(x => x.BranchId == model.OrgAddonCode);
                            if (listUser.Any())
                            {
                                foreach (var user in listUser)
                                {
                                    var oldBranch = user.BranchId;
                                    user.BranchId = null;
                                    user.UpdatedDate = DateTime.Now;
                                    user.UpdatedBy = ESEIM.AppContext.UserName;
                                    _context.Update(user);

                                    //_actionLog.InsertActionLog("ASP_NET_USERS", "Update branch of user: " + user.UserName, oldBranch, null, "Update", false, user.UserName);
                                }
                            }
                        }

                        await _context.SaveChangesAsync();
                        msg.Title = string.Format(_sharedResources["COM_UPDATE_SUCCESS"], "tài khoản");
                    }
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                //msg.Title = "Lỗi khi cập nhập";
                msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["ADM_BRANCH_TITLE_BRANCH"].Value.ToLower());
                _actionLog.InsertActionLog("ASP_NET_USERS", "Update branch of user failed: " + e.Message, null, null, "Error");
            }

            return Json(msg);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateBranchStatus([FromBody]OrgUserModel model)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var org = await _context.AdOrganizations.FirstOrDefaultAsync(x => x.OrgAddonCode == model.OrgAddonCode);
                if (org == null)
                {
                    msg.Error = true;
                    msg.Title = model.OrgAddonCode.StartsWith("d_") ? _stringLocalizer["ADM_BRANCH_MSG_CHOOSE_BRANCH"] : _stringLocalizer["ADM_BRANCH_MSG_BRANCH_EXITS"];
                }
                else
                {
                    var oldValue = org.IsEnabled;
                    // Update new status
                    org.IsEnabled = model.IsEnabled;
                    _context.Update(org);
                    //_actionLog.InsertActionLog("VIB_ORGANIZATION", $"Update branch '{org.OrgCode} - {org.OrgName}' to {(org.IsEnabled ? "enable" : "disable")}", oldValue, org.IsEnabled, "Update", false, null);

                    await _context.SaveChangesAsync();
                    msg.Title = string.Format($"{_stringLocalizer["ADM_BRANCH_MSG_BRANCH_UPDATE"]} '{org.OrgCode} - {org.OrgName}' {_stringLocalizer["ADM_BRANCH_MSG_UTIL"]} {(org.IsEnabled ? _stringLocalizer["ADM_BRANCH_MSG_OPEN"] : _stringLocalizer["ADM_BRANCH_MSG_CLOSE"])}");
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["ADM_BRANCH_MSG_ERR_BRANCH_UPDATE"];
                _actionLog.InsertActionLog("VIB_ORGANIZATION", "Update branch status failed: " + e.Message, null, null, "Error");
            }

            return Json(msg);
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

    public class SearchUserOrg
    {
        public int Group { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string GroupUser { get; set; }
        public int Page { get; set; } = 1;
        public int Row { get; set; } = 10;
    }

    public class OrgUserModel
    {
        public string OrgAddonCode { get; set; }
        public List<string> ListUser { get; set; }
        public bool IsEnabled { get; set; }
    }

    public class FixedOrderComparer<T> : IComparer<T>
    {
        private readonly T[] fixedOrderItems;

        public FixedOrderComparer(params T[] fixedOrderItems)
        {
            this.fixedOrderItems = fixedOrderItems;
        }

        public int Compare(T x, T y)
        {
            var xIndex = Array.IndexOf(fixedOrderItems, x);
            var yIndex = Array.IndexOf(fixedOrderItems, y);
            xIndex = xIndex == -1 ? int.MaxValue : xIndex;
            yIndex = yIndex == -1 ? int.MaxValue : yIndex;
            return xIndex.CompareTo(yIndex);
        }
    }
}