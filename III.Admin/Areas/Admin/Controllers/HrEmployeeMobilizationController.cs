using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Hosting.Internal;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class HrEmployeeMobilizationController : BaseController
    {

        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IGoogleApiService _googleAPIService;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly AppSettings _appSettings;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<HrEmployeeMobilizationController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<FileObjectShareController> _fileObjectShareController;
        public HrEmployeeMobilizationController(EIMDBContext context, IUploadService upload, IGoogleApiService googleAPIService,
            IHostingEnvironment hostingEnvironment, IOptions<AppSettings> appSettings,
            IStringLocalizer<HrEmployeeMobilizationController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<FileObjectShareController> fileObjectShareController)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _appSettings = appSettings.Value;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
            _fileObjectShareController = fileObjectShareController;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Index

        public class JTableModelCustom : JTableModel
        {
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Permanentresidence { get; set; }
            public string EmployeeType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? EmployeeId { get; set; }
            public string Unit { get; set; }
            public string Position { get; set; }
            public string BranchId { get; set; }

            public string Gender { get; set; }
            public DateTime BirthDay { get; set; }
            public string NumberOfYears { get; set; }
            public string YearsOfWork { get; set; }
            public string Wage { get; set; }
            public string EducationalLevel { get; set; }
        }
        [HttpPost]
        public object JTableMain([FromBody] JTableModelCustom jTablePara)
        {
            var toDay = DateTime.Now;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.HREmployees.Where(x=>x.status != "END_CONTRACT")
                         join b in _context.Roles on a.position equals b.Id into b1
                         from b2 in b1.DefaultIfEmpty()
                         join c in _context.AdDepartments on a.unit equals c.DepartmentCode into c1
                         from c2 in c1.DefaultIfEmpty()
                         join d in _context.Users.Where(x => x.Active) on a.Id.ToString() equals d.EmployeeCode into d1
                         from d2 in d1.DefaultIfEmpty()
                         join e in _context.HRContracts.Where(x => x.flag == 1 && x.Active == 1) on a.Id equals e.Employee_Id into e1
                         from e2 in e1.DefaultIfEmpty()
                         where a.flag == 1
                         && (string.IsNullOrEmpty(jTablePara.FullName) || a.fullname.ToLower().Contains(jTablePara.FullName.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Phone) || a.phone.ToLower().Contains(jTablePara.Phone.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Permanentresidence) || a.permanentresidence.ToLower().Contains(jTablePara.Permanentresidence.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.EmployeeType) || jTablePara.EmployeeType.Split(",", StringSplitOptions.None).Any(p => p.Equals(a.employeetype)))
                         && (string.IsNullOrEmpty(jTablePara.Unit) || jTablePara.Unit.Split(",", StringSplitOptions.None).Any(p => p.Equals(a.unit)))
                         && (string.IsNullOrEmpty(jTablePara.Position) || a.position.Equals(jTablePara.Position))
                         && (string.IsNullOrEmpty(jTablePara.BranchId) || d2.BranchId.Equals(jTablePara.BranchId))
                         && ((fromDate == null || (a.createtime >= fromDate)) && (toDate == null || (a.createtime <= toDate)))
                         && (string.IsNullOrEmpty(jTablePara.Gender) || a.gender.ToString() == jTablePara.Gender)
                         && (string.IsNullOrEmpty(jTablePara.NumberOfYears) || (a.birthday.HasValue) && ((toDay.Year - a.birthday.Value.Year) == int.Parse(jTablePara.NumberOfYears)))
                         && (string.IsNullOrEmpty(jTablePara.YearsOfWork) || a.years_of_exp.ToString() == jTablePara.YearsOfWork)
                         && (string.IsNullOrEmpty(jTablePara.Wage) || a.wage.ToString() == jTablePara.Wage)
                         && ((string.IsNullOrEmpty(jTablePara.EducationalLevel)) || a.educationallevel.ToLower().Contains(jTablePara.EducationalLevel.ToLower()))
                         select new
                         {
                             a.Id,
                             a.fullname,
                             a.gender,
                             a.phone,
                             a.permanentresidence,
                             a.employeetype,
                             a.picture,
                             a.birthofplace,
                             BirthDay= a.birthday.Value.ToString("dd/MM/yyyy"),
                             a.unit,
                             a.position,
                             unitName = c2.Title,
                             positionName = b2.Title,
                             EndTimeContract = e2.End_Time.HasValue ? e2.End_Time.Value.ToString("dd/MM/yyyy") : "",
                             EndTime = e2.End_Time,
                             a.employee_code
                         }).OrderByDescending(x => x.EndTime).GroupBy(x => x.Id);
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.FirstOrDefault().Id,
                x.FirstOrDefault().fullname,
                x.FirstOrDefault().gender,
                x.FirstOrDefault().BirthDay,
                x.FirstOrDefault().phone,
                x.FirstOrDefault().permanentresidence,
                employeetype = _context.CommonSettings.FirstOrDefault(y => y.CodeSet == x.FirstOrDefault().employeetype).ValueSet ?? "",
                x.FirstOrDefault().picture,
                x.FirstOrDefault().birthofplace,
                x.FirstOrDefault().unit,
                x.FirstOrDefault().position,
                x.FirstOrDefault().unitName,
                x.FirstOrDefault().positionName,
                x.FirstOrDefault().EndTimeContract,
                x.FirstOrDefault().EndTime,
                x.FirstOrDefault().employee_code,
                count = count
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "employee_code", "fullname", "BirthDay", "gender", "phone", "picture", "permanentresidence", "employeetype", "unit", "position", "unitName", "positionName", "EndTimeContract", "EndTime", "count");
            return Json(jdata);
        }
        public class ModelHr
        {
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Permanentresidence { get; set; }
            public string EmployeeType { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? EmployeeId { get; set; }
            public string Unit { get; set; }
            public string Position { get; set; }
            public string BranchId { get; set; }

            public string Gender { get; set; }
            public DateTime BirthDay { get; set; }
            public string NumberOfYears { get; set; }
            public string YearsOfWork { get; set; }
            public string Wage { get; set; }
            public string EducationalLevel { get; set; }
        }
        [HttpPost]
        public object JTableMain2([FromBody] List<int> arr)
        {
                var query = from a in _context.HREmployees.Where(x => x.flag == 1 && arr.Any(p=>p.Equals(x.Id)))
                            join b in _context.Roles on a.position equals b.Id
                            join c in _context.AdDepartments on a.unit equals c.DepartmentCode
                            select new
                            {
                                a.Id,
                                a.fullname,
                                a.gender,
                                a.phone,
                                a.permanentresidence,
                                a.employeetype,
                                a.picture,
                                a.birthofplace,
                                BirthDay = a.birthday.Value.ToString("dd/MM/yyyy"),
                                a.unit,
                                a.position,
                                unitName = c.Title,
                                positionName = b.Title,
                                a.employee_code
                            };
            return query;
        }
        public class PayScaleDetailModel
        {
            public string ScaleCode { get; set; }
            public decimal Ranges { get; set; }
        }

        [HttpGet]
        public object GetRangesScale(string code)
        {
            var data = from a in _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(code))
                       select new
                       {
                           Code = a.Ranges
                       };
            return data;
        }
        [HttpPost]
        public object GetRangesScaleCoeff([FromBody] PayScaleDetailModel obj)
        {
            var data = from a in _context.PayScaleDetails.Where(x => !x.IsDeleted && x.ScaleCode.Equals(obj.ScaleCode) && x.Ranges==obj.Ranges.ToString())
                       select new
                       {
                           Coeff = a.Coeff
                       };
            return data;
        }


        [HttpPost]
        public object JTable([FromBody]JTableModelHrEmployeeTermination jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var decisionDate = !string.IsNullOrEmpty(jTablePara.DecisionDate) ? DateTime.ParseExact(jTablePara.DecisionDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var decisionMakingDate = !string.IsNullOrEmpty(jTablePara.DecisionMakingDate) ? DateTime.ParseExact(jTablePara.DecisionMakingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.HrEmployeeDecisions.Where(x => !x.IsDeleted)
                        where (string.IsNullOrEmpty(jTablePara.DecisionCode) || a.DecisionCode.ToLower().Contains(jTablePara.DecisionCode.ToLower()))
                        && (decisionDate == null || (a.DecisionDate.HasValue && a.DecisionDate.Value.Date == decisionDate.Value.Date))
                        && (decisionMakingDate == null || (a.DecisionMakingDate.HasValue && a.DecisionMakingDate.Value.Date == decisionMakingDate.Value.Date))
                        && a.Style == 2
                        select new
                        {
                            a.Id,
                            a.DecisionCode,
                            DecisionDate = a.DecisionDate.Value.ToString("dd/MM/yyyy"),
                            DecisionMakingDate = a.DecisionMakingDate.Value.ToString("dd/MM/yyyy"),
                            Status = a.DecisionCode == "" ? "Chưa xử lý" : "Đã xử lý",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "DecisionCode", "DecisionDate", "DecisionMakingDate", "Status");
            return Json(jdata);
        }
        public class HrEmployeeDecisionModel
        {
            public int Id { get; set; }
            public string DecisionCode { get; set; }
            public string DecisionWakingDate { get; set; }
            public int StyleDecisionCode { get; set; }
        }

        [HttpPost]
        public JsonResult Insert([FromBody]HrEmployeeDecisionModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var decisionMakingDate = !string.IsNullOrEmpty(obj.DecisionWakingDate) ? DateTime.ParseExact(obj.DecisionWakingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (!string.IsNullOrEmpty(obj.DecisionWakingDate))
                {
                    var data = _context.HrEmployeeDecisions.FirstOrDefault(x => x.IsDeleted == false && !string.IsNullOrEmpty(x.DecisionCode) && x.DecisionCode == obj.DecisionCode);
                    if (data == null)
                    {
                        HrEmployeeDecision hrEmployeeDecision = new HrEmployeeDecision
                        {
                            DecisionCode = obj.DecisionCode,
                            DecisionDate = DateTime.Now,
                            DecisionMakingDate = decisionMakingDate,
                            Style = obj.StyleDecisionCode,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                        };
                        _context.HrEmployeeDecisions.Add(hrEmployeeDecision);
                        _context.SaveChanges();
                        msg.Object = hrEmployeeDecision.Id;
                        msg.Title = "Thêm quyết định thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Mã quyết định đã tồn tại!";
                    }
                }
                else
                {
                    HrEmployeeDecision hrEmployeeDecision = new HrEmployeeDecision
                    {
                        DecisionDate = DateTime.Now,
                        DecisionMakingDate = decisionMakingDate,
                        Style = 2,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.HrEmployeeDecisions.Add(hrEmployeeDecision);
                    _context.SaveChanges();
                    msg.Object = hrEmployeeDecision.Id;
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.HrEmployeeDecisions.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                if (data != null)
                {
                    if (string.IsNullOrEmpty(data.DecisionCode))
                    {
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        data.IsDeleted = true;
                        _context.HrEmployeeDecisions.Update(data);
                        _context.SaveChanges();
                        msg.Title = "Xóa quyết định thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không xóa được quyết định đã xử lý!";
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tồn tại quyết định này!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.HrEmployeeDecisions.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetRanges(string id)
        {
            var role = _context.Roles.FirstOrDefault(x => x.Id.Equals(id)).Code;
            var cate = _context.CategoryCareers.FirstOrDefault(x => x.CareerCode.Equals(role) && !x.IsDeleted).PayGradesCode;
            var payranger = _context.PaySheets.FirstOrDefault(x => x.PayGradesCode.Equals(cate)).PayRanges;
            return payranger;
        }
        //[HttpPost]
        //public JsonResult Update([FromBody]HrEmployeeDecisionModel obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var decisionMakingDate = !string.IsNullOrEmpty(obj.DecisionWakingDate) ? DateTime.ParseExact(obj.DecisionWakingDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        var data = _context.HrEmployeeDecisions.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
        //        if (data != null)
        //        {
        //            var checkDecisionCode = _context.HrEmployeeDecisions.FirstOrDefault(x => x.IsDeleted == false && x.DecisionCode == obj.DecisionCode);
        //            if (checkDecisionCode == null)
        //            {
        //                data.DecisionCode = obj.DecisionCode;
        //                data.DecisionMakingDate = decisionMakingDate;
        //                data.UpdatedBy = ESEIM.AppContext.UserName;
        //                data.Style = obj.StyleDecisionCode;
        //                data.UpdatedTime = DateTime.Now;
        //                _context.HrEmployeeDecisions.Update(data);
                        
        //                var hr = _context.HREmployeeMobilizations.Where(x => x.IsDeleted == false && int.Parse(x.DecisionId) == data.Id);
        //                foreach(var tem in hr)
        //                {
        //                    var Employee = _context.HREmployees.FirstOrDefault(x => x.Id.ToString() == tem.EmployeeId);
        //                    Employee.employeetype = "EMPLOYEE_STYLE20200717100014";
        //                    _context.HREmployees.Update(Employee);
        //                }
        //                _context.SaveChanges();
        //                msg.Title = "Sửa quyết định thành công!";
        //            }
                    
        //            else
        //            {
        //                msg.Error = true;
        //                msg.Title = "Mã quyết định đã tồn tại!";
        //            }
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}
        #endregion

        #region
        [HttpPost]
        public JsonResult GetListEmpolyee()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.HREmployees.Where(x => x.flag == 1 && x.status == "EMPLOYEE_STYLE20200715140627")
                    .Select(x => new
                    {
                        Id = x.Id,
                        fullname = x.fullname + " - " + x.employee_code,
                        DepartmentId = x.unit,
                        RoleId = x.position,
                        DepartmentName = _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.unit) == null ? "" : _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.unit).Title,
                        RoleName = _context.Roles.FirstOrDefault(y => y.Id == x.position) == null ? "" : _context.Roles.FirstOrDefault(y => y.Id == x.position).Title,
                    }).ToList();
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListDepartment()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.AdDepartments.Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        Code = x.DepartmentCode,
                        Name = x.Title
                    });
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListRole()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.Roles.Where(x => x.Status == true)
                    .Select(x => new
                    {
                        Code = x.Id,
                        Name = x.Title
                    });
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListReason()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.CommonSettings.Where(x => x.Group == "STYLEMPLOYEETERMINASION").Select(x => new { Code = x.CodeSet, Value = x.ValueSet }).ToList();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public class EployeeMobilization
        {
            public int StyleDecisionCode { get; set; }
            public string DecisionId { get; set; }
            public string EmployeeId { get; set; }
            public string DepartmentIdOld { get; set; }
            public string RoleIdOld { get; set; }
            public string DepartmentIdNew { get; set; }
            public string RoleIdNew { get; set; }
            public string Wage { get; set; }
            public string WageLevel { get; set; }
            public string Reason { get; set; }
            public string FormDate { get; set; }
            public string ToDate { get; set; }
        }
        //[HttpPost]
        //public JsonResult InsertEployeeMobilization([FromBody]EployeeMobilization obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var formdate = !string.IsNullOrEmpty(obj.FormDate) ? DateTime.ParseExact(obj.FormDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //        var todate = !string.IsNullOrEmpty(obj.ToDate) ? DateTime.ParseExact(obj.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //        var data = _context.HREmployeeMobilizations.FirstOrDefault(x => x.IsDeleted == false && x.EmployeeId == obj.EmployeeId && x.DecisionId == obj.DecisionId);
        //        if (data == null)
        //        {
                    
        //            HREmployeeMobilization hREmployeeMobilization = new HREmployeeMobilization
        //            {
        //                DecisionId = obj.DecisionId,
        //                EmployeeId = obj.EmployeeId,
        //                DepartmentIdOld = obj.DepartmentIdOld,
        //                RoleIdOld = obj.RoleIdOld,
        //                DepartmentIdNew = obj.DepartmentIdNew,
        //                RoleIdNew = obj.RoleIdNew,
        //                Wage = obj.Wage,
        //                WageLevel = obj.WageLevel,
        //                Reason = obj.Reason,
        //                FormDate = formdate,
        //                ToDate = todate,
                        
        //                CreatedBy = ESEIM.AppContext.UserName,
        //                CreatedTime = DateTime.Now,
        //            };

        //            var decision = _context.HrEmployeeDecisions.FirstOrDefault(x => x.Id == int.Parse(obj.DecisionId));
        //            var Employee = _context.HREmployees.FirstOrDefault(x => x.Id.ToString() == obj.EmployeeId);
        //            if (string.IsNullOrEmpty(decision.DecisionCode))
        //            {
        //                Employee.employeetype = "EMPLOYEE_STYLE20200715140618";
        //            }
        //            else
        //            {
        //                if (obj.StyleDecisionCode == 2)
        //                {
        //                    Employee.unit = obj.DepartmentIdNew;
        //                    Employee.position = obj.RoleIdNew;
        //                    Employee.employeetype = "EMPLOYEE_STYLE20200717100014";

        //                }
        //            }
        //            _context.HREmployees.Update(Employee);
        //            _context.HREmployeeMobilizations.Add(hREmployeeMobilization);
        //            _context.SaveChanges();
        //            msg.Title = "Nhân viên vào quyết định thành công!";

        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Nhân viên đã có trong quyết định này!";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult DeleteEployeeMobilization(int id, int StyleDecisionCode)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var data = _context.HREmployeeMobilizations.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
        //        if (data != null)
        //        {
        //            data.DeletedBy = ESEIM.AppContext.UserName;
        //            data.DeletedTime = DateTime.Now;
        //            data.IsDeleted = true;
        //            var Employee = _context.HREmployees.FirstOrDefault(x => x.Id.ToString() == data.EmployeeId);
        //            Employee.status = "EMPLOYEE_STYLE20200715140627";
        //            if (StyleDecisionCode == 3)
        //            {
        //                Employee.unit = data.DepartmentIdOld;
        //                Employee.position = data.RoleIdOld;
        //            }
        //            _context.HREmployees.Update(Employee);
        //            _context.HREmployeeMobilizations.Update(data);
        //            _context.SaveChanges();
        //            msg.Title = "Xóa nhân viên trong quyết định thành công!";

        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = "Nhân viên không tồn tại trong quyết định này!";
        //        }
        //    }
        //    catch
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}
        [HttpPost]
        public JsonResult GetListEployeeMobilization(string DecistionId)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = (from a in _context.HREmployeeMobilizations
                              join b in _context.HREmployees on a.EmployeeId equals b.Id.ToString()
                              where a.IsDeleted == false && b.flag == 1 && a.DecisionId == DecistionId
                              select new
                              {
                                  a.Id,
                                  EmployeeCode = b.employee_code,
                                  FullName = b.fullname,
                                  DepartmentNameOld = _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdOld) == null ? "" : _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdOld).Title,
                                  DepartmentNameNew = _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdNew) == null ? "" : _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == a.DepartmentIdNew).Title,
                                  RoleNameOld = _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdOld) == null ? "" : _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdOld).Title,
                                  RoleNameNew = _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdNew) == null ? "" : _context.Roles.FirstOrDefault(y => y.Id == a.RoleIdNew).Title,
                                  WageLevel = a.WageLevel,
                                  Reason = a.Reason,
                                  FormDate = a.FormDate != null ? a.FormDate.Value.ToString("dd/MM/yyyy") : "",
                                  ToDate = a.ToDate != null ? a.ToDate.Value.ToString("dd/MM/yyyy") : "",
                              }).ToList();
            }
            catch
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region thêm sửa xóa quyết định điều động

        public class ModelHeaderDetail
        {
            public string Id { get; set; }
            public string Reason { get; set; }
            public string PayScaleCode { get; set; }
            public string Ranges { get; set; }
            public string Role { get; set; }
            public string DepartCode { get; set; }
        }
        public class ModelHeader
        {
            public string DecisionNum { get; set; }
            public string DecisionDate { get; set; }
            public string DecideBy { get; set; }
            public string AprovedBy { get; set; }
            public string AprovedTime { get; set; }
            public string Status { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
             public List<ModelHeaderDetail> arr3 { get; set; }
        }
        [HttpPost]
        public JsonResult GetDecidenBy([FromBody] ModelHeader obj)
        {

            var msg = new JMessage { Title = "", Error = false };
            try
            {
                DateTime DecisionDate = DateTime.Parse(obj.DecisionDate, new System.Globalization.CultureInfo("pt-BR"));
                DateTime FromTime = DateTime.Parse(obj.FromTime, new System.Globalization.CultureInfo("pt-BR"));
                DateTime ToTime = DateTime.Parse(obj.ToTime, new System.Globalization.CultureInfo("pt-BR"));
                var data = _context.DecisionMovementHeaders.FirstOrDefault(x => x.DecisionNum == obj.DecisionNum && !x.IsDeleted);
                if (data == null)
                {
                    var Dice = new DecisionMovementHeader()
                    {
                        DecisionNum = obj.DecisionNum,
                        Status = obj.Status,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now

                    };

                    foreach (var item in obj.arr3)
                    {
                        var detail = new DecisionMovementDetail()
                        {
                            EmployeesCode = item.Id,
                            DecisionNum = obj.DecisionNum,
                            ReasonMovement = item.Reason,
                            PayScaleCode = item.PayScaleCode,
                            NewDepartCode = item.DepartCode,
                            NewRole = item.Role,
                            //PayCoeff = _context.PayScaleDetails.FirstOrDefault(x=>!x.IsDeleted && x.ScaleCode.Equals(item.PayScaleCode) && x.Ranges == item.Ranges).Coeff,
                            //PayRanges = item.Ranges,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now

                        };
                        _context.DecisionMovementDetails.Add(detail);
                    }

                    _context.DecisionMovementHeaders.Add(Dice);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bản ghi đã tồn tại !";
                }
            }
            catch (Exception ex)
            {
                msg.Title = "Thêm thất bại";
                msg.Error = true;
            }
            return Json(msg);
        }

        #endregion
        public class SearchChartModel
        {
            public string DepartBegin { get; set; }
            public string DepartLate { get; set; }
            public string FromTime { get; set; }
            public string ToTime { get; set; }
            public string DecideBy { get; set; }
        }
     
        [HttpPost]
        public object SearchChart([FromBody] SearchChartModel obj)
        {
        

            var data = _context.DecisionMovementHeaders.Where(a => !a.IsDeleted && (string.IsNullOrEmpty(obj.FromTime) || a.CreatedTime >= DateTime.Parse(obj.FromTime, new System.Globalization.CultureInfo("pt-BR"))) && (string.IsNullOrEmpty(obj.ToTime)|| a.CreatedTime <= DateTime.Parse(obj.ToTime, new System.Globalization.CultureInfo("pt-BR"))) && (string.IsNullOrEmpty(obj.DecideBy)))
             .Select(p => new
             {
                 Month = p.CreatedTime.Value.Month,
             }).GroupBy(x => new { x.Month })
             .Select(p => new
             {
                 Month = p.First().Month,
                 Dieudong = (from b in _context.DecisionMovementHeaders.Where(x =>x.Status.Equals("FINAL_DONE") && x.CreatedTime.Value.Month == p.First().Month)
                             join c in _context.DecisionMovementDetails.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.DepartLate) || x.NewDepartCode.Equals(obj.DepartLate))) on b.DecisionNum equals c.DecisionNum
                             join d in _context.HREmployees.Where(x=>x.flag==1) on c.EmployeesCode equals d.Id.ToString()
                             join e in _context.AdDepartments.Where(x=>!x.IsDeleted && (string.IsNullOrEmpty(obj.DepartBegin) || x.DepartmentCode.Equals(obj.DepartBegin))) on d.unit equals e.DepartmentCode
                             select new
                             {
                                 b.DecisionNum,
                                 c.EmployeesCode,
                                 c.ReasonMovement
                             }).Count(),

                
                 HetHanDieudong = (from b in _context.DecisionMovementHeaders.Where(x => x.Status.Equals("FINAL_DONE") && x.CreatedTime.Value.Month == p.First().Month )
                                   join c in _context.DecisionMovementDetails.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.DepartLate) || x.NewDepartCode.Equals(obj.DepartLate)) && x.ToTime.Value.Date <= DateTime.Now) on b.DecisionNum equals c.DecisionNum
                                   join d in _context.HREmployees.Where(x => x.flag == 1) on c.EmployeesCode equals d.Id.ToString()
                                   join e in _context.AdDepartments.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.DepartBegin) || x.DepartmentCode.Equals(obj.DepartBegin))) on d.unit equals e.DepartmentCode
                                   select new
                                   {
                                       b.DecisionNum,
                                       c.EmployeesCode,
                                       c.ReasonMovement
                                   }).Count(),

             }).OrderBy(p => p.Month).ToList();


            return data;
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_fileObjectShareController.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        public class JTableModelHrEmployeeTermination : JTableModel
        {
            public string DecisionCode { get; set; }
            public string DecisionDate { get; set; }
            public string DecisionMakingDate { get; set; }

        }

    }
}