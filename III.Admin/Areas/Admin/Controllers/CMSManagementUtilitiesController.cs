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
    public class CMSManagementUtilitiesController : BaseController
    {
        public class UtilitiessJtableModel
        {
            public int id { get; set; }
            public string field_value { get; set; }
            public bool? publish { get; set; }
            public int? ordering { get; set; }
            public DateTime? created_date { get; set; }
            public DateTime? modified_date { get; set; }

        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSManagementUtilitiesController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSManagementUtilitiesController(EIMDBContext context, IStringLocalizer<CMSManagementUtilitiesController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JTableModelUti : JTableModel
        {
            public bool? trash { get; set; }
            public bool? publish { get; set; }
        }

        #region combobox
        //[HttpPost]
        //public object GetActivityType()
        //{
        //    var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.CMSManagementSlideType)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
       //     return data;
       // }


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
        //[HttpPost]
        //public object GetPublished()
        //{
        //    var data = _context.cms.Select(x => new { Published = x.published }).AsNoTracking().ToList();
        //    return data;
        //}
        #endregion

        #region action

        [HttpPost]
        public object JTable([FromBody]JTableModelUti jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = (from a in _context.cms_extra_fields_value          
                         where (/*a.trash == false && */a.field_group ==6 ) 
                         && (jTablePara.trash == null || a.trash == jTablePara.trash)
                         && (jTablePara.publish == null || a.publish == jTablePara.publish)
                         select new UtilitiessJtableModel
                         {
                             id = a.id,
                             field_value = a.field_value,
                             publish = a.publish,
                             ordering = a.ordering,
                             created_date = a.created_date,
                             modified_date = a.modified_date
                         }).AsParallel();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "field_value", "publish", "ordering", "created_date", "modified_date", "id");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
            return data;
        }

        [HttpPost]
        //public JsonResult Insert([FromBody]cms_extra_fields_value data)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var checkExist = _context.cms_extra_fields_value.FirstOrDefault(x => x.field_value.ToLower() == data.field_value.ToLower());
        //        if (checkExist != null)
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
        //public object Update([FromBody]CMSManagementSlide data)
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

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetAtivitys.FirstOrDefault(x => x.ActivityId == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;

                _context.AssetAtivitys.Update(data);
                _context.SaveChanges();
                msg.Title = "Xóa thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi xóa!";
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