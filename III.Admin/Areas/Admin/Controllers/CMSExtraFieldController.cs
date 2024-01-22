using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSExtraFieldController : BaseController
    {
        public class CMSExtraFieldsJtableModel :  JTableModel
        {
            public int fieldID { get; set; }
            public string fieldName { get; set; }
            public string value { get; set; }
            public string type { get; set; }
            public int ? groupID { get; set; }
            public string groupName { get; set; }
            public bool? published { get; set; }
            public int? ordering { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSExtraFieldController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSExtraFieldController(EIMDBContext context, IStringLocalizer<CMSExtraFieldController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JTableModelCMSExtraField : JTableModel
        {
            public string name { get; set; }
            public string value { get; set; }
            public string type { get; set; }
            public int? group { get; set; }
            public bool? published { get; set; }
            public int? ordering { get; set; }
        }

        #region combobox
        [HttpPost]
        public object GetActivityType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.AssetActivityType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public object GetExtraFieldGroup()
        {
            var data = _context.cms_extra_fields_groups.Select(x => new { Id = x.id,Name = x.name}).AsNoTracking().ToList();
            return data;
        }

        [HttpPost]
        public object GetUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetAsset()
        {
            var data = _context.Assets.Select(x => new { Code = x.AssetCode, Name = x.AssetName }).AsNoTracking().ToList();
            return data;
        }
        #endregion

        #region action

        [HttpPost]
        public object JTable([FromBody]JTableModelCMSExtraField jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from f in _context.cms_extra_fields join g in _context.cms_extra_fields_groups
                        on f.@group equals g.id
                        where ((string.IsNullOrEmpty(jTablePara.name) || (f.name.ToLower().Contains(jTablePara.name.ToLower()))))
                         && (jTablePara.published == null || f.published == jTablePara.published)
                          && ((jTablePara.@group == null) || (f.@group.Equals(jTablePara.@group)))
                          && ((jTablePara.published == null) || (f.published.Equals(jTablePara.published)))
                         && ((string.IsNullOrEmpty(jTablePara.type) || (f.type.ToLower().Contains(jTablePara.type.ToLower()))))
                         select new CMSExtraFieldsJtableModel
                        {
                            fieldID = f.id,
                            fieldName = f.name,
                            groupName = g.name,
                            type = f.type,
                            ordering = f.ordering,
                            published = f.published
                        }).ToList();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "fieldID", "fieldName", "groupName", "type", "published", "ordering");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var data = _context.cms_extra_fields.FirstOrDefault(x => x.id == id);
            return data;
        }

        //[HttpPost]
        //public JsonResult Insert([FromBody]cms_extra_fields data)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var checkExist = _context.cms_extra_fields.FirstOrDefault(x => x.name.ToLower() == data.name.ToLower());
        //        if (checkExist != null)
        //        {
        //            msg.Error = true;
        //            msg.Title = "{{'CEF_MSG_TITLE_NAME_EF' | translate}}";//"Đã tồn tại tên Extra Field!";
        //        }
        //        else
        //        {
        //            _context.cms_extra_fields.Add(data);
        //            _context.SaveChanges();
        //            msg.Title = "{{'CEF_MSG_ADD_EF_SUCCESS' | translate}}";//"Thêm Extra Field thành công";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "{{'CEF_MSG_ADD_ERR' | translate}}";//"Có lỗi xảy ra khi thêm?";
        //    }
        //    return Json(msg);
        //}
        [HttpPost]
        public JsonResult Insert([FromBody]cms_extra_fields data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.cms_extra_fields.FirstOrDefault(x => x.name.ToLower() == data.name.ToLower());
                if (checkExist == null)
                {
                    data.published = data.published;
                    _context.cms_extra_fields.Add(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_stringLocalizer["CEF_MSG_ADD_EF_SUCCESS"]);//"Thêm Extra Field thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CEF_MSG_TITLE_NAME_EF"]); //"Đã tồn tại tên Extra Field!";
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
        public object Update([FromBody]cms_extra_fields data)
        {
            var msg = new JMessage() { Error = false };
            try
            {              
                _context.cms_extra_fields.Update(data);
                _context.SaveChanges();
                msg.Title = String.Format(_stringLocalizer["CEF_MSG_EDIT_EF_SUCCESS"]);//"Cập nhật Extra Field thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "{{'CEF_MSG_EDIT_ERR' | translate}}";//"Có lỗi xảy ra khi cập nhật!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.cms_extra_fields.FirstOrDefault(x => x.id == id);
                _context.cms_extra_fields.Remove(data);
                _context.SaveChanges();
                //msg.Title = "{{'CEF_MSG_DELETE_SUCCESS' | translate}}";//"Xóa thành công";
                msg.Title = String.Format(_stringLocalizer["CEF_MSG_DELETE_SUCCESS"]);//"Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
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
    }
}