using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using III.Domain.Enums;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RecruitmentAttributeMainController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<RecruitmentAttributeMainController> _stringLocalizer;
        private readonly IStringLocalizer<MaterialProductController> _productLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelCustom : JTableModel
        {
            public string parentCode { get; set; }
            public string code { get; set; }
            public string name { get; set; }
            public string type { get; set; }
            public string key1 { get; set; }
        }
        public RecruitmentAttributeMainController(EIMDBContext context, IOptions<AppSettings> appSettings, IStringLocalizer<RecruitmentAttributeMainController> stringLocalizer,
            IStringLocalizer<MaterialProductController> productLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _productLocalizer = productLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.RecruitmentAttributeMain", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["RecruitmentAttributeMain"] = _stringLocalizer["RAM_LBL_RAM"];

            return View("Index");
        }

        #region AttributeMain

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CriteriaRecruitmentCats.Where(x => !x.IsDeleted)
                        let chilrens = _context.CriteriaRecruitmentCats.Where(x => !x.IsDeleted && x.Parent.Equals(a.Code)).Select(x => x.Name)
                        where (string.IsNullOrEmpty(jTablePara.code) || a.Code.ToLower().Contains(jTablePara.code.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.name) || a.Name.ToString().ToLower().Contains(jTablePara.name.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.type) || (a.DataType != null && a.DataType.Equals(jTablePara.type)))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            Childrens = string.Join(',', chilrens),
                            Note = a.Note
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Childrens", "Note");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]CriteriaRecruitmentCat obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.CriteriaRecruitmentCats.FirstOrDefault(x => !x.IsDeleted && x.Code == obj.Code);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["RAM_MSG_RAM_CODE_ALREADY_EXIST"]);//"Mã thuộc tính sản phẩm đã tồn tại";
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.CriteriaRecruitmentCats.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_stringLocalizer["RAM_LBL_MGP"]);//"Thêm thuôc tính sản phẩm thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_ADD_ERROR"]); //"Thêm thuôc tính sản phẩm lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Update([FromBody]CriteriaRecruitmentCat obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.CriteriaRecruitmentCats.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.Unit = obj.Unit;
                    item.Group = obj.Group;
                    item.Parent = obj.Parent;
                    item.DataType = obj.DataType;
                    item.Name = obj.Name;
                    item.Note = obj.Note;

                    _context.CriteriaRecruitmentCats.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["RAM_MSG_SAVE_SUCCESS"]); //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["RAM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.CriteriaRecruitmentCats.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var hasChild = _context.CriteriaRecruitmentCats.Any(p => !p.IsDeleted && p.Parent.Equals(data.Code));
                    if (hasChild)
                    {
                        msg.Error = true;
                        msg.Title = "Tiêu chí có tiêu chí con. Xóa tiêu chí con trước";
                        return Json(msg);
                    }
                    else
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = User.Identity.Name;
                        data.DeletedTime = DateTime.Now.Date;
                        _context.CriteriaRecruitmentCats.Update(data);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = String.Format(_stringLocalizer["RAM_MSG_DELETE_SUCCESS"]); //"Xóa thành công!";
                        return Json(msg);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Tiêu chí không tồn tại";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_DELETE_ERROR"]); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItem(int id)
        {
            var item = _context.CriteriaRecruitmentCats.AsNoTracking().Where(m => m.Id == id).Select(x => new { x.Id, x.Code, x.Name, x.Unit, x.DataType, x.Group, x.Note, x.Parent }).FirstOrDefault();
            return Json(item);
        }

        [HttpPost]
        public object GetListParent(string code)
        {
            var item = _context.CriteriaRecruitmentCats.AsNoTracking().Where(m => string.IsNullOrEmpty(m.Parent) && (string.IsNullOrEmpty(code) || !m.Code.Equals(code)) && !m.IsDeleted)
                .Select(x => new { x.Id, x.Code, x.Name, x.Unit, x.DataType, x.Note, x.Parent });
            return Json(item);
        }

        #endregion

        #region AttributeChildren
        [HttpPost]
        public object JTableChildren([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CriteriaRecruitmentCats.Where(x => !x.IsDeleted && x.Parent.Equals(jTablePara.parentCode))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            Note = a.Note
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Note");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertChildren([FromBody]MaterialProductAttributeChildren obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.MaterialProductAttributeChildrens.FirstOrDefault(x => x.Code == obj.Code);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["RAM_MSG_RAM_CODE_ALREADY_EXIST"]);//"Mã thuộc tính sản phẩm đã tồn tại";
                }
                else
                {
                    obj.Id = 0;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.MaterialProductAttributeChildrens.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["RAM_LBL_MGP"]);//"Thêm thuôc tính sản phẩm thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_ADD_ERROR"]); //"Thêm thuôc tính sản phẩm lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object UpdateChildren([FromBody]MaterialProductAttributeChildren obj)
        {
            var msg = new JMessage();
            try
            {
                var item = _context.MaterialProductAttributeChildrens.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (item != null)
                {
                    item.UpdatedBy = User.Identity.Name;
                    item.UpdatedTime = DateTime.Now.Date;
                    item.Name = obj.Name;
                    item.Description = obj.Description;

                    _context.MaterialProductAttributeChildrens.Update(item);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(_stringLocalizer["RAM_MSG_SAVE_SUCCESS"]); //"Đã lưu thay đổi";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["RAM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                }

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_ERROR"]); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object DeleteChildren(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.MaterialProductAttributeChildrens.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = User.Identity.Name;
                data.DeletedTime = DateTime.Now.Date;
                _context.MaterialProductAttributeChildrens.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_DELETE_SUCCESS"]); //"Xóa thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["RAM_MSG_DELETE_ERROR"]); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItemChildren(int id)
        {
            var item = _context.MaterialProductAttributeChildrens.AsNoTracking().Where(m => m.Id == id).Select(x => new { x.Id, x.Code, x.Name, x.Description, x.ParentCode }).FirstOrDefault();
            return Json(item);
        }
        #endregion

        #region Combobox
        [HttpPost]
        public object GetAttrUnit()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrUnit)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetAttrGroup()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrGroup)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpPost]
        public object GetAttrDataType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.AttrDataType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_productLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}
