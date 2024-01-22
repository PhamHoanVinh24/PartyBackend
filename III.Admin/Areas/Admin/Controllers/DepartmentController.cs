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
using System.Globalization;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    //public class UserInGroupModelCustom
    //{
    //    public string Id { set; get; }
    //    public string UName { set; get; }
    //}
    public class JTableDepartmentModelCustom : JTableModel
    {
        public string GroupCode { set; get; }
        public string GroupName { set; get; }
        public bool? Status { set; get; }
    }
    public class DepartmentModel
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
    public class DepartmentController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IStringLocalizer<DepartmentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public DepartmentController(EIMDBContext context, ILogger<DepartmentController> logger, IStringLocalizer<DepartmentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _logger = logger;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbDepartment", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbDepartment"] = _sharedResources["COM_CRUMB_DEPARTMENT"];
            return View();
        }

        // View Tree style
        [HttpPost]
        public object JTable([FromBody]JTableDepartmentModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (!string.IsNullOrEmpty(jTablePara.GroupCode) && !string.IsNullOrEmpty(jTablePara.GroupName))
            {
                var query = from x in _context.AdDepartments.Where(x => !x.IsDeleted)
                            select new DepartmentModel
                            {
                                Id = x.DepartmentId,
                                Title = x.Title,
                                Code = x.DepartmentCode,
                                ParentId = x.ParentCode,
                                CreatedDate = x.CreatedDate,
                                Description = x.Description,
                                IsEnabled = x.IsEnabled,
                                Ord = string.IsNullOrEmpty(x.ParentCode) ? 1 : 2,
                            };

                var query2 = query.OrderBy(o => o.Ord).ThenBy(o => o.Code);
                var count = query2.Count();
                var result = new List<DepartmentModel>();
                foreach (var gUser in query2.Where(x => string.IsNullOrEmpty(x.ParentId)).OrderBy(x => x.Id))
                {
                    var listChild = GetDepartmentChild(query2.AsNoTracking().ToList(), gUser.Code, ". . . ");

                    var groupUser = new DepartmentModel();
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
                var listDepartment = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();

                var jdata = JTableHelper.JObjectTable(listDepartment, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "CreatedDate", "Description", "IsEnabled");
                return Json(jdata);
            }
            else
            {
                var query = _context.AdDepartments
                    .Where(p => (string.IsNullOrEmpty(jTablePara.GroupCode) || p.DepartmentCode.ToLower().Contains(jTablePara.GroupCode))
                             && (string.IsNullOrEmpty(jTablePara.GroupName) || p.Title.ToLower().Contains(jTablePara.GroupName.ToLower()))
                             && (jTablePara.Status == null || p.IsEnabled == jTablePara.Status) && !p.IsDeleted)
                    .OrderBy(x => x.Title)
                    .Select(x => new { Id = x.DepartmentId, x.Title, Code = x.DepartmentCode, x.ParentCode, x.CreatedDate, x.Description, x.IsEnabled })
                    .AsNoTracking();
                var count = query.Count();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "CreatedDate", "Description", "IsEnabled");
                return Json(jdata);
            }
        }
        private static List<DepartmentModel> GetDepartmentChild(IList<DepartmentModel> listDepartment, string parentId, string level)
        {
            var result = new List<DepartmentModel>();
            var query = from gUser in listDepartment
                        where gUser.ParentId == parentId
                        orderby gUser.Title
                        select new DepartmentModel
                        {
                            Id = gUser.Id,
                            Title = gUser.Title,
                            Code = gUser.Code,
                            ParentId = gUser.ParentId,
                            CreatedDate = gUser.CreatedDate,
                            Description = gUser.Description,
                            IsEnabled = gUser.IsEnabled,
                        };

            var listGUser = query as IList<DepartmentModel> ?? query.ToList();
            foreach (var gUser in listGUser)
            {
                var destination = GetDepartmentChild(listDepartment, gUser.Code, ". . . " + level);
                gUser.Title = level + (destination.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + gUser.Title;
                result.Add(gUser);
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }

        [HttpPost]
        public List<TreeViewString> GetTreeData(string id)
        {
            var session = HttpContext.GetSessionUser();
            if (string.IsNullOrEmpty(id) || id == "null")
            {
                var data = _context.AdDepartments.Where(x =>  x.IsEnabled && !x.IsDeleted).OrderBy(x => x.DepartmentId).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewString>(), 0);
                return dataOrder;
            }
            else
            {
                var data = _context.AdDepartments.OrderBy(x => x.DepartmentId).Where(x => (x.DepartmentCode != id && x.ParentCode != id)).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeViewString>(), 0);
                return dataOrder;
            }
        }

        private List<TreeViewString> GetSubTreeData(List<AdDepartment> data, string parentid, List<TreeViewString> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = String.IsNullOrEmpty(parentid)
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.DepartmentId).ToList()
                : data.Where(x => x.ParentCode == parentid).OrderBy(x => x.DepartmentCode).ToList();
            foreach (var item in contents)
            {
                var category = new TreeViewString
                {
                    Code = item.DepartmentCode,
                    Id = item.DepartmentCode,
                    Title = item.Title,
                    Level = tab,
                    ParentCode = item.ParentCode,
                    HasChild = data.Any(x => x.ParentCode == item.DepartmentCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.DepartmentCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]AdDepartment obj)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Insert group user");
            //_actionLog.InsertActionLog("VIB_GROUP_USER", "Insert group user", obj, null,false);
            var msg = new JMessage() { Error = false };
            try
            {
                var gu = _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == obj.DepartmentCode && !x.IsDeleted);
                if (gu == null)
                {
                    obj.CreatedDate = DateTime.Now;
                    _context.AdDepartments.Add(obj);
                    var a = _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"].Value.ToLower());
                    ////_logger.LogInformation(LoggingEvents.LogDb, "Insert group user successfully");
                    //_actionLog.InsertActionLog("VIB_GROUP_USER", "Insert department/PC successfully", null, obj, "Insert");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"].Value.ToLower());
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]AdDepartmentUpdate obj)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Update group user");
            //_actionLog.InsertActionLog("VIB_GROUP_USER", "Update group user", obj, null,false);
            var msg = new JMessage() { Error = false };
            try
            {
                var objUpdate = _context.AdDepartments.SingleOrDefault(x => x.DepartmentId == obj.DepartmentId && !x.IsDeleted);
                var objOld = CommonUtil.Clone(objUpdate);
                _context.Entry(objUpdate).State = EntityState.Unchanged;
                if (objUpdate.DepartmentCode != obj.DepartmentCode)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_CODE_CHANGE"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"].Value.ToLower());
                    //msg.Title = String.Format(_stringLocalizer["ERR_CODE_CHANGE"), _stringLocalizer["GROUP_USERS").ToLower());
                    //_logger.LogError(LoggingEvents.LogDb, "Update group user fail");
                    //_actionLog.InsertActionLog("VIB_GROUP_USER", "Update department/PC fail", null, null, "Update");
                }
                else
                {
                    objUpdate.Title = obj.Title;
                    objUpdate.ParentCode = obj.ParentCode;
                    objUpdate.Description = obj.Description;
                    objUpdate.IsEnabled = obj.IsEnabled;
                    objUpdate.UpdatedDate = DateTime.Now;

                    var a = _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"].Value.ToLower());
                    //msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"), _stringLocalizer["GROUP_USERS").ToLower());
                    ////_logger.LogInformation(LoggingEvents.LogDb, "Update group user successfully");
                    //_actionLog.InsertActionLog("VIB_GROUP_USER", "Update department/PC successfully", objOld, obj, "Update");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"].Value.ToLower());
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(_stringLocalizer["MSG_UPDATE_FAIL"), _stringLocalizer["GROUP_USERS").ToLower());
                //_logger.LogError(LoggingEvents.LogDb, "Update group user fail");
                //_actionLog.InsertActionLog("VIB_GROUP_USER", "Update department/PC failed: " + ex.Message, null, null, "Update");
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(string id)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Delete group user");
            //_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete group user", null, null,false);
            try
            {
                var objChild = _context.AdDepartments.SingleOrDefault(x => x.ParentCode == id);
                if (objChild == null)
                {
                    var obj = _context.AdDepartments.FirstOrDefault(x => x.DepartmentId == Int32.Parse(id));
                    //_context.AdDepartments.Remove(obj);
                    obj.IsDeleted = true;
                    obj.DeletedBy = ESEIM.AppContext.UserName;
                    obj.DeletedTime = DateTime.Now;
                    _context.SaveChanges();
                    ////_logger.LogInformation(LoggingEvents.LogDb, "Delete group user successfully");
                    //_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC successfully", obj, null, "Delete");
                    return Json(new JMessage() { Error = false, Title = _stringLocalizer["ADM_DEPARTMENT_MSG_DELETE_SUCCESS"] });
                }
                else
                {
                    //_logger.LogError(LoggingEvents.LogDb, "Delete group user fail");
                    //_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC fail", null, null, "Error");

                    return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_CHILD"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"]) });
                }
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete group user fail");
                //_actionLog.InsertActionLog("VIB_GROUP_USER", "Delete department/PC failed: " + ex.Message, null, null, "Error");

                //return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["ADM_DEPARTMENT_LBL_DEPT"].Value.ToLower()) });
                return Json(new JMessage() { Error = true, Title = _sharedResources["COM_MSG_ERR"] });
            }
        }

        [HttpPost]
        public async Task<JsonResult> GetItem(int? id)
        {
            var query = await _context.AdDepartments
                                        .Where(m => m.DepartmentId == id)
                                        .Select(x => new
                                        {
                                            DepartmentId = x.DepartmentId,
                                            DepartmentCode = x.DepartmentCode,
                                            Title = x.Title,
                                            Description = x.Description,
                                            ParentCode = x.ParentCode,
                                            IsEnabled = x.IsEnabled,
                                            ParentName = x.ParentCode == null ? "" : string.Format("{0} - {1}", x.ParentCode, x.Parent.Title),
                                        }).FirstOrDefaultAsync();
            return Json(query);
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

        public class AdDepartmentUpdate
        {

            public int DepartmentId { get; set; }


            public string DepartmentCode { get; set; }

            public string ParentCode { get; set; }

            public string Title { get; set; }

            public string Description { get; set; }

            public DateTime? CreatedDate { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? UpdatedDate { get; set; }
            public string UpdatedBy { get; set; }
            public bool IsEnabled { get; set; }
            public string Leader { get; set; }
        }

        #region
        public class JTableModelCustom : JTableModel
        {
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Permanentresidence { get; set; }
            public string EmployeeType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? EmployeeId { get; set; }
            public string Unit { get; set; }
            public string Position { get; set; }
            public string DepartmentCode { get; set; }
        }
        [HttpPost]
        public object JTableHrEmp([FromBody]JTableModelCustom jTablePara)
        {
            //var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            //var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.HREmployees
                         join b in _context.Roles on a.position equals b.Id into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.AdGroupUsers on a.unit equals c.GroupUserCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         where a.flag == 1 && a.unit.Equals(jTablePara.DepartmentCode)
                         //&& (string.IsNullOrEmpty(jTablePara.FullName) || a.fullname.ToLower().Contains(jTablePara.FullName.ToLower()))
                         //&& (string.IsNullOrEmpty(jTablePara.Phone) || a.phone.ToLower().Contains(jTablePara.Phone.ToLower()))
                         //&& (string.IsNullOrEmpty(jTablePara.Permanentresidence) || a.permanentresidence.ToLower().Contains(jTablePara.Permanentresidence.ToLower()))
                         //&& (string.IsNullOrEmpty(jTablePara.EmployeeType) || a.employeetype.Equals(jTablePara.EmployeeType))
                         //&& (string.IsNullOrEmpty(jTablePara.Unit) || a.unit.Equals(jTablePara.Unit))
                         //&& (string.IsNullOrEmpty(jTablePara.Position) || a.position.Equals(jTablePara.Position))
                         //&& ((fromDate == null || (a.createtime >= fromDate)) && (toDate == null || (a.createtime <= toDate)))
                         select new
                         {
                             a.Id,
                             a.fullname,
                             a.gender,
                             a.phone,
                             a.permanentresidence,
                             a.employeetype,
                             a.picture,
                             a.birthofplace,
                             a.unit,
                             a.position,
                             unitName = c2.Title,
                             positionName = b2.Title,
                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).OrderBy(x => x.position).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.fullname,
                x.gender,
                x.phone,
                x.permanentresidence,
                employeetype = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.employeetype).ValueSet ?? "",
                x.picture,
                x.birthofplace,
                x.unit,
                x.position,
                x.unitName,
                x.positionName
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "fullname", "gender", "phone", "picture", "permanentresidence", "employeetype", "unit", "position", "unitName", "positionName");
            return Json(jdata);
        }
        #endregion
    }
}