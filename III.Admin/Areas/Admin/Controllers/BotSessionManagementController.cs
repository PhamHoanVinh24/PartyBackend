using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;
//using SautinSoft;
using ESEIM.Models;
using ESEIM.Utils;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using Newtonsoft.Json.Linq;
//using III.Domain.Models;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class BotSessionManagementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<BotSessionManagementController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<BotSessionManagementController> _sharedResourcesBm;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSM;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public BotSessionManagementController(EIMDBContext context, IStringLocalizer<BotSessionManagementController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<BotSessionManagementController> sharedResourcesBm,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSM,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerCRAW = stringLocalizerCRAW;
            _sharedResourcesBm = sharedResourcesBm;
            _stringLocalizerLmsSM = stringLocalizerLmsSM;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }
        }

        [Breadcrumb("ViewData.CrumbBotManagement", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_CRAWLER"];
            ViewData["CrumbBotManagement"] = _sharedResources["COM_BOT_SESS_MANAGEMENT"];
            return View();
        }
        #region JTable
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.StartTime) ? DateTime.ParseExact(jTablePara.StartTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.EndTime) ? DateTime.ParseExact(jTablePara.EndTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (jTablePara.RobotCode == "" && jTablePara.StartTime == "" && jTablePara.EndTime == "" && jTablePara.Domain == "")
            {
                var query = from a in _context.BotManagements

                            select new
                            {
                                a.Id,
                                a.Url,
                                a.ListKeyWord,
                                a.BotSessionCode,
                                a.IdentifierBot,
                                a.RobotCode,
                                a.ConfigSelectorJson,
                                a.DeepScan,
                                a.DataStoragePath,
                                a.IsDownloadFile,
                                a.CreatedTime,
                                a.CreatedBy,
                                a.UpdatedTime,
                                a.UpdatedBy,
                                a.IsDeleted,
                                a.DeletedBy,
                                a.DeletedTime,
                                //a.UserName,   
                                //a.Passwords,
                                //a.Token,
                                //a.SpiderName
                            };
                var count = query.Count();
                var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ListKeyWord", "BotSessionCode", "RobotCode", "Url", "ConfigSelectorJson", "DeepScan", "DataStoragePath", "IsDownloadFile", "CreatedTime", "CreatedBy", "UpdatedTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime", "UserName", "Passwords", "Token", "SpiderName");
                return Json(jdata);
            }
            else
            {
                var query = from a in _context.BotManagements
                            where (string.IsNullOrEmpty(jTablePara.RobotCode) || a.RobotCode.Contains(jTablePara.RobotCode))
                            && (string.IsNullOrEmpty(jTablePara.Domain) || a.Url.ToLower().Contains(jTablePara.Domain.ToLower()))
                            /*&& (a.CreatedTime >= fromDate)
                            && (a.CreatedTime <= toDate)*/
                            select new
                            {
                                a.Id,
                                a.Url,
                                a.ListKeyWord,
                                a.BotSessionCode,
                                a.IdentifierBot,
                                a.RobotCode,
                                a.ConfigSelectorJson,
                                a.DeepScan,
                                a.DataStoragePath,
                                a.IsDownloadFile,
                                a.CreatedTime,
                                a.CreatedBy,
                                a.UpdatedTime,
                                a.UpdatedBy,
                                a.IsDeleted,
                                a.DeletedBy,
                                a.DeletedTime,
                                //a.UserName,   
                                //a.Passwords,
                                //a.Token,
                                //a.SpiderName
                            };
                var count = query.Count();
                var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ListKeyWord", "BotSessionCode", "RobotCode", "Url", "ConfigSelectorJson", "DeepScan", "DataStoragePath", "IsDownloadFile", "CreatedTime", "CreatedBy", "UpdatedTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime", "UserName", "Passwords", "Token", "SpiderName");
                return Json(jdata);
                
            }    
            

            
           
        }
        
        [HttpPost]
        public object Insert([FromBody] BotManagements data)
        {

            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.BotManagements.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    data.IsDeleted = false;
                    _context.BotManagements.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["Thêm mới thành công"];//LMS_EXAM_MSG_ADD_SUCCESS
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = _sharedResources["Lỗi xảy ra"];//LMS_COURSE_LBL_COURSE_EXIST
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["Có lỗi khi thêm"];//COM_ERR_ADD
                return Json(msg);
            }
        }
        
        [HttpPost]
        public object GetListDomain()
        {
            var data = _context.CrawlerDomainConfigurations.Select(x => new { Code = x.Id, Name = x.DomainName }).ToList();
            return data;
        }
        [HttpPost]
        public object UpdateAll([FromBody] BotManagements data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.BotManagements.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;
                    item.ListKeyWord = data.ListKeyWord;
                    item.IsDownloadFile = data.IsDownloadFile;
                    item.DeepScan = data.DeepScan;
                    item.DataStoragePath = data.DataStoragePath;
                    item.ConfigSelectorJson = data.ConfigSelectorJson;
                    item.Url = data.Url;
                    item.RobotCode = data.RobotCode;
                    item.BotSessionCode = data.BotSessionCode;
                    item.IdentifierBot = data.BotSessionCode;

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.BotManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["LMS_COURSE_LBL_COURSE_NOT_EXIST"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.BotManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["Xóa thành công"];//LMS_MSG_DELETE_SUCCESS
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetDataSession(int id)
        {
            var data = from a in _context.BotManagements
                       where a.Id == id
                       select new
                       {
                           a.Id,
                           a.Url,
                           a.ListKeyWord,
                           a.BotSessionCode,
                           a.IdentifierBot,
                           a.RobotCode,
                           a.ConfigSelectorJson,
                           a.DeepScan,
                           a.DataStoragePath,
                           a.IsDownloadFile,
                           a.CreatedTime,
                           a.CreatedBy,
                           a.UpdatedTime,
                           a.UpdatedBy,
                           a.IsDeleted,
                           a.DeletedBy,
                           a.DeletedTime,
                           //a.UserName,   
                           //a.Passwords,
                           //a.Token,
                           //a.SpiderName
                       };
            return data;
        }
        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResourcesBm.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCRAW.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsSM.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}