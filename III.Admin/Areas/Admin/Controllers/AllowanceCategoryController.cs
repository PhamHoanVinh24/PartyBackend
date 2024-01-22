using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AllowanceCategoryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<AllowanceCategoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public class JTableModelCustom : JTableModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        public AllowanceCategoryController(EIMDBContext context, IStringLocalizer<AllowanceCategoryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        #region Combobox
        [HttpPost]
        public object GetListAllowanceGroup()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ALLOWANCE_GROUP")).Select(p => new { Code = p.CodeSet, Name = p.ValueSet });
            return Json(data);
        }
        #endregion

        [Breadcrumb("ViewData.CrumbAllowanceCate", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbAllowanceCate"] = _sharedResources["COM_CRUMB_ALLOWANCE_CATEGORY"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var count = (from a in _context.AllowanceCategorys.Where(x => !x.IsDeleted)
                         where (string.IsNullOrEmpty(jTablePara.Code) || a.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                         select a).AsNoTracking().Count();
            var query = (from a in _context.AllowanceCategorys.Where(x => !x.IsDeleted)
                         join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Group equals b.CodeSet into b1
                         from b2 in b1.DefaultIfEmpty()
                         where (string.IsNullOrEmpty(jTablePara.Code) || a.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                         select new
                         {
                             a.ID,
                             a.Code,
                             a.Name,
                             a.Note,
                             a.ExcelColumn,
                             a.Expression,
                             Group = b2 != null ? b2.ValueSet : ""
                         });

            var data = query
               .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "Code", "Name", "Note", "ExcelColumn", "Expression", "Group");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]AllowanceCategory obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.AllowanceCategorys.FirstOrDefault(x => x.Code.Equals(obj.Code));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.AllowanceCategorys.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ALC_TITLE_ALLOWANCE_CAT"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ALC_CURE_LBL_CODE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["ALC_TITLE_ALLOWANCE_CAT"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]AllowanceCategory obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AllowanceCategorys.Where(x => x.Code.Equals(obj.Code)).FirstOrDefault();
                if (data != null)
                {
                    data.Name = obj.Name;
                    data.Note = obj.Note;
                    data.Group = obj.Group;
                    data.ExcelColumn = obj.ExcelColumn;
                    data.Expression = obj.Expression;
                    data.Base = obj.Base;
                    if (obj.Base)
                        data.DefaultValue = obj.DefaultValue;
                    data.Expression = obj.Expression;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.AllowanceCategorys.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ALC_TITLE_ALLOWANCE_CAT"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ALC_MSG_ALLOWANCE_CAT_CODE_NO_EXIST"];
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
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.AllowanceCategorys.FirstOrDefault(x => x.ID == Id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.AllowanceCategorys.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ALC_TITLE_ALLOWANCE_CAT"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ALC_MSG_NOT_FIND_ALLOWANCE_CAT"];//Không tìm thấy danh mục phụ cấp. Vui lòng làm mới lại trang
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        public object GetItem(int id)
        {
            var data = _context.AllowanceCategorys.AsNoTracking().Single(m => m.ID == id);
            return Json(data);
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