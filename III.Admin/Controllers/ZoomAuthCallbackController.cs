using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    public class ZoomAuthCallbackController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<TokenManagerController> _stringLocalizer;
        public ZoomAuthCallbackController(EIMDBContext context,
            IStringLocalizer<TokenManagerController> stringLocalizer)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
        }

        private static JMessage zoomResult;
        public IActionResult Index(string code, string state)
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
                    //SetHotKey(data, hostKey);
                }
            }
            return View();
        }

        //private void SetHotKey(TokenManager check, string hostKey)
        //{
        //    var result = CommonUtil.RefreshZoomToken(check.Key, check.ApiSecret, check.RefreshToken);
        //    if (result.ZoomAuth != null && !string.IsNullOrEmpty(result.ZoomAuth.RefreshToken))
        //    {
        //        check.Token = result.ZoomAuth.AccessToken;
        //        check.RefreshToken = result.ZoomAuth.RefreshToken;
        //        _context.TokenManagers.Update(check);
        //    }
        //    else
        //    {
        //        var zoomError = new ZoomReportError
        //        {
        //            ErrorContent = result.ErrorContent,
        //            CreatedBy = User.Identity.Name,
        //            CreatedTime = DateTime.Now
        //        };
        //        _context.ZoomReportErrors.Add(zoomError);
        //        _context.SaveChanges();
        //    }
        //    var msg2 = CommonUtil.SetHostKey(check.Token, hostKey);

        //    if (msg2.Error)
        //    {
        //        msg2.Error = true;
        //        if (msg2.Object != null && msg2.Object.ToString() == "ERROR_USER_ID")
        //        {
        //            msg2.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_NO_USER_ID"];
        //        }
        //        if (msg2.Object != null && msg2.Object.ToString() == "ERROR_TOKEN_INVALID")
        //        {
        //            msg2.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_TOKEN_INVALID"];
        //        }
        //        if (msg2.Object != null && msg2.Object.ToString() == "ERROR_CONNECT_ZOOM")
        //        {
        //            msg2.Title = _stringLocalizer["TOKEN_MANAGER_ZOOM_ERR_CONNECT"];
        //        }
        //        var zoomError = new ZoomReportError
        //        {
        //            ErrorContent = msg2.Title,
        //            CreatedBy = User.Identity.Name,
        //            CreatedTime = DateTime.Now
        //        };
        //        _context.ZoomReportErrors.Add(zoomError);
        //    }
        //}
    }
}
