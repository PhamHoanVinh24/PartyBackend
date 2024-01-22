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

// Declare namespace that class will build into
namespace III.Admin.Controllers
{
    // Declare class
    [Area("Admin")]
    public class CompanyRuleController : BaseController // Inherit from class BaseController (Permission, ...)
    {
        // Fields of class
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CompanyRuleController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        // Constructor of class
        public CompanyRuleController(EIMDBContext context, IStringLocalizer<CompanyRuleController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        // Get view for index action
        [Breadcrumb("ViewData.CrumbCompanyRule", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbCompanyRule"] = _sharedResources["COM_CRUMB_COMPANY_RULE"];
            return View();
        }
        #region CompanyRuleItemCRUD
        // Table API include search
        [HttpPost]
        public object JTable([FromBody] CompanyJTableCustom jTablePara)
        {
            try
            {
                // Way 1 using Where
                var data = _context.CompanyRuleItems.Where(x => x.Flag == true
                && (string.IsNullOrEmpty(jTablePara.Item) || x.Item.Contains(jTablePara.Item))
                && (string.IsNullOrEmpty(jTablePara.Description) || x.Description == jTablePara.Description)).Select(
                        x => new
                        {
                            x.Id,
                            x.ItemCode,
                            x.Item,
                            x.Status,
                            x.Description,
                            x.Flag,
                            x.Note
                        });
                // Way 2 use SQL like LINQ syntax
                var data2 = from a in _context.CompanyRuleItems
                            where a.Flag == true
                            && (string.IsNullOrEmpty(jTablePara.Item) || a.Item.Contains(jTablePara.Item)
                            && (string.IsNullOrEmpty(jTablePara.Description) || a.Description == jTablePara.Description))

                            select new
                            {
                                a.Id,
                                a.ItemCode,
                                a.Item,
                                a.Description,
                                a.Flag,
                                a.Note
                            };
                // End
                var count = data.Count();
                var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "ItemCode", "Item", "Description", "Note", "Status", " Flag");
                return Json(jdata);
            }
            catch (Exception)
            {
                var jdata = JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "ItemCode", "Item", "Description", "Note", "Status", " Flag");
                return Json(jdata);
            }
        }
        // Create
        [HttpPost]
        public JsonResult Insert([FromBody] CompanyRuleItem obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.CompanyRuleItems.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (checkExist == null)
                {
                    obj.CreateTime = DateTime.Now;
                    obj.CreateBy = ESEIM.AppContext.UserName;
                    obj.Flag = true;

                    _context.CompanyRuleItems.Add(obj);
                    _context.SaveChanges();
                    msg.Object = obj.Id;
                    msg.Title = _stringLocalizer["COMP_RULE_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["COMP_RULE_EXIST"];
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["COMP_RULE_ERROR"];
            }
            return Json(msg);
        }

        // Update
        [HttpPost]
        public object Update([FromBody] CompanyRuleItem obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.CompanyRuleItems.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdateBy = User.Identity.Name;
                    item.UpdateTime = DateTime.Now.Date;
                    item.Item = obj.Item;
                    item.ItemCode = obj.ItemCode;
                    item.Status = obj.Status;
                    item.Note = obj.Note;

                    _context.CompanyRuleItems.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = _stringLocalizer["COMP_RULE_SUCCESS"]; //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["COMP_RULE_SAVE_ERROR"]; //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["COMP_RULE_ERROR"]; //"Có lỗi xảy ra!";
                return msg;
            }
        }

        // Delete
        [HttpPost]
        public object Delete(int Id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.CompanyRuleItems.FirstOrDefault(x => x.Id == Id);

                _context.CompanyRuleItems.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = _stringLocalizer["COMP_RULE_REMOV_SUCCESS"];
                return Json(msg);


            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["COMP_RULE_REMOV_ERROR"];//Không tìm thấy dịch vụ. Vui lòng làm mới lại trang
                return Json(msg);
            }
        }

        // Read
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.CompanyRuleItems.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    msg.Object = new CompanyRuleItem
                    {
                        Id = obj.Id,
                        ItemCode = obj.ItemCode,
                        Item = obj.Item,
                        Status = obj.Status,
                        Description = obj.Description,
                        Note = obj.Note,

                    };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin ";
                    msg.Title = _stringLocalizer["COMP_RULE_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Combobox
        [HttpPost]
        public JsonResult GetStatusCompanyRule()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("COMPANY_STATUS")) //Trạng Thái
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }
        public JsonResult GetGroupCompanyRule()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("COMPANT_GR")) //Nhóm Hạng Mục
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }
        public JsonResult GetItemCompanyRule()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ITEM_CP")) //Tiêu đề
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);
        }
        public JsonResult GetDescriptionCompanyRule()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("DESCRIP_CP")) //
                        .Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var rs = data;

            return Json(rs);

        }
        #endregion

        #region Model
        // Child class for search API
        public class CompanyJTableCustom : JTableModel
        {
            public string Item { get; set; }
            public string Description { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
        }
        #endregion

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