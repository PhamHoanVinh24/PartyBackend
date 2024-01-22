using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using III.Domain.Enums;
using GeoCoordinatePortable;
using DataConnection;
using System.Data;
using III.Admin.Controllers;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using static ESEIM.Models.EIMDBContext;
using System.Data.SqlClient;
using Newtonsoft.Json.Linq;

namespace ESEIM.Controllers
{
    //[EnableCors("AllowSpecificOrigin")]
    public class MobileAppController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        //private readonly PackageDbContext _packageContext;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IUploadService _uploadService;
        private readonly IActionLogService _actionLog;
        private readonly IFCMPushNotification _notification;
        private readonly IGoogleApiService _googleAPI;

        //var session = HttpContext.GetSessionUser();

        public MobileAppController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, IActionLogService actionLog, IHostingEnvironment hostingEnvironment, IUploadService uploadService, IFCMPushNotification notification, IGoogleApiService googleAPI)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _actionLog = actionLog;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = uploadService;
            _notification = notification;
            _googleAPI = googleAPI;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        //Từ controller company
        [HttpPost]
        public object GetAllCompany()
        {
            var a = _context.Customerss.Where(x => x.IsDeleted == false).OrderBy(x => x.CusID).AsNoTracking().ToList();
            return Json(a);

        }

        [HttpGet]
        public object GetAppVersion(string platformCode)
        {
            // platformCode should be 'APP_VERSION', 'APP_VERSION_ANDROID' or 'APP_VERSION_APPLE'
            return _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == platformCode);
        }

        [HttpPut]
        public object UpdateAppVersion([FromBody]AppVersion obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "APP_VERSION");
                if (data != null)
                {
                    data.ValueSet = obj.AppNumber;
                    data.Title = obj.VersionCode;
                    _context.CommonSettings.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "UpdateItem_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "UpdateItem_ITEM_NULL";
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UpdateItem_ERROR";
            }
            return Json(msg);
        }

        // Từ controller RomoocFcm
        [HttpGet]
        public object GetListMess()
        {
            var result = _context.VCJnanaNewsArticles.AsNoTracking().ToList();
            if (result != null)
            {
                result = result.OrderByDescending(x => x.id).Take(10).ToList();
                return Json(result);
            }
            else
            {
                return ("GetListMess_RETURN");
            }
        }

        //Từ controller RemoocX

        [HttpPost]
        public async Task<JsonResult> Logout(string username)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //var query = await _userManager.FindByNameAsync(username);
                var query = await _context.Users.FirstOrDefaultAsync(x => x.UserName == username && x.Active);
                if (query != null)
                {
                    if (query.IsOnline == 1)
                    {
                        var checkAppCrash = _context.VcAppAccessLogs.Where(x => x.UserName == username).ToList();
                        if (checkAppCrash.Any())
                        {
                            _context.VcAppAccessLogs.RemoveRange(checkAppCrash);
                        }
                        var listToken = _context.VcFcms.Where(x => x.UserName == username);
                        if (listToken.Any())
                        {
                            _context.VcFcms.RemoveRange(listToken);
                        }
                        query.IsOnline = 0;
                        _context.Users.Update(query);
                        await _context.SaveChangesAsync();
                        msg.ID = 1;
                        msg.Object = query;
                        msg.Title = "Offline";
                    }
                }
                else
                {
                    msg.Title = "Logout_USER_NULL";
                    //msg.Title = "UserName không tồn tại";
                    msg.ID = 10000;
                }
            }
            catch
            {
                msg.Title = "error";
                msg.ID = 10;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult isOnline(string username, int type)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj1 = _context.Users.FirstOrDefault(x => x.UserName == username && x.Active);
                if (obj1 == null)
                {
                    msg.Error = true;
                    msg.ID = 0;
                    msg.Title = "user không tồn tại!";
                }
                else
                {
                    obj1.IsOnline = type;
                    _context.Users.Update(obj1);

                    //_context.Entry(obj1).State = EntityState.Modified;

                    _context.SaveChanges();
                    msg.Title = "update thành công!";
                    msg.Object = obj1;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "update thất bại!";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> changePass(string username, string password)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.UserName == username && x.Active);
                if (us == null)
                {
                    msg.Title = "Người dùng không tồn tại hoặc bị khóa";
                    msg.Object = us;
                }
                else
                {
                    string code = await _userManager.GeneratePasswordResetTokenAsync(us);
                    var result = await _userManager.ResetPasswordAsync(us, code, password);
                    if (result.Succeeded)
                    {
                        var a = await _context.SaveChangesAsync();
                        msg.Title = "Cập nhập mật khẩu thành công";
                        msg.Object = us;

                        //us.UpdatedDate = DateTime.Now;
                        //_context.Users.Update(us);
                        //await _context.SaveChangesAsync();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Có lỗi khi cập nhập mật khẩu";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
            }
            return Json(msg);
        }


        //[HttpPost]
        //public async Task<JsonResult> changePassAll(string password)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var listUser = await _context.Users.Where(x => x.UserName != "admin" && x.Active).ToListAsync();
        //        foreach(var us in listUser)
        //        {
        //            if (us == null)
        //            {
        //                msg.Title = "Người dùng không tồn tại hoặc bị khóa";
        //                msg.Object = us;
        //            }
        //            else
        //            {
        //                string code = await _userManager.GeneratePasswordResetTokenAsync(us);
        //                var result = await _userManager.ResetPasswordAsync(us, code, password);
        //                if (result.Succeeded)
        //                {
        //                    var a = await _context.SaveChangesAsync();
        //                    msg.Title = "Cập nhập mật khẩu thành công";
        //                    msg.Object = us;

        //                    //us.UpdatedDate = DateTime.Now;
        //                    //_context.Users.Update(us);
        //                    //await _context.SaveChangesAsync();
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Có lỗi khi cập nhập mật khẩu";
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //    }
        //    return Json(msg);
        //}


        [HttpPost]
        public async Task<JsonResult> login(string username, string password, string token, string imei)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var us = await _userManager.FindByNameAsync(username);
                if (us != null)
                {
                    var checkPassWord = await _userManager.CheckPasswordAsync(us, password);
                    if (us != null && checkPassWord == true)
                    {
                        if (us.Active == true)
                        {
                            if (us.TypeStaff != null)
                            {
                                if (us.IsOnline == 1)
                                {
                                    //var checkAppCrash = _context.VcAppAccessLogs.Where(x => x.UserName == username && x.Status != "Logout").MaxBy(x => x.CreatedTime);
                                    var checkAppCrash = _context.VcAppAccessLogs.OrderByDescending(x => x.Id).FirstOrDefault(x => x.UserName == username);
                                    if (checkAppCrash != null)
                                    {
                                        if (checkAppCrash.Imei != imei)
                                        {
                                            msg.Error = true;
                                            msg.Title = "login_CHECK_DEVICE";
                                        }
                                        else
                                        {
                                            msg.Title = "login_SUCCESS";
                                            us.IsOnline = 1;
                                            _context.Users.Update(us);
                                            _context.SaveChanges();
                                            InsertToken(username, token, imei);

                                            if (!string.IsNullOrEmpty(us.Area))
                                            {
                                                var listArea = us.Area.Split(';');

                                                us.Area = _context.CommonSettings.Any(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == listArea[0])
                                                            ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == listArea[0]).ValueSet
                                                            : "";
                                            }
                                            msg.Object = us;
                                        }
                                    }
                                    else
                                    {
                                        msg.Title = "login_SUCCESS";
                                        us.IsOnline = 1;
                                        _context.Users.Update(us);
                                        _context.SaveChanges();
                                        InsertToken(username, token, imei);

                                        if (!string.IsNullOrEmpty(us.Area))
                                        {
                                            var listArea = us.Area.Split(';');

                                            us.Area = _context.CommonSettings.Any(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == listArea[0])
                                                        ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == "AREA" && x.CodeSet == listArea[0]).ValueSet
                                                        : "";
                                        }
                                        msg.Object = us;
                                    }
                                }
                                else
                                {
                                    msg.Title = "login_SUCCESS";
                                    us.IsOnline = 1;
                                    _context.Users.Update(us);
                                    _context.SaveChanges();
                                    InsertToken(username, token, imei);

                                    if (!string.IsNullOrEmpty(us.Area))
                                    {
                                        var listArea = us.Area.Split(';');

                                        us.Area = _context.CommonSettings.Any(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == listArea[0])
                                                    ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && x.CodeSet == listArea[0]).ValueSet
                                                    : "";
                                    }
                                    msg.Object = us;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = "login_CHECK_USER_APP";
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "login_CHECK_USER_APP_STOP";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "login_ERROR";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "login_ERROR";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "login_CHECK_LOGIN";
            }
            return Json(msg);
        }
        [NonAction]
        public void InsertToken(string userName, string token, string imei)
        {
            var fcm = _context.VcFcms.FirstOrDefault(x => x.Token == token);
            if (fcm == null)
            {
                VcFcm cus = new VcFcm();
                cus.UserName = userName;
                cus.Token = token;
                _context.VcFcms.Add(cus);
            }
            else
            {
                fcm.UserName = userName;
                _context.VcFcms.Update(fcm);
                _context.SaveChanges();
            }
            ///<summary>
            ///Insert Log
            ///</summary>
            var appLog = new VcAppAccessLog
            {
                UserName = userName,
                Imei = imei,
                CreatedTime = DateTime.Now,
            };
            _context.VcAppAccessLogs.Add(appLog);
            _context.SaveChanges();
        }

        //Từ controller SOSManager
        [HttpPost]
        public JsonResult UploadImage(IFormFile pictureFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                if (pictureFile.Length > 0)
                {
                    var mes = _uploadService.UploadImage(pictureFile);
                    var fileName = Path.GetFileName(pictureFile.FileName);
                    var extend = Path.GetExtension(fileName);
                    fileName = Path.GetFileNameWithoutExtension(fileName);
                    var media = new VcSOSMedia();
                    media.Path = "/uploads/Images/" + mes.Object.ToString();
                    media.Size = pictureFile.Length;
                    media.Extension = extend;
                    media.Name = fileName;
                    media.Code = Guid.NewGuid().ToString();
                    _context.VcSOSMedias.Add(media);
                    msg.Object = media;
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "UploadImage_SUCCESS";
                //   msg.Title = "Thêm thành công";

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UploadImage_ERROR";
                // msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UploadVideo(IFormFile videoFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                if (videoFile.Length > 0)
                {
                    var mes = _uploadService.UploadImage(videoFile);
                    var fileName = Path.GetFileName(videoFile.FileName);
                    var extend = Path.GetExtension(fileName);
                    fileName = Path.GetFileNameWithoutExtension(fileName);
                    var media = new VcSOSMedia();
                    media.Path = "/uploads/Videos/" + mes.Object.ToString();
                    media.Size = videoFile.Length;
                    media.Extension = extend;
                    media.Name = fileName;
                    media.Code = Guid.NewGuid().ToString();
                    _context.VcSOSMedias.Add(media);
                    msg.Object = media;
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "UploadImage_SUCCESS";
                //   msg.Title = "Thêm thành công";

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UploadImage_ERROR";
                // msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UploadAudio(IFormFile audioFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {
                if (audioFile.Length > 0)
                {
                    var mes = _uploadService.UploadImage(audioFile);
                    var fileName = Path.GetFileName(audioFile.FileName);
                    var extend = Path.GetExtension(fileName);
                    fileName = Path.GetFileNameWithoutExtension(fileName);
                    var media = new VcSOSMedia();
                    media.Path = "/uploads/Images/" + mes.Object.ToString();
                    media.Size = audioFile.Length;
                    media.Extension = extend;
                    media.Name = fileName;
                    media.Code = Guid.NewGuid().ToString();
                    _context.VcSOSMedias.Add(media);
                    msg.Object = media;
                }
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "UploadImage_SUCCESS";
                //   msg.Title = "Thêm thành công";

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UploadImage_ERROR";
                // msg.Title = "Xảy ra lỗi khi thêm";
            }
            return Json(msg);
        }

        public class ImageCode
        {
            public string Code { get; set; }
            public string Type { get; set; }
        }
        [HttpPost]
        public async Task<JsonResult> Insert(VcSOSInfoInsert obj, List<IFormFile> pictureFile)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                var data = new VcSOSInfo();
                data.Code = obj.Code;
                data.Note = obj.Note;
                data.Title = obj.Title;
                data.CreatedBy = obj.CreatedBy;
                data.CreatedTime = DateTime.Now;
                data.Data = obj.Data;
                data.Priority = obj.Priority;
                data.Address = obj.Address;

                string latlng = obj.Data.Replace("[", "").Replace("]", "").Replace(" ", "");
                var latlng1 = latlng.Split(',');
                if (latlng1.Length == 2)
                {
                    var result = await _googleAPI.GetAddress(latlng1[1], latlng1[0]);
                    if (result.status == "OK")
                    {
                        data.Address = result.results[0].formatted_address;
                    }
                }

                _context.VcSOSInfos.Add(data);
                //var list = new List<VcSOSMedia>();
                //if (pictureFile.Count > 0)
                //{
                //    foreach (var item in pictureFile)
                //    {
                //        if (item.Length > 0)
                //        {
                //            var mes = _uploadService.UploadImage(item);
                //            var fileName = Path.GetFileName(item.FileName);
                //            var extend = Path.GetExtension(fileName);
                //            fileName = Path.GetFileNameWithoutExtension(fileName);
                //            var media = new VcSOSMedia();
                //            media.Path = "/uploads/Files/" + mes.Object.ToString();
                //            media.Size = item.Length;
                //            media.Extension = extend;
                //            media.Name = fileName;
                //            media.Code = Guid.NewGuid().ToString();
                //            media.SosCode = data.Code;
                //            _context.VcSOSMedias.Add(media);
                //            msg.Object = media;
                //            list.Add(media);
                //        }
                //    }
                //    if (list.Count > 0)
                //        _context.VcSOSMedias.AddRange(list);
                //}
                //else
                //{
                //    //var ImageCode = obj.ImageCode.Replace("[\"", "").Replace("\"]", "").Replace("\",\"", ",").Split(',');
                //    var imageCode = JsonConvert.DeserializeObject<List<ImageCode>>(obj.ImageCode);
                //    foreach (var item in imageCode)
                //    {
                //        var dt = _context.VcSOSMedias.FirstOrDefault(x => x.Code == item.Code);
                //        if (dt != null)
                //        {
                //            dt.SosCode = data.Code;
                //            dt.Type = item.Type;
                //            _context.VcSOSMedias.Update(dt);
                //        }
                //    }
                //}
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Insert_SUCCESS";
                //   msg.Title = "Thêm thành công";
                //SendPushNotification(obj.Note);
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Insert_ERROR";
                //                msg.Title = "Xảy ra lỗi khi thêm";
            }
            msg.Object = obj;
            return Json(msg);
        }
        public class NotificationUrgent
        {
            public List<UserIdModel> listUser { get; set; }
            public int id { get; set; }
            public string message { get; set; }
            public string createdBy { get; set; }
        }
        [HttpPost]
        public async Task<JsonResult> SendNotificationApp([FromBody] NotificationUrgent data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var body = _context.VcSOSInfos.Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Priority,
                    x.Address,
                }).FirstOrDefault(x => x.Id == data.id);
                await SendPushNotification(data.listUser,
                    data.message,
                    body, EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromUrgentNoti), data.createdBy);
            }
            catch
            {
                msg.Error = true;
            }

            return Json(msg);
        }
        [NonAction]
        public async Task SendPushNotification(List<UserIdModel> listUserId, string message, object data, string fromSrc, string createdBy, string appName = "SMARTWORK")
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                             join b in _context.FcmTokens on a.UserId equals b.UserId
                             join c in _context.Users on a.UserId equals c.Id
                             where c.Active == true && c.UserName != createdBy && b.AppCode == appName
                             // remove sender from the receiver list
                             select new DeviceFcm
                             {
                                 Token = b.Token,
                                 Device = b.Device,
                                 UserId = a.UserId
                             }).ToList().DistinctBy(x => x.Token);
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

                            if (appName == "SMARTWORK")
                            {
                                var sendNotication = await _notification.SendNotification("Thông báo", message, listDevices, data, fromSrc, createdBy);
                            }
                            else if (appName == "METALEARN")
                            {
                                var sendNotication = _notification.SendNotificationMeta("Thông báo", message, listDevices, data, fromSrc);
                            }
                        }
                    }
                    else
                    {
                        if (appName == "SMARTWORK")
                        {
                            var sendNotication = await
                                _notification.SendNotification("Thông báo", message, query.ToList(), data, fromSrc, createdBy);
                        }
                        else if (appName == "METALEARN")
                        {
                            var sendNotication =
                                _notification.SendNotificationMeta("Thông báo", message, query.ToList(), data, fromSrc);
                        }
                    }
                }
            }
            return;
        }

        [HttpGet]
        public IActionResult GetNotifications(string userName)
        {
            return Ok(_context.Notifications.Where(x => !x.IsDeleted && x.Receiver == userName)
                .OrderByDescending(x => x.NotifyID).ToList());
        }
        [HttpDelete]
        public IActionResult DeleteNotification(int id, string userName)
        {
            var noti = _context.Notifications.FirstOrDefault(x => !x.IsDeleted && x.NotifyID == id);
            if (noti != null)
            {
                noti.IsDeleted = true;
                noti.DeletedTime = DateTime.Now;
                noti.DeletedBy = userName;
                _context.Notifications.Update(noti);
                _context.SaveChanges();
                return Ok("Xóa thành công");
            }
            else
            {
                return BadRequest("Có lỗi xảy ra");
            }
        }
        [HttpPost]
        public async Task<JsonResult> InsertNew([FromBody]VcSOSInfoInsert obj)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            try
            {

                var data = new VcSOSInfo();
                data.Code = obj.Code;
                data.Note = obj.Note;
                data.Title = obj.Title;
                data.CreatedBy = obj.CreatedBy;
                data.CreatedTime = DateTime.Now;
                data.Data = obj.Data;
                data.Priority = obj.Priority;
                data.Address = obj.Address;

                string latlng = obj.Data.Replace("[", "").Replace("]", "").Replace(" ", "");
                var latlng1 = latlng.Split(',');
                if (latlng1.Length == 2)
                {
                    var result = await _googleAPI.GetAddress(latlng1[1], latlng1[0]);
                    if (result.status == "OK")
                    {
                        data.Address = result.results[0].formatted_address;
                    }
                }

                _context.VcSOSInfos.Add(data);
                //var list = new List<VcSOSMedia>();
                //if (pictureFile.Count > 0)
                //{
                //    foreach (var item in pictureFile)
                //    {
                //        if (item.Length > 0)
                //        {
                //            var mes = _uploadService.UploadImage(item);
                //            var fileName = Path.GetFileName(item.FileName);
                //            var extend = Path.GetExtension(fileName);
                //            fileName = Path.GetFileNameWithoutExtension(fileName);
                //            var media = new VcSOSMedia();
                //            media.Path = "/uploads/Files/" + mes.Object.ToString();
                //            media.Size = item.Length;
                //            media.Extension = extend;
                //            media.Name = fileName;
                //            media.Code = Guid.NewGuid().ToString();
                //            media.SosCode = data.Code;
                //            _context.VcSOSMedias.Add(media);
                //            msg.Object = media;
                //            list.Add(media);
                //        }
                //    }
                //    if (list.Count > 0)
                //        _context.VcSOSMedias.AddRange(list);
                //}
                //else
                //{
                //    //var ImageCode = obj.ImageCode.Replace("[\"", "").Replace("\"]", "").Replace("\",\"", ",").Split(',');
                //    var imageCode = JsonConvert.DeserializeObject<List<ImageCode>>(obj.ImageCode);
                //    foreach (var item in imageCode)
                //    {
                //        var dt = _context.VcSOSMedias.FirstOrDefault(x => x.Code == item.Code);
                //        if (dt != null)
                //        {
                //            dt.SosCode = data.Code;
                //            dt.Type = item.Type;
                //            _context.VcSOSMedias.Update(dt);
                //        }
                //    }
                //}
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Insert_SUCCESS";
                //   msg.Title = "Thêm thành công";
                //SendPushNotification(obj.Note);
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Insert_ERROR";
                //                msg.Title = "Xảy ra lỗi khi thêm";
            }
            msg.Object = obj;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetNextCode(string userName)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            var date = DateTime.Now;
            var count = _context.VcSOSInfos.Where(x => x.CreatedBy.ToLower() == userName.ToLower()).Count();
            var sosCode = "SOS_" + userName + "_" + date.ToString("dd-MM-yyyy-HH-mm-ss.ffffff") + "_" + (count + 1);
            msg.Object = sosCode;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateItemPriority(VcSOSInfoInsert obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.VcSOSInfos.FirstOrDefault(x => x.Code == obj.Code);
                if (data != null)
                {
                    //_context.VcSOSInfos.Remove(data);
                    //var media = _context.VcSOSMedias.Where(x => x.SosCode == data.Code).ToList();
                    //if (media.Count > 0)
                    //{
                    //    _context.VcSOSMedias.RemoveRange(media);
                    //}
                    data.Priority = obj.Priority;
                    _context.VcSOSInfos.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "UpdateItem_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "UpdateItem_ITEM_NULL";
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UpdateItem_ERROR";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateItemNote([FromBody]VcSOSInfoInsert obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.VcSOSInfos.FirstOrDefault(x => x.Code == obj.Code);
                if (data != null)
                {
                    //_context.VcSOSInfos.Remove(data);
                    //var media = _context.VcSOSMedias.Where(x => x.SosCode == data.Code).ToList();
                    //if (media.Count > 0)
                    //{
                    //    _context.VcSOSMedias.RemoveRange(media);
                    //}
                    data.Note = obj.Note;
                    _context.VcSOSInfos.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "UpdateItem_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "UpdateItem_ITEM_NULL";
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UpdateItem_ERROR";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteItem(string sosCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.VcSOSInfos.FirstOrDefault(x => x.Code == sosCode);
                if (data != null)
                {
                    _context.VcSOSInfos.Remove(data);
                    var media = _context.VcSOSMedias.Where(x => x.SosCode == data.Code).ToList();
                    if (media.Count > 0)
                    {
                        _context.VcSOSMedias.RemoveRange(media);
                    }
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "DeleteItem_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "DeleteItem_ITEM_NULL";
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "DeleteItem_ERROR";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetMySos(MySosSearch obj)
        {
            var msg = new JMessage();
            try
            {
                var query = (from a in _context.VcSOSInfos
                             join b in _context.VcSOSMedias on a.Code equals b.SosCode into b2
                             join c1 in _context.Users on a.CreatedBy equals c1.UserName into c2
                             from c in c2.DefaultIfEmpty()
                             select new
                             {
                                 a.Id,
                                 a.Code,
                                 a.Title,
                                 a.Data,
                                 a.Priority,
                                 a.Note,
                                 a.Address,
                                 a.CreatedBy,
                                 CreatedTime = a.CreatedTime.ToString("HH:mm:ss"),
                                 Name = c != null ? c.GivenName : "",
                                 Avatar = c != null ? c.Picture : ""
                             })
                             .OrderByDescending(x => x.Id);
                int count = query.Count();
                if (obj.Length != 0)
                {
                    var data = query.Skip(obj.Length * (obj.Page - 1)).Take(obj.Length).AsNoTracking().ToList();
                    msg.Object = data;
                }
                else
                {
                    msg.Object = query.Skip(0).Take(30).AsNoTracking().ToList(); ;
                }
                //if (obj.Length == 0)
                //{
                //    var list = query.OrderByDescending(x => x.Id).GroupBy(x => x.Id).ToList();

                //    List<MySosRes> list1 = new List<MySosRes>();
                //    foreach (var item in list)
                //    {
                //        MySosRes dt = new MySosRes();
                //        List<string> imgPath = new List<string>();
                //        foreach (var item1 in item)
                //        {
                //            if (!string.IsNullOrEmpty(item1.Path))
                //                imgPath.Add("http://s-work.vn" + item1.Path);
                //            dt.Id = item1.Id;
                //            dt.Code = item1.Code;
                //            dt.Title = item1.Title;
                //            dt.Data = item1.Data;
                //            dt.Priority = item1.Priority;
                //            dt.Note = item1.Note;
                //            dt.Address = item1.Address;
                //            dt.CreatedBy = item1.CreatedBy;
                //            dt.Name = item1.Name;
                //        }
                //        dt.ImageCodes = imgPath;
                //        list1.Add(dt);
                //    }

                //    msg.Object = list1;
                //}
                //else
                //{
                //    var list = query.OrderByDescending(x => x.Id).GroupBy(x => x.Id).Skip(obj.Length * obj.Page).Take(obj.Length).ToList();
                //    List<string> imgPath = new List<string>();
                //    List<MySosRes> list1 = new List<MySosRes>();
                //    foreach (var item in list)
                //    {
                //        MySosRes dt = new MySosRes();
                //        foreach (var item1 in item)
                //        {
                //            imgPath.Add(item1.Path);
                //            dt.Id = item1.Id;
                //            dt.Code = item1.Code;
                //            dt.Title = item1.Title;
                //            dt.Data = item1.Data;
                //            dt.Priority = item1.Priority;
                //            dt.Note = item1.Note;
                //            dt.Address = item1.Address;
                //            dt.CreatedBy = item1.CreatedBy;
                //            dt.Name = item1.Name;
                //        }
                //        dt.ImageCodes = imgPath;
                //        list1.Add(dt);
                //    }
                //    msg.Object = list1;
                //}


            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetMySos_ERROR";
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetMySosCount(MySosSearch obj)
        {
            var msg = new JMessage();
            try
            {
                var query = (from a in _context.VcSOSInfos
                             join b in _context.VcSOSMedias on a.Code equals b.SosCode into b2
                             join c1 in _context.Users on a.CreatedBy equals c1.UserName into c2
                             from c in c2.DefaultIfEmpty()
                             select new
                             {
                                 a.Id,
                                 a.Code,
                                 a.Title,
                                 a.Data,
                                 a.Priority,
                                 a.Note,
                                 a.Address,
                                 a.CreatedBy,
                                 CreatedTime = a.CreatedTime.ToString("HH:mm:ss"),
                                 Name = c != null ? c.GivenName : "",
                                 Avatar = c != null ? c.Picture : ""
                             })
                             .OrderByDescending(x => x.Id);
                int count = query.Count();
                if (obj.Length != 0)
                {
                    var data = query.Skip(obj.Length * (obj.Page - 1)).Take(obj.Length).AsNoTracking().ToList();
                    msg.Object = data;
                }
                else
                {
                    msg.Object = query.Skip(0).Take(30).AsNoTracking().ToList(); ;
                    var data = query.Skip(0).Take(30).AsNoTracking().ToList();
                    msg.Object = data;
                    msg.Object = new
                    {
                        data = data,
                        count = count
                    };
                }
                
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetMySos_ERROR";
            }
            return Json(msg);
        }
        //Từ controller GisTableManager

        [HttpPost]
        public object GetMyGis(VcMyGisSearch obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var query = from a in _context.MapDataGpss.Where(x => !x.IsDeleted && x.CreatedBy == obj.UserName)
                            join b1 in _context.Customerss.Where(x => !x.IsDeleted) on a.ObjCode equals b1.CusCode into b2
                            from b in b2.DefaultIfEmpty()
                            select new
                            {
                                a.Id,
                                a.MapCode,
                                a.MakerGPS,
                                a.PolygonGPS,
                                a.Title,
                                a.Icon,
                                a.ObjCode,
                                a.Image,
                                a.IsActive,
                                a.IsDefault,
                                a.GisData,
                                a.Address,
                                CusName = b != null ? b.CusName : "Không xác định"
                            };

                if (obj.Length == 0)
                {
                    var list = query.OrderByDescending(x => x.Id).ToList();
                    msg.Object = list;
                }
                else
                {
                    var list = query.OrderByDescending(x => x.Id).Skip(obj.Length * obj.Page).Take(obj.Length).ToList();
                    msg.Object = list;
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetMyGis_ERROR";
            }
            var json = Json(msg);
            return Json(msg);
        }


        [HttpPost]
        public JsonResult DeleteItemGis(int id)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.MapDataGpss.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.MapDataGpss.Remove(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "DeleteItemGis_SUCCESS";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "DeleteItemGis_ITEM_NULL";
                }

            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "DeleteItemGis_ERROR";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetNextCodeGis(string userName)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            var date = DateTime.Now;
            var count = _context.VcGisTables.Where(x => x.Created_By.ToLower() == userName.ToLower()).Count();
            var sosCode = "GIS_" + userName + "_" + date.ToString("dd-MM-yyyy") + "_" + (count + 1);
            msg.Object = sosCode;
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult InsertGis(GisModel obj)
        //{
        //    JMessage msg = new JMessage();
        //    msg.Object = obj;
        //    try
        //    {
        //        var VcGisTable = new VcGisTable();
        //        VcGisTable.Code = obj.Code;
        //        VcGisTable.Name = obj.Name;
        //        VcGisTable.Parent = obj.Parent;
        //        VcGisTable.Type = obj.Type;
        //        VcGisTable.Created_By = obj.CreatedBy;
        //        VcGisTable.Created_Time = DateTime.Now;

        //        var mList = JsonConvert.DeserializeObject<List<NodeGis>>(obj.List1);

        //        GisObject gisObject = new GisObject();
        //        foreach (var item in mList)
        //        {
        //            List<double> m = new List<double>();
        //            m.Add(item.Lng * 20037508.34 / 180);
        //            m.Add((Math.Log(Math.Tan((90 + item.Lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
        //            gisObject.geometry.coordinates[0].Add(m);
        //        }
        //        VcGisTable.Node_Gis = JsonConvert.SerializeObject(gisObject);
        //        _context.VcGisTables.Add(VcGisTable);
        //        _context.SaveChanges();
        //        msg.Error = false;
        //        msg.Title = "Thêm thành công";
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = ex.Message;
        //    }
        //    return Json(msg);
        //}

        ////Hàm cũ
        //[HttpPost]
        //public JsonResult InsertGisData(PackingModel obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        if (obj.Gis_data != null)
        //        {
        //            var model = new MapDataGps
        //            {
        //                Title = obj.title,
        //                Icon = obj.Icon,
        //                ObjCode = obj.ObjCode,
        //                //Icon = obj.Icon.Contains("SHOP") ? SHOP_ICON : obj.Icon.Contains("PAGODA") ? PAGODA_ICON : obj.Icon.Contains("PARK") ? PARK_ICON : obj.Icon.Contains("COMPANY") ? COMPANY_ICON : null,
        //                PolygonGPS = obj.Gis_data,
        //                CreatedBy = obj.CreatedBy,
        //                CreatedTime = DateTime.Now
        //            };
        //            _context.MapDataGpss.Add(model);
        //            _context.SaveChanges();
        //            msg.Title = "Thêm mới địa điểm thành công";
        //        }
        //        else
        //        {
        //            msg.Title = "Thêm mới địa điểm thất bại";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Thêm mới địa điểm lỗi";
        //    }
        //    return Json(msg);
        //}

        ////Hàm cũ
        //[HttpPost]
        //public JsonResult UpdateGis(GisModel obj)
        //{
        //    JMessage msg = new JMessage();
        //    msg.Object = obj;
        //    try
        //    {
        //        //VcGisTable VcGisTable = new VcGisTable();
        //        //VcGisTable.Code = Guid.NewGuid().ToString();
        //        //VcGisTable.Name = obj.Name;
        //        //VcGisTable.Parent = obj.Parent;
        //        //VcGisTable.Created_By = obj.CreatedBy;
        //        //VcGisTable.Created_Time = DateTime.Now;
        //        var data = _context.VcGisTables.FirstOrDefault(x => x.Code == obj.Code);
        //        if (data != null)
        //        {
        //            var mList = JsonConvert.DeserializeObject<List<NodeGis>>(obj.List1);
        //            data.Parent = obj.Parent;
        //            data.Type = obj.Type;
        //            GisObject gisObject = new GisObject();
        //            foreach (var item in mList)
        //            {
        //                List<double> m = new List<double>();
        //                m.Add(item.Lng * 20037508.34 / 180);
        //                m.Add((Math.Log(Math.Tan((90 + item.Lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
        //                gisObject.geometry.coordinates[0].Add(m);
        //            }
        //            data.Node_Gis = JsonConvert.SerializeObject(gisObject);
        //            _context.VcGisTables.Update(data);
        //            _context.SaveChanges();
        //            msg.Error = false;
        //            msg.Title = "Cập nhật thành công";
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Không tìm thấy dữ liệu";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = ex.Message;
        //    }
        //    return Json(msg);
        //}

        //Màn 1
        [HttpPost]
        public JsonResult GetListWorkPlan(string username)
        {
            var msg = new JMessageWp() { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.VcWorkPlans
                            join b in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted == false) on a.CurrentStatus equals b.CodeSet
                            where a.UserName == username
                            && a.IsDeleted != true
                            && a.CurrentStatus != WpStatus.WpCancel.DescriptionAttr()
                            //orderby a.UpdatedTime ?? DateTime.MaxValue descending, a.CreatedTime
                            orderby a.CreatedTime descending
                            select new
                            {
                                WpCode = a.WpCode,
                                FromDate = a.FromDate.ToString("yyyy-MM-dd"),
                                ToDate = a.ToDate.ToString("yyyy-MM-dd"),
                                WeekNo = a.WeekNo,
                                Year = a.CreatedTime.Year,
                                StatusCode = a.CurrentStatus,
                                StatusName = b.ValueSet
                            })
                            .Skip(0).Take(10)
                            .AsNoTracking().ToList();

                var maxItem = data.OrderByDescending(x => x.ToDate).Take(1).FirstOrDefault();
                //var maxTodate = maxItem == null ? DateTime.Now.Date : maxItem.ToDate.AddDays(1) > DateTime.Now.Date ? maxItem.ToDate.AddDays(1) : DateTime.Now.Date;
                //var maxTodateString = maxTodate.ToString("yyyy-MM-dd");
                msg.Object = data;
                //msg.MaxTodate = maxTodateString;
                msg.ID = maxItem == null ? 1 : (maxItem.StatusCode == "WP_PROCESSING" || maxItem.StatusCode == "WP_DONE") ? 1 : 0;
            }
            catch
            {
                msg.Error = true;
                //msg.Title = "Lỗi khi load kế hoạch tuần!";
                msg.Title = "GetListWorkPlan_error";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListNode(string username)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == username && x.Active);
                if (user != null)
                {
                    if (string.IsNullOrEmpty(user.Area))
                    {
                        msg.Error = true;
                        msg.Title = "GetListNode_USER_MANAGE_NULL";
                    }
                    else
                    {
                        var listArea = user.Area.Split(';');
                        var rs = new List<Customers>();

                        //foreach (var itemArea in listArea)
                        //{
                        //    var data = _context.Customerss.Where(x => x.Area == itemArea && x.IsDeleted == false).AsNoTracking().ToList();
                        //    rs.AddRange(data);
                        //}

                        var data = _context.Customerss.Where(x => listArea.Any(y => y == x.Area) && x.IsDeleted == false && x.ActivityStatus == "CUSTOMER_ACTIVE").AsNoTracking();
                        rs.AddRange(data);
                        msg.Object = rs;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "GetListNode_USER_NULL";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "GetListNode_ERROR";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListWpStatus()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted != true).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking().ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Lỗi khi load danh sách trạng thái!";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteWorkPlan(string username, string WpCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                if (item != null)
                {
                    if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                    {
                        var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == username && x.Active);

                        item.CurrentStatus = WpStatus.WpCancel.DescriptionAttr();
                        item.IsDeleted = true;

                        //item.DeletedBy = EIM.AppContext.UserName;
                        item.DeletedBy = user?.UserName;
                        item.DeletedTime = DateTime.Now;

                        _context.VcWorkPlans.Update(item);

                        var listSettingRoute = _context.VcSettingRoutes.Where(x => x.WpCode == WpCode && x.IsDeleted != true && x.CurrentStatus == RouteStatus.RoutePending.DescriptionAttr()).ToList();
                        foreach (var ite in listSettingRoute)
                        {
                            ite.IsDeleted = true;
                            ite.CurrentStatus = RouteStatus.RouteCancel.DescriptionAttr();
                            ite.DeletedBy = user?.UserName;
                            ite.DeletedTime = DateTime.Now;

                            _context.VcSettingRoutes.Update(ite);
                        }

                        _context.SaveChanges();
                        msg.Title = "DeleteWorkPlan_success";
                        //msg.Title = "Xóa kế hoạch tuần thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "DeleteWorkPlan_Not_Delete";
                        //msg.Title = "Kế hoạch tuần đã duyệt không được xóa.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "DeleteWorkPlan_Not_Haven";
                    //msg.Title = "Kế hoạch tuần không tồn tại.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "DeleteWorkPlan_Error";
                //msg.Title = "Có lỗi khi xóa kế hoạch tuần.";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> GetWorkPlan(string WpCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                if (item != null)
                {
                    if (item.CurrentStatus != WpStatus.WpCancel.DescriptionAttr())
                    {
                        WorkPlanDetail obj = new WorkPlanDetail();
                        obj.WpCode = item.WpCode;
                        obj.FromDate = item.FromDate.ToString("dd-MM-yyyy");
                        obj.ToDate = item.ToDate.ToString("dd-MM-yyyy");
                        obj.StatusCode = item.CurrentStatus;
                        obj.StatusName = _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted == false).FirstOrDefault(x => x.CodeSet == item.CurrentStatus)?.ValueSet;

                        obj.list_detail = (from a in _context.VcSettingRoutes
                                           join c1 in _context.Customerss.Where(x => !x.IsDeleted) on a.Node equals c1.CusCode into c2
                                           from c in c2.DefaultIfEmpty()
                                           where a.IsDeleted != true
                                           && a.WpCode == WpCode
                                           select new SettingRouteModel
                                           {
                                               sltNode = a.Node,
                                               Address = c != null ? c.Address : "",
                                               NameNode = c != null ? c.CusName : "",
                                               txtTime = a.TimePlan.Value.ToString("HH:mm dd-MM-yyyy"),
                                               taNote = a.Note,
                                           }
                                    ).AsNoTracking().ToList();

                        msg.Title = "GetWorkPlan_success";
                        //msg.Title = "Load dữ liệu kế hoạch tuần thành công";
                        msg.Object = obj;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "GetWorkPlan_delete";
                        //msg.Title = "Kế hoạch tuần đã bị xóa.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "GetWorkPlan_nothaven";
                    //msg.Title = "Kế hoạch tuần không tồn tại.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetWorkPlan_error";
                //msg.Title = "Có lỗi khi load kế hoạch tuần.";
            }
            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> InsertWorkPlan([FromBody]WorkPlanInsert objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var msgWorkPlan = new JMessage { Error = false, Title = "" };
            var msgSettingRoute = new JMessage { Error = false, Title = "" };
            try
            {
                msgWorkPlan = await FuncInsertWorkPlan(objInsert.username, objInsert.WpCode, objInsert.WeekNo.ToString(), "");
                if (msgWorkPlan.Error == false)
                {
                    var objWp = (WorkPlanRes)msgWorkPlan.Object;
                    var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == objInsert.username && x.Active);

                    //Xóa list detail cũ
                    var listSettingRoutes = _context.VcSettingRoutes.Where(x => x.WpCode == objInsert.WpCode && x.IsDeleted != true).ToList();
                    foreach (var settingRoute in listSettingRoutes)
                    {
                        settingRoute.IsDeleted = true;
                        settingRoute.DeletedBy = user?.UserName;
                        settingRoute.DeletedTime = DateTime.Now;

                        _context.VcSettingRoutes.Update(settingRoute);
                    }

                    //insert list detail mới
                    var orderMax = _context.VcSettingRoutes.Where(x => x.WpCode == objInsert.WpCode).OrderByDescending(x => x.Order).Take(1).FirstOrDefault();
                    var maxOrder = orderMax == null ? 1 : orderMax.Order + 1;

                    foreach (var itemDetail in objInsert.list_detail)
                    {
                        msgSettingRoute = await FuncInsertSettingRoute(objWp.Username, objWp.WpCode, itemDetail.sltNode, itemDetail.taNote, maxOrder);
                        maxOrder = maxOrder + 1;
                        if (msgSettingRoute.Error == true)
                        {
                            break;
                        }
                    }
                    if (msgSettingRoute.Error == false)
                    {
                        await _context.SaveChangesAsync();
                        msg.Title = msgWorkPlan.Title;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = msgSettingRoute.Title;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = msgWorkPlan.Title;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "InsertWorkPlan_Error";
                //msg.Title = "Có lỗi khi thêm/chỉnh sửa thông tin kế hoạch tuần.";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> GetCheckIn(string RouteCode, string Imei)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var settingRoute = _context.VcSettingRoutes.FirstOrDefault(x => x.IsDeleted != true && x.RouteCode == RouteCode);
                if (settingRoute != null)
                {
                    var workPlan = _context.VcWorkPlans.FirstOrDefault(x => x.IsDeleted != true && x.WpCode == settingRoute.WpCode);
                    if (workPlan != null)
                    {
                        var workCheck = await _context.VcWorkChecks.FirstOrDefaultAsync(x => x.CareCode == RouteCode && x.Checkout != true);
                        if (workCheck == null)
                        {
                            var chkCheckin = await _context.VcWorkChecks.Where(x => x.CareCode == RouteCode && x.CheckinTime.HasValue && x.CheckinTime.Value.Date == DateTime.Now.Date).OrderByDescending(x => x.CheckinTime).FirstOrDefaultAsync();
                            if (chkCheckin != null)
                            {
                                var checkinTime = chkCheckin.CheckinTime != null ? chkCheckin.CheckinTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                                var checkoutTime = chkCheckin.CheckoutTime != null ? chkCheckin.CheckoutTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                                msg.Object = new { chkCheckin.ImagePath, Time = checkoutTime, GPS = chkCheckin.Checkout_gps };
                                msg.ID = 3;
                                msg.Title = "GetCheckIn_CHECKOUT";
                                // msg.Title = "Bạn đã CheckOut.";
                            }
                            else
                            {
                                msg.ID = 1;
                                msg.Title = "GetCheckIn_CHECKIN_NULL";
                                //msg.Title = "Bạn chưa CheckIn.";
                            }
                        }
                        else
                        {
                            //var fcm = _context.VcFcms.FirstOrDefault(x => x.UserName == workCheck.UserName);
                            //if (fcm == null)
                            //{
                            //    msg.Error = true;
                            //    msg.Title = "Không lấy được dữ liệu token.";
                            //}
                            //else
                            //{
                            var checkinTime = workCheck.CheckinTime != null ? workCheck.CheckinTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                            //if (workCheck.Imei == fcm.Token)
                            //{
                            //    msg.ID = 2;
                            //    msg.Object = new { workCheck.ImagePath, checkinTime };
                            //    msg.Title = "Vui lòng Checkout cho phiên làm việc trước đó.";
                            //}
                            //else
                            //{

                            var chkCheckin = _context.VcWorkChecks.Any(x => x.CareCode == RouteCode && x.Checkout != true && x.CheckinTime.HasValue && x.CheckinTime.Value.Date == DateTime.Now.Date);
                            if (chkCheckin)
                            {
                                msg.ID = 2;
                                msg.Object = new { workCheck.ImagePath, Time = checkinTime, GPS = workCheck.Checkin_gps };
                                msg.Title = "GetCheckIn_CHECKIN";
                                // msg.Title = "Bạn đã Checkin.";
                            }
                            else
                            {
                                msg.ID = 2;
                                msg.Object = new { workCheck.ImagePath, Time = checkinTime, GPS = workCheck.Checkin_gps };
                                msg.Title = "GetCheckIn_CHECK_CHECKOUT";
                                //msg.Title = "Vui lòng Checkout cho phiên làm việc trước đó.";
                            }

                            //}
                            //}
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "GetCheckIn_ERROR_GET_PLAN";
                        //msg.Title = "Không lấy được thông tin kế hoạch tuần này.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "GetCheckIn_ERROR_PLAN_NULL";
                    // msg.Title = "Chưa lập lịch kế hoạch tuần cho Nhà phân phối/NPP/Đại lý/Cửa hàng này.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetCheckIn_ERROR";
                // msg.Title = "Có lỗi khi lấy thông tin CheckIn.";
            }
            return Json(msg);
        }



        //Check khoảng cách cho phép
        [HttpPost]
        public async Task<JsonResult> GetDistance2Point(string Node, string LocationGps)
        {
            var msg = new JMessage { ID = 1, Error = false, Title = "" };
            try
            {
                var allowDistanceItem = await _context.CommonSettings.FirstOrDefaultAsync(x => x.AssetCode == "VICEM" && x.CodeSet == "ALLOW_DISTANCE");
                var allowDistance = allowDistanceItem == null ? 300 : Convert.ToDouble(allowDistanceItem.ValueSet);

                var listGPSNode = await _context.MapDataGpss.Where(x => x.ObjCode == Node && !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS))
                                                     .AsNoTracking()
                                                     .Select(x => x.MakerGPS)
                                                     .ToListAsync();
                if (!listGPSNode.Any())
                {
                    msg.ID = 0;
                    msg.Error = true;
                    msg.Title = "GetDistance2Point_GPS_STORE_NULL";
                    // msg.Title = "Nhà phân phối/NPP/Đại lý/Cửa hàng chưa khai báo vị trí.";
                    return Json(msg);
                }
                else
                {
                    var rs = false;
                    foreach (var locationAgent in listGPSNode)
                    {
                        var locationAgentArr = locationAgent.Split(',');
                        var sLat = Convert.ToDouble(locationAgentArr[0]);
                        var sLong = Convert.ToDouble(locationAgentArr[1]);

                        var location = LocationGps.Replace("[", "").Replace("]", "");
                        var locationArr = location.Split(',');
                        var eLat = Convert.ToDouble(locationArr[0]);
                        var eLong = Convert.ToDouble(locationArr[1]);

                        var sCoord = new GeoCoordinate(sLat, sLong);
                        var eCoord = new GeoCoordinate(eLat, eLong);

                        var distance = sCoord.GetDistanceTo(eCoord);
                        if (distance < allowDistance)
                        {
                            rs = true;
                            break;
                        }
                    }
                    if (rs)
                    {
                        msg.Title = "GetDistance2Point_GET_CHECK";
                        // msg.Title = "Bạn được phép checkin/checkout.";
                        return Json(msg);
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Error = true;
                        msg.Title = "GetDistance2Point_CHECK_DISTANCE";
                        //msg.Title = "Bạn nằm ngoài khoảng cách được phép checkin/checkout.";
                        return Json(msg);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.ID = 0;
                msg.Error = true;
                msg.Title = "GetDistance2Point_ERROR_CHECK_DISTANCE";
                //msg.Title = "Có lỗi khi xác định khoảng cách cho phép checkin.";
                return Json(msg);
            }
        }

        //Func Check khoảng cách cho phép
        [HttpPost]
        public bool FuncGetAllowDistance(string Node, string LocationGps)
        {
            try
            {
                var allowDistanceItem = _context.CommonSettings.FirstOrDefault(x => x.AssetCode == "VICEM" && x.CodeSet == "ALLOW_DISTANCE");
                var allowDistance = allowDistanceItem == null ? 300 : Convert.ToDouble(allowDistanceItem.ValueSet);

                var listGPSNode = _context.MapDataGpss.Where(x => x.ObjCode == Node && !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS))
                                                     .AsNoTracking()
                                                     .Select(x => x.MakerGPS)
                                                     .ToList();
                if (!listGPSNode.Any())
                {
                    return false;
                }
                else
                {
                    var rs = false;
                    foreach (var locationAgent in listGPSNode)
                    {
                        var locationAgentArr = locationAgent.Split(',');
                        var sLat = Convert.ToDouble(locationAgentArr[0]);
                        var sLong = Convert.ToDouble(locationAgentArr[1]);

                        var location = LocationGps.Replace("[", "").Replace("]", "");
                        var locationArr = location.Split(',');
                        var eLat = Convert.ToDouble(locationArr[0]);
                        var eLong = Convert.ToDouble(locationArr[1]);

                        var sCoord = new GeoCoordinate(sLat, sLong);
                        var eCoord = new GeoCoordinate(eLat, eLong);

                        var distance = sCoord.GetDistanceTo(eCoord);
                        if (distance < allowDistance)
                        {
                            rs = true;
                            break;
                        }
                    }
                    if (rs)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<JsonResult> CheckIn(string RouteCode, string Gps, string Address, string Imei, IFormFile Image)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (Address == "undefined") Address = "";
            try
            {
                if (Gps == "[undefined,undefined]")
                {
                    msg.Error = true;
                    msg.Title = "CheckIn_GPS_NULL";
                    //  msg.Title = "Chưa lấy được GPS.";
                }
                else
                {
                    var settingRoute = _context.VcSettingRoutes.FirstOrDefault(x => x.IsDeleted != true && x.RouteCode == RouteCode);
                    if (settingRoute != null)
                    {
                        var workPlan = _context.VcWorkPlans.FirstOrDefault(x => x.IsDeleted != true && x.WpCode == settingRoute.WpCode);
                        if (workPlan != null)
                        {
                            var workCheck = await _context.VcWorkChecks.FirstOrDefaultAsync(x => x.CareCode == RouteCode && x.Checkout != true);
                            if (workCheck == null)
                            {
                                var chkUser = await _context.Users.AnyAsync(x => x.UserName == workPlan.UserName && x.Active);
                                if (chkUser)
                                {
                                    var countMax = _context.VcWorkChecks.Where(x => x.CareCode == RouteCode).OrderByDescending(x => x.Count).Take(1).FirstOrDefault();
                                    var maxCount = countMax == null ? 1 : countMax.Count + 1;

                                    VcWorkCheck obj = new VcWorkCheck();
                                    if (Image != null)
                                    {
                                        var mes = _uploadService.UploadImage(Image);
                                        obj.ImagePath = "/uploads/Images/" + mes.Object.ToString();
                                    }
                                    obj.Checkin = true;
                                    obj.CheckinTime = DateTime.Now;
                                    obj.Checkin_gps = Gps;
                                    obj.Address = Address;
                                    obj.CareCode = RouteCode;
                                    obj.Imei = Imei;
                                    obj.Count = maxCount;

                                    obj.UserName = workPlan.UserName;
                                    obj.CreatedBy = workPlan.UserName;

                                    _context.VcWorkChecks.Add(obj);

                                    if (settingRoute.CurrentStatus == RouteStatus.RoutePending.DescriptionAttr())
                                    {
                                        settingRoute.CurrentStatus = RouteStatus.RouteProcessing.DescriptionAttr();
                                    }

                                    settingRoute.UpdatedTime = DateTime.Now;
                                    _context.VcSettingRoutes.Update(settingRoute);

                                    if (workPlan.CurrentStatus == WpStatus.WpApproved.DescriptionAttr())
                                    {
                                        workPlan.CurrentStatus = WpStatus.WpProcessing.DescriptionAttr();
                                    }

                                    _context.VcWorkPlans.Update(workPlan);

                                    _context.SaveChanges();

                                    var time = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");

                                    msg.Object = new { Time = time, GPS = Gps };
                                    msg.Title = "CheckIn_SUCCESS";
                                    //msg.Title = "CheckIn thành công. Vui lòng nhập dữ liệu!";
                                }
                                else
                                {
                                    msg.Error = true;
                                    //msg.Title = "Người dùng không tồn tại hoặc đã ngừng hoạt động.";
                                    msg.Title = "CheckIn_USER_NULL";
                                }
                            }
                            else
                            {
                                //var fcm = _context.VcFcms.FirstOrDefault(x => x.UserName == workCheck.UserName);
                                //if (fcm == null)
                                //{
                                //    msg.Error = true;
                                //    msg.Title = "Không lấy được dữ liệu token.";
                                //}
                                //else
                                //{
                                //if (workCheck.Imei == fcm.Token)
                                //{
                                //    msg.Error = true;
                                //    msg.Title = "Người dùng đã CheckIn.";
                                //}
                                //else
                                //{
                                msg.Error = true;
                                msg.Title = "CheckIn_USER_CHECKIN";
                                // msg.Title = "Người dùng đã CheckIn.";
                                //}
                                //}
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "CheckIn_ERROR_GET_PLAN";
                            //msg.Title = "Không lấy được thông tin kế hoạch tuần này.";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "CheckIn_ERROR_PLAN_NULL";
                        //msg.Title = "Chưa lập lịch kế hoạch tuần cho Nhà phân phối/NPP/Đại lý/Cửa hàng này.";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi CheckIn.";
                //msg.Title = "Có lỗi khi CheckIn.";
            }
            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> CheckOut(string RouteCode, string Gps, string Address, string Imei)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (Address == "undefined") Address = "";
                if (Gps == "[undefined,undefined]")
                {
                    msg.Error = true;
                    msg.Title = "CheckOut_GPS_NULL";
                    // msg.Title = "Chưa lấy được GPS.";
                }
                else
                {
                    var settingRoute = _context.VcSettingRoutes.FirstOrDefault(x => x.IsDeleted != true && x.RouteCode == RouteCode);
                    if (settingRoute != null)
                    {
                        var workPlan = _context.VcWorkPlans.FirstOrDefault(x => x.IsDeleted != true && x.WpCode == settingRoute.WpCode);
                        if (workPlan != null)
                        {
                            var workCheck = await _context.VcWorkChecks.FirstOrDefaultAsync(x => x.CareCode == RouteCode && x.Checkout != true);
                            if (workCheck != null)
                            {
                                //var fcm = _context.VcFcms.FirstOrDefault(x => x.UserName == workCheck.UserName);
                                //if (fcm == null)
                                //{
                                //    msg.Error = true;
                                //    msg.Title = "Không lấy được dữ liệu token.";
                                //}
                                //else
                                //{
                                var allowTimeCheckoutItem = await _context.CommonSettings.FirstOrDefaultAsync(x => x.AssetCode == "VICEM" && x.CodeSet == "ALLOW_TIME_CHECKOUT");
                                var allowTimeCheckout = allowTimeCheckoutItem == null ? 15 : Convert.ToDouble(allowTimeCheckoutItem.ValueSet);
                                var dtNow = DateTime.Now;
                                if (dtNow.AddMinutes(-1 * allowTimeCheckout) < workCheck.CheckinTime)
                                {
                                    msg.Error = true;
                                    msg.Title = "CheckOut_ERROR_TIME";
                                    //msg.Title = "Chưa đủ thời gian cho phép Checkout.";
                                }
                                else
                                {
                                    var chkDistance = FuncGetAllowDistance(settingRoute.Node, Gps);
                                    if (chkDistance)
                                    {
                                        workCheck.CheckoutOutDistance = false;
                                    }
                                    else
                                    {
                                        workCheck.CheckoutOutDistance = true;
                                    }

                                    workCheck.Checkout = true;
                                    workCheck.CheckoutTime = DateTime.Now;
                                    workCheck.Checkout_gps = Gps;

                                    _context.VcWorkChecks.Update(workCheck);

                                    //Kiểm tra trạng thái của Kế hoạch
                                    var countDone = _context.VcSettingRoutes.Where(x => !x.IsDeleted && x.WpCode == settingRoute.WpCode && x.CurrentStatus == RouteStatus.RouteDone.DescriptionAttr()).Count();
                                    var countTotal = _context.VcSettingRoutes.Where(x => !x.IsDeleted && x.WpCode == settingRoute.WpCode).Count();
                                    if (countDone < countTotal)
                                    {
                                        workPlan.CurrentStatus = WpStatus.WpProcessing.DescriptionAttr();
                                    }
                                    else
                                    {
                                        workPlan.CurrentStatus = WpStatus.WpDone.DescriptionAttr();
                                    }
                                    _context.VcWorkPlans.Update(workPlan);


                                    //Kiểm tra trạng thái của Route
                                    var chkHasData = _context.VcCustomerCares.Any(x => !x.IsDeleted && x.RouteCode == settingRoute.RouteCode);
                                    if (!chkHasData)
                                    {
                                        settingRoute.CurrentStatus = RouteStatus.RouteProcessing.DescriptionAttr();
                                    }
                                    settingRoute.UpdatedTime = DateTime.Now;
                                    settingRoute.CreatedTime = DateTime.Now;
                                    settingRoute.TimeWork = DateTime.Now;
                                    _context.VcSettingRoutes.Update(settingRoute);

                                    _context.SaveChanges();


                                    var time = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");

                                    msg.Object = new { Time = time, GPS = Gps };

                                    //if (workCheck.Imei == fcm.Token)
                                    //{
                                    //    msg.Title = "CheckOut thành công.";
                                    //}
                                    //else
                                    //{
                                    msg.Title = "CheckOut_SUCCESS";
                                    // msg.Title = "CheckOut thành công.";
                                    //}
                                }
                                //}
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = "CheckOut_USER_CHECK";
                                //msg.Title = "Bạn chưa CheckIn hoặc đã CheckOut.";
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "CheckOut_ERROR_GET_PLAN";
                            // msg.Title = "Không lấy được thông tin kế hoạch tuần này.";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "CheckOut_ERROR_PLAN_NULL";
                        // msg.Title = "Chưa lập lịch kế hoạch tuần cho Nhà phân phối/NPP/Đại lý/Cửa hàng này.";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "CheckOut_ERROR";
                //                msg.Title = "Có lỗi khi CheckOut.";
            }
            return Json(msg);
        }

        //Màn 3 - màn hình list thực hiện công việc - lấy ra các công việc chưa thực hiện & đã thực hiện của 1 user
        [HttpPost]
        public JsonResult GetAllNode(string username)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var td = DateTime.Now.Date;
                float percent = 0;
                var wplist = _context.VcWorkPlans.Where(x => x.UserName == username && x.IsDeleted != true
                                        && x.CurrentStatus != WpStatus.WpCancel.DescriptionAttr()
                                        && x.CurrentStatus != WpStatus.WpPending.DescriptionAttr()
                                        && x.CurrentStatus != WpStatus.WpReject.DescriptionAttr()
                                        && x.CurrentStatus != WpStatus.WpWaiting.DescriptionAttr())
                                     .OrderByDescending(x => x.Id)
                                     .Select(x => new { x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate })
                                     .Skip(0).Take(2)
                                     .AsNoTracking();
                var wplistCurrent = wplist.Where(x => x.FromDate <= td && x.ToDate >= td).ToList();
                //if (wplist.Count > 1)
                //{
                //    if (wplist[1].CurrentStatus != "WP_DONE")
                //    {
                //        wplist.Remove(wplist[0]);
                //    }
                //    else
                //    {
                //        if (wplist[0].FromDate > DateTime.Now)
                //        {
                //            wplist.Remove(wplist[0]);
                //        }
                //        else
                //        {
                //            wplist.Remove(wplist[1]);
                //        }
                //    }
                //}
                var data = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted == false && wplistCurrent.Any(y => y.WpCode == x.WpCode))
                            join d in _context.Customerss.Where(x => !x.IsDeleted) on a.Node equals d.CusCode
                            join f1 in _context.VcWorkChecks.Where(x => x.CheckinTime.HasValue && x.CheckinTime.Value.Date == DateTime.Now.Date && x.UserName == username) on a.RouteCode equals f1.CareCode into f2
                            from f in f2.DefaultIfEmpty()
                            join c1 in _context.CommonSettings.Where(x => x.Group == "ROUTE_CURRENT_STATUS" && x.IsDeleted == false) on a.CurrentStatus equals c1.CodeSet into c2
                            from c in c2.DefaultIfEmpty()
                            join e1 in _context.CommonSettings.Where(x => x.Group == "AREA" && x.IsDeleted == false) on d.Area equals e1.CodeSet into e2
                            from e in e2.DefaultIfEmpty()
                            orderby a.Id descending
                            select new
                            {
                                a.RouteCode,
                                WpCode = a.WpCode,
                                Node = a.Node,
                                Name = d != null ? d.CusName : "",
                                Address = d != null ? d.Address : "",
                                TimePlan = a.TimePlan.Value.ToString("HH:mm:ss dd-MM-yyyy"),
                                StatusCode = a.CurrentStatus,
                                StatusName = c != null ? c.ValueSet : "",
                                NoHasData = (a.CurrentStatus == "ROUTE_PENDING" || a.CurrentStatus == "ROUTE_PROCESSING") ? true : false,
                                AreaName = e != null ? e.ValueSet : "",
                                Checkin = f != null ? f.Checkin : null,
                                Checkout = f != null ? f.Checkout : null,
                                ActionInDay = f != null ? (f.Checkout == true
                                                        ? "Out"
                                                        : (f.Checkin == true
                                                            ? "In"
                                                            : "NotIn"))
                                                   : "NotIn"
                                //Status = c != null && c.Checkout == true ? "Đã xong" : c != null && c.Checkout != true && c.Checkin == true ? "Đang thực hiện" : "Chưa thực hiện"
                            }).ToList();

                if (wplistCurrent.Count > 0)
                {
                    var countTotal = _context.VcSettingRoutes.Where(x => x.WpCode == wplistCurrent[0].WpCode && x.IsDeleted != true).AsNoTracking().Count();
                    if (countTotal != 0)
                    {
                        var countDone = _context.VcSettingRoutes.Where(x => x.WpCode == wplistCurrent[0].WpCode && x.IsDeleted != true && x.CurrentStatus == RouteStatus.RouteDone.DescriptionAttr()).AsNoTracking().Count();
                        percent = (countDone * 100) / countTotal;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "GetAllNode_USER_PLAN_NULL";
                        //msg.Title = "User chưa lập kế hoạch tuần chi tiết!";
                    }
                }

                msg.Object = new { data, percent };
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetAllNode_ERROR";
                //msg.Title = "Lỗi khi load dữ liệu!";
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult GetPercentCurrentWorkPlan(int UserId)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {

        //        var currentWorkPlan = _context.VcWorkPlans.Where(x => x.UserId == UserId && x.IsDeleted != true && x.CurrentStatus != WpStatus.WpCancel.DescriptionAttr() && x.CurrentStatus != WpStatus.WpPending.DescriptionAttr() && x.CurrentStatus != WpStatus.WpReject.DescriptionAttr()).OrderByDescending(x => x.ToDate).AsNoTracking().Take(1).FirstOrDefault();
        //        if (currentWorkPlan != null)
        //        {
        //            var countTotal = _context.VcSettingRoutes.Where(x => x.WpCode == currentWorkPlan.WpCode && x.IsDeleted != true).AsNoTracking().Count();
        //            if (countTotal != 0)
        //            {
        //                var countDone = (from a in _context.VcSettingRoutes
        //                                 join c1 in _context.VcWorkChecks on a.RouteCode equals c1.CareCode into c2
        //                                 from c in c2.DefaultIfEmpty()
        //                                 where a.IsDeleted != true
        //                                 && a.WpCode == currentWorkPlan.WpCode
        //                                 && c != null
        //                                 && c.Checkout == true
        //                                 select new { a.Id }
        //                            ).AsNoTracking().Count();

        //                float percent = (countDone * 100) / countTotal;

        //                msg.Object = percent;
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = "User chưa lập kế hoạch tuần chi tiết!";
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Chưa có kế hoạch tuần được duyệt!";
        //        }
        //    }
        //    catch
        //    {
        //        msg.Error = true;
        //        msg.Title = "Lỗi khi load dữ liệu!";
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public JsonResult GetListBrand()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => x.Group == "VC_BRAND" && x.IsDeleted != true).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking().ToList();
                msg.Object = data;
            }
            catch
            {
                msg.Error = true;
                msg.Title = "GetListBrand_ERROR";
                //;msg.Title = "Lỗi khi load danh sách thương hiệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListProduct()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = from a in _context.MaterialProducts.Where(x => x.IsDeleted != true)
                           select new
                           {
                               a.ProductCode,
                               a.ProductName,
                           };
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetListProduct_ERROR";
                //msg.Title = "Lỗi khi load danh sách sản phẩm!";
            }
            return Json(msg);
        }

        //API mới - insert toàn bộ list dữ liệu cho Route Code
        [HttpPost]
        public async Task<JsonResult> InsertData4Route([FromBody]RouteModelInsert objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var settingRoute = await _context.VcSettingRoutes.FirstOrDefaultAsync(x => x.IsDeleted != true && x.RouteCode == objInsert.RouteCode);
                if (settingRoute != null)
                {
                    var dateNow = DateTime.Now.Date;

                    var chkCheckin = await _context.VcWorkChecks.AnyAsync(x => x.CareCode == objInsert.RouteCode
                                                                                            && x.UserName == objInsert.Username
                                                                                            && x.CheckinTime.HasValue
                                                                                            && x.CheckinTime.Value.Date == dateNow);
                    if (chkCheckin)
                    {
                        var chkDistance = FuncGetAllowDistance(settingRoute.Node, objInsert.Gps);
                        var chkCheckout = await _context.VcWorkChecks.AnyAsync(x => x.CareCode == objInsert.RouteCode
                                                                        && x.UserName == objInsert.Username
                                                                        && x.CheckoutTime.HasValue
                                                                        && x.CheckoutTime.Value.Date == dateNow);
                        if (chkDistance == true || chkCheckout)
                        {
                            //Kiểm tra trạng thái của Kế hoạch
                            var countDone = _context.VcSettingRoutes.Where(x => !x.IsDeleted && x.Id != settingRoute.Id && x.WpCode == settingRoute.WpCode && x.CurrentStatus == RouteStatus.RouteDone.DescriptionAttr()).Count();
                            var countTotal = _context.VcSettingRoutes.Where(x => !x.IsDeleted && x.Id != settingRoute.Id && x.WpCode == settingRoute.WpCode).Count();
                            var workPlan = _context.VcWorkPlans.FirstOrDefault(x => x.IsDeleted != true && x.WpCode == settingRoute.WpCode);
                            if (countDone < countTotal)
                            {
                                workPlan.CurrentStatus = WpStatus.WpProcessing.DescriptionAttr();
                            }
                            else
                            {
                                workPlan.CurrentStatus = WpStatus.WpDone.DescriptionAttr();
                            }
                            _context.VcWorkPlans.Update(workPlan);

                            //Thêm thông tin header của cửa hàng
                            settingRoute.Proportion = objInsert.Proportion;
                            settingRoute.TotalCanImp = objInsert.TotalCanImp;
                            settingRoute.Note = objInsert.Note;
                            settingRoute.UpdatedBy = objInsert.Username;
                            settingRoute.UpdatedTime = DateTime.Now;
                            settingRoute.CurrentStatus = RouteStatus.RouteDone.DescriptionAttr();

                            _context.VcSettingRoutes.Update(settingRoute);

                            //Xóa list dữ liệu chi tiết cũ
                            var listCustomerCareOld = _context.VcCustomerCares.Where(x => !x.IsDeleted && x.RouteCode == objInsert.RouteCode).ToList();
                            listCustomerCareOld.ForEach(x => { x.IsDeleted = true; x.DeletedBy = objInsert.Username; x.DeletedTime = DateTime.Now; });

                            //Thêm list dữ liệu chi tiết mới
                            var count = 1;
                            foreach (var item in objInsert.ListDetail)
                            {
                                var careCode = objInsert.RouteCode + "_" + count;

                                VcCustomerCare obj = new VcCustomerCare();

                                obj.CareCode = careCode;
                                obj.RouteCode = objInsert.RouteCode;
                                obj.BrandCode = item.BrandCode;
                                obj.ProductCode = item.ProductCode;
                                obj.BuyCost = item.BuyCost;
                                obj.SaleCost = item.SaleCost;
                                obj.ConsumpMonthly = item.ConsumpMonthly;
                                obj.Instock = item.Instock;

                                obj.CreatedBy = objInsert.Username;
                                obj.CreatedTime = DateTime.Now;

                                _context.VcCustomerCares.Add(obj);
                                count = count + 1;
                            }

                            await _context.SaveChangesAsync();
                            msg.Title = "InsertData4Route_SUCCESS";
                            //msg.Title = "Thực hiện công việc thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "InsertData4Route_CHECKOUT_NULL";
                            //msg.Title = "Bạn không được nhập liệu vì chưa Checkout khi ra khỏi cửa hàng.";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "InsertData4Route_CHECKIN_NULL";
                        //msg.Title = "Bạn không được nhập liệu vì hôm nay chưa Checkin tại cửa hàng.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "InsertData4Route_PLAN_NULL";
                    //msg.Title = "Kế hoạch tuần không tồn tại hoặc đã bị xóa.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "InsertData4Route_ERROR";
                //  msg.Title = "Có lỗi khi thêm/chỉnh sửa dữ liệu.";
            }
            return Json(msg);
        }


        //API insert dữ liệu cuối tháng cho cửa hàng
        [HttpPost]
        public async Task<JsonResult> InsertDataLastMonth([FromBody]CustomerLastMonthModelInsert objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var chkExist = _context.VcCustomerCareLastMonths.Any(x => !x.IsDeleted && x.CusCode == objInsert.CusCode && x.YearMonth == objInsert.YearMonth);
                if (chkExist)
                {
                    msg.Error = true;
                    msg.Title = "InsertDataLastMonth_CHECK_DATA_STORE";
                    //msg.Title = "Cửa hàng đã được thêm dữ liệu cuối tháng.";
                }
                else
                {
                    foreach (var item in objInsert.ListDetail)
                    {

                        VcCustomerCareLastMonth obj = new VcCustomerCareLastMonth();

                        obj.YearMonth = objInsert.YearMonth;
                        obj.CusCode = objInsert.CusCode;
                        obj.BrandCode = item.BrandCode;
                        obj.ProductCode = item.ProductCode;
                        obj.ConsumpMonthly = item.ConsumpMonthly;
                        obj.Instock = item.Instock;

                        obj.Username = objInsert.Username;
                        obj.CreatedBy = objInsert.Username;
                        obj.CreatedTime = DateTime.Now;

                        _context.VcCustomerCareLastMonths.Add(obj);
                    }
                    await _context.SaveChangesAsync();
                    msg.Title = "InsertDataLastMonth_ADD_DATA";
                    //msg.Title = "Thêm dữ liệu thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "InsertDataLastMonth_ERROR";
                //msg.Title = "Có lỗi khi thêm dữ liệu.";
            }
            return Json(msg);
        }

        //API update dữ liệu cuối tháng cho cửa hàng
        [HttpPost]
        public async Task<JsonResult> UpdateDataLastMonth([FromBody]CustomerLastMonthModelInsert objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listDataOld = _context.VcCustomerCareLastMonths.Where(x => !x.IsDeleted && x.CusCode == objInsert.CusCode && x.YearMonth == objInsert.YearMonth).ToList();
                if (listDataOld.Any())
                {
                    //Xóa dữ liệu cũ
                    listDataOld.ForEach(x => { x.IsDeleted = true; x.DeletedBy = objInsert.Username; x.DeletedTime = DateTime.Now; });

                    //Insert dữ liệu mới
                    foreach (var item in objInsert.ListDetail)
                    {
                        VcCustomerCareLastMonth obj = new VcCustomerCareLastMonth();

                        obj.YearMonth = objInsert.YearMonth;
                        obj.CusCode = objInsert.CusCode;
                        obj.BrandCode = item.BrandCode;
                        obj.ProductCode = item.ProductCode;
                        obj.ConsumpMonthly = item.ConsumpMonthly;
                        obj.Instock = item.Instock;

                        obj.Username = objInsert.Username;
                        obj.CreatedBy = objInsert.Username;
                        obj.CreatedTime = DateTime.Now;

                        _context.VcCustomerCareLastMonths.Add(obj);
                    }
                    await _context.SaveChangesAsync();
                    msg.Title = "UpdateDataLastMonth_EDIT_SUCCESS";
                    // msg.Title = "Chỉnh sửa dữ liệu thành công";
                }
                else
                {
                    //ĐÂy là add - đề phòng app gọi sai API
                    //Insert dữ liệu mới
                    foreach (var item in objInsert.ListDetail)
                    {
                        VcCustomerCareLastMonth obj = new VcCustomerCareLastMonth();

                        obj.YearMonth = objInsert.YearMonth;
                        obj.CusCode = objInsert.CusCode;
                        obj.BrandCode = item.BrandCode;
                        obj.ProductCode = item.ProductCode;
                        obj.ConsumpMonthly = item.ConsumpMonthly;
                        obj.Instock = item.Instock;

                        obj.Username = objInsert.Username;
                        obj.CreatedBy = objInsert.Username;
                        obj.CreatedTime = DateTime.Now;

                        _context.VcCustomerCareLastMonths.Add(obj);
                    }
                    await _context.SaveChangesAsync();
                    msg.Title = "UpdateDataLastMonth_ADD_SUCCESS";
                    // msg.Title = "Thêm dữ liệu thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "UpdateDataLastMonth_ERROR";
                //msg.Title = "Có lỗi khi chỉnh sửa dữ liệu.";
            }
            return Json(msg);
        }

        //Get dữ liệu tháng gần nhất
        [HttpPost]
        public JsonResult GetDataLastMonth(string cusCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var maxYearMonth = _context.VcCustomerCareLastMonths.Where(x => !x.IsDeleted && x.CusCode == cusCode).MaxBy(x => x.YearMonth)?.YearMonth;
                var timeReport = !string.IsNullOrEmpty(maxYearMonth) ? DateTime.ParseExact(maxYearMonth, "yyyyMM", CultureInfo.InvariantCulture) : (DateTime?)null;

                var listDetail = (from b in _context.VcCustomerCareLastMonths.Where(x => !x.IsDeleted && x.CusCode == cusCode && x.YearMonth == maxYearMonth)
                                      //join d in _context.Customerss.Where(x => !x.IsDeleted) on b.CusCode equals d.CusCode
                                  join e in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals e.ProductCode
                                  join c1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND" && x.IsDeleted == false) on b.BrandCode equals c1.CodeSet into c2
                                  from c in c2.DefaultIfEmpty()
                                  orderby b.BrandCode, b.ProductCode
                                  select new CustomerDetailLastMonthModelInsert
                                  {
                                      BrandCode = b.BrandCode,
                                      BrandName = c != null ? c.ValueSet : "",
                                      ProductCode = b.ProductCode,
                                      ProductName = e.ProductName,
                                      ConsumpMonthly = b.ConsumpMonthly,
                                      Instock = b.Instock
                                  }).ToList();

                msg.Object = new { listDetail, cusCode, yearMonth = maxYearMonth, timeReport };
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetDataLastMonth_ERROR";
                // msg.Title = "Lỗi khi load dữ liệu!";
            }
            return Json(msg);
        }



        ////API cũ - insert từng bản ghi
        //[HttpPost]
        //public async Task<JsonResult> InsertDataCustomerCare([FromBody]CustomerCareInsert objInsert)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var count = _context.VcCustomerCares.Where(x => x.RouteCode == objInsert.RouteCode).Count() + 1;

        //        //var chkExist = await _context.VcCustomerCares.FirstOrDefaultAsync(x => x.IsDeleted != true && x.RouteCode == objInsert.RouteCode && x.BrandCode == objInsert.BrandCode && x.ProductCode == objInsert.ProductCode);
        //        var settingRoute = await _context.VcSettingRoutes.FirstOrDefaultAsync(x => x.IsDeleted != true && x.RouteCode == objInsert.RouteCode);
        //        //Thêm thông tin header của cửa hàng
        //        if (settingRoute != null)
        //        {
        //            settingRoute.Proportion = objInsert.Proportion;
        //            settingRoute.TotalCanImp = objInsert.TotalCanImp;
        //            settingRoute.Note = objInsert.Note;
        //            settingRoute.UpdatedBy = objInsert.Username;
        //            settingRoute.UpdatedTime = DateTime.Now;

        //            _context.VcSettingRoutes.Update(settingRoute);

        //            //Nếu không tồn tại bản ghi có RouteCode,BrandCode, ProductCode thì là insert mới
        //            if (objInsert.Id == null)
        //            {
        //                var careCode = objInsert.RouteCode + "_" + count;

        //                VcCustomerCare obj = new VcCustomerCare();

        //                obj.CareCode = careCode;
        //                obj.RouteCode = objInsert.RouteCode;
        //                obj.BrandCode = objInsert.BrandCode;
        //                obj.ProductCode = objInsert.ProductCode;
        //                obj.BuyCost = objInsert.BuyCost;
        //                obj.SaleCost = objInsert.SaleCost;
        //                obj.ConsumpMonthly = objInsert.ConsumpMonthly;
        //                obj.Instock = objInsert.Instock;

        //                obj.CreatedBy = objInsert.Username;
        //                obj.CreatedTime = DateTime.Now;


        //                _context.VcCustomerCares.Add(obj);

        //                await _context.SaveChangesAsync();
        //                msg.Title = "Thêm bản ghi thành công";
        //            }
        //            //Nếu tồn tại bản ghi có RouteCode,BrandCode, ProductCode thì là update
        //            else
        //            {
        //                var chkExist = await _context.VcCustomerCares.FirstOrDefaultAsync(x => x.Id == objInsert.Id);
        //                //chkExist.CareCode = objInsert.CareCode;
        //                //chkExist.RouteCode = objInsert.RouteCode;
        //                chkExist.BrandCode = objInsert.BrandCode;
        //                chkExist.ProductCode = objInsert.ProductCode;
        //                chkExist.BuyCost = objInsert.BuyCost;
        //                chkExist.SaleCost = objInsert.SaleCost;
        //                chkExist.ConsumpMonthly = objInsert.ConsumpMonthly;
        //                chkExist.Instock = objInsert.Instock;

        //                chkExist.UpdatedBy = objInsert.Username;
        //                chkExist.UpdatedTime = DateTime.Now;


        //                _context.VcCustomerCares.Update(chkExist);

        //                await _context.SaveChangesAsync();
        //                msg.Title = "Chỉnh sửa bản ghi thành công";
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Nhà phân phối/NPP/Đại lý/Cửa hàng chưa lập kế hoạch tuần.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi thêm/chỉnh sửa dữ liệu.";
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public JsonResult GetCustomerCare(string RouteCode)
        {
            var msg = new JMessageRoute { Error = false, Title = "" };
            try
            {
                var checkStatus = _context.VcSettingRoutes.FirstOrDefault(x => x.IsDeleted != true && x.RouteCode == RouteCode);
                if (checkStatus.CurrentStatus == "ROUTE_DONE")
                {
                    var data = (from a in _context.VcCustomerCares.Where(x => x.IsDeleted != true)
                                join b1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND" && x.IsDeleted == false) on a.BrandCode equals b1.CodeSet into b2
                                from b in b2.DefaultIfEmpty()
                                join c1 in _context.MaterialProducts.Where(x => x.IsDeleted != true) on a.ProductCode equals c1.ProductCode into c2
                                from c in c2.DefaultIfEmpty()
                                where a.RouteCode == RouteCode
                                orderby a.Id descending
                                select new
                                {
                                    //a.Id,
                                    a.BrandCode,
                                    BrandName = b != null ? b.ValueSet : "",
                                    a.ProductCode,
                                    ProductName = c != null ? c.ProductName : "",
                                    BuyCost = a.BuyCost == null ? "_" : a.BuyCost.ToString(),
                                    SaleCost = a.SaleCost == null ? "_" : a.SaleCost.ToString(),
                                    ConsumpMonthly = a.ConsumpMonthly == null ? "_" : a.ConsumpMonthly.ToString(),
                                    Instock = a.Instock == null ? "_" : a.Instock.ToString(),
                                }).AsNoTracking().ToList();

                    msg.Object = data;

                    var settingRoute = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted != true && x.RouteCode == RouteCode)
                                            //join c1 in _context.VcWorkChecks on a.RouteCode equals c1.CareCode into c2
                                            //from c in c2.DefaultIfEmpty()
                                        select new
                                        {
                                            Proportion = a.Proportion,
                                            TotalCanImp = a.TotalCanImp,
                                            Note = a.Note,
                                            //CheckinTime = c != null ? c.CheckinTime : null,
                                            //CheckoutTime = c != null ? c.CheckoutTime : null,
                                        }).AsNoTracking().FirstOrDefault();

                    msg.Proportion = settingRoute?.Proportion;
                    msg.TotalCanImp = settingRoute?.TotalCanImp;
                    msg.Note = settingRoute?.Note;
                    //msg.CheckinTime = settingRoute != null && settingRoute.CheckinTime != null ? settingRoute.CheckinTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                    //msg.CheckoutTime = settingRoute != null && settingRoute.CheckoutTime != null ? settingRoute.CheckoutTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                }
                else
                {
                    var routeOld = _context.VcSettingRoutes.OrderByDescending(x => x.Id).FirstOrDefault(x => x.IsDeleted != true && x.Node == checkStatus.Node && x.CurrentStatus == "ROUTE_DONE");
                    if (routeOld == null)
                    {
                        var data = (from a in _context.VcCustomerCares.Where(x => x.IsDeleted != true)
                                    join b1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND" && x.IsDeleted == false) on a.BrandCode equals b1.CodeSet into b2
                                    from b in b2.DefaultIfEmpty()
                                    join c1 in _context.MaterialProducts.Where(x => x.IsDeleted != true) on a.ProductCode equals c1.ProductCode into c2
                                    from c in c2.DefaultIfEmpty()
                                    where a.RouteCode == RouteCode
                                    orderby a.Id descending
                                    select new
                                    {
                                        //a.Id,
                                        a.BrandCode,
                                        BrandName = b != null ? b.ValueSet : "",
                                        a.ProductCode,
                                        ProductName = c != null ? c.ProductName : "",
                                        BuyCost = a.BuyCost == null ? "_" : a.BuyCost.ToString(),
                                        SaleCost = a.SaleCost == null ? "_" : a.SaleCost.ToString(),
                                        ConsumpMonthly = a.ConsumpMonthly == null ? "_" : a.ConsumpMonthly.ToString(),
                                        Instock = a.Instock == null ? "_" : a.Instock.ToString(),
                                    }).AsNoTracking().ToList();

                        msg.Object = data;

                        var settingRoute = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted != true && x.RouteCode == RouteCode)
                                                //join c1 in _context.VcWorkChecks on a.RouteCode equals c1.CareCode into c2
                                                //from c in c2.DefaultIfEmpty()
                                            select new
                                            {
                                                Proportion = a.Proportion,
                                                TotalCanImp = a.TotalCanImp,
                                                Note = a.Note,
                                                //CheckinTime = c != null ? c.CheckinTime : null,
                                                //CheckoutTime = c != null ? c.CheckoutTime : null,
                                            }).AsNoTracking().FirstOrDefault();

                        msg.Proportion = settingRoute?.Proportion;
                        msg.TotalCanImp = settingRoute?.TotalCanImp;
                        msg.Note = settingRoute?.Note;
                        //msg.CheckinTime = settingRoute != null && settingRoute.CheckinTime != null ? settingRoute.CheckinTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                        //msg.CheckoutTime = settingRoute != null && settingRoute.CheckoutTime != null ? settingRoute.CheckoutTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                    }
                    else
                    {
                        var data = (from a in _context.VcCustomerCares.Where(x => x.IsDeleted != true)
                                    join b1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND" && x.IsDeleted == false) on a.BrandCode equals b1.CodeSet into b2
                                    from b in b2.DefaultIfEmpty()
                                    join c1 in _context.MaterialProducts.Where(x => x.IsDeleted != true) on a.ProductCode equals c1.ProductCode into c2
                                    from c in c2.DefaultIfEmpty()
                                    where a.RouteCode == routeOld.RouteCode
                                    orderby a.Id descending
                                    select new
                                    {
                                        //a.Id,
                                        a.BrandCode,
                                        BrandName = b != null ? b.ValueSet : "",
                                        a.ProductCode,
                                        ProductName = c != null ? c.ProductName : "",
                                        BuyCost = a.BuyCost == null ? "_" : a.BuyCost.ToString(),
                                        SaleCost = a.SaleCost == null ? "_" : a.SaleCost.ToString(),
                                        ConsumpMonthly = a.ConsumpMonthly == null ? "_" : a.ConsumpMonthly.ToString(),
                                        Instock = a.Instock == null ? "_" : a.Instock.ToString(),
                                    }).AsNoTracking().ToList();

                        msg.Object = data;

                        var settingRoute = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted != true && x.RouteCode == routeOld.RouteCode)
                                                //join c1 in _context.VcWorkChecks on a.RouteCode equals c1.CareCode into c2
                                                //from c in c2.DefaultIfEmpty()
                                            select new
                                            {
                                                Proportion = a.Proportion,
                                                TotalCanImp = a.TotalCanImp,
                                                Note = a.Note,
                                                //CheckinTime = c != null ? c.CheckinTime : null,
                                                //CheckoutTime = c != null ? c.CheckoutTime : null,
                                            }).AsNoTracking().FirstOrDefault();

                        msg.Proportion = settingRoute?.Proportion;
                        msg.TotalCanImp = settingRoute?.TotalCanImp;
                        msg.Note = settingRoute?.Note;
                        //msg.CheckinTime = settingRoute != null && settingRoute.CheckinTime != null ? settingRoute.CheckinTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                        //msg.CheckoutTime = settingRoute != null && settingRoute.CheckoutTime != null ? settingRoute.CheckoutTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                    }
                }
                var workCheck = (from c in _context.VcWorkChecks
                                 where c.CareCode == RouteCode
                                 orderby c.Id descending
                                 select new
                                 {
                                     CheckinTime = c.CheckinTime,
                                     CheckoutTime = c.CheckoutTime,
                                 }).AsNoTracking().FirstOrDefault();

                msg.CheckinTime = workCheck != null && workCheck.CheckinTime != null ? workCheck.CheckinTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
                msg.CheckoutTime = workCheck != null && workCheck.CheckoutTime != null ? workCheck.CheckoutTime.Value.ToString("HH:mm:ss dd-MM-yyyy") : "";
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi load kế hoạch tuần.";
                // msg.Title = "Có lỗi khi load kế hoạch tuần.";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListGPSCustomer(string cusCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.MapDataGpss.Where(x => x.ObjCode == cusCode && !x.IsDeleted && x.IsActive)
                                   .OrderByDescending(x => x.IsDefault)
                                   .Select(x => new { x.MakerGPS, x.Title, x.IsActive })
                                   .AsNoTracking().ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetListGPSCustomer_ERROR";
                //  msg.Title = "Có lỗi khi load GPS của cửa hàng.";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteDataCustomerCare([FromBody]CustomerCareDelete objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var chkExist = await _context.VcCustomerCares.FirstOrDefaultAsync(x => x.IsDeleted != true && x.RouteCode == objInsert.RouteCode && x.BrandCode == objInsert.BrandCode && x.ProductCode == objInsert.ProductCode);

                //Nếu không tồn tại bản ghi có RouteCode,BrandCode, ProductCode thì là báo lỗi
                if (chkExist == null)
                {
                    msg.Error = true;
                    msg.Title = "Sản phẩm của thương hiệu này không có trong danh sách đã nhập dữ liệu.";
                }
                //Nếu tồn tại bản ghi có RouteCode,BrandCode, ProductCode thì xóa đi
                else
                {
                    chkExist.IsDeleted = true;

                    chkExist.DeletedBy = objInsert.Username;
                    chkExist.DeletedTime = DateTime.Now;


                    _context.VcCustomerCares.Update(chkExist);

                    await _context.SaveChangesAsync();
                    msg.Title = "Xóa bản ghi thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa dữ liệu.";
            }
            return Json(msg);
        }



        //Màn bổ sung mới cho bản đồ
        [HttpPost]
        public JsonResult GetNodeOfWorkPlan(string username)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var td = DateTime.Now.Date;
                float percent = 0;
                var wplist = _context.VcWorkPlans.Where(x => x.UserName == username && x.IsDeleted != true
                                        && x.CurrentStatus != WpStatus.WpCancel.DescriptionAttr()
                                        && x.CurrentStatus != WpStatus.WpPending.DescriptionAttr()
                                        && x.CurrentStatus != WpStatus.WpReject.DescriptionAttr()
                                        && x.CurrentStatus != WpStatus.WpWaiting.DescriptionAttr())
                                     .OrderByDescending(x => x.Id)
                                     .Select(x => new { x.CurrentStatus, x.WpCode, x.FromDate, x.ToDate })
                                     .Skip(0).Take(2)
                                     .AsNoTracking();
                var wplistCurrent = wplist.Where(x => x.FromDate <= td && x.ToDate >= td).ToList();
                //if (wplist.Count > 1)
                //{
                //    if (wplist[1].CurrentStatus != "WP_DONE")
                //    {
                //        wplist.Remove(wplist[0]);
                //    }
                //    else
                //    {
                //        if (wplist[0].FromDate > DateTime.Now)
                //        {
                //            wplist.Remove(wplist[0]);
                //        }
                //        else
                //        {
                //            wplist.Remove(wplist[1]);
                //        }
                //    }
                //}
                var data = (from a in _context.VcSettingRoutes.Where(x => x.IsDeleted == false && wplistCurrent.Any(y => y.WpCode == x.WpCode))
                            join d in _context.Customerss.Where(x => !x.IsDeleted) on a.Node equals d.CusCode
                            join f1 in _context.VcWorkChecks.Where(x => x.CheckinTime.HasValue && x.CheckinTime.Value.Date == DateTime.Now.Date && x.UserName == username) on a.RouteCode equals f1.CareCode into f2
                            from f in f2.DefaultIfEmpty()
                            join c1 in _context.CommonSettings.Where(x => x.Group == "ROUTE_CURRENT_STATUS" && x.IsDeleted == false) on a.CurrentStatus equals c1.CodeSet into c2
                            from c in c2.DefaultIfEmpty()
                            join e1 in _context.CommonSettings.Where(x => x.Group == "AREA" && x.IsDeleted == false) on d.Area equals e1.CodeSet into e2
                            from e in e2.DefaultIfEmpty()
                            orderby a.Id descending
                            select new
                            {
                                a.RouteCode,
                                WpCode = a.WpCode,
                                Node = a.Node,
                                Lat = _context.MapDataGpss.OrderByDescending(x => x.IsDefault).FirstOrDefault(x => !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS) && x.ObjCode == a.Node) != null
                                      ? _context.MapDataGpss.OrderByDescending(x => x.IsDefault).FirstOrDefault(x => !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS) && x.ObjCode == a.Node).MakerGPS.Split(",", StringSplitOptions.None)[0]
                                      : null,
                                Long = _context.MapDataGpss.OrderByDescending(x => x.IsDefault).FirstOrDefault(x => !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS) && x.ObjCode == a.Node) != null
                                      ? _context.MapDataGpss.OrderByDescending(x => x.IsDefault).FirstOrDefault(x => !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS) && x.ObjCode == a.Node).MakerGPS.Split(",", StringSplitOptions.None)[1]
                                      : null,
                                Name = d != null ? d.CusName : "",
                                Address = d != null ? d.Address : "",
                                TimePlan = a.TimePlan.Value.ToString("HH:mm:ss dd-MM-yyyy"),
                                StatusCode = a.CurrentStatus,
                                StatusName = c != null ? c.ValueSet : "",
                                NoHasData = (a.CurrentStatus == "ROUTE_PENDING" || a.CurrentStatus == "ROUTE_PROCESSING") ? true : false,
                                AreaName = e != null ? e.ValueSet : "",
                                Checkin = f != null ? f.Checkin : null,
                                Checkout = f != null ? f.Checkout : null,
                                ActionInDay = f != null ? (f.Checkout == true
                                                        ? "Out"
                                                        : (f.Checkin == true
                                                            ? "In"
                                                            : "NotIn"))
                                                   : "NotIn"
                            }).ToList();

                if (wplistCurrent.Count > 0)
                {
                    var countTotal = _context.VcSettingRoutes.Where(x => x.WpCode == wplistCurrent[0].WpCode && x.IsDeleted != true).AsNoTracking().Count();
                    if (countTotal != 0)
                    {
                        var countDone = _context.VcSettingRoutes.Where(x => x.WpCode == wplistCurrent[0].WpCode && x.IsDeleted != true && x.CurrentStatus == RouteStatus.RouteDone.DescriptionAttr()).AsNoTracking().Count();
                        percent = (countDone * 100) / countTotal;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "GetNodeOfWorkPlan_USER_PLAN_NULL";
                    }
                }

                msg.Object = new { data, percent };
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetNodeOfWorkPlan_ERROR";
            }
            return Json(msg);
        }



        //Màn 2
        [HttpPost]
        public JsonResult GetListWorkPlanPending(string username)
        {
            var msg = new JMessageWpPending() { Error = false, Title = "" };
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == username && x.Active);
                if (user != null)
                {
                    if (string.IsNullOrEmpty(user.Area))
                    {
                        msg.Error = true;
                        msg.Title = "GetListWorkPlanPending_USER_AREA_NULL";
                        // msg.Title = "Người dùng không quản lý khu vực nào cả!";
                    }
                    else
                    {
                        var listArea = user.Area.Split(';');

                        var data = (from a in _context.VcWorkPlans
                                                      .Where(x => x.IsDeleted != true
                                                                    && x.CurrentStatus != WpStatus.WpCancel.DescriptionAttr()
                                                                    && x.CurrentStatus != WpStatus.WpDone.DescriptionAttr()
                                                                    && x.CurrentStatus != WpStatus.WpProcessing.DescriptionAttr()
                                                                    )
                                    join b in _context.CommonSettings.Where(x => x.Group == "WP_CURRENT_STATUS" && x.IsDeleted == false) on a.CurrentStatus equals b.CodeSet
                                    join c in _context.Users.Where(x => x.Active) on a.CreatedBy equals c.UserName
                                    join d in _context.VcSettingRoutes.Where(x => !x.IsDeleted) on a.WpCode equals d.WpCode
                                    join e in _context.Customerss.Where(x => !x.IsDeleted) on d.Node equals e.CusCode
                                    join f in _context.CommonSettings.Where(x => x.Group == "AREA" && x.IsDeleted == false) on e.Area equals f.CodeSet
                                    where
                                    listArea.Any(y => y == e.Area)
                                    orderby b.Priority, a.CreatedTime descending
                                    group new { a, b, c, f } by new { a.WpCode }
                                    into grp
                                    select new
                                    {
                                        WpCode = grp.Key.WpCode,
                                        FromDate = grp.FirstOrDefault().a.FromDate.ToString("dd-MM-yyyy"),
                                        ToDate = grp.FirstOrDefault().a.ToDate.ToString("dd-MM-yyyy"),
                                        WeekNo = grp.FirstOrDefault().a.WeekNo,
                                        Year = grp.FirstOrDefault().a.CreatedTime.Year,
                                        StatusCode = grp.FirstOrDefault().a.CurrentStatus,
                                        StatusName = grp.FirstOrDefault().b.ValueSet,
                                        CreatedBy = grp.FirstOrDefault().c.GivenName,
                                        AreaCode = grp.FirstOrDefault().f.CodeSet,
                                        AreaName = grp.FirstOrDefault().f.ValueSet,
                                    }).AsNoTracking().ToList();



                        var count = data.Where(x => x.StatusCode == WpStatus.WpPending.DescriptionAttr()).Count();

                        msg.Object = data;
                        msg.CountPending = count;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "GetListWorkPlanPending_USER_NULL";
                    //msg.Title = "Người dùng không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetListWorkPlanPending_ERROR";
                //msg.Title = "Lỗi khi load kế hoạch tuần!";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> ApproveWorkPlan(string Username, string WpCode, string CurrentStatus, string LeaderIdea)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (LeaderIdea == "undefined") LeaderIdea = "";

                var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                if (item != null)
                {
                    if (CurrentStatus == WpStatus.WpApproved.DescriptionAttr())
                    {
                        if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                        {
                            item.CurrentStatus = WpStatus.WpApproved.DescriptionAttr();
                            item.LeaderIdea = LeaderIdea;
                            item.ApprovedBy = Username;
                            item.ApprovedTime = DateTime.Now;

                            _context.VcWorkPlans.Update(item);

                            var msgFuncApproveWorkPlan = await FuncApproveWorkPlan(Username, WpCode, CurrentStatus, LeaderIdea);
                            if (msgFuncApproveWorkPlan.Error != true)
                            {
                                _context.SaveChanges();
                                msg.Title = "ApproveWorkPlan_SUCCESS";
                                //   msg.Title = "Chuyển trạng thái duyệt thành công.";
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = msgFuncApproveWorkPlan.Title;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "ApproveWorkPlan_PLAN_PROCESSING";
                            //msg.Title = "Kế hoạch tuần đã/đang được thực hiện.";
                        }
                    }
                    else if (CurrentStatus == WpStatus.WpReject.DescriptionAttr())
                    {
                        if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                        {
                            item.CurrentStatus = WpStatus.WpReject.DescriptionAttr();
                            item.LeaderIdea = LeaderIdea;
                            item.ApprovedBy = Username;
                            item.ApprovedTime = DateTime.Now;

                            _context.VcWorkPlans.Update(item);

                            var msgFuncApproveWorkPlan = await FuncApproveWorkPlan(Username, WpCode, CurrentStatus, LeaderIdea);
                            if (msgFuncApproveWorkPlan.Error != true)
                            {
                                _context.SaveChanges();
                                msg.Title = "ApproveWorkPlan_REFUSE_SUCCESS";
                                // msg.Title = "Chuyển trạng thái từ chối duyệt thành công.";
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = msgFuncApproveWorkPlan.Title;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "ApproveWorkPlan_PLAN_PROCESSING";
                            //msg.Title = "Kế hoạch tuần đã/đang được thực hiện.";
                        }
                    }
                    else if (CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                    {
                        if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr() || item.CurrentStatus == WpStatus.WpWaiting.DescriptionAttr())
                        {
                            item.CurrentStatus = WpStatus.WpWaiting.DescriptionAttr();
                            item.LeaderIdea = LeaderIdea;
                            item.ApprovedBy = Username;
                            item.ApprovedTime = DateTime.Now;

                            _context.VcWorkPlans.Update(item);

                            var msgFuncApproveWorkPlan = await FuncApproveWorkPlan(Username, WpCode, CurrentStatus, LeaderIdea);
                            if (msgFuncApproveWorkPlan.Error != true)
                            {
                                _context.SaveChanges();
                                msg.Title = "ApproveWorkPlan_WAIT_SUCCESS";
                                //msg.Title = "Chuyển trạng thái chờ duyệt thành công.";
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = msgFuncApproveWorkPlan.Title;
                            }
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "ApproveWorkPlan_PLAN_PROCESSING";
                            //msg.Title = "Kế hoạch tuần đã/đang được thực hiện.";
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "ApproveWorkPlan_WRONG_THE_STATUS";
                        // msg.Title = "Truyền sai trạng thái yêu cầu.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "ApproveWorkPlan_PLAN_NULL";
                    //msg.Title = "Kế hoạch tuần không tồn tại.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "ApproveWorkPlan_ERROR";
                //msg.Title = "Có lỗi khi duyệt kế hoạch tuần.";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListWpStatusForApprove()
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings
                            .Where(x => x.Group == "WP_CURRENT_STATUS"
                                        && (x.CodeSet == "WP_APPROVED" || x.CodeSet == "WP_REJECT" || x.CodeSet == "WP_WAITING")
                                        && x.IsDeleted != true)
                            .Select(x => new { Code = x.CodeSet, Name = x.ValueSet })
                            .AsNoTracking()
                            .ToList();
                msg.Object = data;
            }
            catch
            {
                msg.Error = true;
                msg.Title = "GetListWpStatusForApprove_Error";
            }
            return Json(msg);
        }

        //[HttpPost]
        //public async Task<JsonResult> ApproveWorkPlan(string Username, string WpCode)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
        //        if (item != null)
        //        {
        //            if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpReject.DescriptionAttr())
        //            {
        //                item.CurrentStatus = WpStatus.WpApproved.DescriptionAttr();

        //                item.UpdatedBy = Username;
        //                item.UpdatedTime = DateTime.Now;

        //                _context.VcWorkPlans.Update(item);

        //                _context.SaveChanges();
        //                msg.Title = "Duyệt kế hoạch tuần thành công";
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = "Kế hoạch tuần đã duyệt.";
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Kế hoạch tuần không tồn tại.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi duyệt kế hoạch tuần.";
        //    }
        //    return Json(msg);
        //}


        //[HttpPost]
        //public async Task<JsonResult> RejectWorkPlan(string Username, string WpCode)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
        //        if (item != null)
        //        {
        //            if (item.CurrentStatus == WpStatus.WpPending.DescriptionAttr() || item.CurrentStatus == WpStatus.WpApproved.DescriptionAttr())
        //            {
        //                item.CurrentStatus = WpStatus.WpReject.DescriptionAttr();

        //                item.UpdatedBy = Username;
        //                item.UpdatedTime = DateTime.Now;

        //                _context.VcWorkPlans.Update(item);

        //                _context.SaveChanges();
        //                msg.Title = "Từ chối duyệt kế hoạch tuần thành công";
        //            }
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = "Kế hoạch tuần đã từ chối duyệt.";
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Kế hoạch tuần không tồn tại.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi từ chối duyệt kế hoạch tuần.";
        //    }
        //    return Json(msg);
        //}

        ////hàm cũ
        ////Check khoảng cách cho phép
        //[HttpPost]
        //public async Task<JsonResult> GetDistance2Point(string Node, string LocationGps)
        //{
        //    var msg = new JMessage { ID = 1, Error = false, Title = "" };
        //    try
        //    {
        //        var allowDistanceItem = await _context.CommonSettings.FirstOrDefaultAsync(x => x.CodeSet == "ALLOW_DISTANCE");
        //        var allowDistance = allowDistanceItem == null ? 300 : Convert.ToDouble(allowDistanceItem.ValueSet);

        //        var node = await _context.Customerss.FirstOrDefaultAsync(x => x.CusCode == Node && !x.IsDeleted);
        //        if (node == null || string.IsNullOrEmpty(node.GoogleMap))
        //        {
        //            msg.ID = 0;
        //            msg.Error = true;
        //            msg.Title = "Nhà phân phối/NPP/Đại lý/Cửa hàng chưa khai báo vị trí.";
        //        }
        //        else
        //        {
        //            var locationAgent = node.GoogleMap;
        //            var locationAgentArr = locationAgent.Split(',');
        //            var sLat = Convert.ToDouble(locationAgentArr[0]);
        //            var sLong = Convert.ToDouble(locationAgentArr[1]);

        //            var location = LocationGps.Replace("[", "").Replace("]", "");
        //            var locationArr = location.Split(',');
        //            var eLat = Convert.ToDouble(locationArr[0]);
        //            var eLong = Convert.ToDouble(locationArr[1]);

        //            var sCoord = new GeoCoordinate(sLat, sLong);
        //            var eCoord = new GeoCoordinate(eLat, eLong);

        //            var distance = sCoord.GetDistanceTo(eCoord);
        //            if (distance < allowDistance)
        //            {
        //                msg.Title = "Bạn được phép checkin/checkout.";
        //            }
        //            else
        //            {
        //                msg.ID = 0;
        //                msg.Error = true;
        //                msg.Title = "Bạn nằm ngoài khoảng cách được phép checkin/checkout.";
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.ID = 0;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi xác định khoảng cách cho phép checkin.";
        //    }
        //    return Json(msg);
        //}


        [HttpPost]
        public JsonResult InsertGisMap(PackingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listGps = obj.Gis_data.Split(";");
                Map map = new Map();
                GisObject gisObject = new GisObject();
                List<GeoCoordinate> listGPS = new List<GeoCoordinate>();

                foreach (var item in listGps)
                {
                    var latLng = item.Split(",");

                    var doubleLat = Convert.ToDouble(latLng[0]);
                    var doubleLng = Convert.ToDouble(latLng[1]);
                    var geo = new GeoCoordinate(doubleLat, doubleLng);
                    listGPS.Add(geo);

                    List<double> m = new List<double>();
                    m.Add((Double.Parse(latLng[1].Trim())) * 20037508.34 / 180);
                    m.Add((Math.Log(Math.Tan((90 + Double.Parse(latLng[0].Trim())) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                    gisObject.geometry.coordinates[0].Add(m);
                }
                map.gis_data = gisObject.geometry.coordinates;
                map.properties = new MapProperties
                {
                    fill_color = "#64c936",
                    text = obj.title,
                    font_size = "12"
                };

                var center = CommonUtil.GetCentralGeoCoordinate(listGPS);
                var makerGPS = center.Latitude + "," + center.Longitude;

                //Check Title đã có chưa
                var modelCheck = _context.MapDataGpss.Where(x => x.ObjCode == obj.ObjCode && !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(obj.title) && x.Title == obj.title && !x.IsDeleted).Count();
                if (modelCheck > 0)
                {
                    var countCheck = _context.MapDataGpss.Where(x => x.ObjCode == obj.ObjCode && !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(obj.title) && x.Title.ToLower().Contains(obj.title.ToLower()) && !x.IsDeleted).Count() + 1;
                    obj.title = obj.title + " " + countCheck;
                }

                var model = new MapDataGps
                {
                    Title = obj.title,
                    PolygonGPS = JsonConvert.SerializeObject(map),
                    ObjCode = obj.ObjCode,
                    Icon = (string.IsNullOrEmpty(obj.Icon) ? "/images/map/pinmap_violet.png" : obj.Icon),
                    CreatedBy = obj.CreatedBy,
                    CreatedTime = DateTime.Now,
                    MakerGPS = makerGPS,
                    GisData = obj.Gis_data,
                    Address = obj.Address,
                };
                //fix cứng 1 icon nếu icon truyền lên bị null
                _context.MapDataGpss.Add(model);

                _context.SaveChanges();
                msg.Title = "InsertGisMap_SUCCESS";
                //msg.Title = "Thêm mới địa điểm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "InsertGisMap_ERROR";
                // msg.Title = "Thêm mới địa điểm lỗi";
            }
            return Json(msg);
        }

        //API tạo các điểm trên bản đồ default từ khai báo tọa độ trong bảng Customers
        [HttpPost]
        public JsonResult CreateMapCustomer()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listCus = _context.Customerss.Where(x => !x.IsDeleted
                                                && !string.IsNullOrEmpty(x.GoogleMap)
                                                && !_context.MapDataGpss.Any(y => !y.IsDeleted && y.ObjCode == x.CusCode)
                                                ).AsNoTracking().ToList();
                foreach (var obj in listCus)
                {
                    var googleMapString = obj.GoogleMap;
                    var chkExist = _context.MapDataGpss.Any(x => !x.IsDeleted && x.ObjCode == obj.CusCode);
                    if (!chkExist)
                    {
                        var gps = googleMapString.Split(",");
                        Map map = new Map();
                        GisObject gisObject = new GisObject();
                        for (var item = 0; item < 3; ++item)
                        {
                            List<double> m = new List<double>();
                            m.Add((Double.Parse(gps[1].Trim())) * 20037508.34 / 180);
                            m.Add((Math.Log(Math.Tan((90 + (Double.Parse(gps[0].Trim()))) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                            gisObject.geometry.coordinates[0].Add(m);
                        }

                        map.gis_data = gisObject.geometry.coordinates;
                        map.properties = new MapProperties
                        {
                            fill_color = "#64c936",
                            text = obj.CusName,
                            font_size = "12"
                        };

                        var model = new MapDataGps
                        {
                            Title = obj.CusName,
                            PolygonGPS = JsonConvert.SerializeObject(map),
                            ObjCode = obj.CusCode,
                            Icon = "/images/map/pinmap_start.png",
                            IsActive = true,
                            IsDefault = true,
                            MakerGPS = googleMapString,
                            CreatedTime = DateTime.Now,
                            CreatedBy = ESEIM.AppContext.UserName,
                            GisData = googleMapString + ";" + googleMapString + ";" + googleMapString,
                            Address = obj.Address,
                        };
                        //fix cứng 1 icon nếu icon truyền lên bị null
                        _context.MapDataGpss.Add(model);
                        _context.SaveChanges();
                        msg.Title = "Thêm mới địa điểm thành công";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm mới địa điểm lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateGisMap(PackingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var listGps = obj.Gis_data.Split(";");
                Map map = new Map();
                GisObject gisObject = new GisObject();
                List<GeoCoordinate> listGPS = new List<GeoCoordinate>();

                foreach (var item in listGps)
                {
                    var latLng = item.Split(",");

                    var doubleLat = Convert.ToDouble(latLng[0]);
                    var doubleLng = Convert.ToDouble(latLng[1]);
                    var geo = new GeoCoordinate(doubleLat, doubleLng);
                    listGPS.Add(geo);

                    List<double> m = new List<double>();
                    m.Add((Double.Parse(latLng[1].Trim())) * 20037508.34 / 180);
                    m.Add((Math.Log(Math.Tan((90 + Double.Parse(latLng[0].Trim())) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                    gisObject.geometry.coordinates[0].Add(m);
                }
                map.gis_data = gisObject.geometry.coordinates;
                map.properties = new MapProperties
                {
                    fill_color = "#64c936",
                    text = obj.title,
                    font_size = "12"
                };

                var center = CommonUtil.GetCentralGeoCoordinate(listGPS);
                var makerGPS = center.Latitude + "," + center.Longitude;

                var model = _context.MapDataGpss.FirstOrDefault(x => x.Id == obj.Id);
                //Check Title đã có chưa
                if (model.Title != obj.title)
                {
                    var modelCheck = _context.MapDataGpss.Where(x => x.ObjCode == obj.ObjCode && !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(obj.title) && x.Title == obj.title && !x.IsDeleted).Count();
                    if (modelCheck > 0)
                    {
                        var countCheck = _context.MapDataGpss.Where(x => x.ObjCode == obj.ObjCode && !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(obj.title) && x.Title.ToLower().Contains(obj.title.ToLower()) && !x.IsDeleted).Count() + 1;
                        obj.title = obj.title + " " + countCheck;
                    }
                }

                model.Title = obj.title;
                model.PolygonGPS = JsonConvert.SerializeObject(map);
                model.ObjCode = obj.ObjCode;
                model.Icon = (string.IsNullOrEmpty(obj.Icon) ? "/images/map/pinmap_violet.png" : obj.Icon);
                //model.CreatedBy = obj.CreatedBy;
                //model.CreatedTime = DateTime.Now;
                model.UpdatedBy = obj.CreatedBy;
                model.UpdatedTime = DateTime.Now;
                model.MakerGPS = makerGPS;
                model.GisData = obj.Gis_data;
                model.Address = obj.Address;
                model.IsActive = false;

                //fix cứng 1 icon nếu icon truyền lên bị null
                _context.MapDataGpss.Update(model);
                _context.SaveChanges();
                msg.Title = "UpdateGisMap_SUCCESS";
                //   msg.Title = "Chỉnh sửa địa điểm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "UpdateGisMap_ERROR";
                // msg.Title = "Chỉnh sửa địa điểm lỗi";
            }
            return Json(msg);
        }


        //Tìm trung tâm của Polygon
        [HttpPost]
        public async Task<JsonResult> GetCenterGPSPolygon(string Node, string LocationGps)
        {
            var msg = new JMessage { ID = 1, Error = false, Title = "" };
            try
            {
                var allowDistanceItem = await _context.CommonSettings.FirstOrDefaultAsync(x => x.AssetCode == "VICEM" && x.CodeSet == "ALLOW_DISTANCE");
                var allowDistance = allowDistanceItem == null ? 300 : Convert.ToDouble(allowDistanceItem.ValueSet);

                var listGPSNode = await _context.MapDataGpss.Where(x => x.ObjCode == Node && !x.IsDeleted && x.IsActive && !string.IsNullOrEmpty(x.MakerGPS))
                                                     .AsNoTracking()
                                                     .Select(x => x.MakerGPS)
                                                     .ToListAsync();
                if (!listGPSNode.Any())
                {
                    msg.ID = 0;
                    msg.Error = true;
                    msg.Title = "Nhà phân phối/NPP/Đại lý/Cửa hàng chưa khai báo hoặc chưa được duyệt vị trí.";
                    return Json(msg);
                }
                else
                {
                    var rs = false;
                    foreach (var locationAgent in listGPSNode)
                    {
                        var locationAgentArr = locationAgent.Split(',');
                        var sLat = Convert.ToDouble(locationAgentArr[0]);
                        var sLong = Convert.ToDouble(locationAgentArr[1]);

                        var location = LocationGps.Replace("[", "").Replace("]", "");
                        var locationArr = location.Split(',');
                        var eLat = Convert.ToDouble(locationArr[0]);
                        var eLong = Convert.ToDouble(locationArr[1]);

                        var sCoord = new GeoCoordinate(sLat, sLong);
                        var eCoord = new GeoCoordinate(eLat, eLong);

                        var distance = sCoord.GetDistanceTo(eCoord);
                        if (distance < allowDistance)
                        {
                            rs = true;
                            break;
                        }
                    }
                    if (rs)
                    {
                        msg.Title = "Bạn được phép checkin/checkout.";
                        return Json(msg);
                    }
                    else
                    {
                        msg.ID = 0;
                        msg.Error = true;
                        msg.Title = "Bạn nằm ngoài khoảng cách được phép checkin/checkout.";
                        return Json(msg);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.ID = 0;
                msg.Error = true;
                msg.Title = "Có lỗi khi xác định khoảng cách cho phép checkin.";
                return Json(msg);
            }
        }

        #region tạo mới cửa hàng

        [HttpPost]
        public JsonResult GetListArea(string userName)
        {
            var msg = new JMessage() { Error = false };
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == userName);
            var listArea = !string.IsNullOrEmpty(user.Area) ? user.Area.Split(';') : new string[1000];

            if (user.UserType == 10)
            {
                var query = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "AREA").Select(x => new { x.CodeSet, x.ValueSet })
                            orderby a.ValueSet
                            select new
                            {
                                Code = a.CodeSet,
                                Name = a.ValueSet
                            };
                msg.Object = query;
            }
            else
            {
                var query = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)).Select(x => new { x.CodeSet, x.ValueSet })
                            where
                            (listArea.Any(y => !string.IsNullOrEmpty(y) && y == a.CodeSet))
                            orderby a.ValueSet
                            select new
                            {
                                Code = a.CodeSet,
                                Name = a.ValueSet
                            };
                msg.Object = query;
            }

            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListCustomerInArea(string areaCustomer)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //var data = (from a in _context.Customerss
                //            where !a.IsDeleted && a.Area == areaCustomer && !string.IsNullOrEmpty(a.Role) && a.Role != EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.SHOP)
                //            select new
                //            {
                //                Code = a.CusCode,
                //                Name = a.CusName,
                //                Address = a.Address
                //            }).ToList();
                var data = (from a in _context.Customerss
                            where !a.IsDeleted && !string.IsNullOrEmpty(a.Role) && a.Role != EnumHelper<RoleEnum>.GetDisplayValue(RoleEnum.SHOP)
                            orderby a.CusName
                            select new
                            {
                                Code = a.CusCode,
                                Name = a.CusName,
                                Address = a.Address
                            }).ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetBrands(string cusCode)
        {
            var msg = new JMessage() { Error = false };
            var data = (from b in _context.VcSupplierTradeRelations.Where(x => !x.IsDeleted && x.Buyer == cusCode)
                        join a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.VC_BRAND)) on b.Brand equals a.CodeSet
                        orderby a.ValueSet
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        }).ToList();
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult InsertCustomer([FromBody]ModelCustomerInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var count = _context.Customerss.Where(x => x.Area == obj.Area).Count() + 1;

                var objNew = new Customers();

                objNew.CusCode = obj.Area + "_CH_" + count;
                objNew.CusName = obj.CusName;
                objNew.Address = obj.Address;
                objNew.MobilePhone = obj.MobilePhone;
                objNew.GoogleMap = obj.GoogleMap;
                objNew.Area = obj.Area;
                objNew.CreatedBy = obj.CreatedBy;

                objNew.CreatedTime = DateTime.Now;
                objNew.CusGroup = "CUSTOMER_POTENTIAL";
                objNew.ActivityStatus = "CUSTOMER_DEACTIVE";
                objNew.IsDeleted = false;
                objNew.CusType = "NORMAL";
                objNew.Role = "VC_SHOP";

                _context.Customerss.Add(objNew);

                //add mapdata gis
                InsertGisMapFromCustomer(objNew);

                foreach (var item in obj.ListSupplier)
                {
                    VcSupplierTradeRelation objTrade = new VcSupplierTradeRelation();
                    objTrade.Buyer = objNew.CusCode;

                    objTrade.Seller = item.Seller;
                    objTrade.Brand = item.Brand;

                    objTrade.CreatedBy = obj.CreatedBy;
                    objTrade.CreatedTime = DateTime.Now;
                    objTrade.IsDeleted = false;

                    _context.VcSupplierTradeRelations.Add(objTrade);
                }

                _context.SaveChanges();

                msg.Title = "InsertCustomerr_SUCCESS";
                //msg.Title = "Thêm cửa hàng thành công!";
                msg.Object = objNew;

                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "InsertCustomer_ERROR";
                // msg.Title = "Có lỗi khi thêm cửa hàng!";
                return Json(msg);
            }
        }

        [HttpPost]
        public JsonResult UpdateCustomer([FromBody]ModelCustomerInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var objNew = _context.Customerss.FirstOrDefault(x => !x.IsDeleted && x.CusCode == obj.CusCode);
                if (objNew != null)
                {
                    //Nếu thay đổi tọa độ => xóa cũ thêm mới
                    var oldGoogleMap = objNew.GoogleMap;
                    if (objNew.GoogleMap != obj.GoogleMap)
                    {
                        var mapDataGps = _context.MapDataGpss.Where(x => !x.IsDeleted && x.ObjCode == obj.CusCode && x.MakerGPS == objNew.GoogleMap).ToList();
                        mapDataGps.ForEach(x => x.IsDeleted = true);
                        _context.MapDataGpss.UpdateRange(mapDataGps);
                    }

                    objNew.CusCode = obj.CusCode;
                    objNew.CusName = obj.CusName;
                    objNew.Address = obj.Address;
                    objNew.MobilePhone = obj.MobilePhone;
                    objNew.GoogleMap = obj.GoogleMap;
                    objNew.Area = obj.Area;

                    objNew.UpdatedBy = obj.CreatedBy;
                    objNew.UpdatedTime = DateTime.Now;
                    //objNew.CusGroup = "CUSTOMER_POTENTIAL";
                    objNew.ActivityStatus = "CUSTOMER_DEACTIVE";
                    //objNew.IsDeleted = false;
                    //objNew.CusType = "NORMAL";
                    //objNew.Role = "VC_SHOP";

                    _context.Customerss.Update(objNew);

                    if (oldGoogleMap != obj.GoogleMap)
                    {
                        //add mapdata gis
                        InsertGisMapFromCustomer(objNew);
                    }

                    //Xóa list cung cấp cũ
                    var listSupplier = _context.VcSupplierTradeRelations.Where(x => !x.IsDeleted && x.Buyer == obj.CusCode).ToList();
                    listSupplier.ForEach(x => x.IsDeleted = true);
                    _context.VcSupplierTradeRelations.UpdateRange(listSupplier);

                    //Thêm list cung cấp mới
                    foreach (var item in obj.ListSupplier)
                    {
                        VcSupplierTradeRelation objTrade = new VcSupplierTradeRelation();
                        objTrade.Buyer = objNew.CusCode;

                        objTrade.Seller = item.Seller;
                        objTrade.Brand = item.Brand;

                        objTrade.CreatedBy = obj.CreatedBy;
                        objTrade.CreatedTime = DateTime.Now;
                        objTrade.IsDeleted = false;

                        _context.VcSupplierTradeRelations.Add(objTrade);
                    }

                    _context.SaveChanges();

                    msg.Title = "UpdateCustomer_SUCCESS";
                    // msg.Title = "Chỉnh sửa cửa hàng thành công!";
                    msg.Object = objNew;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "UpdateCustomer_CHECK_DELETE_STRORE";
                    //msg.Title = "Cửa hàng đã bị xóa!";
                }
                return Json(msg);
            }
            catch
            {
                msg.Error = true;
                //msg.Object = ex;
                msg.Title = "UpdateCustomer_ERROR";
                // msg.Title = "Có lỗi khi chỉnh sửa cửa hàng!";
                return Json(msg);
            }
        }
        [NonAction]
        public JsonResult InsertGisMapFromCustomer(Customers obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var googleMapString = obj.GoogleMap;
                if (googleMapString.Length > 0)
                {
                    var gps = googleMapString.Split(",");
                    Map map = new Map();
                    GisObject gisObject = new GisObject();
                    for (var item = 0; item < 3; ++item)
                    {
                        List<double> m = new List<double>();
                        m.Add((Double.Parse(gps[1].Trim())) * 20037508.34 / 180);
                        m.Add((Math.Log(Math.Tan((90 + (Double.Parse(gps[0].Trim()))) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                        gisObject.geometry.coordinates[0].Add(m);
                    }

                    map.gis_data = gisObject.geometry.coordinates;
                    map.properties = new MapProperties
                    {
                        fill_color = "#64c936",
                        text = obj.CusName,
                        font_size = "12"
                    };

                    var model = new MapDataGps
                    {
                        Title = obj.CusName,
                        PolygonGPS = JsonConvert.SerializeObject(map),
                        ObjCode = obj.CusCode,
                        Icon = "/images/map/pinmap_start.png",
                        IsActive = false,
                        IsDefault = false,
                        MakerGPS = googleMapString,
                        GisData = googleMapString,
                        Address = obj.Address,
                        CreatedTime = DateTime.Now,
                        CreatedBy = obj.CreatedBy,
                    };
                    //fix cứng 1 icon nếu icon truyền lên bị null
                    _context.MapDataGpss.Add(model);
                    //_context.SaveChanges();
                    //msg.Title = "Thêm mới địa điểm thành công";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Thêm mới địa điểm lỗi";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteCustomer(int id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.Customerss.FirstOrDefault(x => x.CusID == id);
                var isHasSettingRoute = _context.VcSettingRoutes.Any(x => !x.IsDeleted && x.Node == data.CusCode);
                if (isHasSettingRoute)
                {
                    msg.Error = true;
                    msg.Title = "DeleteCustomer_CANNEL_NOT_DELETE";
                    //msg.Title = "Không thể xóa cửa hàng đã được sử dụng trong kế hoạch!";
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;

                    _context.Customerss.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "DeleteCustomer_SUCCESS";
                    //msg.Title = "Xóa thành công!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = "DeleteCustomer_ERROR";
                //                msg.Title = "Có lỗi xảy ra!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListDetailCustomer(string cusCode)
        {
            var msg = new JMessage() { Error = false };
            var data = (from b in _context.VcSupplierTradeRelations.Where(x => !x.IsDeleted && x.Buyer == cusCode)
                        join a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<GroupUserEnum>.GetDisplayValue(GroupUserEnum.VC_BRAND)) on b.Brand equals a.CodeSet
                        join c1 in _context.Customerss.Where(x => !x.IsDeleted) on b.Seller equals c1.CusCode into c2
                        from c in c2.DefaultIfEmpty()
                        select new
                        {
                            Seller = b.Seller,
                            SellerName = c != null ? c.CusName : "",
                            Brand = b.Brand,
                            BrandName = a.ValueSet,
                        }).ToList();
            msg.Object = data;
            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetListAgentShop(string username)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var user = _context.Users.FirstOrDefault(x => x.UserName == username && x.Active);
                if (user != null)
                {
                    if (string.IsNullOrEmpty(user.Area))
                    {
                        msg.Error = true;
                        msg.Title = "GetListAgentShop_USER_MANAGE_NULL";
                    }
                    else
                    {
                        var listArea = user.Area.Split(';');
                        var rs = new List<object>();

                        var data = from a in _context.Customerss.Where(x => listArea.Any(y => y == x.Area) && x.IsDeleted == false && x.Role != "VC_DISTRIBUTOR")
                                   join b in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area)) on a.Area equals b.CodeSet
                                   join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "STATUS") on a.ActivityStatus equals c.CodeSet
                                   join d in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "STATUS_VIEW_APP") on "CUS_" + a.ActivityStatus equals d.CodeSet
                                   orderby a.CusID descending
                                   select new
                                   {
                                       a.CusID,
                                       a.CusCode,
                                       a.CusName,
                                       a.Address,
                                       a.MobilePhone,
                                       a.GoogleMap,
                                       a.Area,
                                       a.CreatedBy,
                                       a.CreatedTime,
                                       AreaName = b.ValueSet,
                                       StatusApp = d.ValueSet,
                                       StatusBackend = c.ValueSet,
                                   };


                        rs.AddRange(data);
                        msg.Object = rs;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "GetListAgentShop_USER_NULL";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "GetListAgentShop_ERROR";
            }
            return Json(msg);
        }

        #endregion

        //API cho app cửa hàng
        //Lấy danh sách ý kiến của 1 cửa hàng
        [HttpPost]
        public JsonResult GetListStoreIdea(string Username)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.VcStoreIdeas
                            where
                            a.IsDeleted != true
                            && a.CreatedBy == Username
                            orderby a.CreatedTime descending
                            select new
                            {
                                Id = a.Id,
                                Title = a.Title,
                                Description = a.Description,
                                UrlPicture = a.UrlPicture,
                                Order = a.Order,
                                CreatedTime = a.CreatedTime.ToString("dd-MM-yyyy"),
                                CreatedBy = Username,
                            }).AsNoTracking().ToList();
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetListStoreIdea_ERROR";
            }
            return Json(msg);
        }

        //Thêm/Sửa ý kiến của 1 cửa hàng
        [HttpPost]
        public async Task<JsonResult> InsertStoreIdea(VcStoreIdeaInsert objInsert, List<IFormFile> pictureFile)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //Nếu Id == null thì là insert mới
                if (objInsert.Id == null)
                {
                    if (pictureFile.Count > 0)
                    {
                        //foreach (var item in pictureFile)
                        //{
                        var item = pictureFile[0];
                        if (item.Length > 0)
                        {
                            var mes = _uploadService.UploadImage(item);
                            var fileName = Path.GetFileName(item.FileName);
                            var extend = Path.GetExtension(fileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName);

                            var obj = new VcStoreIdea();
                            obj.UrlPicture = "/uploads/Images/" + mes.Object.ToString();
                            obj.Title = objInsert.Title;
                            obj.Description = objInsert.Description;
                            obj.Order = objInsert.Order == null ? 0 : (int)objInsert.Order;

                            obj.CreatedBy = objInsert.Username;
                            obj.CreatedTime = DateTime.Now;

                            _context.VcStoreIdeas.Add(obj);
                        }
                        //}
                    }
                    else
                    {
                        var obj = new VcStoreIdea();
                        obj.UrlPicture = "/images/default/uploadimg.png";
                        obj.Title = objInsert.Title;
                        obj.Description = objInsert.Description;
                        obj.Order = objInsert.Order == null ? 0 : (int)objInsert.Order;

                        obj.CreatedBy = objInsert.Username;
                        obj.CreatedTime = DateTime.Now;

                        _context.VcStoreIdeas.Add(obj);
                    }

                    await _context.SaveChangesAsync();
                    msg.Title = "InsertStoreIdea_INSERT_SUCCESS";
                }
                //Nếu Id != null thì là update
                else
                {
                    var obj = _context.VcStoreIdeas.FirstOrDefault(x => x.Id == objInsert.Id);

                    if (pictureFile.Count > 0)
                    {
                        //foreach (var item in pictureFile)
                        //{
                        var item = pictureFile[0];
                        if (item.Length > 0)
                        {
                            var mes = _uploadService.UploadImage(item);
                            var fileName = Path.GetFileName(item.FileName);
                            var extend = Path.GetExtension(fileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName);

                            obj.UrlPicture = "/uploads/Images/" + mes.Object.ToString();
                            obj.Title = objInsert.Title;
                            obj.Description = objInsert.Description;
                            obj.Order = objInsert.Order == null ? obj.Order : (int)objInsert.Order;

                            obj.UpdatedBy = objInsert.Username;
                            obj.UpdatedTime = DateTime.Now;
                            obj.CreatedTime = DateTime.Now;

                            _context.VcStoreIdeas.Update(obj);
                        }
                        //}
                    }
                    else
                    {
                        obj.UrlPicture = "/images/default/uploadimg.png";
                        obj.Title = objInsert.Title;
                        obj.Description = objInsert.Description;
                        obj.Order = objInsert.Order == null ? obj.Order : (int)objInsert.Order;

                        obj.UpdatedBy = objInsert.Username;
                        obj.UpdatedTime = DateTime.Now;
                        obj.CreatedTime = DateTime.Now;

                        _context.VcStoreIdeas.Update(obj);
                    }

                    await _context.SaveChangesAsync();
                    msg.Title = "InsertStoreIdea_UPDATE_SUCCESS";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "InsertStoreIdea_ERROR";
            }
            return Json(msg);
        }

        //Get ra list thông tin sản phẩm cửa hàng kê khai
        [HttpPost]
        public JsonResult GetListCustomerDeclareInfo(string Username)
        {
            var msg = new JMessageRoute() { Error = false, Title = "" };
            try
            {
                var data = (from a in _context.VcCustomerDeclareInfos.Where(x => x.IsDeleted != true)
                            join b1 in _context.CommonSettings.Where(x => x.Group == "VC_BRAND") on a.BrandCode equals b1.CodeSet into b2
                            from b in b2.DefaultIfEmpty()
                            join c1 in _context.MaterialProducts.Where(x => x.IsDeleted != true) on a.ProductCode equals c1.ProductCode into c2
                            from c in c2.DefaultIfEmpty()
                            where a.CreatedBy == Username
                            orderby a.Id descending
                            select new
                            {
                                a.BrandCode,
                                BrandName = b != null ? b.ValueSet : "",
                                a.ProductCode,
                                ProductName = c != null ? c.ProductName : "",
                                BuyCost = a.BuyCost == null ? "_" : a.BuyCost.ToString(),
                                SaleCost = a.SaleCost == null ? "_" : a.SaleCost.ToString(),
                                ConsumpMonthly = a.ConsumpMonthly == null ? "_" : a.ConsumpMonthly.ToString(),
                                Instock = a.Instock == null ? "_" : a.Instock.ToString(),
                                Proportion = a.Proportion,
                                TotalCanImp = a.TotalCanImp,
                                Note = a.Note,
                            }).AsNoTracking().ToList();

                msg.Object = data;

                var headerInfo = data.FirstOrDefault();

                msg.Proportion = headerInfo?.Proportion;
                msg.TotalCanImp = headerInfo?.TotalCanImp;
                msg.Note = headerInfo?.Note;
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "GetListCustomerDeclareInfo_ERROR";
                //msg.Title = "Lỗi khi load dữ liệu!";
            }
            return Json(msg);
        }

        //Thêm dữ liệu cửa hàng nhập lên
        [HttpPost]
        public async Task<JsonResult> InsertCustomerDeclareInfo([FromBody]CustomerDeclareInfoInsert objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                VcCustomerDeclareInfo obj = new VcCustomerDeclareInfo();

                obj.BrandCode = objInsert.BrandCode;
                obj.ProductCode = objInsert.ProductCode;
                obj.BuyCost = objInsert.BuyCost;
                obj.SaleCost = objInsert.SaleCost;
                obj.ConsumpMonthly = objInsert.ConsumpMonthly;
                obj.Instock = objInsert.Instock;
                obj.Proportion = objInsert.Proportion;
                obj.TotalCanImp = objInsert.TotalCanImp;
                obj.Note = objInsert.Note;

                obj.CreatedBy = objInsert.Username;
                obj.CreatedTime = DateTime.Now;

                _context.VcCustomerDeclareInfos.Add(obj);

                await _context.SaveChangesAsync();
                msg.Title = "InsertCustomerDeclareInfo_SUCCESS";
                //msg.Title = "Thêm bản ghi thành công";            
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "InsertCustomerDeclareInfo_ERROR";
                // msg.Title = "Có lỗi khi thêm/chỉnh sửa dữ liệu.";
            }
            return Json(msg);
        }


        [HttpPost]
        public async Task<JsonResult> DeleteCustomerDeclareInfo([FromBody]CustomerDeclareInfoDelete objInsert)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var chkExist = await _context.VcCustomerDeclareInfos.OrderByDescending(x => x.Id).FirstOrDefaultAsync(x => x.IsDeleted != true && x.BrandCode == objInsert.BrandCode && x.ProductCode == objInsert.ProductCode);

                //Nếu không tồn tại bản ghi có RouteCode,BrandCode, ProductCode thì là báo lỗi
                if (chkExist == null)
                {
                    msg.Error = true;
                    msg.Title = "DeleteCustomerDeclareInfo_PRODUCT_NULL";
                    //msg.Title = "Sản phẩm của thương hiệu này không có trong danh sách đã nhập dữ liệu.";
                }
                //Nếu tồn tại bản ghi có BrandCode, ProductCode thì xóa đi
                else
                {
                    chkExist.IsDeleted = true;

                    chkExist.DeletedBy = objInsert.Username;
                    chkExist.DeletedTime = DateTime.Now;


                    _context.VcCustomerDeclareInfos.Update(chkExist);

                    await _context.SaveChangesAsync();
                    msg.Title = "DeleteCustomerDeclareInfo_DELETE_SUCCESS";
                    //msg.Title = "Xóa bản ghi thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "DeleteCustomerDeclareInfo_DELETE_ERROR";
                //msg.Title = "Có lỗi khi xóa dữ liệu.";
            }
            return Json(msg);
        }

        //Function Common
        [NonAction]
        public async Task<JMessage> FuncInsertWorkPlan(string username, string WpCode, string WeekNo, string Description, bool saveChange = false)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                int nWeekNo = int.Parse(WeekNo);
                //int.TryParse(WeekNo, out nWeekNo);
                var dtNow = DateTime.Now;
                var dtYear = dtNow.Year;
                var maxFromDate = dtNow.AddDays(7);

                DateTime dFromDate = CommonUtil.FirstDateOfWeekISO8601(dtYear, nWeekNo);

                DateTime dToDate = dFromDate.AddDays(6);
                if (dFromDate < maxFromDate)
                {
                    var checkUser = await _context.Users.AnyAsync(x => x.UserName == username && x.Active);

                    if (checkUser)
                    {
                        //Nếu WpCode = null thì là insert mới
                        if (string.IsNullOrEmpty(WpCode))
                        {
                            WpCode = username + "_" + dFromDate.Year + "_" + WeekNo;

                            var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                            if (item == null)
                            {
                                var checkTime = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.UserName == username && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);
                                if (checkTime != null)
                                {
                                    msg.Error = true;

                                    msg.Title = "InsertWorkPlan_Haven_Week";
                                    //msg.Title = "Kế hoạch cho tuần này đã được lập.";
                                }
                                else
                                {
                                    var checkStatusWp = _context.VcWorkPlans.Where(x => x.UserName == username && x.IsDeleted != true).OrderByDescending(x => x.ToDate).Skip(1).Take(1).FirstOrDefault();
                                    if (checkStatusWp != null && checkStatusWp.CurrentStatus != WpStatus.WpDone.DescriptionAttr())
                                    {
                                        msg.Error = true;
                                        msg.Title = "InsertWorkPlan_One_New";
                                        //msg.Title = "Chỉ được tạo thêm 1 mã kế hoạch khi kế hoạch cũ chưa thực hiện xong.";
                                    }
                                    else
                                    {
                                        VcWorkPlan obj = new VcWorkPlan();

                                        obj.WpCode = WpCode;
                                        obj.UserName = username;
                                        obj.FromDate = dFromDate;
                                        obj.ToDate = dToDate;
                                        obj.WeekNo = nWeekNo;
                                        obj.Description = Description;
                                        obj.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

                                        //obj.CreatedBy = ESEIM.AppContext.UserName;
                                        obj.CreatedBy = username;
                                        obj.CreatedTime = DateTime.Now;

                                        _context.VcWorkPlans.Add(obj);

                                        if (saveChange)
                                        {
                                            _context.SaveChanges();
                                        }
                                        msg.Title = "InsertWorkPlan_Success";
                                        //msg.Title = "Thêm kế hoạch tuần thành công";
                                        object rs = new WorkPlanRes
                                        {
                                            WpCode = WpCode,
                                            Username = username,
                                        };
                                        msg.Object = rs;
                                    }
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = "InsertWorkPlan_Haven_CodePlan";
                                //msg.Title = "Không thêm mới được mã kế hoạch tuần tồn tại.";
                            }
                        }
                        //Nếu WpCode != null thì là update
                        else
                        {
                            var obj = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
                            if (obj != null)
                            {
                                var checkTime = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.UserName == username && x.WpCode != WpCode && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);
                                if (checkTime != null)
                                {
                                    msg.Error = true;
                                    msg.Title = "InsertWorkPlan_Haven_Week";
                                    //msg.Title = "Kế hoạch cho tuần này đã được lập.";
                                }
                                else
                                {
                                    obj.FromDate = dFromDate;
                                    obj.ToDate = dToDate;
                                    obj.WeekNo = nWeekNo;
                                    obj.Description = Description;
                                    obj.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

                                    obj.CreatedTime = DateTime.Now;
                                    //obj.UpdatedBy = username;
                                    obj.UpdatedBy = ESEIM.AppContext.UserName;
                                    obj.UpdatedTime = DateTime.Now;


                                    _context.VcWorkPlans.Update(obj);

                                    if (saveChange)
                                    {
                                        _context.SaveChanges();
                                    }
                                    msg.Title = "InsertWorkPlan_Edit_Success";
                                    //msg.Title = "Chỉnh sửa kế hoạch tuần thành công";
                                    object rs = new WorkPlanRes
                                    {
                                        WpCode = WpCode,
                                        Username = username,
                                    };
                                    msg.Object = rs;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = "InsertWorkPlan_Edit_Haven_CodePlan";
                                //msg.Title = "Không chỉnh sửa được mã kế hoạch tuần không tồn tại.";
                            }
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "InsertWorkPlan_Null_User";
                        //msg.Title = "Người dùng không tồn tại hoặc đã bị ngừng hoạt động.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "InsertWorkPlan_Two_Week";
                    //msg.Title = "Không được lập trước kế hoạch cách 2 tuần.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "InsertWorkPlan_Error";
                //msg.Title = "Có lỗi khi thêm/chỉnh sửa thông tin kế hoạch tuần.";
            }
            return msg;
        }
        ////Function Common
        ////Hàm cũ - truyền fromdate, todate
        //[NonAction]
        //public async Task<JMessage> FuncInsertWorkPlan(string username, string WpCode, string FromDate, string ToDate, string Description, bool saveChange = false)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        //DateTime? dFromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        //DateTime? dToDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "MM/dd/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        //var fromDate = dFromDate?.ToString("yyyyMMdd");
        //        //var toDate = dToDate?.ToString("yyyyMMdd");

        //        DateTime dFromDate = DateTime.ParseExact(FromDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);
        //        DateTime dToDate = DateTime.ParseExact(ToDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);
        //        var WeekNo = CommonUtil.GetWeekOfYear(dFromDate);
        //        var WeekNo2 = CommonUtil.GetWeekOfYear(dToDate);
        //        if (WeekNo != WeekNo2)
        //        {
        //            msg.Error = true;
        //            msg.Title = "Ngày bắt đầu & kết thúc của kế hoạch không trong 1 tuần.";
        //        }
        //        else
        //        {
        //            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == username && x.Active);


        //            //Nếu WpCode = null thì là insert mới
        //            if (string.IsNullOrEmpty(WpCode))
        //            {
        //                WpCode = user?.UserName + "_" + dFromDate.Year + "_" + WeekNo;

        //                var item = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
        //                if (item == null)
        //                {
        //                    var checkTime = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.UserName == username && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);
        //                    if (checkTime != null)
        //                    {
        //                        msg.Error = true;
        //                        msg.Title = "Thời gian kế hoạch bị trùng lặp.";
        //                    }
        //                    else
        //                    {
        //                        VcWorkPlan obj = new VcWorkPlan();

        //                        obj.WpCode = WpCode;
        //                        obj.UserName = username;
        //                        obj.FromDate = dFromDate;
        //                        obj.ToDate = dToDate;
        //                        obj.WeekNo = WeekNo;
        //                        obj.Description = Description;
        //                        obj.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

        //                        //obj.CreatedBy = EIM.AppContext.UserName;
        //                        obj.CreatedBy = user?.UserName;
        //                        obj.CreatedTime = DateTime.Now;


        //                        _context.VcWorkPlans.Add(obj);

        //                        if (saveChange)
        //                        {
        //                            _context.SaveChanges();
        //                        }
        //                        msg.Title = "Thêm kế hoạch tuần thành công";
        //                        object rs = new WorkPlanRes
        //                        {
        //                            WpCode = WpCode,
        //                            Username = user?.UserName,
        //                        };
        //                        msg.Object = rs;
        //                    }
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Không thêm mới được mã kế hoạch tuần tồn tại.";
        //                }
        //            }
        //            //Nếu WpCode != null thì là update
        //            else
        //            {
        //                var obj = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.WpCode == WpCode && x.IsDeleted != true);
        //                if (obj != null)
        //                {
        //                    var checkTime = await _context.VcWorkPlans.FirstOrDefaultAsync(x => x.UserName == username && x.WpCode != WpCode && x.CurrentStatus != "WP_CANCEL" && x.IsDeleted != true && x.ToDate >= dFromDate);
        //                    if (checkTime != null)
        //                    {
        //                        msg.Error = true;
        //                        msg.Title = "Thời gian kế hoạch bị trùng lặp.";
        //                    }
        //                    else
        //                    {
        //                        obj.FromDate = dFromDate;
        //                        obj.ToDate = dToDate;
        //                        obj.WeekNo = WeekNo;
        //                        obj.Description = Description;
        //                        obj.CurrentStatus = WpStatus.WpPending.DescriptionAttr();

        //                        obj.CreatedTime = DateTime.Now;
        //                        obj.UpdatedBy = user?.UserName;
        //                        obj.UpdatedTime = DateTime.Now;


        //                        _context.VcWorkPlans.Update(obj);

        //                        if (saveChange)
        //                        {
        //                            _context.SaveChanges();
        //                        }
        //                        msg.Title = "Chỉnh sửa kế hoạch tuần thành công";
        //                        object rs = new WorkPlanRes
        //                        {
        //                            WpCode = WpCode,
        //                            Username = user?.UserName,
        //                        };
        //                        msg.Object = rs;
        //                    }
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Không chỉnh sửa được mã kế hoạch tuần không tồn tại.";
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi thêm/chỉnh sửa thông tin kế hoạch tuần.";
        //    }
        //    return msg;
        //}


        [NonAction]
        public async Task<JMessage> FuncInsertSettingRoute(string Username, string WpCode, string Node, string Note, int Order, bool saveChange = false)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //DateTime dTimeWork = DateTime.ParseExact(TimeWork, "HH:mm dd-MM-yyyy", CultureInfo.InvariantCulture);


                var RouteCode = WpCode + "_" + Order;

                var item = await _context.VcSettingRoutes.FirstOrDefaultAsync(x => x.RouteCode == RouteCode && x.IsDeleted != true);
                if (item == null)
                {
                    VcSettingRoute obj = new VcSettingRoute();

                    obj.RouteCode = RouteCode;
                    obj.WpCode = WpCode;
                    obj.Node = Node;
                    //obj.TimeWork = dTimeWork;
                    obj.Note = Note;
                    obj.Order = Order;
                    obj.TimePlan = DateTime.Now;
                    obj.CurrentStatus = RouteStatus.RoutePending.DescriptionAttr();

                    //obj.CreatedBy = EIM.AppContext.UserName;
                    obj.CreatedBy = Username;
                    obj.CreatedTime = DateTime.Now;

                    _context.VcSettingRoutes.Add(obj);

                    if (saveChange)
                    {
                        _context.SaveChanges();
                    }
                    msg.Title = "Thêm định tuyến kế hoạch tuần thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Mã định tuyến tồn tại.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm thông tin định tuyến.";
            }
            return msg;
        }

        ////hàm cũ
        //[NonAction]
        //public async Task<JMessage> FuncInsertSettingRoute(string Username, string WpCode, string Node, string TimeWork, string Note, int Order, bool saveChange = false)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        DateTime dTimeWork = DateTime.ParseExact(TimeWork, "HH:mm dd-MM-yyyy", CultureInfo.InvariantCulture);


        //        var RouteCode = WpCode + "_" + Order;

        //        var item = await _context.VcSettingRoutes.FirstOrDefaultAsync(x => x.RouteCode == RouteCode && x.IsDeleted != true);
        //        if (item == null)
        //        {
        //            VcSettingRoute obj = new VcSettingRoute();

        //            obj.RouteCode = RouteCode;
        //            obj.WpCode = WpCode;
        //            obj.Node = Node;
        //            //obj.TimeWork = dTimeWork;
        //            obj.Note = Note;
        //            obj.Order = Order;
        //            obj.TimePlan = dTimeWork;
        //            obj.CurrentStatus = RouteStatus.RoutePending.DescriptionAttr();

        //            //obj.CreatedBy = EIM.AppContext.UserName;
        //            obj.CreatedBy = Username;
        //            obj.CreatedTime = DateTime.Now;

        //            _context.VcSettingRoutes.Add(obj);

        //            if (saveChange)
        //            {
        //                _context.SaveChanges();
        //            }
        //            msg.Title = "Thêm định tuyến kế hoạch tuần thành công";
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Mã định tuyến tồn tại.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi thêm thông tin định tuyến.";
        //    }
        //    return msg;
        //}
        [NonAction]
        public async Task<JMessage> FuncApproveWorkPlan(string Username, string WpCode, string Status, string LeaderIdea, bool saveChange = false)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (LeaderIdea == "undefined") LeaderIdea = "";

                VcLeaderApprove obj = new VcLeaderApprove();

                obj.WpCode = WpCode;
                obj.Status = Status;
                obj.Note = LeaderIdea;
                obj.CreatedBy = Username;
                obj.CreatedTime = DateTime.Now;

                _context.VcLeaderApproves.Add(obj);

                if (saveChange)
                {
                    await _context.SaveChangesAsync();
                }
                msg.Title = "Thêm bản ghi thành công";
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm bản ghi.";
            }
            return msg;
        }

        //API sửa thông tin user
        [HttpPost]
        public async Task<JsonResult> UpdateImage(string username, IFormFile image)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.UserName == username && x.Active);
                if (us != null)
                {
                    if (image != null && image.Length > 0)
                    {
                        var mimeType = image.ContentType;
                        string extension = Path.GetExtension(image.FileName);
                        string[] imageMimetypes = { "image/gif", "image/jpeg", "image/pjpeg", "image/x-png", "image/png", "image/svg+xml" };
                        string[] imageExt = { ".gif", ".jpeg", ".jpg", ".png", ".svg", ".blob" };
                        if (Array.IndexOf(imageMimetypes, mimeType) >= 0 && (Array.IndexOf(imageExt, extension) >= 0))
                        {
                            var url = string.Empty;
                            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                            if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                            var fileName = Path.GetFileName(image.FileName);
                            fileName = Path.GetFileNameWithoutExtension(fileName)
                             + "_"
                             + Guid.NewGuid().ToString().Substring(0, 8)
                             + Path.GetExtension(fileName);
                            var filePath = Path.Combine(pathUpload, fileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await image.CopyToAsync(stream);
                            }
                            url = "/uploads/images/" + fileName;
                            us.Picture = url;
                            await _context.SaveChangesAsync();
                            msg.Title = "Cập nhập ảnh thành công.";
                            msg.Object = us.Picture;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Định dạng ảnh không đúng." + extension + mimeType;
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Ảnh không tồn tại.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Người dùng không tồn tại.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi cập nhập thông tin.";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateProfile(string username, string giveName, string phone, string mail)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var errorRegex = false;
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.UserName == username && x.Active);
                if (us != null)
                {
                    var regexPhone = @"^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$";
                    var regexEmail = @"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$";
                    if (!string.IsNullOrEmpty(phone))
                    {
                        var matchPhone = Regex.Match(phone, regexPhone, RegexOptions.IgnoreCase);
                        if (!matchPhone.Success)
                        {
                            msg.Error = true;
                            msg.Title = "Số điện thoại nhập không đúng.";
                            errorRegex = true;
                        }
                    }
                    if (!string.IsNullOrEmpty(mail))
                    {
                        var matchEmail = Regex.Match(mail, regexEmail, RegexOptions.IgnoreCase);
                        if (!matchEmail.Success)
                        {
                            msg.Error = true;
                            msg.Title = "Email nhập không đúng.";
                            errorRegex = true;
                        }
                    }
                    if (!errorRegex)
                    {
                        us.GivenName = giveName;
                        us.Email = mail;
                        us.PhoneNumber = phone;
                        await _context.SaveChangesAsync();
                        msg.Title = "Cập nhập thông tin thành công.";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Người dùng không tồn tại.";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi khi cập nhập thông tin.";
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult ForgotPassWord(string email)
        //{
        //    var message = new JMessage { Error = false };
        //    try
        //    {
        //        var user = _context.VcDrivers.FirstOrDefault(x => x.Email == email);
        //        if (user != null)
        //        {
        //            string content = "Mật khẩu của bạn là:" + user.Password;
        //            var result = CommonUtil.SendMail("vayxe@3i.com.vn", email, "Vicem system", content, "mail.3i.com.vn", 587, "vayxe@3i.com.vn", "Giacngo79");
        //            if (result.Error)
        //            {
        //                message.Error = true;
        //                message.Title = "Không tìm thấy mật khẩu!";
        //            }
        //            else
        //            {
        //                message.Title = "Đã gửu mật khẩu tới email. Vui lòng kiểm tra lại email!";
        //            }
        //        }
        //        else
        //        {
        //            message.Error = true;
        //            message.Title = "EMAIL_NOT_EXIT";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        message.ID = 0;
        //        message.Error = true;
        //        message.Title = "";
        //        message.Object = ex.Message;
        //    }
        //    return Json(message);
        //}

        [HttpPost]
        public async Task<JsonResult> ForgotPassWord(string email)
        {
            var message = new JMessage { Error = false };
            try
            {
                var us = _context.Users.FirstOrDefault(x => x.Email == email && x.Active);
                if (us != null)
                {
                    var passwordNew = Guid.NewGuid().ToString().Substring(1, 8);

                    string code = await _userManager.GeneratePasswordResetTokenAsync(us);
                    var result1 = await _userManager.ResetPasswordAsync(us, code, passwordNew);
                    if (result1.Succeeded)
                    {
                        var a = await _context.SaveChangesAsync();

                        string content = "Mật khẩu của bạn là:" + passwordNew;
                        var result = CommonUtil.SendMail("vayxe@3i.com.vn", email, "Vicem system", content, "mail.3i.com.vn", 587, "vayxe@3i.com.vn", "Giacngo79");
                        if (result.Error)
                        {
                            message.Error = true;
                            message.Title = "ForgotPassWord_ERROR_MAIL_SEND";
                            // message.Title = "Lỗi gửi email!";
                        }
                        else
                        {
                            message.Title = "ForgotPassWord_SUCCESS_MAIL_SEND";
                            // message.Title = "Đã gửi mật khẩu tới email. Vui lòng kiểm tra lại email!";
                        }
                    }
                    else
                    {
                        message.Error = true;
                        message.Title = "ForgotPassWord_ERROR_PASS_NEW";
                        //   message.Title = "Có lỗi khi tạo mật khẩu mới";
                    }
                }
                else
                {
                    message.Error = true;
                    message.Title = "ForgotPassWord_ERROR_";
                    //  message.Title = "Email không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                message.ID = 0;
                message.Error = true;
                message.Title = "";
                message.Object = ex.Message;
            }
            return Json(message);
        }

        //public static IEnumerable<ModelTest> Test1(PackageDbContext _context, int? param1, string param2)
        //{
        //    return _context.ModelTests.FromSql("GetTest1 @param1={0}, @param2={1}", param1, param2);
        //}
        //public static IEnumerable<ModelTest> Test2(PackageDbContext _context, int? param1, string param2)
        //{
        //    List<ModelTest> m_data = new List<ModelTest>();
        //    return _context.ModelTests.FromSql("GetTest3 @param1={0}, @param2={1}, @m_data={2}", param1, param2, m_data);
        //}
        //public static IEnumerable<ModelTest> Test3(PackageDbContext _context, int? param1, string param2)
        //{
        //    List<ModelTest> m_data = new List<ModelTest>();
        //    return _context.Set<ModelTest>().FromSql("GetTest3 @param1={0}, @param2={1}, @m_data={2}", param1, param2, m_data);
        //}
        //public static void Test4(PackageDbContext _context, int? param1, string param2)
        //{
        //    var result = _context.PackPackages.FromSql("GetTest4 @param1={0}, @param2={1}", param1, param2);
        //}
        //public static List<ModelTest> Test5(PackageDbContext _context, int? param1, string param2)
        //{
        //    List<ModelTest> m_data = new List<ModelTest>();
        //    var result = _context.Set<ModelTest>().FromSql("GetTest3 @param1={0}, @param2={1}, @m_data={2}", param1, param2, m_data).ToList();
        //    return result;
        //}
        //public static List<ModelTest> Test6(PackageDbContext _context, int? param1, string param2)
        //{
        //    var result = _context.Set<ModelTest>().FromSql("select ID from PACK_PACKAGE").ToList();
        //    return result;
        //}
        //public static ModelTest Test7(PackageDbContext _context, int? param1, string param2)
        //{
        //    decimal m_data = new decimal();
        //    var result = _context.ModelTests.FromSql("GetTest7 @param1={0}, @param2={1}, @m_data={2}", param1, param2, m_data).First();
        //    return result;
        //}
        //[HttpPost]
        //public JsonResult TestAPI(int userId)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        //TestAction();
        //        //var ab = TestQueryText();
        //        var xe = TestQueryProParam();
        //        var ab = TestQueryProNoParam();
        //        //var test8 = GetDataTable("GetTest3", "@param1=12", 1);
        //        //var tes7 = Test7(_packageContext, 1, "ab");
        //        //var tes1 = Test1(_packageContext, 1, "ab");
        //        //var tes2 = Test2(_packageContext, 1, "ab");
        //        //var tes3 = Test3(_packageContext, 1, "ab");
        //        //Test4(_packageContext, 1, "ab");
        //        _packageContext.SaveChanges();
        //        //var tes5 = Test5(_packageContext, 1, "ab");
        //        //var tes6 = Test6(_packageContext, 1, "ab");
        //        //var cv = Test3(_packageContext,1,"ab");
        //        var query = from a in _packageContext.PackClientCriteriaValues
        //                    select new
        //                    {
        //                        a.Id,
        //                    };

        //        //SMSDL bl = new SMSDL();
        //        //var x = bl.TestFunc();
        //        msg.Object = query;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = "Có lỗi khi cập nhập thông tin.";

        //    }
        //    return Json(msg);
        //}

        //const string connectString = "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=117.6.131.222)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=db12c)));User Id=addon_package;Password=vib#2017;Min Pool Size=5;Max Pool Size=300;Connection Lifetime=120;";
        //public OracleConnection con = new OracleConnection(connectString + CommonConst.LICENSE_KEY);

        //public bool TestAction()
        //{
        //    string[] parameters = new string[] { "param1", "param2" };
        //    object[] values = new object[] { 1, "ab" };
        //    return ExecSQL("GetTest4 ", parameters, values);
        //}
        //public DataTable TestQueryText()
        //{
        //    return Query(@"select *
        //      from PACK_PACKAGE");
        //}
        //public DataTable TestQueryProNoParam()
        //{
        //    return GetDataTable("GetTest8");
        //}
        //public DataTable TestQueryProParam()
        //{
        //    string[] parameters = new string[] { "param1", "param2" };
        //    object[] values = new object[] { 1, "ab" };
        //    DataTable dtList_Price = GetDataTable("GetTest9", parameters, values);
        //    return dtList_Price;
        //}

        //public bool ExecSQL(string storeName, string[] parameters, object[] values)
        //{
        //    OracleCommand command = this.con.CreateCommand();
        //    command.CommandText = storeName;
        //    command.CommandType = CommandType.StoredProcedure;
        //    for (int index = 0; index < parameters.Length; ++index)
        //    {
        //        OracleParameter oracleParameter = new OracleParameter();
        //        oracleParameter.Direction = ParameterDirection.Input;
        //        oracleParameter.ParameterName = parameters[index];
        //        //oracleParameter.OracleType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleType.Number : OracleType.VarChar) : OracleType.DateTime;
        //        oracleParameter.OracleDbType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleDbType.Integer : OracleDbType.VarChar) : OracleDbType.Date;
        //        oracleParameter.Value = values[index];
        //        command.Parameters.Add(oracleParameter);
        //    }
        //    this.con.Open();
        //    try
        //    {
        //        command.ExecuteNonQuery();
        //        this.con.Close();
        //        return true;
        //    }
        //    catch
        //    {
        //        this.con.Close();
        //        return false;
        //    }
        //}
        //public DataTable Query(string query)
        //{
        //    con.Open();
        //    OracleCommand command = this.con.CreateCommand();
        //    command.CommandText = query;
        //    OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
        //    DataTable dataTable = new DataTable();
        //    oracleDataAdapter.Fill(dataTable);
        //    this.con.Close();
        //    return dataTable;
        //}
        //public DataTable GetDataTable(string storeName)
        //{
        //    OracleCommand command = this.con.CreateCommand();
        //    command.CommandText = storeName;
        //    command.CommandType = CommandType.StoredProcedure;
        //    //OracleParameter oracleParameter = new OracleParameter();
        //    //oracleParameter.Direction = ParameterDirection.Output;
        //    ////oracleParameter.OracleType = OracleType.Cursor;
        //    //oracleParameter.OracleDbType = OracleDbType.Cursor;
        //    //oracleParameter.ParameterName = "P_RETURNCUR";
        //    //command.Parameters.Add(oracleParameter);
        //    OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
        //    DataTable dataTable = new DataTable();
        //    oracleDataAdapter.Fill(dataTable);
        //    this.con.Close();
        //    return dataTable;
        //}
        //public DataTable GetDataTable(string storeName, string[] parameters, object[] values)
        //{
        //    OracleCommand command = this.con.CreateCommand();
        //    command.CommandText = storeName;
        //    command.CommandType = CommandType.StoredProcedure;
        //    for (int index = 0; index < parameters.Length; ++index)
        //    {
        //        OracleParameter oracleParameter = new OracleParameter();
        //        oracleParameter.Direction = ParameterDirection.Input;
        //        oracleParameter.ParameterName = parameters[index];
        //        if (values[index] is int)
        //            //oracleParameter.OracleType = OracleType.Number;
        //            oracleParameter.OracleDbType = OracleDbType.Integer;
        //        else if (values[index] is string)
        //            //oracleParameter.OracleType = OracleType.VarChar;
        //            oracleParameter.OracleDbType = OracleDbType.VarChar;
        //        else if (values[index] is DateTime)
        //            //oracleParameter.OracleType = OracleType.DateTime;
        //            oracleParameter.OracleDbType = OracleDbType.Date;
        //        oracleParameter.Value = values[index];
        //        command.Parameters.Add(oracleParameter);
        //    }
        //    //OracleParameter oracleParameter1 = new OracleParameter();
        //    //oracleParameter1.Direction = ParameterDirection.Output;
        //    ////oracleParameter1.OracleType = OracleType.Cursor;
        //    //oracleParameter1.OracleDbType = OracleDbType.Cursor;
        //    //oracleParameter1.ParameterName = "P_RETURNCUR";
        //    //command.Parameters.Add(oracleParameter1);
        //    OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
        //    DataTable dataTable = new DataTable();
        //    oracleDataAdapter.Fill(dataTable);
        //    this.con.Close();
        //    return dataTable;
        //}



        #region Function Order hàng
        [HttpPost]
        public JsonResult GetLoginInfo(string username, string password)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                Login_DL lg = new Login_DL();
                msg.Object = lg.GetLogin(username, password);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult GetCustomerOfUser(int UseID)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetCustomerOfUser(UseID);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public JsonResult GetVehicleList(int customer_id, int ou_id1)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                SMSDL bl = new SMSDL();
                msg.Object = bl.GetVehicleList(customer_id, ou_id1);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetBranch(int customer_id, int user_id, int ou_id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                SMSDL bl = new SMSDL();
                msg.Object = bl.GetBranch(customer_id, user_id, ou_id);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delivery_Code_Info(string DeliveryCodeList)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                SMSDL bl = new SMSDL();
                msg.Object = bl.Delivery_Code_Info(DeliveryCodeList);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetAreaCode(int customer_id, int ou_id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                SMSDL bl = new SMSDL();
                msg.Object = bl.GetAreaCode(customer_id, ou_id);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult GetCustomerInfo(int UseID, int CustomerID, int oui)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                SMSDL bl = new SMSDL();
                msg.Object = bl.GetCustomerInfo(UseID, CustomerID, oui);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListItemInAreaContract(int area_id, int customer_id, int contract_id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                SMSDL bl = new SMSDL();
                msg.Object = bl.GetListItemInAreaContract(area_id, customer_id, contract_id);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult CreateSO(int CustomerID, int UseID, int oui, int ItemID, string bienso, string diaban, double soluong, string cn1)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var DeliveryCode = "";
                msg.Object = CreateSOFunc(CustomerID, UseID, oui, ItemID, bienso, diaban, soluong, cn1, out DeliveryCode);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Lỗi exception: " + ex.Message;
            }
            return Json(msg);
        }

        public string CreateSOFunc(int CustomerID, int UseID, int oui, int ItemID, string bienso, string diaban, double soluong, string cn1, out string DeliveryCode)
        {
            string messeger = "";
            DeliveryCode = "";
            try
            {
                SMSDL bl = new SMSDL();
                SaleOrder so = new SaleOrder();
                SaleOrder so1 = new SaleOrder();


                VCCustomer cust = new VCCustomer();
                Contract contr = new Contract();
                // B1 la thong tin userID, Customer_ID, org_id
                cust = bl.GetCustomerInfo(UseID, CustomerID, oui);
                DataTable dtContract = cust.contracts;
                // B2 lay thong tin hop dong ok
                so.user_id = UseID;
                so.customer_id = CustomerID;
                so.status = "BOOKED";
                so.quantity = soluong;
                so.print_status = "PENDING";
                so.discount = 0;
                so.order_type = 1;
                so.order_date = bl.GetOrderDate();
                so.promo_flag = "Y";
                so.production_line = bl.GetItemLine(CustomerID, ItemID, oui);
                so.blanket_id = Convert.ToInt32(dtContract.Rows[0]["HEADER_ID"]);

                if (bl.diabanSMS(diaban) == "NO")
                {
                    messeger = "Sai địa bàn";
                    goto thoat;
                }
                else
                {
                    so.area_id = Convert.ToInt32(bl.diabanSMS(diaban));
                    so.location_code = diaban;
                }


                if (bl.KTSPTHEODIABAN(so.area_id, CustomerID, oui, so.blanket_id, "", ItemID) == "NO")
                {

                    messeger = "Sản phẩm không phù hợp với địa bàn";
                    goto thoat;
                }
                else
                {
                    so.inventory_item_id = Convert.ToInt32(bl.KTSPTHEODIABAN(so.area_id, CustomerID, oui, so.blanket_id, "", ItemID));
                }

                DataTable checkpoint = bl.GetCheckpointByAreaID_2(so.area_id, CustomerID);

                if (checkpoint.Rows.Count > 0)
                {
                    so.checkpoint_id = Convert.ToInt32(checkpoint.Rows[0]["CHECKPOINT_ID"]);
                }
                else
                {
                    messeger = "Điểm giao hàng không phù hợp";
                    goto thoat;
                }

                DataTable tranport = bl.GetTransportMethod(so.checkpoint_id);

                // fix loi ngay 26/01/2018
                if (tranport.Rows.Count > 0)
                {
                    so.transport_method_id = Convert.ToInt32(tranport.Rows[0]["TRANSPORT_METHOD_ID"]);
                }
                else
                {
                    messeger = "Phương thức vận chuyển không đúng";
                    goto thoat;
                }

                DataTable ship_to_org_id = cust.shiptolocation;

                so.ship_to_org_id = Convert.ToInt32(ship_to_org_id.Rows[0]["SITE_USE_ID"]);
                DataTable billto = cust.billtolocation;

                so.invoice_to_org_id = Convert.ToInt32(billto.Rows[0]["SITE_USE_ID"]);
                DataTable organization = bl.GetWareHouse(ItemID, UseID);

                so.ship_from_org_id = Convert.ToInt32(organization.Rows[0]["ORGANIZATION_ID"]);

                DataTable dongia = bl.GetPriceList(ItemID, oui, CustomerID, so.blanket_id, so.ship_from_org_id, "TAN", so.checkpoint_id, 0, "1");

                so.unit_price = Convert.ToDouble(dongia.Rows[0]["operand"].ToString().Replace(".", ","));// number fomat
                so.price_list_id = Convert.ToInt32(dongia.Rows[0]["PRICE_LIST_ID"]);
                so.currency_code = dongia.Rows[0]["CURRENCY_CODE"].ToString();


                DataTable shippont = bl.GetShippoint(CustomerID, UseID, oui);


                so.shippoint_id = Convert.ToInt32(shippont.Rows[0]["SHIPPOINT_ID"]);

                double credit_limit = bl.CreditLimit(CustomerID, ItemID, so.blanket_id, oui);

                so.amount = Convert.ToDouble(so.unit_price * soluong);

                if (so.amount > credit_limit)
                {
                    messeger = "Vượt hạn mức";
                    goto thoat;
                }

                DataTable dtUnit_Of_Measure = bl.GetAllUnitOfMeasures(ItemID);
                so.uom_code = dtUnit_Of_Measure.Rows[0]["UOM_CODE"].ToString();

                if (bl.KTBIENSOXE(CustomerID, oui, bienso) == "NO")
                {
                    messeger = "Biển số xe không đúng";
                    goto thoat;
                }
                so.vehicle_code = bl.KTBIENSOXE(CustomerID, oui, bienso);
                DataTable dtVihcle = bl.GetVehicleList(CustomerID, oui);

                so.driver_name = dtVihcle.Rows[0]["DRIVER_NAME"].ToString();

                so.description = bl.GetOrderDescription(ItemID, 1, "");

                so.doc_series = bl.GetDocSeries(so.shippoint_id);
                so.receiver_id = Convert.ToInt32("0");
                so.doc_num = "";
                so.lot_number = "";
                so.driver_info = "";
                so.ex_customer_id = Convert.ToInt32("-1");
                so.ex_unit_price = Convert.ToInt32("-1");
                so.tax_amount = Convert.ToInt32("0");
                so.pack_type = "";
                so.bag_type = "";
                so.mooc_code = "";
                so.doc_template = "";

                so.branch_id = Convert.ToInt32(bl.GetBranchSMS(CustomerID, UseID, oui, cn1));

                DeliveryCode = bl.Create_SO(so);
                if (DeliveryCode == "CreateSo Error")
                {
                    messeger = DeliveryCode;
                    DeliveryCode = "";
                }
                thoat:;
            }
            catch (Exception ex) { messeger = "CreateSO Error :" + ex.Message; }
            return messeger;
        }


        //[HttpPost]
        //public JsonResult GetContractInfo(int contract_id, string item_type)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetContractInfo(contract_id, item_type);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetNearVehicleCode(int customer_id = 1107)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetNearVehicleCode(customer_id);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetAllCustomers(int user_id = 2330, int ou_id1 = 82)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetAllCustomers(user_id, ou_id1);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetAllItems()
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetAllItems();
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetDrivers(int customer_id = 1107)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetDrivers(customer_id);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult diabanSMS(string code)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.diabanSMS(code);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetListItemInContract(int customer_id = 1107, int contract_id = 328089)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        SMSDL bl = new SMSDL();
        //        msg.Object = bl.GetListItemInContract(customer_id, contract_id);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = "Lỗi exception: " + ex.Message;
        //    }
        //    return Json(msg);
        //}
        #endregion

        #region CKEDITOR
        [HttpGet]
        public JsonResult Token(IFormFile fileUpload)
        {
            var msg = string.Empty;
            msg = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImU3OTg4MjBmLTc3YzktNGUxYy1hMGQ3LWZkMjJmMWEyYTIwMyIsImlhdCI6MTU4NDY3Njg2NSwiZXhwIjoxNTg0NjgwNDY1fQ.zz8mRPpZ4ZKx1jsnBmlv7s4Ez7EN4IYbLrLu3mDu2MU";
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UploadFile(IFormFile file)
        {
            var path = string.Empty;

            var upload = _uploadService.UploadFile(file, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images\\"));
            var filename = file.FileName.Split(".");
            if (!upload.Error)
            {
                var filePath = "http://" + Request.Host.Value + "/uploads/images/" + upload.Object.ToString();
                path = "{\r\n\"600\": \"" + filePath + "\"\r\n}";
            }

            var json = JObject.Parse(path);
            return Json(json);
        }

        //[HttpPost]
        //public JsonResult Upload(IFormFile upload)
        //{
        //    var rs = new Image();

        //    var uploadRs = _uploadService.UploadFile(upload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images\\"));
        //    var filename = upload.FileName.Split(".");
        //    if (!uploadRs.Error)
        //    {
        //        rs.fileName = upload.FileName;
        //        rs.uploaded = 1;
        //        rs.url = "http://" + Request.Host.Value + "/uploads/images/" + uploadRs.Object.ToString();
        //    }
        //    return Json(rs);
        //}

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult Upload(IFormFile upload, string ckCsrfToken)
        {
            var rs = new Image();

            //Check file video
            if (upload.ContentType.Contains("video"))
            {
                string[] listExtensionVideo = { ".mp4", ".avi" };

                var extension = Path.GetExtension(upload.FileName).ToLower();

                if (!listExtensionVideo.Any(p => p.Equals(extension)))
                {
                    return Json(rs);
                }

                var uploadRs = _uploadService.UploadFile(upload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\"));
                var filename = upload.FileName.Split(".");
                if (!uploadRs.Error)
                {
                    rs.fileName = upload.FileName;
                    rs.uploaded = 1;
                    rs.url = "https://" + Request.Host.Value + "/uploads/files/" + uploadRs.Object.ToString();
                }
            }
            else
            {
                var uploadRs = _uploadService.UploadFile(upload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\"));
                var filename = upload.FileName.Split(".");
                if (!uploadRs.Error)
                {
                    rs.fileName = upload.FileName;
                    rs.uploaded = 1;
                    rs.url = "https://" + Request.Host.Value + "/uploads/files/" + uploadRs.Object.ToString();
                }
            }
            
            return Json(rs);
        }

        #endregion
    }

    public class Image
    {
        public string fileName { get; set; }
        public int uploaded { get; set; }
        public string url { get; set; }
    }
    public class WorkPlanRes
    {
        public string Username { get; set; }
        public string WpCode { get; set; }
    }

    public class WorkPlanInsert
    {
        public int? Id { get; set; }
        public int? WeekNo { get; set; }
        public string username { get; set; }
        public string WpCode { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }

        //public string StatusCode { get; set; }

        public List<SettingRouteModel> list_detail { get; set; }
    }
    public class WorkPlanDetail
    {
        public string WpCode { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }

        public string StatusCode { get; set; }
        public string StatusName { get; set; }

        public List<SettingRouteModel> list_detail { get; set; }
    }
    public class SettingRouteModel
    {
        public string sltNode { get; set; }
        public string txtTime { get; set; }
        public string taNote { get; set; }
        public string NameNode { get; set; }
        public string Address { get; set; }
    }
    public class RouteModelInsert
    {
        public string Gps { get; set; }
        public string RouteCode { get; set; }
        public string Username { get; set; }
        public decimal? TotalCanImp { get; set; }
        public decimal? Proportion { get; set; }
        public string Note { get; set; }
        public List<CustomerModelInsert> ListDetail { get; set; }
    }
    public class CustomerModelInsert
    {
        public string BrandCode { get; set; }
        public string BrandName { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal? BuyCost { get; set; }
        public decimal? SaleCost { get; set; }
        public decimal? ConsumpMonthly { get; set; }
        public decimal? Instock { get; set; }

    }
    public class CustomerLastMonthModelInsert
    {
        public string Username { get; set; }
        public string CusCode { get; set; }
        public string YearMonth { get; set; }
        public List<CustomerDetailLastMonthModelInsert> ListDetail { get; set; }
    }
    public class CustomerDetailLastMonthModelInsert
    {
        public string BrandCode { get; set; }
        public string BrandName { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal? ConsumpMonthly { get; set; }
        public decimal? Instock { get; set; }

    }
    public class CustomerCareInsert : CustomerDeclareInfoInsert
    {
        public int? Id { get; set; }
        public string RouteCode { get; set; }
    }
    public class CustomerDeclareInfoInsert
    {
        public string Username { get; set; }
        public decimal? Proportion { get; set; }
        public string BrandCode { get; set; }
        public string ProductCode { get; set; }
        public decimal? BuyCost { get; set; }
        public decimal? SaleCost { get; set; }
        public decimal? ConsumpMonthly { get; set; }
        public decimal? Instock { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Note { get; set; }
    }
    public class CustomerCareDelete : CustomerDeclareInfoDelete
    {
        public string RouteCode { get; set; }
    }
    public class CustomerDeclareInfoDelete
    {
        public string Username { get; set; }
        public string BrandCode { get; set; }
        public string ProductCode { get; set; }
    }

    public class JMessageWp : JMessage
    {
        public string MaxTodate { get; set; }
    }
    public class JMessageSOS : JMessage
    {
        public int Count { get; set; }
    }
    public class JMessageRoute : JMessage
    {
        public decimal? Proportion { get; set; }
        public decimal? TotalCanImp { get; set; }
        public string Note { get; set; }
        public string CheckinTime { get; set; }
        public string CheckoutTime { get; set; }


    }

    public class VcStoreIdeaInsert
    {
        public int? Id { get; set; }
        public string Username { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string UrlPicture { get; set; }
        public int? Order { get; set; }
    }
    public class JMessageWpPending : JMessage
    {
        public int CountPending { get; set; }
    }
    public class VcMyGisSearch
    {
        public string UserName { get; set; }
        public int Page { get; set; }
        public int Length { get; set; }
    }
    public class GisModel
    {
        public GisModel()
        {
            //List = new List<NodeGis>();
        }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Parent { get; set; }
        public string Type { get; set; }
        public string CreatedBy { get; set; }
        public string List1 { get; set; }
        public List<NodeGis> List { get; set; }
    }
    public class NodeGis
    {
        public float Lat { get; set; }
        public float Lng { get; set; }
    }
    public class GisObject
    {
        public GisObject()
        {
            type = "";
            properties = new GisPropertise();
            geometry = new Geometry();
        }
        public string type { get; set; }
        public GisPropertise properties { get; set; }
        public Geometry geometry { get; set; }
    }
    public class GisPropertise
    {

        public int ID_0 { get; set; }
        public string ISO { get; set; }
        public string NAME_0 { get; set; }
        public int ID_1 { get; set; }
        public string NAME_1 { get; set; }
        public int ID_2 { get; set; }
        public string NAME_2 { get; set; }
        public string HASC_2 { get; set; }
        public int CCN_2 { get; set; }
        public string TYPE_2 { get; set; }
        public string ENGTYPE_2 { get; set; }
        public string VARNAME_2 { get; set; }
    }
    public class Geometry
    {
        public Geometry()
        {
            type = "";
            coordinates = new List<List<List<double>>>();
            coordinates.Add(new List<List<double>>());
        }
        public string type { get; set; }
        public List<List<List<double>>> coordinates { get; set; }
    }
    public class Map
    {
        public MapProperties properties { get; set; }
        public List<List<List<double>>> gis_data { get; set; }
    }
    public class MapProperties
    {
        public string fill_color { get; set; }
        public string text { get; set; }
        public string font_size { get; set; }

    }

    public class ModelCustomerInsert
    {
        public string CusCode { get; set; }
        public string CusName { get; set; }
        public string Address { get; set; }
        public string MobilePhone { get; set; }
        public string GoogleMap { get; set; }
        public string CreatedBy { get; set; }
        public string Area { get; set; }
        public List<ModelListSupplier> ListSupplier { get; set; }
    }
    public class ModelListSupplier
    {
        public string Seller { get; set; }
        public string SellerName { get; set; }
        public string Brand { get; set; }
        public string BrandName { get; set; }
    }
    public class AppVersion
    {
        public string AppNumber { get; set; }
        public string VersionCode { get; set; }
    }
}