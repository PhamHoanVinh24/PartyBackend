using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Utils;
using ESEIM.Models;
using FTU.Utils.HelperNet;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.Drawing;
using System.Drawing.Imaging;
using III.Domain.Enums;
using System.Net;
using System.ComponentModel.DataAnnotations;
using Syncfusion.DocIO;
using Aspose.Pdf;
using Aspose.Pdf.Text;
using Aspose.Pdf.Annotations;
using Syncfusion.XlsIO;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssignAllowanceController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AssignAllowanceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AssignAllowanceController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<AssignAllowanceController> stringLocalizer, IStringLocalizer<ContractController> contractController, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbAssignAllowance", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbAssignAllowance"] = _sharedResources["COM_CRUMB_ASSIGN_ALLOWANCE"];
            return View();
        }

        #region Allowance
        public class JtableAllowance : JTableModel
        {
            public string Department { get; set; }
        }

        [HttpPost]
        public List<TreeViewResource> GetTreeCategory()
        {
            var listOrg = _context.AdOrganizations.Where(x => x.IsEnabled);
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).OrderByDescending(x => x.DepartmentId).AsNoTracking();
            var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 1);

            var listTreeData = new List<TreeViewResource>();

            foreach (var item in listOrg)
            {
                var category = new TreeViewResource
                {
                    Id = item.OrgId,
                    Code = item.OrgCode,
                    Title = item.OrgName,
                    Level = 0,
                    HasChild = string.IsNullOrEmpty(item.DepartmentCode) ? false : true,
                    ParentCode = "#",
                };

                var arrDepartment = item.DepartmentCode.Split(",", StringSplitOptions.None);
                var lstDepartment = (from a in dataOrder
                                     join b in arrDepartment on a.Code equals b
                                     select new TreeViewResource
                                     {
                                         Id = a.Id,
                                         Code = a.Code,
                                         Title = a.Title,
                                         Level = a.Level,
                                         HasChild = string.IsNullOrEmpty(item.DepartmentCode) ? false : true,
                                         ParentCode = string.IsNullOrEmpty(a.ParentCode) ? item.OrgCode : a.ParentCode,
                                     }).ToList();
                listTreeData.Add(category);
                listTreeData.AddRange(lstDepartment);
            }

            if (listOrg.Count() == 0)
            {
                dataOrder.Where(x => string.IsNullOrEmpty(x.ParentCode)).ToList().ForEach(p => p.ParentCode = "#");
                listTreeData = dataOrder;
            }

            return listTreeData;
        }

        [NonAction]
        private List<TreeViewResource> GetSubTreeCategoryData(List<AdDepartment> data, string parentCode, List<TreeViewResource> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentCode)
                ? data.Where(x => string.IsNullOrEmpty(x.ParentCode)).OrderBy(x => x.DepartmentId).AsParallel()
                : data.Where(x => x.ParentCode == parentCode).OrderBy(x => x.DepartmentId).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.DepartmentId,
                    Code = item.DepartmentCode,
                    Title = item.Title,
                    Level = tab,
                    HasChild = data.Any(x => !string.IsNullOrEmpty(x.ParentCode) && x.ParentCode == item.DepartmentCode),
                    ParentCode = item.ParentCode,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeCategoryData(data, item.DepartmentCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpGet]
        public object GetEmployee(string Department, string Type)
        {
            var listEmployee = _context.HREmployees.Where(x => x.flag == 1 && (string.IsNullOrEmpty(Type) || (!string.IsNullOrEmpty(x.employeetype) && Type.Split(",", StringSplitOptions.None).Any(p => p.Equals(x.employeetype)))) && Department.Split(",", StringSplitOptions.None).Any(p => p.Equals(x.unit))).Select(p => new { ID = p.Id, Code = p.Id, Name = p.fullname, Department = p.unit, IsCheck = true });
            return Json(listEmployee);
        }

        [HttpPost]
        public object GetListAllowance()
        {
            var data = _context.AllowanceCategorys.Where(x => !x.IsDeleted).Select(p => new { p.Code, p.Name, IsCheck = true });
            return Json(data);
        }

        [HttpPost]
        public object GetListParam()
        {
            var data = _context.AllowanceParams.Where(x => !x.IsDeleted).Select(p => new { p.Code, p.Name });
            return Json(data);
        }

        [HttpPost]
        public object Setting([FromBody] List<AssignAllowanceModel> listData)
        {
            var msg = new JMessage();
            try
            {
                foreach (var item in listData)
                {
                    var obj = new AllowanceEmployeeAccept
                    {
                        EmployeeId = item.EmployeeCode,
                        AllowanceCatCode = item.AllowanceCode,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now
                    };

                    var check = _context.AllowanceEmployeeAccepts.Any(x => x.AllowanceCatCode.Equals(item.AllowanceCode) && x.EmployeeId.Equals(item.EmployeeCode));
                    if (!check)
                        _context.AllowanceEmployeeAccepts.Add(obj);
                }

                _context.SaveChanges();

                msg.Title = "Thiết lập thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thiết lập thất bại";
            }

            return Json(msg);
        }

        [HttpPost]
        public object JTableSettingParam([FromBody]JtableSettingParam jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var count = (from a in _context.AllowanceEmployeeParams.Where(x => !x.IsDeleted)
                         where a.EmployeeId.Equals(jTablePara.EmployeeId)
                         select a).AsNoTracking().Count();
            var query = (from a in _context.AllowanceEmployeeParams.Where(x => !x.IsDeleted)
                         join b in _context.AllowanceParams.Where(x => !x.IsDeleted) on a.ParamCode equals b.Code into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.HREmployees.Where(x => x.flag == 1) on a.EmployeeId equals c.Id.ToString() into c1
                         from c2 in c1.DefaultIfEmpty()
                         where a.EmployeeId.Equals(jTablePara.EmployeeId)
                         select new
                         {
                             a.ID,
                             a.EmployeeId,
                             Month = a.Month.ToString("MM/yyyy"),
                             a.Value,
                             a.ParamCode,
                             ParamName = b2 != null ? b2.Name : "",
                             EmployeeName = c2 != null ? c2.fullname : ""
                         });

            var data = query
               .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "EmployeeId", "Month", "Value", "ParamCode", "ParamName", "EmployeeName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertSettingParam([FromBody]AllowanceEmployeeParam obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                DateTime month = !string.IsNullOrEmpty(obj.Months) ? DateTime.ParseExact(obj.Months, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

                var checkExist = _context.AllowanceEmployeeParams.FirstOrDefault(x => !x.IsDeleted && x.EmployeeId.Equals(obj.EmployeeId) && x.ParamCode.Equals(obj.ParamCode) && x.Month.Month.Equals(month.Month) && x.Month.Year.Equals(month.Year));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    obj.Month = month;
                    _context.AllowanceEmployeeParams.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["Thiết lập"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["Thiết lập"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["Thiết lập"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateSettingParam([FromBody]AllowanceEmployeeParam obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                DateTime month = !string.IsNullOrEmpty(obj.Months) ? DateTime.ParseExact(obj.Months, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

                var data = _context.AllowanceEmployeeParams.FirstOrDefault(x => !x.IsDeleted && x.EmployeeId.Equals(obj.EmployeeId) 
                    && x.ParamCode.Equals(obj.ParamCode) && x.Month.Month.Equals(month.Month) && x.Month.Year.Equals(month.Year));
                if (data != null)
                {
                    data.Value = obj.Value;
                    data.Month = month;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.AllowanceEmployeeParams.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["Thiết lập"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASA_MSG_ALLOWANCE_CAT_CODE_NO_EXIST"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteSettingParam(int Id)
        {
            var msg = new JMessage { };
            try
            {
                var data = _context.AllowanceEmployeeParams.FirstOrDefault(x => !x.IsDeleted && x.ID == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.AllowanceEmployeeParams.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["Thiết lập"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Không tìm thấy thiết lập"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }

            return Json(msg);
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class AssignAllowanceModel
        {
            public string EmployeeCode { get; set; }
            public string AllowanceCode { get; set; }
        }

        public class JtableSettingParam : JTableModel
        {
            public string EmployeeId { get; set; }
        }
    }
}
