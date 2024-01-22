using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Wordprocessing;
using ESEIM.Models;
using ESEIM.Utils;
using Google.Apis.Auth.OAuth2;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Quartz;

namespace III.Admin.Utils
{
    public class CheckAppStatusJob : IJob
    {
        private readonly ILogger<SendNotiJob> _logger;
        private readonly IFCMPushNotification _notification;
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        public CheckAppStatusJob(
            IFCMPushNotification notification,
            EIMDBContext context,
            ILogger<SendNotiJob> logger,
            IHostingEnvironment hostingEnvironment)
        {
            _logger = logger;
            _context = context;
            _notification = notification;
            _hostingEnvironment = hostingEnvironment;
        }

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public async Task Execute(IJobExecutionContext context)
        {
            var appVersion = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "APP_VERSION");
            log.Info($"Check Google Store App Status");
            Debug.WriteLine("Check Google Store App Status!");
            var keyFilePath = _hostingEnvironment.WebRootPath + "\\files\\pc-api-8470030699263625666-948-10c729a8d21e.json";
            var service = new GooglePlayService();
            GoogleCredential credential = null;
            try
            {
                credential = await service.GetGoogleCredentialAsync(keyFilePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                //return;
            }
            var latestVersionCode = appVersion?.ValueSet ?? "1";
            bool checkAndroidApprove = false;
            if (credential != null)
            {
                try
                {
                    checkAndroidApprove = await service.CheckIfVersionIsLive(credential,
                    "Smart Work", "com.iii.SmartWork", int.Parse(latestVersionCode));
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    //return;
                } 
            }
            if (checkAndroidApprove)
            {
                log.Info($"Latest version {appVersion?.Title} is published");
                Debug.WriteLine($"Latest version {appVersion?.Title} is published");
                var appVersionAndroid = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "APP_VERSION_ANDROID");
                if (appVersionAndroid != null)
                {
                    appVersionAndroid.ValueSet = appVersion.ValueSet;
                    appVersionAndroid.Title = appVersion.Title;
                }
                await _context.SaveChangesAsync();
            }
            bool checkAppleApprove = false;
            var parser = new AppleEmailParser();
            var latestVersion = appVersion?.Title ?? "1.0";
            try
            {
                checkAppleApprove = await parser.CheckIfVersionIsLive(latestVersion);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return;
            }
            if (checkAppleApprove)
            {
                log.Info($"Latest version {appVersion?.Title} is published");
                Debug.WriteLine($"Latest version {appVersion?.Title} is published");
                var appVersionApple = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == "APP_VERSION_APPLE");
                if (appVersionApple != null)
                {
                    appVersionApple.ValueSet = appVersion.ValueSet;
                    appVersionApple.Title = appVersion.Title;
                }
                await _context.SaveChangesAsync();
            }
            return;
        }
    }
}
