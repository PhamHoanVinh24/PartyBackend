using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AddonAppController : BaseController
    {
        public class JtableAddonAppModel : JTableModel
        {
            public string Code { get; set; }
            public string Title { get; set; }
            public string Date { get; set; }
        }

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<AddonAppController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AddonAppController(EIMDBContext context, IUploadService upload, IStringLocalizer<AddonAppController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbAddonApp", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuSystemSettingController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbAddonApp"] = "Quản lý ứng dụng con";
            return View();
        }
        [HttpPost]
        public object JTable([FromBody] JtableAddonAppModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var date = !string.IsNullOrEmpty(jTablePara.Date) ? DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.AddonApps
                        where ((date == null) || (a.AppDate.HasValue && a.AppDate.Value.Date == date.Value.Date))
                            && (string.IsNullOrEmpty(jTablePara.Code) || a.AppCode.ToLower().Contains(jTablePara.Code.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.Title) || a.AppTitle.ToLower().Contains(jTablePara.Title.ToLower()))
                        select new
                        {
                            a.Id,
                            a.AppCode,
                            a.AppTitle,
                            a.AppDate,
                            a.Note,
                            a.Icon,
                            a.LinkChplay,
                            a.Status
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AppCode", "AppTitle", "AppDate", "Note", "Icon", "LinkChplay", "Status");
            return Json(jdata);
        }

        [HttpPost]
        public object GetAddonStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AddonApps.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                var model = new AddonAppModel
                {
                    Id = data.Id,
                    AppCode = data.AppCode,
                    AppTitle = data.AppTitle,
                    AppDate = data.AppDate.HasValue ? data.AppDate.Value.ToString("dd/MM/yyyy") : null,
                    LinkChplay = data.LinkChplay,
                    UrlIcon = data.Icon,
                    Status = data.Status,
                    Note = data.Note,
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert(AddonAppModel obj, IFormFile icon)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkExist = _context.AddonApps.FirstOrDefault(x => x.AppCode.ToLower() == obj.AppCode.ToLower());
                if (checkExist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("ADA_MSG_CODE_APP"));
                }
                else
                {
                    if (icon != null)
                    {
                        var upload = _upload.UploadImage(icon);
                        if (!upload.Error)
                        {
                            var model = new AddonApp
                            {
                                AppCode = obj.AppCode,
                                AppTitle = obj.AppTitle,
                                AppDate = !string.IsNullOrEmpty(obj.AppDate) ? DateTime.ParseExact(obj.AppDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                                LinkChplay = obj.LinkChplay,
                                Icon = "/uploads/images/" + upload.Object.ToString(),
                                Status = obj.Status,
                                Note = obj.Note
                            };
                            _context.AddonApps.Add(model);
                            _context.SaveChanges();
                            msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("ADA_MSG_APP"));
                        }
                    }
                    else
                    {
                        var model = new AddonApp
                        {
                            AppCode = obj.AppCode,
                            AppTitle = obj.AppTitle,
                            AppDate = !string.IsNullOrEmpty(obj.AppDate) ? DateTime.ParseExact(obj.AppDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                            LinkChplay = obj.LinkChplay,
                            Status = obj.Status,
                            Note = obj.Note
                        };
                        _context.AddonApps.Add(model);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("ADA_MSG_APP"));
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update(AddonAppModel obj, IFormFile icon)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AddonApps.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (icon != null)
                    {
                        var upload = _upload.UploadImage(icon);
                        if (!upload.Error)
                        {
                            data.AppTitle = obj.AppTitle;
                            data.AppDate = !string.IsNullOrEmpty(obj.AppDate) ? DateTime.ParseExact(obj.AppDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                            data.LinkChplay = obj.LinkChplay;
                            data.Status = obj.Status;
                            data.Note = obj.Note;
                            data.Icon = "/uploads/images/" + upload.Object.ToString();
                            _context.SaveChanges();
                            msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("ADA_MSG_APP"));
                        }
                    }
                    else
                    {
                        data.AppTitle = obj.AppTitle;
                        data.AppDate = !string.IsNullOrEmpty(obj.AppDate) ? DateTime.ParseExact(obj.AppDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        data.LinkChplay = obj.LinkChplay;
                        data.Status = obj.Status;
                        data.Note = obj.Note;
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("ADA_MSG_APP"));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("ADA_MSG_EXITS_APP"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AddonApps.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var checkExistInAddonServer = _context.AddonAppServers.FirstOrDefault(x => x.AppCode == data.AppCode);
                    if (checkExistInAddonServer != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("ADA_MSG_EXITS_APP_ADDON"));
                    }
                    else
                    {
                        _context.AddonApps.Remove(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("ADA_MSG_APP"));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("ADA_MSG_EXITS_APP"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
            }
            return Json(msg);
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
    public class AddonAppModel
    {
        public int Id { get; set; }
        public string AppCode { get; set; }
        public string AppTitle { get; set; }
        public string AppDate { get; set; }
        public string LinkChplay { get; set; }
        public string UrlIcon { get; set; }
        public string Status { get; set; }
        public string Note { get; set; }
    }
}