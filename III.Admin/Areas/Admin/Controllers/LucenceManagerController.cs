using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DalSoft.Hosting.BackgroundQueue;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Google.Apis.Auth.OAuth2.Responses;
using III.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Internal;
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
    public class LucenceManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly ILuceneService _luceneService;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<TokenManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly AppSettings _appSettings;
        private readonly BackgroundQueue _backgroundQueue;

        public LucenceManagerController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<TokenManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IOptions<AppSettings> appSettings, ILuceneService luceneService, BackgroundQueue backgroundQueue)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _appSettings = appSettings.Value;
            _luceneService = luceneService;
            _backgroundQueue = backgroundQueue;
        }
        [Breadcrumb("ViewData.CrumbLuceneManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AllowAnonymous]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["CrumbLuceneManager"] = _sharedResources["Quản lý Lucene"];
            return View();
        }
        [HttpPost]
        public object GetStatus()
        {
            _luceneService.TestIndex();
            var info = _luceneService.GetLuceneInfo();
            if (info.IsLuceneRunning)
            {
                return "Đang chạy";
            }
            else if (info.IsLuceneWorking)
            {
                return "Hoạt động";
            }
            else
            {
                return "Không hoạt động";
            }
        }
        [HttpPost]
        public object StartRebuildIndex()
        {
            var msg = new JMessage { Title = "Bắt đầu đánh index!", Error = false };
            try
            {
                _backgroundQueue.Enqueue(async cancellationToken =>
                   {
                       await _luceneService.RebuildIndex();
                   });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }
        [HttpPost]
        public object StopRebuildIndex()
        {
            var msg = new JMessage { Title = "Dừng đánh index!", Error = false };
            try
            {
                _backgroundQueue.Enqueue(async cancellationToken =>
                   {
                       _luceneService.StopIndex();
                   });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
        }
        [HttpPost]
        public object RestartRebuildIndex()
        {
            var msg = new JMessage { Title = "Dừng đánh index!", Error = false };
            try
            {
                _backgroundQueue.Enqueue(async cancellationToken =>
                   {
                       _luceneService.StopIndex();
                       await _luceneService.RebuildIndex();
                   });
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra!";
            }

            return msg;
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

