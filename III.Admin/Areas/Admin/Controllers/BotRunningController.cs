using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
//using SautinSoft;
using ESEIM.Models;
using ESEIM.Utils;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class BotRunningController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<BotRunningController> _stringLocalizerBr;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsSubjectManagementController> _stringLocalizerLmsSM;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public BotRunningController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<BotRunningController> stringLocalizerBr,
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

        [Breadcrumb("ViewData.CrumbBotRunning", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_CRAWLER"];
            ViewData["CrumbBotRunning"] = _sharedResources["COM_BOT_RUNNING"];
            return View();
        }


        #region Function
        [HttpPost]
        public object JTable1([FromBody] JTableModel jTablePara)
        {
            //int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CrawlerRunningLogs
                        select new
                        {
                            a.Id,
                            a.SessionCode,
                            a.StartTime,
                            a.EndTime,
                            a.UrlScanJson,
                            a.FileDownloadJson,
                            a.NumOfFile,
                            a.FileResultData,
                            a.NumPasscap,
                            a.UserIdRunning,
                            a.Ip,
                            a.Status,
                            a.BotCode,
                            a.TimeScan,
                            a.CreatedTime,
                            a.CreatedBy,
                            a.UpdatedTime,
                            a.UpdatedBy,
                            a.IsDeleted,
                            a.DeletedBy,
                            a.DeletedTime,
                        };

            var count = query.Count();
            var data = query/*.Skip(intBegin).Take(jTablePara.Length)*/.ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileDownloadJson","TimeScan", "BotCode", "Ip", "Status", "NumOfFile", "FileResultData", "UserIdRunning", "NumPasscap", "UrlScanJson", "EndTime", "StartTime", "SessionCode", "CreatedTime", "CreatedBy", "UpdatedTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime");
            return Json(jdata);
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
        public object GetListData(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.BotManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    msg.Object = new BotManagements
                    {
                        Id = obj.Id,
                        Url = obj.Url,
                        BotSessionCode = obj.BotSessionCode,
                        IdentifierBot = obj.IdentifierBot,
                        RobotCode = obj.RobotCode,
                        ListKeyWord = obj.ListKeyWord,
                        DataStoragePath = obj.DataStoragePath,
                        ConfigSelectorJson = obj.ConfigSelectorJson,
                        DeepScan = obj.DeepScan,
                        IsDownloadFile = obj.IsDownloadFile,

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
        public object CountSessionCode(String BotSessionCode)
        {
            var query = from a in _context.BotManagements
                        where  a.BotSessionCode.ToLower().Contains(BotSessionCode.ToLower())

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
            // End
            var count = query.Count();
            return count;
        }
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.BotManagements
                        where string.IsNullOrEmpty(jTablePara.RobotCode) || a.RobotCode.ToLower().Contains(jTablePara.RobotCode.ToLower())

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
            // End
            var count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Url", "ListKeyWord", "BotSessionCode", "RobotCode",  "ConfigSelectorJson", "DeepScan", "DataStoragePath", "IsDownloadFile", "CreatedTime", "CreatedBy", "UpdatedTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime", "UserName", "Passwords", "Token", "SpiderName");
            return Json(jdata);
            
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
                var data = _context.CrawlerRunningLogs.FirstOrDefault(x => x.Id.Equals(id));
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
                    _context.CrawlerRunningLogs.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_MSG_DELETE_SUCCESS"];
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
        public object GetSubject(int id)
        {
            var data = _context.LmsSubjectManagements.Select(x => new LmsSubjectData()
            {
                Id = x.Id,
                SubjectName = x.SubjectName,
                SubjectCode = x.SubjectCode,
                SubjectDescription = x.SubjectDescription,
                Teacher = x.Teacher,
                Duration = x.Duration,
                Unit = x.Unit,
                ImageCover = x.ImageCover,
                VideoPresent = x.VideoPresent,
                FileBase = x.FileBase,
                Status = x.Status,
                ListLecture = new List<LmsLectureManagement>(),
                ListQuiz = new List<QuizPool>(),
            }).FirstOrDefault(x => x.Id == id);
            data.ListLecture = _context.LmsLectureManagements.Where(x => x.SubjectCode == data.SubjectCode).ToList();
            data.ListQuiz = _context.QuizPools.Where(x => x.SubjectCode == data.SubjectCode && !x.IsDeleted).ToList();
            return data;
        }
        [HttpPost]
        public object RunCrawler(int id)
        {

            //HttpRequestMessage httpRequest = null;
            //HttpClient httpClient = null;
            //try
            //{
            //    //httpRequest = new HttpRequestMessage(HttpMethod.Get, "http://localhost:9081/crawl.json?spider_name=upload&url=https://dieuhanh.vatco.vn/MobileLogin/InsertFile");
            //    httpRequest = new HttpRequestMessage(HttpMethod.Get, "http://localhost:9087/crawl.json?spider_name=Tailieu&url=https://dieuhanh.vatco.vn/MobileLogin/InsertFile");
            //    httpClient = new HttpClient();
            //    using (HttpResponseMessage response = httpClient.SendAsync(httpRequest).Result)
            //    {
            //        //if (response.IsSuccessStatusCode)
            //        //{
            //        //    msg.Error = false;
            //        //    msg.Object = response.Content;
            //        //}
            //        //else
            //        //{
            //        //    msg.Error = true;
            //        //    msg.Object = response.Content;
            //        //}
            //    }
            //}
            //catch (Exception ex)
            //{

            //    throw;
            //}
            var data = _context.BotManagements.FirstOrDefault(x => x.Id == id);
            return data;
        }
        [HttpPost]
        public object StopCrawler(int id)
        {            
            var data = _context.BotManagements.FirstOrDefault(x => x.Id == id);
            return data;
        }
        [HttpPost]
        public object GetListDetailQuiz(string subjectCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = from a in _context.QuizPools.Where(x => !x.IsDeleted && x.SubjectCode.Equals(subjectCode))
                          select new
                          {
                              a.Id,
                              a.Duration,
                              a.Unit,
                              Mark = 10, // Default
                              a.Content,
                              a.Code,
                              a.Type,
                              a.JsonData,
                              IdQuiz = a.Id
                          };

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["LMS_EXAM_MSG_NOT_FOUND_QT"];
            }

            return msg;
        }

        [HttpPost]
        public object UpdateViewingLectureProgress([FromBody] LmsTaskUserItemProgress obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.LmsTaskUserItemProgresses.Where(x => x.User.Equals(obj.User) && x.ProgressAuto != 100
                && x.TrainingType.Equals("VIEW_LECTURE") && !x.IsDeleted && x.ItemCode.Equals(obj.ItemCode));
                if (data != null)
                {
                    foreach (var item in data)
                    {
                        item.ProgressAuto = 100;
                        _context.LmsTaskUserItemProgresses.Update(item);
                    }

                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["COM_UPDATE_FAIL"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public object LogSession([FromBody] UserLearnSubject data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.UserLearnSubjects.FirstOrDefault(x => x.SessionCode == data.SessionCode && x.CreatedBy == User.Identity.Name && x.LectureCode == data.LectureCode);
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.UserLearnSubjects.Add(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_EXAM_MSG_SAVE_SUCCESS"];
                }
                else
                {
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    if (data.StartTime != null && model.StartTime == null)
                    {
                        model.StartTime = data.StartTime;
                    }
                    if (data.StopTime != null && model.StopTime == null)
                    {
                        model.StopTime = data.StopTime;
                    }
                    _context.UserLearnSubjects.Update(model);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["LMS_SM_LEARNED_LECTURE"];
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }

       /* public JsonResult GetAllDataBotRunning()
        {
            var data = from x in _context.CrawlerManageIpRunningBots
                select(
                x => new
                {
                    x.Id,
                    x.RobotCode,
                    x.PortComputer,
                    x.IpComputer
                }).ToList();
            return Json(data);

        }*/

        #endregion
        #region Model
        public class JTableModelSubject : JTableModel
        {
            public string SubjectCode { get; set; }
            public string SubjectName { get; set; }

            public string RobotCode { get; set; }
        }
        public class LmsSubjectData : LmsSubjectManagement
        {
            public List<LmsLectureManagement> ListLecture { get; set; }
            public List<QuizPool> ListQuiz { get; set; }
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
