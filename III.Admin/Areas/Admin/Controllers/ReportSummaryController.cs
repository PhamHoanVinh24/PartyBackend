using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using ESEIM.Models;
using ESEIM.Utils;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Data;
using System;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReportSummaryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;

        private readonly IStringLocalizer<FacebookSocialController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<ReportSummaryController> _stringLocalizerBr;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSM;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public ReportSummaryController(EIMDBContext context,
            IStringLocalizer<FacebookSocialController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<ReportSummaryController> stringLocalizerBr,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSM,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerBr = stringLocalizerBr;
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
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_CRAWLER"];
            ViewData["CrumbLMSSubjectManagement"] = _sharedResources["COM_CRUMB_LMS_SUBJECT_MANAGEMENT"];
            return View();
        }

        public class CrawlerContent : JTableModel
        {

            public string Content { get; set; }

        }

        #region
        [HttpPost]
        public object PythonJtableWithContent(JtableFileModelFile jTablePara, int intBeginFor)
        {

            var queryLucene = SearchLuceneFile(jTablePara.Content, intBeginFor, jTablePara.Length);

            

            return queryLucene;
        }

        public JsonResult GetlistLinkPost(string FileCode)
        {
            //var data = _context.CrawlerSessionContentResults.Where(x => x.Id.ToString() == FileCode )
            //            .Select(x => new
            //            {
            //                LinkPost = x.LinkPost,
            //                TextContent = x.TextContent,
            //                BotCode = x.BotCode,
            //                SessionCode = x.SessionCode,
            //                CreatedTime = x.CreatedTime
            //            }).ToList();
            //return Json(data);
            return null;
        }


        [NonAction]
        private (IEnumerable<EDMSJtableFileModel> listLucene, int total) SearchLuceneFile(string content, int page, int length)
        {
            try
            {
                var moduleObj = (EDMSCatRepoSetting)_upload.GetPathByModule("DB_LUCENE_INDEX").Object;
                // var luceneCategory = _context.EDMSCategorys.FirstOrDefault(x => x.CatCode == moduleObj.CatCode);
                //var PathServerPhysic = @"D:\wwwroot\III.SWORK.VATCO 2.2 NEW\wwwroot\uploads\repository\INDEX_SEARCH DEMO";
                var PathServerPhysic = @"D:\wwwroot\III.SWORK.VATCO 2.2 NEW\wwwroot\uploads\repository\INDEX_SEARCH CRAWL";

                /*String command = @"G:\NotePad\test.bat";
                System.Diagnostics.Process proc = new System.Diagnostics.Process();
                proc.StartInfo.FileName = command;
                proc.StartInfo.WorkingDirectory = @"G:\NotePad";
                proc.Start();*/
                //new ProcessStartInfo("cmd.exe", "/c " + command);

                return LuceneExtension.SearchHighligh(content /*Keyword*/, PathServerPhysic, page, length, "Content");

            }
            catch (Exception ex)
            {
                return (new List<EDMSJtableFileModel>(), 0);
            }
        }
        public class FileByUser
        {
            public string FileID { get; set; }
            public string ListUserShare { get; set; }

            public List<ESEIM.Models.UserShare> UserShares
            {
                get;
                set;
            }
        }
        public class JtableFileModelFile : JTableModel
        {

            public string Content { get; set; }
            public string FileCode { get; set; }
            public string IdentifierCode { get; set; }
            public string UrlPost { get; set; }

        }
        #endregion




        #region Function

        public class CountCrawlerRunningLogResult
        {
            public int SumPassCap { get; set; }
            public int SumUrl { get; set; }
            public int SumFile { get; set; }
            public int SumTimeScan { get; set; }
            public int SumSize { get; set; }
        }
        public class GetCountCrawlData
        {
            public string SessionCode { get; set; }
            public string FileResultData { get; set; }
            public string KeyWord { get; set; }
            public string KeyExsist { get; set; }
            public int CountTimes { get; set; }
        }
        [HttpPost]
        public List<CountCrawlerRunningLogResult> GetCountCrawlerRunningLog(string domain, string starttime, string endtime)
        {
            string[] param = new string[] { "@Domain", "@StartTime", "@EndTime" };
            object[] val = new object[] { domain, starttime, endtime };
            DataTable rs = RepositoryService.GetDataTableProcedureSql("[P_GET_COUNT_PASSCAPT_CRAWLER_RUNNING_LOG]", param, val);
            var query = CommonUtil.ConvertDataTable<CountCrawlerRunningLogResult>(rs);
            return query;
        }
        [HttpPost]
        public List<GetCountCrawlData> GetCountCrawlDataLog(string domain, string starttime, string endtime)
        {
            string[] param = new string[] { "@Domain", "@StartTime", "@EndTime" };
            object[] val = new object[] { domain, starttime, endtime };
            DataTable rs = RepositoryService.GetDataTableProcedureSql("[P_GET_COUNT_CRAWL_DATA]", param, val);
            var query = CommonUtil.ConvertDataTable<GetCountCrawlData>(rs);
            return query;
        }
        /*public class GetLinkedinData
        {
            public string ProfileUrl { get; set; }
            public string ElementSite { get; set; }
        }*/
        /*[HttpPost]
        public List<GetLinkedinData> GetDataLinkedin(string domain)
        {
            string[] param = new string[] { "@Domain" };
            object[] val = new object[] { domain };
            DataTable rs = RepositoryService.GetDataTableProcedureSql("[P_LINKEDIN_GET_DATA]", param, val);
            var query = CommonUtil.ConvertDataTable<GetLinkedinData>(rs);
            return query;
        }*/
        [HttpPost]
        public object GetFileResult(string SessionCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.CrawlerRunningLogs.FirstOrDefault(x => x.SessionCode.Equals(SessionCode));
                if (obj != null)
                {
                    msg.Object = new CrawlerRunningLog
                    {
                        Id = obj.Id,
                        FileResultData = obj.FileResultData,

                    };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin ";
                    msg.Title = _stringLocalizer["CMH_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _stringLocalizer["CMH_ERROR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public List<CountCrawlerRunningLogResult> PieChartCrawlerRunningLog()
        {
            string[] param = new string[] { };
            object[] val = new object[] { };
            DataTable rs = RepositoryService.GetDataTableProcedureSql("[P_GET_COUNT_TOTAL_CRAWLER_RUNNING_LOG]", param, val);
            var query = CommonUtil.ConvertDataTable<CountCrawlerRunningLogResult>(rs);
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
        [HttpPost]
        public object GetListDomain()
        {
            var data = _context.CrawlerRunningLogs.Select(x => new { Code = x.BotCode, Name = x.BotCode }).Distinct().ToList();
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
                .Union(_stringLocalizerCRAW.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLmsSM.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerBr.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
