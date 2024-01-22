using System;
using System.Collections.Generic;
using System.Globalization;
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
using Newtonsoft.Json;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public class LmsClassController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<MeetingScheduleController> _stringLocalizerMs;
        private readonly IStringLocalizer<LmsClassController> _stringLocalizerLmsClass;
        private readonly IStringLocalizer<StaffRegistrationController> _stringLocalizerSTRE;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;

        public LmsClassController(EIMDBContext context, IUploadService upload, IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<MeetingScheduleController> stringLocalizerMs, IStringLocalizer<LmsClassController> stringLocalizerLmsClass,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<StaffRegistrationController> stringLocalizerSTRE)
        {
            _context = context;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizerMs = stringLocalizerMs;
            _stringLocalizerSTRE = stringLocalizerSTRE;
            _stringLocalizerLmsClass = stringLocalizerLmsClass;
            _stringLocalizerLms = stringLocalizerLms;
        }

        [Breadcrumb("ViewData.CrumbLmsClass", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbLmsClass"] = _sharedResources["COM_CRUMB_LMS_CLASS"];
            return View();
        }

        #region JTable
        public class JtableClassModel : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Teacher { get; set; }
            public string Student { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody] JtableClassModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var session = HttpContext.GetSessionUser();

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.LmsClasses.Where(x => !x.IsDeleted)
                        join b in _context.LmsUserClasses on a.ClassCode equals b.ClassCode into b1
                        from b in b1.DefaultIfEmpty()
                        where (fromDate == null || (fromDate <= a.StartTime))
                              && (toDate == null || (toDate >= a.EndTime))
                              && (string.IsNullOrEmpty(jTablePara.Teacher) || a.ManagerTeacher.Equals(jTablePara.Teacher))
                              && (string.IsNullOrEmpty(jTablePara.Student) ||
                                  (b != null && b.UserName.Equals(jTablePara.Student)))
                        group new
                        {
                            a.Id,
                            a.ClassCode,
                            a.ClassName,
                            a.StartTime,
                            a.EndTime,
                            a.Status,
                            a.ManagerTeacher,
                            a.CreatedBy,
                            StudentName = b != null ? b.UserName : ""
                        } by a.ClassCode into g
                        select new
                        {
                            Id = g.FirstOrDefault().Id,
                            ClassCode = g.FirstOrDefault().ClassCode,
                            ClassName = g.FirstOrDefault().ClassName,
                            StartTime = g.FirstOrDefault().StartTime,
                            EndTime = g.FirstOrDefault().EndTime,
                            Status = g.FirstOrDefault().Status,
                            ManagerTeacher = g.FirstOrDefault().ManagerTeacher,
                            CreatedBy = g.FirstOrDefault().CreatedBy,
                            CountStudent = g.Count(x => x.StudentName != ""),

                        };

            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ClassCode", "ClassName", "StartTime", "EndTime", "Status", "ManagerTeacher", "CreatedBy", "CountStudent");
            return Json(jdata);
        }
        #endregion

        #region Combobox
        [HttpGet]
        public object GetListAccount()
        {
            return _context.TokenManagers.Where(x => !string.IsNullOrEmpty(x.ServiceType) && (string.IsNullOrEmpty(User.Identity.Name) || x.CreatedBy == User.Identity.Name || x.CreatedBy == "admin")
                                                     && x.ServiceType.Equals("ZOOM_ACCOUNT") && x.Type.Equals("MEETING_SCHEDULE"));
        }
        [HttpPost]
        public object GetListUser()
        {
            var query = _context.Users.Where(x => x.Active == true).Select(x => new { UserId = x.Id, x.GivenName, x.Picture, x.UserName, GroupUserCode = x.AdUserInGroups.Select(y => y.GroupUserCode).FirstOrDefault(), x.DepartmentId }).AsNoTracking();
            return query;
        }
        #endregion

        #region Function
        public class LmsModelClass
        {
            public int? Id { get; set; }
            public string ClassCode { get; set; }

            public string ClassName { get; set; }
            public string Status { get; set; }

            public string StartTime { get; set; }
            public string EndTime { get; set; }

            public string Noted { get; set; }

            public string ManagerTeacher { get; set; }
            public string UserClass { get; set; }
        }

        public class ModelUserClass
        {
            public string ClassCode { get; set; }
            public string UserName { get; set; }
        }
        [HttpPost]
        public JsonResult Insert([FromBody] LmsModelClass data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var objClass = _context.LmsClasses.FirstOrDefault(x => x.ClassCode.Equals(data.ClassCode));
                if (objClass == null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var obj = new LmsClass
                    {
                        ClassCode = data.ClassCode,
                        ClassName = data.ClassName,
                        Status = data.Status,
                        StartTime = startTime,
                        EndTime = endTime,
                        Noted = data.Noted,
                        ManagerTeacher = data.ManagerTeacher,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        IsDeleted = false,
                    };

                    var listUserClassNew = JsonConvert.DeserializeObject<List<ModelUserClass>>(data.UserClass);
                    foreach (var item in listUserClassNew)
                    {
                        var userClass = new LmsUserClass()
                        {
                            ClassCode = data.ClassCode,
                            UserName = item.UserName
                        };
                        _context.LmsUserClasses.Add(userClass);
                    }

                    _context.LmsClasses.Add(obj);
                    _context.SaveChanges();

                    //msg.Title = "Thêm mới thông tin lịch học thành công";
                    msg.Title = _stringLocalizerLmsClass["LMS_CLASS_ADD_SUCCESSFULLY"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Lịch học đã tồn tại";
                    msg.Title = _stringLocalizerLmsClass["LMS_CLASS_EXIST"];
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

        [HttpPost]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.LmsClasses.FirstOrDefault(x => x.Id.Equals(id));
                if (obj != null)
                {
                    msg.Object = new LmsModelClass
                    {
                        Id = obj.Id,
                        ClassCode = obj.ClassCode,
                        ClassName = obj.ClassName,
                        Status = obj.Status,
                        StartTime = obj.StartTime.HasValue
                            ? obj.StartTime.Value.ToString("dd/MM/yyyy HH:mm")
                            : "",
                        EndTime = obj.EndTime.HasValue
                            ? obj.EndTime.Value.ToString("dd/MM/yyyy HH:mm")
                            : "",
                        Noted = obj.Noted,
                        ManagerTeacher = obj.ManagerTeacher,
                        UserClass = JsonConvert.SerializeObject(_context.LmsUserClasses.Where(x => x.ClassCode == obj.ClassCode))
                    };
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsClass["LMS_ERR_CLASS_NOT_FOUND"];
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

        [HttpPost]
        public object GetClassCode(string teacher)
        {
            var length = _context.LmsClasses.Count(x => x.ManagerTeacher == teacher);
            return "class_" + teacher + "_" + (length + 1).ToString().PadLeft(3, '0');
        }

        [HttpPost]
        public JsonResult Update([FromBody] LmsModelClass data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var objClass = _context.LmsClasses.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (objClass != null)
                {
                    var startTime = DateTime.ParseExact(data.StartTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    var endTime = DateTime.ParseExact(data.EndTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                    objClass.StartTime = startTime;
                    objClass.EndTime = endTime;
                    var listUserClassOld = _context.LmsUserClasses.Where(x => x.ClassCode == objClass.ClassCode);
                    foreach (var item in listUserClassOld)
                    {
                        _context.Remove(item);
                    }
                    var listUserClassNew = JsonConvert.DeserializeObject<List<ModelUserClass>>(data.UserClass);
                    foreach (var item in listUserClassNew)
                    {
                        var userClass = new LmsUserClass()
                        {
                            ClassCode = data.ClassCode,
                            UserName = item.UserName
                        };
                        _context.LmsUserClasses.Add(userClass);
                    }
                    objClass.ClassCode = data.ClassCode;
                    objClass.ClassName = data.ClassName;
                    objClass.ManagerTeacher = data.ManagerTeacher;
                    objClass.Noted = data.Noted;
                    objClass.Status = data.Status;
                    objClass.UpdatedBy = User.Identity.Name;
                    objClass.UpdatedTime = DateTime.Now;

                    _context.LmsClasses.Update(objClass);
                    _context.SaveChanges();

                    //msg.Title = "Cập nhật thông tin lịch học thành công";
                    msg.Title = _stringLocalizerLmsClass["LMS_CLASS_UPDATED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsClass["LMS_ERR_CLASS_NOT_FOUND"];
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
        [HttpPost]
        public JsonResult Delete(string id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var objClass = _context.LmsClasses.FirstOrDefault(x => x.Id.ToString().Equals(id));
                if (objClass != null)
                {
                    objClass.IsDeleted = true;
                    objClass.DeletedBy = User.Identity.Name;
                    objClass.DeletedTime = DateTime.Now;
                    var listUserClass = _context.LmsUserClasses.Where(x => x.ClassCode == objClass.ClassCode);
                    foreach (var item in listUserClass)
                    {
                        _context.Remove(item);
                    }

                    _context.LmsClasses.Update(objClass);
                    _context.SaveChanges();

                    //msg.Title = "Xóa lịch họp thành công";
                    msg.Title = _stringLocalizerLmsClass["LMS_DELETED_CLASS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tìm thấy thông tin lịch học";
                    msg.Title = _stringLocalizerLmsClass["LMS_ERR_CLASS_NOT_FOUND"];
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
        
        [HttpPost]
        public object GetListUserJoined(string classCode)
        {
            var listUser = _context.LmsUserClasses.Where(x => x.ClassCode == classCode);
            return _context.Users.ToList().Where(x => listUser.Any(y => y.UserName == x.UserName))
                .Select(x => new {x.UserName, x.GivenName, x.Email});
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizerMs.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerLmsClass.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSTRE.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
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