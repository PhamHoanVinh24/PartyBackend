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
    public class UserManualFrontEndController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UserManualController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public UserManualFrontEndController(EIMDBContext context, IStringLocalizer<UserManualController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
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

        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var listFileByUser = _context.FilesShareObjectUsers.Where(x => !x.IsDeleted && x.UserShares.Any(p => p.Code.Equals(User.Identity.Name)))
                                                           .Select(p => new
                                                           {
                                                               p.FileID,
                                                               p.ListUserShare,
                                                               p.UserShares
                                                           }).ToList();
            var session = HttpContext.GetSessionUser();

            var items = _context.cms_items.Where(x => x.published && (x.trash == false || x.trash == null));

            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => items.Any(k => k.id.ToString().Equals(x.ObjectCode)) && x.ObjectType.Equals("CMS_ITEM"))
                          join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          join g in listFileByUser on b.FileCode equals g.FileID into g1
                          from g in g1.DefaultIfEmpty()
                          where (listFileByUser.Any(x => x.FileID.Equals(b.FileCode)) || b.CreatedBy.Equals(User.Identity.Name) || session.IsAllData)
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
                              ListUserShare = g.ListUserShare,
                              b.CreatedBy
                          }).Union(
                  from a in _context.FilesShareObjectUsers.Where(x => !x.IsDeleted)
                  join c in _context.EDMSRepoCatFiles on a.FileID equals c.FileCode
                  join b in _context.EDMSFiles on c.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on c.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  let rela = JsonConvert.DeserializeObject<ObjRelativeContract>(a.ObjectRelative)
                  where items.Any(k => k.id.ToString().Equals(rela.ObjectInstance))
                    && rela.ObjectType.Equals("CMS_ITEM")
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
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode",
                "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName",
                "TypeFile", "SizeOfFile", "FileID", "ListUserShare", "CreatedBy");
            return jdata;
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
        public JsonResult GetListCMS(string title)
        {
            var cms = _context.cms_items.Where(x => x.published
                && (string.IsNullOrEmpty(title) || x.title.Contains(title))
                && (x.trash == null || x.trash == false))
                .Select(p => new cms_items { id = p.id, title = p.title, cat_id = p.cat_id })
                .ToList();

            var listCat = _context.cms_categories
                .Where(x => (x.trash == null || x.trash == false) && x.published == true)
                .ToList();

            var rootNodes = listCat.Where(x => x.extra_fields_group == 32)
                .Select(x => new TreeCmsCat
                {
                    Id = x.id,
                    Title = x.name,
                    Level = 0,
                    ParentId = x.parent,
                    ListCmsItem = cms.Where(k => k.cat_id == x.id)
                        .Select(k => new CmsItem
                        {
                            id = k.id,
                            full_text = k.full_text,
                            title = k.title,
                        }).ToList()
                });

            var list = new List<TreeCmsCat>();

            foreach (var node in rootNodes)
            {
                list.Add(node);

                list.AddRange(GetTreeCatCms(listCat, 0, node.Id, new List<TreeCmsCat>(), cms));
            }

            return Json(list);
        }
        [NonAction]
        public List<TreeCmsCat> GetTreeCatCms(List<cms_categories> listCat, int level,
            int catId, List<TreeCmsCat> checkLoop, List<cms_items> cms)
        {
            var listChild = listCat.Where(x => x.parent == catId);
            foreach (var item in listChild)
            {
                if (!checkLoop.Any(x => x.Id == item.id))
                {
                    var listCms = cms.Where(x => x.cat_id == item.id)
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
                    checkLoop.Add(treeNode);
                    checkLoop = GetTreeCatCms(listCat, treeNode.Level, treeNode.Id, checkLoop, cms);
                }
            }
            return checkLoop;
        }

        [HttpGet]
        public JsonResult GetContentCms(int id)
        {
            var content = "";
            var data = _context.cms_items.FirstOrDefault(x => x.id == id);
            if (data != null)
            {
                content = data.full_text;
            }
            return Json(content);
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
            public int? parentId { get; set; }
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