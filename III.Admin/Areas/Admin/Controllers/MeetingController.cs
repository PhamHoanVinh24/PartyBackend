using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using ESEIM;
using Microsoft.IdentityModel.Tokens;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MeetingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ExcelController> _stringLocalizer;
        private readonly IFCMPushNotification _notification;
        public static string _meetingID = new string("");
        public static int? _scheduleID = null;
        static readonly char[] padding = { '=' };
        public MeetingController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ExcelController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IFCMPushNotification notification)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _notification = notification;
        }

        public IActionResult Index()
        {
            var model = new RoomInfo();

            if (!string.IsNullOrEmpty(_meetingID))
            {
                var session = HttpContext.GetSessionUser();
                model = (from a in _context.ZoomManages.Where(x => !x.IsDeleted && x.ZoomId.Equals(_meetingID))
                         join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                         let accountZoom = _context.TokenManagers.FirstOrDefault(x => x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(a.AccountZoom))
                         let adUserInGroup = _context.AdUserInGroups.FirstOrDefault(x => !x.IsDeleted && x.UserId == session.UserId)
                         let meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => !x.IsDeleted && x.Id == _scheduleID)
                         let createdBy = meetingSchedule != null ? meetingSchedule.CreatedBy : a.CreatedBy
                         select new RoomInfo
                         {
                             RoomID = a.ZoomId,
                             RoomName = a.ZoomName,
                             RoomPassWord = a.ZoomPassword,
                             UserName = session.FullName + ((adUserInGroup != null) ? " (" +
                             _context.AdGroupUsers.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.GroupUserCode == adUserInGroup.GroupUserCode).Description + ")" :
                             ""),
                             CreatedBy = b.GivenName,
                             CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                             Role = session.UserName.Equals(createdBy) ? 1 : 0,//0 - Attendee 1 - Host 5 - Assistant
                             SdkKey = accountZoom != null ? accountZoom.SdkKey : "",
                             SdkSecret = accountZoom != null ? accountZoom.SdkSecret : "",
                         }).FirstOrDefault();
            }
            String ts = (ToTimestamp(DateTime.UtcNow.ToUniversalTime()) - 30000).ToString();
            model.Signature = GenerateToken(model.SdkKey, model.SdkSecret, model.RoomID, ts, model.Role.ToString());
            Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
            Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
            return View(model);
        }
        public IActionResult Component()
        {
            var model = new RoomInfo();

            if (!string.IsNullOrEmpty(_meetingID))
            {
                var session = HttpContext.GetSessionUser();
                model = (from a in _context.ZoomManages.Where(x => !x.IsDeleted && x.ZoomId.Equals(_meetingID))
                         join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                         let accountZoom = _context.TokenManagers.FirstOrDefault(x => x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(a.AccountZoom))
                         let adUserInGroup = _context.AdUserInGroups.FirstOrDefault(x => !x.IsDeleted && x.UserId == session.UserId)
                         let meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => !x.IsDeleted && x.Id == _scheduleID)
                         let createdBy = meetingSchedule != null ? meetingSchedule.CreatedBy : a.CreatedBy
                         select new RoomInfo
                         {
                             RoomID = a.ZoomId,
                             RoomName = a.ZoomName,
                             RoomPassWord = a.ZoomPassword,
                             UserName = session.FullName + ((adUserInGroup != null) ? " (" +
                             _context.AdGroupUsers.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.GroupUserCode == adUserInGroup.GroupUserCode).Description + ")" :
                             ""),
                             CreatedBy = b.GivenName,
                             CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                             Role = session.UserName.Equals(createdBy) ? 1 : 0,//0 - Attendee 1 - Host 5 - Assistant
                             SdkKey = accountZoom != null ? accountZoom.SdkKey : "",
                             SdkSecret = accountZoom != null ? accountZoom.SdkSecret : "",
                         }).FirstOrDefault();
            }
            String ts = (ToTimestamp(DateTime.UtcNow.ToUniversalTime()) - 30000).ToString();
            model.Signature = GenerateToken(model.SdkKey, model.SdkSecret, model.RoomID, ts, model.Role.ToString());
            Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
            Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
            return View(model);
        }
        public IActionResult AddMeeting()
        {
            return View();
        }
        [HttpGet]
        public IActionResult EditMeeting(string meetingID)
        {
            ViewData["MeetingId"] = meetingID;
            return View();
        }
        [HttpGet]
        public IActionResult InviteMeeting(string meetingID)
        {
            ViewData["MeetingId"] = meetingID;
            return View();
        }

        [HttpPost]
        public JsonResult JoinComponentZoom()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var model = new RoomInfo();

                if (!string.IsNullOrEmpty(_meetingID))
                {
                    var session = HttpContext.GetSessionUser();
                    model = (from a in _context.ZoomManages.Where(x => !x.IsDeleted && x.ZoomId.Equals(_meetingID))
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             let accountZoom = _context.TokenManagers.FirstOrDefault(x => x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(a.AccountZoom))
                             let adUserInGroup = _context.AdUserInGroups.FirstOrDefault(x => !x.IsDeleted && x.UserId == session.UserId)
                             let meetingSchedule = _context.MeetingSchedules.FirstOrDefault(x => !x.IsDeleted && x.Id == _scheduleID)
                             let createdBy = meetingSchedule != null ? meetingSchedule.CreatedBy : a.CreatedBy
                             select new RoomInfo
                             {
                                 RoomID = a.ZoomId,
                                 RoomName = a.ZoomName,
                                 RoomPassWord = a.ZoomPassword,
                                 UserName = session.FullName + ((adUserInGroup != null) ? " (" +
                                 _context.AdGroupUsers.FirstOrDefault(x => !x.IsDeleted && x.IsEnabled && x.GroupUserCode == adUserInGroup.GroupUserCode).Description + ")" :
                                 ""),
                                 CreatedBy = b.GivenName,
                                 CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                 Role = session.UserName.Equals(createdBy) ? 1 : 0,//0 - Attendee 1 - Host 5 - Assistant
                                 SdkKey = accountZoom != null ? accountZoom.Key : "",
                                 SdkSecret = accountZoom != null ? accountZoom.ApiSecret : "",
                             }).FirstOrDefault();
                }
                String ts = (ToTimestamp(DateTime.UtcNow.ToUniversalTime()) - 30000).ToString();
                model.Signature = GenerateToken(model.SdkKey, model.SdkSecret, model.RoomID, ts, model.Role.ToString());
                msg.Object = model;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi tham gia cuộc họp!";
            }
            return Json(msg);
        }
        public bool CheckPermissonJoinMeeting()
        {
            var check = false;

            return check;
        }
        [HttpPost]
        public bool CheckPermissonCreateMeeting()
        {
            var check = false;
            var session = HttpContext.GetSessionUser();
            check = _context.TokenManagers.Any(x => x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(session.Email));
            return check;
        }

        [HttpPost]
        public object JoinMeeting(string meetingID, int? scheduleID = null)
        {
            _meetingID = "";
            var msg = new JMessage { };
            if (string.IsNullOrEmpty(meetingID))
            {
                msg.Error = true;
                msg.Title = "Thông tin cuộc họp trống";
                return msg;
            }

            var session = HttpContext.GetSessionUser();
            var check = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !x.IsDeleted && x.ZoomId.Equals(meetingID));
            if (check != null)
            {
                var listUserAccess = JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserAccess);
                if (!listUserAccess.Any() || listUserAccess.Any(x => x.UserName.Equals(session.UserName) || x.UserName.Equals("ALL")) || check.CreatedBy.Equals(session.UserName))
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

        [HttpPost]
        public object JoinTutorSession(string meetingID, int? scheduleID = null)
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
                    if (!listUserAccess.Any() || listUserAccess.Any(x => x.UserName.Equals(session.UserName) || x.UserName.Equals("ALL")) || check.CreatedBy.Equals(session.UserName))
                    {
                        _meetingID = meetingID;
                        _scheduleID = scheduleID;
                        //var listUserJoin = string.IsNullOrEmpty(check.ListUserJoin) ? new List<UserJoinMeeting>() : JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserJoin);
                        //var userJoin = new UserJoinMeeting
                        //{
                        //    UserId = session.UserId,
                        //    UserName = session.UserName,
                        //    GivenName = session.FullName
                        //};

                        //listUserJoin.Add(userJoin);

                        //check.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : "";
                        //_context.ZoomManages.Update(check);
                        msg.Object = _context.LmsTutoringSchedules
                            .FirstOrDefault(x => !x.IsDeleted && x.Id == scheduleID)?.EndTime;
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
        public object JoinMeetingUser(string chanel)
        {
            _meetingID = "";
            var msg = new JMessage { };
            if (string.IsNullOrEmpty(chanel))
            {
                msg.Error = true;
                msg.Title = "Thông tin cuộc họp trống";
                return msg;
            }
            else
            {
                var listUser = chanel.Split("-");
                var session = HttpContext.GetSessionUser();

                //B1: Check Channel
                var checkChanel = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !x.IsDeleted && !x.Group.Equals("PRIMARY") && !string.IsNullOrEmpty(x.Chanel) && x.Chanel.Equals(chanel));
                if (checkChanel != null)
                {
                    _meetingID = checkChanel.ZoomId;

                    var listUserJoin = string.IsNullOrEmpty(checkChanel.ListUserJoin) ? new List<UserJoinMeeting>() : JsonConvert.DeserializeObject<List<UserJoinMeeting>>(checkChanel.ListUserJoin);

                    if (!listUserJoin.Any(x => x.UserId.Equals(session.UserId)))
                    {
                        var userJoin = new UserJoinMeeting
                        {
                            UserId = session.UserId,
                            UserName = session.UserName,
                            GivenName = session.FullName
                        };

                        listUserJoin.Add(userJoin);

                        checkChanel.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : "";
                        _context.ZoomManages.Update(checkChanel);
                        _context.SaveChanges();
                    }
                }
                else
                {
                    //TH1: Trong trường hợp chưa có chanel nào thỏa mãn
                    var meetingReady = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !x.Group.Equals("PRIMARY") && string.IsNullOrEmpty(x.ListUserJoin) && !x.IsDeleted);
                    if (meetingReady != null)
                    {
                        _meetingID = meetingReady.ZoomId;

                        var listUserJoin = string.IsNullOrEmpty(meetingReady.ListUserJoin) ? new List<UserJoinMeeting>() : JsonConvert.DeserializeObject<List<UserJoinMeeting>>(meetingReady.ListUserJoin);

                        if (!listUserJoin.Any(x => x.UserId.Equals(session.UserId)))
                        {
                            var userJoin = new UserJoinMeeting
                            {
                                UserId = session.UserId,
                                UserName = session.UserName,
                                GivenName = session.FullName
                            };

                            listUserJoin.Add(userJoin);

                            meetingReady.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : "";
                            meetingReady.Chanel = chanel;
                            _context.ZoomManages.Update(meetingReady);
                            _context.SaveChanges();
                        }
                    }
                }

                //var check = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !x.IsDeleted && listUser.Any(p => p.Equals(x.CreatedBy)));
                //if (check != null)
                //{
                //    var listUserAccess = JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserAccess);
                //    if (listUserAccess.Any(x => x.UserName.Equals(session.UserName) || x.UserName.Equals("ALL")) || check.CreatedBy.Equals(session.UserName))
                //    {
                //        _meetingID = check.ZoomId;

                //        var listUserJoin = string.IsNullOrEmpty(check.ListUserJoin) ? new List<UserJoinMeeting>() : JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserJoin);

                //        if (!listUserJoin.Any(x => x.UserId.Equals(session.UserId)))
                //        {
                //            var userJoin = new UserJoinMeeting
                //            {
                //                UserId = session.UserId,
                //                UserName = session.UserName,
                //                GivenName = session.FullName
                //            };

                //            listUserJoin.Add(userJoin);

                //            check.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : "";
                //            _context.ZoomManages.Update(check);
                //            _context.SaveChanges();
                //        }
                //    }
                //    else
                //    {
                //        msg.Error = true;
                //        msg.Title = "Bạn không được quyền tham gia cuộc họp cuộc họp";
                //        return msg;
                //    }
                //}
                //else
                //{
                //    var listMeetingReady = _context.ZoomManages.Where(x => !string.IsNullOrEmpty(x.ListUserAccess) && string.IsNullOrEmpty(x.ListUserJoin) && !x.IsDeleted);
                //    if (listMeetingReady.Count() == 0)
                //    {
                //        msg.Error = true;
                //        msg.Title = "Các cuộc họp hiện tại đều có người tham gia";
                //        return msg;
                //    }
                //    else
                //    {
                //        var meetingReady = listMeetingReady.LastOrDefault();
                //        if (meetingReady != null)
                //        {
                //            var listUserJoin = string.IsNullOrEmpty(meetingReady.ListUserJoin) ? new List<UserJoinMeeting>() : JsonConvert.DeserializeObject<List<UserJoinMeeting>>(meetingReady.ListUserJoin);

                //            if (!listUserJoin.Any(x => x.UserId.Equals(session.UserId)))
                //            {
                //                var userJoin = new UserJoinMeeting
                //                {
                //                    UserId = session.UserId,
                //                    UserName = session.UserName,
                //                    GivenName = session.FullName
                //                };

                //                listUserJoin.Add(userJoin);

                //                meetingReady.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : "";
                //                _context.ZoomManages.Update(meetingReady);
                //                _context.SaveChanges();
                //            }

                //            _meetingID = meetingReady.ZoomId;
                //        }
                //    }
                //}
                return msg;
            }
        }

        [HttpGet]
        public RedirectResult OutJoinMeeting(string meetingID)
        {
            _meetingID = "";
            var msg = new JMessage { };
            if (string.IsNullOrEmpty(meetingID))
            {
                msg.Error = true;
                msg.Title = "Thông tin cuộc họp trống";
            }
            else
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !string.IsNullOrEmpty(x.ListUserJoin) && !x.IsDeleted && x.ZoomId.Equals(meetingID));
                if (check != null)
                {
                    var listUserJoin = JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserJoin);
                    if (listUserJoin.Count() > 0)
                    {
                        var userRemove = listUserJoin.FirstOrDefault(x => x.UserName.Equals(session.UserName));
                        if (userRemove != null)
                        {
                            listUserJoin.Remove(userRemove);

                            check.ListUserJoin = listUserJoin.Count() > 0 ? JsonConvert.SerializeObject(listUserJoin) : null;
                            if (string.IsNullOrEmpty(check.ListUserJoin))
                                check.Chanel = null;

                            _context.ZoomManages.Update(check);
                            _context.SaveChanges();
                        }
                    }
                }
            }

            return Redirect("/Admin");
        }

        [HttpPost]
        public object CreateZoom([FromBody] ZoomRequest obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                msg = CommonUtil.Zoom(obj.Token, obj.Data);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object CreateMeeting([FromBody] ZoomModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.TokenManagers.FirstOrDefault(x => x.Email.Equals(obj.Email) && x.ServiceType.Equals("ZOOM_ACCOUNT"));
                if (check == null)
                {
                    msg.Error = true;
                    msg.Title = "Tài khoản không được phép tạo meeting";
                    return Json(msg);
                }

                msg = CommonUtil.CreateMeeting(check.Token, obj.Data, check.AccountCode);
                if (!msg.Error)
                {
                    if (check != null)
                    {
                        var zoomOld = _context.ZoomManages.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(check.Email));
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
                            ListUserAccess = JsonConvert.SerializeObject(obj.ListUserMeeting)
                        };

                        _context.ZoomManages.Add(zoom);
                        _context.SaveChanges();

                        msg.Title = "Tạo meeting thành công";
                    }
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object EditMeeting([FromBody] ZoomModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.TokenManagers.FirstOrDefault(x => x.Email.Equals(session.Email) && x.ServiceType.Equals("ZOOM_ACCOUNT"));
                if (check == null)
                {
                    msg.Error = true;
                    msg.Title = "Tài khoản không được phép sửa meeting";
                    return Json(msg);
                }

                var zoom = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.ZoomId.Equals(obj.RoomID));
                if (zoom != null)
                {
                    zoom.ListUserAccess = JsonConvert.SerializeObject(obj.ListUserMeeting);
                    _context.ZoomManages.Update(zoom);
                    _context.SaveChanges();
                    msg.Title = "Sửa meeting thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy meeting";
                    return Json(msg);
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object InviteMeeting([FromBody] ZoomModel obj)
        {
            var msg = new JMessage() { Error = false, Title = "Gửi thông báo mời thành công" };
            try
            {
                var zoom = _context.ZoomManages.FirstOrDefault(x => x.ZoomId.Equals(obj.RoomID));
                if (zoom != null)
                {
                    if (obj.ListUserMeeting.Count > 0)
                    {
                        var listUser = new List<UserIdModel>();

                        if (obj.ListUserMeeting.Any(x => x.UserId.Equals("0")) && obj.ListUserMeeting.Count == 1)
                        {
                            var users = _context.Users.Where(x => x.Active == true && x.UserName != "admin").Select(x => new { UserId = x.Id }).AsNoTracking();
                            foreach (var item in users)
                            {
                                var user = new UserIdModel
                                {
                                    UserId = item.UserId,
                                };
                                listUser.Add(user);
                            }
                        }
                        else
                        {
                            foreach (var item in obj.ListUserMeeting)
                            {
                                var user = new UserIdModel
                                {
                                    UserId = item.UserId,
                                };
                                listUser.Add(user);
                            }
                        }

                        var model = new
                        {
                            ZoomId = obj.RoomID,
                            ZoomName = zoom.ZoomName,
                            ZoomPass = zoom.ZoomPassword
                        };
                        SendPushNotification(listUser, string.Concat("Có lời mời bạn tham gia cuộc họp ", zoom.ZoomName), model, EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCallVideo));
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Danh sách người được invite trống";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không lấy được thông tin của room";
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [NonAction]
        public async Task<int> SendPushNotification(List<UserIdModel> listUserId, string message, object data, string fromSrc)
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                             join b in _context.FcmTokens on a.UserId equals b.UserId
                             join c in _context.Users on a.UserId equals c.Id
                             where c.Active && b.AppCode == "SMARTWORK"
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

                            var sendNotication = await _notification.SendNotification("Thông báo", message, listDevices, data, fromSrc, ESEIM.AppContext.UserName);
                        }
                    }
                    else
                    {
                        var sendNotication = await _notification.SendNotification("Thông báo", message, query.ToList(), data, fromSrc, ESEIM.AppContext.UserName);
                    }
                }
            }
            return 1;
        }

        [HttpPost]
        public List<TokenManager> GetListUserZoom()
        {
            var rs = new List<TokenManager>() { };
            try
            {
                rs = _context.TokenManagers.Where(x => x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Type.Equals("MEETING_SCHEDULE")).ToList();
            }
            catch (Exception ex)
            {
            }

            return rs;
        }

        [HttpPost]
        public JsonResult Insert([FromBody] ZoomManage obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.CreatedTime = DateTime.Now;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                _context.ZoomManages.Add(obj);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] ZoomManage obj)
        {
            var msgage = new JMessage { Error = false, Title = "" };
            try
            {
                //check exist code
                var checkExist = _context.ZoomManages.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist == null)
                {
                    msgage.Error = true;
                    msgage.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"));
                }
                else
                {
                    obj.UpdatedBy = ESEIM.AppContext.UserName;
                    obj.UpdatedTime = DateTime.Now;
                    _context.ZoomManages.Update(obj);
                    _context.SaveChanges();
                    msgage.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"));
                }
            }
            catch (Exception ex)
            {
                msgage.Error = true;
                msgage.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"));
            }
            return Json(msgage);
        }

        [HttpPost]
        public JsonResult Delete([FromBody] ZoomRequest obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var url = string.Format("https://api.zoom.us/v2/rooms/{0}", obj.RoomID);
                msg = CommonUtil.DeleteZoom(url, obj.Token, obj.Data);

                //var zoomManage = _context.ZoomManages.FirstOrDefault(x => x.Id == id);
                //if (zoomManage != null)
                //{
                //    zoomManage.DeletedBy = ESEIM.AppContext.UserName;
                //    zoomManage.DeletedTime = DateTime.Now;
                //    zoomManage.IsDeleted = true;
                //    _context.ZoomManages.Update(zoomManage);
                //    _context.SaveChanges();
                //    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"));
                //}
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"));
                //}
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListZoom()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                msg.Object = from a in _context.ZoomManages.Where(x => !x.IsDeleted)
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             select new RoomInfo
                             {
                                 RoomID = a.ZoomId,
                                 RoomName = a.ZoomName,
                                 RoomPassWord = a.ZoomPassword,
                                 UserName = session.FullName,
                                 CreatedBy = b.GivenName,
                                 CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                 Role = session.UserName.Equals(a.CreatedBy) ? 10 : 0,
                                 ListUserAccess = a.ListUserAccess,
                                 IsEdit = session.UserName.Equals(a.CreatedBy) ? true : false,
                             };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetMeetingDetail(string meetingId)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                msg.Object = (from a in _context.ZoomManages.Where(x => !x.IsDeleted)
                              join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                              where a.ZoomId.Equals(meetingId)
                              select new RoomInfo
                              {
                                  RoomID = a.ZoomId,
                                  RoomName = a.ZoomName,
                                  RoomPassWord = a.ZoomPassword,
                                  UserName = session.FullName,
                                  CreatedBy = b.GivenName,
                                  CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                  Role = session.UserName.Equals(a.CreatedBy) ? 10 : 0,
                                  ListUserAccess = a.ListUserAccess,
                                  IsEdit = session.Email.Equals(a.AccountZoom) ? true : false,
                              }).FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }


        public static long ToTimestamp(DateTime value)
        {
            long epoch = (value.Ticks - 621355968000000000) / 10000;
            return epoch;
        }

        public static string GenerateToken(string sdkKey, string sdkSecret, string meetingNumber, string ts, string role)
        {
            // Token will be good for 20 minutes
            DateTime TimeStamp = DateTime.UtcNow;
            DateTime Expiry = DateTime.UtcNow.AddMinutes(20);

            string ApiKey = sdkKey;
            string ApiSecret = sdkSecret;

            int iat = (int)(TimeStamp - new DateTime(1970, 1, 1)).TotalSeconds;
            int exp = (int)(Expiry - new DateTime(1970, 1, 1)).TotalSeconds;

            // Create Security key  using private key above:
            var securityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(Encoding.UTF8.GetBytes(ApiSecret));

            // length should be >256b
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            //Finally create a Token
            var header = new JwtHeader(credentials);

            //Zoom Required Payload
            var payload = new JwtPayload
            {
                { "sdkKey", sdkKey},
                { "mn", meetingNumber},
                { "role", role},
                { "iat", iat},
                { "exp", exp},
                { "appKey", sdkKey },
                { "tokenExp", iat + 60 * 60 * 2 },
            };

            var secToken = new JwtSecurityToken(header, payload);
            var handler = new JwtSecurityTokenHandler();

            // Token to String so you can use it in your client
            var tokenString = handler.WriteToken(secToken);
		
            return tokenString;
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        #region Model
        public class ZoomRequest
        {
            public ZoomRequest()
            {
                ApiGoogleServices = new List<TokenManager>();
            }

            public List<TokenManager> ApiGoogleServices { get; set; }
            public string MeetingTopic { get; set; }
            public string RoomID { get; set; }
            public string UserZoomID { get; set; }
            public string Token { get; set; }
            public string Data { get; set; }
        }
        public class RoomInfo
        {
            public string RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomPassWord { get; set; }
            public string UserName { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public int? Role { get; set; }
            public string ListUserAccess { get; set; }
            public bool IsEdit { get; set; }
            public string SdkKey { get; set; }
            public string SdkSecret { get; set; }
            public string Signature { get; set; }
        }
        public class UserIdModel
        {
            public string UserId { get; set; }
        }
        #endregion
    }
}