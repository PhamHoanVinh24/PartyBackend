using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class GalaxyKeywordController : BaseController
    {
        public class GalaxyKeywordJtableModel : JTableModel
        {
            public string DateFrom { get; set; }
            public string DateTo { get; set; }
            public string Keyword { get; set; }
            public string CreatedBy { get; set; }
        }

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<GalaxyKeywordController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public GalaxyKeywordController(EIMDBContext context, IUploadService upload, IStringLocalizer<GalaxyKeywordController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["Title"] = _sharedResources["COM_CRUMB_GALAXY_KEY_WORD"];
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]GalaxyKeywordJtableModel jTablePara)
        {
            var dateFrom = !string.IsNullOrEmpty(jTablePara.DateFrom) ? DateTime.ParseExact(jTablePara.DateFrom, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var dateTo = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.GalaxyKeywords
                        where (string.IsNullOrEmpty(jTablePara.Keyword) || (!string.IsNullOrEmpty(a.Keyword) && a.Keyword.ToLower().Contains(jTablePara.Keyword.ToLower())))
                        && (string.IsNullOrEmpty(jTablePara.CreatedBy) || (!string.IsNullOrEmpty(a.CreatedBy) && a.CreatedBy.ToLower().Contains(jTablePara.CreatedBy.ToLower())))
                        && (dateFrom == null || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= dateFrom))
                        && (dateTo == null || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= dateTo))
                        select new
                        {
                            a.Id,
                            a.Keyword,
                            a.Group,
                            a.CreatedBy,
                            a.CreatedTime,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Keyword", "Group", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var data = _context.GalaxyKeywords.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]GalaxyKeyword obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.CreatedTime = DateTime.Now;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                _context.GalaxyKeywords.Add(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["GKW_KEYWORK"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]GalaxyKeyword obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.UpdatedTime = DateTime.Now;
                obj.UpdatedBy = ESEIM.AppContext.UserName;
                _context.GalaxyKeywords.Update(obj);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["GKW_KEYWORK"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.GalaxyKeywords.FirstOrDefault(x => x.Id == id);
                _context.GalaxyKeywords.Remove(data);
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["GKW_KEYWORK"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetAutocomplete(string key)
        {
            var listData = _context.GalaxyKeywords.Where(x => string.IsNullOrEmpty(key) || x.Keyword.ToLower().Contains(key.ToLower())).Select(x => x.Keyword);
            return listData;
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}