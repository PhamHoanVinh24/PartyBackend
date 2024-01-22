using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WorkflowActivityRoleController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public WorkflowActivityRoleController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody] JtableModlActivityRole jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted)
                        join b in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BranchCode equals b.OrgAddonCode
                        join c in _context.AdDepartments.Where(x => x.IsEnabled && !x.IsEnabled) on a.DepartCode equals c.DepartmentCode
                        join d in _context.Roles on a.Role equals d.Id
                        join f in _context.CatActivitys on a.ActCode equals f.ActCode
                        join e in _context.CatWorkFlows.Where(x => !x.IsDeleted) on a.WorkFlowCode equals e.WorkFlowCode
                        where (string.IsNullOrEmpty(jTablePara.WorkFlowCode) || a.WorkFlowCode.ToLower().Equals(jTablePara.WorkFlowCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.BranchCode) || a.BranchCode.ToLower().Equals(jTablePara.BranchCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.DepartCode) || a.DepartCode.ToLower().Equals(jTablePara.DepartCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Role) || a.Role.ToLower().Equals(jTablePara.Role.ToLower()))
                        select new
                        {
                            WorkFlowName = e.Name,
                            ActName = f.ActName,
                            DepartmentName = c.Title,
                            BranchName = b.OrgName,
                            Role = d.Title,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "WorkFlowName", "ActName", "DepartmentName", "BranchName", "Role");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetListWorkFlow(string objCode)
        {
            var query = from a in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted)
                        join b in _context.AdOrganizations.Where(x => x.IsEnabled) on a.BranchCode equals b.OrgAddonCode
                        join c in _context.AdDepartments.Where(x => x.IsEnabled && !x.IsEnabled) on a.DepartCode equals c.DepartmentCode
                        join d in _context.Roles on a.Role equals d.Id
                        join f in _context.CatActivitys on a.ActCode equals f.ActCode
                        join e in _context.CatWorkFlows.Where(x => !x.IsDeleted && x.WorkFlowCode == objCode) on a.WorkFlowCode equals e.WorkFlowCode
                        select new
                        {
                            WorkFlowName = e.Name,
                            ActName = f.ActName,
                            DepartmentName = c.Title,
                            BranchName = b.OrgName,
                            Role = d.Title,
                        };
            return Json(query);
        }

        [HttpPost]
        public JsonResult GetAttrWorkFlow()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "WORKFLOW_ACTIVITY" && !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetWorkFlow()
        {
            var data = _context.CatWorkFlows.Where(x => !x.IsDeleted).Select(x => new { Code = x.WorkFlowCode, Name = x.Name });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetRoles()
        {
            var data = _context.Roles.Select(x => new { Code = x.Code, Name = x.Title });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetDepartment()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetActivity()
        {
            var data = _context.CatActivitys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ActCode, Name = x.ActName });
            return Json(data);
        }


        [HttpPost]
        public JsonResult InsertWorkflowActRole([FromBody] WorkflowActivityRole obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WorkflowActivityRoles.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode == obj.WorkFlowCode && x.ActCode == obj.ActCode);
                if(check == null)
                {
                    var workFlowActivityRole = new WorkflowActivityRole
                    {
                        WorkFlowCode = obj.WorkFlowCode,
                        ActCode = obj.ActCode,
                        BranchCode = obj.BranchCode,
                        DepartCode = obj.DepartCode,
                        Role = obj.Role,
                        WorkFlowProperty = obj.WorkFlowProperty,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WorkflowActivityRoles.Add(workFlowActivityRole);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại luồng và hoạt động";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult UpdateWorkflowActRole([FromBody] WorkflowActivityRole obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkflowActivityRoles.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode == obj.WorkFlowCode && x.ActCode == obj.ActCode);
                if (data != null)
                {
                    data.BranchCode = obj.BranchCode;
                    data.DepartCode = obj.DepartCode;
                    data.Role = obj.Role;
                    data.WorkFlowProperty = obj.WorkFlowProperty;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                         
                    _context.WorkflowActivityRoles.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại luồng và hoạt động";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteWorkflowActRole(int id)
        {
            var msg = new JMessage();
            var data = _context.WorkflowActivityRoles.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if(data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.WorkflowActivityRoles.Update(data);
                _context.SaveChanges();
                msg.Title = "Xóa thành công";
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy luồng và hoạt động";
            }
            return Json(msg);
        }
        public class JtableModlActivityRole : JTableModel
        {
            public string WorkFlowCode { get; set; }
            public string BranchCode { get; set; }
            public string DepartCode { get; set; }
            public string Role { get; set; }
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
}