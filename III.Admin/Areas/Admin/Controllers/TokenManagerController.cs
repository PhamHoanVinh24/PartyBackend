using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Spreadsheet;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Google.Apis.Auth.OAuth2.Responses;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using static III.Admin.Controllers.ContractController;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class TokenManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<TokenManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly AppSettings _appSettings;

        public TokenManagerController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<TokenManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IOptions<AppSettings> appSettings)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _appSettings = appSettings.Value;
        }
        [Breadcrumb("ViewData.CrumbTokenManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AllowAnonymous]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["CrumbTokenManager"] = _sharedResources["COM_CRUMB_TOKEN_MANAGER"];
            return View();
        }
        #region JTable
        public class JTableModelApiGoogleServices : JTableModel
        {
            public string Email { get; set; }
            public string AccountName { get; set; }
        }
        [AllowAnonymous]
        [HttpPost]
        public object JTable([FromBody] JTableModelApiGoogleServices jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.TokenManagers.Where(x => !string.IsNullOrEmpty(x.ServiceType) /*&& x.ServiceType.Equals("ZOOM_ACCOUNT")*/)
                        where (string.IsNullOrEmpty(jTablePara.Email) || a.Email.ToLower().Contains(jTablePara.Email.ToLower()))
                           && (string.IsNullOrEmpty(jTablePara.AccountName) || a.AccountName.ToLower().Contains(jTablePara.AccountName.ToLower()))
                        select new
                        {
                            a.Id,
                            Email = a.Email,
                            a.Key,
                            a.ServiceType,
                            a.ApiSecret,
                            a.Token,
                            a.AccountNumber,
                            AccountCode = a.AccountCode,
                            //a.Group,
                            AccountName = a.AccountName,
                            a.Type
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Email", "Key", "ServiceType", "ApiSecret", "Token", "AccountNumber", "AccountCode", "Group", "AccountName", "Type");
            return Json(jdata);
        }
        #region Insert Action
        [AllowAnonymous]
        [HttpPost]
        public JsonResult Insert([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            switch (obj.ServiceType)
            {
                case "ZOOM_ACCOUNT":
                    msg = InsertZoomToken(obj);
                    break;
                case "GOOGLE_ACCOUNT":
                    msg = InsertGoogleToken(obj);
                    break;
                default:
                    msg = InsertCustomToken(obj);
                    break;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage InsertCustomToken([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.Email.Equals(obj.Email));
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.TokenManagers.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_ADD_TOKEN_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage InsertZoomToken([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(obj.Email));
                if (checkExist == null)
                {
                    msg = CommonUtil.GetUserId(obj.Token);

                    if (msg.Error || msg.Object == null)
                    {
                        msg.Error = true;
                        if (msg.Object != null && msg.Object.ToString() == "ERROR_USER_ID")
                        {
                            msg.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_NO_USER_ID"];
                        }
                        if (msg.Object != null && msg.Object.ToString() == "ERROR_TOKEN_INVALID")
                        {
                            msg.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_TOKEN_INVALID"];
                        }
                        if (msg.Object != null && msg.Object.ToString() == "ERROR_CONNECT_ZOOM")
                        {
                            msg.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_ERR_CONNECT"];
                        }
                        return msg;
                    }
                    if (msg.Object != null)
                    {
                        obj.AccountCode = msg.Object.ToString();
                        msg.Object = null;
                    }

                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.TokenManagers.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_ADD_TOKEN_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage GetGoogleCredential([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = new TokenManager();
            try
            {
                var uri = _appSettings.UrlMain + "GoogleAuthCallback";
                var checkExist = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("GOOGLE_ACCOUNT") && x.Email.Equals(obj.Email));
                int tokenId;
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.TokenManagers.Add(obj);
                    _context.SaveChanges();
                    tokenId = obj.Id;
                }
                else
                {
                    tokenId = checkExist.Id;
                };
                data = _context.TokenManagers.FirstOrDefault(x => x.Id == tokenId);
                msg = FileExtensions.GetGoogleCredentialServer(obj.CredentialsJson, _hostingEnvironment.WebRootPath + "\\files\\token.json", obj.Email, uri);
                var result = (GoogleAuthorizationCodeWebAppResult)msg.Object;
                if (data != null)
                {
                    data.AccountName = obj.AccountName;
                    data.AccountRole = obj.AccountRole;
                    data.AccountNumber = obj.AccountNumber;
                    data.Token = obj.Token;
                    data.ApiSecret = obj.ApiSecret;
                    data.Type = obj.Type;
                    data.SdkKey = obj.SdkKey;
                    data.SdkSecret = obj.SdkSecret;
                    data.RefreshToken = obj.RefreshToken;
                    data.CredentialsJson = obj.CredentialsJson;
                    data.AccountCode = result.State;
                    data.Key = uri;
                    msg.Object = result.RedirectUri;
                    _context.TokenManagers.Update(data);
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                if (msg.Object.ToString() == "CREDENTIAL_ERROR")
                {
                    if (data != null) _context.TokenManagers.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_FAILED_TO_GET_CREDENTIAL"];
                }
                return msg;
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage GetZoomCredential([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = new TokenManager();
            try
            {
                var uri = _appSettings.UrlMain + "ZoomAuthCallback";
                var checkExist = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(obj.Email));
                int tokenId;
                if (checkExist == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.TokenManagers.Add(obj);
                    _context.SaveChanges();
                    tokenId = obj.Id;
                }
                else
                {
                    tokenId = checkExist.Id;
                };
                data = _context.TokenManagers.FirstOrDefault(x => x.Id == tokenId);
                msg = CommonUtil.GetAuthorizationCode(obj.Key, uri, tokenId.ToString());
                var result = msg.Object.ToString();
                if (data != null)
                {
                    data.AccountName = obj.AccountName;
                    data.AccountRole = obj.AccountRole;
                    data.AccountNumber = obj.AccountNumber;
                    data.Token = obj.Token;
                    data.Key = obj.Key;
                    data.ApiSecret = obj.ApiSecret;
                    data.Type = obj.Type;
                    data.SdkKey = obj.SdkKey;
                    data.SdkSecret = obj.SdkSecret;
                    data.RefreshToken = obj.RefreshToken;
                    data.CredentialsJson = obj.CredentialsJson;
                    data.HostClaimCode = obj.HostClaimCode;
                    data.AccountCode = uri;
                    msg.Object = result;
                    _context.TokenManagers.Update(data);
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //if (msg.Object.ToString() == "CREDENTIAL_ERROR")
                //{
                //    if (data != null) _context.TokenManagers.Remove(data);
                //    _context.SaveChanges();
                //    msg.Title = _stringLocalizer["TOKEN_MANAGER_FAILED_TO_GET_CREDENTIAL"];
                //}
                return msg;
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage InsertGoogleToken([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("GOOGLE_ACCOUNT") && x.Email.Equals(obj.Email));
                if (checkExist == null)
                {
                    /*obj.AccountCode = googleCredentialObject.AccountCode;
                    obj.RefreshToken = googleCredentialObject.Token;*/
                    msg = FileExtensions.GetGoogleCredentialUserId(obj.CredentialsJson, _hostingEnvironment.WebRootPath + "\\files\\token.json", obj.Email);

                    var googleCredentialObject = (GoogleCredentialObject)msg.Object;
                    obj.AccountCode = googleCredentialObject.ClientId;
                    obj.RefreshToken = googleCredentialObject.RefreshToken;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.TokenManagers.Add(obj);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_ADD_TOKEN_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_EXIST"]; ;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        public class MeetingConfig
        {
            public string ServiceType { get; set; }
            public string Value { get; set; }
        }
        [HttpPost]
        public JMessage InsertMeetingConfig([FromBody] MeetingConfig obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {

                var checkExist1 = _context.TokenManagers.FirstOrDefault(x => x.ServiceType == "AUTO_MEETING");
                if (checkExist1 == null)
                {
                    var obje = new TokenManager();
                    obje.CreatedBy = ESEIM.AppContext.UserName;
                    obje.CreatedTime = DateTime.Now;
                    obje.CredentialsJson = obj.Value;
                    obje.AccountName = "Auto Meeting";
                    obje.ServiceType = obj.ServiceType;

                    _context.TokenManagers.Add(obje);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_ADD_TOKEN_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại lịch";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        [HttpPost]
        public JMessage InsertShiftConfig([FromBody] MeetingConfig obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist1 = _context.TokenManagers.FirstOrDefault(x => x.ServiceType == "MAKE_SHIFT_AUTO");
                if (checkExist1 == null)
                {
                    var obje = new TokenManager();
                    obje.CreatedBy = ESEIM.AppContext.UserName;
                    obje.CreatedTime = DateTime.Now;
                    obje.AccountName = "Make Auto Shift Meeting";
                    obje.CredentialsJson = obj.Value;
                    obje.ServiceType = obj.ServiceType;

                    _context.TokenManagers.Add(obje);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_ADD_TOKEN_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại lịch";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        [HttpPost]
        public JMessage UpdateAutoMeeting([FromBody] MeetingConfig obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {

                var obje = _context.TokenManagers.FirstOrDefault(x => x.ServiceType == "AUTO_MEETING");
                if (obje != null)
                {
                    obje.CredentialsJson = obj.Value;
                    obje.ServiceType = obj.ServiceType;

                    _context.TokenManagers.Update(obje);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công !";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại lịch";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }

        [HttpPost]
        public JMessage UpdateShiftMeeting([FromBody] MeetingConfig obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {

                var obje = _context.TokenManagers.FirstOrDefault(x => x.ServiceType == "MAKE_SHIFT_AUTO");
                if (obje != null)
                {
                    obje.CredentialsJson = obj.Value;
                    obje.ServiceType = obj.ServiceType;

                    _context.TokenManagers.Update(obje);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công !";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại lịch";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        #endregion
        #region Update Action
        [AllowAnonymous]
        [HttpPost]
        public JsonResult Update([FromBody] TokenManager obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            switch (obj.ServiceType)
            {
                case "ZOOM_ACCOUNT":
                    msg = UpdateZoomToken(obj);
                    break;
                case "GOOGLE_ACCOUNT":
                    msg = UpdateGoogleToken(obj);
                    break;
                default:
                    msg = UpdateCustomToken(obj);
                    break;
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage UpdateCustomToken([FromBody] TokenManager obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.Email.Equals(obj.Email));
                if (data != null)
                {
                    data.AccountName = obj.AccountName;
                    data.AccountRole = obj.AccountRole;
                    data.AccountCode = obj.AccountCode;
                    data.AccountNumber = obj.AccountNumber;
                    data.Token = obj.Token;
                    data.ApiSecret = obj.ApiSecret;
                    data.Key = obj.Key;
                    data.Type = obj.Type;
                    data.SdkKey = obj.SdkKey;
                    data.SdkSecret = obj.SdkSecret;

                    _context.TokenManagers.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_UPDATE_TOKEN_SUCCESS"]; ;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage UpdateZoomToken([FromBody] TokenManager obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Email.Equals(obj.Email));
                if (data != null)
                {
                    msg = CommonUtil.GetUserId(obj.Token);

                    if (msg.Error || msg.Object == null)
                    {
                        msg.Error = true;
                        if (msg.Object != null && msg.Object.ToString() == "ERROR_USER_ID")
                        {
                            msg.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_NO_USER_ID"];
                        }
                        if (msg.Object != null && msg.Object.ToString() == "ERROR_TOKEN_INVALID")
                        {
                            msg.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_TOKEN_INVALID"];
                        }
                        if (msg.Object != null && msg.Object.ToString() == "ERROR_CONNECT_ZOOM")
                        {
                            msg.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_ERR_CONNECT"];
                        }
                        return msg;
                    }

                    if (msg.Object != null)
                    {
                        obj.AccountCode = msg.Object.ToString();
                    }

                    data.AccountName = obj.AccountName;
                    data.AccountRole = obj.AccountRole;
                    data.AccountCode = obj.AccountCode;
                    data.AccountNumber = obj.AccountNumber;
                    data.Token = obj.Token;
                    data.ApiSecret = obj.ApiSecret;
                    data.Key = obj.Key;
                    data.Type = obj.Type;
                    data.SdkKey = obj.SdkKey;
                    data.SdkSecret = obj.SdkSecret;

                    _context.TokenManagers.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_UPDATE_TOKEN_SUCCESS"]; ;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        [AllowAnonymous]
        [HttpPost]
        public JMessage UpdateGoogleToken([FromBody] TokenManager obj)
        {
            JMessage msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.TokenManagers.FirstOrDefault(x => !string.IsNullOrEmpty(x.ServiceType) && x.ServiceType.Equals("GOOGLE_ACCOUNT") && x.Email.Equals(obj.Email));
                if (data != null)
                {
                    msg = FileExtensions.GetGoogleCredentialUserId(obj.CredentialsJson, _hostingEnvironment.WebRootPath + "\\files\\token.json", obj.Email);

                    var googleCredentialObject = (GoogleCredentialObject)msg.Object;
                    obj.AccountCode = googleCredentialObject.ClientId;
                    obj.RefreshToken = googleCredentialObject.RefreshToken;

                    data.AccountName = obj.AccountName;
                    data.AccountRole = obj.AccountRole;
                    data.AccountCode = obj.AccountCode;
                    data.AccountNumber = obj.AccountNumber;
                    data.Token = obj.Token;
                    data.ApiSecret = obj.ApiSecret;
                    data.Key = obj.Key;
                    data.Type = obj.Type;
                    data.SdkKey = obj.SdkKey;
                    data.SdkSecret = obj.SdkSecret;
                    data.RefreshToken = obj.RefreshToken;
                    data.CredentialsJson = obj.CredentialsJson;

                    _context.TokenManagers.Update(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_UPDATE_TOKEN_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Object.ToString() == "CREDENTIAL_ERROR" ? _stringLocalizer["TOKEN_MANAGER_FAILED_TO_GET_CREDENTIAL"] : _sharedResources["COM_MSG_ERR"];
            }
            return msg;
        }
        #endregion
        #region ActionCallback
        
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GoogleAuthCallback(string code, string state)
        {
            var data = _context.TokenManagers.FirstOrDefault(x => x.AccountCode == state);
            if (data != null)
            {
                var msg = new JMessage();
                var uri = data.Key;
                msg = FileExtensions.ExchangeCodeForGoogleToken(data.CredentialsJson, _hostingEnvironment.WebRootPath + "\\files\\token.json", data.Email, uri, code).Result;
                if (msg.Object != null)
                {
                    data.RefreshToken = msg.Object.ToString();
                    _context.TokenManagers.Update(data);
                    _context.SaveChanges();
                }
            }
            return View();
        }

        private static JMessage zoomResult;
        [AllowAnonymous]
        [HttpGet]
        public IActionResult ZoomAuthCallback(string code, string state)
        {
            var data = _context.TokenManagers.FirstOrDefault(x => x.Id.ToString() == state);
            if (data != null)
            {
                var msg = new JMessage();
                var uri = data.Key;
                var result = CommonUtil.ExchangeCodeForZoomToken(data.Key, data.ApiSecret, code, data.AccountCode);
                if (result != null)
                {
                    var msg1 = CommonUtil.GetUserId(result.AccessToken);

                    if (msg1.Error || msg1.Object == null)
                    {
                        msg1.Error = true;
                        if (msg1.Object != null && msg1.Object.ToString() == "ERROR_USER_ID")
                        {
                            msg1.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_NO_USER_ID"];
                        }
                        if (msg1.Object != null && msg1.Object.ToString() == "ERROR_TOKEN_INVALID")
                        {
                            msg1.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_TOKEN_INVALID"];
                        }
                        if (msg1.Object != null && msg1.Object.ToString() == "ERROR_CONNECT_ZOOM")
                        {
                            msg1.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_ERR_CONNECT"];
                        }

                        zoomResult = msg1;
                    }
                    if (msg1.Object != null)
                    {
                        data.AccountCode = msg1.Object.ToString();
                        msg1.Object = null;
                    }
                    //var generator = new Random();
                    //var hostKey = generator.Next(0, 1000000).ToString("D6");
                    //data.HostClaimCode = hostKey;
                    data.Token = result.AccessToken;
                    data.RefreshToken = result.RefreshToken;
                    _context.TokenManagers.Update(data);
                    _context.SaveChanges();
                }
            }
            return View();
        }
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GoogleExchangeCallback()
        {
            return View();
        }
        #endregion
        [AllowAnonymous]
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.TokenManagers.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.TokenManagers.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            var data = _context.TokenManagers.FirstOrDefault(x => x.Id == Id);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["TOKEN_MANAGER_TOKEN_NOT_EXIST"];
            }
            return Json(msg);
        }
        #endregion
        [AllowAnonymous]
        [HttpPost]
        public JsonResult GetListService()
        {
            var msg = new JMessage();
            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "SERVICE_TYPE")
                .Select(x => new
                {
                    Code = x.CodeSet,
                    Name = x.Title,
                });
            msg.Object = data;
            return Json(msg);
        }
        #region Language
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

}

