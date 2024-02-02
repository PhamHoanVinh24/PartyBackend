using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Newtonsoft.Json;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;
using Syncfusion.EJ2.Linq;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSVideoController : BaseController
    {
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CMSVideoController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class CMSVideoJtableViewModel
        {
            public int id { get; set; }
            public string title { get; set; }
            public string video { get; set; }
            public bool? published { get; set; }
            public int? ordering { get; set; }
            public DateTime? created_date { get; set; }
            public DateTime? modified_date { get; set; }
            public string description { get; set; }
            public DateTime? post_date { get; set; }
        }
        public class CMSVideoJtablePostModel
        {
            public int? id { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public string linkRef { get; set; }
            public string gallery { get; set; }
            public string video { get; set; }
            public bool published { get; set; }
            public int? ordering { get; set; }
            public string category_id { get; set; }
            public string post_date { get; set; }
            public DateTime? created_date { get; set; }
            public DateTime? modified_date { get; set; }
        }
        public class ParseJson
        {
            public string Title { get; set; }
            public string LinkRef { get; set; }
            public string Description { get; set; }
            public string Gallery { get; set; }
            public string Video { get; set; }
            public string CategoryId { get; set; }
            public DateTime? DatePost { get; set; }
        }
        private readonly EIMDBContext _context;
        public CMSVideoController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<CMSVideoController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbCmsVideo", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsVideo"] = _sharedResources["COM_CRUMB_CMS_VIDEO"];
            return View();
        }
        public class JTableModelVideo : JTableModel
        {
            public string title { get; set; }
            public bool? trash { get; set; }
            public bool? publish { get; set; }
            public string ActNote { get; set; }
        }
        #region action
        [HttpPost]
        public object JTable([FromBody]JTableModelVideo jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //truy vấn lấy dữ liệu trong bảng extra_field_value
            var query = (from a in _context.cms_extra_fields_value.Where(x => !x.trash && x.field_group==7)
                         //join groups in _context.cms_extra_fields_groups
                         //on value.field_group equals groups.id
                         where ((string.IsNullOrEmpty(jTablePara.title) || (JObject.Parse(a.field_value)["Title"].ToString() != "" && JObject.Parse(a.field_value)["Title"].ToString().Contains(jTablePara.title)))
                         && ((jTablePara.publish == null) || ((jTablePara.publish != null) && a.publish.Equals(jTablePara.publish))))
                         select new
                         {
                             a.field_value,
                             a.publish,
                             a.ordering,
                             a.created_date,
                             a.modified_date,
                             a.id
                         }).ToList();
            //Cắt chuỗi json trong field_value truyền vào list 
            List<CMSVideoJtableViewModel> data_list = new List<CMSVideoJtableViewModel>();
            foreach (var item in query)
            {
                CMSVideoJtableViewModel model = new CMSVideoJtableViewModel();
                dynamic stuff = JsonConvert.DeserializeObject(item.field_value);
                model.id = item.id;
                model.ordering = item.ordering;
                model.published = item.publish;
                model.created_date = item.created_date;
                model.modified_date = item.modified_date;
                model.title = stuff.Title;
                model.video = stuff.Video;
                data_list.Add(model);
            }

            int count = data_list.Count();
            var data = data_list.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id", "title", "video", "published", "ordering", "created_date", "modified_date");
            return Json(jdata);
        }
        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id && x.trash == false);
            try
            {
                var obj = new
                {
                    id = id,
                    title = JObject.Parse(data.field_value)["Title"].ToString(),
                    description = !string.IsNullOrEmpty(JObject.Parse(data.field_value)["Description"].ToString()) ? JObject.Parse(data.field_value)["Description"].ToString() : "",
                    published = data.publish,
                    ordering = data.ordering,
                    category_id = JObject.Parse(data.field_value)["CategoryId"].ToString() == "" ? 0 : int.Parse(JObject.Parse(data.field_value)["CategoryId"].ToString()),
                    post_date = data.date_post.HasValue ? data.date_post.Value.ToString("dd/MM/yyyy") : "",
                    gallery = JObject.Parse(data.field_value)["Gallery"].ToString(),
                    video = JObject.Parse(data.field_value)["Video"].ToString(),
                };


                return obj;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public object GetNews()
        {
            var data = _context.cms_extra_fields_value.Take(3).ToList();
            
            return data;

        
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult Insert(CMSVideoJtablePostModel data, IFormFile images, IFormFile file)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                bool? tesst = true;
                var checkExist = (from value in _context.cms_extra_fields_value.Where(x => x.field_group == 7)
                                  where Convert.ToString(JObject.Parse(value.field_value)["Title"]) == data.title
                                  && value.trash == tesst
                                  select value).ToList();
                if (checkExist.Count == 0)
                {
                    cms_extra_fields_value value = new cms_extra_fields_value();
                    value.ordering = data.ordering;
                    value.publish = data.published;
                    value.created_date = DateTime.Now;
                    value.field_group = 7;
                    value.date_post = !string.IsNullOrEmpty(data.post_date) ? DateTime.ParseExact(data.post_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    value.trash = false;
                    ParseJson parseJson = new ParseJson();
                    parseJson.Title = data.title;
                    parseJson.Description = data.description;
                    parseJson.CategoryId = !string.IsNullOrEmpty(data.category_id) ? null : data.category_id;
                    //parseJson.DatePost = "";
                    parseJson.LinkRef = "";
                    parseJson.Gallery = "";
                    parseJson.Video = "";
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
                            parseJson.Gallery = "/uploads/Images/" + upload.Object.ToString();
                        }
                    }
                    if (file != null)
                    {
                        var uploadvideo = _upload.UploadFile(file, _hostingEnvironment.WebRootPath + "/uploads/files/");

                        if (uploadvideo.Error)
                        {
                            msg.Error = true;
                            msg.Title = uploadvideo.Title;
                            return Json(msg);
                        }
                        else
                        {
                            parseJson.Video = "/uploads/files/" + uploadvideo.Object.ToString();
                        }
                    }
                    value.field_value = JsonConvert.SerializeObject(parseJson);
                    _context.cms_extra_fields_value.Add(value);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Thêm video thành công";
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại tựa đề video";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi thêm?";
            }
            return Json(msg);
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object Update(CMSVideoJtablePostModel data, IFormFile images, IFormFile file)
        {
            var msg = new JMessage() { Error = false };
            try
            {

                var value = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == data.id && x.trash == false);
                JObject json = new JObject();
                json.Add("Title", data.title == null ? "" : data.title);
                json.Add("LinkRef", data.linkRef == null ? "" : data.linkRef);
                json.Add("Description", data.description == null ? "" : data.description);

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
                        json.Add("Gallery", "/uploads/Images/" + upload.Object.ToString());
                    }
                }
                else
                {
                    json.Add("Gallery", JObject.Parse(value.field_value)["Gallery"] == null ? "" : JObject.Parse(value.field_value)["Gallery"].ToString());
                }
                if (file != null)
                {
                    var uploadvideo = _upload.UploadFile(file, _hostingEnvironment.WebRootPath + "/uploads/files/");

                    if (uploadvideo.Error)
                    {
                        msg.Error = true;
                        msg.Title = uploadvideo.Title;
                        return Json(msg);
                    }
                    else
                    {
                        json.Add("Video", "/uploads/files/" + uploadvideo.Object.ToString());
                    }
                }
                else
                {
                    json.Add("Video", JObject.Parse(value.field_value)["Video"] == null ? "" : JObject.Parse(value.field_value)["Video"].ToString());
                }
                json.Add("CategoryId", string.IsNullOrEmpty(data.category_id) ? null : data.category_id);
                value.field_value = json.ToString();
                value.modified_date = DateTime.Now;
                value.publish = data.published;
                value.ordering = data.ordering;
                value.date_post = !string.IsNullOrEmpty(data.post_date) ? DateTime.ParseExact(data.post_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                value.trash = false;
                _context.cms_extra_fields_value.Update(value);
                _context.SaveChanges();
                msg.Title = "Cập nhật video thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi cập nhật!";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id && x.trash == false);
                data.trash = true;
                _context.cms_extra_fields_value.Update(data);
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
        [HttpPost]
        public List<TreeView> GetTreeData()
        {
            var data = _context.cms_categories.OrderBy(x => x.name).AsNoTracking();
            var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }
        private List<TreeView> GetSubTreeData(List<cms_categories> data, int? Parent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = Parent == null
                ? data.Where(x => x.parent == null).OrderBy(x => x.name).AsParallel()
                : data.Where(x => x.parent == Parent).OrderBy(x => x.name).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.id,
                    Code = item.name,
                    Title = item.name,
                    ParentId = item.parent,
                    Level = tab,
                    HasChild = data.Any(x => x.parent == item.id)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.id, lstCategories, tab + 1);
            }
            return lstCategories;
        }
        public object Published(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id && x.trash == false);
                data.publish = data.publish == null ? data.publish : !data.publish;
                _context.cms_extra_fields_value.Update(data);
                _context.SaveChanges();
                msg.Title = "Publish thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra khi publish!";
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