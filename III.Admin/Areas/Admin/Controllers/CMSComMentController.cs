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
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSComMentController : BaseController
    {
        public class ComMentsJtableModel
        {
            public int id { get; set; }
            public string comment_title { get; set; }
            public string comment_text { get; set; }
            public string user_name { get; set; }
            public string comment_email { get; set; }
            public bool? published { get; set; }
            
        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSComMentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSComMentController(EIMDBContext context, IStringLocalizer<CMSComMentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.CrumbCmsComment", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsComment"] = _sharedResources["COM_CRUMB_CMS_COMMENT"];
            return View();
        }

        public class JTableModelCM : JTableModel
        {
            public string comment_title { get; set; }
            public bool? published { get; set; }

        }

        #region combobox
        ////[HttpPost]
        ////public object GetActivityType()
        ////{
        ////    var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.CMSComMentType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        ////    return data;
        ////}
        [HttpPost]
        public object GetPublished()
        {
            var data = _context.cms_comments.Select(x => new { Published = x.published }).AsNoTracking().ToList();
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
        public object Publish(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.cms_comments.FirstOrDefault(x => x.id.Equals(id));
                if (obj != null)
                {
                    obj.published = !obj.published;
                    _context.cms_comments.Update(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("Thay đổi trạng thái thành công"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Comment không tồn tại")); //danh mục không tồn tại trong hệ thống

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi xảy ra khi thay đổi trạng thái")); // có lỗi khi xóa
                return Json(msg);
            }
        }

        #region action

        [HttpPost]
        public object JTable([FromBody]JTableModelCM jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = (from a in _context.cms_comments                        
                         where ((string.IsNullOrEmpty(jTablePara.comment_title) || (a.comment_title.ToLower().Contains(jTablePara.comment_title.ToLower()))))
                         && (jTablePara.published == null || a.published == jTablePara.published)
                         select new ComMentsJtableModel
                         {
                             id = a.id,
                             comment_title = a.comment_title,
                             comment_text = a.comment_text,
                             user_name = a.user_name,
                             comment_email = a.comment_email,
                             published = a.published
                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id", "comment_title", "comment_text", "user_name", "comment_email", "published");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
            return data;
        }

        //[HttpPost]
        //public JsonResult Insert([FromBody]CMSComMent data)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var checkExist = _context.AssetAtivitys.FirstOrDefault(x => x.ActCode.ToLower() == data.ActCode.ToLower());
        //        if (checkExist!=null)
        //        {
        //            msg.Error = true;
        //            msg.Title = "Đã tồn tại mã hoạt động!";
        //        }
        //        else
        //        {
        //            data.CreatedBy = ESEIM.AppContext.UserName;
        //            data.CreatedTime = DateTime.Now;
        //            _context.AssetAtivitys.Add(data);
        //            _context.SaveChanges();
        //            msg.Title = "Thêm hoạt động thành công";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra khi thêm?";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public object Update([FromBody]CMSComMent data)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        data.UpdatedBy = ESEIM.AppContext.UserName;
        //        data.UpdatedTime = DateTime.Now;
        //        _context.AssetAtivitys.Update(data);
        //        _context.SaveChanges();
        //        msg.Title = "Cập nhật hoạt động thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra khi cập nhật!";
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public object Delete(int id)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
        //        data.DeletedBy = ESEIM.AppContext.UserName;
        //        data.DeletedTime = DateTime.Now;
        //        data.IsDeleted = true;

        //        _context.AssetAtivitys.Update(data);
        //        _context.SaveChanges();
        //        msg.Title = "Xóa thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi xảy ra khi xóa!";
        //        msg.Object = ex;
        //        return Json(msg);
        //    }
        //}
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