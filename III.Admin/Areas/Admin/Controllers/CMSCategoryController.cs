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
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSCategoryController : BaseController
    {
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<CMSCategoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class CMSCategorysJtableModel
        {
            public int id { get; set; }
            public string name { get; set; }
            public string alias { get; set; }
            public string description { get; set; }
            public int? parent { get; set; }
            public int? ordering { get; set; }
            public bool? published { get; set; }

        }
        private readonly EIMDBContext _context;
        public CMSCategoryController(EIMDBContext context, IUploadService upload, IStringLocalizer<CMSCategoryController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
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
            public string categoryName { get; set; }
            public bool? published { get; set; }
            public int? extra_field_group { get; set; }
        }

        #region combobox
        [HttpPost]
        public object GetParenCat()
        {
            var data = _context.cms_categories.Select(x => new { Id = x.id, Name = x.name }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetExtraGroup()
        {
            var data = _context.cms_extra_fields_groups.Select(x => new { Id = x.id, Name = x.name }).AsNoTracking().ToList();
            return data;
        }
        [HttpPost]
        public object GetExtraFiled()
        {
            var data = _context.cms_extra_fields_groups.Select(x => new { Id = x.id, Name = x.name }).AsNoTracking().ToList();
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
            var query = from a in _context.cms_categories
                        where (string.IsNullOrEmpty(jTablePara.categoryName) || a.name.ToLower().Contains(jTablePara.categoryName.ToLower()))
                         && ((jTablePara.published == null) || ((jTablePara.published != null) && (a.published.Equals(jTablePara.published))))
                         && ((jTablePara.extra_field_group == null) || ((jTablePara.extra_field_group != null) && (a.extra_fields_group.Equals(jTablePara.extra_field_group))))
                        select new
                        {
                            Id = a.id,
                            name = a.name,
                            alias = a.alias,
                            ordering = a.ordering,
                            published = a.published

                        };

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Id", "name", "alias", "ordering", "published");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult GetTemplate()
        {
            var data = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "CMS_TEMPLATE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            return Json(data);
        }
        [HttpPost]
        public object Insert(cms_categories data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.cms_categories.FirstOrDefault(x => x.name.Equals(data.name));
                if (obj != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMS_CAT_LBL_CATEGORY"]); //danh mục này đã tồn tại trong hệ thống

                }
                else
                {
                    var query = new cms_categories
                    {
                        name = data.name,
                        alias = data.alias,
                        parent = data.parent,
                        published = data.published == null ? false : data.published,
                        template = data.template,
                        ordering = data.ordering,
                        extra_fields_group = data.extra_fields_group,
                        language = data.language,
                        description = data.description,
                        image = "",
                        multiple_language = data.multiple_language
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
                            query.image = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }
                    _context.cms_categories.Add(query);
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
        public object Update(cms_categories data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            {
                try
                {
                    var obj = _context.cms_categories.FirstOrDefault(x => x.id.Equals(data.id));
                    if (obj == null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CMS_CAT_LBL_CATEGORY")); //danh mục không tồn tại trong hệ thống
                    }
                    else
                    {
                        obj.name = data.name;
                        obj.language = data.language;
                        obj.alias = data.alias;
                        obj.extra_fields_group = data.extra_fields_group;
                        obj.ordering = data.ordering;
                        obj.parent = data.parent;
                        obj.template = data.template;
                        obj.published = data.published == null ? false : data.published;
                        obj.description = data.description;
                        obj.multiple_language = data.multiple_language;
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
                                obj.image = "/uploads/Images/" + upload.Object.ToString();
                            }
                        }
                        _context.cms_categories.Update(obj);
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
                var obj = _context.cms_categories.FirstOrDefault(x => x.id.Equals(id));
                if (obj != null)
                {
                    _context.cms_categories.Remove(obj);
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
        public List<CmsTreeView> GetTreeData(int catId = 0)
        {
            //if (obj.IdI == null && obj.IdS == null)
            //{
            //    return null;
            //}

            var data = _context.cms_categories.OrderBy(k => k.ordering).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<CmsTreeView>(), 0, catId);
            return dataOrder;
        }

        private List<CmsTreeView> GetSubTreeData(List<cms_categories> data, int? Parent, List<CmsTreeView> lstCategories, int tab, int rootCatId)
        {
            //tab += "- ";
            var contents = Parent == null
                ? data.Where(x => x.parent == null).OrderBy(k => k.ordering).AsParallel()
                : data.Where(x => x.parent == Parent).OrderBy(k => k.ordering).AsParallel();
            foreach (var item in contents)
            {
                var category = new CmsTreeView
                {
                    Id = item.id,
                    Code = item.name,
                    Title = item.name,
                    ParentId = item.parent,
                    Level = tab,
                    Order = item.ordering,
                    Published = item.published,
                    HasChild = data.Any(x => x.parent == item.id)
                };
                if ((rootCatId != 0 && category.Id == rootCatId && category.Level == 0) || category.Level != 0 || rootCatId == 0)
                {
                    lstCategories.Add(category);

                    if (category.HasChild) GetSubTreeData(data, item.id, lstCategories, tab + 1, rootCatId);
                }
            }
            return lstCategories;
        }
        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var data = _context.cms_categories.FirstOrDefault(x => x.id.Equals(id));
            return Json(data);
        }

        [HttpPost]
        public object Approve(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.cms_categories.FirstOrDefault(x => x.id.Equals(id));
                if (obj != null)
                {
                    obj.published = !obj.published;
                    _context.cms_categories.Update(obj);
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


        #region Language
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetListLanguage()
        {
            var data = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "CMS_LANGUAGE")
                .Select(x => new { Code = x.CodeSet, Name = x.Title }).ToList();
            return Json(data);
        }
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

        public class CmsTreeView : TreeView
        {
            public bool? Published;
        }
    }
}