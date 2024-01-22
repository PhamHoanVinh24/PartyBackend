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
using System.Data;
using static III.Admin.Controllers.LmsTaskManagementController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReportSocialController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<FacebookSocialController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSM;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public ReportSocialController(EIMDBContext context, IStringLocalizer<FacebookSocialController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
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

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbLMSSubjectManagement"] = _sharedResources["COM_CRUMB_LMS_SUBJECT_MANAGEMENT"];
            return View();
        }

        #region Function
        [HttpPost]
        public object GetListSocial()
        {
            var data = _context.BotSocialManagement.Select(x => new { Code = x.BotSocialCode, Name = x.BotSocialName }).ToList();
            return data;
        }
        public class BotSocialogResult
        {
            public int Result { get; set; }
        }

        [HttpPost]
        public List<BotSocialogResult> BotSocialogResults(string code)
        {
            string[] param = new string[] { "@code" };
            object[] val = new object[] { code };
            DataTable rs = RepositoryService.GetDataTableProcedureSql("[P_GET_SOCIAL_SESSION_LOG]", param, val);
            var query = CommonUtil.ConvertDataTable<BotSocialogResult>(rs);
            return query;
        }
        [HttpPost]
        public List<BotSocialogResult> PieChartCrawlerRunningLog()
        {
            string[] param = new string[] {};
            object[] val = new object[] {};
            DataTable rs = RepositoryService.GetDataTableProcedureSql("[P_GET_COUNT_TOTAL_CRAWLER_RUNNING_LOG]", param,val);
            var query = CommonUtil.ConvertDataTable<BotSocialogResult>(rs);
            return query;
        }
        [HttpGet]
        public object AmChartCrawlerRunningLog()
        {
            var data = _context.VAmchartCrawlingLog.GroupBy(x => x.LstDay);
            var lst = new List<AmChartCrawlerRunningLogModel>();
            foreach (var item in data)
            {
                var obj = new AmChartCrawlerRunningLogModel
                {
                    Day = item.Key,
                    SumFile = item.FirstOrDefault().SumFile,
                    SumUrl = item.FirstOrDefault().SumUrl,
                    SumTimeScan = item.FirstOrDefault().SumTimeScan,
                    SumPasscap = item.FirstOrDefault().SumPasscap
                };
                lst.Add(obj);
            }

            return lst;
        }

        public class AmChartCrawlerRunningLogModel
        {
            public int Day { get; set; }
            public int SumFile { get; set; }
            public int SumUrl { get; set; }
            public int SumTimeScan { get; set; }
            public int SumPasscap { get; set; }

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
                .Union(_stringLocalizerLmsSM.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}
