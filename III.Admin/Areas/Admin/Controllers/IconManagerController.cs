using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using ESEIM.Models;
using static ESEIM.Startup;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using ESEIM;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class IconManagerController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<IconManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelCustom : JTableModel
        {
            public string IconCode { set; get; }
            public string IconTitle { set; get; }
            public string ObjectCode { set; get; }
        }
        public IconManagerController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, ILogger<RoleController> logger, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IStringLocalizer<IconManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
            _logger = logger;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbIconManage", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["CrumbIconManage"] = _sharedResources["COM_CRUMB_ICON_MANAGER"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = _context.IconManagers
                .Where(p => (string.IsNullOrEmpty(jTablePara.IconCode) || p.IconCode.ToLower().Contains(jTablePara.IconCode.ToLower()))
                && (string.IsNullOrEmpty(jTablePara.IconTitle) || p.IconTitle.ToLower().Contains(jTablePara.IconTitle.ToLower()))
                && (string.IsNullOrEmpty(jTablePara.ObjectCode) || p.ObjectCode.ToLower().Contains(jTablePara.ObjectCode.ToLower())))
                .Select(x => new { x.Id, x.IconCode, x.IconTitle, x.IconPath, x.ObjectCode, x.ExpFilterSQL })
                .OrderUsingSortExpression(jTablePara.QueryOrderBy)
                .AsNoTracking();
            var count = query.ToList().Count();
            var data = query
                .Skip(intBeginFor).Take(jTablePara.Length)
                .ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "IconCode", "IconTitle", "IconPath", "ObjectCode", "EXPFilterSQL");
            return Json(jdata);
        }
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> Insert(IconManager obj, IFormFile image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var iconManager = _context.IconManagers.FirstOrDefault(x => x.IconCode == obj.IconCode);
                if (iconManager == null && obj != null)
                {
                    iconManager = new IconManager
                    {
                        IconCode = obj.IconCode,
                        IconTitle = obj.IconTitle,
                        ObjectCode = obj.ObjectCode,
                        ExpFilterSQL = obj.ExpFilterSQL
                    };
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        obj.IconPath = url;
                    }

                    _context.IconManagers.Add(obj);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["SET_IC_MAN_CURD_LBL_ICON_CODE"]);
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
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<JsonResult> Update(IconManager obj, IFormFile image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var iconManager = _context.IconManagers.FirstOrDefault(x => x.Id == obj.Id);
                if (iconManager != null)
                {
                    iconManager.IconCode = obj.IconCode;
                    iconManager.IconTitle = obj.IconTitle;
                    iconManager.ObjectCode = obj.ObjectCode;
                    iconManager.ExpFilterSQL = obj.ExpFilterSQL;
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        iconManager.IconPath = url;
                    }
                    _context.IconManagers.Update(iconManager);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.IconManagers.FirstOrDefault(x => x.Id == id);
                _context.IconManagers.Remove(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
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
        public JsonResult GetItem(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var query = _context.IconManagers.AsParallel().Where(x => x.Id.Equals(id)).FirstOrDefault();
                if (query == null)
                {
                    mess.Error = true;
                    //mess.Title = "Không tồn tại icon";
                    mess.Title = _sharedResources["COM_MSG_ERR"];
                }
                else
                {
                    mess.Object = query;
                }
            }
            catch (Exception ex)
            {
                mess.Error = true;
                mess.Object = ex.Message;
                //mess.Title = "Không tồn tại icon";
                mess.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(mess);
        }


        [HttpGet]
        public JsonResult GetIconLevels()
        {
            var iconManager = from a in _context.IconManagers
                              select new
                              {
                                  Code = a.IconCode,
                                  Name = a.IconTitle,
                                  Path = a.IconPath
                              };

            return Json(iconManager.ToList());
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