using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using III.Admin.Controllers;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;
using System.IO;
using System.Globalization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UserManualController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UserManualController> _stringLocalizer;
        private readonly IStringLocalizer<CMSCategoryController> _stringLocalizerCmsCat;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<CMSItemController> _stringLocalizerCmsItm;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<EDMSRepositoryController> _stringLocalizerEdms;
        public UserManualController(EIMDBContext context, IStringLocalizer<UserManualController> stringLocalizer, IStringLocalizer<CMSCategoryController> stringLocalizerCmsCat,
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<CMSItemController> stringLocalizerCmsItm, IStringLocalizer<EDMSRepositoryController> stringLocalizerEdms,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCmsCat = stringLocalizerCmsCat;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizerCmsItm = stringLocalizerCmsItm;
            _stringLocalizerEdms = stringLocalizerEdms;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuSystemSettingController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["Title"] = _sharedResources["COM_CRUMB_USER_MANUAL"];
            return View();
        }

        #region Function
        [HttpPost]
        public JsonResult GetVideo()
        {
            var query = (from a in _context.cms_extra_fields_value.Where(x => !x.trash && x.field_group == 7 && x.publish)
                         select new
                         {
                             a.field_value,
                             a.publish,
                             a.ordering,
                             a.created_date,
                             a.modified_date,
                             a.id
                         }).ToList();

            var listVideo = new List<VideoInfo>();
            foreach (var item in query)
            {
                var video = new VideoInfo();
                dynamic stuff = JsonConvert.DeserializeObject(item.field_value);
                video.Id = item.id;
                video.Ordering = item.ordering;
                video.Published = item.publish;
                video.CreatedDate = item.created_date;
                video.ModifiDate = item.modified_date;
                video.Title = stuff.Title;
                video.Video = stuff.Video;
                video.Image = stuff.Gallery;
                listVideo.Add(video);
            }
            return Json(listVideo);
        }

        [HttpGet]
        public object GetItemFile(string url, bool? isEdit, int mode)
        {
            //Kiểm tra trạng thái của file đang mở
            //TH1: Nếu đang ở trạng thái bị lock(IsEdit=false) thì thông báo cho người dùng là không được phép sửa file
            //TH2: Nếu trạng thái không bị lock(IsEdit=null hoặc IsEdit=true) thì cập nhật IsEdit=false và EditedFileTime, EditedFileBy
            var msg = new JMessage() { Error = false };
            try
            {
                var aseanDoc = new AseanDocument();

                if (!string.IsNullOrEmpty(url))
                {
                    aseanDoc.File_Name = Path.GetFileName(url);
                    aseanDoc.File_Type = Path.GetExtension(url);
                    aseanDoc.File_Path = url;
                    aseanDoc.IsEdit = isEdit;
                    aseanDoc.ObjCode = Path.GetFileNameWithoutExtension(url);
                    aseanDoc.ObjType = "DISPATCHES";
                    aseanDoc.Mode = mode;
                    aseanDoc.FirstPage = "/Admin/UserManual";
                    var extension = Path.GetExtension(url);

                    if (extension.ToLower().Equals(".doc") || extension.ToLower().Equals(".docx"))
                    {
                        DocmanController.pathFile = url;
                        DocmanController.docmodel = aseanDoc;
                    }
                    else if (extension.ToLower().Equals(".xls") || extension.ToLower().Equals(".xlsx"))
                    {
                        ExcelController.pathFile = url;
                        ExcelController.docmodel = aseanDoc;
                    }
                    else if (extension.ToLower().Equals(".pdf"))
                    {
                        PDFController.pathFile = url;
                        PDFController.docmodel = aseanDoc;
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["EDMSR_MSG_FILE_NOT_EXIST"];
                return Json(msg);
            }

            return Json(msg);
        }

        public class JTableModelFile : JTableModel
        {
            public string ObjCode { get; set; }
            public string ObjType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
        }

        public class ObjRelativeContract
        {
            public string ObjectType { get; set; }
            public string ObjectInstance { get; set; }
        }

        #endregion

        #region CMS
        [HttpPost]
        public object JTable([FromBody] JtableCMSItem jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var query = from a in _context.cms_items.Where(x => x.published && (x.trash == null || x.trash == false))
                            //join b in _context.cms_categories.Where(x => x.published == true) on a.cat_id equals b.id
                            where (string.IsNullOrEmpty(jTablePara.Content) || (!string.IsNullOrEmpty(a.title) && a.title.ToLower().Contains(jTablePara.Content.ToLower()))
                            || (!string.IsNullOrEmpty(a.hash_tag) && a.hash_tag.ToLower().Contains(jTablePara.Content.ToLower()))) /*&& b.extra_fields_group == jTablePara.cmsCatGroupId*/
                            select new
                            {
                                Id = a.id,
                                Title = a.title,
                                Content = "...",
                                Created = a.created.HasValue ? a.created.Value.ToString("dd/MM/yyyy") : "",
                                CreatedBy = a.created_by,
                                Ordering = a.ordering
                            };

                var count = query.Count();
                var data = query.ToList();
                if (!jTablePara.QueryOrderBy.ToLower().Contains("id"))
                {
                    data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                }
                else
                {
                    data = query.OrderBy(x => x.Ordering).Skip(intBeginFor).Take(jTablePara.Length).ToList();
                }
                //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Content", "Created", "CreatedBy");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var data = new List<object>();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, 0, "Id", "Title", "Content", "Created", "CreatedBy");
                return Json(jdata);
            }
        }
        [HttpPost]
        public JsonResult GetListCMS(int? cmsCatId)
        {
            var list = new List<TreeCmsCat>();

            var cms = _context.cms_items.Where(x => /*x.published == true &&*/
            (x.trash == null || x.trash == false)).Select(p => new cms_items { id = p.id, title = p.title, cat_id = p.cat_id, ordering = p.ordering }).ToList();

            var listCat = _context.cms_categories
                .Where(x => x.published == true && (x.trash == null || x.trash == false)).OrderBy(x => x.ordering)
                .ToList();

            var rootNodes = listCat.Where(x => (cmsCatId == null && x.parent == null) || (x.id == cmsCatId && cmsCatId != null))
                .Select(x => new TreeCmsCat
                {
                    Id = x.id,
                    Title = x.name,
                    Level = 0,
                    ParentId = x.parent,
                    ListCmsItem = cms.Where(k => k.cat_id == x.id).OrderBy(k => k.ordering)
                        .Select(k => new CmsItem
                        {
                            id = k.id,
                            full_text = k.full_text,
                            title = k.title,
                        }).ToList()
                });

            foreach (var node in rootNodes)
            {
                list.Add(node);

                list.AddRange(GetTreeCatCms(listCat, 0, node.Id, new List<TreeCmsCat>(), cms, false));
            }

            return Json(list);
        }
        [NonAction]
        public List<TreeCmsCat> GetTreeCatCms(List<cms_categories> listCat, int level,
            int catId, List<TreeCmsCat> checkLoop, List<cms_items> cms, bool isFilterOn)
        {
            var listChild = listCat.Where(x => x.parent == catId);
            foreach (var item in listChild)
            {
                if (!checkLoop.Any(x => x.Id == item.id))
                {
                    var listCms = cms.Where(x => x.cat_id == item.id).OrderBy(k => k.ordering)
                                    .Select(x => new CmsItem
                                    {
                                        id = x.id,
                                        full_text = x.full_text,
                                        title = x.title,
                                    }).ToList();
                    var treeNode = new TreeCmsCat
                    {
                        Id = item.id,
                        Level = level + 1,
                        Title = item.name,
                        ParentId = item.parent,
                        ListCmsItem = listCms
                    };
                    if (!isFilterOn || treeNode.ListCmsItem.Count > 0)
                    {
                        checkLoop.Add(treeNode);
                    }
                    checkLoop = GetTreeCatCms(listCat, treeNode.Level, treeNode.Id, checkLoop, cms, isFilterOn);
                }
            }
            return checkLoop;
        }

        [HttpGet]
        public JsonResult GetContentCms(int id)
        {
            var content = "";
            var title = "";
            var objRs = new
            {
                Content = "",
                Title = "",
                ListFile = new List<object>()
            };

            try
            {
                var data = _context.cms_items.FirstOrDefault(x => x.id == id);
                if (data != null)
                {
                    content = data.full_text;
                    title = data.title;
                    var listFile = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode.Equals(id.ToString()) && x.ObjectType.Equals("CMS_ITEM"));
                    if (listFile.Count() > 0)
                    {
                        var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode.Equals(id.ToString()) && x.ObjectType.Equals("CMS_ITEM"))
                                      join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                                      join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                                      from f in f1.DefaultIfEmpty()
                                      select new
                                      {
                                          a.Id,
                                          b.FileCode,
                                          b.FileName,
                                          b.FileTypePhysic,
                                          b.Desc,
                                          b.CreatedTime,
                                          b.CloudFileId,
                                          TypeFile = "NO_SHARE",
                                          ReposName = f != null ? f.ReposName : "",
                                          b.FileID,
                                          SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                                          ListUserShare = "",
                                          b.CreatedBy
                                      }).Union(
                              from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                              join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                              join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                              join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                              from f in f1.DefaultIfEmpty()
                              let rela = JsonConvert.DeserializeObject<ObjRelativeContract>(a.ObjectRelative)
                              where rela.ObjectInstance.Equals(id.ToString()) && rela.ObjectType.Equals("CMS_ITEM")
                              select new
                              {
                                  Id = b.FileID,
                                  b.FileCode,
                                  b.FileName,
                                  b.FileTypePhysic,
                                  Desc = b.Desc != null ? b.Desc : "",
                                  b.CreatedTime,
                                  b.CloudFileId,
                                  TypeFile = "SHARE",
                                  ReposName = f != null ? f.ReposName : "",
                                  b.FileID,
                                  SizeOfFile = b.FileSize.HasValue ? b.FileSize.Value : 0,
                                  ListUserShare = a.ListUserShare,
                                  b.CreatedBy
                              })).AsNoTracking();

                        return Json(new
                        {
                            Content = content,
                            Title = title,
                            ListFile = query.OrderByDescending(x => x.FileID),
                        });
                    }
                    else
                    {
                        return Json(new
                        {
                            Content = content,
                            Title = title,
                            ListFile = new List<object>(),
                        });
                    }
                }
            }
            catch (Exception ex)
            {

            }

            return Json(objRs);
        }

        [HttpPost]
        public JsonResult PasteCmsItem(int itemId, int targetCatId)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.cms_items.FirstOrDefault(x => x.id.Equals(itemId));
                if (data != null)
                {
                    var obj = new cms_items
                    {
                        title = data.title + "_copy",
                        alias = data.alias + "_copy",
                        cat_id = targetCatId,
                        intro_text = data.intro_text,
                        created = data.created,
                        template = data.template,
                        featured_ordering = data.featured_ordering,
                        language = data.language,
                        created_by_alias = ESEIM.AppContext.UserName,
                        date_post = DateTime.Now,
                        full_text = data.full_text,
                        ordering = data.ordering,
                        gallery = data.gallery,
                        published = data.published,
                        hash_tag = data.hash_tag
                    };
                    _context.cms_items.Add(obj);
                    _context.SaveChanges();

                    var commonSettingArticles = _context.CommonSettingArticles.Where(x => !x.IsDeleted && x.ArticleCode == data.id.ToString());
                    foreach (var item in commonSettingArticles)
                    {
                        var objCSA = new CommonSettingArticle
                        {
                            CodeSet = item.CodeSet,
                            ValueSet = item.ValueSet,
                            Group = item.Group,
                            Priority = item.Priority,
                            Type = item.Type,
                            GroupNote = item.GroupNote,
                            ArticleCode = obj.id.ToString(),
                            Title = item.Title,
                            CreatedTime = DateTime.Now,
                            CreatedBy = ESEIM.AppContext.UserName,
                        };

                        _context.CommonSettingArticles.Add(objCSA);
                    }

                    var common = _context.CommonSettingArticles.Where(x => !x.IsDeleted && x.ArticleCode == data.id.ToString());
                    foreach (var item in commonSettingArticles)
                    {
                        var objCSA = new CommonSettingArticle
                        {
                            CodeSet = item.CodeSet,
                            ValueSet = item.ValueSet,
                            Group = item.Group,
                            Priority = item.Priority,
                            Type = item.Type,
                            GroupNote = item.GroupNote,
                            ArticleCode = obj.id.ToString(),
                            Title = item.Title,
                            CreatedTime = DateTime.Now,
                            CreatedBy = ESEIM.AppContext.UserName,
                        };

                        _context.CommonSettingArticles.Add(objCSA);
                    }
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["COM_MSG_COPY_SUCCESS"];
                    msg.ID = obj.id;
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];

                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật";
                msg.Title = _sharedResources["COM_MSG_COPY_FAILED"];
                return Json(msg);
            }
        }

        public class TreeCmsCat
        {
            public TreeCmsCat()
            {
                ListCmsItem = new List<CmsItem>();
            }
            public int Id { get; set; }
            public string Title { get; set; }
            public int Level { get; set; }
            public int? ParentId { get; set; }
            public List<CmsItem> ListCmsItem { get; set; }
        }
        public class CmsItem
        {
            public int id { get; set; }
            public string title { get; set; }
            public string full_text { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            try
            {
                var resourceObject = new JObject();
                var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                            .Union(_stringLocalizerCmsCat.GetAllStrings().Select(x => new { x.Name, x.Value }))
                            .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                            .Union(_stringLocalizerCmsItm.GetAllStrings().Select(x => new { x.Name, x.Value }))
                            .Union(_stringLocalizerEdms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                            .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                            .DistinctBy(x => x.Name);
                foreach (var item in query)
                {
                    resourceObject.Add(item.Name, item.Value);
                }
                return Ok(resourceObject);
            }
            catch (Exception ex)
            {
                return Ok("");
            }
        }
        #endregion

        #region Model
        public class VideoInfo
        {
            public int Id { get; set; }
            public int? Ordering { get; set; }
            public bool? Published { get; set; }
            public DateTime? CreatedDate { get; set; }
            public DateTime? ModifiDate { get; set; }
            public string Title { get; set; }
            public string Video { get; set; }
            public string Image { get; set; }
        }
        #endregion
    }
}
public class JtableCMSItem : JTableModel
{
    public int cmsCatGroupId { get; set; }
    public string Content { get; set; }
}