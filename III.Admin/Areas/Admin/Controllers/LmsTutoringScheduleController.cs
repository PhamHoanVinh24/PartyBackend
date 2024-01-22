using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public class LmsTutoringScheduleController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MeetingScheduleController> _stringLocalizerMs;
        private readonly IStringLocalizer<LmsTutoringScheduleController> _stringLocalizerLmsTs;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizerSTRE;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<TokenManagerController> _stringLocalizerTm;

        public LmsTutoringScheduleController(EIMDBContext context, IUploadService upload, IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<MeetingScheduleController> stringLocalizerMs, IStringLocalizer<LmsTutoringScheduleController> stringLocalizerLmsTs,
            IStringLocalizer<TokenManagerController> stringLocalizerTm,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<StaffRegistrationController> stringLocalizerSTRE)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizerMs = stringLocalizerMs;
            _stringLocalizerSTRE = stringLocalizerSTRE;
            _stringLocalizerLmsTs = stringLocalizerLmsTs;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerTm = stringLocalizerTm;
        }

        [Breadcrumb("ViewData.CrumbLmsTutoringSchedule", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbLmsTutoringSchedule"] = _sharedResources["COM_CRUMB_MEETING_SCHEDULE"];
            return View();
        }

        #region JTable
        public class JtableTutorScheduleModel : JTableModel
        {
            public string Date { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody] JtableTutorScheduleModel jTablePara)
        {
            var dateStart = DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var dateEnd = dateStart.AddDays(1);
            var session = HttpContext.GetSessionUser();
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.LmsTutoringSchedules.Where(x => !x.IsDeleted)
                             //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                         join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                         from c in c1.DefaultIfEmpty()
                         where (session.IsAllData || a.Teacher == session.UserName || (a.ListUserObject.Any(y => y.userName == session.UserName || string.IsNullOrEmpty(y.userName))) || a.CreatedBy == session.UserName)
                         && ((a.StartTime >= dateStart && a.StartTime <= dateEnd) || (a.EndTime >= dateStart && a.EndTime <= dateEnd) || (a.StartTime <= dateStart && dateEnd <= a.EndTime))
                         select new
                         {
                             a.Id,
                             a.Title,
                             StartTime = a.StartTime.Value.ToString("dd/MM/yyyy HH:mm"),
                             EndTime = a.EndTime.Value.ToString("dd/MM/yyyy HH:mm"),
                             a.Description,
                             Color = a.BackgroundColor,
                             //Status = b.ValueSet,
                             //StatusCode = a.Status,
                             MeetingId = c != null ? c.ZoomId : "",
                             a.AccountZoom,
                             a.ListUserApproved,
                         }).ToList();

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "StartTime", "EndTime", "Color", "MeetingId", "Description", "ListUserApproved");
            return Json(jdata);
        }
        #endregion

        #region Combobox
        [HttpGet]
        public object GetListUser()
        {
            return _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { x.UserName, x.GivenName });
        }

        [HttpGet]
        public object GetListLesson()
        {
            var lessonCategory = _context.EDMSCategorys.FirstOrDefault(x => !x.IsDeleted && x.ModuleFileUploadDefault == "LESSON");
            if (lessonCategory != null)
            {
                var listLessonCategoryChild = _context.EDMSCategorys.Where(x => !x.IsDeleted && x.CatParent == lessonCategory.CatCode);
                var data = from a in _context.EDMSFiles.Where(x => !x.IsDeleted)
                           join b in _context.EDMSRepoCatFiles on a.FileCode equals b.FileCode
                           join c in _context.EDMSCategorys.Where(x => !x.IsDeleted) on b.CatCode equals c.CatCode
                           where (c.ModuleFileUploadDefault == "LESSON" || listLessonCategoryChild.Any(x => x.CatCode == c.CatCode))
                           select new
                           {
                               FileId = a.FileID,
                               a.FileName,
                               a.FileTypePhysic,
                               Subject = c.CatName,
                               a.CreatedBy,
                               CreatedTime = a.CreatedTime.HasValue ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : ""
                           };
                return data;
            }
            else
            {
                return null;
            }
        }

        [HttpGet]
        public object GetListAccount()
        {
            return _context.TokenManagers.Where(x => !string.IsNullOrEmpty(x.ServiceType) && (string.IsNullOrEmpty(User.Identity.Name) || x.CreatedBy == User.Identity.Name || x.CreatedBy == "admin")
                                                     && x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Type.Equals("MEETING_SCHEDULE"));
        }
        #endregion

        #region Function
        [HttpPost]
        public JsonResult Insert([FromBody] LmsTutoringScheduleModel data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var LmsTutoringSchedule = _context.LmsTutoringSchedules.FirstOrDefault(x => x.Title.Equals(data.Title));
                if (LmsTutoringSchedule == null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    var listMS = _context.LmsTutoringSchedules.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(data.AccountZoom));
                    var check = listMS.Any(x => (x.StartTime >= startTime && x.StartTime <= endTime)
                                             || (x.EndTime >= startTime && x.EndTime <= endTime)
                                             || (x.StartTime <= startTime && x.EndTime >= endTime)
                                             || (x.StartTime >= startTime && x.EndTime <= endTime));

                    if (check)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerLmsTs["LMS_MEETING_ACCOUNT_BUSY"];
                        return Json(msg);
                    }

                    Random generator = new Random();
                    string r = generator.Next(0, 1000000).ToString("D6");
                    var zoomSetting = new ZoomSetting
                    {
                        host_video = true,
                        participant_video = true,
                        //waiting_room = false,
                        join_before_host = true,
                        approval_type = 2
                    };
                    var zoomData = new ZoomData
                    {
                        topic = data.Title,
                        password = r,
                        type = 2,
                        settings = zoomSetting
                    };
                    var zoomModel = new ZoomModel
                    {
                        //MeetingTopic = null,
                        //RoomID = null,
                        Email = data.AccountZoom,
                        //Token = null,
                        Data = JsonConvert.SerializeObject(zoomData),
                        MeetingId = null
                        //ListUserMeeting = null
                    };
                    var msg1 = CreateMeeting(zoomModel);
                    if (msg1.Error)
                    {
                        return Json(msg1);
                    }

                    var obj = new LmsTutoringSchedule
                    {
                        StartTime = startTime,
                        EndTime = endTime,
                        Title = data.Title,
                        Description = data.Description,
                        ListUserApproved = data.ListUserApproved,
                        BackgroundColor = data.BackgroundColor,
                        BackgroundImage = data.BackgroundImage,
                        JsonStatus = data.JsonStatus,
                        IsPopupAllowed = data.IsPopupAllowed,
                        LessonDoc = data.LessonDoc,
                        SubjectCode = data.SubjectCode,
                        CourseCode = data.CourseCode,
                        Teacher = data.Teacher,
                        AccountZoom = data.AccountZoom,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        MeetingId = msg1.ID
                    };

                    _context.LmsTutoringSchedules.Add(obj);
                    _context.SaveChanges();

                    //msg.Title = "Thêm mới thông tin lịch học thành công";
                    msg.Title = _stringLocalizerLmsTs["LMS_TITLE_ADD_NEW_SCHEDULE_STUDY"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Lịch học đã tồn tại";
                    msg.Title = _stringLocalizerLmsTs["LMS_SCHEDULE_LEARN_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        private JMessage CreateMeeting(ZoomModel obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.TokenManagers.FirstOrDefault(x => x.Email.Equals(obj.Email) && x.ServiceType.Equals("ZOOM_ACCOUNT"));
                if (check == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerMs["MS_MESSAGE_ACCOUNT_NOT_EXIST"];
                    return msg;
                }
                var result = CommonUtil.RefreshZoomToken(check.Key, check.ApiSecret, check.RefreshToken);
                if (result.ZoomAuth != null && !string.IsNullOrEmpty(result.ZoomAuth.RefreshToken))
                {
                    check.Token = result.ZoomAuth.AccessToken;
                    check.RefreshToken = result.ZoomAuth.RefreshToken;
                    _context.TokenManagers.Update(check);
                }
                else
                {
                    var zoomError = new ZoomReportError
                    {
                        ErrorContent = result.ErrorContent,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now
                    };
                    _context.ZoomReportErrors.Add(zoomError);
                    _context.SaveChanges();
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    return msg;
                }

                //var host = CommonUtil.GetHostKey(result.ZoomAuth.AccessToken);
                msg = CommonUtil.CreateMeeting(result.ZoomAuth.AccessToken, obj.Data, check.AccountCode);
                if (!msg.Error)
                {
                    var zoomOld = _context.ZoomManages.Where(x =>
                        !x.IsDeleted && x.Id == obj.MeetingId);
                    foreach (var item in zoomOld)
                    {
                        item.IsDeleted = true;
                        _context.ZoomManages.Update(item);
                    }

                    var stringObj = JsonConvert.SerializeObject(msg.Object);
                    var rs = JsonConvert.DeserializeObject<ResponseZoom>(stringObj);
                    var zoom = new ZoomManage
                    {
                        ZoomId = rs.id.ToString(),
                        AccountZoom = check.Email,
                        ZoomName = rs.topic,
                        ZoomPassword = rs.password,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        Group = check.AccountRole,
                        JoinUrl = rs.join_url,
                        //MeetingScheduleId = obj.MeetingId,
                        ListUserAccess = JsonConvert.SerializeObject(obj.ListUserMeeting),
                        HostClaimCode = check.HostClaimCode,
                        IsDeleted = false
                    };

                    _context.ZoomManages.Add(zoom);
                    _context.SaveChanges();
                    msg.ID = zoom.Id;


                    msg.Title = _stringLocalizerMs["MS_CREATE_MEETING_SUCCESS"];
                }
                _context.SaveChanges();
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return msg;
            }
        }

        private JMessage DeleteMeeting(string id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var zoom = _context.ZoomManages.FirstOrDefault(x => x.Id.ToString().Equals(id));
                if (zoom != null)
                {
                    zoom.IsDeleted = true;
                    zoom.DeletedBy = User.Identity.Name;
                    zoom.DeletedTime = DateTime.Now;
                }
                //if (meetingSchedule != null)
                //{
                //    meetingSchedule.IsDeleted = true;
                //    meetingSchedule.UpdatedBy = User.Identity.Name;
                //    meetingSchedule.UpdatedTime = DateTime.Now;

                //    _context.MeetingSchedules.Update(meetingSchedule);
                //    _context.SaveChanges();

                //    //msg.Title = "Xóa lịch họp thành công";
                //    msg.Title = "Xóa lịch họp thành công";
                //}
                //else
                //{
                //    msg.Error = true;
                //    //msg.Title = "Không tìm thấy thông tin lịch họp";
                //    msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
                //}
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        [HttpPost]
        public JsonResult GetItem(int id, string meetingId)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.LmsTutoringSchedules.FirstOrDefault(x => x.Id.Equals(id));
                var meetingRoom = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.ZoomId.Equals(meetingId));
                var token = _context.TokenManagers.FirstOrDefault(x => x.Email.Equals(obj.AccountZoom) && x.ServiceType.Equals("ZOOM_ACCOUNT"));
                //if (meetingRoom == null)
                //{
                //    msg.Error = true;
                //    //msg.Title = "Không tìm thấy cuộc họp";
                //    msg.Title = _stringLocalizerLmsTs["LMS_TITLE_MEETING_NOT_FOUND"];
                //}
                if (obj != null)
                {
                    msg.Object = new
                    {
                        obj.Id,
                        obj.Title,
                        StartTime = obj.StartTime.HasValue ? obj.StartTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                        EndTime = obj.EndTime.HasValue ? obj.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                        obj.Description,
                        obj.ListUserApproved,
                        obj.BackgroundColor,
                        obj.BackgroundImage,
                        obj.JsonStatus,
                        obj.IsPopupAllowed,
                        obj.LessonDoc,
                        obj.SubjectCode,
                        obj.CourseCode,
                        obj.Teacher,
                        obj.AccountZoom,
                        obj.CreatedBy,
                        CreatedTime = obj.CreatedTime.HasValue ? obj.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                        meetingRoom?.ZoomId,
                        JoinUrl = meetingRoom?.JoinUrl,
                        Password = meetingRoom?.ZoomPassword,
                        HostKey = token?.HostClaimCode,
                        obj.MeetingId
                    };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsTs["LMS_ERR_SCHEDULE_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] LmsTutoringScheduleModel data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsTutoringSchedule = _context.LmsTutoringSchedules.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (lmsTutoringSchedule != null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    var listMS = _context.LmsTutoringSchedules.Where(x => !x.IsDeleted && !x.Id.Equals(data.Id) && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(data.AccountZoom));
                    var check = listMS.Any(x => (x.StartTime >= startTime && x.StartTime <= endTime)
                                             || (x.EndTime >= startTime && x.EndTime <= endTime)
                                             || (x.StartTime <= startTime && x.EndTime >= endTime)
                                             || (x.StartTime >= startTime && x.EndTime <= endTime));

                    if (check)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerLmsTs["LMS_MEETING_ACCOUNT_BUSY"];
                        return Json(msg);
                    }

                    var oldMeet = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.Id == data.MeetingId);
                    var meetingId = oldMeet?.Id;
                    if (lmsTutoringSchedule.AccountZoom != data.AccountZoom || oldMeet == null)
                    {
                        Random generator = new Random();
                        string r = generator.Next(0, 1000000).ToString("D6");
                        var zoomSetting = new ZoomSetting
                        {
                            host_video = true,
                            participant_video = true,
                            //waiting_room = false,
                            join_before_host = true,
                            approval_type = 2
                        };
                        var zoomData = new ZoomData
                        {
                            topic = data.Title,
                            password = r,
                            type = 2,
                            settings = zoomSetting
                        };
                        var zoomModel = new ZoomModel
                        {
                            //MeetingTopic = null,
                            //RoomID = null,
                            Email = data.AccountZoom,
                            //Token = null,
                            Data = JsonConvert.SerializeObject(zoomData),
                            MeetingId = data.Id,
                            //ListUserMeeting = null
                        };
                        if (oldMeet != null)
                        {
                            var msg1 = DeleteMeeting(oldMeet.Id.ToString());
                        }
                        var msg2 = CreateMeeting(zoomModel);
                        if (msg2.Error)
                        {
                            return Json(msg2);
                        }

                        meetingId = msg2.ID;
                    }

                    lmsTutoringSchedule.StartTime = startTime;
                    lmsTutoringSchedule.EndTime = endTime;
                    lmsTutoringSchedule.Title = data.Title;
                    lmsTutoringSchedule.Description = data.Description;
                    lmsTutoringSchedule.ListUserApproved = data.ListUserApproved;
                    lmsTutoringSchedule.BackgroundColor = data.BackgroundColor;
                    lmsTutoringSchedule.BackgroundImage = data.BackgroundImage;
                    lmsTutoringSchedule.JsonStatus = data.JsonStatus;
                    lmsTutoringSchedule.IsPopupAllowed = data.IsPopupAllowed;
                    lmsTutoringSchedule.LessonDoc = data.LessonDoc;
                    lmsTutoringSchedule.SubjectCode = data.SubjectCode;
                    lmsTutoringSchedule.CourseCode = data.CourseCode;
                    lmsTutoringSchedule.Teacher = data.Teacher;
                    lmsTutoringSchedule.AccountZoom = data.AccountZoom;
                    lmsTutoringSchedule.UpdatedBy = User.Identity.Name;
                    lmsTutoringSchedule.UpdatedTime = DateTime.Now;
                    lmsTutoringSchedule.MeetingId = meetingId;

                    _context.LmsTutoringSchedules.Update(lmsTutoringSchedule);
                    _context.SaveChanges();

                    //msg.Title = "Cập nhật thông tin lịch học thành công";
                    msg.Title = _stringLocalizerLmsTs["LMS_TITLE_SCHEDULE_UPDATE_SUCCESED"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsTs["LMS_ERR_SCHEDULE_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UpdateOnDrag([FromBody] LmsTutoringScheduleModel data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsTutoringSchedule = _context.LmsTutoringSchedules.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (lmsTutoringSchedule != null)
                {
                    var startTime = data.StartDateTime;
                    var endTime = lmsTutoringSchedule.EndTime.Value.Add(startTime.Date - lmsTutoringSchedule.StartTime.Value.Date);
                    //var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    var listMS = _context.LmsTutoringSchedules.Where(x => !x.IsDeleted && !x.Id.Equals(data.Id) && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(data.AccountZoom));
                    var check = listMS.Any(x => (x.StartTime >= startTime && x.StartTime <= endTime)
                                             || (x.EndTime >= startTime && x.EndTime <= endTime)
                                             || (x.StartTime <= startTime && x.EndTime >= endTime)
                                             || (x.StartTime >= startTime && x.EndTime <= endTime));

                    if (check)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerLmsTs["LMS_MEETING_ACCOUNT_BUSY"];
                        return Json(msg);
                    }

                    var oldMeet = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.Id == lmsTutoringSchedule.MeetingId);
                    var meetingId = oldMeet?.Id;
                    if (oldMeet == null)
                    {
                        Random generator = new Random();
                        string r = generator.Next(0, 1000000).ToString("D6");
                        var zoomSetting = new ZoomSetting
                        {
                            host_video = true,
                            participant_video = true,
                            //waiting_room = false,
                            join_before_host = true,
                            approval_type = 2
                        };
                        var zoomData = new ZoomData
                        {
                            topic = data.Title,
                            password = r,
                            type = 2,
                            settings = zoomSetting
                        };
                        var zoomModel = new ZoomModel
                        {
                            //MeetingTopic = null,
                            //RoomID = null,
                            Email = data.AccountZoom,
                            //Token = null,
                            Data = JsonConvert.SerializeObject(zoomData),
                            MeetingId = data.Id,
                            //ListUserMeeting = null
                        };
                        var msg2 = CreateMeeting(zoomModel);
                        if (msg2.Error)
                        {
                            return Json(msg2);
                        }

                        meetingId = msg2.ID;
                    }

                    lmsTutoringSchedule.StartTime = startTime;
                    lmsTutoringSchedule.EndTime = endTime;
                    lmsTutoringSchedule.UpdatedBy = User.Identity.Name;
                    lmsTutoringSchedule.UpdatedTime = DateTime.Now;
                    lmsTutoringSchedule.MeetingId = meetingId;

                    _context.LmsTutoringSchedules.Update(lmsTutoringSchedule);
                    _context.SaveChanges();

                    //msg.Title = "LMS_TITLE_SCHEDULE_UPDATE_SUCCESED";
                    msg.Title = _stringLocalizerLmsTs["LMS_TITLE_SCHEDULE_UPDATE_SUCCESED"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsTs["LMS_ERR_SCHEDULE_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete(string id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var lmsTutoringSchedule = _context.LmsTutoringSchedules.FirstOrDefault(x => x.Id.ToString().Equals(id));
                if (lmsTutoringSchedule != null)
                {
                    var msg1 = DeleteMeeting(lmsTutoringSchedule.MeetingId.ToString());
                    lmsTutoringSchedule.IsDeleted = true;
                    lmsTutoringSchedule.DeletedBy = User.Identity.Name;
                    lmsTutoringSchedule.DeletedTime = DateTime.Now;

                    _context.LmsTutoringSchedules.Update(lmsTutoringSchedule);
                    _context.SaveChanges();

                    //msg.Title = "Xóa lịch họp thành công";
                    msg.Title = _stringLocalizerLmsTs["LMS_DELETED_SCHEDULE_STUDY"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsTs["LMS_ERR_SCHEDULE_NOT_FOUND"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetAllEvent()
        {
            var session = HttpContext.GetSessionUser();
            var listData = new List<Object>();
            var events = (from a in _context.LmsTutoringSchedules.Where(x => !x.IsDeleted)
                          join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                          from c in c1.DefaultIfEmpty()
                          where session.IsAllData || a.Teacher == session.UserName || (a.ListUserObject.Any(y => y.userName == session.UserName || string.IsNullOrEmpty(y.userName))) || a.CreatedBy == session.UserName
                          /*where (session.IsAllData && (String.IsNullOrEmpty(userName) || a.ListUserObject.Any(y => y.userName == userName)))
                          || (String.IsNullOrEmpty(userName) && a.ListUserObject.Any(y => y.userName == session.UserName || string.IsNullOrEmpty(y.userName)))
                          || (String.IsNullOrEmpty(userName) && a.CreatedBy == session.UserName)*/
                          select new
                          {
                              a.Id,
                              a.Title,
                              a.StartTime,
                              a.EndTime,
                              a.Description,
                              MeetingId = c != null ? c.ZoomId : "",
                              Color = a.BackgroundColor,
                              a.AccountZoom,
                              a.ListUserApproved,
                          }).OrderByDescending(x => x.EndTime);

            foreach (var item in events)
            {
                var className = "fc-event-event-custom";
                var allowJoin = true;

                var obj = new
                {
                    item.Id,
                    item.Title,
                    item.StartTime.Value.Date,
                    sStartTime = item.StartTime.Value.ToString("HH:mm"),
                    sEndTime = item.EndTime.Value.ToString("HH:mm"),
                    item.StartTime,
                    item.EndTime,
                    item.Description,
                    item.Color,
                    item.MeetingId,
                    IsAllData = (session.IsAllData) ? true : false,
                    ClassName = className,
                    AllowJoin = allowJoin,
                    item.AccountZoom,
                };

                listData.Add(obj);
            }

            return Json(listData);
        }

        [HttpPost]
        public object GetListClass(string teacher)
        {
            var session = HttpContext.GetSessionUser();
            return _context.LmsClasses.Where(x => !x.IsDeleted &&
                                                  ((string.IsNullOrEmpty(teacher) &&
                                                    x.ManagerTeacher == session.UserName) ||
                                                  (x.ManagerTeacher == teacher)))
                .Select(x => new { Code = x.ClassCode, Name = x.ClassName, Count = _context.LmsUserClasses.Count(y => y.ClassCode == x.ClassCode) });
        }

        [HttpPost]
        public object GetListUserOfClass(string classCode)
        {
            var query = from a in _context.Users
                        join b in _context.LmsUserClasses.Where(x => x.ClassCode == classCode) on a.UserName equals b.UserName
                        join c in _context.LmsClasses.Where(x => !x.IsDeleted) on b.ClassCode equals c.ClassCode
                        select new
                        {
                            UserId = a.Id,
                            a.GivenName,
                            a.UserName,
                            DepartmentCode = "",
                            //RoleSys = c.Title,
                            Branch = a.Branch.OrgAddonCode,
                            c.ClassName
                        };
            return query;
        }
        [HttpPost]
        public object GetListUserJoined(string users)
        {
            var listUser = users.Split(", ");
            return _context.Users.ToList().Where(x => listUser.Any(y => y == x.UserName))
                .Select(x => new { x.UserName, x.GivenName });
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerMs.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerLmsTs.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSTRE.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerTm.GetAllStrings().Select(x => new { x.Name, x.Value }))
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