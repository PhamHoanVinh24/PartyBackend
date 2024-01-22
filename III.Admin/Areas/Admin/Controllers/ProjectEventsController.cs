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
using Microsoft.AspNetCore.Authorization;
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
    public class ProjectEventsController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCj;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ProjectEventsController(EIMDBContext context, IUploadService upload,
            IStringLocalizer<StaffRegistrationController> stringLocalizer,
            IStringLocalizer<CardJobController> stringLocalizerCj,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCj = stringLocalizerCj;
        }
        
        [AllowAnonymous]
        [Breadcrumb("ViewData.CrumbStaffRegistration", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbStaffRegistration"] = _sharedResources["Sự kiện dự án"];
            return View();
        }

        [HttpGet]
        public object GetListUser(string department)
        {
            return _context.Users.Where(x => x.Active && x.UserName != "admin" 
                && (string.IsNullOrEmpty(department) || x.DepartmentId.Equals(department)))
                .Select(x => new { x.Id, x.GivenName, x.Picture });
        }
        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetAllEvent()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var session = HttpContext.GetSessionUser();
                var listData = new List<Object>();
                var today = DateTime.Now.Date;
                var events = (from a in _context.ProjectAppointments.Where(x => !x.IsDeleted)
                    join b in _context.Projects.Where(x => !x.FlagDeleted) on a.ProjectCode equals b.ProjectCode
                    //join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet
                    //join c in _context.ZoomManages.Where(x => !x.IsDeleted) on a.MeetingId equals c.Id into c1
                    //from c in c1.DefaultIfEmpty()
                    where a.FromDate.HasValue && a.ToDate.HasValue
                    select new
                    {
                        a.Id,
                        a.Title,
                        b.ProjectCode,
                        b.ProjectTitle,
                        a.Note,
                        a.FromDate,
                        a.ToDate,
                        a.Location,
                        a.RepeatType,
                        //Color = a.FromDate.Value.Date >= today ? a.BackgroundColor : "#f1f1f1",
                        IsInFuture = a.FromDate.Value.Date >= today,
                        //Status = b.ValueSet,
                        //StatusCode = a.Status,
                        //MeetingId = c != null ? c.ZoomId : "",
                        //a.AccountZoom,
                        //a.JsonData,
                    }).OrderByDescending(x => x.ToDate);

                foreach (var item in events)
                {
                    var className = item.IsInFuture ? "fc-event-event-custom" : "fc-black";
                    var allowJoin = true;

                    var obj = new
                    {
                        item.Id,
                        item.Title,
                        ItemCode = item.ProjectCode,
                        ItemName = item.ProjectTitle,
                        item.FromDate.Value.Date,
                        sStartTime = item.FromDate.Value.ToString("HH:mm"),
                        sEndTime = item.ToDate.Value.ToString("HH:mm"),
                        item.Note,
                        item.FromDate,
                        item.ToDate,
                        item.Location,
                        item.RepeatType,
                        IsAllData = session.IsAllData || session.RoleCode.Equals("GIAMDOC"),
                        ClassName = className,
                    };

                    listData.Add(obj);
                }

                return Json(listData);
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
        #region Language
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new {x.Name, x.Value})
                .Union(_stringLocalizerCj.GetAllStrings().Select(x => new {x.Name, x.Value}))
                .Union(_sharedResources.GetAllStrings().Select(x => new {x.Name, x.Value}))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}