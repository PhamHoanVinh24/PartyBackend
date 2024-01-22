using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class CompanyEventController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizer;
        private readonly IStringLocalizer<CMSItemController> _cMSItemController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CompanyEventController(EIMDBContext context, IUploadService upload, 
            IStringLocalizer<StaffRegistrationController> stringLocalizer, 
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<CMSItemController> cMSItemController)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _cMSItemController = cMSItemController;
        }

        [Breadcrumb("ViewData.CrumbCompanyEvent", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbCompanyEvent"] = "Sự kiện công ty";
            return View();
        }

        [HttpGet]
        public JsonResult GetEvent(string type)
        {
            var items = _context.cms_items.Where(x => x.published && x.cat_id == 322)
                .Select(x => new {
                    Id = x.id,
                    title = x.title,
                    start = x.date_post,
                    className = x.date_post.Value.Date == DateTime.Now.Date ? "fc-event-event-green" : (x.date_post.Value.Date > DateTime.Now.Date ? "fc-event-event-orange": "fc-event-event-default")
                });
            return Json(items);
        }

        [HttpGet]
        public object GetListUser(string department)
        {
            return _context.Users.Where(x => x.Active && x.UserName != "admin" 
                && (string.IsNullOrEmpty(department) || x.DepartmentId.Equals(department)))
                .Select(x => new { x.Id, x.GivenName, x.Picture });
        }

        [HttpGet]
        public JsonResult GetAllEvent(string memberId, string monthYear, bool morning, bool afternoon, bool evening, 
            bool saturday, bool sunday, string department)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (memberId == null)
                {
                    var query = from a in _context.StaffScheduleWorks
                                join b in _context.Users.Where(x => x.Active) on a.MemberId equals b.Id
                                where a.DatetimeEvent.ToString("MM/yyyy").Equals(monthYear) &&
                                (string.IsNullOrEmpty(department) || b.DepartmentId.Equals(department)) &&
                                (morning == false || (a.FrameTime.Split(";", StringSplitOptions.None)[0] == "True")) &&
                                (afternoon == false || (a.FrameTime.Split(";", StringSplitOptions.None)[1] == "True")) &&
                                (evening == false || (a.FrameTime.Split(";", StringSplitOptions.None)[2] == "True")) &&
                                ((saturday == false && sunday == false)
                                || (saturday == true && sunday == true && (a.DatetimeEvent.DayOfWeek == DayOfWeek.Saturday || a.DatetimeEvent.DayOfWeek == DayOfWeek.Sunday))
                                || (saturday == true && sunday == false && a.DatetimeEvent.DayOfWeek == DayOfWeek.Saturday)
                                || (saturday == false && sunday == true && a.DatetimeEvent.DayOfWeek == DayOfWeek.Sunday))
                                select new
                                {
                                    a.MemberId,
                                    a.DatetimeEvent,
                                    a.FrameTime,
                                    b.GivenName,
                                    a.DatetimeEvent.DayOfWeek,
                                };
                    var total = query.GroupBy(x => x.DatetimeEvent).Select(y => new
                    {
                        y.First().DatetimeEvent,
                        Morning = y.Where(z => z.FrameTime.Split(";", StringSplitOptions.None)[0] == "True").Count(),
                        Afternoon = y.Where(z => z.FrameTime.Split(";", StringSplitOptions.None)[1] == "True").Count(),
                        Evening = y.Where(z => z.FrameTime.Split(";", StringSplitOptions.None)[2] == "True").Count(),
                    });
                    msg.Object = new
                    {
                        All = true,
                        ListTotalSchedule = total,
                        ListMemberSchedule = query,
                    };
                }
                else
                {
                    var data = (from a in _context.StaffScheduleWorks
                                where a.MemberId == memberId
                                && a.DatetimeEvent.ToString("MM/yyyy").Equals(monthYear) &&
                                (morning == false || (a.FrameTime.Split(";", StringSplitOptions.None)[0] == "True")) &&
                                (afternoon == false || (a.FrameTime.Split(";", StringSplitOptions.None)[1] == "True")) &&
                                (evening == false || (a.FrameTime.Split(";", StringSplitOptions.None)[2] == "True")) &&
                                ((saturday == false && sunday == false)
                                || (saturday == true && sunday == true && (a.DatetimeEvent.DayOfWeek == DayOfWeek.Saturday || a.DatetimeEvent.DayOfWeek == DayOfWeek.Sunday))
                                || (saturday == true && sunday == false && a.DatetimeEvent.DayOfWeek == DayOfWeek.Saturday)
                                || (saturday == false && sunday == true && a.DatetimeEvent.DayOfWeek == DayOfWeek.Sunday))
                                select new
                                {
                                    a.MemberId,
                                    a.DatetimeEvent,
                                    a.FrameTime
                                }).AsNoTracking();
                    msg.Object = new
                    {
                        All = false,
                        ListScheduleForMember = data,
                    };
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);

        }

        [HttpGet]
        public JsonResult GetEventForDate(string date)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var dateSearch = string.IsNullOrEmpty(date) ? (DateTime?)null : DateTime.ParseExact(date, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var query = from a in _context.Users.Where(x => x.Active)
                            join b in _context.StaffScheduleWorks on a.Id equals b.MemberId
                            join c in _context.AdGroupUsers on a.AdUserInGroups.FirstOrDefault().GroupUserCode equals c.GroupUserCode into c1
                            from c in c1.DefaultIfEmpty()
                            where b.DatetimeEvent == dateSearch
                            select new
                            {
                                b.Id,
                                UserId = a.Id,
                                a.GivenName,
                                Phone = a.PhoneNumber,
                                a.Email,
                                a.AdUserInGroups,
                                Department = c != null ? c.Title : "",
                                TypeWork = a.TypeWork == EnumHelper<TypeWork>.GetDisplayValue(TypeWork.P) ? TypeWork.P.DescriptionAttr() :
                                a.TypeWork == EnumHelper<TypeWork>.GetDisplayValue(TypeWork.F) ? TypeWork.F.DescriptionAttr() : "",
                                Morning = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[0],
                                Afternoon = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[1],
                                Evening = b.FrameTime.Split(';', StringSplitOptions.RemoveEmptyEntries)[2]
                            };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("STRE_MSG_ERROR_FIND_DATA"));
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult ChangeFrametimeStaff(int id, int frame)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                frame = frame - 1;
                var data = _context.StaffScheduleWorks.FirstOrDefault(x => x.Id == id);
                string[] frameTime = data.FrameTime.Split(';');
                if (frameTime[frame].Equals("True"))
                {
                    frameTime[frame] = "False";
                }
                else
                {
                    frameTime[frame] = "True";
                }

                if (data.DatetimeEvent.AddDays(1) < DateTime.Now)
                {
                    if (session.IsAllData || session.IsManager || session.IsBranch)
                    {
                        data.FrameTime = frameTime[0].ToString() + ";" + frameTime[1].ToString() + ";" + frameTime[2];
                        data.UpdatedTime = DateTime.Now;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        _context.StaffScheduleWorks.Update(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                        return Json(msg);
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _sharedResources["COM_ERR_VALIDATE_DAY"];
                        return Json(msg);
                    }
                }
                data.FrameTime = frameTime[0].ToString() + ";" + frameTime[1].ToString() + ";" + frameTime[2];
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = ESEIM.AppContext.UserName;
                _context.StaffScheduleWorks.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //Registration(Select one user)
        [HttpGet]
        public JsonResult GetItemUser(string userId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.Users.Where(a => a.Id == userId).Select(a => new
                {
                    a.GivenName,
                    a.Email,
                    a.PhoneNumber,
                    a.Picture,
                    TypeWork = a.TypeWork == EnumHelper<TypeWork>.GetDisplayValue(TypeWork.P) ? TypeWork.P.DescriptionAttr() :
                                a.TypeWork == EnumHelper<TypeWork>.GetDisplayValue(TypeWork.F) ? TypeWork.F.DescriptionAttr() : "",
                }).First();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        [HttpGet]
        public object GetItemScheduleMember(string memberId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var minDate = _context.StaffScheduleWorks.Where(x => x.MemberId == memberId).Min(x => x.DatetimeEvent);
                var maxDate = _context.StaffScheduleWorks.Where(x => x.MemberId == memberId).Max(x => x.DatetimeEvent);
                msg.Object = new
                {
                    FromDate = minDate.ToString("dd/MM/yyyy"),
                    ToDate = maxDate.ToString("dd/MM/yyyy"),
                };
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex.Message;
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableGetEventForMember([FromBody]JtableModelRegistration jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Users.Where(x => x.Active)
                        join b in _context.StaffScheduleWorks on a.Id equals b.MemberId
                        where a.Id == jTablePara.MemberId
                        select new
                        {
                            b.Id,
                            b.DatetimeEvent,
                            b.FrameTime
                        };
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = query.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "DatetimeEvent", "FrameTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertEvent([FromBody]EventModel data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var fromDate = DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var toDate = DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var employess = _context.Users.FirstOrDefault(x => x.Id == data.MemberId);
                if (employess != null)
                {
                    var listEvent = _context.StaffScheduleWorks.Where(x => x.MemberId == data.MemberId 
                    && !x.FlagDelete && x.DatetimeEvent.Date >= fromDate.Date && x.DatetimeEvent.Date <= toDate.Date);
                    if (!listEvent.Any())
                    {
                        for (DateTime date = fromDate; date <= toDate; date = date.AddDays(1))
                        {
                            if ((data.Saturday == false && date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday) ||
                               (data.Sunday == false && date.DayOfWeek != DayOfWeek.Sunday && date.DayOfWeek != DayOfWeek.Saturday) ||
                               (data.Saturday == true && date.DayOfWeek != DayOfWeek.Sunday) ||
                               (data.Sunday == true && date.DayOfWeek != DayOfWeek.Saturday))
                            {
                                string frameTime = data.Morning.ToString() + ";" +
                                 data.Afternoon.ToString() + ";" +
                                 data.Evening.ToString();
                                var evt = new StaffScheduleWork
                                {
                                    MemberId = data.MemberId,
                                    FrameTime = frameTime,
                                    CreatedBy = ESEIM.AppContext.UserName,
                                    CreatedTime = DateTime.Now,
                                    DatetimeEvent = date,
                                };
                                evt.Log = JsonConvert.SerializeObject(evt);
                                _context.StaffScheduleWorks.Add(evt);
                            }
                        }
                        _context.SaveChanges();
                        msg.Title = "Đăng ký thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Nhân viên đã đăng ký lịch làm việc vào khoảng thời gian này";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Nhân viên không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //Registation(Select all)
        [HttpPost]
        public object JTableGetEventTotal([FromBody]EventModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = string.IsNullOrEmpty(jTablePara.FromDate) ? (DateTime?)null : DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(jTablePara.ToDate) ? (DateTime?)null : DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            if (fromDate == null && fromDate == null)
            {
                fromDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                toDate = fromDate.Value.AddMonths(1);
            }
            var query = from a in _context.StaffScheduleWorks
                        join b in _context.Users.Where(x => x.Active) on a.MemberId equals b.Id
                        where ((fromDate == null) || (a.DatetimeEvent.Date >= fromDate)) &&
                        ((toDate == null) || (a.DatetimeEvent.Date <= toDate)) &&
                        (jTablePara.Morning == false || (a.FrameTime.Split(";", StringSplitOptions.None)[0] == "True")) &&
                        (jTablePara.Afternoon == false || (a.FrameTime.Split(";", StringSplitOptions.None)[1] == "True")) &&
                        (jTablePara.Evening == false || (a.FrameTime.Split(";", StringSplitOptions.None)[2] == "True")) &&
                        ((jTablePara.Saturday == false && jTablePara.Sunday == false)
                        || (jTablePara.Saturday == true && jTablePara.Sunday == true && (a.DatetimeEvent.DayOfWeek == DayOfWeek.Saturday || a.DatetimeEvent.DayOfWeek == DayOfWeek.Sunday))
                        || (jTablePara.Saturday == true && jTablePara.Sunday == false && a.DatetimeEvent.DayOfWeek == DayOfWeek.Saturday)
                        || (jTablePara.Saturday == false && jTablePara.Sunday == true && a.DatetimeEvent.DayOfWeek == DayOfWeek.Sunday))
                        select new
                        {
                            a.Id,
                            a.DatetimeEvent,
                            a.FrameTime,
                        };
            var total = query.GroupBy(x => x.DatetimeEvent).Select(y => new
            {
                y.First().Id,
                y.First().DatetimeEvent,
                Morning = y.Where(z => z.FrameTime.Split(";", StringSplitOptions.None)[0] == "True").Count(),
                Afternoon = y.Where(z => z.FrameTime.Split(";", StringSplitOptions.None)[1] == "True").Count(),
                Evening = y.Where(z => z.FrameTime.Split(";", StringSplitOptions.None)[2] == "True").Count(),
            });
            var data = total.OrderBy(x => x.DatetimeEvent).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var count = total.Count();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "DatetimeEvent", "Morning", "Afternoon", "Evening");
            return Json(jdata);
        }
        public class JtableModelRegistration : JTableModel
        {
            public string MemberId { get; set; }
        }
        public class EventModel : JTableModel
        {
            public string MemberId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public bool Morning { get; set; }
            public bool Afternoon { get; set; }
            public bool Evening { get; set; }
            public bool Sunday { get; set; }
            public bool Saturday { get; set; }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cMSItemController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}