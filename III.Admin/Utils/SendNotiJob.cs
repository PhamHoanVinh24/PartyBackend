using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Wordprocessing;
using ESEIM.Models;
using ESEIM.Utils;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Quartz;

namespace III.Admin.Utils
{
    [DisallowConcurrentExecution]
    public class SendNotiJob : IJob
    {
        private readonly ILogger<SendNotiJob> _logger;
        private readonly IFCMPushNotification _notification;
        private readonly EIMDBContext _context;
        public SendNotiJob(
            IFCMPushNotification notification, EIMDBContext context,
            ILogger<SendNotiJob> logger
            )
        {
            _logger = logger;
            _context = context;
            _notification = notification;
        }

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        //public Task Execute(IJobExecutionContext context)
        //{
        //    log.Info($"Check Send Noti");
        //    Debug.WriteLine("Check Noti!");
        //    var timeNow = DateTime.Now;
        //    var timeWarning = timeNow.AddMinutes(10);
        //    var listUpcomingSchedule = _context.LmsTutoringSchedules.Where(x =>
        //        x.StartTime.HasValue && x.StartTime.Value >= timeNow && x.StartTime <= timeWarning).ToList();
        //    foreach (var item in listUpcomingSchedule)
        //    {
        //        var listUserId = (from a in item.ListUserObject.Where(x => x.status == "APPROVED" || x.status == null)
        //                          join b in _context.Users on a.userName equals b.UserName
        //                          select new UserIdModel { UserId = b.Id }).ToList();
        //        var teacher = _context.Users.FirstOrDefault(x => x.UserName == item.Teacher);

        //        if (teacher != null)
        //        {
        //            listUserId.Add(new UserIdModel { UserId = teacher.Id });
        //        }
        //        if (item.StartTime != null)
        //        {
        //            var remainMinutes = item.StartTime.Value - timeNow;
        //            var message = $"Khóa học {item.Title} sắp diễn ra trong {remainMinutes.Minutes} phút nữa";
        //            log.Info($"Khóa học {item.Title} sắp diễn ra trong {remainMinutes.Minutes} phút nữa");
        //            log.Info($"Danh sách người nhận {string.Join(", ", listUserId.Select(x => x.UserId))}");
        //            SendPushNotification(listUserId,
        //                message,
        //                item, EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromTutoring), "", "METALEARN");
        //        }
        //    }
        //    return Task.CompletedTask;
        //}
        public async Task Execute(IJobExecutionContext context)
        {
            log.Info($"Check Send Noti WeekWorking");
            Debug.WriteLine("Check Noti WeekWorking!");
            var timeNow = DateTime.Now;
            var timeWarning = timeNow.AddMinutes(10);
            var listUpcomingSchedule = _context.WorkingSchedules.Where(x =>
                x.StartDate >= timeNow && x.StartDate <= timeWarning).ToList();
            foreach (var item in listUpcomingSchedule)
            {
                var listUserId = (from a in JsonConvert
                            .DeserializeObject<List<GridModelWsUserApproved>>(item.ListUserApproved)
                                  join b in _context.Users on a.userName equals b.UserName
                                  select new UserIdModel { UserId = b.Id }).ToList();

                var remainMinutes = item.StartDate - timeNow;
                var message = $"{item.Content} sắp diễn ra trong {remainMinutes.Minutes} phút nữa";
                log.Info($"{item.Content} sắp diễn ra trong {remainMinutes.Minutes} phút nữa");
                log.Info($"Danh sách người nhận {string.Join(", ", listUserId.Select(x => x.UserId))}");
                await SendPushNotification(listUserId,
                    message,
                    item, EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromWeekWorking), "", "SMARTWORK");
                SendMailToUsers(listUserId, item.WorkContent, "");
            }
            return;
        }
        [NonAction]
        public void SendMailToUsers(List<UserIdModel> listUserId, string message, string createdBy)
        {
            if (listUserId != null && listUserId.Any())
            {
                var query = (from a in listUserId
                             join c in _context.Users on a.UserId equals c.Id
                             where c.Active == true && c.UserName != createdBy
                             // remove sender from the receiver list
                             select new
                             {
                                 Email = c.Email,
                                 UserId = a.UserId
                             }).ToList().DistinctBy(x => x.Email).ToList();
                if (query.Any())
                {
                    for (int i = 0; i < query.Count; i++)
                    {
                        var result = CommonUtil.SendMailHtml("vietnamtopapp@gmail.com", query[i].Email, "Smartwork system", message, "smtp.gmail.com", 587, "vietnamtopapp@gmail.com", "jytvlwhgusorvbyx");
                    }
                }
            }
        }
        [NonAction]
        public async Task<int> SendPushNotification(List<UserIdModel> listUserId, string message, object data, string fromSrc, string createdBy, string appName = "SMARTWORK")
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
                log.Info($"Count Query Send Noti {query.Count()}");
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
                                var sendNotication = _notification.SendNotification("Thông báo", message, listDevices, data, fromSrc, ESEIM.AppContext.UserName);
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
                            var sendNotication =
                                _notification.SendNotification("Thông báo", message, query.ToList(), data, fromSrc, ESEIM.AppContext.UserName);
                        }
                        else if (appName == "METALEARN")
                        {
                            log.Info($"Check Send Noti Meta Learn");
                            var sendNotication =
                                _notification.SendNotificationMeta("Thông báo", message, query.ToList(), data, fromSrc);
                        }
                    }
                }
            }
            return 1;
        }

        public class GridModelWsUserApproved
        {
            public string userName { get; set; }
            public string status { get; set; }
        }
    }
}
