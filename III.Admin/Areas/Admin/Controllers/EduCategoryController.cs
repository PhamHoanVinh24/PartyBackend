using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EduCategoryController : BaseController
    {
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<EduCategoryController> _stringLocalizer;
        private readonly IStringLocalizer<CMSItemController> _cmsItemLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class CMSCategorysJtableModel
        {
            public int id { get; set; }
            public string name { get; set; }
            public string Alias { get; set; }
            public string Description { get; set; }
            public int? Parent { get; set; }
            public int? Ordering { get; set; }
            public bool? Published { get; set; }

        }
        private readonly EIMDBContext _context;
        public EduCategoryController(EIMDBContext context, IUploadService upload, IStringLocalizer<EduCategoryController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CMSItemController> cmsItemLocalizer)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _cmsItemLocalizer = cmsItemLocalizer;
        }
        [Breadcrumb("ViewData.CrumbCmsCat", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsCat"] = _sharedResources["COM_CRUMB_CMS_CAT"];
            return View();
        }

        public class CMSCategoryJTableModel : JTableModel
        {
            public string CategoryName { get; set; }
            public bool? Published { get; set; }
            public int? ExtraFieldGroup { get; set; }
        }

        #region combobox
        [HttpPost]
        public object GetParenCat()
        {
            var data = _context.EduCategorys.Select(x => new { Id = x.Id, Name = x.Name }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetExtraGroup()
        {
            var data = _context.EduExtraFieldGroups.Where(x => x.Group.Equals("CATEGORY")).Select(x => new { Id = x.Id, Name = x.Name }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetExtraFiled()
        {
            var data = _context.EduExtraFieldGroups.Where(x => x.Group.Equals("CATEGORY")).Select(x => new { Id = x.Id, Name = x.Name }).AsNoTracking().ToList();
            return data;
        }
        #endregion
        public class Properties
        {
            public string Code { get; set; }
            public string Name { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]CMSCategoryJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EduCategorys
                        join b in _context.EduExtraFieldGroups on a.ExtraFieldsGroup equals b.Id into b1
                        from b in b1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.CategoryName) || a.Name.ToLower().Contains(jTablePara.CategoryName.ToLower()))
                         && ((jTablePara.Published == null) || ((jTablePara.Published != null) && (a.Published.Equals(jTablePara.Published))))
                         && ((jTablePara.ExtraFieldGroup == null) || ((jTablePara.ExtraFieldGroup != null) && (a.ExtraFieldsGroup.Equals(jTablePara.ExtraFieldGroup))))
                        select new
                        {
                            Id = a.Id,
                            Name = a.Name,
                            Alias = a.Alias,
                            Ordering = a.Ordering,
                            Published = a.Published,
                            Group = b != null ? b.Name : ""
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "Name", "Alias", "Ordering", "Published", "Group");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult GetTemplate()
        {
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "CMS_CATEGORY").Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            return Json(data);
        }
        [HttpPost]
        public object Insert(EduCategory data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.EduCategorys.FirstOrDefault(x => x.Name.Equals(data.Name));
                if (obj != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMS_CAT_LBL_CATEGORY"]); //danh mục này đã tồn tại trong hệ thống

                }
                else
                {
                    var query = new EduCategory
                    {
                        Name = data.Name,
                        Alias = data.Alias,
                        Parent = data.Parent,
                        Published = data.Published == null ? false : data.Published,
                        Template = data.Template,
                        Ordering = data.Ordering,
                        ExtraFieldsGroup = data.ExtraFieldsGroup,
                        Language = data.Language,
                        Description = data.Description,
                        Image = "",
                    };
                    if (images != null)
                    {
                        var upload = _upload.UploadImage(images);
                        if (upload.Error)
                        {
                            msg.Error = true;
                            msg.Title = upload.Title;
                            return Json(msg);
                        }
                        else
                        {
                            query.Image = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }
                    _context.EduCategorys.Add(query);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];   //Thêm mới thành công

                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"]; //Có lỗi xảy ra khi thêm
                return Json(msg);
            }

        }
        [HttpPost]
        public object Update(EduCategory data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            {
                try
                {
                    var obj = _context.EduCategorys.FirstOrDefault(x => x.Id.Equals(data.Id));
                    if (obj == null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CMS_CAT_LBL_CATEGORY")); //danh mục không tồn tại trong hệ thống
                    }
                    else
                    {
                        obj.Name = data.Name;
                        obj.Language = data.Language;
                        obj.Alias = data.Alias;
                        obj.ExtraFieldsGroup = data.ExtraFieldsGroup;
                        obj.Ordering = data.Ordering;
                        obj.Parent = data.Parent;
                        obj.Template = data.Template;
                        obj.Published = data.Published == null ? false : data.Published;
                        obj.Description = data.Description;
                        if (images != null)
                        {
                            var upload = _upload.UploadImage(images);
                            if (upload.Error)
                            {
                                msg.Error = true;
                                msg.Title = upload.Title;
                                return Json(msg);
                            }
                            else
                            {
                                obj.Image = "/uploads/Images/" + upload.Object.ToString();
                            }
                        }
                        _context.EduCategorys.Update(obj);
                        _context.SaveChanges();
                        // msg.Title = String.Format(CommonUtil.ResourceValue("Cập nhật danh mục thành công")); //Cập nhật thành công
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CMS_CAT_LBL_CATEGORY"]);
                    }
                    return Json(msg);

                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    return Json(msg);
                }

            }

        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.EduCategorys.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    _context.EduCategorys.Remove(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"]; //Xóa danh mục thành công
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["CMS_CAT_LBL_CATEGORY"]); //danh mục không tồn tại trong hệ thống

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }

        }
        [HttpPost]
        public List<TreeView> GetTreeData()
        {
            var data = _context.EduCategorys.OrderBy(x => x.Name).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetSubTreeData(List<EduCategory> data, int? Parent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = Parent == null
                ? data.Where(x => x.Parent == null).OrderBy(x => x.Name).AsParallel()
                : data.Where(x => x.Parent == Parent).OrderBy(x => x.Name).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.Name,
                    Title = item.Name,
                    ParentId = item.Parent,
                    Level = tab,
                    HasChild = data.Any(x => x.Parent == item.Id)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.Id, lstCategories, tab + 1);
            }
            return lstCategories;
        }
        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var data = _context.EduCategorys.FirstOrDefault(x => x.Id.Equals(id));
            return Json(data);
        }

        [HttpPost]
        public object Approve(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.EduCategorys.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    obj.Published = !obj.Published;
                    _context.EduCategorys.Update(obj);
                    _context.SaveChanges();
                    msg.Title = "Thay đổi trạng thái thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Danh mục không tồn tại trong hệ thống";

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }

        #region CommonSettingCategory
        [HttpPost]
        public object JTableCSC([FromBody] CSCJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CommonSettingCategories
                        where (!a.IsDeleted && a.CategoryCode.Equals(jTablePara.CategoryCode))
                        select new
                        {
                            a.SettingID,
                            a.ValueSet,
                            a.CodeSet,
                            a.Group,
                            a.GroupNote,
                            a.Title,
                            a.CategoryCode,
                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "SettingID", "ValueSet", "CodeSet", "Group", "Title", "GroupNote", "CategoryCode");
            return Json(jdata);
        }

        [HttpPost]
        public object InsertCSC([FromBody] CommonSettingCategoryModel data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.CommonSettingCategories.FirstOrDefault(x => x.CodeSet.Equals(data.CodeSet) && x.CategoryCode.Equals(data.CategoryCode));

                if (model == null)
                {
                    var obj = new CommonSettingCategory
                    {
                        CodeSet = data.CodeSet,
                        ValueSet = data.ValueSet,
                        Group = data.Group,
                        Priority = data.Priority,
                        Type = data.Type,
                        GroupNote = data.GroupNote,
                        CategoryCode = data.CategoryCode,
                        Title = data.Title,
                        CreatedTime = DateTime.Now,
                        CreatedBy = ESEIM.AppContext.UserName,
                    };

                    _context.CommonSettingCategories.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    //msg.Title = _cmsItemLocalizer["CMS_ITEM_MSG_ADD_SUCCESS"];
                    msg.ID = obj.SettingID;
                }
                else
                {
                    msg.Title = "Thuộc tính đã tồn tại";
                    //msg.Title = _cmsItemLocalizer["CMS_ITEM_MSG_EXITS"];
                    msg.Error = true;
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }
        public object GetItemCSC([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.CommonSettingCategories.FirstOrDefault(x => x.SettingID == id);
            if (data != null)
            {
                msg.Object = data;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateCSC([FromBody] CommonSettingCategoryModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettingCategories.FirstOrDefault(x => x.SettingID == obj.SettingID);
                if (data != null)
                {
                    data.UpdatedTime = DateTime.Now.Date;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.CodeSet = obj.CodeSet;
                    data.ValueSet = obj.ValueSet;
                    data.GroupNote = obj.GroupNote;
                    data.Group = obj.Group;
                    data.Priority = obj.Priority;
                    data.Type = obj.Type;
                    data.CategoryCode = obj.CategoryCode;
                    data.Title = obj.Title;
                    _context.CommonSettingCategories.Update(data);
                    _context.SaveChanges();
                    msg.Title = _cmsItemLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Item not existed";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteCSC(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettingCategories.FirstOrDefault(x => x.SettingID == Id);
                data.DeletedTime = DateTime.Now.Date;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.IsDeleted = true;

                _context.CommonSettingCategories.Update(data);
                _context.SaveChanges();
                msg.Title = _cmsItemLocalizer["CMS_ITEM_MSG_DELETE_EXT_ARC_SUCCESS"];
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #region Model
        public class CSCJTableModel : JTableModel
        {
            public int SettingID { get; set; }
            public string CodeSet { get; set; }
            public string CategoryCode { get; set; }
            public string ValueSet { get; set; }
            public string Group { get; set; }
            public int Priority { get; set; }
            public int Id { get; set; }
            public string Logo { get; set; }
            public string GroupNote { get; set; }
            public bool IsDeleted { get; set; }
            public string Type { get; set; }
            public string alias { get; set; }
        }

        public class CommonSettingCategoryModel : JTableModel
        {
            public int SettingID { get; set; }
            public string CodeSet { get; set; }
            public string CategoryCode { get; set; }
            public string ValueSet { get; set; }
            public string Group { get; set; }
            public int Priority { get; set; }
            public int Id { get; set; }
            public string Logo { get; set; }
            public string Title { get; set; }
            public string GroupNote { get; set; }
            public bool IsDeleted { get; set; }
            public string Type { get; set; }
            public string alias { get; set; }
        }
        #endregion
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_cmsItemLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })).DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}