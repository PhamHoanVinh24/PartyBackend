using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Aspose.Pdf.Operators;
using DocumentFormat.OpenXml.Wordprocessing;
using ESEIM.Models;
using ESEIM.Utils;
using Google.Apis.Drive.v3.Data;
using III.Domain.Enums;
using Lucene.Net.Support;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.TeamFoundation.Common;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Quartz;

namespace III.Admin.Utils
{
    [DisallowConcurrentExecution]
    public class AutoCreateMeeting : IJob
    {
        private readonly ILogger<AutoCreateMeeting> _logger;
        private readonly IFCMPushNotification _notification;
        private readonly EIMDBContext _context;
        public AutoCreateMeeting(
            IFCMPushNotification notification, EIMDBContext context,
            ILogger<AutoCreateMeeting> logger
            )
        {
            _logger = logger;
            _context = context;
            _notification = notification;
        }

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public Task Execute(IJobExecutionContext context)
        {
           
            Debug.WriteLine("Check Noti!");
            // CommonUtil.SendMail("support@3i.com.vn", "vutrongvi96@gmail.com", "Forgot password", "https://www.google.com/", "mail.3i.com.vn", 587, "support@3i.com.vn", "Vietnam@3i");
            DateTime currentDateTime = DateTime.Now;
            var msg = new JMessage { Error = false, Title = "" };
            string[] cars = { "[001] Cuộc họp chung", "[002] Cuộc họp 2", "[003] Cuộc họp 3" };
            string[] listZoom = { "pontus@3i.com.vn", "sagittarius@3i.com.vn", "lepus@3i.com.vn" };
            try
            {
                // tao giao ban
                var createshift = InsertWorkingSchedule();

                //check conditions
                var date = DateTime.Now.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
                var DateT = !string.IsNullOrEmpty(date) ? DateTime.ParseExact(date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var checkexist = (from a in _context.TokenManagers.Where(x => x.ServiceType == "AUTO_MEETING")
                                  select new
                                  {
                                      a.Id,
                                      a.CredentialsJson
                                  }).ToArray();
                var jsonData = JArray.Parse(checkexist[0].CredentialsJson);
                var startdate = !string.IsNullOrEmpty(jsonData[0]["Value"].ToString()) ? DateTime.ParseExact(jsonData[0]["Value"].ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var enddate = !string.IsNullOrEmpty(jsonData[1]["Value"].ToString()) ? DateTime.ParseExact(jsonData[1]["Value"].ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var status = jsonData[2]["Value"].ToString();
                // if
                if (status == "ON" && DateT >= startdate && DateT <= enddate)
                {
                    log.Info($"Code True");
                    for (var i = 0; i < cars.Length; i++)
                    {
                        Random generator = new Random();
                        string r = generator.Next(0, 1000000).ToString("D6");
                        var zoomSetting = new ZoomSetting
                        {
                            host_video = true,
                            participant_video = true,
                            join_before_host = true,
                            approval_type = 2
                        };
                        var zoomData = new ZoomData
                        {
                            topic = cars[i],
                            password = r,
                            type = 2,
                            settings = zoomSetting
                        };
                        var zoomModel = new ZoomModel
                        {
                            Email = listZoom[i],
                            Data = JsonConvert.SerializeObject(zoomData),
                            MeetingId = null,
                        };
                        var msg1 = CreateMeeting(zoomModel);
                        if (msg1.Error)
                        {
                            log.Info(msg1.Title);
                        }
                        var obj = new MeetingSchedule
                        {
                            StartTime = DateTime.Now,
                            EndTime = currentDateTime.Date.AddDays(1).AddMinutes(-5),
                            Title = cars[i],
                            Comment = "",
                            ListUserApproved = "[{\"userName\":\"\",\"status\":\"WORKING_SCHEDULE_NOT_APPROVED\"}]",
                            BackgroundColor = "",
                            BackgroundImage = "",
                            JsonRef = "[]",
                            JsonStatus = "[]",
                            AccountZoom = listZoom[i],
                            CreatedBy = "admin",
                            CreatedTime = DateTime.Now,
                            MeetingId = msg1.ID
                        };

                        _context.MeetingSchedules.Add(obj);
                        _context.SaveChanges();
                    }
                }
                else
                {
                    log.Info($"Code Error");
                }
            }
            catch (Exception ex)
            {
                log.Info(ex.Message);
            }
            return Task.CompletedTask;
        }
        private JMessage CreateMeeting(ZoomModel obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                //var session = HttpContext.GetSessionUser();
                var check = _context.TokenManagers.FirstOrDefault(x => x.Email.Equals(obj.Email) && x.ServiceType.Equals("ZOOM_ACCOUNT"));
                if (check == null)
                {
                    msg.Error = true;
                    //msg.Title = _stringLocalizer["MS_MESSAGE_ACCOUNT_NOT_EXIST"];
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
                        CreatedBy = "admin",
                        CreatedTime = DateTime.Now
                    };
                    _context.ZoomReportErrors.Add(zoomError);
                    _context.SaveChanges();
                    msg.Error = true;
                    //msg.Title = _sharedResources["COM_MSG_ERR"];
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
                        CreatedBy = "admin",
                        CreatedTime = DateTime.Now,
                        Group = check.AccountRole,
                        JoinUrl = rs.join_url,
                        ListUserAccess = JsonConvert.SerializeObject(obj.ListUserMeeting),
                        HostClaimCode = check.HostClaimCode,
                        IsDeleted = false
                    };
                    _context.ZoomManages.Add(zoom);
                    _context.SaveChanges();
                    msg.ID = zoom.Id;


                    //msg.Title = _stringLocalizer["MS_CREATE_MEETING_SUCCESS"];
                }
                _context.SaveChanges();
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return msg;
            }
        }


        private JMessage InsertWorkingSchedule()
        {
            var msg = new JMessage { Error = false, Title = "" };
            var date = DateTime.Now.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
            var DateT = !string.IsNullOrEmpty(date) ? DateTime.ParseExact(date, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var checkexist = (from a in _context.TokenManagers.Where(x => x.ServiceType == "MAKE_SHIFT_AUTO")
                              select new
                              {
                                  a.Id,
                                  a.CredentialsJson
                              }).ToArray();
            var jsonData = JArray.Parse(checkexist[0].CredentialsJson);
            var startdate = !string.IsNullOrEmpty(jsonData[0]["Value"].ToString()) ? DateTime.ParseExact(jsonData[0]["Value"].ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var enddate = !string.IsNullOrEmpty(jsonData[1]["Value"].ToString()) ? DateTime.ParseExact(jsonData[1]["Value"].ToString(), "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var status = jsonData[2]["Value"].ToString();
            if (status == "ON" && DateT >= startdate && DateT <= enddate)
            {
                try
                {
                    var workingSchedule = new WorkingSchedule
                    {
                        Content = "Họp giao ca",
                        WorkContent = "",
                        ListUserApproved = "[]",
                        JsonStatus = "[]",
                        JsonRef = "[]",
                        BackgroundColor = "#f1f1f1",
                        BackgroundImage = "",
                        Location = "",
                        CreatedBy = "admin",
                        CreatedTime = DateTime.Now,
                        StartDate = (DateTime)startdate,
                        EndDate = (DateTime)enddate
                    };

                    _context.WorkingSchedules.Add(workingSchedule);
                    _context.SaveChanges();
                    msg.Error = false;
                }
                catch (Exception ex)
                {
                     log.Info(ex.Message);
                }
            }
            else
            {
                log.Info($"Code Error");
            }


            return msg;
        }

    }
}
