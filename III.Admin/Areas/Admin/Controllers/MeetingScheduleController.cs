using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MeetingScheduleController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<MeetingScheduleController> _stringLocalizer;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizerSTRE;
        private readonly IStringLocalizer<WeekWorkingScheduleController> _stringLocalizerWws;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IFCMPushNotification _notification;
        public MeetingScheduleController(EIMDBContext context, IFCMPushNotification notification,
            IStringLocalizer<MeetingScheduleController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<StaffRegistrationController> stringLocalizerSTRE,
            IStringLocalizer<WeekWorkingScheduleController> stringLocalizerWWs)
        {
            _context = context;
            _notification = notification;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerSTRE = stringLocalizerSTRE;
            _stringLocalizerWws = stringLocalizerWWs;
        }

        [Breadcrumb("ViewData.CrumbMeetingSchedule", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbMeetingSchedule"] = _sharedResources["COM_CRUMB_MEETING_SCHEDULE"];
            Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
            Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
            return View();
        }

        #region Combobox
        [HttpGet]
        public object GetListUser()
        {
            return _context.Users.Where(x => x.Active).Select(x => new { x.UserName, x.GivenName });
        }

        [HttpGet]
        public object GetListAccount()
        {
            return _context.TokenManagers.Where(x => !string.IsNullOrEmpty(x.ServiceType) && (string.IsNullOrEmpty(User.Identity.Name) || x.CreatedBy == User.Identity.Name || x.CreatedBy == "admin")
                                                     && x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Type.Equals("MEETING_SCHEDULE"));
        }

        [HttpPost]
        public object GetListAccountNotUsed(string sStartTime, string sEndTime, string currentAccount)
        {
            var startTime = DateTime.ParseExact(sStartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
            var endTime = DateTime.ParseExact(sEndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
            var listZoomServices = _context.TokenManagers.Where(x =>
                !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("ZOOM_ACCOUNT")
                 && (string.IsNullOrEmpty(User.Identity.Name) || x.CreatedBy == User.Identity.Name || x.CreatedBy == "admin")
                 && x.Type.Equals("MEETING_SCHEDULE")).ToList();
            var listMeetingSchedules =
                _context.MeetingSchedules.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.AccountZoom)).ToList();
            var objRemoved = listMeetingSchedules.Where(x => x.StartTime >= DateTime.Now.Date && x.EndTime <= DateTime.Now.AddDays(1).Date && x.AccountZoom != currentAccount)
                .DistinctBy(x => x.AccountZoom).Select(x => x.AccountZoom);
            var obj = listZoomServices.Where(x => !objRemoved.Any(y => y == x.Email));
            return obj;
        }

        [HttpPost]
        public JsonResult GetListStatus()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("MEETING_SCHEDULE"))
                .Select(x => new
                {
                    Code = x.CodeSet,
                    Name = x.ValueSet
                }).OrderByDescending(x => x.Code == "MEETING_SCHEDULE_START");
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Function
        public class JtableMeetingScheduleModel : JTableModel
        {
            public string Date { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody] JtableMeetingScheduleModel jTablePara)
        {
            var dateStart = DateTime.ParseExact(jTablePara.Date, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var dateEnd = dateStart.AddDays(1);
            var session = HttpContext.GetSessionUser();
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.MeetingSchedules.Where(x => !x.IsDeleted)
                             //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                         join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                         from c in c1.DefaultIfEmpty()
                         where (session.IsAllData || session.RoleCode.Equals("GIAMDOC") || (a.ListUserObject.Any(y => y.userName == session.UserName || string.IsNullOrEmpty(y.userName))) || a.CreatedBy == session.UserName)
                         && ((a.StartTime >= dateStart && a.StartTime <= dateEnd) || (a.EndTime >= dateStart && a.EndTime <= dateEnd) || (a.StartTime <= dateStart && dateEnd <= a.EndTime))
                         select new
                         {
                             a.Id,
                             a.Title,
                             StartTime = a.StartTime.Value.ToString("dd/MM/yyyy HH:mm"),
                             EndTime = a.EndTime.Value.ToString("dd/MM/yyyy HH:mm"),
                             a.Comment,
                             Color = a.BackgroundColor,
                             //Status = b.ValueSet,
                             //StatusCode = a.Status,
                             MeetingId = c != null ? c.ZoomId : "",
                             a.AccountZoom,
                             a.ListUserApproved,
                         }).ToList();

            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "StartTime", "EndTime", "Color", "MeetingId", "Comment", "ListUserApproved");
            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody] MeetingScheduleModel data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //var meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => x.Title.Equals(data.Title));
                if (/*meetingSchedule == null*/true)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    var listMS = _context.MeetingSchedules.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(data.AccountZoom));
                    var check = listMS.Any(x => (x.StartTime >= startTime && x.StartTime <= endTime)
                                             || (x.EndTime >= startTime && x.EndTime <= endTime)
                                             || (x.StartTime <= startTime && x.EndTime >= endTime)
                                             || (x.StartTime >= startTime && x.EndTime <= endTime));

                    if (check)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MS_ACCOUNT_USED"];
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
                        MeetingId = null,
                        //ListUserMeeting = null
                    };
                    var msg1 = CreateMeeting(zoomModel);
                    if (msg1.Error)
                    {
                        return Json(msg1);
                    }

                    var obj = new MeetingSchedule
                    {
                        StartTime = startTime,
                        EndTime = endTime,
                        Title = data.Title,
                        Comment = data.Comment,
                        ListUserApproved = data.ListUserApproved,
                        BackgroundColor = data.BackgroundColor,
                        BackgroundImage = data.BackgroundImage,
                        JsonRef = data.JsonRef,
                        JsonStatus = data.JsonStatus,
                        AccountZoom = data.AccountZoom,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        MeetingId = msg1.ID
                    };

                    _context.MeetingSchedules.Add(obj);
                    _context.SaveChanges();

                    //msg.Title = "Thêm mới thông tin lịch họp thành công";
                    msg.Title = _stringLocalizer["MS_MESSAGE_ADD_SUCCESS"];
                }
                //else
                //{
                //    msg.Error = true;
                //    //msg.Title = "Lịch họp đã tồn tại";
                //    msg.Title = _stringLocalizer["MS_MESSAGE_EXITS"];
                //}
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
                    msg.Title = _stringLocalizer["MS_MESSAGE_ACCOUNT_NOT_EXIST"];
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


                    msg.Title = _stringLocalizer["MS_CREATE_MEETING_SUCCESS"];
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
        public object GetAcountsUsedInDay()
        {
            return _context.MeetingSchedules.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.AccountZoom) &&
                                                        (x.StartTime >= DateTime.Now.Date && x.EndTime <= DateTime.Now.AddDays(1).Date))
                .DistinctBy(x => x.AccountZoom).Select(x => x.AccountZoom);
        }

        [HttpPost]
        public JsonResult GetItem(int id, string meetingId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var obj = _context.MeetingSchedules.FirstOrDefault(x => x.Id.Equals(id));
                var meetingRoom = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.ZoomId.Equals(meetingId));
                var token = _context.TokenManagers.FirstOrDefault(x => x.Email.Equals(obj.AccountZoom) && x.ServiceType.Equals("ZOOM_ACCOUNT"));
                if (meetingRoom == null)
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy cuộc họp";
                    //msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
                }
                if (obj != null)
                {
                    msg.Object = new
                    {
                        obj.Id,
                        obj.Title,
                        StartTime = obj.StartTime.HasValue ? obj.StartTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                        EndTime = obj.EndTime.HasValue ? obj.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "",
                        obj.Comment,
                        obj.ListUserApproved,
                        obj.JsonRef,
                        obj.JsonStatus,
                        obj.BackgroundColor,
                        obj.BackgroundImage,
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
                    //msg.Title = "Không tìm thấy thông tin lịch họp";
                    msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
        public JsonResult Update([FromBody] MeetingScheduleModel data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (meetingSchedule != null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    var listMS = _context.MeetingSchedules.Where(x => !x.IsDeleted && !x.Id.Equals(data.Id) && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(data.AccountZoom));
                    var check = listMS.Any(x => (x.StartTime >= startTime && x.StartTime <= endTime)
                                             || (x.EndTime >= startTime && x.EndTime <= endTime)
                                             || (x.StartTime <= startTime && x.EndTime >= endTime)
                                             || (x.StartTime >= startTime && x.EndTime <= endTime));

                    if (check)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["MS_ACCOUNT_USED"];
                        return Json(msg);
                    }

                    var oldMeet = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.Id == data.MeetingId);
                    var meetingId = oldMeet?.Id;
                    if (meetingSchedule.AccountZoom != data.AccountZoom || oldMeet == null)
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

                    meetingSchedule.StartTime = startTime;
                    meetingSchedule.EndTime = endTime;
                    meetingSchedule.Title = data.Title;
                    meetingSchedule.Comment = data.Comment;
                    meetingSchedule.ListUserApproved = data.ListUserApproved;
                    meetingSchedule.BackgroundColor = data.BackgroundColor;
                    meetingSchedule.BackgroundImage = data.BackgroundImage;
                    meetingSchedule.JsonRef = data.JsonRef;
                    meetingSchedule.JsonStatus = data.JsonStatus;
                    meetingSchedule.AccountZoom = data.AccountZoom;
                    meetingSchedule.UpdatedBy = User.Identity.Name;
                    meetingSchedule.UpdatedTime = DateTime.Now;
                    meetingSchedule.MeetingId = meetingId;

                    _context.MeetingSchedules.Update(meetingSchedule);
                    _context.SaveChanges();

                    //msg.Title = "Cập nhật thông tin lịch họp thành công";
                    msg.Title = _stringLocalizer["MS_MESSAGE_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch họp";
                    msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
        public JsonResult UpdateOnDrag([FromBody] MeetingScheduleModel data)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (meetingSchedule != null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = meetingSchedule.EndTime.Value.Add(startTime - meetingSchedule.StartTime.Value);
                    //var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

                    var listMS = _context.MeetingSchedules.Where(x => !x.IsDeleted && !x.Id.Equals(data.Id) && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(data.AccountZoom));
                    var check = listMS.Any(x => (x.StartTime >= startTime && x.StartTime <= endTime)
                                             || (x.EndTime >= startTime && x.EndTime <= endTime)
                                             || (x.StartTime <= startTime && x.EndTime >= endTime)
                                             || (x.StartTime >= startTime && x.EndTime <= endTime));

                    if (check)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["Tài khoản đã được dùng trong cuộc họp khác"];
                        return Json(msg);
                    }

                    var oldMeet = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.Id == meetingSchedule.MeetingId);
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

                    meetingSchedule.StartTime = startTime;
                    meetingSchedule.EndTime = endTime;
                    meetingSchedule.UpdatedBy = User.Identity.Name;
                    meetingSchedule.UpdatedTime = DateTime.Now;
                    meetingSchedule.MeetingId = meetingId;

                    _context.MeetingSchedules.Update(meetingSchedule);
                    _context.SaveChanges();

                    //msg.Title = "Cập nhật thông tin lịch họp thành công";
                    msg.Title = _stringLocalizer["MS_MESSAGE_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch họp";
                    msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => x.Id.ToString().Equals(id));
                if (meetingSchedule != null)
                {
                    var msg1 = DeleteMeeting(meetingSchedule.MeetingId.ToString());
                    meetingSchedule.IsDeleted = true;
                    meetingSchedule.UpdatedBy = User.Identity.Name;
                    meetingSchedule.UpdatedTime = DateTime.Now;

                    _context.MeetingSchedules.Update(meetingSchedule);
                    _context.SaveChanges();

                    //msg.Title = "Xóa lịch họp thành công";
                    msg.Title = _stringLocalizer["MS_DELETE_SCHEDULE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch họp";
                    msg.Title = _stringLocalizer["MS_MESSAGE_NOT_FOUND_MEETING"];
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
            var today = DateTime.Now.Date;
            var events = (from a in _context.MeetingSchedules.Where(x => !x.IsDeleted)
                              //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                          join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                          from c in c1.DefaultIfEmpty()
                          where session.IsAllData || session.RoleCode.Equals("GIAMDOC") || a.ListUserObject.Any(y => y.userName == session.UserName || string.IsNullOrEmpty(y.userName)) || a.CreatedBy == session.UserName
                          select new
                          {
                              a.Id,
                              a.Title,
                              a.StartTime,
                              a.EndTime,
                              a.Comment,
                              Color = a.StartTime.Value.Date >= today ? a.BackgroundColor : "#f1f1f1",
                              IsInFuture = a.StartTime.Value.Date >= today,
                              //Status = b.ValueSet,
                              //StatusCode = a.Status,
                              MeetingId = c != null ? c.ZoomId : "",
                              a.AccountZoom,
                              a.JsonData,
                          }).OrderByDescending(x => x.EndTime);

            foreach (var item in events)
            {
                var className = item.IsInFuture ? "fc-event-event-custom" : "fc-black";
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
                    item.Comment,
                    item.Color,
                    //item.TextColor,
                    //item.Status,
                    //item.StatusCode,
                    item.MeetingId,
                    IsAllData = session.IsAllData || session.RoleCode.Equals("GIAMDOC"),
                    ClassName = className,
                    AllowJoin = allowJoin,
                    item.AccountZoom,
                    item.JsonData,
                };

                listData.Add(obj);
            }

            return Json(listData);
        }
        [HttpPost]
        public JsonResult GetListUserMeetingSchedule(int meetingId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = (from a in _context.MeetingSchedules.FirstOrDefault(x => x.Id == meetingId)?.ListUserObject
                    from b in _context.Users //on a.userName equals b.UserName
                    where a.userName == b.UserName || a.userName == ""
                    //where a.CardCode == CardCode && a.Status == "ASSIGN_STATUS_WORK"
                    select new
                    {
                        //Id = a.ID,
                        a.userName,
                        UserId = b.Id,
                        b.GivenName,
                        //a.CreatedTime,
                        //a.Role,
                        b.DepartmentId
                    });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_DATA_FAIL"];
                msg.Object = ex.Message;
            }

            return Json(msg);
        }
        
        public class NotificationMeeting
        {
            public List<UserIdModel> listUser { get; set; }
            public int meetingId { get; set; }
            public string message { get; set; }
            public string createdBy { get; set; }
        }
        [HttpPost]
        public JsonResult SendNotificationAppMeeting([FromBody] NotificationMeeting data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var body = _context.MeetingSchedules.Select(x => new { 
                    x.Id,
                    x.Title,
                    x.StartTime,
                    x.EndTime,
                    x.AccountZoom,
                    x.CreatedBy,
                    x.CreatedTime,
                    x.UpdatedBy,
                    x.UpdatedTime,
                    x.MeetingId,
                    }).FirstOrDefault(x => x.Id == data.meetingId);
                SendPushNotification(data.listUser,
                    data.message, 
                    body, EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromMeeting), User.Identity.Name);
                msg.Title = msg.Title = _stringLocalizer["MS_SEND_NOTI_SUCCESS"];
            }
            catch
            {
                msg.Error = true;
                msg.Title = msg.Title = _stringLocalizer["MS_SEND_NOTI_FAILED"];
            }

            return Json(msg);
        }

        [NonAction]
        public async Task<int> SendPushNotification(List<UserIdModel> listUserId, string message, object data, string fromSrc, string createdBy)
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                    join b in _context.FcmTokens on a.UserId equals b.UserId
                    join c in _context.Users on a.UserId equals c.Id
                    where c.Active == true && c.UserName != createdBy && b.AppCode == "SMARTWORK"
                    // remove sender from the receiver list
                    select new DeviceFcm
                    {
                        Token = b.Token,
                        Device = b.Device,
                        UserId = a.UserId
                    }).DistinctBy(x => x.Token);
                if (query.Any())
                {
                    var countToken = query.Count();
                    if (countToken > 100000)
                    {
                        int countPush = (query.Count() / 100000) + 1;
                        for (int i = 0; i < countPush; i++)
                        {
                            //var listDevices = query.Skip(i * 1000).Take(100000).AsNoTracking().ToList();
                            List<DeviceFcm> listDevices = query.Skip(i * 1000).Take(100000).ToList();

                            var sendNotication = await
                                _notification.SendNotification("Thông báo", message, listDevices, data, fromSrc, ESEIM.AppContext.UserName);
                        }
                    }
                    else
                    {
                        var sendNotication = await
                            _notification.SendNotification("Thông báo", message, query.ToList(), data, fromSrc, ESEIM.AppContext.UserName);
                    }
                }
            }
            return 1;
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSTRE.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerWws.GetAllStrings().Select(x => new { x.Name, x.Value }))
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