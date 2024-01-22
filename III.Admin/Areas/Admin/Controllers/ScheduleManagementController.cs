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
using III.Domain.Models;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ScheduleManagementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<ScheduleManagementController> _stringLocalizerSm;
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
        public ScheduleManagementController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<ScheduleManagementController> stringLocalizerSm,
            IStringLocalizer<LmsSubjectManagementController> stringLocalizerLmsSM,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerSm = stringLocalizerSm;
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

        [Breadcrumb("ViewData.CrumbScheduleManagement", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbScheduleManagement"] = _sharedResources["COM_BOT_SCHEDULE"];
            return View();
        }


        #region Function

        
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ScheduleManagements
                        select new
                        {
                            a.Id,
                            a.JobScCode,
                            a.JobScDesc,
                            a.JobScType,
                            a.JobScTitle,
                            a.JobScRunTime,
                            a.BotCode,
                            a.Status,
                            a.CreatedTime,
                            a.CreatedBy,
                            a.UpdatedBy,
                            a.UpdateTime,
                            a.IsDeleted,
                            a.DeletedBy,
                            a.DeletedTime,
                        };

            var count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "BotCode","JobScCode", "JobScType", "JobScDesc", "Status", "JobScRunTime", "JobScTitle", "CreatedTime", "CreatedBy", "UpdateTime", "UpdatedBy", "IsDeleted", "DeletedBy", "DeletedTime", "UserName", "Passwords", "Token", "SpiderName");
            return Json(jdata);
        }
        [HttpPost]
        public object Insert([FromBody] ScheduleManagement data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.ScheduleManagements.FirstOrDefault(x => x.Id == data.Id);
                if (model == null)
                {
                    var obj = new ScheduleManagement();
                    obj.Status = data.Status;
                    obj.JobScCode = data.JobScCode; 
                    obj.JobScDesc = data.JobScDesc;
                    obj.JobScType = data.JobScType;
                    obj.JobScTitle =data.JobScTitle;
                    obj.JobScRunTime = data.JobScRunTime;
                    obj.BotCode = data.BotCode;
                    obj.CreatedBy = User.Identity.Name;
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;

                    _context.ScheduleManagements.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["DOM_ADD_SUCCESSFULL"];//LMS_EXAM_MSG_ADD_SUCCESS
                    msg.ID = obj.Id;
                }
                else
                {
                    msg.Title = _sharedResources["DOM_ERROR_OCCUR"];//LMS_COURSE_LBL_COURSE_EXIST
                    msg.Error = true;
                }
                return Json(msg);
            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["DOM_ERROR_ADD"];//COM_ERR_ADD
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetListDomain()
        {
            var data = _context.BotManagements.Select(x => new { Code = x.BotSessionCode, Name = x.Url }).ToList();
            return data;
        }
        [HttpPost]
        public object UpdateAll([FromBody] ScheduleManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.ScheduleManagements.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    item.UpdatedBy = ESEIM.AppContext.UserName;
                    item.UpdateTime = DateTime.Now;
                    item.JobScRunTime = data.JobScRunTime;
                    item.JobScTitle = data. JobScTitle;
                    item.JobScType = data.JobScType;
                    item.JobScDesc = data.JobScDesc;
                    item.JobScCode = data.JobScCode;
                    item.Status = data.Status;
                    item.BotCode = data.BotCode;

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
                var data = _context.ScheduleManagements.FirstOrDefault(x => x.Id.Equals(id));
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
                    _context.ScheduleManagements.Remove(data);
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
        public void RunCrawler()
        {
            HttpRequestMessage httpRequest = null;
            HttpClient httpClient = null;
            try
            {
                httpRequest = new HttpRequestMessage(HttpMethod.Get, "http://localhost:9080/crawl.json?spider_name=upload&url=https://dieuhanh.vatco.vn/MobileLogin/InsertFile");
                //var json = JsonConvert.SerializeObject(data);
                //httpRequest.Headers.TryAddWithoutValidation("Authorization", "key=" + API_KEY);
                //httpRequest.Headers.TryAddWithoutValidation("Sender", $"id={senderId}");
                //httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
                httpClient = new HttpClient();
                //httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                using (HttpResponseMessage response = httpClient.SendAsync(httpRequest).Result)
                {
                    //if (response.IsSuccessStatusCode)
                    //{
                    //    msg.Error = false;
                    //    msg.Object = response.Content;
                    //}
                    //else
                    //{
                    //    msg.Error = true;
                    //    msg.Object = response.Content;
                    //}
                }
            }
            catch (Exception ex)
            {

                throw;
            }
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
        #endregion
        #region Model
        public class JTableModelSubject : JTableModel
        {
            public string SubjectCode { get; set; }
            public string SubjectName { get; set; }
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
                .Union(_stringLocalizerSm.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
