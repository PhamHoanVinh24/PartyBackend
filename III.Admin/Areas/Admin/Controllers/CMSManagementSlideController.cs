using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSManagementSlideController : BaseController
    {
        private readonly IUploadService _upload;
        public class JtableModelCMSManagementSlide : JTableModel
        {
            public bool? trash { get; set; }
            public bool? publish { get; set; }
        }


        public class CMSManagementSlideViewModel
        {
            public int id { get; set; }
            public string title { get; set; }
            public string img { get; set; }
            public int? ordering { get; set; }
            public DateTime? created_date { get; set; }
            public DateTime? modified_date { get; set; }
            public bool publish { get; set; }
        }
        public class CMSManagementSlidePostModel : CMSManagementSlideViewModel
        {

            public string linkRef { get; set; }
            public string description { get; set; }
            public string block { get; set; }
            public DateTime? date_post { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSManagementSlideController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSManagementSlideController(EIMDBContext context, IUploadService upload, IStringLocalizer<CMSManagementSlideController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        [Breadcrumb("ViewData.CrumbCmsSlider", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsSlider"] = _sharedResources["COM_CRUMB_CMS_MANAGE_SLIDE"];
            return View();
        }


        [HttpPost]
        public object JTable([FromBody]JtableModelCMSManagementSlide jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //truy vấn lấy dữ liệu trong bảng extra_field_value
            var query = (from a in _context.cms_extra_fields_value.Where(x => x.field_group == 3)
                         where (jTablePara.trash == null || (jTablePara.trash == a.trash))
                         && (jTablePara.publish == null || (jTablePara.publish == a.publish))
                         select new CMSManagementSlideViewModel
                         {
                             id = a.id,
                             title = JObject.Parse(a.field_value)["Title"].ToString(),
                             img = JObject.Parse(a.field_value)["Images"] != null ? JObject.Parse(a.field_value)["Images"].ToString() : "",
                             publish = a.publish,
                             ordering = a.ordering,
                             created_date = a.created_date,
                             modified_date = a.modified_date,
                         }).ToList();
            //Cắt chuỗi json trong field_value truyền vào list 
            //List<CMSManagementSlideViewModel> data_list = new List<CMSManagementSlideViewModel>();
            //foreach (var item in query)
            //{
            //    CMSManagementSlideViewModel model = new CMSManagementSlideViewModel();
            //    dynamic stuff = JsonConvert.DeserializeObject(item.field_value);
            //    model.id = item.id;
            //    model.ordering = item.ordering;
            //    model.publish = item.publish;
            //    model.created_date = item.created_date;
            //    model.modified_date = item.modified_date;
            //    if (item.field_value != "")
            //    {
            //        model.title = stuff.Title;
            //        model.img = stuff.Images;
            //    }
            //    else
            //    {
            //        model.title = "";
            //        model.img = "";
            //    }
            //    data_list.Add(model);
            //}
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id", "title", "img", "publish", "ordering", "created_date", "modified_date");
            return Json(jdata);
        }
        [HttpPost]
        public object GetCMSBlock()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CMS_BLOCK").Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            return data;

        }
        //public object Insert(CMSManagementSlidePostModel data, IFormFile images)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var query = (from a in _context.cms_extra_fields_value
        //                     where (a.field_group == 3)
        //                     && (JObject.Parse(a.field_value)["Title"].ToString() == data.title)
        //                     select a
        //                    ).ToList();
        //        if (query.Count != 0)
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(CommonUtil.ResourceValue("CMS_MSG_EXIST_SLIDE"));//"Slide này đã tồn tại";
        //        }
        //        else
        //        {
        //            JObject json = new JObject();
        //        json.Add("Title", data.title);
        //        json.Add("LinkRef", data.linkRef);
        //        json.Add("Description", data.description);           
        //        if (images != null)
        //        {
        //            var upload = _upload.UploadImage(images);
        //            if (upload.Error)
        //            {
        //                msg.Error = true;
        //                msg.Title = upload.Title;
        //                return Json(msg);
        //            }
        //            else
        //            {
        //                json.Add("Images", "/uploads/Images/" + upload.Object.ToString());
        //            }
        //        }
        //        //json.Add("Block", data.block);

        //        var obj = new cms_extra_fields_value
        //        {
        //            field_value = json.ToString(),
        //            field_group = 3,
        //            ordering = data.ordering,
        //            publish = data.publish,
        //            created_date = DateTime.Now,
        //            trash = true,
        //        };
        //        _context.cms_extra_fields_value.Add(obj);
        //        _context.SaveChanges();
        //        msg.Title = String.Format(CommonUtil.ResourceValue("CMS_MSG_ADD_SUCCESS"));//"Thêm mới thành công";
        //        }
        //        return msg;

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("CMS_MSG_ADD_ERROR"));//"Có lỗi xảy ra khi thêm";
        //        return msg;
        //    }

        //}
        public object Insert(CMSManagementSlidePostModel data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = (from a in _context.cms_extra_fields_value
                             where (a.field_group == 3)
                             && (JObject.Parse(a.field_value)["Title"].ToString() == data.title)
                             select a
                            ).ToList();
                if (query.Count != 0)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CMS_MSG_EXIST_SLIDE"];//"Slide này đã tồn tại";
                }
                else
                {
                    //JObject json = new JObject();
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
                            json.Add("Images", "/uploads/Images/" + upload.Object.ToString());
                        }
                    }
                    var obj = new cms_extra_fields_value
                    {
                        field_value = json.ToString(),
                        field_group = 3,
                        ordering = data.ordering,
                        publish = data.publish,
                        created_date = DateTime.Now,
                        trash = false,

                    };
                    _context.cms_extra_fields_value.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["CMS_MSG_ADD_SUCCESS"];//"Thêm mới thành công";
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];//"Slide này đã tồn tại";
                return msg;
            }

        }
        public object GetItem([FromBody] int Id)
        {
            var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == Id);
            try
            {
                var obj = new CMSManagementSlidePostModel
                {
                    title = JObject.Parse(data.field_value)["Title"] == null ? "" : JObject.Parse(data.field_value)["Title"].ToString(),
                    linkRef = JObject.Parse(data.field_value)["LinkRef"] == null ? "" : JObject.Parse(data.field_value)["LinkRef"].ToString(),
                    description = JObject.Parse(data.field_value)["Description"] == null ? "" : JObject.Parse(data.field_value)["Description"].ToString(),
                    //block = JObject.Parse(data.field_value)["Block"] == null ? "" : JObject.Parse(data.field_value)["Block"].ToString(),
                    img = JObject.Parse(data.field_value)["Images"] == null ? "" : JObject.Parse(data.field_value)["Images"].ToString(),
                    publish = data.publish,
                    ordering = data.ordering
                };
                return obj;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public object Update(CMSManagementSlidePostModel data, IFormFile images)
        {
            var msg = new JMessage() { Error = false };
            var query = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == data.id);

            if (query == null)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["CMS_MSG_DOES_NOT_EXIST"]; //"Bản ghi không tồn tại";
                return msg;
            }
            else
            {
                try
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
                    json.Add("Title", data.title);
                    json.Add("LinkRef", data.linkRef);
                    json.Add("Description", data.description);
                    json.Add("Block", data.block);
                    query.publish = data.publish;
                    query.modified_date = DateTime.Now;

                    query.ordering = data.ordering;
                    query.field_value = json.ToString();
                    _context.cms_extra_fields_value.Update(query);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["CMS_MSG_EDIT_SUCCESS"]; //"Sửa thành công";
                    return msg;
                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    return msg;
                }

            }
        }
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            var query = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id);
            if (query == null)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("CMS_MSG_SLIDE_DOES_NOT_EXIST"));//"Slide không tồn tại";
                msg.Title = "Slide không tồn tại";
            }
            else
            {
                query.trash = true;
                _context.cms_extra_fields_value.Update(query);
                _context.SaveChanges();
                msg.Title = "Xóa thành công";
                //msg.Title = String.Format(CommonUtil.ResourceValue("CMS_MSG_DELETE_SUCCESS"));//"Xóa thành công";
            }
            return msg;
        }
        public object Published(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id);
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