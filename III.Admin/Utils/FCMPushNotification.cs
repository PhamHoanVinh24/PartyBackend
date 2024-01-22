using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using ESEIM.Models;
using Newtonsoft.Json;
using III.Domain.Enums;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public class DeviceFcm
    {
        public string Token { get; set; }
        public string Device { get; set; }
        public string UserId { get; set; }
    }

    public class UserIdModel
    {
        public string UserId { get; set; }
    }
    public interface IFCMPushNotification
    {
        Task<JMessage> SendNotification(string _title, string _message, List<DeviceFcm> devices, Object dataObject, string fromSrc, string createdBy);
        JMessage SendNotificationMeta(string _title, string _message, List<DeviceFcm> devices, Object dataObject, string fromSrc);
    }
    public class FCMPushNotification : IFCMPushNotification
    {
        private readonly EIMDBContext _context;
        private readonly IParameterService _iParameterService;

        public FCMPushNotification(EIMDBContext context, IParameterService iParameterService)
        {
            _context = context;
            _iParameterService = iParameterService;
        }
        private object GetCountNotiBadge(string userId)
        {
            try
            {
                var today = DateTime.Today;
                var user = _context.Users.FirstOrDefault(x => x.Id == userId);
                var projects = _context.Projects.Where(x => !x.FlagDeleted);
                var countProjects = 0;
                foreach (var item in projects)
                {
                    if (!string.IsNullOrEmpty(item.ListUserView))
                    {
                        if (!item.ListUserView.Contains(userId))
                        {
                            countProjects += 1;
                        }
                    }
                    else
                    {
                        countProjects += 1;
                    }
                }

                var contract = _context.PoSaleHeaders.Where(x => !x.IsDeleted);
                var countContract = 0;
                foreach (var item in contract)
                {
                    if (!string.IsNullOrEmpty(item.ListUserView))
                    {
                        if (!item.ListUserView.Contains(userId))
                        {
                            countContract += 1;
                        }
                    }
                    else
                    {
                        countContract += 1;
                    }
                }

                var contractPo = _context.PoBuyerHeaders.Where(x => !x.IsDeleted);
                var countContractPo = 0;
                foreach (var item in contractPo)
                {
                    if (!string.IsNullOrEmpty(item.ListUserView))
                    {
                        if (!item.ListUserView.Contains(userId))
                        {
                            countContractPo += 1;
                        }
                    }
                    else
                    {
                        countContractPo += 1;
                    }
                }

                var supplier = _context.Suppliers.Where(x => !x.IsDeleted);
                var countSupplier = 0;
                foreach (var item in supplier)
                {
                    if (!string.IsNullOrEmpty(item.ListUserView))
                    {
                        if (!item.ListUserView.Contains(userId))
                        {
                            countSupplier += 1;
                        }
                    }
                    else
                    {
                        countSupplier += 1;
                    }
                }

                var customer = _context.Customerss.Where(x => !x.IsDeleted);
                var countCustomer = 0;
                foreach (var item in customer)
                {
                    if (!string.IsNullOrEmpty(item.ListUserView))
                    {
                        if (!item.ListUserView.Contains(userId))
                        {
                            countCustomer += 1;
                        }
                    }
                    else
                    {
                        countCustomer += 1;
                    }
                }

                var countItem = 0;
                var cmsItem = (from a in _context.cms_items
                               join b in _context.cms_categories on a.cat_id equals b.id
                               where a.date_post.Value.Date == today && a.published == true && b.published == true
                               select new
                               {
                                   a.id,
                                   a.ListUserView,
                               });
                foreach (var item in cmsItem)
                {
                    if (!string.IsNullOrEmpty(item.ListUserView))
                    {
                        if (!item.ListUserView.Contains(userId))
                        {
                            countItem += 1;
                        }
                    }
                    else
                    {
                        countItem += 1;
                    }
                }

                var countCard = _iParameterService.GetCountNotifiCardJob(user.Id, user.UserName);
                var countWF = _iParameterService.GetCountNotificationWorkFlow(user.Id);
                var countMeeting = 0;
                countMeeting = (_context.MeetingSchedules
                    .Where(x => !x.IsDeleted
                                && today.Date >= x.StartTime.Value.Date
                                && today.Date <= x.EndTime.Value.Date
                                && (user.UserType == 10 ||
                                    (x.ListUserObject.Any(y =>
                                        y.userName == user.UserName || string.IsNullOrEmpty(y.userName))) ||
                                    x.CreatedBy == user.UserName))
                    .Select(x => new
                    {
                        Id = x.Id,
                    })).Count();
                return new
                {
                    countProjects = countProjects,
                    countContract = countContract,
                    countContractPo = countContractPo,
                    countSupplier = countSupplier,
                    countCustomer = countCustomer,
                    countItem = countItem,
                    countCard = countCard,
                    countWF = countWF,
                    countMeeting = countMeeting,
                    countAll = countProjects + countContract + countContractPo + countSupplier + countCustomer + countItem + countCard + countWF + countMeeting
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    countAll = 0
                };
            }
        }
        public async Task<JMessage> SendNotification(string _title, string _message, List<DeviceFcm> devices, Object dataObject, string fromSrc, string createdBy)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var API_KEY = "AIzaSyCO5GO_EN_So9rxZgYFLSJ64jzy9GqC-dI";
            var senderId = "495931051565";
            HttpRequestMessage httpRequest = null;
            HttpClient httpClient = null;
            try
            {
                if (devices.Count > 0)
                {
                    foreach(var item in devices)
                    {
                        string json = "";
                        //dynamic objBadge = GetCountNotiBadge(item.UserId);
                        var countBadge = await SaveNoti(_title, _message, fromSrc, item.UserId, createdBy);
                        if (item.Device.ToLower() == "ios")
                        {
                            if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromActInst))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ActivityCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityCode").GetValue(dataObject, null) : "",
                                        ActivityInstCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityInstCode").GetValue(dataObject, null) : "",
                                        Desc = dataObject != null ? dataObject.GetType().GetProperty("Desc").GetValue(dataObject, null) : "",
                                        Duration = dataObject != null ? dataObject.GetType().GetProperty("Duration").GetValue(dataObject, null) : "",
                                        Group = dataObject != null ? dataObject.GetType().GetProperty("Group").GetValue(dataObject, null) : "",
                                        ID = dataObject != null ? dataObject.GetType().GetProperty("ID").GetValue(dataObject, null) : "",
                                        Located = dataObject != null ? dataObject.GetType().GetProperty("Located").GetValue(dataObject, null) : "",
                                        ObjCode = dataObject != null ? dataObject.GetType().GetProperty("ObjCode").GetValue(dataObject, null) : "",
                                        StatusCode = dataObject != null ? dataObject.GetType().GetProperty("StatusCode").GetValue(dataObject, null) : "",
                                        Timer = dataObject != null ? dataObject.GetType().GetProperty("Timer").GetValue(dataObject, null) : "",
                                        Title = dataObject != null ? dataObject.GetType().GetProperty("Title").GetValue(dataObject, null) : "",
                                        Type = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        Unit = dataObject != null ? dataObject.GetType().GetProperty("Unit").GetValue(dataObject, null) : "",
                                        WorkflowCode = dataObject != null ? dataObject.GetType().GetProperty("WorkflowCode").GetValue(dataObject, null) : "",
                                        WfName = dataObject != null ? dataObject.GetType().GetProperty("WfName").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCardJob))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode").GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName").GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode").GetValue(dataObject, null) : "",
                                        CardCode = dataObject != null ? dataObject.GetType().GetProperty("CardCode").GetValue(dataObject, null) : "",
                                        CardName = dataObject != null ? dataObject.GetType().GetProperty("CardName").GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime").GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime").GetValue(dataObject, null) : "",
                                        CardLevel = dataObject != null ? dataObject.GetType().GetProperty("CardLevel").GetValue(dataObject, null) : "",
                                        projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                        projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                        typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund))
                            {

                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCallVideo))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ZoomId = dataObject != null ? dataObject.GetType().GetProperty("ZoomId").GetValue(dataObject, null) : "",
                                        ZoomName = dataObject != null ? dataObject.GetType().GetProperty("ZoomName").GetValue(dataObject, null) : "",
                                        ZoomPass = dataObject != null ? dataObject.GetType().GetProperty("ZoomPass").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromMeeting))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromTutoring))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromLmsTask))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode")?.GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName")?.GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskCode = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskName = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskName")?.GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime")?.GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime")?.GetValue(dataObject, null) : "",
                                        Id = dataObject != null ? dataObject.GetType().GetProperty("Id")?.GetValue(dataObject, null) : "",
                                        //projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                        //projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                        //typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromUrgentNoti))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                        }
                        else
                        {
                            if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromActInst))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ActivityCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityCode").GetValue(dataObject, null) : "",
                                        ActivityInstCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityInstCode").GetValue(dataObject, null) : "",
                                        Desc = dataObject != null ? dataObject.GetType().GetProperty("Desc").GetValue(dataObject, null) : "",
                                        Duration = dataObject != null ? dataObject.GetType().GetProperty("Duration").GetValue(dataObject, null) : "",
                                        Group = dataObject != null ? dataObject.GetType().GetProperty("Group").GetValue(dataObject, null) : "",
                                        ID = dataObject != null ? dataObject.GetType().GetProperty("ID").GetValue(dataObject, null) : "",
                                        Located = dataObject != null ? dataObject.GetType().GetProperty("Located").GetValue(dataObject, null) : "",
                                        ObjCode = dataObject != null ? dataObject.GetType().GetProperty("ObjCode").GetValue(dataObject, null) : "",
                                        StatusCode = dataObject != null ? dataObject.GetType().GetProperty("StatusCode").GetValue(dataObject, null) : "",
                                        Timer = dataObject != null ? dataObject.GetType().GetProperty("Timer").GetValue(dataObject, null) : "",
                                        Title = dataObject != null ? dataObject.GetType().GetProperty("Title").GetValue(dataObject, null) : "",
                                        Type = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        Unit = dataObject != null ? dataObject.GetType().GetProperty("Unit").GetValue(dataObject, null) : "",
                                        WorkflowCode = dataObject != null ? dataObject.GetType().GetProperty("WorkflowCode").GetValue(dataObject, null) : "",
                                        WfName = dataObject != null ? dataObject.GetType().GetProperty("WfName").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCardJob))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode").GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName").GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode").GetValue(dataObject, null) : "",
                                        CardCode = dataObject != null ? dataObject.GetType().GetProperty("CardCode").GetValue(dataObject, null) : "",
                                        CardName = dataObject != null ? dataObject.GetType().GetProperty("CardName").GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime").GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime").GetValue(dataObject, null) : "",
                                        CardLevel = dataObject != null ? dataObject.GetType().GetProperty("CardLevel").GetValue(dataObject, null) : "",
                                        projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                        projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                        typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund))
                            {

                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCallVideo))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ZoomId = dataObject != null ? dataObject.GetType().GetProperty("ZoomId").GetValue(dataObject, null) : "",
                                        ZoomName = dataObject != null ? dataObject.GetType().GetProperty("ZoomName").GetValue(dataObject, null) : "",
                                        ZoomPass = dataObject != null ? dataObject.GetType().GetProperty("ZoomPass").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromMeeting))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromTutoring))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromLmsTask))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode")?.GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName")?.GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskCode = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskName = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskName")?.GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime")?.GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime")?.GetValue(dataObject, null) : "",
                                        Id = dataObject != null ? dataObject.GetType().GetProperty("Id")?.GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromUrgentNoti))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                        }
                        httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send");
                        //var json = JsonConvert.SerializeObject(data);
                        httpRequest.Headers.TryAddWithoutValidation("Authorization", "key=" + API_KEY);
                        httpRequest.Headers.TryAddWithoutValidation("Sender", $"id={senderId}");
                        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
                        httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        using (HttpResponseMessage response = httpClient.SendAsync(httpRequest).Result)
                        {
                            if (response.IsSuccessStatusCode)
                            {
                                msg.Error = false;
                                msg.Object = response.Content;
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Object = response.Content;
                            }
                        }
                    }
                }
              
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;

            }
            finally
            {
                httpRequest.Dispose();
                httpClient.Dispose();
            }
            return msg;
        }
        public JMessage SendNotificationMeta(string _title, string _message, List<DeviceFcm> devices, Object dataObject, string fromSrc)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var API_KEY = "AAAASy60-p0:APA91bE-rjdg86jf2ge57TDh678hPrZWuEAUjzdfoU-Onfb2YB7RSwU5bh46n6pKVPjQ5dX98dFdn28n4LHqY2lprI7XTlq7BAMkpCAct71_sBRG1k8OESvISvT711qod6B3jXm9Ydac";
            var senderId = "322906159773";
            HttpRequestMessage httpRequest = null;
            HttpClient httpClient = null;
            try
            {
                if (devices.Count > 0)
                {
                    foreach(var item in devices)
                    {
                        string json = "";
                        //dynamic objBadge = GetCountNotiBadge(item.UserId);
                        //var countBadge = (int)objBadge.countAll;
                        if (item.Device.ToLower() == "ios")
                        {
                            if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromActInst))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ActivityCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityCode").GetValue(dataObject, null) : "",
                                        ActivityInstCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityInstCode").GetValue(dataObject, null) : "",
                                        Desc = dataObject != null ? dataObject.GetType().GetProperty("Desc").GetValue(dataObject, null) : "",
                                        Duration = dataObject != null ? dataObject.GetType().GetProperty("Duration").GetValue(dataObject, null) : "",
                                        Group = dataObject != null ? dataObject.GetType().GetProperty("Group").GetValue(dataObject, null) : "",
                                        ID = dataObject != null ? dataObject.GetType().GetProperty("ID").GetValue(dataObject, null) : "",
                                        Located = dataObject != null ? dataObject.GetType().GetProperty("Located").GetValue(dataObject, null) : "",
                                        ObjCode = dataObject != null ? dataObject.GetType().GetProperty("ObjCode").GetValue(dataObject, null) : "",
                                        StatusCode = dataObject != null ? dataObject.GetType().GetProperty("StatusCode").GetValue(dataObject, null) : "",
                                        Timer = dataObject != null ? dataObject.GetType().GetProperty("Timer").GetValue(dataObject, null) : "",
                                        Title = dataObject != null ? dataObject.GetType().GetProperty("Title").GetValue(dataObject, null) : "",
                                        Type = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        Unit = dataObject != null ? dataObject.GetType().GetProperty("Unit").GetValue(dataObject, null) : "",
                                        WorkflowCode = dataObject != null ? dataObject.GetType().GetProperty("WorkflowCode").GetValue(dataObject, null) : "",
                                        WfName = dataObject != null ? dataObject.GetType().GetProperty("WfName").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCardJob))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode").GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName").GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode").GetValue(dataObject, null) : "",
                                        CardCode = dataObject != null ? dataObject.GetType().GetProperty("CardCode").GetValue(dataObject, null) : "",
                                        CardName = dataObject != null ? dataObject.GetType().GetProperty("CardName").GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime").GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime").GetValue(dataObject, null) : "",
                                        CardLevel = dataObject != null ? dataObject.GetType().GetProperty("CardLevel").GetValue(dataObject, null) : "",
                                        projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                        projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                        typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund))
                            {

                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCallVideo))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ZoomId = dataObject != null ? dataObject.GetType().GetProperty("ZoomId").GetValue(dataObject, null) : "",
                                        ZoomName = dataObject != null ? dataObject.GetType().GetProperty("ZoomName").GetValue(dataObject, null) : "",
                                        ZoomPass = dataObject != null ? dataObject.GetType().GetProperty("ZoomPass").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromMeeting))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromTutoring))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromLmsTask))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    notification = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //badge = countBadge,
                                        sound = "default",
                                    },
                                    priority = "high",
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode")?.GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName")?.GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskCode = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskName = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskName")?.GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime")?.GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime")?.GetValue(dataObject, null) : "",
                                        Id = dataObject != null ? dataObject.GetType().GetProperty("Id")?.GetValue(dataObject, null) : "",
                                        //projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                        //projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                        //typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                        }
                        else
                        {
                            if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromActInst))
                            {
                                var data = new
                                {
                                    to = item.Token,
                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ActivityCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityCode").GetValue(dataObject, null) : "",
                                        ActivityInstCode = dataObject != null ? dataObject.GetType().GetProperty("ActivityInstCode").GetValue(dataObject, null) : "",
                                        Desc = dataObject != null ? dataObject.GetType().GetProperty("Desc").GetValue(dataObject, null) : "",
                                        Duration = dataObject != null ? dataObject.GetType().GetProperty("Duration").GetValue(dataObject, null) : "",
                                        Group = dataObject != null ? dataObject.GetType().GetProperty("Group").GetValue(dataObject, null) : "",
                                        ID = dataObject != null ? dataObject.GetType().GetProperty("ID").GetValue(dataObject, null) : "",
                                        Located = dataObject != null ? dataObject.GetType().GetProperty("Located").GetValue(dataObject, null) : "",
                                        ObjCode = dataObject != null ? dataObject.GetType().GetProperty("ObjCode").GetValue(dataObject, null) : "",
                                        StatusCode = dataObject != null ? dataObject.GetType().GetProperty("StatusCode").GetValue(dataObject, null) : "",
                                        Timer = dataObject != null ? dataObject.GetType().GetProperty("Timer").GetValue(dataObject, null) : "",
                                        Title = dataObject != null ? dataObject.GetType().GetProperty("Title").GetValue(dataObject, null) : "",
                                        Type = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        Unit = dataObject != null ? dataObject.GetType().GetProperty("Unit").GetValue(dataObject, null) : "",
                                        WorkflowCode = dataObject != null ? dataObject.GetType().GetProperty("WorkflowCode").GetValue(dataObject, null) : "",
                                        WfName = dataObject != null ? dataObject.GetType().GetProperty("WfName").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCardJob))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode").GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName").GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode").GetValue(dataObject, null) : "",
                                        CardCode = dataObject != null ? dataObject.GetType().GetProperty("CardCode").GetValue(dataObject, null) : "",
                                        CardName = dataObject != null ? dataObject.GetType().GetProperty("CardName").GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime").GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime").GetValue(dataObject, null) : "",
                                        CardLevel = dataObject != null ? dataObject.GetType().GetProperty("CardLevel").GetValue(dataObject, null) : "",
                                        projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                        projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                        typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromFund))
                            {

                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromCallVideo))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        ZoomId = dataObject != null ? dataObject.GetType().GetProperty("ZoomId").GetValue(dataObject, null) : "",
                                        ZoomName = dataObject != null ? dataObject.GetType().GetProperty("ZoomName").GetValue(dataObject, null) : "",
                                        ZoomPass = dataObject != null ? dataObject.GetType().GetProperty("ZoomPass").GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromMeeting))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromTutoring))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        Detail = dataObject,
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                            else if (fromSrc == EnumHelper<FromSrcSendNotify>.GetDisplayValue(FromSrcSendNotify.FromLmsTask))
                            {
                                var data = new
                                {
                                    to = item.Token,

                                    data = new
                                    {
                                        title = _title,
                                        body = _message,
                                        //count = countBadge,
                                        sound = "default",
                                        click_action = "OPEN_ACTIVITY_MAIN",
                                        BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode")?.GetValue(dataObject, null) : "",
                                        BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName")?.GetValue(dataObject, null) : "",
                                        ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskCode = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskCode")?.GetValue(dataObject, null) : "",
                                        LmsTaskName = dataObject != null ? dataObject.GetType().GetProperty("LmsTaskName")?.GetValue(dataObject, null) : "",
                                        BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime")?.GetValue(dataObject, null) : "",
                                        EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime")?.GetValue(dataObject, null) : "",
                                        Id = dataObject != null ? dataObject.GetType().GetProperty("Id")?.GetValue(dataObject, null) : "",
                                        FromSrc = fromSrc
                                    }
                                };
                                json = JsonConvert.SerializeObject(data);
                            }
                        }
                        httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send");
                        //var json = JsonConvert.SerializeObject(data);
                        httpRequest.Headers.TryAddWithoutValidation("Authorization", "key=" + API_KEY);
                        httpRequest.Headers.TryAddWithoutValidation("Sender", $"id={senderId}");
                        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
                        httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        using (HttpResponseMessage response = httpClient.SendAsync(httpRequest).Result)
                        {
                            if (response.IsSuccessStatusCode)
                            {
                                msg.Error = false;
                                msg.Object = response.Content;
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Object = response.Content;
                            }
                        }
                    }
                }
              
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;

            }
            finally
            {
                httpRequest.Dispose();
                httpClient.Dispose();
            }
            return msg;
        }
        private async Task<int> SaveNoti(string title, string message, string fromSrc, string userId, string createdBy)
        {
            var receiver = _context.Users.FirstOrDefault(x => x.Id == userId);
            var newNoti = new Notification()
            {
                NotifyCode = fromSrc + Guid.NewGuid().ToString(),
                Title = title,
                Content = message,
                Status = "SENT",
                Receiver = receiver.UserName,
                ReceiverConfirm = "NO",
                CreatedBy = createdBy,
                CreatedTime = DateTime.Now,
                IsDeleted = false,
            };
            _context.Notifications.Add(newNoti);
            var rs = await _context.SaveChangesAsync();
            return _context.Notifications.Count(x => !x.IsDeleted && x.ReceiverConfirm == "NO" && x.Receiver == receiver.UserName);
        }
    }
}
