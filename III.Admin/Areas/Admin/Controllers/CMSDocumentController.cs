using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Globalization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSDocumentController : BaseController
    {
        public class CMSItemsJtableModel
        {
            public int id { get; set; }
            public string title { get; set; }
            public string categoryName { get; set; }
            public bool published { get; set; }
            public DateTime? postDate { get; set; }
            public DateTime? createDate { get; set; }
            public DateTime? modifiedDate { get; set; }
            public int stt { get; set; }
        }

        public class Published
        {
            public int id { get; set; }
            public string name { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSDocumentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSDocumentController(EIMDBContext context, IStringLocalizer<CMSDocumentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbCmsDocument", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsDocument"] = _sharedResources["COM_CRUMB_CMS_DOCUMENT"];
            return View();
        }

        public class CMSDocumentJTableModel : JTableModel
        {
            public int id { get; set; }
            public string title { get; set; }
            public string categoryName { get; set; }
            public bool published { get; set; }
            public DateTime? postDate { get; set; }
            public DateTime? createDate { get; set; }
            public DateTime? modifiedDate { get; set; }
            public int stt { get; set; }
        }

        public class CMSDocumentPostModel
        {
            public int id { get; set; }
            public string title { get; set; }
            //Đường dẫn
            public string alias { get; set; }
            //id kiểu mẫu
            public int? cat_id { get; set; }
            //Ngày đăng
            public string date_post { get; set; }
            public string language { get; set; }
            //Kiểu mẫu hiển thị
            public string display { get; set; }
            public string tag { get; set; }
            public string intro_text { get; set; }
            //Số kí hiệu
            public int? index_number { get; set; }
            //Loại văn bản
            public string type_document { get; set; }
            //Lĩnh vực      
            public string field { get; set; }
            //Trích yếu
            public string summary { get; set; }
            //Cơ quan ban hành
            public string agency_issued { get; set; }
            //Ngày ban hành
            public string release_date { get; set; }
            //Ngày hiệu lực
            public string effective_date { get; set; }
            //Ngày hết hiệu lực
            public string expiry_date { get; set; }
            //Người ký
            public string signer { get; set; }
            //Thay thế văn bản
            public string replace_document { get; set; }
            //full_text
            public string full_text { get; set; }
            public bool published { get; set; }
        }


        #region combobox      
        [HttpPost]
        //Get danh mục cho combobox trang index,add quản lý văn bản (cmsDocument)
        public object GetCategory()
        {
            //var query = _context.cms_categories.Where(x => x.template == 5.ToString()).Select(x => new { x.id, x.name }).AsNoTracking().ToList();
            var query = _context.cms_categories.Select(x => new { x.id, x.name }).AsNoTracking().ToList();
            return query;
        }
        [HttpPost]
        //Get published cho combobox trang index quản lý văn bản (cmsDocument)
        public object GetPublished()
        {
            List<Published> publisheds = new List<Published>();
            publisheds.Add(new Published { id = 1, name = "Hiển thị" });
            publisheds.Add(new Published { id = 0, name = "Không hiển thị" });
            return publisheds;
        }
        //Get kiểu mẫu hiển thị cho combobox trang index quản lý văn bản (cmsDocument)
        //Get cơ quan ban hành cho combobox trang add quản lý văn bản (cmsDocument)
        //Get loại văn bản cho combobox trang index quản lý văn bản (cmsDocument)
        //Get lĩnh vực cho combobox trang index quản lý văn bản (cmsDocument)
        public object GetUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetCurrency()
        {
            var data = _context.FundCurrencys.Select(x => new { Code = x.CurrencyCode, Name = x.Note }).AsNoTracking().ToList();
            return data;
        }
        #endregion

        #region action

        [HttpPost]
        public object JTable([FromBody]CMSDocumentJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            //truy vấn 1 lấy item
            var query = (from item in _context.cms_items
                         join category in _context.cms_categories on item.cat_id equals category.id
                         //where category.template == 5.ToString()
                         where  (string.IsNullOrEmpty(jTablePara.title) || item.title.ToLower().Contains(jTablePara.title))
                         && (item.published == jTablePara.published)
                         && (string.IsNullOrEmpty(jTablePara.categoryName) || category.id.ToString().Equals(jTablePara.categoryName))
                         select new
                         {
                             item.id,
                             item.title,
                             category.name,
                             item.published,
                             item.date_post,
                             item.created,
                             item.modified,
                         }).ToList();
            //truy vấn 2 lấy số thứ tự trong bảng
            var query_row_number = query.AsEnumerable().Select((x, index) => new CMSItemsJtableModel
            {
                stt = index + 1,
                id = x.id,
                title = x.title,
                categoryName = x.name,
                published = x.published,
                postDate = x.date_post,
                createDate = x.created,
                modifiedDate = x.modified

            }).ToList();
            int count = query_row_number.Count();
            var data = query_row_number.AsQueryable().OrderByDescending(x => x.createDate).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "stt", "id", "title", "categoryName", "published", "postDate", "createDate", "modifiedDate");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            List<CMSDocumentPostModel> data = new List<CMSDocumentPostModel>();
            var item = _context.cms_items.FirstOrDefault(x => x.id == id);
            if (item != null)
            {
                CMSDocumentPostModel model = new CMSDocumentPostModel();
                model.id = item.id;
                model.title = item.title;
                model.alias = item.alias;
                model.intro_text = item.intro_text;
                model.full_text = item.full_text;
                model.date_post = item.date_post.HasValue ? item.date_post.Value.ToString("dd/MM/yyyy HH:mm:ss") : "";
                model.cat_id = item.cat_id;
                model.published = item.published;
                model.language = item.language;
                try
                {
                    //cắt chuỗi trong extra_field         
                    var stuff = JsonConvert.DeserializeObject<ExtraFieldDoc>(item.extra_fields);
                    //DateTime? release_date = stuff.NgayBanHanh;
                    DateTime? release_date = !string.IsNullOrEmpty(stuff.NgayBanHanh) ? DateTime.ParseExact(stuff.NgayBanHanh, "dd/MM/yyyy", null) : (DateTime?)null;
                    //DateTime? effective_date = stuff.NgayCoHieuLuc;
                    DateTime? effective_date = !string.IsNullOrEmpty(stuff.NgayCoHieuLuc) ? DateTime.ParseExact(stuff.NgayCoHieuLuc, "dd/MM/yyyy", null) : (DateTime?)null;
                    //DateTime? expiry_date = stuff.NgayHetHieuLuc;
                    DateTime? expiry_date = !string.IsNullOrEmpty(stuff.NgayHetHieuLuc) ? DateTime.ParseExact(stuff.NgayHetHieuLuc, "dd/MM/yyyy", null) : (DateTime?)null;
                    model.index_number = Convert.ToInt32(stuff.SoKyHieu);
                    model.summary = stuff.TrichYeu;
                    model.agency_issued = stuff.CoQuanBanHanh;
                    model.type_document = stuff.LoaiVanBan;
                    model.field = stuff.LinhVuc;
                    model.signer = stuff.NguoiKy;
                    model.replace_document = stuff.ThayTheVanBan;
                    model.tag = stuff.Tag;
                    model.display = stuff.Display;

                    model.release_date = release_date.HasValue ? release_date.Value.ToString("dd/MM/yyyy") : "";
                    model.effective_date = effective_date.HasValue ? effective_date.Value.ToString("dd/MM/yyyy") : "";
                    model.expiry_date = expiry_date.HasValue ? expiry_date.Value.ToString("dd/MM/yyyy") : "";
                }
                catch (Exception ex)
                {
                    Console.Write(ex.Message);
                }

                data.Add(model);
            }
            //var data = _context.cms_items.FirstOrDefault(x => x.id == id);
            return data.FirstOrDefault();
        }

        [HttpPost]
        public JsonResult Insert([FromBody]CMSDocumentPostModel data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                DateTime? datePost = !string.IsNullOrEmpty(data.date_post) ? DateTime.ParseExact(data.date_post, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? releaseDate = !string.IsNullOrEmpty(data.release_date) ? DateTime.ParseExact(data.release_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? effectiveDate = !string.IsNullOrEmpty(data.effective_date) ? DateTime.ParseExact(data.effective_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? expiryDate = !string.IsNullOrEmpty(data.expiry_date) ? DateTime.ParseExact(data.expiry_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                cms_items item = new cms_items();
                item.title = data.title;
                item.alias = data.alias;
                item.cat_id = data.cat_id;
                item.published = false;
                item.intro_text = data.intro_text;
                item.full_text = data.full_text;
                item.created = DateTime.Now;
                item.checked_out_time = DateTime.Now;
                item.trash = false;
                item.language = data.language;
                item.date_post = datePost;
                item.template = 5.ToString();

                var exField = new ExtraFieldDoc
                {
                    TrichYeu = data.summary,
                    SoKyHieu = data.index_number.ToString(),
                    NgayBanHanh = releaseDate.HasValue ? releaseDate.Value.ToString("dd/MM/yyyy") : "",
                    NgayCoHieuLuc = effectiveDate.HasValue ? releaseDate.Value.ToString("dd/MM/yyyy") : "",
                    NgayHetHieuLuc = expiryDate.HasValue ? releaseDate.Value.ToString("dd/MM/yyyy") : "",
                    CoQuanBanHanh = data.agency_issued,
                    LoaiVanBan = data.type_document,
                    LinhVuc = data.field,
                    NguoiKy = data.signer,
                    ThayTheVanBan = data.replace_document,
                    Display = data.display,
                    Tag = data.tag
                };
                item.extra_fields = JsonConvert.SerializeObject(exField);
                //item.extra_fields = "{\"TrichYeu\":\"" + data.summary + "\",\"SoKyHieu\":\""
                //    + data.index_number.ToString() + "\",\"NgayBanHanh\":\"" + releaseDate
                //    + "\",\"NgayCoHieuLuc\":\"" + effectiveDate + "\",\"NgayHetHieuLuc\":\""
                //    + expiryDate + "\",\"CoQuanBanHanh\":\"" + data.agency_issued + "\",\"LoaiVanBan\":\""
                //    + data.type_document + "\",\"LinhVuc\":\"" + data.field + "\",\"NguoiKy\":\""
                //    + data.signer + "\",\"ThayTheVanBan\":\"" + data.replace_document + "\",\"Display\":\"" + data.display +
                //    "\",\"Tag\":\"" + data.tag + "\"}";
                _context.cms_items.Add(item);
                _context.SaveChanges();
                msg.Title = msg.Title = "Thêm văn bản thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Thêm văn bản thất bại";
            }
            return Json(msg);
        }
        public class ExtraFieldDoc
        {
            public string TrichYeu { get; set; }
            public string SoKyHieu { get; set; }
            public string CoQuanBanHanh { get; set; }
            public string LoaiVanBan { get; set; }
            public string LinhVuc { get; set; }
            public string NguoiKy { get; set; }
            public string ThayTheVanBan { get; set; }
            public string Display { get; set; }
            public string Tag { get; set; }
            public string NgayBanHanh { get; set; }
            public string NgayCoHieuLuc { get; set; }
            public string NgayHetHieuLuc { get; set; }
        }

        [HttpPost]
        public object Update([FromBody]CMSDocumentPostModel data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                DateTime? datePost = !string.IsNullOrEmpty(data.date_post) ? DateTime.ParseExact(data.date_post, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? releaseDate = !string.IsNullOrEmpty(data.release_date) ? DateTime.ParseExact(data.release_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? effectiveDate = !string.IsNullOrEmpty(data.effective_date) ? DateTime.ParseExact(data.effective_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? expiryDate = !string.IsNullOrEmpty(data.expiry_date) ? DateTime.ParseExact(data.expiry_date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var item = _context.cms_items.FirstOrDefault(x => x.id == data.id);
                if (item != null)
                {
                    item.title = data.title;
                    item.alias = data.alias;
                    item.cat_id = data.cat_id;
                    item.published = false;
                    item.intro_text = data.intro_text;
                    item.full_text = data.full_text;
                    item.created = DateTime.Now;
                    item.checked_out_time = DateTime.Now;
                    item.trash = false;
                    item.language = data.language;
                    item.date_post = datePost;
                    item.template = 5.ToString();
                    var exField = new ExtraFieldDoc
                    {
                        TrichYeu = data.summary,
                        SoKyHieu = data.index_number.ToString(),
                        NgayBanHanh = releaseDate.HasValue ? releaseDate.Value.ToString("dd/MM/yyyy") : "",
                        NgayCoHieuLuc = effectiveDate.HasValue ? releaseDate.Value.ToString("dd/MM/yyyy") : "",
                        NgayHetHieuLuc = expiryDate.HasValue ? releaseDate.Value.ToString("dd/MM/yyyy") : "",
                        CoQuanBanHanh = data.agency_issued,
                        LoaiVanBan = data.type_document,
                        LinhVuc = data.field,
                        NguoiKy = data.signer,
                        ThayTheVanBan = data.replace_document,
                        Display = data.display,
                        Tag = data.tag
                    };
                    item.extra_fields = JsonConvert.SerializeObject(exField);
                    //item.extra_fields = "{\"TrichYeu\":\"" + data.summary + "\",\"SoKyHieu\":\""
                    //+ data.index_number.ToString() + "\",\"NgayBanHanh\":\"" + releaseDate
                    //+ "\",\"NgayCoHieuLuc\":\"" + effectiveDate + "\",\"NgayHetHieuLuc\":\""
                    //+ expiryDate + "\",\"CoQuanBanHanh\":\"" + data.agency_issued + "\",\"LoaiVanBan\":\""
                    //+ data.type_document + "\",\"LinhVuc\":\"" + data.field + "\",\"NguoiKy\":\""
                    //+ data.signer + "\",\"ThayTheVanBan\":\"" + data.replace_document + "\",\"Display\":\"" + data.display +
                    //"\",\"Tag\":\"" + data.tag + "\"}";
                    _context.cms_items.Update(item);
                    _context.SaveChanges();
                    msg.Title = msg.Title = "Cập nhật văn bản thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Thêm văn bản thất bại";
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            //var a = _context.cms_items.Where(x => x.id.ToString().Equals(id)).FirstOrDefault();
            //var a = _context.cms_items.Where(x => x.id == id).FirstOrDefault();
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.cms_items.FirstOrDefault(x => x.id == id);
                //data.trash = true;
                //_context.cms_items.Update(data);
                _context.cms_items.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = String.Format(CommonUtil.ResourceValue("FCC_MSG_DELETE_DONE"));//"Xóa thành công";
                msg.Title = msg.Title = "Xóa văn bản thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Xóa văn bản thất bại";
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