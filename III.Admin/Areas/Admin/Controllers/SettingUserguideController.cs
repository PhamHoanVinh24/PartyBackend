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
using System.Net.Http;
using System.Data;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class SettingUserguideController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<SettingUserguideController> _stringLocalizerSu;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IRepositoryService _repositoryService;

        public SettingUserguideController(EIMDBContext context,
            IStringLocalizer<SettingUserguideController> stringLocalizerSu,
            IHostingEnvironment hostingEnvironment, IRepositoryService repositoryService,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizerSu = stringLocalizerSu;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
        }

        [Breadcrumb("ViewData.CrumbSettingUserguide", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuCenterController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbSettingUserguide"] = _sharedResources["COM_CRUMB_SETTING_USERGUIDE"];
            //ViewData["CrumbLMSSubjectManagement"] = _sharedResources["COM_CRUMB_LMS_SUBJECT_MANAGEMENT"];
            return View();
        }


        #region Function
        [HttpPost]
        public object JTable([FromBody] JTableCustom jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.SettingUserguides
                        where (string.IsNullOrEmpty(jTablePara.HelpId) || 
                               (!string.IsNullOrEmpty(a.HelpId) && a.HelpId.Contains(jTablePara.HelpId)))
                            && (string.IsNullOrEmpty(jTablePara.BookMark) || 
                                (!string.IsNullOrEmpty(a.BookMark) && a.BookMark.Contains(jTablePara.BookMark)))
                            && (string.IsNullOrEmpty(jTablePara.ArticleId) || a.ArticleId == jTablePara.ArticleId)
                        select new
                        {
                            a.Id,
                            a.HelpId,
                            a.ArticleId,
                            a.BookMark,
                            a.Description,
                            //a.CreatedTime,
                            //a.CreatedBy,
                            //a.UpdatedBy,
                            //a.UpdatedTime,
                            //a.IsDeleted,
                            //a.DeletedBy,
                            //a.DeletedTime,
                        };

            var count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jData = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "HelpId","ArticleId", "BookMark", "Description", "CreatedTime", "CreatedBy", "UpdateTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime");
            return Json(jData);
        }
        [HttpPost]
        public object Insert([FromBody] SettingUserguide data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.SettingUserguides.FirstOrDefault(x => x.HelpId == data.HelpId); ;
                if (model == null)
                {
                    var obj = new SettingUserguide();
                    obj.HelpId = data.HelpId;
                    obj.ArticleId = data.ArticleId; 
                    obj.BookMark = data.BookMark;
                    obj.Description = data.Description;                   
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;

                    _context.SettingUserguides.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];;//LMS_EXAM_MSG_ADD_SUCCESS
                    msg.ID = obj.Id;
                }
                else
                {
                    msg.Title = string.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizerSu["SETT_USERGUIDE_HELP"]);//LMS_COURSE_LBL_COURSE_EXIST
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];//COM_ERR_ADD
                return Json(msg);
            }
        }

        [HttpPost]
        public object UpdateAll([FromBody] SettingUserguide data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.SettingUserguides.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    var model = _context.SettingUserguides.FirstOrDefault(x => x.HelpId == data.HelpId && x.Id != data.Id); ;
                    if (model != null)
                    {
                        msg.Title = string.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizerSu["SETT_USERGUIDE_HELP"]);//LMS_COURSE_LBL_COURSE_EXIST
                        msg.Error = true;
                        return Json(msg);
                    }
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;
                    item.HelpId = data.HelpId;
                    item.ArticleId = data.ArticleId;
                    item.BookMark = data.BookMark;
                    item.Description = data.Description;


                    _context.SaveChanges();
                    msg.Title = string.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }

                msg.Error = true;
                msg.Title = string.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerSu["SETT_USERGUIDE_HELP"]);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = string.Format(_sharedResources["COM_UPDATE_FAIL"]);
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
                var data = _context.SettingUserguides.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = string.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizerSu["SETT_USERGUIDE_HELP"]);
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.SettingUserguides.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetListHelp()
        {
            var obj = from a in _context.SettingUserguides.Where(x => !x.IsDeleted)
                      select new
                      {
                          Code = a.HelpId
                      };

            return obj;
        }

        [HttpPost]
        public object GetCurrentCmsItem(int articleId)
        {
            return _context.cms_items.Select(x => new { Id = x.id, Name = x.title }).FirstOrDefault(x => x.Id == articleId);
        }

        [HttpPost]
        public object GetListCmsItem(int pageNo = 1, int pageSize = 10, string content = "")
        {
            //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
            var search = !string.IsNullOrEmpty(content) ? content : "";
            string[] param = new string[] { "@pageNo", "@pageSize", "@content" };
            object[] val = new object[] { pageNo, pageSize, search };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_CMS_ITEM", param, val);
            var data = CommonUtil.ConvertDataTable<cms_items>(rs).Select(x => new { Id = x.id, Name = x.title }).ToList();
            //return query;
            return data;
        }
        [HttpPost]
        public object GetItem(string helpId)
        {
            return _context.SettingUserguides.FirstOrDefault(x => x.HelpId == helpId);
        }
        #endregion
        #region Model
        public class JTableCustom : JTableModel
        {
            public string HelpId { get; set; }
            public string ArticleId { get; set; }
            public string BookMark { get; set; }
        }

        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerSu.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
