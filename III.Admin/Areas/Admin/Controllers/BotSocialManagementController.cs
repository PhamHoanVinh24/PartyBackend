using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using ESEIM.Models;
using ESEIM.Utils;
using ESEIM;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using System.Net;
using Newtonsoft.Json.Linq;
using III.Domain.Models;
//using III.Domain.Models;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class BotSocialManagementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FacebookSocialController> _stringLocalizerFs;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSM;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public BotSocialManagementController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<FacebookSocialController> stringLocalizerFs,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSM,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerCRAW = stringLocalizerCRAW;
            _stringLocalizerLmsSM = stringLocalizerLmsSM;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizerFs = stringLocalizerFs;
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

        [Breadcrumb("ViewData.CrumbBotSocialManagement", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbBotSocialManagement"] = _sharedResources["COM_BOT_SOCIAL_MANAGEMENT"];
            return View();
        }
        #region JTable
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.BotSocialManagement
                        select new
                        {
                            a.Id,
                            a.BotSocialName,
                            a.BotSocialCode,
                            a.BotSocialType,
                            a.UserName,
                            a.PassWord,
                            a.Credential,
                            a.Tocken,
                            a.Description,
                            a.ConditionStatement,

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
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "BotSocialName", "BotSocialCode", "BotSocialType", "UserName", "PassWord", "Credential", "Tocken", "Description", "ConditionStatement", "CreatedTime", "CreatedBy", "UpdatedTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime", "UserName", "Passwords");
            return Json(jdata);
        }
        [HttpPost]
        public object Insert([FromBody] BotSocialManagement data)
        {

            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.BotSocialManagement.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    data.IsDeleted = false;
                    _context.BotSocialManagement.Add(data);
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
        public object GetListBot()
        {
            var data = _context.BotSocialManagement.Select(x => new { Code = x.Id, Name = x.BotSocialName, }).ToList();
            return data;
        }
        [HttpPost]
        public object UpdateAll([FromBody] BotSocialManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.BotSocialManagement.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;
                    item.BotSocialType = data.BotSocialType;
                    item.BotSocialCode = data.BotSocialCode;
                    item.BotSocialName = data.BotSocialName;
                    item.Tocken = data.Tocken;
                    item.Description = data.Description;
                    item.Credential = data.Credential;
                    item.UserName = data.UserName;
                    item.PassWord = data.PassWord;
                    item.ConditionStatement = data.ConditionStatement;

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
        public object UpdateCondition([FromBody] BotSocialManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.BotSocialManagement.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;                  
                    item.ConditionStatement = data.ConditionStatement;
                    item.BotSocialType = item.BotSocialType;
                    item.BotSocialCode = item.BotSocialCode;
                    item.BotSocialName = item.BotSocialName;
                    item.Tocken = item.Tocken;
                    item.Description = item.Description;
                    item.Credential = item.Credential;
                    item.UserName = item.UserName;
                    item.PassWord = item.PassWord;

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
                var data = _context.BotSocialManagement.FirstOrDefault(x => x.Id.Equals(id));
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
                    _context.BotSocialManagement.Remove(data);
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
        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCRAW.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFs.GetAllStrings().Select(x => new { x.Name, x.Value }))
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