using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CandidatesManagementController : BaseController
    {
        public class EDMSCandidatesManagementJtableModel : JTableModel
        {
            public string CandidateCode { get; set; }
        }
        public class EDMSCandidatesManagementJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? Sex { get; set; }
            public int? Year { get; set; }
            public string Skill { get; set; }
            public string Fullname { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CandidatesManagementController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CandidatesManagementController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<CandidatesManagementController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        #region index
        [Breadcrumb("ViewData.CrumbCandidateManager", AreaName = "Admin", FromAction = "Index", FromController = typeof(EmployeeHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbEmployeeHome"] = _sharedResources["COM_CRUMB_EMPLOYEE_HOME"];
            ViewData["CrumbCandidateManager"] = _sharedResources["Quản lý ứng viên"];
            return View();
        }

        [HttpPost]
        public object GetListYear()
        {
            var listYear = Enumerable.Range(1900, (DateTime.Now.Year - 1900) + 1);
            return Json(listYear);
        }

        [HttpPost]
        public object GetSkill()
        {
            var list = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "STAFF_SKILL").Select(x => new
            {
                Code = x.CodeSet,
                Name = x.ValueSet,
                Check = false
            }).AsNoTracking();
            return Json(list);
        }

        [HttpPost]
        public object GetCountCandidateToday()
        {
            var today = DateTime.Today;
            var count = _context.CandiateBasic.Where(x => x.CreatedTime.Date == today).Count();
            return count;
        }

        [HttpPost]
        public JsonResult GetItem([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CandiateBasic.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var model = new Candidate();
                    model.CandidatesInfo = new CandidateInfo
                    {
                        CandidateCode = data.CandidateCode,
                        Address = data.Address,
                        Birthday = data.Birthday.HasValue ? data.Birthday.Value.ToString("dd/MM/yyyy") : null,
                        Email = data.Email,
                        Sex = data.Sex.ToString(),
                        Fullname = data.Fullname,
                        Skype = data.Skype,
                        Phone = data.Phone,
                        Married = data.Married ? "1" : "0",
                        FileCv_1 = data.FileCv_1,
                        Targeting = data.Targeting

                    };
                    model.CandidatesInfoMore = new CandidateInfoMore
                    {
                        CandidateCode = data.CandidateCode,
                        MainSkill = !string.IsNullOrEmpty(data.MainSkill) ? data.MainSkill.Split(",") : new string[0],
                        SubSkill = !string.IsNullOrEmpty(data.SubSkill) ? data.SubSkill.Split(",") : new string[0],
                        MainPracticeTime = data.MainPracticeTime,
                        WorkPlace = data.WorkPlace,
                        LaptopInfo = data.LaptopInfo,
                        SmartphoneInfo = data.SmartphoneInfo,
                        Ability = data.Ability,
                        SalaryHope = data.SalaryHope.ToString(),
                        CanJoinDate = data.CanJoinDate != null ? data.CanJoinDate.Value.ToString("dd/MM/yyyy") : null,
                        LanguageUse = data.LanguageUse
                    };
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Ứng viên không tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CM_CURD_LBL_CM_CANDIATE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));

            }
            return Json(msg);
        }

        [HttpPost]
        public object JTable([FromBody]EDMSCandidatesManagementJtable jTablePara)
        {
            var intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.CandiateBasic
                        where ((fromDate == null) || (a.CreatedTime.Date >= fromDate.Value.Date))
                            && ((toDate == null) || (a.CreatedTime.Date <= toDate.Value.Date))
                            && ((jTablePara.Sex == null) || (a.Sex == jTablePara.Sex))
                            && ((jTablePara.Year == null) || (a.Birthday.HasValue && a.Birthday.Value.Year == jTablePara.Year))
                            && ((string.IsNullOrEmpty(jTablePara.Skill)) || (a.Ability.Contains(jTablePara.Skill)))
                            && ((string.IsNullOrEmpty(jTablePara.Fullname)) || (a.Fullname.Equals(jTablePara.Fullname)))
                        select new
                        {
                            a.Id,
                            a.CandidateCode,
                            a.Fullname,
                            a.Sex,
                            a.Birthday,
                            a.MainPracticeTime,
                            a.Phone,
                            a.CreatedTime,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "CandidateCode", "Fullname", "Sex", "Birthday", "Phone", "CreatedTime", "MainPracticeTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.CandiateBasic.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.CandiateBasic.Remove(data);
                    _context.SaveChanges();
                    //msg.Title = "Xóa ứng viên thành công!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("CM_CURD_LBL_CM_CANDIATE"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Ứng viên không tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CM_CURD_LBL_CM_CANDIATE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
            }
            return Json(msg);
        }
        #endregion

        #region Candidate_Info
        [HttpGet]
        public JsonResult CreateCandiateCode()
        {
            var msg = new JMessage() { Error = true };
            try
            {
                string code = "CAN_" + DateTime.Now.ToString("ddMMyyyy", CultureInfo.InvariantCulture) +
                              "_" + (_context.CandiateBasic.Count() > 0 ? (_context.CandiateBasic.OrderByDescending(x => x.Id).First().Id + 1).ToString() : 0.ToString());
                msg.Title = code;
                msg.Error = false;
                var candidate = new CandidateBasic()
                {
                    CandidateCode = code,
                    CreatedTime = DateTime.Now,
                    CreatedBy = ESEIM.AppContext.UserName
                };
                _context.CandiateBasic.Add(candidate);
                _context.SaveChanges();
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                //msg.Title = "Có lỗi khi tạo mã!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
                return Json(msg);
            }
        }
        [HttpGet]
        public JsonResult SearchCandiateCode(string candidateCode)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode == candidateCode);
                if (data != null)
                {
                    var model = new Candidate();
                    model.CandidatesInfo = new CandidateInfo
                    {
                        CandidateCode = data.CandidateCode,
                        Address = data.Address,
                        Birthday = data.Birthday.HasValue ? data.Birthday.Value.ToString("dd/MM/yyyy") : null,
                        Email = data.Email,
                        Sex = data.Sex.ToString(),
                        Fullname = data.Fullname,
                        Skype = data.Skype,
                        Phone = data.Phone,
                        Married = data.Married ? "1" : "0",
                        FileCv_1 = data.FileCv_1,
                        Targeting = data.Targeting

                    };
                    model.CandidatesInfoMore = new CandidateInfoMore
                    {
                        CandidateCode = data.CandidateCode,
                        MainSkill = !string.IsNullOrEmpty(data.MainSkill) ? data.MainSkill.Split(",") : new string[0],
                        SubSkill = !string.IsNullOrEmpty(data.SubSkill) ? data.SubSkill.Split(",") : new string[0],
                        MainPracticeTime = data.MainPracticeTime,
                        WorkPlace = data.WorkPlace,
                        LaptopInfo = data.LaptopInfo,
                        SmartphoneInfo = data.SmartphoneInfo,
                        Ability = data.Ability,
                        SalaryHope = data.SalaryHope.ToString(),
                        CanJoinDate = data.CanJoinDate != null ? data.CanJoinDate.Value.ToString("dd/MM/yyyy") : null,
                        LanguageUse = data.LanguageUse,
                    };
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Ứng viên không tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CM_CURD_LBL_CM_CANDIATE"));
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi tìm ứng viên!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_SEARCH"), CommonUtil.ResourceValue("CM_CURD_LBL_CM_CANDIATE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCandidateInfo([FromBody]CandidateInfo data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var can = _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode.Equals(data.CandidateCode));

                can.Fullname = data.Fullname;
                //can.Ability = string.IsNullOrEmpty(data.Ability) ? "" : data.Ability.Remove(data.Ability.Length - 1, 1);
                can.Address = data.Address;
                can.Birthday = string.IsNullOrEmpty(data.Birthday) ? (DateTime?)null : DateTime.ParseExact(data.Birthday, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                if (can.Birthday != null)
                {
                    decimal age = (decimal)(DateTime.Now - can.Birthday).Value.TotalDays / 365.25m;
                    if (age < 18)
                    {
                        msg.Error = true;
                        //msg.Title = "Bạn chưa đủ 18 tuổi!";
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_OLD"));
                        return Json(msg);
                    }
                }

                //can.CanJoinDate = string.IsNullOrEmpty(data.CanJoinDate) ? (DateTime?)null : DateTime.ParseExact(data.CanJoinDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                can.Email = data.Email;
                //can.MainPracticeTime = data.MainPracticeTime;
                can.Married = data.Married == "0" ? false : true;
                can.Phone = data.Phone;
                //can.SalaryHope = string.IsNullOrEmpty(data.SalaryHope) ? 0 : decimal.Parse(data.SalaryHope);
                can.Sex = int.Parse(data.Sex);
                can.Skype = data.Skype;
                //can.MainSkill = data.MainSkill;
                //can.SubSkill = data.SubSkill;
                //can.LanguageUse = data.LanguageUse;
                //can.SubPracticeTime = data.SubPracticeTime;
                can.Targeting = data.Targeting;
                if (!string.IsNullOrEmpty(data.FileCv_1))
                {
                    can.FileCv_1 = data.FileCv_1;
                }
                can.UpdatedBy = ESEIM.AppContext.UserName;
                can.UpdatedTime = DateTime.Now;
                //can.LaptopInfo = data.LaptopInfo;
                //can.SmartphoneInfo = data.SmartphoneInfo;
                //can.WorkPlace = data.WorkPlace;
                _context.CandiateBasic.Update(can);
                _context.SaveChanges();
                //msg.Title = "Lưu lại thông tin thành công!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SUCCES_SAVE"));
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("COM_BTN_SAVE"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));


            }
            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public object UploadFile(IFormFile fileUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                }
                else
                {
                    msg.Object = upload.Object;
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi upload file!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_UPLOAD_FILE"));
            }
            return Json(msg);
        }
        #endregion

        #region Candidate_Info_More
        [HttpPost]
        public JsonResult GetLanguage()
        {
            var list = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "PROGRAM_LANGUAGE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet, x.Group }).AsNoTracking();
            return Json(list);
        }

        [HttpPost]
        public JsonResult UpdateCandidateInfoMore([FromBody]CandidateInfoMore data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //if (!string.IsNullOrEmpty(data.MainSkill))
                //{
                //    if (data.MainSkill.Length > 255)
                //    {
                //        msg.Title = "MainSkill chỉ tối đa 255 ký tự!";
                //        return Json(msg);
                //    }
                //}

                //if (!string.IsNullOrEmpty(data.SubSkill))
                //{
                //    if (data.SubSkill.Length > 255)
                //    {
                //        msg.Error = true;
                //        msg.Title = "SubSkill chỉ tối đa 255 ký tự!";
                //        return Json(msg);
                //    }
                //}


                var can = _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode.Equals(data.CandidateCode));
                can.Ability = data.Ability;
                can.CanJoinDate = string.IsNullOrEmpty(data.CanJoinDate) ? (DateTime?)null : DateTime.ParseExact(data.CanJoinDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                can.MainPracticeTime = data.MainPracticeTime;
                can.SalaryHope = string.IsNullOrEmpty(data.SalaryHope) ? 0 : decimal.Parse(data.SalaryHope);
                can.MainSkill = data.MainSkill!=null && data.MainSkill.Any() ? string.Join(",", data.MainSkill) : "";
                can.SubSkill = data.SubSkill != null && data.SubSkill.Any() ? string.Join(",", data.SubSkill) : "";
                can.LanguageUse = data.LanguageUse;
                can.SubPracticeTime = data.SubPracticeTime;
                can.UpdatedBy = ESEIM.AppContext.UserName;
                can.UpdatedTime = DateTime.Now;
                can.LaptopInfo = data.LaptopInfo;
                can.SmartphoneInfo = data.SmartphoneInfo;
                can.WorkPlace = data.WorkPlace;
                _context.CandiateBasic.Update(can);
                _context.SaveChanges();
                //msg.Title = "Lưu lại thông tin thành công!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SUCCES_SAVE"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR")) + ex;
            }
            return Json(msg);
        }
        #endregion
        #region Cadidate_event
        [HttpGet]
        public object GetEventCat(string candidateCode)
        {
            var data = (from a in _context.CandidateWorkEvents
                        where a.CandidateCode == candidateCode
                        select new
                        {
                            a.Id,
                            a.DatetimeEvent,
                            a.FrameTime,
                        }).AsNoTracking();
            return data;
        }

        [HttpPost]
        public object GetEventCatGrid([FromBody]EDMSCandidatesManagementJtableModel searchData)
        {
            int intBegin = (searchData.CurrentPage - 1) * searchData.Length;
            if (!string.IsNullOrEmpty(searchData.CandidateCode))
            {
                var query = from a in _context.CandiateBasic
                            join b in _context.CandidateWorkEvents on a.CandidateCode equals b.CandidateCode
                            where a.CandidateCode == searchData.CandidateCode
                            select new
                            {
                                a.CandidateCode,
                                a.Fullname,
                                b.Id,
                                b.DatetimeEvent,
                                b.FrameTime
                            };
                int count = query.Count();
                var data = query.OrderUsingSortExpression(searchData.QueryOrderBy).Skip(intBegin).Take(searchData.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, searchData.Draw, count, "CandidateCode", "Fullname", "Id", "DatetimeEvent", "FrameTime");
                return Json(jdata);
            }
            else
            {
                var list = new List<object>();
                var jdata = JTableHelper.JObjectTable(list, searchData.Draw, 0, "CandidateCode", "Fullname", "Id", "DatetimeEvent", "FrameTime");
                return Json(jdata);
            }
        }

        [HttpPost]
        public JsonResult InsertEventCat([FromBody]EventCat data)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var fromDate = DateTime.ParseExact(data.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var toDate = DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var appointmentTime = string.IsNullOrEmpty(data.AppointmentTime) ? DateTime.ParseExact(data.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var candidate = _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode == data.CandidateCode);
                if (candidate != null)
                {
                    //update candidate
                    candidate.WorkFrom = fromDate;
                    candidate.WorkTo = toDate;
                    candidate.AppointmentTime = appointmentTime;
                    _context.CandiateBasic.Update(candidate);


                    //insert,update event
                    var listEvent = _context.CandidateWorkEvents.Where(x => x.CandidateCode == data.CandidateCode);
                    if (listEvent.Any())
                    {
                        _context.CandidateWorkEvents.RemoveRange(listEvent);
                    }

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
                            var evt = new CandidateWorkEvent
                            {
                                CandidateCode = data.CandidateCode,
                                FrameTime = frameTime,
                                CreatedTime = DateTime.Now,
                                DatetimeEvent = date,
                            };
                            _context.CandidateWorkEvents.Add(evt);
                        }
                    }
                    //update interview
                    if (!string.IsNullOrEmpty(data.AppointmentTime))
                    {
                        var candidateInterview = _context.CandidateInterviews.FirstOrDefault(x => x.CandidateCode.Equals(data.CandidateCode));
                        if (candidateInterview != null)
                        {
                            candidateInterview.InterviewDate = !string.IsNullOrEmpty(data.AppointmentTime) ? DateTime.ParseExact(data.AppointmentTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now;
                            _context.CandidateInterviews.Update(candidateInterview);
                        }
                        else
                        {
                            var obj = new CandidateInterview()
                            {
                                CandidateCode = data.CandidateCode,
                                InterviewDate = !string.IsNullOrEmpty(data.AppointmentTime) ? DateTime.ParseExact(data.AppointmentTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now,
                            };
                            _context.CandidateInterviews.Add(obj);
                        }
                    }
                    _context.SaveChanges();
                    //msg.Title = "Đăng ký thành công!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_SUCCES_SIGN"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Ứng viên không tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CM_CURD_LBL_CM_CANDIATE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult ChangeFrametimeCadidate(int id, int frame)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                frame = frame - 1;
                var data = _context.CandidateWorkEvents.FirstOrDefault(x => x.Id == id);
                if (data.DatetimeEvent.AddDays(1) < DateTime.Now)
                {
                    //msg.Title = "Không thể thay đổi ngày đã qua!";
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_VALIDATE_DAY"));
                    return Json(msg);
                }
                string[] frameTime = data.FrameTime.Split(';');
                if (frameTime[frame].Equals("True"))
                {
                    frameTime[frame] = "False";
                }
                else
                {
                    frameTime[frame] = "True";
                }
                data.FrameTime = frameTime[0].ToString() + ";" + frameTime[1].ToString() + ";" + frameTime[2];
                data.UpdatedTime = DateTime.Now;
                data.UpdatedBy = ESEIM.AppContext.UserName;
                _context.CandidateWorkEvents.Update(data);
                _context.SaveChanges();
                //msg.Title = "Cập nhập thành công!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteFrametime(int? id, int frame)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.CandidateWorkEvents.FirstOrDefault(x => x.Id == id);
                if (data.DatetimeEvent.AddDays(1) < DateTime.Now)
                {
                    //msg.Title = "Không thể thay đổi ngày đã qua!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_VALIDATE_DAY"));
                    return Json(msg);
                }
                string[] frameTime = data.FrameTime.Split(';');
                frameTime[frame] = frameTime[frame] == "True" ? "False" : "True";
                data.FrameTime = frameTime[0] + ";" + frameTime[1] + ";" + frameTime[2]; /*+ ";" + frameTime[3];*/
                _context.CandidateWorkEvents.Update(data);
                _context.SaveChanges();

                msg.Error = false;
                //msg.Title = "Cập nhập thành công!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
                return Json(msg);

            }
            catch (Exception ex)
            {
                msg.Object = ex;
                //msg.Title = "Có lỗi xảy ra!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ERR"));
                return Json(msg);
            }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
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