using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SymbolLibraryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SymbolLibraryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public SymbolLibraryController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<SymbolLibraryController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbSymbolLib", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuWfSystemController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuWfSystem"] = _sharedResources["COM_CRUMB_MENU_ACTIVITY"];
            ViewData["CrumbSymbolLib"] = _sharedResources["COM_CRUMB_SYMBOL_LIB"];
            return View();
        }

        #region Library
        [HttpPost]
        public JsonResult JTable([FromBody]JtableSymbolLibrary jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.WFSharpLibrarys.Where(x => !x.IsDeleted)
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted 
                            && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.SharpLibrary)) on a.SharpType equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.SharpCode) || a.SharpCode.ToLower().Contains(jTablePara.SharpCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.SharpName) || a.SharpName.ToLower().Contains(jTablePara.SharpName.ToLower()))
                        select new
                        {
                            a.ID,
                            a.SharpCode,
                            a.SharpName,
                            SharpType = b != null ? b.ValueSet : "",
                            a.SharpDesc
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "SharpCode", "SharpName", "SharpType", "SharpDesc");
            return Json(jdata);
        }

        [HttpGet]
        public JsonResult GetSharpLibraryImage()
        {
            var data = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.SharpLibrary))
                       select new
                       {
                           TypeName = a.ValueSet,
                           ListSharpLib = from b in _context.WFSharpLibrarys.Where(x => !x.IsDeleted && x.SharpType == a.CodeSet)
                                          select new
                                          {
                                              SharpCode = b.SharpCode,
                                              SharpName = b.SharpName,
                                              SharpData = b.SharpData,
                                              SharpType = b.SharpType,
                                              SharpPath = b.SharpPath,
                                          }
                       };
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertSharpLibrary([FromBody] WFSharpLibrary obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.WFSharpLibrarys.FirstOrDefault(x => !x.IsDeleted && x.SharpCode.Equals(obj.SharpCode));
                if (check == null)
                {
                    var library = new WFSharpLibrary
                    {
                        SharpCode = obj.SharpCode,
                        SharpName = obj.SharpName,
                        SharpData = obj.SharpData,
                        SharpType = obj.SharpType,
                        SharpDesc = obj.SharpDesc,
                        SharpPath = obj.SharpPath,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.WFSharpLibrarys.Add(library);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetSharpLibItem(int id)
        {
            var data = _context.WFSharpLibrarys.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            return Json(data);
        }

        [HttpPost]
        public JsonResult UpdateSharpLib([FromBody]WFSharpLibrary obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WFSharpLibrarys.FirstOrDefault(x => !x.IsDeleted && x.SharpCode == obj.SharpCode);
                if (data != null)
                {
                    data.SharpData = obj.SharpData;
                    data.SharpDesc = obj.SharpDesc;
                    data.SharpName = obj.SharpName;
                    data.SharpPath = obj.SharpPath;
                    data.SharpType = obj.SharpType;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    _context.WFSharpLibrarys.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteSharpLib(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WFSharpLibrarys.FirstOrDefault(x => x.ID == id);
                if(data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WFSharpLibrarys.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Title = "Bản ghi không tồn tại";
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                }
                else
                {
                    var mimeType = fileUpload.ContentType;
                    var extension = Path.GetExtension(fileUpload.FileName);
                    msg.Object = upload.Object;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class Label
        {
            public string type { get; set; }
            public string id { get; set; }
            public string x { get; set; }
            public string y { get; set; }
            public string width { get; set; }
            public string height { get; set; }
            public string alpha { get; set; }
            public bool selectable { get; set; }
            public bool draggable { get; set; }
            public int angle { get; set; }
            public string cssClass { get; set; }
            public object userData { get; set; }
            public List<Port> ports { get; set; }
            public string bgColor { get; set; }
            public string color { get; set; }
            public string stroke { get; set; }
            public string radius { get; set; }
            public string dasharray { get; set; }
            public string text { get; set; }
            public string outlineStroke { get; set; }
            public string outlineColor { get; set; }
            public int fontSize { get; set; }
            public string fontColor { get; set; }
            public string fontFamily { get; set; }
            public string locator { get; set; }
            public string path { get; set; }
        }

        public class Port
        {
            public string type { get; set; }
            public string id { get; set; }
            public string width { get; set; }
            public string height { get; set; }
            public string alpha { get; set; }
            public bool selectable { get; set; }
            public bool draggable { get; set; }
            public int angle { get; set; }
            public object userData { get; set; }
            public string cssClass { get; set; }
            public string bgColor { get; set; }
            public string color { get; set; }
            public string stroke { get; set; }
            public string dasharray { get; set; }
            public decimal maxFanOut { get; set; }
            public string name { get; set; }
            public string semanticGroup { get; set; }
            public string port { get; set; }
            public string locator { get; set; }
            public object locatorAttr { get; set; }
        }

        public class ObjectActivity
        {
            public string type { get; set; }
            public string id { get; set; }
            public string x { get; set; }
            public string y { get; set; }
            public string width { get; set; }
            public string height { get; set; }
            public string alpha { get; set; }
            public bool selectable { get; set; }
            public bool draggable { get; set; }
            public string angle { get; set; }
            public object userData { get; set; }
            public string cssClass { get; set; }
            public List<Port> ports { get; set; }
            public string bgColor { get; set; }
            public string color { get; set; }
            public string stroke { get; set; }
            public string radius { get; set; }
            public string dasharray { get; set; }
            public string dirStrategy { get; set; }
            public List<Label> labels { get; set; }
        }

        public class JtableSymbolLibrary : JTableModel
        {
            public string SharpCode { get; set; }
            public string SharpName { get; set; }
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