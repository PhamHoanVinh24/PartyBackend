using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Internal;
using SmartBreadcrumbs.Attributes;
using Quartz;
using DocumentFormat.OpenXml.Drawing;
using static Dropbox.Api.Files.SearchMatchType;
using DocumentFormat.OpenXml.Bibliography;
using Newtonsoft.Json;
using static III.Admin.Controllers.MobileLoginController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffTimeKeepingController : BaseController
    {
        public class SStaffTimeKeepingJtableModel : JTableModel
        {
            public string UserId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Branch { get; set; }
            public string Department { get; set; }
        }
        private readonly EIMDBContext _context;
        private TimeSpan _timeWorking;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<StaffTimeKeepingController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _stringLocalizerCard;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IGoogleApiService _googleAPI;
        private readonly IParameterService _parameterService;

        public StaffTimeKeepingController(EIMDBContext context, IStringLocalizer<StaffTimeKeepingController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment, IGoogleApiService googleAPI, IParameterService parameterService,
            IUploadService upload, IStringLocalizer<CardJobController> stringLocalizerCard)
        {
            _context = context;
            _timeWorking = new TimeSpan(8, 30, 0);
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _googleAPI = googleAPI;
            _parameterService = parameterService;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizerCard = stringLocalizerCard;
        }
        [Breadcrumb("ViewData.CrumbStaffKeeping", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbStaffKeeping"] = _sharedResources["COM_CRUMB_STAFF_KEEPING"];
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody] SStaffTimeKeepingJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            var fromTime = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromTime == null && toTime == null && string.IsNullOrEmpty(jTablePara.UserId))
            {
                fromTime = today;
                toTime = today;
            }
            var query = from a in _context.ShiftLogs
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                         && ((toTime == null) || (a.ChkinTime.Value.Date <= toTime.Value.Date))
                         && (string.IsNullOrEmpty(jTablePara.UserId) || a.CreatedBy == jTablePara.UserId)
                         && (string.IsNullOrEmpty(jTablePara.Department) || b.DepartmentId.Equals(jTablePara.Department))
                         && (string.IsNullOrEmpty(jTablePara.Branch) || b.BranchId.Equals(jTablePara.Branch))
                        select new
                        {
                            a.Id,
                            a.FromDevice,
                            ChkInTime = a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                            a.ChkinLocationTxt,
                            ChkOutTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                            a.ChkoutLocationTxt,
                            a.ShiftCode,
                            a.Note,
                            a.CreatedBy
                        };
            var count = query.Count();
            var data = query.AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FromDevice", "ChkInTime", "ChkinLocationTxt", "ChkOutTime", "ChkoutLocationTxt", "ShiftCode", "Note", "CreatedBy");
            return Json(jdata);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> CheckIn([FromBody] ShiftLogModel shift)
        {
            var msg = new JMessage { Title = "", Error = false };
            if (AllowCheckInOut() == true)
            {
                var session = HttpContext.GetSessionUser();
                try
                {
                    var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                    var currentTime = DateTime.Now;
                    // get condition
                    var shiftSettings = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "SHIFT").Select(x => new ShiftSetting(
                        x.ValueSet,
                        x.CodeSet
                     )
                    );
                    var shifts = new List<ShiftItem>();
                    foreach (var item in shiftSettings)
                    {
                        var shiftItem = item.ValueSet.Split('-');
                        shifts.Add(new ShiftItem(
                            shiftItem,
                            item.ShiftCode
                        ));
                    }

                    var shiftSpans = new List<ShiftSpan>();
                    try
                    {
                        shiftSpans = shifts.Where(x => x.ShiftArray.Length >= 2).Select(x => new ShiftSpan()
                        {
                            BeginTime = DateTime.ParseExact(x.ShiftArray[0].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                            EndTime = DateTime.ParseExact(x.ShiftArray[1].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                            ShiftCode = x.ShiftCode
                        }).ToList();
                    }
                    catch (Exception ex)
                    {
                        shiftSpans = new List<ShiftSpan>();
                    }
                    var shiftSpan = shiftSpans.FirstOrDefault(x => (x.BeginTime >= currentTime && currentTime <= x.EndTime));
                    var shifLog = new ShiftLog
                    {
                        ShiftCode = currentTime.ToString("HHmmssddMMyyyy"),
                        ChkinTime = currentTime,
                        ChkinLocationGps = string.Format("[{0},{1}]", shift.Lat, shift.Lon),
                        ChkinLocationTxt = await _googleAPI.GetAddressForCoordinates(shift.Lat, shift.Lon),
                        IsChkinRealTime = true,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = currentTime,
                        FromDevice = "Desktop/Laptop",
                        Ip = ip,
                        WorkingShiftCode = shiftSpan != null ? shiftSpan.ShiftCode : ""
                    };
                    _context.ShiftLogs.Add(shifLog);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["STK_MSG_CHECK_IN_SUCCESS"];
                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STK_MSG_PLS_CHECK_OUT"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult CheckInOutManual([FromBody] ShiftLogManual shift)
        {
            var msg = new JMessage { Title = "", Error = false };
            var session = HttpContext.GetSessionUser();
            try
            {
                var checkInTime = !string.IsNullOrEmpty(shift.ChkinTime) ? DateTime.ParseExact(shift.ChkinTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var checkOutTime = !string.IsNullOrEmpty(shift.ChkoutTime) ? DateTime.ParseExact(shift.ChkoutTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                // get condition
                var shiftSettings = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "SHIFT").Select(x => new ShiftSetting(
                    x.ValueSet,
                    x.CodeSet
                 )
                );
                var shifts = new List<ShiftItem>();
                foreach (var item in shiftSettings)
                {
                    var shiftItem = item.ValueSet.Split('-');
                    shifts.Add(new ShiftItem(
                        shiftItem,
                        item.ShiftCode
                    ));
                }

                var shiftSpans = new List<ShiftSpan>();
                try
                {
                    shiftSpans = shifts.Where(x => x.ShiftArray.Length >= 2).Select(x => new ShiftSpan()
                    {
                        BeginTime = DateTime.ParseExact(x.ShiftArray[0].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                        EndTime = DateTime.ParseExact(x.ShiftArray[1].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                        ShiftCode = x.ShiftCode
                    }).ToList();
                }
                catch (Exception ex)
                {
                    shiftSpans = new List<ShiftSpan>();
                }
                var shiftSpan = shiftSpans.FirstOrDefault(x => (x.BeginTime >= checkInTime && checkInTime <= x.EndTime) || (x.BeginTime >= checkInTime && checkInTime <= x.EndTime));
                var shifLog = new ShiftLog
                {
                    ShiftCode = checkInTime.Value.ToString("HHmmssddMMyyyy") + "_" + checkOutTime.Value.ToString("HHmmssddMMyyyy"),
                    ChkinTime = checkInTime,
                    ChkoutTime = checkOutTime,
                    ChkinLocationTxt = shift.ChkinLocationTxt,
                    ChkoutLocationTxt = shift.ChkoutLocationTxt,
                    IsChkinRealTime = false,
                    IsChkoutRealTime = false,
                    ChkinPicRealtime = shift.ChkinPicRealtime,
                    ChkoutPicRealtime = shift.ChkoutPicRealtime,
                    CreatedBy = shift.UserName,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Desktop/Laptop",
                    Ip = ip,
                    Note = shift.Note,
                    WorkingShiftCode = shiftSpan != null ? shiftSpan.ShiftCode : "",
                    IsBussiness = shift.IsBussiness,
                    BussinessLocation = shift.BussinessLocation
                };
                _context.ShiftLogs.Add(shifLog);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["STK_MSG_ADD_WORK_SHIFT_SUCCESS"];
                msg.Object = shifLog;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> CheckOut([FromBody] ShiftLogModel shift)
        {
            var msg = new JMessage();
            if (AllowCheckInOut() == false)
            {
                try
                {
                    var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                    var currentTime = DateTime.Now;
                    var shifLog = _context.ShiftLogs.LastOrDefault(x => x.ShiftCode == shift.ShiftCode);
                    if (shifLog != null)
                    {
                        shifLog.ShiftCode = shifLog.ShiftCode + "_" + currentTime.ToString("HHmmssddMMyyyy");
                        shifLog.ChkoutLocationGps = string.Format("[{0},{1}]", shift.Lat, shift.Lon);
                        shifLog.ChkoutLocationTxt = await _googleAPI.GetAddressForCoordinates(shift.Lat, shift.Lon);
                        shifLog.ChkoutTime = currentTime;
                        shifLog.IsChkoutRealTime = true;
                        shifLog.Ip = ip;
                        shifLog.FromDevice = "Desktop/Laptop";

                        var itemSession = _context.SessionWorkResults.Where(x => !x.IsDeleted && x.ShiftCode == shift.ShiftCode);
                        if (itemSession.Any())
                        {
                            foreach (var item in itemSession)
                            {
                                item.ShiftCode = shifLog.ShiftCode;
                                _context.SessionWorkResults.Update(item);
                            }
                        }
                        var itemSessionResult = _context.SessionWorkResults.Where(x => !x.IsDeleted && x.ShiftCode == shift.ShiftCode);
                        if (itemSessionResult.Any())
                        {
                            foreach (var item in itemSessionResult)
                            {
                                item.ShiftCode = shifLog.ShiftCode;
                                _context.SessionWorkResults.Update(item);
                            }
                        }

                        _context.ShiftLogs.Update(shifLog);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["STK_MSG_CHECK_OUT_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["STK_MSG_NOT_FOUND_WORK_SHIFT"];
                    }
                }
                catch (Exception ex)
                {
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    msg.Error = true;
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STK_MSG_PLS_CHECK_IN"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCheckInOutManual([FromBody] ShiftLogManual shift)
        {
            var msg = new JMessage();
            try
            {
                var checkInTime = !string.IsNullOrEmpty(shift.ChkinTime) ? DateTime.ParseExact(shift.ChkinTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var checkOutTime = !string.IsNullOrEmpty(shift.ChkoutTime) ? DateTime.ParseExact(shift.ChkoutTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                var currentTime = DateTime.Now;
                var shifLog = _context.ShiftLogs.LastOrDefault(x => x.ShiftCode == shift.ShiftCode);
                if (shifLog != null)
                {
                    // get condition
                    var shiftSettings = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "SHIFT").Select(x => new ShiftSetting(
                        x.ValueSet,
                        x.CodeSet
                     )
                    );
                    var shifts = new List<ShiftItem>();
                    foreach (var item in shiftSettings)
                    {
                        var shiftItem = item.ValueSet.Split('-');
                        shifts.Add(new ShiftItem(
                            shiftItem,
                            item.ShiftCode
                        ));
                    }

                    var shiftSpans = new List<ShiftSpan>();
                    try
                    {
                        shiftSpans = shifts.Where(x => x.ShiftArray.Length >= 2).Select(x => new ShiftSpan()
                        {
                            BeginTime = DateTime.ParseExact(x.ShiftArray[0].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                            EndTime = DateTime.ParseExact(x.ShiftArray[1].Trim(), "HH:mm", CultureInfo.InvariantCulture),
                            ShiftCode = x.ShiftCode
                        }).ToList();
                    }
                    catch (Exception ex)
                    {
                        shiftSpans = new List<ShiftSpan>();
                    }
                    var shiftSpan = shiftSpans.FirstOrDefault(x => (x.BeginTime >= checkInTime && checkInTime <= x.EndTime) || (x.BeginTime >= checkInTime && checkInTime <= x.EndTime));
                    shifLog.ShiftCode = checkInTime.Value.ToString("HHmmssddMMyyyy") + "_" + checkOutTime.Value.ToString("HHmmssddMMyyyy");
                    shifLog.ChkinTime = checkInTime;
                    shifLog.ChkinLocationTxt = shift.ChkinLocationTxt;
                    shifLog.ChkoutLocationTxt = shift.ChkoutLocationTxt;
                    shifLog.ChkoutTime = checkOutTime;
                    shifLog.IsChkoutRealTime = false;
                    shifLog.IsChkinRealTime = false;
                    shifLog.Ip = ip;
                    shifLog.FromDevice = "Desktop/Laptop";
                    shifLog.ChkoutPicRealtime = shift.ChkoutPicRealtime;
                    shifLog.ChkinPicRealtime = shift.ChkinPicRealtime;
                    shifLog.Note = shift.Note;
                    shifLog.WorkingShiftCode = shiftSpan != null ? shiftSpan.ShiftCode : "";
                    shifLog.IsBussiness = shift.IsBussiness;
                    shifLog.BussinessLocation = shift.BussinessLocation;
                    _context.ShiftLogs.Update(shifLog);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["STK_MSG_UPDATE_WORK_SHIFT_SUCCESS"];
                    msg.Object = shifLog;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["STK_MSG_NOT_FOUND_WORK_SHIFT"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetItemShift(int id)
        {
            var data = _context.ShiftLogs.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object GetCheckInOutManual(string shiftCode)
        {
            var data = _context.ShiftLogs.FirstOrDefault(x => x.ShiftCode == shiftCode);
            var shift = new ShiftLogManual
            {
                ShiftCode = data.ShiftCode,
                ChkinTime = data.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                ChkinLocationTxt = data.ChkinLocationTxt,
                ChkoutTime = data.ChkoutTime.HasValue ? data.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                ChkoutLocationTxt = data.ChkoutLocationTxt,
                ChkinPicRealtime = data.ChkinPicRealtime,
                ChkoutPicRealtime = data.ChkoutPicRealtime,
                Note = data.Note,
                UserName = data.CreatedBy,
                IsChkinRealTime = data.IsChkinRealTime,
                IsBussiness = data.IsBussiness,
                BussinessLocation = data.BussinessLocation
            };
            return shift;
        }

        [HttpPost]
        public JsonResult GetLastInOut()
        {
            var msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var isCheckIn = false;
                var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName && x.Flag != "DELETED" && x.Flag != "CANCEL");
                if (data != null)
                {
                    if (data.ChkoutTime == null)
                        isCheckIn = true;
                }
                else
                {
                    isCheckIn = false;
                }

                msg.Object = new
                {
                    ShiftCode = data != null ? data.ShiftCode : "",
                    IsCheckIn = isCheckIn
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkShiftCheckInOuts.Update(data);
                }
                _context.SaveChanges();
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [NonAction]
        public bool AllowCheckInOut()
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName);
            if (data != null)
            {
                if (data.ChkinTime.HasValue && data.ChkoutTime.HasValue)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return true;
            }
        }

        //Time working from date to date
        public ActionResult ExportExcel(string uId, string fromDate, string toDate)
        {
            var today = DateTime.Today;
            var fromTime = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromTime == null && toTime == null)
            {
                fromTime = today;
                toTime = today;
            }
            var listTimeWorking = new List<TimeWorkingSheet>();
            if (!string.IsNullOrEmpty(uId))
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(uId) || a.CreatedBy.Equals(uId))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.ChkoutTime.Value.Date);
                if (query.Any())
                {
                    var index = 1;
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss"))) + "], ";
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                            timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");

                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = index;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";

                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);

                        listTimeWorking.Add(timeSheet);
                        index++;
                    }
                }
            }
            else
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(uId) || a.CreatedBy.Equals(uId))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.CreatedBy);

                if (query.Any())
                {
                    var index = 1;
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var countShift = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                //timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
                                countShift++;
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                        {
                            if (item.FirstOrDefault().ChkoutTime.Value.Date != item.LastOrDefault().ChkoutTime.Value.Date)
                            {
                                if (string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }
                            else
                            {
                                if (string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }

                        }
                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = index;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";

                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);
                        timeSheet.Detail = string.Format("Số ca: {0}", countShift);
                        listTimeWorking.Add(timeSheet);
                        index++;
                    }
                }
            }
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Time Working");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;

            sheetRequest.Range["A1:F1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Thời gian làm việc";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            //sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listTimeWorking, 2, 1, true);

            sheetRequest["A2"].Text = "STT";
            sheetRequest["B2"].Text = "Tài khoản";
            sheetRequest["C2"].Text = "Tên nhân viên";
            sheetRequest["D2"].Text = "Ngày tạo";
            sheetRequest["E2"].Text = "Tổng số giờ làm";
            sheetRequest["F2"].Text = "Chi tiết";

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:F2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:F2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportStaffTime" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        [HttpPost]
        public JsonResult JtableTimeWorking([FromBody] TimeWorkingSheetModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var today = DateTime.Today;
            var fromTime = !string.IsNullOrEmpty(jTablepara.FromDate) ? DateTime.ParseExact(jTablepara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(jTablepara.ToDate) ? DateTime.ParseExact(jTablepara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromTime == null && toTime == null)
            {
                fromTime = today;
                toTime = today;
            }
            if (!string.IsNullOrEmpty(jTablepara.UserId))
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(jTablepara.UserId) || a.CreatedBy.Equals(jTablepara.UserId))

                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.ChkoutTime.Value.Date);
                var listTimeWorking = new List<TimeWorkingSheet>();
                if (query.Any())
                {
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss"))) + "], ";
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                            timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");

                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = item.First().Id;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";
                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);

                        listTimeWorking.Add(timeSheet);
                    }
                }
                var count = listTimeWorking.Count();
                var data = listTimeWorking.Skip(intBeginFor).Take(jTablepara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "GivenName", "DateWorking", "TimeWorking", "Detail");
                return Json(jdata);
            }
            else
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             join b in _context.Users on a.CreatedBy equals b.UserName
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(jTablepara.UserId) || a.CreatedBy.Equals(jTablepara.UserId))
                             && (string.IsNullOrEmpty(jTablepara.Department) || b.DepartmentId.Equals(jTablepara.Department))
                             && (string.IsNullOrEmpty(jTablepara.Branch) || b.BranchId.Equals(jTablepara.Branch))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.CreatedBy);
                var listTimeWorking = new List<TimeWorkingSheet>();
                if (query.Any())
                {
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var countShift = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                //timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
                                countShift++;
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                        {
                            if (item.FirstOrDefault().ChkoutTime.Value.Date != item.LastOrDefault().ChkoutTime.Value.Date)
                            {
                                if (string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(jTablepara.FromDate) && !string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }
                            else
                            {
                                if (string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(jTablepara.FromDate) && !string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }

                        }

                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = item.First().Id;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";

                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);
                        timeSheet.Detail = string.Format("Số ca: {0}", countShift);

                        listTimeWorking.Add(timeSheet);
                    }
                }
                var count = listTimeWorking.Count();
                var data = listTimeWorking.Skip(intBeginFor).Take(jTablepara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "GivenName", "DateWorking", "TimeWorking", "Detail");
                return Json(jdata);
            }
        }

        [NonAction]
        public string GenerateShiftCode(string uId)
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data1 = _context.WorkShiftCheckInOuts.Where(x => x.CreatedTime.Year == yearNow && x.CreatedTime.Month == monthNow).ToList();
            var data = _context.Users.FirstOrDefault(x => x.Id.Equals(uId));
            if (data1.Count > 0)
            {
                no = data1.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}", "SHIFT_", data.UserName + "_", noText);

            return reqCode;
        }

        [NonAction]
        public string GetShiftCode(string uId)
        {
            string shifCode = "";
            var id = _context.WorkShiftCheckInOuts.Where(x => x.UserId.Equals(uId) && !x.IsDeleted).Max(x => x.Id);
            var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
            if (data.Action == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.CheckIn))
            {
                shifCode = data.ShiftCode;

            }
            return shifCode;
        }

        [HttpPost]
        public JsonResult GetAllShiftOfUser(string userName)
        {
            //var session = HttpContext.GetSessionUser();
            var shifts = _context.ShiftLogs.Where(x => x.CreatedBy == userName).OrderByDescending(x => x.ChkinTime).ThenByDescending(x => x.ChkoutTime);
            return Json(shifts);
        }
        [HttpPost]
        public ShiftLogTemp GetLastShiftLog()
        {
            var session = HttpContext.GetSessionUser();
            var shiftTemp = new ShiftLogTemp();
            var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName && x.Flag != "DELETED" && x.Flag != "CANCEL");

            if (data != null)
            {
                var getShiftBefore = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName && x.Flag != "DELETED" && x.Flag != "CANCEL" && x.Id < data.Id);
                shiftTemp.ShiftCode = data.ShiftCode;
                shiftTemp.ChkoutTime = data.ChkoutTime;
                shiftTemp.ChkinTime = data.ChkinTime;
                shiftTemp.ChkinLocationTxt = data.ChkinLocationTxt;
                shiftTemp.ChkoutLocationTxt = data.ChkoutLocationTxt;
                if (getShiftBefore != null)
                {
                    shiftTemp.ShiftCodeBefore = "[ In: " + getShiftBefore.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy") + ", Out: " + (getShiftBefore.ChkoutTime.HasValue ? getShiftBefore.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy") : "") + "]";
                }
                else
                {
                    shiftTemp.ShiftCodeBefore = "[Chưa có ca làm việc trước đây]";
                }

                if (data.ChkoutTime == null)
                    shiftTemp.IsCheckIn = true;
            }
            else
            {
                shiftTemp.IsCheckIn = false;
            }
            return shiftTemp;
        }

        [HttpPost]
        public object ExportExcelTimeSheet([FromBody] ExcelExportTimeSheetModel data)
        {
            var msg = new JMessage();
            var filePath = "/files/Template/Cham_cong.xlsx";

            string path = filePath;
            var pathUpload = string.Concat(_hostingEnvironment.WebRootPath, path);
            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile fileUpload = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");
            var listData = data.ListEmployeeDetail;

            // Read content from file
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            IWorkbook workbook = application.Workbooks.Open(fileUpload.OpenReadStream());
            IWorksheet sheetRequest = workbook.Worksheets[0];

            workbook.SetSeparators(';', ',');

            var countDelete = 25 - listData.Count;
            sheetRequest.DeleteRow(8, countDelete);

            IStyle style = workbook.Styles.Add("NewStyle");
            style.Color = Color.Gray;
            style.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
            style.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;

            for (int i = 0; i < listData.Count; i++)
            {
                sheetRequest.Range["A2"].Value2 = listData[i].DepartmentName;
                sheetRequest.Range["A3"].Value2 = string.Format("BẢNG CHẤM CÔNG THÁNG {0} NĂM {1}", listData[i].Month, listData[i].Year);
                sheetRequest.Range["F4"].Value2 = data.TotalWork;
                sheetRequest.Range["C6"].Value2 = string.Format("Tháng {0}", listData[i].Month);

                var rowUserManager = listData.Count + 19;

                sheetRequest.Range["B" + rowUserManager].Value2 = data.UserManager;
                sheetRequest.Range["AA" + rowUserManager].Value2 = data.UserCreated;

                var row = i + 8;
                sheetRequest.Range["A" + row].Value2 = (i + 1);
                sheetRequest.Range["B" + row].Value2 = listData[i].Name.ToString();
                sheetRequest.Range["AP" + row].Value2 = listData[i].E;
                sheetRequest.Range["AQ" + row].Value2 = listData[i].E1;
                sheetRequest.Range["AR" + row].Value2 = listData[i].E2;
                sheetRequest.Range["AS" + row].Value2 = listData[i].E3;
                sheetRequest.Range["AT" + row].Value2 = listData[i].E4;

                for (int j = 0; j < 31; j++)
                {
                    var rowDay = 8 + i;
                    var colDay = 3 + j;
                    sheetRequest.Range[rowDay, colDay].Value2 = listData[i].ListData[j].Value;
                    if (listData[i].ListData[j].HoliDay && listData[i].ListData[j].Value == "")
                    {
                        sheetRequest.Range[rowDay, colDay].CellStyle = style;
                    }
                }

                //Các cột tổng
                //sheetRequest.Range["AH" + row].Value2 = (listData[i].G != null && listData[i].G != 0) ? listData[i].G.ToString() : "";//Phép
                //sheetRequest.Range["AI" + row].Value2 = (listData[i].H != null && listData[i].H != 0) ? listData[i].H.ToString() : "";
                //sheetRequest.Range["AJ" + row].Value2 = (listData[i].I != null && listData[i].I != 0) ? listData[i].I.ToString() : "";
                //sheetRequest.Range["AK" + row].Value2 = (listData[i].J != null && listData[i].J != 0) ? listData[i].J.ToString() : "";
                //sheetRequest.Range["AL" + row].Value2 = (listData[i].K != null && listData[i].K != 0) ? listData[i].K.ToString() : "";
                //sheetRequest.Range["AM" + row].Value2 = (listData[i].L != null && listData[i].L != 0) ? listData[i].L.ToString() : "";
                //sheetRequest.Range["AN" + row].Value2 = (listData[i].M != null && listData[i].M != 0) ? listData[i].M.ToString() : "";
                //sheetRequest.Range["AO" + row].Value2 = (listData[i].N != null && listData[i].N != 0) ? listData[i].N.ToString() : "";
                //sheetRequest.Range["AP" + row].Value2 = (listData[i].O != null && listData[i].O != 0) ? listData[i].O.ToString() : "";
            }

            var fileName = "ChamCong_" + DateTime.Now.ToString("ddMMyyy_hhmm") + ".xlsx";
            var pathFile = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile\\" + fileName;
            var pathFileDownLoad = "uploads\\tempFile\\" + fileName;
            FileStream stream = new FileStream(pathFile, FileMode.Create, FileAccess.ReadWrite);
            workbook.SaveAs(stream);
            stream.Dispose();

            var obj = new
            {
                fileName,
                pathFile = pathFileDownLoad
            };

            return obj;
        }

        [HttpGet]
        public object GetListUserInDepartment(string departmentCode, string branch)
        {
            var listMember = (from a in _context.AdUserDepartments.Where(x => !x.IsDeleted && x.Branch.Equals(branch)
                                && x.DepartmentCode.Equals(departmentCode))
                              join b in _context.Users on a.UserId equals b.Id
                              join c in _context.Roles.Where(x => x.Status) on a.RoleId equals c.Id
                              join d in _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled) on a.DepartmentCode equals d.DepartmentCode
                              select new MemberInDepartment
                              {
                                  UserId = b.Id,
                                  GivenName = b.GivenName,
                                  Type = 2,
                                  DepartmentId = b.DepartmentId,
                                  RoleSys = c.Title,
                                  Priority = c.Priority,
                                  DepartmentName = d.Title,
                                  Branch = a.Branch,
                                  UserName = b.UserName,
                                  Picture = b.Picture
                              }).OrderByDescending(x => x.Priority).GroupBy(x => new { x.UserId, x.DepartmentId });
            var members = listMember.Select(x => new
            {
                x.Key.UserId,
                x.First().UserName,
                x.Key.DepartmentId,
                x.First().Type,
                x.First().GivenName,
                x.First().RoleSys,
                x.First().Priority,
                x.First().DepartmentName,
                x.First().Branch,
                x.First().Picture
            });
            return members;
        }

        [HttpPost]
        public object GetAllPlanSchedule(string month, string departmentCode, string userName)
        {
            DateTime time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            //var userName = "";
            var userId = "";
            if (!string.IsNullOrEmpty(userName))
            {
                var aspNetUser = _context.Users.FirstOrDefault(x => x.Active && x.UserName == userName);
                userId = aspNetUser != null ? aspNetUser.Id : "";
            }

            var planSchedules = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(userId) || x.UserId.Equals(userId))
            && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month)))
            && x.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))).ToList();

            var planScheduleInitAct = (from a in planSchedules
                                       join b in _context.WorkflowInstances.Where(x => x.IsDeleted == false && x.ObjectType == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))
                                       on a.Id.ToString() equals b.ObjectInst
                                       join c in _context.ActivityInstances.Where(x => !x.IsDeleted && x.Type == "TYPE_ACTIVITY_INITIAL") on b.WfInstCode equals c.WorkflowCode
                                       join d in _context.Users.Where(x => x.Active && x.DepartmentId == departmentCode) on a.UserId equals d.Id
                                       join e in _context.HREmployees.Where(x => x.flag == 1) on d.EmployeeCode equals e.Id.ToString()
                                       select new
                                       {
                                           //WfInst = b,
                                           a.Title,
                                           a.UserId,
                                           c.ActivityInstCode,
                                           c.ActivityCode,
                                           d.UserName,
                                           d.GivenName,
                                           d.DepartmentId
                                       }).ToList().GroupBy(x => x.UserId);
            var listScheduleDataUser = new List<ScheduleDataUser>();
            foreach (var user in planScheduleInitAct)
            {
                var planScheduleDatas = new List<PlanScheduleData>();
                foreach (var item in user.ToList())
                {
                    var groupSession = _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.ActCode == item.ActivityInstCode)
                        .GroupBy(x => x.SessionId).Select(p => new
                            SessionLogger
                        {
                            SessionId = p.Key,
                            Color = "",
                            Index = 0
                        }).ToList();

                    var index = 1;
                    foreach (var g in groupSession)
                    {
                        g.Index = index;
                        g.Color = index % 2 == 0 ? "" : "#eceeef";
                        index++;
                    }

                    var listAttr = (from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.ActCode == item.ActivityInstCode)
                                    join c in _context.Users on a.CreatedBy equals c.UserName
                                    join e in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals e.AttrCode
                                    join d in groupSession on a.SessionId equals d.SessionId
                                    orderby d.Index
                                    select new
                                    {
                                        ID = a.ID,
                                        AttrCode = a.AttrCode,
                                        Title = e.AttrName,
                                        Value = a.Value,
                                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == e.AttrUnit)
                                            .ValueSet ?? "",
                                        CreatedBy = c.GivenName,
                                        CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                        DataTypeAttr = e.AttrDataType,
                                        SessionId = a.SessionId,
                                        Color = d.Color,
                                        IsTypeFile = e.AttrDataType == "ATTR_DATA_TYPE_FILE" ? true : false,
                                        FilePath = !string.IsNullOrEmpty(a.FilePath) ? a.FilePath : "",
                                        AttrGroup = e.AttrGroup
                                    }).OrderByDescending(x => x.ID).GroupBy(x => new { x.SessionId, x.AttrGroup }).Select(x => new
                                    {
                                        x.Key.SessionId,
                                        x.Key.AttrGroup,
                                        DataAttrWf = x.DistinctBy(y => y.ID)
                                    }).ToList();
                    var attrData = listAttr.FirstOrDefault(x => x.AttrGroup == "CARD_DATA_LOGGER20230322201959");
                    try
                    {
                        var data = new PlanScheduleData()
                        {
                            Content = attrData.DataAttrWf.Any(x => x.AttrCode == "CONTENT") ? attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "CONTENT").Value : "",
                            Location = attrData.DataAttrWf.Any(x => x.AttrCode == "LOCATION") ? attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "LOCATION").Value : "",
                            Transportation = attrData.DataAttrWf.Any(x => x.AttrCode == "TRANSPORTATION") ? attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "TRANSPORTATION").Value : "",
                            StartTime = attrData.DataAttrWf.Any(x => x.AttrCode == "START_TIME") ? DateTime.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "START_TIME").Value) : (DateTime?)null,
                            EndTime = attrData.DataAttrWf.Any(x => x.AttrCode == "END_TIME") ? DateTime.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "END_TIME").Value) : (DateTime?)null,
                            NumOvtNormal = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_OVT_NORMAL") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_OVT_NORMAL").Value) : 0,
                            NumOvtHoliday = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_OVT_HOLIDAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_OVT_HOLIDAY").Value) : 0,
                            NumKv1Normal = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV1_NORMAL") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV1_NORMAL").Value) : 0,
                            NumKv1Holiday = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV1_HOLIDAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV1_HOLIDAY").Value) : 0,
                            NumKv1Stay = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV1_STAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV1_STAY").Value) : 0,
                            NumKv2Normal = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV2_NORMAL") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV2_NORMAL").Value) : 0,
                            NumKv2Holiday = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV2_HOLIDAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV2_HOLIDAY").Value) : 0,
                            NumKv2Stay = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV2_STAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV2_STAY").Value) : 0,
                        };
                        data.StartDay = data.StartTime.HasValue ? data.StartTime.Value.ToString("d/M/yyyy") : "";
                        data.EndDay = data.EndTime.HasValue ? data.EndTime.Value.ToString("d/M/yyyy") : "";
                        data.StartHour = data.StartTime.HasValue ? data.StartTime.Value.ToString("H\\hmm") : "";
                        data.EndHour = data.EndTime.HasValue ? data.EndTime.Value.ToString("H\\hmm") : "";
                        planScheduleDatas.Add(data);
                    }
                    catch (Exception ex)
                    {
                        planScheduleDatas.Add(new PlanScheduleData() { Content = item.Title });
                    }
                }
                listScheduleDataUser.Add(new ScheduleDataUser()
                {
                    UserId = user.Key,
                    UserName = user.FirstOrDefault().UserName,
                    GivenName = user.FirstOrDefault().GivenName,
                    DepartmentCode = user.FirstOrDefault().DepartmentId,
                    ListScheduleData = planScheduleDatas,
                });
            }
            return listScheduleDataUser;
        }
        [HttpPost]
        public object GetAllOvertime(string month, string userName)
        {
            DateTime time = !string.IsNullOrEmpty(month) ? DateTime.ParseExact(month, "MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;

            //var userName = "";
            var userId = "";
            if (!string.IsNullOrEmpty(userName))
            {
                var aspNetUser = _context.Users.FirstOrDefault(x => x.Active && x.UserName == userName);
                userId = aspNetUser != null ? aspNetUser.Id : "";
            }

            var planSchedules = _context.WorkShiftCheckInOuts.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(userId) || x.UserId.Equals(userId))
            && (x.ActionTime.Month.Equals(time.Month) || (x.ActionTo != null && x.ActionTo.Value.Month.Equals(time.Month)))
            && x.Action.Equals(EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))).ToList();

            var planScheduleInitAct = (from a in planSchedules
                                       join b in _context.WorkflowInstances.Where(x => x.IsDeleted == false && x.ObjectType == EnumHelper<StaffStatus>.GetDisplayValue(StaffStatus.PlanSchedule))
                                       on a.Id.ToString() equals b.ObjectInst
                                       join c in _context.ActivityInstances.Where(x => !x.IsDeleted && x.Type == "TYPE_ACTIVITY_INITIAL") on b.WfInstCode equals c.WorkflowCode
                                       select new
                                       {
                                           WfInst = b,
                                           a.Title,
                                           c.ActivityInstCode,
                                           c.ActivityCode
                                       }).ToList();
            var planScheduleDatas = new List<PlanScheduleData>();
            foreach (var item in planScheduleInitAct)
            {
                var wfInst = item.WfInst;
                //var listAttr = new List<DataAtt>();
                if (wfInst != null && !string.IsNullOrEmpty(wfInst.DataAttr))
                {
                    //listAttr = JsonConvert.DeserializeObject<List<DataAtt>>(wfInst.DataAttr);
                    //var attrData = listAttr.Where(p => !string.IsNullOrEmpty(p.ActCode) && p.ActCode.Equals(item.ActivityCode))
                    //    .ToList().FirstOrDefault(x => x.AttrGroup == "CARD_DATA_LOGGER20230322201959");

                    var groupSession = _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.ActCode == item.ActivityInstCode)
                        .GroupBy(x => x.SessionId).Select(p => new
                            SessionLogger
                        {
                            SessionId = p.Key,
                            Color = "",
                            Index = 0
                        }).ToList();

                    var index = 1;
                    foreach (var g in groupSession)
                    {
                        g.Index = index;
                        g.Color = index % 2 == 0 ? "" : "#eceeef";
                        index++;
                    }

                    var listAttr = (from a in _context.ActivityAttrDatas.Where(x => !x.IsDeleted && x.ActCode == item.ActivityInstCode)
                                    join c in _context.Users on a.CreatedBy equals c.UserName
                                    join e in _context.AttrSetups.Where(x => !x.IsDeleted) on a.AttrCode equals e.AttrCode
                                    join d in groupSession on a.SessionId equals d.SessionId
                                    orderby d.Index
                                    select new
                                    {
                                        ID = a.ID,
                                        AttrCode = a.AttrCode,
                                        Title = e.AttrName,
                                        Value = a.Value,
                                        Unit = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == e.AttrUnit)
                                            .ValueSet ?? "",
                                        CreatedBy = c.GivenName,
                                        CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                        DataTypeAttr = e.AttrDataType,
                                        SessionId = a.SessionId,
                                        Color = d.Color,
                                        IsTypeFile = e.AttrDataType == "ATTR_DATA_TYPE_FILE" ? true : false,
                                        FilePath = !string.IsNullOrEmpty(a.FilePath) ? a.FilePath : "",
                                        AttrGroup = e.AttrGroup
                                    }).OrderByDescending(x => x.ID).GroupBy(x => new { x.SessionId, x.AttrGroup }).Select(x => new
                                    {
                                        x.Key.SessionId,
                                        x.Key.AttrGroup,
                                        DataAttrWf = x.DistinctBy(y => y.ID)
                                    }).ToList();
                    var attrData = listAttr.FirstOrDefault(x => x.AttrGroup == "CARD_DATA_LOGGER20230322201959");
                    try
                    {
                        var data = new PlanScheduleData()
                        {
                            Content = attrData.DataAttrWf.Any(x => x.AttrCode == "CONTENT") ? attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "CONTENT").Value : "",
                            Location = attrData.DataAttrWf.Any(x => x.AttrCode == "LOCATION") ? attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "LOCATION").Value : "",
                            Transportation = attrData.DataAttrWf.Any(x => x.AttrCode == "TRANSPORTATION") ? attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "TRANSPORTATION").Value : "",
                            StartTime = attrData.DataAttrWf.Any(x => x.AttrCode == "START_TIME") ? DateTime.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "START_TIME").Value) : (DateTime?)null,
                            EndTime = attrData.DataAttrWf.Any(x => x.AttrCode == "END_TIME") ? DateTime.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "END_TIME").Value) : (DateTime?)null,
                            NumKv1Normal = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV1_NORMAL") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV1_NORMAL").Value) : 0,
                            NumKv1Holiday = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV1_HOLIDAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV1_HOLIDAY").Value) : 0,
                            NumKv1Stay = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV1_STAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV1_STAY").Value) : 0,
                            NumKv2Normal = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV2_NORMAL") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV2_NORMAL").Value) : 0,
                            NumKv2Holiday = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV2_HOLIDAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV2_HOLIDAY").Value) : 0,
                            NumKv2Stay = attrData.DataAttrWf.Any(x => x.AttrCode == "NUM_KV2_STAY") ? int.Parse(attrData.DataAttrWf.FirstOrDefault(x => x.AttrCode == "NUM_KV2_STAY").Value) : 0,
                        };
                        data.StartDay = data.StartTime.HasValue ? data.StartTime.Value.ToString("d/M/yyyy") : "";
                        data.EndDay = data.EndTime.HasValue ? data.EndTime.Value.ToString("d/M/yyyy") : "";
                        data.StartHour = data.StartTime.HasValue ? data.StartTime.Value.ToString("H\\hmm") : "";
                        data.EndHour = data.EndTime.HasValue ? data.EndTime.Value.ToString("H\\hmm") : "";
                        planScheduleDatas.Add(data);
                    }
                    catch (Exception ex)
                    {
                        planScheduleDatas.Add(new PlanScheduleData() { Content = item.Title });
                    }
                }
            }
            return planScheduleDatas;
        }
        public class ScheduleDataUser
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public string DepartmentCode { get; set; }
            public List<PlanScheduleData> ListScheduleData { get; set; }
        }
        public class SessionLogger
        {
            public string Color { get; set; }
            public string SessionId { get; set; }
            public int Index { get; set; }
        }
        public class MemberInDepartment
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public int Type { get; set; }
            public string DepartmentId { get; set; }
            public string RoleSys { get; set; }
            public int? Priority { get; set; }
            public string DepartmentName { get; set; }
            public string Branch { get; set; }
            public string Picture { get; set; }
        }
        public class TimeWorkingSheet
        {
            public int ID { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public string DateWorking { get; set; }
            public string TimeWorking { get; set; }
            public string Detail { get; set; }
        }
        public class TimeWorkingSheetModel : JTableModel
        {
            public int ID { get; set; }
            public string UserName { get; set; }
            public string UserId { get; set; }
            public string TimeWorking { get; set; }
            public string Detail { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Branch { get; set; }
            public string Department { get; set; }
        }

        public class ExcelExportTimeSheetModel
        {
            public List<ExcelExportTimeSheet> ListEmployeeDetail { get; set; }
            public string UserManager { get; set; }
            public string UserCreated { get; set; }
            public string TotalWork { get; set; }
        }

        public class ExcelExportTimeSheet
        {
            public ExcelExportTimeSheet()
            {
                ListData = new List<Data>();
            }
            public string Code { get; set; }
            public string Name { get; set; }
            public string SalaryLevel { get; set; }
            public string SalaryRatio { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
            public int? Month { get; set; }
            public int? Year { get; set; }
            public double? D { get; set; }
            public double? E { get; set; }
            public double? E1 { get; set; }
            public double? E2 { get; set; }
            public double? E3 { get; set; }
            public double? E4 { get; set; }
            public double? F { get; set; }
            public double? G { get; set; }
            public double? H { get; set; }
            public double? I { get; set; }
            public double? J { get; set; }
            public double? K { get; set; }
            public double? L { get; set; }
            public double? M { get; set; }
            public double? N { get; set; }
            public double? O { get; set; }
            public double? P { get; set; }
            public double? Q { get; set; }
            public double? R { get; set; }
            public double? S { get; set; }
            public double? AT { get; set; }
            public double? T { get; set; }
            public double? U { get; set; }
            public double? V { get; set; }
            public double? CTNN { get; set; }
            public double? VR { get; set; }
            public double? X { get; set; }
            public double? Y { get; set; }
            public double? CO { get; set; }

            public List<Data> ListData { get; set; }
        }

        public class Data
        {
            public string Key { get; set; }
            public string Value { get; set; }
            public bool HoliDay { get; set; }
        }

        public class ShiftLogModel
        {
            public string ShiftCode { get; set; }
            public double Lat { get; set; }
            public double Lon { get; set; }
        }
        public class ShiftLogManual
        {
            public string ShiftCode { get; set; }
            public string ChkinLocationTxt { get; set; }
            public string ChkoutLocationTxt { get; set; }
            public string ChkinTime { get; set; }
            public string ChkoutTime { get; set; }
            public string ChkinPicRealtime { get; set; }
            public string ChkoutPicRealtime { get; set; }
            public string Note { get; set; }
            public bool IsChkinRealTime { get; set; }
            public string UserName { get; set; }
            public bool? IsBussiness { get; set; }
            public string BussinessLocation { get; set; }
        }

        public class ShiftLogTemp
        {
            public int Id { get; set; }
            public string ShiftCode { get; set; }
            public DateTime? ChkinTime { get; set; }
            public string ChkinLocationTxt { get; set; }
            public string ChkinLocationGps { get; set; }
            public string ChkinPicRealtime { get; set; }
            public bool IsChkinRealTime { get; set; }
            public DateTime? ChkoutTime { get; set; }
            public string ChkoutLocationTxt { get; set; }
            public string ChkoutLocationGps { get; set; }
            public string ChkoutPicRealtime { get; set; }
            public bool IsChkoutRealTime { get; set; }
            public string Note { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string Flag { get; set; }
            public string FromDevice { get; set; }
            public string Ip { get; set; }
            public string Imei { get; set; }
            public bool IsCheckIn { get; set; }
            public string ShiftCodeBefore { get; set; }
        }
        public class ShiftSpan
        {
            public DateTime BeginTime { get; set; }
            public DateTime EndTime { get; set; }
            public string ShiftCode { get; set; }
        }

        public class PlanScheduleData
        {
            public string Content { get; set; }
            public string Location { get; set; }
            public string Transportation { get; set; }
            public DateTime? StartTime { get; set; }
            public DateTime? EndTime { get; set; }
            public string StartHour { get; set; }
            public string EndHour { get; set; }
            public string StartDay { get; set; }
            public string EndDay { get; set; }
            public int? NumKv1Normal { get; set; }
            public int? NumKv1Holiday { get; set; }
            public int? NumKv1Stay { get; set; }
            public int? NumKv2Normal { get; set; }
            public int? NumKv2Holiday { get; set; }
            public int? NumKv2Stay { get; set; }
            public int NumOvtNormal { get; set; }
            public int NumOvtHoliday { get; set; }
        }

        public class DataAtt
        {
            public string ActCode { get; set; }
            public string AttrGroup { get; set; }
            public List<DataAttrWf> DataAttrWf { get; set; }
        }
        public class DataAttrWf
        {
            public string ActCode { get; set; }
            public string AttrCode { get; set; }
            public string AttrName { get; set; }
            public string AttrGroup { get; set; }
            public string AttrNote { get; set; }
            public string AttrDataType { get; set; }
            public string AttrUnit { get; set; }
            public string SessionId { get; set; }
            public string Value { get; set; }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerCard.GetAllStrings().Select(x => new { x.Name, x.Value }))
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