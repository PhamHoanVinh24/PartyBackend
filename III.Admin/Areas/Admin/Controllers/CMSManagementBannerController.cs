using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Http;
using FTU.Utils.HelperNet;
using Newtonsoft.Json.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSManagementBannerController : BaseController
    {
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<CMSManagementBannerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JtableModelCMSManagementBanner : JTableModel
        {
            public bool? trash { get; set; }
            public bool? publish { get; set; }
            
        }
        public class CMSManagementBannerModel
        {
            public int id { get; set; }
            public string title {get;set;}
            public string linkRef { get; set; }
            public string description { get; set; }
            public string block { get; set; }
             public string img { get; set; }
            public string field_value { get; set;}
            public int? field_group { get; set; }
            public int? ordering { get; set; }
            public int? created_by { get; set; }
            public DateTime? created_date { get; set; }
            public int? modified_by { get; set; }
            public DateTime? modified_date { get; set; }
            public bool trash { get; set; }
            public bool publish { get; set; }
            public DateTime? date_post { get; set; }
        }
        private readonly EIMDBContext _context;
        public CMSManagementBannerController(EIMDBContext context, IUploadService upload, IStringLocalizer<CMSManagementBannerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }

        [Breadcrumb("ViewData.CrumbCmsBanner", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsBanner"] = _sharedResources["COM_CRUMB_CMS_MANAGE_BANNER"];
            return View();
        }
       

        [HttpPost]
        public object JTable([FromBody]JtableModelCMSManagementBanner jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.cms_extra_fields_value.Where(x => x.field_group == 4)
                         where (jTablePara.trash == null || (jTablePara.trash == a.trash))
                         && (jTablePara.publish == null || (jTablePara.publish == a.publish))
                         select new 
                         {
                             id = a.id,
                             field_value = JObject.Parse(a.field_value),
                             title = JObject.Parse(a.field_value)["Title"],
                             field_group = a.field_group,
                             publish = a.publish,
                             ordering = a.ordering,
                             created_date = a.created_date,
                             date_post = a.date_post,
                             img = JObject.Parse(a.field_value)["Images"],
                             modified_date = a.modified_date,
                             trash = a.trash
                         });
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "title","img", "field_value", "field_group", "publish", "ordering", "created_date", "date_post", "modified_date");
            return Json(jdata);
        }
        [HttpPost]
        public object GetCMSBlock()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CMS_BLOCK").Select(x=> new { Code = x.CodeSet, Name = x.ValueSet}).ToList();
            return data;

        }
        [HttpPost]
        public object Insert(CMSManagementBannerModel data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = (from a in _context.cms_extra_fields_value
                            where (a.field_group == 4)
                            && (JObject.Parse(a.field_value)["Title"].ToString() == data.title)
                            select a
                            ).ToList();
                if(query.Count != 0)
                {
                    msg.Error = true;
                    msg.Title = "Banner này đã tồn tại";
                }
                else
                {
                    JObject json = new JObject();
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
                            json.Add("Images", "/uploads/Images/" + upload.Object.ToString());
                        }
                    }

                    json.Add("Title", data.title == null ? "" : data.title);
                    json.Add("LinkRef", data.linkRef == null ? "" : data.linkRef);
                    json.Add("Description", data.description == null ? "" : data.description);
                    json.Add("Block", data.block == null ? "" : data.block);

                    data.field_value = json.ToString();
                    var obj = new cms_extra_fields_value
                    {
                        field_value = data.field_value,
                        field_group = 4,
                        ordering = data.ordering,
                        publish = data.publish,
                        created_date = DateTime.Now,
                        trash = false,
                    };
                    _context.cms_extra_fields_value.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công"; 
                }
                return msg;
                
            }
            catch(Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm";
                return msg;
            }
            
        }
        public object GetItem([FromBody] int Id)
        {
            var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == Id);
            try
            {
                var obj = new CMSManagementBannerModel
                {
                    title = JObject.Parse(data.field_value)["Title"] == null ? "" : JObject.Parse(data.field_value)["Title"].ToString(),
                    linkRef = JObject.Parse(data.field_value)["LinkRef"] == null ? "" : JObject.Parse(data.field_value)["LinkRef"].ToString(),
                    description = JObject.Parse(data.field_value)["Description"] == null ? "" : JObject.Parse(data.field_value)["Description"].ToString(),
                    block = JObject.Parse(data.field_value)["Block"] == null ? "" : JObject.Parse(data.field_value)["Block"].ToString(),
                    img = JObject.Parse(data.field_value)["Images"]== null ? "" : JObject.Parse(data.field_value)["Images"].ToString(),
                    publish = data.publish,
                    ordering = data.ordering,
                    trash = data.trash,
                };
                return obj;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public object Update(CMSManagementBannerModel data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
           var query = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == data.id);

            if (query == null)
            {
                msg.Error = true;
                msg.Title = "Bản ghi không tồn tại";
                return msg;
            }
            else
            {
                try
                {
                    var obj = _context.cms_extra_fields_value.FirstOrDefault(x => x.field_group == 4 && x.id != data.id && JObject.Parse(x.field_value)["Title"].ToString() == data.title);
                                 
                            
                    if(obj != null)
                    {
                        msg.Error = true;
                        msg.Title = "Banner đã tồn tại";
                    }
                    else
                    {
                        JObject json = new JObject();
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
                                json.Add("Images", "/uploads/Images/" + upload.Object.ToString());
                            }
                        }
                        else
                        {
                                json.Add("Images", JObject.Parse(query.field_value)["Images"] == null ? "" : JObject.Parse(query.field_value)["Images"].ToString());

                        }
                        json.Add("Title", data.title == null ? "" : data.title);
                        json.Add("LinkRef", data.linkRef == null ? "" : data.linkRef);
                        json.Add("Description", data.description == null ? "" : data.description);
                        json.Add("Block", data.block == null ? "" : data.block);
                        data.field_value = json.ToString();
                        query.publish = data.publish;
                        query.trash = false;
                        query.modified_date = DateTime.Now;
                        query.ordering = data.ordering;
                        query.field_value = data.field_value;
                        _context.cms_extra_fields_value.Update(query);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"]; //Sửa thành công
                    }
                    return msg;
                }
                catch(Exception ex)
                {
                    msg.Error = true;
                    msg.Title = "Có lỗi xảy ra khi sửa";
                    return msg;
                }

            }
        }
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            var query = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id);
            if(query == null)
            {
                msg.Error = true;
                msg.Title = "Banner không tồn tại";
            }
            else
            {
                query.trash = true;
                _context.cms_extra_fields_value.Update(query);
                _context.SaveChanges();
                msg.Title = "Xóa thành công";
            }
            return msg;
        }
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