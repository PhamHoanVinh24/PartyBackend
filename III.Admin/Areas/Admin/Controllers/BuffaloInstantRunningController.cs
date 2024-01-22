using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using ESEIM.Models;
using ESEIM.Utils;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class BuffaloInstantRunningController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<ExamHomeController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<BuffaloInstantRunningController> _stringLocalizerBr;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public BuffaloInstantRunningController(EIMDBContext context, IStringLocalizer<ExamHomeController> stringLocalizer,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<BuffaloInstantRunningController> stringLocalizerBr,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerBr = stringLocalizerBr;
            _stringLocalizerCRAW = stringLocalizerCRAW;
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

        [Breadcrumb("ViewData.CrumbBuffaloInstantRunning", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbBuffaloInstantRunning"] = _sharedResources["COM_BOT_RUNNING"];
            return View();
        }


        #region Function
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            //int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.BwBotInstantDataminings
                        where a.Status == true
                        select new
                        {
                            a.Id,
                            a.MachineId,
                            a.ChannelId,
                            a.Ip,
                            a.LastSeen,
                            a.Status,
                            a.Flag,
                            a.CreatedTime,
                        };

            var count = query.Count();
            var data = query/*.Skip(intBegin).Take(jTablePara.Length)*/.ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "MachineId", "ChannelId", "Ip", "LastSeen", "Status", "Flag", "CreatedTime");
            return Json(jdata);
        }

        [AllowAnonymous]
        [HttpPost]
        public object GetListData(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.BwBotInstantDataminings.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    msg.Object = new BwBotInstantDatamining
                    {
                        Id = obj.Id,
                        MachineId = obj.MachineId,
                        ChannelId = obj.ChannelId,
                        Ip= obj.Ip,
                        LastSeen = obj.LastSeen,
                        Status = obj.Status,
                        Flag = obj.Flag,
                        CreatedTime = obj.CreatedTime,

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
        public object UpdateAll(BwBotInstantDatamining obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.BwBotInstantDataminings.FirstOrDefault(x => x.Id.Equals(obj.Id));
                if (data != null)
                {
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;
                    data.MachineId = obj.MachineId;
                    data.ChannelId = obj.ChannelId;
                    data.Ip= obj.Ip;
                    data.Status = obj.Status;
                    data.Flag = obj.Flag;

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                   
                    msg.Title = _sharedResources["Có lỗi xảy ra"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["Có lỗi xảy ra"];
                return Json(msg);
            }
        }


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
                .Union(_stringLocalizerCRAW.GetAllStrings().Select(x => new { x.Name, x.Value }))
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
