using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffCalendarController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffCalendarController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public StaffCalendarController(EIMDBContext context, IUploadService upload, IStringLocalizer<StaffCalendarController> stringLocalizer, IStringLocalizer<SharedResources> sharedResource)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResource;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
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


        //[HttpPost]
        //public object GetListEmployee()
        //{
        //    var query = _context.HREmployees.Where(x => x.flag == 1).Select(x => new { x.Id, x.fullname }).AsNoTracking().ToList();
        //    return query;
        //}

        //[HttpGet]
        //public object GetEventCat(int memberId)
        //{
        //    var data = (from a in _context.StaffScheduleWorks
        //                where a.MemberId == memberId
        //                select new
        //                {
        //                    a.Id,
        //                    a.DatetimeEvent,
        //                    a.FrameTime,
        //                    //Morning = a.FrameTime.Split(';')[0], //Chua tuong thich
        //                    //Afternoon = a.FrameTime.Split(';')[1],
        //                    //Evening = a.FrameTime.Split(';')[2],
        //                }).AsNoTracking();
        //    return data;
        //}

        //[HttpPost]
        //public object GetEventCatGridToday([FromBody]EventCatJtableModel searchData)
        //{
        //    int intBegin = (searchData.CurrentPage - 1) * searchData.Length;
        //    var fromDate = string.IsNullOrEmpty(searchData.FromDate) ? (DateTime?)null : DateTime.ParseExact(searchData.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    var toDate = string.IsNullOrEmpty(searchData.ToDate) ? (DateTime?)null : DateTime.ParseExact(searchData.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    var today = DateTime.Now;
        //    var query = from a in _context.HREmployees
        //                join b in _context.StaffScheduleWorks on a.Id equals b.MemberId
        //                where (searchData.MemberId == null || b.MemberId == searchData.MemberId)
        //                      && (b.DatetimeEvent == today.Date)
        //                select new
        //                {
        //                    a.fullname,
        //                    b.Id,
        //                    b.DatetimeEvent,
        //                    b.FrameTime
        //                    //Morning = b.FrameTime.Split(';')[0], //Chua tuong thich
        //                    //Afternoon = b.FrameTime.Split(';')[1],
        //                    //Evening = b.FrameTime.Split(';')[2]
        //                };
        //    int count = query.Count();
        //    var data = query.OrderUsingSortExpression(searchData.QueryOrderBy).Skip(intBegin).Take(searchData.Length).AsNoTracking().ToList();
        //    var jdata = JTableHelper.JObjectTable(data, searchData.Draw, count, "fullname", "Id", "DatetimeEvent", "Morning", "Afternoon", "Evening");
        //    return Json(jdata);
        //}

        //[HttpPost]
        //public JsonResult ChangeFrametimeStatus(int id, int frame)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        frame = frame - 1;
        //        var data = _context.StaffScheduleWorks.FirstOrDefault(x => x.Id == id);
        //        if (data.DatetimeEvent.AddDays(1) < DateTime.Now)
        //        {
        //            msg.Title = String.Format(CommonUtil.ResourceValue("SC_MSG_CHANGE_YESTERDAY"));
        //            return Json(msg);
        //        }
        //        string[] frameTime = data.FrameTime.Split(';');
        //        if (frameTime[frame].Equals("True"))
        //        {
        //            frameTime[frame] = "False";
        //        }
        //        else
        //        {
        //            frameTime[frame] = "True";
        //        }
        //        data.FrameTime = frameTime[0].ToString() + ";" + frameTime[1].ToString() + ";" + frameTime[2];
        //        data.UpdatedTime = DateTime.Now;
        //        data.UpdatedBy = ESEIM.AppContext.UserName;
        //        _context.StaffScheduleWorks.Update(data);
        //        _context.SaveChanges();
        //        msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
        //    }
        //    return Json(msg);
        //}


        //[HttpPost]
        //public JsonResult NotPresent(string Event, int Frame)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        WORKUserEvent usrEvent = _context.WORKUserEvent.FirstOrDefault(x => x.EventCatCode.Equals(Event));
        //        string[] isPresent = usrEvent.Present.Split(';');
        //        isPresent[Frame] = "False";
        //        usrEvent.Present = isPresent[0] + ";" + isPresent[1] + ";" + isPresent[2];
        //        _context.WORKUserEvent.Update(usrEvent);
        //        _context.SaveChanges();

        //        msg.Error = false;
        //        msg.Title = "Cập nhật thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi xảy ra!";
        //        return Json(msg);
        //    }
        //}

        //[HttpPost]
        //public JsonResult GetMemberCode(int MemberType)
        //{
        //    if (MemberType == 0)
        //    {
        //        var data = _context.CandiateBasic.Where(x => x.Fullname != null).Select(x => new { code = x.CandidateCode, name = x.Fullname }).ToList();
        //        return Json(data);
        //    }
        //    if (MemberType == 1)
        //    {
        //        var data = _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { code = x.UserName, name = x.GivenName }).ToList();
        //        return Json(data);
        //    }
        //    if (MemberType == 2)
        //    {
        //        var data = _context.HREmployees.Select(x => new { code = x.Id, name = x.fullname }).ToList();
        //        return Json(data);
        //    }

        //    var msg = new JMessage()
        //    {
        //        Error = true,
        //        Title = "Member type error!"
        //    };
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult GetEventCatToday()
        //{
        //    var data = from a in _context.WORKUserEvent
        //               join b in _context.WORKEventCat
        //               on a.EventCatCode equals b.EventCatCode
        //               where (b.DatetimeEvent.ToString("dd/MM/yyyy").Equals(DateTime.Now.ToString("dd/MM/yyyy")) && a.Flag == false && b.FlagDelete == false)
        //               select new
        //               {
        //                   b.Id,
        //                   a.MemberId,
        //                   b.EventCatCode,
        //                   b.DatetimeEvent,
        //                   FullName = a.MemberId.Split('_')[0].Equals("USR") ? _context.Users.FirstOrDefault(x => x.UserName.Equals(a.MemberId.Split('_')[1])).GivenName :
        //                          (a.MemberId.Split('_')[0].Equals("CAN") ? _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode.Equals(a.MemberId.Substring(4, a.MemberId.Length - 4))).Fullname :
        //                          (a.MemberId.Split('_')[0].Equals("EPL") ? _context.HREmployees.FirstOrDefault(x => x.Id == int.Parse(a.MemberId.Split('_')[1])).fullname : "")),
        //                   b.FrameTime,
        //                   MorningPresent = a.Present.Split(';')[0],
        //                   AfternoonPresent = a.Present.Split(';')[1],
        //                   EveningPresent = a.Present.Split(';')[2],
        //               };
        //    return Json(data);
        //}

        //[HttpPost]
        //public JsonResult GetEventCatGrid([FromBody]SearchModel searchData)
        //{
        //    int intBegin = (searchData.CurrentPage - 1) * searchData.Length;
        //    DateTime? fromDate = string.IsNullOrEmpty(searchData.FromDate) ? (DateTime?)null : DateTime.ParseExact(searchData.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    DateTime? toDate = string.IsNullOrEmpty(searchData.ToDate) ? (DateTime?)null : DateTime.ParseExact(searchData.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    string memberType = "";
        //    switch (searchData.Membertype)
        //    {
        //        case 0:
        //            memberType = "CAN";
        //            break;
        //        case 1:
        //            memberType = "USR";
        //            break;
        //        case 2:
        //            memberType = "EPL";
        //            break;
        //    }

        //    try
        //    {
        //        var query = from a in _context.WORKUserEvent
        //                    join b in _context.WORKEventCat
        //                    on a.EventCatCode equals b.EventCatCode
        //                    where a.MemberId.Equals(memberType + "_" + searchData.CandidateCode) &&
        //                          ((fromDate == null || (b.DatetimeEvent >= fromDate)) &&
        //                           (toDate == null || (b.DatetimeEvent <= toDate))) &&
        //                          (searchData.Worktype == -1 ? true : (searchData.Worktype == 0 ? (b.FrameTime.Split(';')[0].Equals("True") &&
        //                                                                                          b.FrameTime.Split(';')[1].Equals("True")) : b.FrameTime.Split(';')[searchData.Worktype - 1].Equals("True"))
        //                          )
        //                    select new
        //                    {
        //                        b.Id,
        //                        b.EventCatCode,
        //                        b.DatetimeEvent,
        //                        a.MemberId,
        //                        Fullname = GetMemberName(searchData.Membertype, searchData.CandidateCode),
        //                        MorningPresent = a.Present.Split(';')[0],
        //                        AfternoonPresent = a.Present.Split(';')[1],
        //                        EveningPresent = a.Present.Split(';')[2],
        //                        Morning = b.FrameTime.Split(';')[0],
        //                        Afternoon = b.FrameTime.Split(';')[1],
        //                        Evening = b.FrameTime.Split(';')[2]
        //                    };
        //        int count = query.Count();
        //        var data = query.OrderUsingSortExpression(searchData.QueryOrderBy).Skip(intBegin).Take(searchData.Length).AsNoTracking().ToList();
        //        var jdata = JTableHelper.JObjectTable(data, searchData.Draw, count, "Id", "Fullname", "MorningPresent", "AfternoonPresent", "EveningPresent", "EventCatCode", "DatetimeEvent", "MemberId", "Morning", "Afternoon", "Evening");
        //        return Json(jdata);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(ex);
        //    }
        //}


        //private string GetMemberName(int? memberType, string memberCode)
        //{
        //    string name = "";
        //    switch (memberType)
        //    {
        //        case 0:
        //            name = _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode.Equals(memberCode)).Fullname;
        //            return name;
        //        case 1:
        //            name = _context.Users.FirstOrDefault(x => x.UserName.Equals(memberCode) && x.Active == true).GivenName;
        //            return name;
        //        case 2:
        //            name = _context.HREmployees.FirstOrDefault(x => x.Id.Equals(int.Parse(memberCode))).fullname;
        //            return name;
        //        default:
        //            return "";
        //    }
        //}

        //private string GetMemberName(string memberType, string memberCode)
        //{
        //    int type = -1;
        //    switch (memberType)
        //    {
        //        case "CAN":
        //            type = 0;
        //            break;
        //        case "USR":
        //            type = 1;
        //            break;
        //        case "ELP":
        //            type = 2;
        //            break;
        //    }
        //    return GetMemberName(type, memberCode);
        //}
        //[HttpPost]
        //public JsonResult GetGridToday([FromBody]JTableModel jtablePara)
        //{
        //    int intBegin = (jtablePara.CurrentPage - 1) * jtablePara.Length;
        //    var query = from a in _context.WORKUserEvent
        //                join b in _context.WORKEventCat
        //                on a.EventCatCode equals b.EventCatCode
        //                where b.DatetimeEvent == DateTime.Now.Date
        //                select new
        //                {
        //                    b.Id,
        //                    b.EventCatCode,
        //                    b.DatetimeEvent,
        //                    a.MemberId,
        //                    MorningPresent = a.Present.Split(';')[0],
        //                    AfternoonPresent = a.Present.Split(';')[1],
        //                    EveningPresent = a.Present.Split(';')[2],
        //                    Morning = b.FrameTime.Split(';')[0],
        //                    Afternoon = b.FrameTime.Split(';')[1],
        //                    Evening = b.FrameTime.Split(';')[2]
        //                };
        //    int count = query.Count();
        //    var data = query.OrderUsingSortExpression(jtablePara.QueryOrderBy).Skip(intBegin).Take(jtablePara.Length).AsNoTracking().ToList();
        //    var jdata = JTableHelper.JObjectTable(data, jtablePara.Draw, count, "Id", "Fullname", "MorningPresent", "AfternoonPresent", "EveningPresent", "EventCatCode", "DatetimeEvent", "MemberId", "Morning", "Afternoon", "Evening");
        //    return Json(jdata);

        //}

        //[HttpPost]
        //public JsonResult GetEventCat([FromBody]SearchModel searchData)
        //{
        //    DateTime? fromDate = string.IsNullOrEmpty(searchData.FromDate) ? (DateTime?)null : DateTime.ParseExact(searchData.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    DateTime? toDate = string.IsNullOrEmpty(searchData.ToDate) ? (DateTime?)null : DateTime.ParseExact(searchData.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    string memberType = "";
        //    switch (searchData.Membertype)
        //    {
        //        case 0:
        //            memberType = "CAN";
        //            break;
        //        case 1:
        //            memberType = "USR";
        //            break;
        //        case 2:
        //            memberType = "EPL";
        //            break;
        //    }

        //    try
        //    {
        //        var data = from a in _context.WORKUserEvent
        //                   join b in _context.WORKEventCat
        //                   on a.EventCatCode equals b.EventCatCode
        //                   where a.MemberId.Equals(memberType + "_" + searchData.CandidateCode) &&
        //                         ((fromDate == null || (b.DatetimeEvent >= fromDate)) &&
        //                          (toDate == null || (b.DatetimeEvent <= toDate))) &&
        //                         (searchData.Worktype == -1 ? true : (searchData.Worktype == 0 ? (b.FrameTime.Split(';')[0].Equals("True") &&
        //                                                                                         b.FrameTime.Split(';')[1].Equals("True")) : b.FrameTime.Split(';')[searchData.Worktype - 1].Equals("True"))
        //                         )
        //                   select new
        //                   {
        //                       b.Id,
        //                       b.EventCatCode,
        //                       b.DatetimeEvent,
        //                       b.FrameTime,
        //                       MorningPresent = a.Present.Split(';')[0],
        //                       AfternoonPresent = a.Present.Split(';')[1],
        //                       EveningPresent = a.Present.Split(';')[2],
        //                   };
        //        return Json(data);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(ex);
        //    }
        //}

        //[HttpPost]
        //public JsonResult ChangeFrametimeStatus(int id, int frame)
        //{
        //    var msg = new JMessage() { Error = true };
        //    try
        //    {
        //        frame = frame - 1;
        //        var data = _context.WORKEventCat.FirstOrDefault(x => x.Id == id);
        //        if (data.DatetimeEvent.AddDays(1) < DateTime.Now)
        //        {
        //            msg.Title = "Không thể thay đổi ngày đã qua!";
        //            return Json(msg);
        //        }
        //        string[] frameTime = data.FrameTime.Split(';');
        //        if (frameTime[frame].Equals("True"))
        //        {
        //            frameTime[frame] = "False";
        //        }
        //        else
        //        {
        //            frameTime[frame] = "True";
        //        }
        //        data.FrameTime = frameTime[0].ToString() + ";" + frameTime[1].ToString() + ";" + frameTime[2];
        //        data.UpdatedTime = DateTime.Now;
        //        data.UpdatedBy = ESEIM.AppContext.UserName;
        //        _context.WORKEventCat.Update(data);
        //        _context.SaveChanges();

        //        msg.Error = false;
        //        msg.Title = "Cập nhật thành công!";

        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Title = "Có lỗi xảy ra!";
        //        return Json(msg);
        //    }
        //}

        //[HttpPost]
        //public JsonResult GetInterviewDate([FromBody]SearchModel searchData)
        //{
        //    DateTime? fromDate = string.IsNullOrEmpty(searchData.FromDate) ? (DateTime?)null : DateTime.ParseExact(searchData.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
        //    DateTime? toDate = string.IsNullOrEmpty(searchData.ToDate) ? (DateTime?)null : DateTime.ParseExact(searchData.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

        //    try
        //    {
        //        var data = from a in _context.CandidateInterview
        //                   join b in _context.CandiateBasic
        //                   on a.CandidateCode equals b.CandidateCode
        //                   where (String.IsNullOrEmpty(searchData.CandidateCode) ? true : searchData.CandidateCode.Equals(a.CandidateCode)) &&
        //                         (fromDate == null || (a.InterviewDate >= fromDate)) &&
        //                         (toDate == null || (a.InterviewDate <= toDate))
        //                   select new
        //                   {
        //                       a.InterviewDate,
        //                       a.Status,
        //                       a.IsPresent,
        //                       b.Fullname
        //                   };

        //        return Json(data);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(ex);
        //    }
        //}
    }
}