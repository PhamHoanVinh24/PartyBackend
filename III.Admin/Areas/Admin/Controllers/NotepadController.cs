using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class NotepadController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ExcelController> _stringLocalizer;
        public static string _meetingID = new string("");
        public static int? _scheduleID = null;
        public static int? _lectureId = null;
        public NotepadController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ExcelController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            var model = new NotepadInfo();
            var session = HttpContext.GetSessionUser();
            var schedule = _context.MeetingSchedules.FirstOrDefault(x => x.Id == _scheduleID);
            var adUserInGroup = _context.AdUserInGroups.FirstOrDefault(x => !x.IsDeleted && x.UserId == session.UserId);
            var adGroupUser = adUserInGroup != null ? _context.AdGroupUsers.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.GroupUserCode == adUserInGroup.GroupUserCode) : null;
            var description = adGroupUser != null ? adGroupUser.Description : null;
            model.RoomID = _meetingID;
            model.ScheduleID = _scheduleID.ToString();
            model.UserName = session.FullName + (!String.IsNullOrEmpty(description) ? " (" + description + ")" : "");
            model.IsPopupAllowed = schedule.IsPopupAllowed.HasValue ? schedule.IsPopupAllowed.Value : false;
            model.LectureList = schedule.LectureList;
            model.LessonDoc = schedule.LessonDoc;
            Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
            Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
            return View(model);
        }
        public IActionResult Zoom()
        {
            var model = new RoomInfo();

            if (!string.IsNullOrEmpty(_meetingID))
            {
                var session = HttpContext.GetSessionUser();
                model = (from a in _context.ZoomManages.Where(x => !x.IsDeleted && x.ZoomId.Equals(_meetingID))
                         join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                         let accountZoom = _context.ApiTokenServices.FirstOrDefault(x => x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Description.Equals(a.AccountZoom))
                         let adUserInGroup = _context.AdUserInGroups.FirstOrDefault(x => !x.IsDeleted && x.UserId == session.UserId)
                         let meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => !x.IsDeleted && x.Id == _scheduleID)
                         let createdBy = meetingSchedule != null ? meetingSchedule.CreatedBy : a.CreatedBy
                         select new RoomInfo
                         {
                             RoomID = a.ZoomId,
                             ScheduleID = _scheduleID.HasValue ? _scheduleID.Value.ToString() : "999999",
                             RoomName = a.ZoomName,
                             RoomPassWord = a.ZoomPassword,
                             UserName = session.FullName + ((adUserInGroup != null) ? " (" +
                             _context.AdGroupUsers.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.GroupUserCode == adUserInGroup.GroupUserCode).Description + ")" :
                             ""),
                             CreatedBy = b.GivenName,
                             CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                             Role = session.UserName.Equals(createdBy) ? 1 : 0,//0 - Attendee 1 - Host 5 - Assistant
                             ApiKey = accountZoom != null ? accountZoom.Key : "",
                             ApiSecret = accountZoom != null ? accountZoom.ApiSecret : "",
                         }).FirstOrDefault();
            }
            Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
            Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
            return View(model);
        }
        public IActionResult ViewLecture()
        {
            var lecture = _context.EduLectures.FirstOrDefault(x => x.id == _lectureId);
            var model = new LectureInfo();
            model.Content = lecture.full_text;
            return View(model);
        }
        [HttpPost]
        public object GetLecture(int lectureId)
        {
            var msg = new JMessage { };
            _lectureId = lectureId;
            msg.Error = false;
            return msg;
        }
        [HttpPost]
        public object JoinSession(string meetingID, int? scheduleID = null)
        {
            _meetingID = "";
            var msg = new JMessage { };
            if (string.IsNullOrEmpty(meetingID))
            {
                msg.Error = true;
                msg.Title = "Thông tin cuộc họp trống";
                return msg;
            }
            else
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !x.IsDeleted && x.ZoomId.Equals(meetingID));
                if (check != null)
                {
                    var listUserAccess = JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserAccess);
                    if (listUserAccess.Any(x => x.UserName.Equals(session.UserName) || x.UserName.Equals("ALL")) || check.CreatedBy.Equals(session.UserName))
                    {
                        _meetingID = meetingID;
                        _scheduleID = scheduleID;
                        var listUserJoin = string.IsNullOrEmpty(check.ListUserJoin) ? new List<UserJoinMeeting>() : JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserJoin);
                        var userJoin = new UserJoinMeeting
                        {
                            UserId = session.UserId,
                            UserName = session.UserName,
                            GivenName = session.FullName
                        };

                        listUserJoin.Add(userJoin);

                        check.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : "";
                        _context.ZoomManages.Update(check);
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không được quyền tham gia cuộc họp cuộc họp";
                        return msg;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không lấy được thông tin cuộc họp";
                    return msg;
                }
                return msg;
            }
        }
        [HttpPost]
        public object GetListLectureItem(int lectureId)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                msg.Object = from a in _context.EduLectures
                             where a.published == true && a.id == lectureId
                             select new
                             {
                                 id = a.id,
                                 title = a.title,
                                 alias = a.alias,
                                 published = a.published,
                                 created = a.created,
                                 modified = a.modified,
                                 date_post = a.date_post,
                                 full_text = a.full_text,
                                 gallery = a.gallery,
                                 createBy = a.created_by_alias,
                             };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return msg;
        }
        #region Model
        public class UserJoinMeeting
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
        }
        public class NotepadInfo
        {
            public string RoomID { get; set; }
            public string ScheduleID { get; set; }
            public bool IsPopupAllowed { get; set; }
            public string LectureList { get; set; }
            public string LessonDoc { get; set; }
            //public string RoomName { get; set; }
            //public string RoomPassWord { get; set; }
            public string UserName { get; set; }
            //public string CreatedBy { get; set; }
            //public string CreatedTime { get; set; }
            //public int? Role { get; set; }
            //public string ListUserAccess { get; set; }
            //public bool IsEdit { get; set; }
            //public string ApiKey { get; set; }
            //public string ApiSecret { get; set; }
        }
        public class RoomInfo
        {
            public string RoomID { get; set; }
            public string ScheduleID { get; set; }
            public string RoomName { get; set; }
            public string RoomPassWord { get; set; }
            public string UserName { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public int? Role { get; set; }
            public string ListUserAccess { get; set; }
            public bool IsEdit { get; set; }
            public string ApiKey { get; set; }
            public string ApiSecret { get; set; }
        }
        public class LectureInfo
        {
            public string Content { get; set; }
        }
        #endregion
    }
}
